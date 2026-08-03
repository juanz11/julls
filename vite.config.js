import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.jsx',
                'resources/js/admin.jsx',
                'resources/js/presupuesto.jsx',
                'resources/js/obsequios.jsx',
                'resources/js/menu.jsx',
                'resources/js/pos.jsx',
            ],
            refresh: true,
            detect: false,
        }),
        tailwindcss(),
        react(),
    ],
    server: {
        host: '127.0.0.1',
        hmr: {
            host: '127.0.0.1',
        },
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
