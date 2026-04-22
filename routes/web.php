<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/admin', function () {
    return view('admin');
});

Route::get('/presupuesto', function () {
    return view('presupuesto');
});

// API para el presupuesto
Route::get('/api/presupuesto', function () {
    if (Storage::disk('local')->exists('presupuesto.json')) {
        return response()->json(json_decode(Storage::disk('local')->get('presupuesto.json'), true));
    }
    return response()->json(null);
});

Route::post('/api/presupuesto', function (Request $request) {
    $data = $request->validate(['data' => 'required|array']);
    Storage::disk('local')->put('presupuesto.json', json_encode($data['data']));
    return response()->json(['ok' => true]);
});

Route::post('/api/upload-image', function (Request $request) {
    $request->validate(['image' => 'required|image|max:5120']);
    $file = $request->file('image');
    $name = 'product_' . time() . '.' . $file->getClientOriginalExtension();
    $file->move(public_path(), $name);
    return response()->json(['url' => '/' . $name]);
});

// API para el footer
Route::get('/api/footer', function () {
    if (Storage::disk('local')->exists('footer.json')) {
        return response()->json(json_decode(Storage::disk('local')->get('footer.json'), true));
    }
    return response()->json(null);
});

Route::post('/api/footer', function (Request $request) {
    $data = $request->validate(['data' => 'required|array']);
    Storage::disk('local')->put('footer.json', json_encode($data['data']));
    return response()->json(['ok' => true]);
});
