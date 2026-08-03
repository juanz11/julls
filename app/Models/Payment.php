<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'method', 'amount', 'received', 'change', 'reference',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'received' => 'float',
            'change' => 'float',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
