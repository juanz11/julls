import './bootstrap';
import '../css/app.css';

import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, X, CreditCard, Banknote, Smartphone, ArrowRightLeft, Trash2, Plus, Minus, ShoppingBag, CheckCircle2 } from 'lucide-react';

const PINK = '#bf7691';
const LIGHT = '#fdf5f7';

const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Galletas', color: '#bf7691' },
    { id: 2, name: 'Bebidas', color: '#60a5fa' },
    { id: 3, name: 'Combos', color: '#f59e0b' },
];

const DEFAULT_PRODUCTS = [
    { id: 1, category_id: 1, name: 'Choco Crunch', price: 4.80, image: '/313790.jpg', stock: 100, flavors: ['Chocolate Negro', 'Chocolate con Leche'] },
    { id: 2, category_id: 1, name: 'Velvet Cream', price: 5.50, image: '/313792.jpg', stock: 80, flavors: ['Crema Vainilla', 'Crema Fresa'] },
    { id: 3, category_id: 1, name: 'Minis Crunch', price: 1.90, image: '/313794.jpg', stock: 120, flavors: ['Clásica', 'Canela'] },
    { id: 4, category_id: 2, name: 'Café Americano', price: 2.50, image: '', stock: 50, flavors: [] },
    { id: 5, category_id: 2, name: 'Jugo Natural', price: 3.00, image: '', stock: 40, flavors: [] },
    { id: 6, category_id: 3, name: 'Combo Dulce', price: 12.00, image: '/313790.jpg', stock: 30, flavors: [] },
];

const formatMoney = (n) => Number(n || 0).toFixed(2);
const csrf = () => document.querySelector('meta[name="csrf-token"]')?.content || '';

function PosApp() {
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [products, setProducts] = useState(DEFAULT_PRODUCTS);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [selectedLine, setSelectedLine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [payOpen, setPayOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/pos/catalog')
            .then(r => r.json())
            .then(data => {
                if (data?.products) {
                    setCategories(data.categories || DEFAULT_CATEGORIES);
                    setProducts(data.products.map(p => ({
                        ...p,
                        price: Number(p.price),
                        stock: Number(p.stock ?? 0),
                        flavors: p.flavors || [],
                    })));
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filteredProducts = useMemo(() => {
        let list = products;
        if (selectedCategory) list = list.filter(p => p.category_id === selectedCategory);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(p => p.name.toLowerCase().includes(q));
        }
        return list;
    }, [products, selectedCategory, search]);

    const totals = useMemo(() => {
        const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
        const tax = subtotal * 0.16;
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [cart]);

    const addProduct = (product, qty = 1) => {
        if (product.stock <= 0) return;
        const key = String(product.id);
        setCart(prev => {
            const existing = prev.find(i => i.key === key);
            if (existing) {
                const newQty = Math.min(existing.stock, existing.qty + qty);
                return prev.map(i => i.key === key ? { ...i, qty: newQty } : i);
            }
            return [...prev, { key, product_id: product.id, name: product.name, price: product.price, qty: Math.max(1, Math.min(product.stock, qty)), stock: product.stock }];
        });
        setSelectedLine(key);
    };

    const incrementProduct = (product) => addProduct(product, 1);

    const decrementProduct = (product) => {
        const key = String(product.id);
        setCart(prev => {
            const existing = prev.find(i => i.key === key);
            if (!existing) return prev;
            if (existing.qty <= 1) return prev.filter(i => i.key !== key);
            return prev.map(i => i.key === key ? { ...i, qty: i.qty - 1 } : i);
        });
        setSelectedLine(key);
    };

    const removeLine = (key) => {
        setCart(prev => prev.filter(i => i.key !== key));
        if (selectedLine === key) setSelectedLine(null);
    };

    const pay = async ({ method, amount, received, reference }) => {
        if (cart.length === 0) return;
        setSaving(true);
        try {
            const payload = {
                customer_name: 'Cliente general',
                table: null,
                account: null,
                notes: null,
                subtotal: totals.subtotal,
                tax: totals.tax,
                discount: 0,
                total: totals.total,
                items: cart.map(i => ({
                    product_id: i.product_id,
                    name: i.name,
                    flavor: null,
                    qty: i.qty,
                    price: i.price,
                })),
                payments: [
                    { method, amount, received, reference },
                ],
            };
            const res = await fetch('/api/pos/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Error al guardar');
            const order = await res.json();
            setCart([]);
            setSelectedLine(null);
            setPayOpen(false);
            setMessage(`Factura #${order.id} registrada`);
            setTimeout(() => setMessage(''), 3000);
        } catch (e) {
            alert(e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: LIGHT }}><div className="text-slate-400 font-medium">Cargando...</div></div>;
    }

    return (
        <div className="h-screen w-screen overflow-hidden flex flex-col font-sans text-slate-800" style={{ backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <div className="flex-none border-b px-3 py-2 flex items-center justify-between gap-2 bg-white" style={{ borderColor: '#f0dde3' }}>
                <div className="flex items-center gap-3">
                    <a href="/" className="font-black tracking-tighter text-sm" style={{ color: PINK }}>JULLS</a>
                    <span className="text-sm font-bold text-slate-400">|</span>
                    <span className="font-bold text-sm text-slate-700">Registrar</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center bg-slate-100 rounded-lg px-2 py-1.5">
                        <Search size={16} className="text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar productos..."
                            className="bg-transparent border-none outline-none text-sm px-2 w-32 sm:w-48"
                        />
                        {search && <button onClick={() => setSearch('')}><X size={14} className="text-slate-400" /></button>}
                    </div>
                </div>
            </div>

            {/* Success message */}
            {message && (
                <div className="flex-none px-3 py-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2 text-green-700 text-sm font-bold">
                        <CheckCircle2 size={16} /> {message}
                    </div>
                </div>
            )}

            {/* Main POS */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left pane */}
                <div className="w-full sm:w-[420px] flex-none flex flex-col border-r bg-white" style={{ borderColor: '#f0dde3' }}>
                    {/* Order lines */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {cart.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <ShoppingBag size={40} className="opacity-30" />
                                <p className="text-sm font-medium">Agrega productos para comenzar</p>
                            </div>
                        )}
                        {cart.map(item => (
                            <button
                                key={item.key}
                                onClick={() => setSelectedLine(item.key)}
                                className={`w-full text-left rounded-lg px-3 py-2 border transition-colors ${selectedLine === item.key ? 'border-pink-400 bg-pink-50' : 'border-transparent hover:bg-slate-50'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-sm" style={{ color: PINK }}>{item.qty}</span>
                                        <p className="font-bold text-sm text-slate-800">{item.name}</p>
                                    </div>
                                    <span className="font-bold text-sm">${formatMoney(item.qty * item.price)}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="border-t p-3 space-y-1 text-sm" style={{ borderColor: '#f0dde3' }}>
                        <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>${formatMoney(totals.subtotal)}</span></div>
                        <div className="flex justify-between text-slate-500"><span>Impuestos (16%)</span><span>${formatMoney(totals.tax)}</span></div>
                        <div className="flex justify-between text-xl font-black pt-1" style={{ color: PINK }}><span>Total</span><span>${formatMoney(totals.total)}</span></div>
                    </div>

                    {/* Actions */}
                    <div className="border-t p-2" style={{ borderColor: '#f0dde3' }}>
                        <div className="flex gap-2">
                            <button onClick={() => selectedLine && removeLine(selectedLine)} className="flex-1 py-3 rounded-lg border text-sm font-bold text-red-500 hover:bg-red-50" style={{ borderColor: '#fecaca' }}>
                                <Trash2 size={16} className="inline mr-1" /> Quitar
                            </button>
                            <button onClick={() => setPayOpen(true)} disabled={cart.length === 0} className="flex-[2] py-3 rounded-lg text-white text-sm font-bold disabled:bg-slate-300" style={{ backgroundColor: PINK }}>
                                Pago ${formatMoney(totals.total)}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right pane */}
                <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
                    {/* Categories */}
                    <div className="flex-none p-2 overflow-x-auto">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap border ${selectedCategory === null ? 'text-white' : 'bg-white text-slate-600 border-slate-200'}`}
                                style={selectedCategory === null ? { backgroundColor: PINK, borderColor: PINK } : {}}
                            >
                                Todos
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap border ${selectedCategory === cat.id ? 'text-white' : 'bg-white text-slate-600 border-slate-200'}`}
                                    style={selectedCategory === cat.id ? { backgroundColor: cat.color || PINK, borderColor: cat.color || PINK } : {}}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Products grid */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {filteredProducts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                                <ShoppingBag size={40} className="opacity-30" />
                                <p className="text-sm font-medium">No hay productos</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                {filteredProducts.map(product => {
                                    const inCartItem = cart.find(i => i.key === String(product.id));
                                    const inCart = inCartItem?.qty || 0;
                                    const low = product.stock <= 5;
                                    return (
                                        <div
                                            key={product.id}
                                            className={`relative bg-white rounded-xl border p-2 flex flex-col items-center justify-between text-center h-36 hover:shadow-md transition-shadow ${product.stock <= 0 ? 'opacity-50' : ''}`}
                                            style={{ borderColor: '#f0dde3' }}
                                        >
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover mb-1" onError={e => e.target.style.display = 'none'} />
                                            ) : (
                                                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-1"><ShoppingBag size={20} className="text-slate-300" /></div>
                                            )}
                                            <div className="flex-1 flex flex-col justify-center">
                                                <p className="text-xs font-bold text-slate-800 leading-tight">{product.name}</p>
                                                <p className="text-xs font-black mt-1" style={{ color: PINK }}>${formatMoney(product.price)}</p>
                                            </div>
                                            <div className="flex items-center gap-1 mt-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); decrementProduct(product); }}
                                                    disabled={inCart === 0}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white disabled:opacity-40"
                                                    style={{ backgroundColor: PINK }}
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center text-sm font-black">{inCart}</span>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); incrementProduct(product); }}
                                                    disabled={product.stock <= 0 || inCart >= product.stock}
                                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white disabled:opacity-40"
                                                    style={{ backgroundColor: PINK }}
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            {low && product.stock > 0 && (
                                                <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-amber-400" title={`Stock bajo: ${product.stock}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment modal */}
            {payOpen && (
                <PaymentModal
                    total={totals.total}
                    onClose={() => setPayOpen(false)}
                    onPay={pay}
                    saving={saving}
                />
            )}
        </div>
    );
}

function PaymentModal({ total, onClose, onPay, saving }) {
    const [method, setMethod] = useState('cash');
    const [amount, setAmount] = useState(formatMoney(total));
    const [received, setReceived] = useState(formatMoney(total));
    const [reference, setReference] = useState('');
    const [copied, setCopied] = useState(null);

    const numericAmount = parseFloat(amount) || 0;
    const numericReceived = parseFloat(received) || 0;
    const change = Math.max(0, numericReceived - numericAmount);

    const submit = (e) => {
        e.preventDefault();
        if (numericAmount <= 0) return;
        onPay({ method, amount: numericAmount, received: numericReceived, reference });
    };

    const setExact = () => { setAmount(formatMoney(total)); setReceived(formatMoney(total)); };

    const copyToClipboard = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(label);
            setTimeout(() => setCopied(null), 1500);
        } catch {
            // ignore
        }
    };

    const bankRows = method === 'mobile' ? [
        { label: 'Banco', value: 'Banco de Venezuela' },
        { label: 'Teléfono', value: '0412-123-4567' },
        { label: 'Cédula', value: 'V-12.345.678' },
        { label: 'Beneficiario', value: 'JULLS C.A.' },
    ] : method === 'transfer' ? [
        { label: 'Banco', value: 'Banco Mercantil' },
        { label: 'Cuenta', value: '0105-0012-34-5678901234' },
        { label: 'Tipo', value: 'Corriente' },
        { label: 'Beneficiario', value: 'JULLS C.A.' },
    ] : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#f0dde3' }}>
                    <h3 className="font-black text-lg">Cobrar</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <form onSubmit={submit} className="p-4 space-y-4 overflow-y-auto">
                    <div className="text-center py-4 rounded-xl" style={{ backgroundColor: LIGHT }}>
                        <p className="text-sm text-slate-500 font-medium">Total a pagar</p>
                        <p className="text-4xl font-black" style={{ color: PINK }}>${formatMoney(total)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <PaymentMethod method={method} set={setMethod} id="cash" icon={<Banknote size={18} />} label="Efectivo" />
                        <PaymentMethod method={method} set={setMethod} id="card" icon={<CreditCard size={18} />} label="Tarjeta" />
                        <PaymentMethod method={method} set={setMethod} id="mobile" icon={<Smartphone size={18} />} label="Pago Móvil" />
                        <PaymentMethod method={method} set={setMethod} id="transfer" icon={<ArrowRightLeft size={18} />} label="Transferencia" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Monto</label>
                        <input type="number" step="0.01" min="0" value={amount} onChange={e => setAmount(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-lg font-bold outline-none" style={{ borderColor: '#f0dde3' }} />
                        <button type="button" onClick={setExact} className="text-xs font-bold" style={{ color: PINK }}>Monto exacto</button>
                    </div>

                    {method === 'cash' && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Recibido</label>
                            <input type="number" step="0.01" min="0" value={received} onChange={e => setReceived(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-lg font-bold outline-none" style={{ borderColor: '#f0dde3' }} />
                            {change > 0 && <p className="text-sm font-bold text-green-600">Cambio: ${formatMoney(change)}</p>}
                        </div>
                    )}

                    {method !== 'cash' && (
                        <div className="space-y-3">
                            <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: '#f0dde3', backgroundColor: LIGHT }}>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Datos bancarios para la gestión</p>
                                <p className="text-sm font-black text-slate-800">
                                    {method === 'mobile' ? 'Pago Móvil' : 'Transferencia bancaria'}
                                </p>
                                <div className="text-sm space-y-2">
                                    {bankRows.map(row => (
                                        <div key={row.label} className="flex flex-wrap items-center gap-1.5 py-0.5">
                                            <span className="text-slate-500 min-w-[70px]">{row.label}:</span>
                                            <span className="font-bold text-slate-800 flex-1 break-all">{row.value}</span>
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(row.value, row.label)}
                                                className="text-xs font-bold px-2 py-1 rounded-md"
                                                style={{ color: copied === row.label ? '#16a34a' : PINK }}
                                            >
                                                {copied === row.label ? '¡Copiado!' : 'Copiar'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">Referencia</label>
                                <input type="text" value={reference} onChange={e => setReference(e.target.value)} placeholder="Últimos 4 dígitos / referencia"
                                    className="w-full border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: '#f0dde3' }} />
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={saving || numericAmount <= 0} className="w-full py-3 rounded-lg text-white font-bold disabled:bg-slate-300" style={{ backgroundColor: PINK }}>
                        {saving ? 'Guardando...' : `Confirmar pago $${formatMoney(numericAmount)}`}
                    </button>
                </form>
            </div>
        </div>
    );
}

function PaymentMethod({ method, set, id, icon, label }) {
    const active = method === id;
    return (
        <button type="button" onClick={() => set(id)}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-bold ${active ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'}`}
            style={active ? { backgroundColor: PINK } : {}}>
            {icon} {label}
        </button>
    );
}

const container = document.getElementById('pos');
if (container) createRoot(container).render(<PosApp />);
