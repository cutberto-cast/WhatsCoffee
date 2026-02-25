'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { formatearPrecio } from '@/lib/utils/formatearPrecio';
import type { Producto, Categoria } from '@/types';

export default function AdminProductosPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [cargando, setCargando] = useState(true);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
    const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);
    const [filtroCategoria, setFiltroCategoria] = useState<string>('');
    const [busqueda, setBusqueda] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);

    const [form, setForm] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        imagen_url: '',
        categoria_id: '',
        esta_disponible: true,
    });

    const supabase = createClient();

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const [resProd, resCat] = await Promise.all([
            supabase.from('productos').select('*').order('creado_en', { ascending: false }),
            supabase.from('categorias').select('*').order('orden'),
        ]);

        if (resProd.data) setProductos(resProd.data);
        if (resCat.data) setCategorias(resCat.data);
        setCargando(false);
    }, [supabase]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const productosFiltrados = productos.filter((p) => {
        const coincideCategoria = !filtroCategoria || p.categoria_id === filtroCategoria;
        const coincideBusqueda = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase());
        return coincideCategoria && coincideBusqueda;
    });

    const abrirCrear = () => {
        setProductoEditando(null);
        setForm({
            nombre: '',
            descripcion: '',
            precio: '',
            imagen_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
            categoria_id: categorias[0]?.id ?? '',
            esta_disponible: true,
        });
        setModalAbierto(true);
    };

    const abrirEditar = (producto: Producto) => {
        setProductoEditando(producto);
        setForm({
            nombre: producto.nombre,
            descripcion: producto.descripcion,
            precio: producto.precio.toString(),
            imagen_url: producto.imagen_url,
            categoria_id: producto.categoria_id,
            esta_disponible: producto.esta_disponible,
        });
        setModalAbierto(true);
    };

    const handleSubirImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const archivo = e.target.files[0] as File;
        const extension = archivo.name.split('.').pop();
        const nombreArchivo = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${extension}`;

        setSubiendoImagen(true);

        try {
            const { data, error } = await supabase.storage
                .from('imagenes')
                .upload(`productos/${nombreArchivo}`, archivo, { cacheControl: '3600', upsert: false });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('imagenes')
                .getPublicUrl(`productos/${nombreArchivo}`);

            setForm((prev) => ({ ...prev, imagen_url: publicUrl }));
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            alert('Hubo un error al subir la imagen. Intenta nuevamente.');
        } finally {
            setSubiendoImagen(false);
        }
    };

    const handleGuardar = async () => {
        if (!form.nombre || !form.precio || !form.categoria_id) return;
        setGuardando(true);

        const datos = {
            nombre: form.nombre,
            descripcion: form.descripcion,
            precio: parseFloat(form.precio),
            imagen_url: form.imagen_url,
            categoria_id: form.categoria_id,
            esta_disponible: form.esta_disponible,
        };

        if (productoEditando) {
            const { error } = await supabase.from('productos').update(datos).eq('id', productoEditando.id);
            if (!error) {
                setProductos(productos.map(p => p.id === productoEditando.id ? { ...p, ...datos } : p));
            }
        } else {
            const { data, error } = await supabase.from('productos').insert(datos).select().single();
            if (!error && data) {
                setProductos([data, ...productos]);
            }
        }

        setGuardando(false);
        setModalAbierto(false);
    };

    const handleEliminar = async (id: string) => {
        const { error } = await supabase.from('productos').delete().eq('id', id);
        if (!error) {
            setProductos(productos.filter(p => p.id !== id));
        }
        setConfirmarEliminar(null);
    };

    const toggleDisponibilidad = async (producto: Producto) => {
        // Actualización optimista
        const nuevoEstado = !producto.esta_disponible;
        setProductos(productos.map(p => p.id === producto.id ? { ...p, esta_disponible: nuevoEstado } : p));

        const { error } = await supabase.from('productos').update({ esta_disponible: nuevoEstado }).eq('id', producto.id);
        if (error) {
            // Revertir si hay error
            setProductos(productos.map(p => p.id === producto.id ? { ...p, esta_disponible: producto.esta_disponible } : p));
        }
    };

    const getNombreCategoria = (id: string): string => {
        return categorias.find((c) => c.id === id)?.nombre ?? 'Sin categoría';
    };

    if (cargando) {
        return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
                    <p className="text-gray-500 text-sm">{productos.length} productos en total</p>
                </div>
                <button onClick={abrirCrear} className="bg-cafe-600 hover:bg-cafe-700 text-white font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Nuevo Producto
                </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Buscar productos..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400" />
                <select value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400">
                    <option value="">Todas las categorías</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Categoría</th>
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</th>
                                <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {productosFiltrados.map((producto) => (
                                <tr key={producto.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-cafe-50 flex-shrink-0">
                                                {producto.imagen_url ? (
                                                    <Image src={producto.imagen_url} alt={producto.nombre} fill className="object-cover" sizes="44px" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center"><svg className="w-5 h-5 text-cafe-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">{producto.nombre}</p>
                                                <p className="text-gray-400 text-xs truncate max-w-[200px]">{producto.descripcion}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 hidden sm:table-cell">
                                        <span className="text-xs bg-cafe-50 text-cafe-600 px-2.5 py-1 rounded-full font-medium">{getNombreCategoria(producto.categoria_id)}</span>
                                    </td>
                                    <td className="px-5 py-3"><span className="font-semibold text-gray-900 text-sm">{formatearPrecio(producto.precio)}</span></td>
                                    <td className="px-5 py-3 text-center">
                                        <button
                                            onClick={() => toggleDisponibilidad(producto)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${producto.esta_disponible ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${producto.esta_disponible ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => abrirEditar(producto)} className="p-2 hover:bg-cafe-50 rounded-lg transition-colors text-cafe-500"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                            <button onClick={() => setConfirmarEliminar(producto.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-400"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {productosFiltrados.length === 0 && <div className="text-center py-12"><p className="text-gray-400 text-sm">No se encontraron productos</p></div>}
            </div>

            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-lg font-semibold text-gray-900">{productoEditando ? 'Editar Producto' : 'Nuevo Producto'}</h3>
                            <button onClick={() => setModalAbierto(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                        </div>
                        <div className="p-6 space-y-4">
                            {form.imagen_url && (
                                <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gray-100">
                                    <Image src={form.imagen_url} alt="Preview" fill className="object-cover" sizes="480px" />
                                </div>
                            )}
                            <div><label className="block text-xs font-medium text-gray-500 mb-1">Nombre *</label><input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400" /></div>
                            <div><label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label><textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400 resize-none" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-medium text-gray-500 mb-1">Precio (MXN) *</label><input type="number" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400" min="0" step="0.5" /></div>
                                <div><label className="block text-xs font-medium text-gray-500 mb-1">Categoría *</label>
                                    <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400">
                                        <option value="" disabled>Seleccione categoría</option>
                                        {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Imagen del producto</label>
                                <div>
                                    <label className="w-full cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-center transition-colors flex items-center justify-center gap-2">
                                        {subiendoImagen ? (
                                            <div className="w-4 h-4 border-2 border-cafe-600/30 border-t-cafe-600 rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                <span className="text-gray-600 font-medium">Subir imagen</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleSubirImagen} disabled={subiendoImagen} />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">
                                    Proporción recomendada: 1:1 · Mínimo 600×600px · PNG o JPG
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={() => setForm({ ...form, esta_disponible: !form.esta_disponible })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.esta_disponible ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${form.esta_disponible ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm text-gray-600">{form.esta_disponible ? 'Disponible' : 'No disponible'}</span>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 px-6 py-4 flex gap-3">
                            <button onClick={() => setModalAbierto(false)} className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium">Cancelar</button>
                            <button onClick={handleGuardar} disabled={!form.nombre || !form.precio || !form.categoria_id || guardando} className="flex-1 px-4 py-2.5 bg-cafe-600 hover:bg-cafe-700 disabled:opacity-50 flex justify-center items-center text-white rounded-xl text-sm font-medium">{guardando ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (productoEditando ? 'Guardar Cambios' : 'Crear Producto')}</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmarEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmarEliminar(null)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-scale-in text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Eliminar producto?</h3>
                        <p className="text-gray-500 text-sm mb-6">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmarEliminar(null)} className="flex-1 px-4 py-2.5 text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium">Cancelar</button>
                            <button onClick={() => handleEliminar(confirmarEliminar)} className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
