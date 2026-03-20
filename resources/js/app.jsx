import './bootstrap';
import '../css/app.css';

import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ShoppingCart, Plus, Minus, X, ChevronRight, CheckCircle2, Package } from 'lucide-react';

const STORAGE_KEY = 'julls_products';

const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: 'Choco Crunch',
        tag: 'BESTSELLER',
        desc: 'Galleta rellena de chocolate y avellanas. Experiencia New York en cada mordida.',
        price: 4.80,
        image: '/313790.jpg',
        image2: '/313792.jpg',
        weight: '150g / 6 unid.',
        shelf: '90 días',
        flavors: ['Chocolate Negro', 'Chocolate con Leche', 'Chocolate Blanco'],
    },
    {
        id: 2,
        name: 'Velvet Cream',
        tag: 'PREMIUM',
        desc: 'Masa Red Velvet con centro cremoso. Ideal para regalo o consumo gourmet.',
        price: 5.50,
        image: '/313792.jpg',
        image2: '/313794.jpg',
        weight: '150g / 6 unid.',
        shelf: '90 días',
        flavors: ['Crema Vainilla', 'Crema Fresa', 'Crema Limón'],
    },
    {
        id: 3,
        name: 'Minis Crunch',
        tag: 'BITE-SIZE',
        desc: 'Sin relleno. Alta rotación, empaque snack. Perfectas para compartir.',
        price: 1.90,
        image: '/313794.jpg',
        image2: '/313790.jpg',
        weight: 'Stand-up Pouch',
        shelf: '90 días',
        flavors: ['Clásica', 'Canela', 'Cacao'],
    },
];

const PINK = '#bf7691';
const LIGHT = '#faf0f1';

const JullsApp = () => {
    const [view, setView] = useState('home');
    const [products, setProducts] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
        } catch { return DEFAULT_PRODUCTS; }
    });
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [selectedFlavors, setSelectedFlavors] = useState({});
    const [orderForm, setOrderForm] = useState({ name: '', phone: '', address: '', notes: '' });
    const [checkingOut, setCheckingOut] = useState(false);

    // Sincronizar con cambios del admin (mismo navegador)
    useEffect(() => {
        const onStorage = () => {
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) setProducts(JSON.parse(saved));
            } catch {}
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const totalItems = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const addToCart = (product) => {
        const flavor = selectedFlavors[product.id] || product.flavors[0];
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id && i.flavor === flavor);
            if (existing) return prev.map(i => i.id === product.id && i.flavor === flavor ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { ...product, flavor, qty: 1 }];
        });
    };

    const updateQty = (id, flavor, delta) => {
        setCart(prev => prev
            .map(i => i.id === id && i.flavor === flavor ? { ...i, qty: i.qty + delta } : i)
            .filter(i => i.qty > 0)
        );
    };

    const handleOrder = (e) => {
        e.preventDefault();
        setCartOpen(false);
        setCart([]);
        setOrderForm({ name: '', phone: '', address: '', notes: '' });
        setCheckingOut(false);
        setView('order-success');
    };

    return (
        <div className="min-h-screen font-sans" style={{ backgroundColor: LIGHT }}>

            {/* NAV */}
            <nav className="sticky top-0 z-40 border-b" style={{ backgroundColor: '#fff', borderColor: '#f0dde3' }}>
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => setView('home')} className="flex items-center gap-3">
                        <img src="/313790.jpg" alt="Julls Logo" className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-black text-lg tracking-tighter" style={{ color: PINK }}>JULLS <span className="text-slate-700">Repostería</span></span>
                    </button>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setView('catalog')}
                            className="text-sm font-bold px-4 py-2 rounded-full transition-all"
                            style={{ color: view === 'catalog' ? '#fff' : PINK, backgroundColor: view === 'catalog' ? PINK : 'transparent', border: `2px solid ${PINK}` }}
                        >
                            Catálogo
                        </button>
                        <button
                            onClick={() => setCartOpen(true)}
                            className="relative p-2 rounded-full"
                            style={{ backgroundColor: PINK }}
                        >
                            <ShoppingCart className="w-5 h-5 text-white" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{totalItems}</span>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            {/* BARRA DE CATEGORÍAS */}
            <div className="w-full border-b bg-white" style={{ borderColor: '#f0dde3' }}>
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-1 overflow-x-auto py-2 scrollbar-hide">
                        {[
                            { icon: '🍪', label: 'Galletas' },
                            { icon: '🎂', label: 'Tartas' },
                            { icon: '🧁', label: 'Cupcakes' },
                            { icon: '🍫', label: 'Chocolate' },
                            { icon: '🎁', label: 'Regalos' },
                            { icon: '⭐', label: 'Novedades' },
                            { icon: '🏷️', label: 'Ofertas' },
                        ].map((cat) => (
                            <button
                                key={cat.label}
                                onClick={() => setView('catalog')}
                                className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl hover:bg-pink-50 transition-colors flex-shrink-0 group"
                            >
                                <span className="text-3xl leading-none">{cat.icon}</span>
                                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 group-hover:text-pink-400 transition-colors whitespace-nowrap" style={{ color: '#9a7080' }}>
                                    {cat.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            {/* BANNER - solo en home */}
            {view === 'home' && (
            <div className="relative w-full overflow-hidden" style={{ minHeight: 500 }}>
                <picture>
                    <source media="(max-width: 767px)" srcSet="/313794.jpg" />
                    <source media="(min-width: 768px)" srcSet="/313790.jpg" />
                    <img
                        src="/313790.jpg"
                        alt="Banner galletas"
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ filter: 'brightness(0.55)' }}
                    />
                </picture>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 100%)' }} />
                <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center md:items-end gap-6" style={{ minHeight: 500 }}>
                    <div className="flex-1">
                        <p className="text-white text-sm font-bold uppercase tracking-widest mb-2 opacity-80">Edición Especial</p>
                        <h2 className="text-white text-5xl md:text-7xl font-black leading-tight drop-shadow">
                            -15% EN TODAS<br />LAS GALLETAS
                        </h2>
                        <p className="text-white/80 text-base mt-3">Hasta el 31 de marzo · Solo pedidos online</p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-3">
                        <div className="px-5 py-2 rounded-full font-black text-white text-base tracking-wide" style={{ backgroundColor: PINK }}>
                            CÓDIGO: <span className="uppercase">GALLETAS15</span>
                        </div>
                        <button
                            onClick={() => setView('catalog')}
                            className="px-6 py-2 rounded-full font-bold text-sm border-2 border-white text-white hover:bg-white transition-all"
                            style={{ color: 'white' }}
                            onMouseEnter={e => { e.currentTarget.style.color = PINK; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'white'; }}
                        >
                            Ver Catálogo →
                        </button>
                    </div>
                </div>
            </div>
            )}

            {/* HOME */}
            {view === 'home' && (
                <div>
                    {/* Hero */}
                    <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2 space-y-6">
                            <div className="inline-block px-4 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: '#f5dde5', color: PINK }}>
                                Nueva York en Valencia 🍪
                            </div>
                            <h1 className="text-5xl font-black text-slate-900 leading-tight">
                                El Arte de la<br /><span style={{ color: PINK }}>Galleta Perfecta</span>
                            </h1>
                            <p className="text-slate-500 text-lg leading-relaxed">
                                Galletas artesanales de autor, elaboradas con mantequilla real y avellanas. Frescura garantizada, sabor inigualable.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setView('catalog')}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-white transition-all hover:opacity-90"
                                    style={{ backgroundColor: PINK }}
                                >
                                    Ver Catálogo <ChevronRight size={18} />
                                </button>
                            </div>
                            <ul className="space-y-2 pt-2">
                                {['Registro Sanitario y CPE Vigentes', '90 días de vida de anaquel', 'Sin conservantes artificiales'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                        <CheckCircle2 className="w-4 h-4" style={{ color: PINK }} /> {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            <div className="relative">
                                <div className="w-72 h-72 rounded-full overflow-hidden shadow-2xl border-4" style={{ borderColor: PINK }}>
                                    <img src="/313790.jpg" alt="Julls Galletas" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-4 -right-4 rounded-2xl px-4 py-3 shadow-lg text-white text-center" style={{ backgroundColor: PINK }}>
                                    <p className="text-[10px] uppercase font-bold">Margen Retail</p>
                                    <p className="text-2xl font-black">37.5%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview productos */}
                    <div className="max-w-6xl mx-auto px-6 pb-20">
                        <h2 className="text-2xl font-black text-slate-800 mb-8 text-center">Nuestros Productos</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {products.map(p => (
                                <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border" style={{ borderColor: '#f0dde3' }}>
                                    <div className="h-48 overflow-hidden relative group">
                                        <img src={p.image} alt={p.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105" />
                                        {p.image2 && (
                                            <img src={p.image2} alt={p.name}
                                                className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100" />
                                        )}
                                    </div>
                                    <div className="p-5">
                                        <span className="text-[10px] font-bold text-white px-2 py-1 rounded-md" style={{ backgroundColor: PINK }}>{p.tag}</span>
                                        <h3 className="text-lg font-black text-slate-900 mt-2">{p.name}</h3>
                                        <p className="text-slate-500 text-sm mt-1 mb-4">{p.desc}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-black" style={{ color: PINK }}>${p.price.toFixed(2)}</span>
                                            <button
                                                onClick={() => { setView('catalog'); }}
                                                className="text-sm font-bold px-4 py-2 rounded-full text-white"
                                                style={{ backgroundColor: PINK }}
                                            >
                                                Pedir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* CATALOG */}
            {view === 'catalog' && (
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-slate-900">Catálogo de Pedidos</h2>
                        <p className="text-slate-500 mt-1">Selecciona tu sabor y agrega al carrito</p>
                    </div>
                    <div className="space-y-6">
                        {products.map(p => (
                            <div key={p.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col md:flex-row" style={{ borderColor: '#f0dde3' }}>
                                <div className="md:w-56 h-48 md:h-auto overflow-hidden flex-shrink-0 relative group">
                                    <img src={p.image} alt={p.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:opacity-0 group-hover:scale-105" />
                                    {p.image2 && (
                                        <img src={p.image2} alt={p.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100" />
                                    )}
                                    {/* Miniaturas */}
                                    {p.image2 && (
                                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 z-10">
                                            <span className="w-2 h-2 rounded-full bg-white opacity-60 group-hover:opacity-30 transition-opacity" />
                                            <span className="w-2 h-2 rounded-full bg-white opacity-30 group-hover:opacity-80 transition-opacity" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex flex-col justify-between flex-1">
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-white px-2 py-1 rounded-md" style={{ backgroundColor: PINK }}>{p.tag}</span>
                                                <h3 className="text-xl font-black text-slate-900 mt-2">{p.name}</h3>
                                                <p className="text-slate-500 text-sm mt-1">{p.desc}</p>
                                            </div>
                                            <span className="text-2xl font-black ml-4 flex-shrink-0" style={{ color: PINK }}>${p.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex gap-2 flex-wrap mt-3 mb-1">
                                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1"><Package size={12} /> {p.weight}</span>
                                            <span className="text-xs text-slate-400 font-medium">• Anaquel: {p.shelf}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Elige tu sabor:</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {p.flavors.map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setSelectedFlavors(prev => ({ ...prev, [p.id]: f }))}
                                                    className="px-3 py-1 rounded-full text-sm font-semibold border-2 transition-all"
                                                    style={{
                                                        borderColor: PINK,
                                                        backgroundColor: (selectedFlavors[p.id] || p.flavors[0]) === f ? PINK : 'transparent',
                                                        color: (selectedFlavors[p.id] || p.flavors[0]) === f ? '#fff' : PINK,
                                                    }}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => { addToCart(p); setCartOpen(true); }}
                                            className="flex items-center gap-2 px-5 py-2 rounded-full font-bold text-white transition-all hover:opacity-90"
                                            style={{ backgroundColor: PINK }}
                                        >
                                            <ShoppingCart size={16} /> Agregar al carrito
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ORDER SUCCESS */}
            {view === 'order-success' && (
                <div className="max-w-md mx-auto px-6 py-24 text-center">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#f5dde5' }}>
                        <CheckCircle2 className="w-10 h-10" style={{ color: PINK }} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-3">¡Pedido Recibido!</h2>
                    <p className="text-slate-500 mb-8">Nos pondremos en contacto contigo pronto para confirmar tu pedido. ¡Gracias por elegir Julls!</p>
                    <button
                        onClick={() => setView('catalog')}
                        className="px-6 py-3 rounded-full font-bold text-white"
                        style={{ backgroundColor: PINK }}
                    >
                        Hacer otro pedido
                    </button>
                </div>
            )}

            {/* CART DRAWER */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40" onClick={() => { setCartOpen(false); setCheckingOut(false); }} />
                    <div className="w-full max-w-md bg-white h-full overflow-y-auto flex flex-col shadow-2xl">
                        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: '#f0dde3' }}>
                            <h3 className="text-xl font-black text-slate-900">Tu Carrito</h3>
                            <button onClick={() => { setCartOpen(false); setCheckingOut(false); }}>
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {cart.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                                <ShoppingCart className="w-12 h-12 opacity-30" />
                                <p className="font-medium">Tu carrito está vacío</p>
                            </div>
                        ) : !checkingOut ? (
                            <>
                                <div className="flex-1 p-6 space-y-4">
                                    {cart.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl border" style={{ borderColor: '#f0dde3' }}>
                                            <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-slate-800 text-sm truncate">{item.name}</p>
                                                <p className="text-xs text-slate-400">{item.flavor}</p>
                                                <p className="text-sm font-black mt-1" style={{ color: PINK }}>${(item.price * item.qty).toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => updateQty(item.id, item.flavor, -1)} className="w-7 h-7 rounded-full border flex items-center justify-center" style={{ borderColor: PINK }}>
                                                    <Minus size={12} style={{ color: PINK }} />
                                                </button>
                                                <span className="w-5 text-center font-bold text-sm">{item.qty}</span>
                                                <button onClick={() => updateQty(item.id, item.flavor, 1)} className="w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: PINK }}>
                                                    <Plus size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-6 border-t" style={{ borderColor: '#f0dde3' }}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="font-bold text-slate-700">Total</span>
                                        <span className="text-2xl font-black" style={{ color: PINK }}>${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={() => setCheckingOut(true)}
                                        className="w-full py-3 rounded-full font-bold text-white text-center"
                                        style={{ backgroundColor: PINK }}
                                    >
                                        Proceder al Pedido
                                    </button>
                                </div>
                            </>
                        ) : (
                            <form onSubmit={handleOrder} className="flex-1 flex flex-col p-6 gap-4">
                                <h4 className="font-black text-slate-800 text-lg">Datos de Entrega</h4>
                                {[
                                    { key: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Tu nombre' },
                                    { key: 'phone', label: 'Teléfono / WhatsApp', type: 'tel', placeholder: '+58 412 000 0000' },
                                    { key: 'address', label: 'Dirección', type: 'text', placeholder: 'Calle, sector, ciudad' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">{f.label}</label>
                                        <input
                                            type={f.type}
                                            required
                                            placeholder={f.placeholder}
                                            value={orderForm[f.key]}
                                            onChange={e => setOrderForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                            className="w-full border rounded-xl px-4 py-2 text-sm outline-none focus:ring-2"
                                            style={{ borderColor: '#f0dde3', focusRingColor: PINK }}
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">Notas (opcional)</label>
                                    <textarea
                                        placeholder="Instrucciones especiales..."
                                        value={orderForm.notes}
                                        onChange={e => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full border rounded-xl px-4 py-2 text-sm outline-none resize-none h-20"
                                        style={{ borderColor: '#f0dde3' }}
                                    />
                                </div>
                                <div className="mt-auto pt-4 border-t" style={{ borderColor: '#f0dde3' }}>
                                    <div className="flex justify-between mb-3">
                                        <span className="font-bold text-slate-700">Total del pedido</span>
                                        <span className="font-black text-lg" style={{ color: PINK }}>${totalPrice.toFixed(2)}</span>
                                    </div>
                                    <button type="submit" className="w-full py-3 rounded-full font-bold text-white" style={{ backgroundColor: PINK }}>
                                        Confirmar Pedido
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(<JullsApp />);
}
