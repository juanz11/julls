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
