import './bootstrap';
import '../css/app.css';

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BarChart3, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

const PresupuestoApp = () => {
    const PINK = '#bf7691';
    const LIGHT = '#faf0f1';

    const [currentPage, setCurrentPage] = useState(0);

    const rows = [
        { name: 'Choco Crunch (150g)', dist: '$3.00', pvp: '$4.80', margin: '37.5%' },
        { name: 'Velvet Cream (150g)', dist: '$3.50', pvp: '$5.50', margin: '36.3%' },
        { name: 'Minis Choco Crunch', dist: '$1.20', pvp: '$1.90', margin: '36.8%' },
    ];

    const pages = [
        {
            title: 'JULLS Repostería Artesanal',
            subtitle: 'Propuesta Comercial para Grandes Superficies y Bodegones Premium',
            content: (
                <div className="flex flex-col md:flex-row items-center gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="md:w-1/2 space-y-6">
                        <div className="inline-block px-4 py-1 rounded-full text-sm font-bold tracking-wider" style={{ backgroundColor: '#f5dde5', color: PINK }}>
                            NUEVA YORK EN VALENCIA
                        </div>
                        <h1 className="text-5xl font-black text-slate-900 leading-tight">
                            El Arte de la Galleta <span style={{ color: PINK }}>Perfecta</span>
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Galletas de autor tipo New York, elaboradas con ingredientes funcionales y un proceso semi-industrial estandarizado
                            que garantiza frescura y escalabilidad.
                        </p>
                        <ul className="space-y-3">
                            {[
                                'Registro Sanitario y CPE Vigentes',
                                '90 días de vida de anaquel garantizados',
                                'Ingredientes Premium (Mantequilla Real y Avellanas)',
                                "Concepto 'Bake-at-home' para experiencia de frescura",
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5" style={{ color: PINK }} /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:w-1/2 relative">
                        <div className="rounded-3xl p-8 border-2 shadow-2xl overflow-hidden" style={{ backgroundColor: '#fdf5f7', borderColor: '#f0dde3' }}>
                            <div className="aspect-square bg-white rounded-2xl flex items-center justify-center shadow-inner mb-4 overflow-hidden">
                                <div className="text-center px-6">
                                    <img src="/313790.jpg" alt="Producto" className="w-40 h-40 rounded-full object-cover mx-auto mb-4 shadow-lg" />
                                    <h3 className="text-2xl font-bold text-slate-900">CHOCO CRUNCH</h3>
                                    <p className="font-bold tracking-widest text-sm italic" style={{ color: PINK }}>ORIGINAL RECIPE</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Peso Neto</p>
                                    <p className="text-xl font-black text-slate-800">150g / 6 Unid.</p>
                                </div>
                                <div className="text-white px-4 py-2 rounded-xl text-center" style={{ backgroundColor: PINK }}>
                                    <p className="text-[10px] uppercase">Margen Retail</p>
                                    <p className="text-xl font-black">37.5%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Arquitectura de Portafolio',
            subtitle: 'Diversificación estratégica para maximizar la rotación de inventario',
            content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-700">
                    {[
                        {
                            name: 'Choco Crunch',
                            tag: 'CASH COW',
                            slogan: 'Experiencia New York',
                            desc: 'Nuestra insignia. Rellena de chocolate y avellanas. Alta percepción de valor.',
                            tagBg: PINK,
                            pouch: 'Pack 150g',
                        },
                        {
                            name: 'Velvet Cream',
                            tag: 'PREMIUM',
                            slogan: 'Sofisticación Pura',
                            desc: 'Masa Red Velvet con centro cremoso. Ideal para regalos y consumo gourmet.',
                            tagBg: '#7c2d41',
                            pouch: 'Pack 150g',
                        },
                        {
                            name: 'Minis Crunch',
                            tag: 'BITE-SIZE',
                            slogan: 'Sabor en Movimiento',
                            desc: 'Sin relleno. Alta rotación, empaque snack. Perfecto para cajas de pago.',
                            tagBg: '#c58aa0',
                            pouch: 'Stand-up Pouch',
                        },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                        >
                            <div>
                                <span
                                    className="text-[10px] font-bold text-white px-2 py-1 rounded-md mb-4 inline-block tracking-tighter"
                                    style={{ backgroundColor: item.tagBg }}
                                >
                                    {item.tag}
                                </span>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                                <p className="text-xs font-semibold uppercase mb-3" style={{ color: PINK }}>{item.slogan}</p>
                                <p className="text-sm text-slate-500 mb-4 italic">&quot;{item.desc}&quot;</p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-400 mb-1">Formato</p>
                                <p className="font-bold text-slate-800">{item.pouch}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ),
        },
        {
            title: 'Productos Disponibles',
            subtitle: 'Garantizando la mayor rentabilidad por centímetro de anaquel',
            content: (
                <div className="space-y-8 animate-in fade-in duration-700">
                    <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-xl">
                        <table className="w-full text-left bg-white">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-900">PRODUCTO</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-900">COSTO DISTRIBUIDOR</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-900">PVP SUGERIDO</th>
                                    <th className="px-6 py-4 text-sm font-bold text-slate-900 text-center">MARGEN RETAIL (%)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-pink-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{row.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{row.dist}</td>
                                        <td className="px-6 py-4 text-slate-600">{row.pvp}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-3 py-1 rounded-full text-sm font-black" style={{ backgroundColor: '#f5dde5', color: PINK }}>
                                                {row.margin}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl text-white" style={{ backgroundColor: PINK }}>
                            <div className="flex items-center gap-3 mb-4">
                                <BarChart3 className="w-8 h-8" style={{ color: '#f5dde5' }} />
                                <h4 className="text-xl font-bold">Ventaja Competitiva</h4>
                            </div>
                            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.9)' }}>
                                Nuestros márgenes superan el promedio de la categoría (25%), permitiendo a nuestros aliados comerciales
                                recuperar la inversión más rápido mientras ofrecen un producto premium con alta tasa de recompra.
                            </p>
                        </div>

                        <div className="p-6 rounded-2xl border-2 border-dashed" style={{ backgroundColor: '#fdf5f7', borderColor: '#f0dde3' }}>
                            <h4 className="text-slate-800 font-bold mb-2 italic">Certificaciones y Garantías</h4>
                            <p className="text-slate-600 text-xs mb-4">
                                Procesos estandarizados bajo normativas sanitarias. Empaques de alta barrera que garantizan frescura sin
                                necesidad de conservantes artificiales invasivos.
                            </p>
                            <div className="flex gap-4">
                                {['CPE', 'GTIN', 'SISA'].map((k) => (
                                    <div
                                        key={k}
                                        className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold text-xs"
                                        style={{ color: PINK }}
                                    >
                                        {k}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen flex items-center justify-center p-4 font-sans" style={{ backgroundColor: LIGHT }}>
            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
                <div className="px-12 pt-12 pb-6 flex justify-between items-start border-b border-slate-50">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <img src="/313790.jpg" alt="Julls Logo" className="w-10 h-10 rounded-full object-cover" />
                            <span className="font-black tracking-tighter" style={{ color: PINK }}>
                                JULLS <span className="text-slate-700">Repostería</span>
                            </span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{pages[currentPage].title}</h2>
                        <p className="text-slate-400 text-sm font-medium">{pages[currentPage].subtitle}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-slate-300 font-bold text-xl">{String(currentPage + 1).padStart(2, '0')} / 03</span>
                    </div>
                </div>

                <div className="px-12 py-10 min-h-[450px]">{pages[currentPage].content}</div>

                <div className="px-12 py-8 flex justify-between items-center" style={{ backgroundColor: '#faf0f1' }}>
                    <div className="text-xs text-slate-400 font-medium">© 2026 Julls Repostería, C.A. • Valencia, Venezuela • Estrategia de Crecimiento</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 disabled:opacity-30 transition-all shadow-sm"
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#f5dde5';
                                e.currentTarget.style.color = PINK;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.color = '#475569';
                            }}
                        >
                            <ChevronLeft />
                        </button>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(pages.length - 1, prev + 1))}
                            disabled={currentPage === pages.length - 1}
                            className="p-3 rounded-full text-white disabled:opacity-30 transition-all shadow-md flex items-center gap-2 px-6 font-bold"
                            style={{ backgroundColor: PINK }}
                        >
                            {currentPage === pages.length - 1 ? 'Finalizar' : 'Siguiente'} <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const container = document.getElementById('presupuesto');
if (container) {
    createRoot(container).render(<PresupuestoApp />);
}
