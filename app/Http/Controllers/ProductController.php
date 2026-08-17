<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(
            Product::with('category')->orderBy('sort_order')->orderBy('id')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'tag' => 'nullable|string',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'image2' => 'nullable|string',
            'weight' => 'nullable|string',
            'shelf' => 'nullable|string',
            'flavors' => 'nullable|array',
            'stock' => 'nullable|integer|min:0',
            'stock_by_flavor' => 'nullable|array',
            'active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $product = Product::create([
            'name' => $data['name'],
            'tag' => $data['tag'] ?? 'NUEVO',
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'cost' => $data['cost'] ?? 0,
            'image' => $data['image'] ?? null,
            'weight' => $data['weight'] ?? null,
            'shelf' => $data['shelf'] ?? null,
            'flavors' => $data['flavors'] ?? [],
            'stock' => $data['stock'] ?? 0,
            'stock_by_flavor' => $data['stock_by_flavor'] ?? null,
            'active' => $data['active'] ?? true,
            'sort_order' => $data['sort_order'] ?? 0,
        ]);

        return response()->json($product, 201);
    }

    public function update(Request $request, Product $product)
    {
        $data = $request->validate([
            'name' => 'sometimes|string',
            'tag' => 'nullable|string',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'cost' => 'nullable|numeric|min:0',
            'image' => 'nullable|string',
            'image2' => 'nullable|string',
            'weight' => 'nullable|string',
            'shelf' => 'nullable|string',
            'flavors' => 'nullable|array',
            'stock' => 'nullable|integer|min:0',
            'stock_by_flavor' => 'nullable|array',
            'active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $product->update($data);
        return response()->json($product->fresh());
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['ok' => true]);
    }
}
