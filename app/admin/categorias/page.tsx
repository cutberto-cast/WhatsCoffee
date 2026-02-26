'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Categoria, Producto, MacroCategoria } from '@/types';

export default function AdminCategoriasPage() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [cargando, setCargando] = useState(true);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState<Categoria | null>(null);
    const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [form, setForm] = useState({ nombre: '', icono: '', orden: '1', macro_categoria: 'dulces' as MacroCategoria });

    const supabase = createClient();

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const [resCat, resProd] = await Promise.all([
            supabase.from('categorias').select('*').order('orden'),
            supabase.from('productos').select('categoria_id'),
        ]);
        if (resCat.data) setCategorias(resCat.data);
        if (resProd.data) setProductos(resProd.data as any[]); // Solo necesitamos contar IDs
        setCargando(false);
    }, [supabase]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const abrirCrear = () => {
        setEditando(null);
        setForm({ nombre: '', icono: '', orden: String(categorias.length + 1), macro_categoria: 'dulces' as MacroCategoria });
        setModalAbierto(true);
    };

    const abrirEditar = (cat: Categoria) => {
        setEditando(cat);
        setForm({ nombre: cat.nombre, icono: cat.icono ?? '', orden: String(cat.orden), macro_categoria: cat.macro_categoria ?? 'dulces' });
        setModalAbierto(true);
    };

    const handleGuardar = async () => {
        if (!form.nombre) return;
        setGuardando(true);
        const datos = { nombre: form.nombre, icono: form.icono || null, orden: parseInt(form.orden) || 1, macro_categoria: form.macro_categoria };

        if (editando) {
            const { error } = await supabase.from('categorias').update(datos).eq('id', editando.id);
            if (!error) setCategorias(categorias.map(c => c.id === editando.id ? { ...c, ...datos } : c));
        } else {
            const { data, error } = await supabase.from('categorias').insert(datos).select().single();
            if (!error && data) setCategorias([...categorias, data].sort((a, b) => a.orden - b.orden));
        }

        setGuardando(false);
        setModalAbierto(false);
    };

    const handleEliminar = async (id: string) => {
        const { error } = await supabase.from('categorias').delete().eq('id', id);
        if (!error) setCategorias(categorias.filter(c => c.id !== id));
        setConfirmarEliminar(null);
    };

    const contarProductos = (catId: string): number => {
        return productos.filter((p) => p.categoria_id === catId).length;
    };

    if (cargando) return <div className="animate-pulse"><div className="h-8 bg-[var(--color-borde)] rounded w-48" /></div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--color-texto-1)] tracking-tight">Categorías</h1>
                    <p className="text-[13px] text-[var(--color-texto-3)]">{categorias.length} categorías configuradas</p>
                </div>
                <button onClick={abrirCrear} className="bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)] text-white font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    Nueva Categoría
                </button>
            </div>

            <div className="grid gap-3">
                {categorias.map((cat) => (
                    <div key={cat.id} className="bg-white border border-[var(--color-borde)] rounded-xl py-3 px-4 shadow-[var(--shadow-card)] flex items-center gap-4 hover:shadow-[var(--shadow-hover)] transition-shadow">
                        <div className="w-11 h-11 bg-[var(--color-base)] border border-[var(--color-borde)] rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                            {cat.icono || '📁'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-[14px] text-[var(--color-texto-1)]">{cat.nombre}</h3>
                                <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium border
                                    ${cat.macro_categoria === 'dulces'
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : cat.macro_categoria === 'bebidas'
                                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                                            : cat.macro_categoria === 'salados'
                                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                                : 'bg-[var(--color-matcha-light)] text-[var(--color-matcha)] border-[var(--color-matcha)]/30'
                                    }`}>
                                    {cat.macro_categoria}
                                </span>
                            </div>
                            <p className="text-[var(--color-texto-3)] text-xs mt-0.5">{contarProductos(cat.id)} productos · Orden: {cat.orden}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => abrirEditar(cat)} className="p-2 hover:bg-[var(--color-base)] rounded-lg transition-colors text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)]"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                            <button onClick={() => setConfirmarEliminar(cat.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                    </div>
                ))}
                {categorias.length === 0 && <div className="text-center py-10 bg-[var(--color-base)] rounded-xl border-2 border-dashed border-[var(--color-borde)]"><p className="text-[var(--color-texto-3)] text-[13px]">Aún no hay categorías creadas</p></div>}
            </div>

            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[var(--color-espresso-dark)]/40 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-md shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in">
                        <div className="border-b border-[var(--color-borde)] px-6 py-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-[var(--color-texto-1)]">{editando ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
                            <button onClick={() => setModalAbierto(false)} className="text-[var(--color-texto-3)] hover:text-[var(--color-texto-1)] transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Nombre *</label><input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Ícono (emoji)</label><input type="text" value={form.icono} onChange={(e) => setForm({ ...form, icono: e.target.value })} className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all" /></div>
                                <div><label className="block text-xs font-medium text-[var(--color-texto-2)] mb-1.5">Orden</label><input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all" min="1" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-texto-1)] mb-1.5">Sección del menú (Macro)*</label>
                                <select
                                    value={form.macro_categoria}
                                    onChange={(e) => setForm({ ...form, macro_categoria: e.target.value as MacroCategoria })}
                                    className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all"
                                >
                                    <option value="dulces">🍰 Dulces</option>
                                    <option value="bebidas">🥤 Bebidas</option>
                                    <option value="salados">🍔 Salados</option>
                                    <option value="combos">🎁 Combos</option>
                                </select>
                                <p className="text-[11px] text-[var(--color-texto-3)] mt-1.5">Define la pestaña principal en el menú del cliente.</p>
                            </div>
                        </div>
                        <div className="border-t border-[var(--color-borde)] px-6 py-4 flex gap-3">
                            <button onClick={() => setModalAbierto(false)} className="flex-1 bg-white border border-[var(--color-borde)] text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)] hover:bg-[var(--color-base)] shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all">Cancelar</button>
                            <button onClick={handleGuardar} disabled={!form.nombre || guardando} className="flex-1 bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)] disabled:opacity-50 flex items-center justify-center text-white shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all">
                                {guardando ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editando ? 'Guardar Cambios' : 'Crear Categoría')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmarEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[var(--color-espresso-dark)]/40 backdrop-blur-sm" onClick={() => setConfirmarEliminar(null)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in text-center">
                        <h3 className="text-lg font-semibold text-[var(--color-texto-1)] mb-2">¿Eliminar categoría?</h3>
                        <p className="text-[var(--color-texto-3)] text-[13px] mb-6">Los productos asociados quedarán huérfanos sin categoría.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmarEliminar(null)} className="flex-1 bg-white border border-[var(--color-borde)] text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)] hover:bg-[var(--color-base)] shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all">Cancelar</button>
                            <button onClick={() => handleEliminar(confirmarEliminar)} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
