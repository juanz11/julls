import './bootstrap';
import '../css/app.css';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Search, X, CreditCard, Banknote, Smartphone, ArrowRightLeft, Trash2, Plus, Minus, ShoppingBag, CheckCircle2, Receipt, User, LogOut } from 'lucide-react';

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
const CUSTOMER_KEY = 'julls_customer';

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
    const [successOrder, setSuccessOrder] = useState(null);
    const [authOpen, setAuthOpen] = useState(false);
    const [customer, setCustomer] = useState(() => {
        try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY)); } catch { return null; }
    });
    // Comprador cargado manualmente por un admin "en caja" (no pisa la sesión del admin)
    const [manualCustomer, setManualCustomer] = useState(null);
    const effectiveCustomer = manualCustomer || customer;
    const [invoiceCfg, setInvoiceCfg] = useState({
        company_name: 'JULLS Repostería, C.A.', rif: '', address: '', phone: '',
        footer: '¡Gracias por su compra!', iva: 16,
    });

    useEffect(() => {
        // Los productos y categorías vienen del sistema admin (julls-orden-de-pago)
        // a través de las rutas proxy /api/store/* de esta app.
        const load = (key) => fetch(`/api/store/${key}`).then(r => r.json()).catch(() => null);
        const fallback = () => {
            setCategories(DEFAULT_CATEGORIES);
            setProducts(DEFAULT_PRODUCTS.map(p => ({
                ...p,
                price: Number(p.price),
                stock: Number(p.stock ?? 0),
                flavors: p.flavors || [],
            })));
            setLoading(false);
        };

        load('factura-config').then(cfg => {
            if (cfg && typeof cfg === 'object' && !Array.isArray(cfg)) {
                setInvoiceCfg(prev => ({ ...prev, ...cfg }));
            }
        });

        Promise.all([load('products'), load('categories')]).then(([prods, cats]) => {
            if (!Array.isArray(prods) || prods.length === 0) {
                fallback();
                return;
            }

            let catList = (Array.isArray(cats) ? cats : []).map(c => ({
                id: c.id,
                name: c.label || c.name,
                icon: c.icon,
            }));
            // Si el admin no devuelve categorías, se generan desde el campo 'category' de cada producto
            if (catList.length === 0) {
                catList = [...new Set(prods.map(p => p.category).filter(Boolean))]
                    .map(name => ({ id: name, name }));
            }
            setCategories(catList);

            setProducts(prods.map(p => {
                const cat = catList.find(c => String(c.name || '').toLowerCase() === String(p.category || '').toLowerCase());
                return {
                    id: p.id,
                    category_id: cat ? cat.id : null,
                    name: p.name,
                    tag: p.tag || '',
                    price: Number(p.price),
                    image: p.image || '',
                    stock: Number(p.stock ?? 0),
                    flavors: p.flavors || [],
                };
            }));
            setLoading(false);
        }).catch(fallback);
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
        const tax = subtotal * (Number(invoiceCfg.iva) / 100);
        const total = subtotal + tax;
        return { subtotal, tax, total };
    }, [cart, invoiceCfg]);

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

    const loginCustomer = (client) => {
        setCustomer(client);
        setManualCustomer(null);
        localStorage.setItem(CUSTOMER_KEY, JSON.stringify(client));
        setAuthOpen(false);
        setPayOpen(true);
    };

    const cajaCustomer = (buyer) => {
        setManualCustomer(buyer);
        setAuthOpen(false);
        setPayOpen(true);
    };

    const logoutCustomer = () => {
        setCustomer(null);
        setManualCustomer(null);
        localStorage.removeItem(CUSTOMER_KEY);
    };

    const pay = async ({ method, amount, received, reference, delivery_city, delivery_fee, grandTotal }) => {
        if (cart.length === 0) return;
        setSaving(true);
        try {
            // La venta se registra en el sistema admin (julls-orden-de-pago)
            // a través del proxy /api/store/order de esta app.
            const res = await fetch('/api/store/order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                },
                body: JSON.stringify({
                    client_id: effectiveCustomer?.id || null,
                    customer_name: effectiveCustomer?.name || null,
                    customer_phone: effectiveCustomer?.phone || null,
                    customer_email: effectiveCustomer?.email || null,
                    customer_cedula: effectiveCustomer?.cedula || null,
                    items: cart.map(i => ({ product_id: i.product_id, name: i.name, qty: i.qty, price: i.price })),
                    payment_method: method,
                    payment_reference: reference || null,
                    delivery_city: delivery_city || null,
                    delivery_fee: delivery_fee || 0,
                }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.ok) throw new Error(data?.error || 'No se pudo registrar la venta');

            // Reflejar la venta en el stock visible
            setProducts(prev => prev.map(p => {
                const item = cart.find(i => i.product_id === p.id);
                return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
            }));

            setCart([]);
            setSelectedLine(null);
            setPayOpen(false);
            setManualCustomer(null);
            const productItems = (data.order?.items || [])
                .filter(i => !String(i.description || '').startsWith('Delivery'));

            setSuccessOrder({
                id: data.order?.id,
                date: data.order?.created_at,
                items: productItems.length
                    ? productItems
                    : cart.map(i => ({ description: i.name, quantity: i.qty, unit_price: i.price })),
                customer: effectiveCustomer,
                payment_method: method,
                subtotal: totals.subtotal,
                tax: totals.tax,
                iva: invoiceCfg.iva,
                delivery_city,
                delivery_fee,
                total: grandTotal ?? totals.total,
            });
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
                    {customer ? (
                        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold" style={{ backgroundColor: LIGHT, color: PINK }}>
                            <User size={14} />
                            <span className="max-w-[110px] truncate">{customer.name}</span>
                            <button onClick={logoutCustomer} title="Cerrar sesión" className="text-slate-400 hover:text-red-500"><LogOut size={14} /></button>
                        </div>
                    ) : (
                        <button onClick={() => setAuthOpen(true)} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200">
                            <User size={14} /> Ingresar
                        </button>
                    )}
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
                        <div className="flex justify-between text-slate-500"><span>Impuestos ({invoiceCfg.iva}%)</span><span>${formatMoney(totals.tax)}</span></div>
                        <div className="flex justify-between text-xl font-black pt-1" style={{ color: PINK }}><span>Total</span><span>${formatMoney(totals.total)}</span></div>
                    </div>

                    {/* Actions */}
                    <div className="border-t p-2" style={{ borderColor: '#f0dde3' }}>
                        <div className="flex gap-2">
                            <button onClick={() => selectedLine && removeLine(selectedLine)} className="flex-1 py-3 rounded-lg border text-sm font-bold text-red-500 hover:bg-red-50" style={{ borderColor: '#fecaca' }}>
                                <Trash2 size={16} className="inline mr-1" /> Quitar
                            </button>
                            <button onClick={() => customer?.is_admin ? setAuthOpen(true) : customer ? setPayOpen(true) : setAuthOpen(true)} disabled={cart.length === 0} className="flex-[2] py-3 rounded-lg text-white text-sm font-bold disabled:bg-slate-300" style={{ backgroundColor: PINK }}>
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
                                                {product.tag && (
                                                    <span className="inline-block text-[9px] font-bold text-white px-1.5 py-0.5 rounded mt-0.5 tracking-wide" style={{ backgroundColor: PINK }}>{product.tag}</span>
                                                )}
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
            {authOpen && (
                <CustomerModal
                    onClose={() => setAuthOpen(false)}
                    onAuth={loginCustomer}
                    onCaja={cajaCustomer}
                    adminOnly={!!customer?.is_admin}
                />
            )}

            {payOpen && (
                <PaymentModal
                    total={totals.total}
                    onClose={() => setPayOpen(false)}
                    onPay={pay}
                    saving={saving}
                />
            )}

            {/* Factura post-pago */}
            {successOrder && (
                <InvoiceModal
                    order={successOrder}
                    cfg={invoiceCfg}
                    onClose={() => setSuccessOrder(null)}
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
    const [wantsDelivery, setWantsDelivery] = useState(false);
    const [zones, setZones] = useState([]);
    const [zoneId, setZoneId] = useState('');

    useEffect(() => {
        // Zonas de delivery desde el sistema admin; si no responde, se usan zonas de ejemplo
        const demoZones = [
            { id: 1, name: 'Valencia', price: 2.50 },
            { id: 2, name: 'Naguanagua', price: 3.00 },
            { id: 3, name: 'San Diego', price: 3.50 },
            { id: 4, name: 'Los Guayos', price: 3.00 },
            { id: 5, name: 'Guacara', price: 4.00 },
            { id: 6, name: 'San Joaquín', price: 4.50 },
            { id: 7, name: 'Mariara', price: 5.00 },
            { id: 8, name: 'Guigüe', price: 5.50 },
            { id: 9, name: 'Tocuyito', price: 4.00 },
            { id: 10, name: 'Puerto Cabello', price: 6.00 },
        ];
        fetch('/api/store/delivery-zones')
            .then(r => r.json())
            .then(d => setZones(Array.isArray(d) && d.length ? d : demoZones))
            .catch(() => setZones(demoZones));
    }, []);

    const selectedZone = zones.find(z => String(z.id) === String(zoneId));
    const deliveryFee = wantsDelivery && selectedZone ? Number(selectedZone.price) : 0;
    const grandTotal = total + deliveryFee;

    useEffect(() => {
        setAmount(formatMoney(grandTotal));
        setReceived(formatMoney(grandTotal));
    }, [grandTotal]);

    const numericAmount = parseFloat(amount) || 0;
    const numericReceived = parseFloat(received) || 0;
    const change = Math.max(0, numericReceived - numericAmount);

    const submit = (e) => {
        e.preventDefault();
        if (numericAmount <= 0) return;
        if (wantsDelivery && !selectedZone) return;
        onPay({
            method,
            amount: numericAmount,
            received: numericReceived,
            reference,
            delivery_city: wantsDelivery ? selectedZone?.name : null,
            delivery_fee: deliveryFee,
            grandTotal,
        });
    };

    const setExact = () => { setAmount(formatMoney(grandTotal)); setReceived(formatMoney(grandTotal)); };

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
                    <div className="text-center py-4 rounded-xl space-y-1" style={{ backgroundColor: LIGHT }}>
                        <p className="text-sm text-slate-500 font-medium">Total a pagar</p>
                        <p className="text-4xl font-black" style={{ color: PINK }}>${formatMoney(grandTotal)}</p>
                        <div className="text-xs text-slate-500 space-y-0.5 pt-1">
                            <div className="flex justify-between px-6"><span>Pedido</span><span>${formatMoney(total)}</span></div>
                            {deliveryFee > 0 && (
                                <div className="flex justify-between px-6 font-bold" style={{ color: PINK }}>
                                    <span>Delivery · {selectedZone?.name}</span>
                                    <span>+${formatMoney(deliveryFee)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">¿Desea delivery?</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setWantsDelivery(true)}
                                className={`py-2 rounded-lg border text-sm font-bold ${wantsDelivery ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'}`}
                                style={wantsDelivery ? { backgroundColor: PINK } : {}}>
                                Sí
                            </button>
                            <button type="button" onClick={() => { setWantsDelivery(false); setZoneId(''); }}
                                className={`py-2 rounded-lg border text-sm font-bold ${!wantsDelivery ? 'text-white border-transparent' : 'bg-white text-slate-600 border-slate-200'}`}
                                style={!wantsDelivery ? { backgroundColor: PINK } : {}}>
                                No
                            </button>
                        </div>
                        {wantsDelivery && (
                            <select value={zoneId} onChange={e => setZoneId(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm font-bold outline-none bg-white" style={{ borderColor: '#f0dde3' }}>
                                <option value="">Selecciona la ciudad...</option>
                                {zones.map(z => (
                                    <option key={z.id} value={z.id}>{z.name} · +${formatMoney(z.price)}</option>
                                ))}
                            </select>
                        )}
                        {wantsDelivery && zones.length === 0 && (
                            <p className="text-xs text-slate-400">No hay zonas de delivery disponibles.</p>
                        )}
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

function CustomerModal({ onClose, onAuth, onCaja, adminOnly }) {
    const [mode, setMode] = useState(adminOnly ? 'caja' : 'login'); // 'login' | 'register' | 'caja'
    const [form, setForm] = useState({ name: '', cedula: '', email: '', phone: '', password: '', password_confirmation: '' });
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

    const [lookingUp, setLookingUp] = useState(false);
    const lookupTimer = useRef(null);
    // Al escribir la cédula en "En caja", busca si ya compró antes y autocompleta
    const onCedulaChange = (e) => {
        const value = e.target.value;
        setForm(f => ({ ...f, cedula: value }));
        if (mode !== 'caja') return;
        clearTimeout(lookupTimer.current);
        const ced = value.trim();
        if (ced.length < 6) return;
        lookupTimer.current = setTimeout(async () => {
            setLookingUp(true);
            try {
                const res = await fetch(`/api/store/clients/lookup?cedula=${encodeURIComponent(ced)}`, { headers: { 'Accept': 'application/json' } });
                const data = await res.json().catch(() => null);
                if (data?.ok && data.client) {
                    setForm(f => ({ ...f, name: f.name || data.client.name || '', phone: f.phone || data.client.phone || '' }));
                }
            } catch { /* sin conexión: se llena manual */ }
            setLookingUp(false);
        }, 400);
    };

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        if (mode === 'register' && form.password !== form.password_confirmation) {
            setError('Las claves no coinciden.');
            return;
        }
        if (mode === 'caja') {
            onCaja({ id: null, name: form.name, cedula: form.cedula, phone: form.phone, email: '' });
            return;
        }
        setBusy(true);
        try {
            const res = await fetch(`/api/store/clients/${mode === 'login' ? 'login' : 'register'}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                },
                body: JSON.stringify(form),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.ok) {
                const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
                throw new Error(data?.error || firstError || 'No se pudo completar la operación');
            }
            onAuth(data.client);
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const inputCls = 'w-full border rounded-lg px-3 py-2 text-sm outline-none';
    const inputStyle = { borderColor: '#f0dde3' };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#f0dde3' }}>
                    <h3 className="font-black text-lg">{adminOnly ? 'Datos del comprador' : 'Identifícate para pagar'}</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>

                {adminOnly ? null : (
                <div className="grid grid-cols-2 border-b" style={{ borderColor: '#f0dde3' }}>
                    {[['login', 'Ingresar'], ['register', 'Registrarse']].map(([id, label]) => (
                        <button key={id} type="button" onClick={() => { setMode(id); setError(''); }}
                            className={`py-2.5 text-sm font-bold border-b-2 ${mode === id ? 'border-transparent text-white' : 'border-transparent text-slate-400'}`}
                            style={mode === id ? { backgroundColor: PINK } : {}}>
                            {label}
                        </button>
                    ))}
                </div>
                )}

                <form onSubmit={submit} className="p-4 space-y-3">
                    {mode === 'caja' ? (
                        <>
                            <div className="relative">
                                <input required type="text" value={form.cedula} onChange={onCedulaChange} placeholder="Cédula (ej: V-12.345.678)" className={inputCls} style={inputStyle} />
                                {lookingUp && <span className="absolute right-3 top-2.5 text-[10px] text-slate-400">buscando...</span>}
                            </div>
                            <input required type="text" value={form.name} onChange={set('name')} placeholder="Nombre del cliente" className={inputCls} style={inputStyle} />
                            <input required type="tel" value={form.phone} onChange={set('phone')} placeholder="Teléfono" className={inputCls} style={inputStyle} />
                            <p className="text-[11px] text-slate-400">Registro manual en caja — solo disponible para el admin; el comprador no queda con cuenta, solo se asocia a la venta.</p>
                        </>
                    ) : (
                        <>
                            {mode === 'register' && (
                                <>
                                    <input required type="text" value={form.name} onChange={set('name')} placeholder="Nombre completo" className={inputCls} style={inputStyle} />
                                    <input required type="text" value={form.cedula} onChange={set('cedula')} placeholder="Cédula (ej: V-12.345.678)" className={inputCls} style={inputStyle} />
                                    <input required type="tel" value={form.phone} onChange={set('phone')} placeholder="Número de celular" className={inputCls} style={inputStyle} />
                                </>
                            )}
                            <input required type="email" value={form.email} onChange={set('email')} placeholder="Correo electrónico" className={inputCls} style={inputStyle} />
                            <input required type="password" minLength="6" value={form.password} onChange={set('password')} placeholder="Clave (mín. 6 caracteres)" className={inputCls} style={inputStyle} />
                            {mode === 'register' && (
                                <input required type="password" minLength="6" value={form.password_confirmation} onChange={set('password_confirmation')} placeholder="Confirmar clave" className={inputCls} style={inputStyle} />
                            )}
                        </>
                    )}

                    {error && <p className="text-xs font-bold text-red-500">{error}</p>}

                    <button type="submit" disabled={busy} className="w-full py-3 rounded-lg text-white font-bold disabled:bg-slate-300" style={{ backgroundColor: PINK }}>
                        {busy ? 'Verificando...' : mode === 'login' ? 'Ingresar y pagar' : mode === 'register' ? 'Registrarme y pagar' : 'Continuar al pago'}
                    </button>
                    {mode !== 'caja' && (
                        <p className="text-[11px] text-slate-400 text-center">
                            Tus datos se guardan en el sistema administrativo de JULLS.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}

function InvoiceModal({ order, cfg, onClose }) {
    const now = order.date ? new Date(order.date) : new Date();
    const fecha = now.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const hora = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
    const items = order.items || [];
    const subtotal = order.subtotal ?? items.reduce((s, i) => s + (i.quantity ?? i.qty) * (i.unit_price ?? i.price), 0);
    const tax = order.tax ?? 0;
    const deliveryFee = Number(order.delivery_fee || 0);
    const total = order.total ?? subtotal + tax + deliveryFee;
    const iva = Number(order.iva ?? cfg.iva);

    const methodLabel = { cash: 'Efectivo', card: 'Tarj. Debito', mobile: 'Pago Móvil', transfer: 'Transferencia' }[order.payment_method] || order.payment_method || 'Efectivo';
    const ivaLabel = `(${iva.toFixed(2).replace('.', ',')}%)`;

    const D = () => <div className="border-t border-dashed border-slate-400 my-2" />;
    const Row = ({ l, r, bold }) => (
        <div className={`flex justify-between ${bold ? 'font-black' : ''}`}><span>{l}</span><span>{r}</span></div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:bg-white print:p-0 print:static">
            <div className="bg-white w-full max-w-xs max-h-[92vh] overflow-y-auto shadow-xl print:shadow-none print:max-h-none">
                {/* Ticket fiscal */}
                <div className="p-4 text-black font-mono text-[11px] leading-relaxed" id="factura-print">
                    {/* Encabezado empresa */}
                    <div className="text-center">
                        <p className="font-black text-sm">SENIAT</p>
                        {cfg.rif && <p className="font-bold">{cfg.rif}</p>}
                        <p className="font-black uppercase">{cfg.company_name}</p>
                        {cfg.address && <p>{cfg.address}</p>}
                        {cfg.phone && <p>TLF: {cfg.phone}</p>}
                        <p>Caja 01</p>
                    </div>
                    <D />

                    {/* Cliente */}
                    <div>
                        <p className="font-bold">Información del Cliente</p>
                        <p>Cliente: {order.customer?.name || 'Cliente general'}</p>
                        <p>RIF/C.I.: {order.customer?.cedula || '—'}</p>
                        {order.customer?.phone && <p>Telf: {order.customer.phone}</p>}
                    </div>
                    <D />

                    {/* Datos factura */}
                    <p className="text-center font-black">FACTURA</p>
                    <div className="flex justify-between">
                        <span>FACTURA:</span><span>{String(order.id || 0).padStart(8, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>FECHA: {fecha}</span><span>HORA: {hora}</span>
                    </div>
                    <D />

                    {/* Items */}
                    {items.map((it, i) => (
                        <div key={i} className="flex justify-between gap-2">
                            <span className="truncate">{it.quantity ?? it.qty}x {(it.description || it.name || '').toUpperCase()}</span>
                            <span className="whitespace-nowrap">$ {formatMoney((it.quantity ?? it.qty) * (it.unit_price ?? it.price))}</span>
                        </div>
                    ))}
                    <D />

                    {/* Base imponible e IVA */}
                    <Row l={`BI G ${ivaLabel}`} r={`$ ${formatMoney(subtotal)}`} />
                    <Row l={`IVA G ${ivaLabel}`} r={`$ ${formatMoney(tax)}`} />
                    {deliveryFee > 0 && (
                        <Row l={`Delivery${order.delivery_city ? ` · ${order.delivery_city}` : ''}`} r={`$ ${formatMoney(deliveryFee)}`} />
                    )}
                    <D />
                    <div className="flex justify-between text-sm font-black">
                        <span>TOTAL</span><span>$ {formatMoney(total)}</span>
                    </div>
                    <D />

                    {/* Métodos de pago */}
                    <Row l={methodLabel} r={`$ ${formatMoney(total)}`} />
                    <D />

                    {/* Pie */}
                    <p className="text-center">{cfg.footer}</p>
                </div>

                {/* Acciones (no se imprimen) */}
                <div className="p-3 border-t flex gap-2 print:hidden" style={{ borderColor: '#f0dde3' }}>
                    <button onClick={() => window.print()} className="flex-1 py-2.5 rounded-lg border text-sm font-bold text-slate-600 hover:bg-slate-50" style={{ borderColor: '#e2e8f0' }}>
                        <Receipt size={15} className="inline mr-1" /> Imprimir
                    </button>
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-white text-sm font-bold" style={{ backgroundColor: PINK }}>
                        Volver a la caja
                    </button>
                </div>
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
