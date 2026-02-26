'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Producto, Categoria, Banner } from '@/types';

export default function AdminDashboard() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [banners, setBanners] = useState<Banner[]>([]);
    const [cargando, setCargando] = useState(true);

    const supabase = createClient();

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const [resProd, resCat, resBan] = await Promise.all([
            supabase.from('productos').select('*').order('creado_en', { ascending: false }),
            supabase.from('categorias').select('*'),
            supabase.from('banners').select('*'),
        ]);

        if (resProd.data) setProductos(resProd.data);
        if (resCat.data) setCategorias(resCat.data);
        if (resBan.data) setBanners(resBan.data);
        setCargando(false);
    }, [supabase]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    if (cargando) {
        return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}</div></div>;
    }

    const productosActivos = productos.filter((p) => p.esta_disponible).length;
    const bannersActivos = banners.filter((b) => b.activo).length;

    const stats = [
        { label: 'Productos', valor: productos.length, icono: '📦', color: 'from-amber-400 to-orange-500', href: '/admin/productos' },
        { label: 'Activos', valor: productosActivos, icono: '✅', color: 'from-green-400 to-emerald-500', href: '/admin/productos' },
        { label: 'Categorías', valor: categorias.length, icono: '📁', color: 'from-blue-400 to-indigo-500', href: '/admin/categorias' },
        { label: 'Banners', valor: bannersActivos, icono: '🖼️', color: 'from-purple-400 to-pink-500', href: '/admin/banners' },
    ];

    const productosRecientes = productos.slice(0, 5);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Resumen general de tu cafetería</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href}
                        className="relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group"
                    >
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.color} opacity-10 rounded-bl-[40px] group-hover:opacity-20 transition-opacity`} />
                        <span className="text-2xl">{stat.icono}</span>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stat.valor}</p>
                        <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                    </Link>
                ))}
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Link href="/admin/productos" className="flex flex-col items-center gap-2 p-4 bg-cafe-50 hover:bg-cafe-100 rounded-xl transition-colors text-center">
                        <span className="text-2xl">➕</span>
                        <span className="text-sm font-medium text-cafe-700">Nuevo Producto</span>
                    </Link>
                    <Link href="/admin/categorias" className="flex flex-col items-center gap-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-center">
                        <span className="text-2xl">📂</span>
                        <span className="text-sm font-medium text-blue-700">Nueva Categoría</span>
                    </Link>
                    <Link href="/admin/banners" className="flex flex-col items-center gap-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors text-center">
                        <span className="text-2xl">🎨</span>
                        <span className="text-sm font-medium text-purple-700">Nuevo Banner</span>
                    </Link>
                    <Link href="/" target="_blank" className="flex flex-col items-center gap-2 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors text-center">
                        <span className="text-2xl">👁️</span>
                        <span className="text-sm font-medium text-green-700">Ver Tienda</span>
                    </Link>
                </div>
            </div>

            {/* Productos recientes */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Productos Recientes</h2>
                    <Link href="/admin/productos" className="text-cafe-500 hover:text-cafe-600 text-sm font-medium">
                        Ver todos →
                    </Link>
                </div>
                <div className="space-y-3">
                    {productosRecientes.map((producto) => (
                        <div key={producto.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-cafe-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-cafe-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{producto.nombre}</p>
                                <p className="text-xs text-gray-500">{producto.tiene_variantes ? 'Variable' : `$${producto.precio ?? 0}`}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${producto.esta_disponible
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {producto.esta_disponible ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
