import './bootstrap';
import '../css/app.css';

import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { ShoppingCart, Plus, Minus, Trash2, CheckCircle2, Package, User, ArrowLeft, Save, X } from 'lucide-react';

const PINK = '#bf7691';
const LIGHT = '#faf0f1';
const PRODUCTS_KEY = 'julls_products';
const CLIENTS_KEY = 'julls_clients';
const ORDERS_KEY = 'julls_orders';
const MIN_QTY = 12;

const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Choco Crunch', tag: 'BESTSELLER', price: 4.80, image: '/313790.jpg', weight: '150g / 6 unid.', shelf: '90 días', flavors: ['Chocolate Negro', 'Chocolate con Leche', 'Chocolate Blanco'], stock: 100 },
    { id: 2, name: 'Velvet Cream', tag: 'PREMIUM', price: 5.50, image: '/313792.jpg', weight: '150g / 6 unid.', shelf: '90 días', flavors: ['Crema Vainilla', 'Crema Fresa', 'Crema Limón'], stock: 80 },
    { id: 3, name: 'Minis Crunch', tag: 'BITE-SIZE', price: 1.90, image: '/313794.jpg', weight: 'Stand-up Pouch', shelf: '90 días', flavors: ['Clásica', 'Canela', 'Cacao'], stock: 120 },
];

function MenuApp() {
    const [products, setProducts] = useState(DEFAULT_PRODUCTS);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [quantities, setQuantities] = useState({});
    const [selectedFlavors, setSelectedFlavors] = useState({});
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [success, setSuccess] = useState('');
    const [quickName, setQuickName] = useState('');
    const [quickPhone, setQuickPhone] = useState('');

    // Cargar productos y clientes (localStorage + servidor)
    useEffect(() => {
        try {
            const savedProducts = localStorage.getItem(PRODUCTS_KEY);
            if (savedProducts) setProducts(JSON.parse(savedProducts));
        } catch { }

        try {
            const savedClients = localStorage.getItem(CLIENTS_KEY);
            if (savedClients) setClients(JSON.parse(savedClients));
        } catch { }

        const load = (key) => fetch(`/api/store/${key}`).then(r => r.json()).catch(() => null);
        load('products').then(d => { if (d && Array.isArray(d)) { setProducts(d); localStorage.setItem(PRODUCTS_KEY, JSON.stringify(d)); } });
        load('clients').then(d => { if (d && Array.isArray(d)) { setClients(d); localStorage.setItem(CLIENTS_KEY, JSON.stringify(d)); } });
    }, []);

    const clientData = useMemo(() => {
        if (!selectedClient) return null;
        return clients.find(c => String(c.id) === String(selectedClient)) || null;
    }, [selectedClient, clients]);

    const updateQty = (productId, flavor, value) => {
        const qty = Math.max(0, parseInt(value) || 0);
        setQuantities(prev => ({ ...prev, [`${productId}-${flavor}`]: qty }));
    };

    const getQty = (productId, flavor) => quantities[`${productId}-${flavor}`] || MIN_QTY;
    const getFlavor = (product) => selectedFlavors[product.id] || product.flavors?.[0] || 'Único';

    const stockFor = (product, flavor) => {
        // Si admin define stock por sabor (product.stockByFlavor), lo usamos; sino stock global
        if (product.stockByFlavor && flavor in product.stockByFlavor) return product.stockByFlavor[flavor];
        if (typeof product.stock === 'number') return product.stock;
        return Infinity;
    };

    const addToCart = (product) => {
        const flavor = getFlavor(product);
        const qty = getQty(product.id, flavor);
        const stock = stockFor(product, flavor);
        if (qty <= 0) return;
        if (stock !== Infinity && qty > stock) {
            alert(`Solo hay ${stock} unidades disponibles de ${product.name} (${flavor}).`);
            return;
        }

        setCart(prev => {
            const existing = prev.find(i => i.id === product.id && i.flavor === flavor);
            if (existing) {
                return prev.map(i => i.id === product.id && i.flavor === flavor
                    ? { ...i, qty: i.qty + qty }
                    : i
                );
            }
            return [...prev, { ...product, flavor, qty }];
        });
        setCartOpen(true);
    };

    const updateCartQty = (id, flavor, delta) => {
        setCart(prev => prev
            .map(i => {
                if (i.id === id && i.flavor === flavor) {
                    const newQty = i.qty + delta;
                    if (newQty < 1) return null;
                    return { ...i, qty: newQty };
                }
                return i;
            })
            .filter(Boolean)
        );
    };

    const removeFromCart = (id, flavor) => {
        setCart(prev => prev.filter(i => !(i.id === id && i.flavor === flavor)));
    };

    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const saveOrder = () => {
        if (cart.length === 0) return;
        if (!selectedClient && (!quickName.trim())) {
            alert('Selecciona un cliente o escribe un nombre para el pedido.');
            return;
        }

        const client = clientData || { name: quickName.trim(), phone: quickPhone.trim() };
        const order = {
            id: Date.now(),
            date: new Date().toLocaleString('es-ES'),
            client,
            items: cart.map(i => ({ name: i.name, flavor: i.flavor, qty: i.qty, price: i.price })),
            total: totalPrice,
            notes: '',
            status: 'pendiente',
        };

        try {
            const prev = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
            localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...prev]));
        } catch { }

        const csrf = document.querySelector('meta[name="csrf-token"]')?.content || '';
        fetch('/api/store/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf },
            body: JSON.stringify({ data: [order, ...(JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'))] }),
        }).catch(() => {});

        setCart([]);
        setSuccess('Pedido guardado correctamente.');
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: LIGHT }}>
            {/* Header */}
            <nav className="sticky top-0 z-40 border-b bg-white" style={{ borderColor: '#f0dde3' }}>
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                    <a href="/" className="flex items-center gap-2 font-black text-lg tracking-tighter" style={{ color: PINK }}>
                        <ArrowLeft size={20} />
                        JULLS <span className="text-slate-700 hidden sm:inline">Repostería</span>
                    </a>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="flex items-center gap-2 text-sm">
                            <User size={16} className="text-slate-400" />
                            <select
                                value={selectedClient}
                                onChange={e => setSelectedClient(e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm outline-none max-w-[160px] sm:max-w-[220px]"
                                style={{ borderColor: '#f0dde3' }}
                            >
                                <option value="">Cliente general</option>
                                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={() => setCartOpen(true)}
                            className="relative flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-sm"
                            style={{ backgroundColor: PINK }}
                        >
                            <ShoppingCart size={16} />
                            <span className="hidden sm:inline">Pedido</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{totalItems}</span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mensaje de éxito */}
            {success && (
                <div className="max-w-7xl mx-auto px-4 pt-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 font-bold text-sm">
                        <CheckCircle2 size={18} />
                        {success}
                    </div>
                </div>
            )}

            {/* Datos rápidos si no hay cliente */}
            {!selectedClient && (
                <div className="max-w-7xl mx-auto px-4 pt-4">
                    <div className="bg-white rounded-xl border p-3 flex flex-col sm:flex-row gap-3" style={{ borderColor: '#f0dde3' }}>
                        <input
                            type="text" placeholder="Nombre del cliente (rápido)" value={quickName}
                            onChange={e => setQuickName(e.target.value)}
                            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }}
                        />
                        <input
                            type="text" placeholder="Teléfono / WhatsApp" value={quickPhone}
                            onChange={e => setQuickPhone(e.target.value)}
                            className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }}
                        />
                    </div>
                </div>
            )}

            {/* Tabla de productos */}
            <main className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl border overflow-hidden shadow-sm" style={{ borderColor: '#f0dde3' }}>
                    <div className="p-4 border-b flex items-center gap-2" style={{ borderColor: '#f0dde3', backgroundColor: '#fdf5f7' }}>
                        <Package size={18} style={{ color: PINK }} />
                        <h1 className="font-black text-slate-800">Caja · Lista de productos</h1>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-slate-500 border-b" style={{ borderColor: '#f0dde3', backgroundColor: '#faf0f1' }}>
                                    <th className="p-4">Producto</th>
                                    <th className="p-4">Sabor</th>
                                    <th className="p-4 text-center">Disponible</th>
                                    <th className="p-4 text-center">Cantidad</th>
                                    <th className="p-4 text-right">Precio</th>
                                    <th className="p-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((p) => {
                                    const flavor = getFlavor(p);
                                    const stock = stockFor(p, flavor);
                                    const qty = getQty(p.id, flavor);
                                    return (
                                        <tr key={p.id} className="border-b" style={{ borderColor: '#f0dde3' }}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-slate-100" onError={e => e.target.style.display='none'} />
                                                    <div>
                                                        <p className="font-black text-slate-800">{p.name}</p>
                                                        <p className="text-xs text-slate-400">{p.weight} · {p.shelf}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <select
                                                    value={flavor}
                                                    onChange={e => setSelectedFlavors(prev => ({ ...prev, [p.id]: e.target.value }))}
                                                    className="border rounded-lg px-2 py-1 text-sm outline-none"
                                                    style={{ borderColor: '#f0dde3' }}
                                                >
                                                    {(p.flavors || ['Único']).map(f => <option key={f} value={f}>{f}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stock !== Infinity && stock <= 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                                    {stock === Infinity ? '—' : `${stock} uds.`}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => updateQty(p.id, flavor, qty - MIN_QTY)} className="p-1 rounded hover:bg-pink-50" style={{ color: PINK }}><Minus size={14} /></button>
                                                    <input
                                                        type="number" min="0" value={qty}
                                                        onChange={e => updateQty(p.id, flavor, e.target.value)}
                                                        className="w-16 border rounded-lg px-2 py-1 text-center text-sm outline-none" style={{ borderColor: '#f0dde3' }}
                                                    />
                                                    <button onClick={() => updateQty(p.id, flavor, qty + MIN_QTY)} className="p-1 rounded hover:bg-pink-50" style={{ color: PINK }}><Plus size={14} /></button>
                                                </div>
                                            </td>
                                            <td className="p-4 text-right font-black" style={{ color: PINK }}>${p.price.toFixed(2)}</td>
                                            <td className="p-4 text-right">
                                                <button
                                                    onClick={() => addToCart(p)}
                                                    disabled={stock !== Infinity && stock <= 0}
                                                    className="px-4 py-2 rounded-full text-sm font-bold text-white disabled:bg-slate-300"
                                                    style={{ backgroundColor: PINK }}
                                                >
                                                    Agregar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-slate-400">
                                            No hay productos cargados. Agrega productos desde el admin.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Drawer del pedido */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40" onClick={() => setCartOpen(false)} />
                    <div className="w-full max-w-md bg-white h-full overflow-y-auto flex flex-col shadow-2xl">
                        <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: '#f0dde3' }}>
                            <h2 className="text-xl font-black text-slate-900">Pedido actual</h2>
                            <button onClick={() => setCartOpen(false)}><X size={20} className="text-slate-400" /></button>
                        </div>

                        <div className="flex-1 p-5 space-y-3">
                            {cart.length === 0 ? (
                                <p className="text-center text-slate-400 py-10">El pedido está vacío.</p>
                            ) : cart.map(item => (
                                <div key={`${item.id}-${item.flavor}`} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: '#f0dde3' }}>
                                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-slate-100" onError={e => e.target.style.display='none'} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.flavor}</p>
                                        <p className="text-xs font-bold" style={{ color: PINK }}>${item.price.toFixed(2)} c/u</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateCartQty(item.id, item.flavor, -MIN_QTY)} className="p-1 rounded hover:bg-pink-50" style={{ color: PINK }}><Minus size={14} /></button>
                                        <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                                        <button onClick={() => updateCartQty(item.id, item.flavor, MIN_QTY)} className="p-1 rounded hover:bg-pink-50" style={{ color: PINK }}><Plus size={14} /></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id, item.flavor)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-5 border-t" style={{ borderColor: '#f0dde3' }}>
                                <div className="flex justify-between mb-4 text-lg font-black" style={{ color: PINK }}>
                                    <span>Total</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={saveOrder}
                                    className="w-full py-3 rounded-full font-bold text-white flex items-center justify-center gap-2"
                                    style={{ backgroundColor: PINK }}
                                >
                                    <Save size={16} /> Guardar pedido
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const container = document.getElementById('menu');
if (container) createRoot(container).render(<MenuApp />);
