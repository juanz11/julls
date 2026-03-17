import './bootstrap';
import '../css/app.css';

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ChevronRight, ChevronLeft, BarChart3, CheckCircle2 } from 'lucide-react';

const JullsApp = () => {
    const [currentPage, setCurrentPage] = useState(0);

    const pages = [
        {
            title: "JULLS Repostería Artesanal",
            subtitle: "Propuesta Comercial para Grandes Superficies y Bodegones Premium",
            content: (
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="md:w-1/2 space-y-6">
                        <div className="inline-block px-4 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-bold tracking-wider">NUEVA YORK EN VALENCIA</div>
                        <h1 className="text-5xl font-black text-amber-900 leading-tight">El Arte de la Galleta <span className="text-amber-600">Perfecta</span></h1>
                        <p className="text-lg text-slate-600 leading-relaxed">Galletas de autor tipo New York, elaboradas con ingredientes funcionales y un proceso semi-industrial estandarizado que garantiza frescura y escalabilidad.</p>
                        <ul className="space-y-3">
                            {["Registro Sanitario y CPE Vigentes", "90 días de vida de anaquel garantizados", "Ingredientes Premium (Mantequilla Real y Avellanas)", "Concepto 'Bake-at-home' para experiencia de frescura"].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-slate-700 font-medium">
                                    <CheckCircle2 className="text-amber-500 w-5 h-5" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="md:w-1/2">
                        <div className="bg-amber-50 rounded-3xl p-8 border-2 border-amber-100 shadow-2xl overflow-hidden">
                            <div className="aspect-square bg-white rounded-2xl flex items-center justify-center shadow-inner mb-4 overflow-hidden">
                                <div className="text-center">
                                    <div className="w-48 h-48 bg-amber-800 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-6xl font-black shadow-lg">J</div>
                                    <h3 className="text-2xl font-bold text-amber-900">CHOCO CRUNCH</h3>
                                    <p className="text-amber-600 font-bold tracking-widest text-sm italic">ORIGINAL RECIPE</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Peso Neto</p>
                                    <p className="text-xl font-black text-slate-800">150g / 6 Unid.</p>
                                </div>
                                <div className="bg-amber-900 text-white px-4 py-2 rounded-xl text-center">
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
            title: "Arquitectura de Portafolio",
            subtitle: "Diversificación estratégica para maximizar la rotación de inventario",
            content: (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: "Choco Crunch", tag: "CASH COW", slogan: "Experiencia New York", desc: "Nuestra insignia. Rellena de chocolate y avellanas. Alta percepción de valor.", color: "bg-amber-900", pouch: "Pack 150g" },
                        { name: "Velvet Cream", tag: "PREMIUM", slogan: "Sofisticación Pura", desc: "Masa Red Velvet con centro cremoso. Ideal para regalos y consumo gourmet.", color: "bg-red-800", pouch: "Pack 150g" },
                        { name: "Minis Crunch", tag: "BITE-SIZE", slogan: "Sabor en Movimiento", desc: "Sin relleno. Alta rotación, empaque snack. Perfecto para cajas de pago.", color: "bg-amber-600", pouch: "Stand-up Pouch" },
                    ].map((item, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div>
                                <span className={`text-[10px] font-bold text-white px-2 py-1 rounded-md ${item.color} mb-4 inline-block tracking-tighter`}>{item.tag}</span>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                                <p className="text-xs font-semibold text-amber-600 uppercase mb-3">{item.slogan}</p>
                                <p className="text-sm text-slate-500 mb-4 italic">"{item.desc}"</p>
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
            title: "Análisis Financiero B2B",
            subtitle: "Garantizando la mayor rentabilidad por centímetro de anaquel",
            content: (
                <div className="space-y-8">
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
                                {[
                                    { name: "Choco Crunch (150g)", dist: "$3.00", pvp: "$4.80", margin: "37.5%" },
                                    { name: "Velvet Cream (150g)", dist: "$3.50", pvp: "$5.50", margin: "36.3%" },
                                    { name: "Minis Choco Crunch", dist: "$1.20", pvp: "$1.90", margin: "36.8%" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-800">{row.name}</td>
                                        <td className="px-6 py-4 text-slate-600">{row.dist}</td>
                                        <td className="px-6 py-4 text-slate-600">{row.pvp}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-black">{row.margin}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-amber-900 p-6 rounded-2xl text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <BarChart3 className="w-8 h-8 text-amber-400" />
                                <h4 className="text-xl font-bold">Ventaja Competitiva</h4>
                            </div>
                            <p className="text-amber-100 text-sm leading-relaxed">Nuestros márgenes superan el promedio de la categoría (25%), permitiendo a nuestros aliados comerciales recuperar la inversión más rápido mientras ofrecen un producto premium con alta tasa de recompra.</p>
                        </div>
                        <div className="bg-slate-100 p-6 rounded-2xl border-2 border-dashed border-slate-300">
                            <h4 className="text-slate-800 font-bold mb-2 italic">Certificaciones y Garantías</h4>
                            <p className="text-slate-600 text-xs mb-4">Procesos estandarizados bajo normativas sanitarias. Empaques de alta barrera que garantizan frescura sin necesidad de conservantes artificiales invasivos.</p>
                            <div className="flex gap-4">
                                {["CPE", "GTIN", "SISA"].map(cert => (
                                    <div key={cert} className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center font-bold text-xs text-slate-400">{cert}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
            <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100">
                <div className="px-12 pt-12 pb-6 flex justify-between items-start border-b border-slate-50">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 bg-amber-900 rounded-lg flex items-center justify-center text-white font-black text-xs">J</div>
                            <span className="font-black text-slate-900 tracking-tighter">JULLS <span className="text-amber-600">REPOSTERÍA</span></span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{pages[currentPage].title}</h2>
                        <p className="text-slate-400 text-sm font-medium">{pages[currentPage].subtitle}</p>
                    </div>
                    <span className="text-slate-300 font-bold text-xl">{String(currentPage + 1).padStart(2, '0')} / 03</span>
                </div>

                <div className="px-12 py-10 min-h-[450px]">
                    {pages[currentPage].content}
                </div>

                <div className="px-12 py-8 bg-slate-50 flex justify-between items-center">
                    <div className="text-xs text-slate-400 font-medium">© 2026 Julls Repostería, C.A. • Valencia, Venezuela • Estrategia de Crecimiento</div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                            disabled={currentPage === 0}
                            className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-amber-100 hover:text-amber-900 disabled:opacity-30 transition-all shadow-sm"
                        >
                            <ChevronLeft />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(pages.length - 1, prev + 1))}
                            disabled={currentPage === pages.length - 1}
                            className="p-3 rounded-full bg-amber-900 text-white hover:bg-amber-800 disabled:opacity-30 transition-all shadow-md flex items-center gap-2 px-6 font-bold"
                        >
                            {currentPage === pages.length - 1 ? "Finalizar" : "Siguiente"} <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(<JullsApp />);
}
