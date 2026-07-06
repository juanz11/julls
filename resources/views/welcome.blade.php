<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <title>{{ config('app.name', 'JULLS Repostería') }}</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700,900" rel="stylesheet" />
        <link rel="stylesheet" href="{{ asset('build/assets/app-CgvDsYBk.css') }}">
<script type="module" src="{{ asset('build/assets/app-S2H9GOG0.js') }}"></script>
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
