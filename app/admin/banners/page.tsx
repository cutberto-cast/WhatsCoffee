'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Banner, Producto } from '@/types';

export default function AdminBannersPage() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [cargando, setCargando] = useState(true);

    const [productos, setProductos] = useState<Producto[]>([]);
    const [productosVinculadosList, setProductosVinculadosList] = useState<Record<string, string[]>>({}); // bannerId -> [productoId, ...]

    const [modalAbierto, setModalAbierto] = useState(false);
    const [tipoFormulario, setTipoFormulario] = useState<'construir' | 'subir' | null>(null);
    const [editando, setEditando] = useState<Banner | null>(null);
    const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [subiendoFondo, setSubiendoFondo] = useState(false);

    const [form, setForm] = useState({
        titulo: '',
        descripcion: '',
        imagen_url: '',
        imagen_fondo_completo_url: '',
        fondo_seleccionado: 'fondo1' as 'fondo1' | 'fondo2',
        activo: true,
        orden: '1',
        productos_vinculados: [] as string[],
    });

    const supabase = createClient();

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const { data: bData } = await supabase.from('banners').select('*').order('orden');
        const { data: pData } = await supabase.from('productos').select('id, nombre, esta_disponible').order('nombre');

        // Intentar cargar banner_productos. Si la tabla no existe, data será null
        const { data: bpData } = await supabase.from('banner_productos').select('*');

        if (bData) setBanners(bData);
        if (pData) setProductos(pData as any);
        if (bpData) {
            const vinculados: Record<string, string[]> = {};
            (bpData || []).forEach((bp: any) => {
                if (!vinculados[bp.banner_id]) vinculados[bp.banner_id] = [];
                vinculados[bp.banner_id]!.push(bp.producto_id);
            });
            setProductosVinculadosList(vinculados);
        }
        setCargando(false);
    }, [supabase]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const abrirConstruir = () => {
        setEditando(null);
        setTipoFormulario('construir');
        setForm({
            titulo: '',
            descripcion: '',
            imagen_url: '',
            imagen_fondo_completo_url: '',
            fondo_seleccionado: 'fondo1',
            activo: true,
            orden: String(banners.length + 1),
            productos_vinculados: [],
        });
        setModalAbierto(true);
    };

    const abrirSubir = () => {
        setEditando(null);
        setTipoFormulario('subir');
        setForm({
            titulo: '',
            descripcion: '',
            imagen_url: '',
            imagen_fondo_completo_url: '',
            fondo_seleccionado: 'fondo1',
            activo: true,
            orden: String(banners.length + 1),
            productos_vinculados: [],
        });
        setModalAbierto(true);
    };

    const abrirEditar = (banner: Banner) => {
        setEditando(banner);
        setTipoFormulario(banner.imagen_fondo_completo_url ? 'subir' : 'construir');
        setForm({
            titulo: banner.titulo,
            descripcion: banner.descripcion,
            imagen_url: banner.imagen_url,
            imagen_fondo_completo_url: banner.imagen_fondo_completo_url || '',
            fondo_seleccionado: banner.fondo_seleccionado || 'fondo1',
            activo: banner.activo,
            orden: String(banner.orden),
            productos_vinculados: productosVinculadosList[banner.id] || [],
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
                .upload(`banners/${nombreArchivo}`, archivo, { cacheControl: '3600', upsert: false });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('imagenes')
                .getPublicUrl(`banners/${nombreArchivo}`);

            setForm((prev) => ({ ...prev, imagen_url: publicUrl }));
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            alert('Hubo un error al subir la imagen. Intenta nuevamente.');
        } finally {
            setSubiendoImagen(false);
        }
    };

    const handleSubirFondoCompleto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const archivo = e.target.files[0] as File;
        const extension = archivo.name.split('.').pop();
        const nombreArchivo = `full_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${extension}`;
        setSubiendoFondo(true);
        try {
            const { error } = await supabase.storage.from('imagenes').upload(`banners/${nombreArchivo}`, archivo, { cacheControl: '3600', upsert: false });
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from('imagenes').getPublicUrl(`banners/${nombreArchivo}`);
            setForm((prev) => ({ ...prev, imagen_fondo_completo_url: publicUrl }));
        } catch (error) {
            console.error('Error al subir la imagen completa:', error);
            alert('Hubo un error al subir el banner. Intenta nuevamente.');
        } finally {
            setSubiendoFondo(false);
        }
    };

    const handleGuardar = async () => {
        if (tipoFormulario === 'construir') {
            if (!form.titulo) {
                alert('Debes definir el título del banner.');
                return;
            }
        } else if (tipoFormulario === 'subir') {
            if (!form.imagen_fondo_completo_url) {
                alert('Debes subir la imagen del banner completo.');
                return;
            }
        }

        setGuardando(true);

        const datos = tipoFormulario === 'construir' ? {
            titulo: form.titulo,
            descripcion: form.descripcion || '',
            imagen_url: form.imagen_url || '',
            imagen_fondo_completo_url: null,
            fondo_seleccionado: form.fondo_seleccionado,
            activo: form.activo,
            orden: parseInt(form.orden) || 1,
        } : {
            titulo: '',
            descripcion: '',
            imagen_url: '',
            imagen_fondo_completo_url: form.imagen_fondo_completo_url,
            fondo_seleccionado: null,
            activo: form.activo,
            orden: parseInt(form.orden) || 1,
        };

        let bannerId = editando?.id;

        try {
            if (editando) {
                const { error } = await supabase.from('banners').update(datos).eq('id', editando.id);
                if (error) throw error;
                setBanners(banners.map(b => b.id === editando.id ? { ...b, ...datos } : b).sort((a, b) => a.orden - b.orden));
            } else {
                const { data, error } = await supabase.from('banners').insert(datos).select().single();
                if (error) throw error;
                if (data) {
                    bannerId = data.id;
                    setBanners([...banners, data].sort((a, b) => a.orden - b.orden));
                }
            }

            // Actualizar productos vinculados (borrar los viejos y recrear si existe la tabla)
            if (bannerId) {
                await supabase.from('banner_productos').delete().eq('banner_id', bannerId);
                if (form.productos_vinculados.length > 0) {
                    const inserts = form.productos_vinculados.map(prodId => ({
                        banner_id: bannerId,
                        producto_id: prodId
                    }));
                    await supabase.from('banner_productos').insert(inserts);

                    setProductosVinculadosList(prev => ({
                        ...prev,
                        [bannerId!]: form.productos_vinculados
                    }));
                } else {
                    setProductosVinculadosList(prev => ({
                        ...prev,
                        [bannerId!]: []
                    }));
                }
            }
        } catch (err) {
            console.error(err);
            alert('Error al guardar el banner');
        }

        setGuardando(false);
        setModalAbierto(false);
    };

    const handleEliminar = async (id: string) => {
        const { error } = await supabase.from('banners').delete().eq('id', id);
        if (!error) {
            setBanners(banners.filter(b => b.id !== id));
        }
        setConfirmarEliminar(null);
    };

    const toggleActivo = async (banner: Banner) => {
        const nuevoEstado = !banner.activo;
        setBanners(banners.map(b => b.id === banner.id ? { ...b, activo: nuevoEstado } : b));

        const { error } = await supabase.from('banners').update({ activo: nuevoEstado }).eq('id', banner.id);
        if (error) {
            setBanners(banners.map(b => b.id === banner.id ? { ...b, activo: banner.activo } : b));
        }
    };

    if (cargando) {
        return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--color-texto-1)] tracking-tight">Banners Promocionales</h1>
                    <p className="text-[13px] text-[var(--color-texto-3)]">{banners.length} banners configurados</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-3">
                        <button onClick={abrirConstruir} className="bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)] text-white shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" /><path d="m14 7 3 3" /><path d="M5 6v4" /><path d="M19 14v4" /><path d="M10 2v2" /><path d="M7 8H3" /><path d="M21 16h-4" /><path d="M11 3H9" /></svg>
                            Construir banner
                        </button>
                        <button onClick={abrirSubir} className="bg-white border border-[var(--color-borde)] text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)] hover:bg-[var(--color-base)] shadow-sm rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2">
                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                            Subir banner
                        </button>
                    </div>
                    <p className="text-xs text-[var(--color-texto-3)] mt-1">
                        Construir: elige fondo y personaliza el texto. Subir: usa un banner que ya tienes listo.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {banners.map((banner) => {
                    const isFullImage = !!banner.imagen_fondo_completo_url;
                    const prodCount = (productosVinculadosList[banner.id] || []).length;
                    return (
                        <div key={banner.id} className="bg-white border border-[var(--color-borde)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden transition-shadow hover:shadow-[var(--shadow-hover)]">
                            <div className={`relative h-48 sm:h-64 md:h-72 w-full flex items-center ${!banner.activo && 'opacity-60 grayscale'}`} style={{
                                backgroundImage: isFullImage ? `url(${banner.imagen_fondo_completo_url})` : `url(/images/fondos/${banner.fondo_seleccionado || 'fondo1'}.jpg)`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}>
                                {!isFullImage && (
                                    <div className="absolute inset-0 flex">
                                        <div className="w-[60%] h-full p-6 flex flex-col justify-center">
                                            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{banner.titulo}</h2>
                                            <p className="text-white/90 text-sm sm:text-base max-w-2xl">{banner.descripcion}</p>
                                        </div>
                                        <div className="w-[40%] h-full relative">
                                            <Image src={banner.imagen_url || ''} alt={banner.titulo} fill className="object-contain p-4" sizes="(max-width: 768px) 40vw, 300px" />
                                        </div>
                                    </div>
                                )}
                                {isFullImage && (
                                    <div className="absolute inset-0 p-6 flex flex-col justify-center bg-black/20">
                                        {banner.titulo && <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{banner.titulo}</h2>}
                                        {banner.descripcion && <p className="text-white text-sm sm:text-base max-w-2xl" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{banner.descripcion}</p>}
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-[var(--color-acento)] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">Orden: {banner.orden}</span>
                                    {isFullImage ? (
                                        <span className="bg-gray-100 text-[var(--color-texto-2)] text-xs font-bold px-3 py-1 rounded-full shadow-md">Personalizado</span>
                                    ) : (
                                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-md">Construido</span>
                                    )}
                                    {prodCount > 0 && <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">{prodCount} linkeados</span>}
                                </div>
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    <button onClick={() => abrirEditar(banner)} className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-lg text-white transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => setConfirmarEliminar(banner.id)} className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-lg text-red-300 transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="px-6 py-4 flex items-center justify-between bg-[var(--color-base)] border-t border-[var(--color-borde)]">
                                <span className="text-sm font-medium text-[var(--color-texto-2)]">Estado del banner en la tienda:</span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-sm font-semibold ${banner.activo ? 'text-green-600' : 'text-[var(--color-texto-3)]'}`}>{banner.activo ? 'Mostrando' : 'Oculto'}</span>
                                    <button onClick={() => toggleActivo(banner)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${banner.activo ? 'bg-[var(--color-matcha)]' : 'bg-[var(--color-borde)]'}`}>
                                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${banner.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {banners.length === 0 && <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100"><p className="text-[var(--color-texto-3)]">Aún no hay banners configurados</p></div>}
            </div>

            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[var(--color-espresso-dark)]/40 backdrop-blur-sm" onClick={() => setModalAbierto(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in">
                        <h3 className="text-lg font-semibold text-[var(--color-texto-1)] mb-4 px-6 pt-6 text-center border-b border-gray-100 pb-4">
                            {editando ? (tipoFormulario === 'construir' ? 'Editar banner construido' : 'Editar banner subido') : (tipoFormulario === 'construir' ? 'Construir nuevo banner' : 'Subir nuevo banner')}
                        </h3>
                        <div className="px-6 pb-6 space-y-5 pt-2">
                            {tipoFormulario === 'construir' ? (
                                // --- FORMULARIO CONSTRUIR --- //
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-texto-2)] mb-1">Título *</label>
                                        <input type="text" value={form.titulo || ''} onChange={(e) => setForm({ ...form, titulo: e.target.value.substring(0, 60) })} placeholder="Ej: Nueva Mega Burger" className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all" />
                                        <p className="text-right text-xs text-[var(--color-texto-3)] mt-1">{(form.titulo || '').length}/60</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-texto-2)] mb-1">Descripción (opcional)</label>
                                        <textarea value={form.descripcion || ''} onChange={(e) => setForm({ ...form, descripcion: e.target.value.substring(0, 120) })} rows={2} placeholder="Ej: Disponible solo esta semana" className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all resize-none" />
                                        <p className="text-right text-xs text-[var(--color-texto-3)] mt-1">{(form.descripcion || '').length}/120</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-texto-2)] mb-1">Imagen del producto (opcional)</label>
                                        {form.imagen_url && (
                                            <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-[var(--color-base)] border border-[var(--color-borde)] mb-2">
                                                <Image src={form.imagen_url} alt="Preview" fill className="object-contain p-2" sizes="100px" />
                                                <button onClick={() => setForm({ ...form, imagen_url: '' })} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm text-red-500 hover:bg-red-50"><svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            </div>
                                        )}
                                        <label className="block w-full cursor-pointer bg-[var(--color-base)] hover:bg-gray-100 border border-[var(--color-borde)] rounded-xl px-4 py-2.5 text-sm text-center transition-colors flex items-center justify-center gap-2">
                                            {subiendoImagen ? (
                                                <div className="w-4 h-4 border-2 border-[var(--color-espresso)]/30 border-t-cafe-600 rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <svg className="w-4 h-4 text-[var(--color-texto-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                    <span className="text-[var(--color-texto-2)] font-medium">Seleccionar imagen</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/svg+xml, image/png, image/jpeg, image/webp" className="hidden" onChange={handleSubirImagen} disabled={subiendoImagen} />
                                        </label>
                                        <p className="text-xs text-[var(--color-texto-3)] mt-1">
                                            Recomendamos SVG o PNG sin fondo · Tamaño ideal: 400×400px (1:1)
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-texto-2)] mb-2">Fondo del banner</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`cursor-pointer border-2 rounded-xl overflow-hidden relative ${form.fondo_seleccionado === 'fondo1' ? 'border-[var(--color-espresso)] ring-2 ring-[var(--color-espresso)]/20' : 'border-[var(--color-borde)] hover:border-[var(--color-espresso)]'}`}>
                                                <input type="radio" name="fondo" value="fondo1" checked={form.fondo_seleccionado === 'fondo1'} onChange={() => setForm({ ...form, fondo_seleccionado: 'fondo1' })} className="hidden" />
                                                <div className="h-20 w-full relative"><Image src="/images/fondos/fondo1.jpg" alt="Fondo 1" fill className="object-cover" sizes="200px" /></div>
                                                <div className="p-2 text-center text-xs font-medium text-[var(--color-texto-2)] bg-white">Fondo 1</div>
                                            </label>
                                            <label className={`cursor-pointer border-2 rounded-xl overflow-hidden relative ${form.fondo_seleccionado === 'fondo2' ? 'border-[var(--color-espresso)] ring-2 ring-[var(--color-espresso)]/20' : 'border-[var(--color-borde)] hover:border-[var(--color-espresso)]'}`}>
                                                <input type="radio" name="fondo" value="fondo2" checked={form.fondo_seleccionado === 'fondo2'} onChange={() => setForm({ ...form, fondo_seleccionado: 'fondo2' })} className="hidden" />
                                                <div className="h-20 w-full relative"><Image src="/images/fondos/fondo2.jpg" alt="Fondo 2" fill className="object-cover" sizes="200px" /></div>
                                                <div className="p-2 text-center text-xs font-medium text-[var(--color-texto-2)] bg-white">Fondo 2</div>
                                            </label>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                // --- FORMULARIO SUBIR --- //
                                <>
                                    <div className="bg-[var(--color-base)] px-4 py-3 rounded-xl border border-[var(--color-borde)]">
                                        <p className="text-sm text-[var(--color-texto-2)] leading-relaxed">
                                            Sube una imagen que ya tengas lista (creada en Canva, con tu diseñador, etc.). La imagen ocupará todo el espacio del banner.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-texto-2)] mb-1">Imagen del banner *</label>
                                        {form.imagen_fondo_completo_url && (
                                            <div className="relative w-full aspect-[5/1] rounded-xl overflow-hidden bg-[var(--color-base)] border border-[var(--color-borde)] mb-3 grayscale-0">
                                                <Image src={form.imagen_fondo_completo_url} alt="Preview" fill className="object-cover" sizes="500px" />
                                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                    <span className="bg-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">Aspecto final 5:1</span>
                                                </div>
                                                <button onClick={() => setForm({ ...form, imagen_fondo_completo_url: '' })} className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-sm text-red-500 hover:bg-red-50"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                                            </div>
                                        )}
                                        <label className="block w-full cursor-pointer bg-[var(--color-base)] hover:bg-gray-100 border border-[var(--color-borde)] rounded-xl px-4 py-3 text-sm text-center transition-colors flex items-center justify-center gap-2 border-dashed">
                                            {subiendoFondo ? (
                                                <div className="w-5 h-5 border-2 border-[var(--color-espresso)]/30 border-t-cafe-600 rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <svg className="w-5 h-5 text-[var(--color-texto-3)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                                    <span className="text-[var(--color-texto-2)] font-medium">Seleccionar imagen del banner</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleSubirFondoCompleto} disabled={subiendoFondo} />
                                        </label>
                                        <p className="text-xs text-[var(--color-texto-3)] mt-2 text-center">Tamaño recomendado: 800 x 160px o proporción 5:1</p>
                                    </div>
                                </>
                            )}

                            {/* --- SECCIÓN COMPARTIDA --- */}
                            <div className="border border-[var(--color-borde)] rounded-xl p-4 bg-[var(--color-base)] mt-4">
                                <label className="block text-sm font-semibold text-[var(--color-texto-2)] mb-1">
                                    {tipoFormulario === 'construir' ? 'Productos vinculados (opcional)' : '¿Este banner promociona productos específicos? (opcional)'}
                                </label>
                                <p className="text-xs text-[var(--color-texto-3)] mb-3">El cliente verá estos productos al tocar el banner.</p>
                                <div className="max-h-40 overflow-y-auto bg-white border border-[var(--color-borde)] rounded-lg p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {productos.map(p => (
                                        <label key={p.id} className="flex items-center gap-2 text-sm p-1.5 hover:bg-[var(--color-base)] rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.productos_vinculados.includes(p.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setForm({ ...form, productos_vinculados: [...form.productos_vinculados, p.id] });
                                                    } else {
                                                        setForm({ ...form, productos_vinculados: form.productos_vinculados.filter(id => id !== p.id) });
                                                    }
                                                }}
                                                className="rounded text-[var(--color-texto-1)] focus:ring-cafe-500 w-4 h-4"
                                            />
                                            <span className="truncate flex-1">{p.nombre}</span>
                                        </label>
                                    ))}
                                    {productos.length === 0 && <span className="text-xs text-[var(--color-texto-3)] p-2">No hay productos disponibles</span>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div><label className="block text-xs font-medium text-[var(--color-texto-3)] mb-1">Orden de aparición</label><input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all" min="1" /></div>
                                <div className="flex items-center justify-between pt-6 border border-[var(--color-borde)] rounded-xl px-4 bg-white">
                                    <span className="text-sm font-semibold text-[var(--color-texto-2)]">Estado</span>
                                    <button onClick={() => setForm({ ...form, activo: !form.activo })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.activo ? 'bg-[var(--color-matcha)]' : 'bg-[var(--color-borde)]'}`}>
                                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${form.activo ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-[var(--color-borde)] px-6 py-4 flex gap-3 rounded-b-xl bg-[var(--color-base)]">
                            <button onClick={() => setModalAbierto(false)} className="flex-1 px-4 py-2.5 text-[var(--color-texto-2)] hover:bg-gray-100 border border-[var(--color-borde)] rounded-xl text-sm font-semibold bg-white shadow-sm transition-colors">Cancelar</button>
                            <button
                                onClick={handleGuardar}
                                disabled={guardando || (tipoFormulario === 'construir' && !form.titulo) || (tipoFormulario === 'subir' && !form.imagen_fondo_completo_url)}
                                className="flex-1 bg-[var(--color-acento)] hover:bg-[var(--color-acento-hover)] disabled:opacity-50 flex justify-center items-center text-white rounded-lg px-4 py-2 text-sm font-medium transition-all shadow-sm"
                            >
                                {guardando ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editando ? 'Guardar Cambios' : 'Crear Banner')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {confirmarEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[var(--color-espresso-dark)]/40 backdrop-blur-sm" onClick={() => setConfirmarEliminar(null)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in text-center text-center">
                        <h3 className="text-lg font-semibold text-[var(--color-texto-1)] mb-2">¿Eliminar banner?</h3>
                        <p className="text-[13px] text-[var(--color-texto-3)] mb-6">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmarEliminar(null)} className="flex-1 px-4 py-2.5 text-[var(--color-texto-2)] hover:bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl text-sm font-medium">Cancelar</button>
                            <button onClick={() => handleEliminar(confirmarEliminar)} className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
