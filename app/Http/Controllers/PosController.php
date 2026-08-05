<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PosController extends Controller
{
    public function index()
    {
        return view('pos');
    }

    public function categories()
    {
        return response()->json(Category::orderBy('sort_order')->get());
    }

    public function products()
    {
        return response()->json(
            Product::with('category')
                ->where('active', true)
                ->orderBy('sort_order')
                ->get()
        );
    }

    public function catalog()
    {
        $this->syncAdminProducts();

        return response()->json([
            'categories' => Category::orderBy('sort_order')->get(),
            'products' => Product::with('category')->where('active', true)->orderBy('sort_order')->get(),
        ]);
    }

    private function syncAdminProducts()
    {
        $json = Storage::disk('local')->get('products.json');
        if (!$json) return;

        $stored = json_decode($json, true);
        if (!is_array($stored) || empty($stored)) return;

        $defaultCategory = Category::orderBy('sort_order')->value('id');

        Product::unguard();

        foreach ($stored as $p) {
            $data = [
                'name' => $p['name'] ?? 'Sin nombre',
                'price' => floatval($p['price'] ?? 0),
                'stock' => intval($p['stock'] ?? 0),
                'image' => $p['image'] ?? null,
                'flavors' => $p['flavors'] ?? [],
                'active' => true,
            ];

            if ($defaultCategory) {
                $data['category_id'] = $defaultCategory;
            }

            Product::updateOrCreate(['id' => $p['id']], $data);
        }

        Product::reguard();
    }

    public function orders()
    {
        return response()->json(
            Order::with(['items', 'payments'])->orderBy('created_at', 'desc')->limit(50)->get()
        );
    }

    public function showOrder(Order $order)
    {
        return response()->json($order->load(['items.product', 'payments']));
    }

    public function storeOrder(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'nullable|string',
            'customer_phone' => 'nullable|string',
            'table' => 'nullable|string',
            'account' => 'nullable|string',
            'notes' => 'nullable|string',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.name' => 'required|string',
            'items.*.flavor' => 'nullable|string',
            'items.*.qty' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'payments' => 'nullable|array',
            'payments.*.method' => 'required|string',
            'payments.*.amount' => 'required|numeric|min:0',
            'payments.*.received' => 'nullable|numeric|min:0',
            'payments.*.reference' => 'nullable|string',
        ]);

        $hasPendingPayment = collect($data['payments'] ?? [])->contains(function ($p) {
            return in_array($p['method'] ?? '', ['mobile', 'transfer']);
        });

        return DB::transaction(function () use ($data, $hasPendingPayment) {
            $order = Order::create([
                'type' => 'pos',
                'status' => 'pending',
                'customer_name' => $data['customer_name'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'table' => $data['table'] ?? null,
                'account' => $data['account'] ?? null,
                'notes' => $data['notes'] ?? null,
                'subtotal' => $data['subtotal'],
                'tax' => $data['tax'] ?? 0,
                'discount' => $data['discount'] ?? 0,
                'total' => $data['total'],
                'paid' => 0,
            ]);

            foreach ($data['items'] as $item) {
                $product = Product::find($item['product_id']);
                $flavor = $item['flavor'] ?? null;

                if ($product->stockFor($flavor) < $item['qty']) {
                    throw new \Exception("Stock insuficiente para {$product->name}" . ($flavor ? " ({$flavor})" : ''));
                }

                $order->items()->create([
                    'product_id' => $product->id,
                    'name' => $item['name'],
                    'flavor' => $flavor,
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                ]);
            }

            foreach ($data['payments'] ?? [] as $payment) {
                $received = $payment['received'] ?? $payment['amount'];
                $order->payments()->create([
                    'method' => $payment['method'],
                    'amount' => $payment['amount'],
                    'received' => $received,
                    'change' => max(0, $received - $payment['amount']),
                    'reference' => $payment['reference'] ?? null,
                ]);
            }

            $paid = $order->payments->sum('amount');

            if ($hasPendingPayment) {
                $order->status = 'pending';
                $order->paid = 0;
            } else {
                $order->paid = $paid;
                foreach ($data['items'] as $item) {
                    $product = Product::find($item['product_id']);
                    $flavor = $item['flavor'] ?? null;
                    $product->decrementStock($item['qty'], $flavor);
                    $product->inventoryMovements()->create([
                        'type' => 'sale',
                        'qty' => -$item['qty'],
                        'flavor' => $flavor,
                        'notes' => 'Venta POS #' . $order->id,
                        'order_id' => $order->id,
                    ]);
                }
                if ($order->paid >= $order->total) {
                    $order->status = 'paid';
                } elseif ($order->paid > 0) {
                    $order->status = 'partial';
                } else {
                    $order->status = 'pending';
                }
            }
            $order->save();

            return response()->json($order->load(['items.product', 'payments']), 201);
        });
    }

    public function approveOrder(Order $order)
    {
        if ($order->status !== 'pending') {
            return response()->json(['error' => 'El pedido no está pendiente'], 422);
        }

        return DB::transaction(function () use ($order) {
            foreach ($order->items as $item) {
                $product = Product::find($item->product_id);
                if (!$product) continue;

                if ($product->stockFor($item->flavor) < $item->qty) {
                    throw new \Exception("Stock insuficiente para {$product->name}" . ($item->flavor ? " ({$item->flavor})" : ''));
                }

                $product->decrementStock($item->qty, $item->flavor);
                $product->inventoryMovements()->create([
                    'type' => 'sale',
                    'qty' => -$item->qty,
                    'flavor' => $item->flavor,
                    'notes' => 'Aprobación pedido #' . $order->id,
                    'order_id' => $order->id,
                ]);
            }

            $order->paid = $order->payments->sum('amount') ?: $order->total;
            $order->status = 'paid';
            $order->save();

            return response()->json($order->load(['items.product', 'payments']));
        });
    }

    public function rejectOrder(Order $order)
    {
        if ($order->status !== 'pending') {
            return response()->json(['error' => 'El pedido no está pendiente'], 422);
        }

        $order->status = 'cancelled';
        $order->save();

        return response()->json($order->load(['items.product', 'payments']));
    }

    public function storePayment(Request $request, Order $order)
    {
        $data = $request->validate([
            'method' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'received' => 'nullable|numeric|min:0',
            'reference' => 'nullable|string',
        ]);

        $received = $data['received'] ?? $data['amount'];
        $payment = $order->payments()->create([
            'method' => $data['method'],
            'amount' => $data['amount'],
            'received' => $received,
            'change' => max(0, $received - $data['amount']),
            'reference' => $data['reference'] ?? null,
        ]);

        $order->paid = $order->payments()->sum('amount');
        $order->status = $order->paid >= $order->total ? 'paid' : ($order->paid > 0 ? 'partial' : 'pending');
        $order->save();

        return response()->json($payment);
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $data = $request->validate(['status' => 'required|string']);
        $order->status = $data['status'];
        $order->save();
        return response()->json($order);
    }
}
