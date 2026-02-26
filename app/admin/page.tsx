'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Producto, Categoria, Banner } from '@/types';
import { Package, CheckCircle, Tag, Image as ImageIcon, Settings } from 'lucide-react';

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

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(precio);
    };

    const getNombreCategoria = (id: string) => {
        return categorias.find(c => c.id === id)?.nombre || 'Desconocida';
    };

    const productosActivos = productos.filter((p) => p.esta_disponible).length;
    const bannersActivos = banners.filter((b) => b.activo).length;

    const stats = [
        { label: 'Total Productos', valor: productos.length, subtexto: 'En el catálogo', Icon: Package },
        { label: 'Disponibles', valor: productosActivos, subtexto: 'Activos ahora', Icon: CheckCircle },
        { label: 'Categorías', valor: categorias.length, subtexto: 'Agrupaciones', Icon: Tag },
        { label: 'Banners Activos', valor: bannersActivos, subtexto: 'Promociones web', Icon: ImageIcon },
    ];

    const acciones = [
        { href: '/admin/productos', label: 'Nuevo Producto', sublabel: 'Agregar al menú', Icon: Package },
        { href: '/admin/categorias', label: 'Nueva Categoría', sublabel: 'Organizar secciones', Icon: Tag },
        { href: '/admin/banners', label: 'Nuevo Banner', sublabel: 'Crear promoción', Icon: ImageIcon },
        { href: '/admin/configuracion', label: 'Configuración', sublabel: 'Ajustes del negocio', Icon: Settings },
    ];

    const productosRecientes = productos.slice(0, 6);

    const fechaActual = new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header del Dashboard */}
            <div className="flex items-end justify-between mb-8">
                <div>
                    <p className="text-xs font-medium tracking-widest uppercase text-[var(--color-texto-3)] mb-1">
                        {fechaActual}
                    </p>
                    <h1 className="text-2xl font-semibold text-[var(--color-texto-1)] tracking-tight">
                        Panel de Control
                    </h1>
                </div>
                <span className="text-xs text-[var(--color-texto-3)] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-matcha)] animate-pulse inline-block" />
                    Sistema activo
                </span>
            </div>

            {/* Tarjetas de Métricas (KPIs) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white border border-[var(--color-borde)] rounded-xl p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--color-texto-3)]">
                                {stat.label}
                            </span>
                            <div className="w-7 h-7 rounded-lg bg-[var(--color-base)] border border-[var(--color-borde)] flex items-center justify-center">
                                <stat.Icon size={14} strokeWidth={1.5} className="text-[var(--color-texto-2)]" />
                            </div>
                        </div>
                        <p className="text-3xl font-semibold text-[var(--color-texto-1)] tracking-tight leading-none mb-1">
                            {stat.valor}
                        </p>
                        <p className="text-xs text-[var(--color-texto-3)]">
                            {stat.subtexto}
                        </p>
                    </div>
                ))}
            </div>

            {/* Acciones Rápidas: Grid de Comandos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                {acciones.map((accion) => (
                    <Link
                        key={accion.href}
                        href={accion.href}
                        className="group flex items-center gap-3 p-3.5 bg-white border border-[var(--color-borde)] rounded-xl transition-all duration-200 hover:shadow-[var(--shadow-hover)] hover:border-[var(--color-borde)] hover:-translate-y-0.5"
                    >
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-[var(--color-base)] border border-[var(--color-borde)] group-hover:bg-[var(--color-matcha-light)] group-hover:border-[var(--color-matcha)]/30 transition-colors duration-200">
                            <accion.Icon
                                size={15}
                                strokeWidth={1.5}
                                className="text-[var(--color-texto-2)] group-hover:text-[var(--color-matcha)] transition-colors duration-200"
                            />
                        </div>
                        <div>
                            <p className="text-[13px] font-medium text-[var(--color-texto-1)] leading-tight">
                                {accion.label}
                            </p>
                            <p className="text-[11px] text-[var(--color-texto-3)] leading-tight mt-0.5">
                                {accion.sublabel}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* DATA TABLE de productos recientes */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-[var(--color-texto-1)] tracking-tight">
                        Productos recientes
                    </h2>
                    <Link href="/admin/productos" className="text-xs text-[var(--color-texto-3)] hover:text-[var(--color-texto-1)] transition-colors duration-150">
                        Ver todos →
                    </Link>
                </div>

                <div className="bg-white border border-[var(--color-borde)] rounded-xl overflow-hidden shadow-[var(--shadow-card)]">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--color-borde)]">
                                <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-[var(--color-texto-3)]">
                                    Producto
                                </th>
                                <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-[var(--color-texto-3)] hidden sm:table-cell">
                                    Categoría
                                </th>
                                <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-[var(--color-texto-3)]">
                                    Precio
                                </th>
                                <th className="text-left px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-[var(--color-texto-3)]">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {productosRecientes.map((producto, index) => (
                                <tr
                                    key={producto.id}
                                    className={`transition-colors duration-150 hover:bg-[var(--color-base)] ${index < productosRecientes.length - 1 ? 'border-b border-[var(--color-borde)]' : ''}`}
                                >
                                    {/* Miniatura + nombre */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-[4px] overflow-hidden flex-shrink-0 bg-[var(--color-base)] border border-[var(--color-borde)] relative">
                                                {producto.imagen_url
                                                    ? <Image src={producto.imagen_url} alt={producto.nombre} fill sizes="36px" className="object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center">
                                                        <Package size={14} className="text-[var(--color-texto-3)]" strokeWidth={1.5} />
                                                    </div>
                                                }
                                            </div>
                                            <span className="text-[13px] font-medium text-[var(--color-texto-1)] truncate max-w-[140px]">
                                                {producto.nombre}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Categoría */}
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className="text-[12px] text-[var(--color-texto-2)]">
                                            {getNombreCategoria(producto.categoria_id)}
                                        </span>
                                    </td>

                                    {/* Precio */}
                                    <td className="px-4 py-3">
                                        <span className="text-[13px] font-medium text-[var(--color-texto-1)]">
                                            {producto.tiene_variantes ? 'Variable' : formatearPrecio(producto.precio ?? 0)}
                                        </span>
                                    </td>

                                    {/* Estado */}
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1.5 text-[12px] font-medium">
                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${producto.esta_disponible ? 'bg-[var(--color-matcha)]' : 'bg-[var(--color-texto-3)]'}`} />
                                            <span className={producto.esta_disponible ? 'text-[var(--color-matcha)]' : 'text-[var(--color-texto-3)]'}>
                                                {producto.esta_disponible ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
