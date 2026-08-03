<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        return response()->json([
            'categories' => Category::orderBy('sort_order')->get(),
            'products' => Product::with('category')->where('active', true)->orderBy('sort_order')->get(),
        ]);
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

        return DB::transaction(function () use ($data) {
            $order = Order::create([
                'type' => 'pos',
                'status' => 'paid',
                'customer_name' => $data['customer_name'] ?? null,
                'customer_phone' => $data['customer_phone'] ?? null,
                'table' => $data['table'] ?? null,
                'account' => $data['account'] ?? null,
                'notes' => $data['notes'] ?? null,
                'subtotal' => $data['subtotal'],
                'tax' => $data['tax'] ?? 0,
                'discount' => $data['discount'] ?? 0,
                'total' => $data['total'],
                'paid' => collect($data['payments'] ?? [])->sum('amount'),
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

                $product->decrementStock($item['qty'], $flavor);

                $product->inventoryMovements()->create([
                    'type' => 'sale',
                    'qty' => -$item['qty'],
                    'flavor' => $flavor,
                    'notes' => 'Venta POS #' . $order->id,
                    'order_id' => $order->id,
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

            if ($order->paid >= $order->total) {
                $order->status = 'paid';
            } elseif ($order->paid > 0) {
                $order->status = 'partial';
            } else {
                $order->status = 'pending';
            }
            $order->save();

            return response()->json($order->load(['items.product', 'payments']), 201);
        });
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
