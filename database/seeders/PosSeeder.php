<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class PosSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $cookies = Category::create(['name' => 'Galletas', 'color' => '#bf7691', 'sort_order' => 1]);
        $drinks = Category::create(['name' => 'Bebidas', 'color' => '#60a5fa', 'sort_order' => 2]);
        $combos = Category::create(['name' => 'Combos', 'color' => '#f59e0b', 'sort_order' => 3]);

        Product::create([
            'category_id' => $cookies->id,
            'name' => 'Choco Crunch',
            'tag' => 'BESTSELLER',
            'description' => 'Galleta rellena de chocolate y avellanas.',
            'price' => 4.80,
            'cost' => 3.00,
            'image' => '/313790.jpg',
            'weight' => '150g / 6 unid.',
            'shelf' => '90 días',
            'flavors' => ['Chocolate Negro', 'Chocolate con Leche', 'Chocolate Blanco'],
            'stock' => 100,
            'stock_by_flavor' => ['Chocolate Negro' => 40, 'Chocolate con Leche' => 35, 'Chocolate Blanco' => 25],
            'active' => true,
            'sort_order' => 1,
        ]);

        Product::create([
            'category_id' => $cookies->id,
            'name' => 'Velvet Cream',
            'tag' => 'PREMIUM',
            'description' => 'Masa Red Velvet con centro cremoso.',
            'price' => 5.50,
            'cost' => 3.50,
            'image' => '/313792.jpg',
            'weight' => '150g / 6 unid.',
            'shelf' => '90 días',
            'flavors' => ['Crema Vainilla', 'Crema Fresa', 'Crema Limón'],
            'stock' => 80,
            'stock_by_flavor' => ['Crema Vainilla' => 30, 'Crema Fresa' => 30, 'Crema Limón' => 20],
            'active' => true,
            'sort_order' => 2,
        ]);

        Product::create([
            'category_id' => $cookies->id,
            'name' => 'Minis Crunch',
            'tag' => 'BITE-SIZE',
            'description' => 'Sin relleno. Alta rotación, empaque snack.',
            'price' => 1.90,
            'cost' => 1.20,
            'image' => '/313794.jpg',
            'weight' => 'Stand-up Pouch',
            'shelf' => '90 días',
            'flavors' => ['Clásica', 'Canela', 'Cacao'],
            'stock' => 120,
            'stock_by_flavor' => ['Clásica' => 50, 'Canela' => 40, 'Cacao' => 30],
            'active' => true,
            'sort_order' => 3,
        ]);

        Product::create([
            'category_id' => $drinks->id,
            'name' => 'Café Americano',
            'tag' => 'NUEVO',
            'description' => 'Café recién preparado.',
            'price' => 2.50,
            'cost' => 0.80,
            'image' => '',
            'weight' => 'Vaso 12oz',
            'shelf' => 'Elaboración del día',
            'flavors' => [],
            'stock' => 50,
            'active' => true,
            'sort_order' => 4,
        ]);

        Product::create([
            'category_id' => $drinks->id,
            'name' => 'Jugo Natural',
            'tag' => 'NUEVO',
            'description' => 'Jugo natural del día.',
            'price' => 3.00,
            'cost' => 1.00,
            'image' => '',
            'weight' => 'Vaso 12oz',
            'shelf' => 'Elaboración del día',
            'flavors' => [],
            'stock' => 40,
            'active' => true,
            'sort_order' => 5,
        ]);

        Product::create([
            'category_id' => $combos->id,
            'name' => 'Combo Dulce',
            'tag' => 'OFERTA',
            'description' => 'Selección de galletas + bebida.',
            'price' => 12.00,
            'cost' => 7.00,
            'image' => '/313790.jpg',
            'weight' => 'Caja + vaso',
            'shelf' => 'Elaboración del día',
            'flavors' => [],
            'stock' => 30,
            'active' => true,
            'sort_order' => 6,
        ]);
    }
}
