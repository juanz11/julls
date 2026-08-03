<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'tag', 'description', 'price', 'cost',
        'image', 'weight', 'shelf', 'flavors', 'stock', 'stock_by_flavor',
        'active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'flavors' => 'array',
            'stock_by_flavor' => 'array',
            'price' => 'float',
            'cost' => 'float',
            'active' => 'boolean',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function stockFor(string $flavor = null): int
    {
        if ($this->stock_by_flavor && $flavor && array_key_exists($flavor, $this->stock_by_flavor)) {
            return (int) $this->stock_by_flavor[$flavor];
        }
        return (int) $this->stock;
    }

    public function decrementStock(int $qty, string $flavor = null): void
    {
        if ($this->stock_by_flavor && $flavor && array_key_exists($flavor, $this->stock_by_flavor)) {
            $this->stock_by_flavor[$flavor] = max(0, $this->stock_by_flavor[$flavor] - $qty);
            $this->stock = max(0, $this->stock - $qty);
        } else {
            $this->stock = max(0, $this->stock - $qty);
        }
        $this->save();
    }
}
