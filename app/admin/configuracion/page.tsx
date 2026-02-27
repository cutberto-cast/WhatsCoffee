'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminConfiguracionPage() {
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [exito, setExito] = useState(false);

    const [form, setForm] = useState({
        id: '',
        nombre_negocio: '',
        telefono_whatsapp: '',
        logo_url: '',
        color_primario: '#4A2C2A'
    });

    const supabase = createClient();

    const cargarDatos = useCallback(async () => {
        setCargandoDatos(true);
        const { data } = await supabase.from('configuracion').select('*').limit(1).single();
        if (data) {
            setForm(data);
        }
        setCargandoDatos(false);
    }, [supabase]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    useEffect(() => {
        if (form.color_primario) {
            document.documentElement.style.setProperty(
                '--color-primario',
                form.color_primario
            );
        }
    }, [form.color_primario]);

    const handleGuardar = async () => {
        if (!form.nombre_negocio || !form.telefono_whatsapp) return;
        setGuardando(true);
        setExito(false);

        let result;
        if (form.id) {
            result = await supabase.from('configuracion').update(form).eq('id', form.id);
        } else {
            // Por si se vacía la BD y no hay setup inicial
            const { id, ...datosSinId } = form;
            result = await supabase.from('configuracion').insert(datosSinId).select().single();
            if (result.data) setForm(result.data);
        }

        if (!result.error) {
            setExito(true);
            document.documentElement.style.setProperty(
                '--color-primario',
                form.color_primario
            );
            setTimeout(() => setExito(false), 3000);
        }

        setGuardando(false);
    };

    if (cargandoDatos) {
        return <div className="animate-pulse space-y-4"><div className="h-8 bg-gray-200 rounded w-48" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div>
                <h1 className="text-xl font-semibold text-[var(--color-texto-1)] tracking-tight">Configuración del Negocio</h1>
                <p className="text-[13px] text-[var(--color-texto-3)] mt-1">Ajustes generales de la cafetería</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-[var(--color-texto-2)] mb-2">Nombre del Negocio *</label>
                            <input type="text" value={form.nombre_negocio} onChange={(e) => setForm({ ...form, nombre_negocio: e.target.value })} className="w-full px-4 py-3 bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl text-[13px] text-[var(--color-texto-1)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all focus:bg-white transition-all shadow-sm" placeholder="Ej. El Buen Café" />
                            <p className="text-[var(--color-texto-3)] text-xs mt-2">Aparece en el menú y en el ticket.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[var(--color-texto-2)] mb-2">WhatsApp para Pedidos *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-texto-3)]">📱</span>
                                <input type="text" value={form.telefono_whatsapp} onChange={(e) => setForm({ ...form, telefono_whatsapp: e.target.value.replace(/\D/g, '') })} className="w-full pl-11 pr-4 py-3 bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl text-[13px] text-[var(--color-texto-1)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all focus:bg-white transition-all shadow-sm" placeholder="521234567890" />
                            </div>
                            <p className="text-[var(--color-texto-3)] text-xs mt-2">Incluye código de país (+52 para México).</p>
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-borde)] pt-6">
                        <label className="block text-sm font-semibold text-[var(--color-texto-2)] mb-2">Color Primario de la Tienda</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-xl border-2 border-[var(--color-borde)] overflow-hidden shadow-sm">
                                <input type="color" value={form.color_primario} onChange={(e) => setForm({ ...form, color_primario: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                            </div>
                            <div>
                                <p className="text-[var(--color-texto-1)] font-medium">{form.color_primario}</p>
                                <p className="text-[var(--color-texto-3)] text-xs">Utilizado en tema oscuro/claro de app.</p>
                            </div>
                            <button onClick={() => setForm({ ...form, color_primario: '#4A2C2A' })} className="ml-auto text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)] text-sm font-medium px-3 py-1.5 bg-cafe-50 rounded-lg">Restaurar Original</button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-4">
                    <button onClick={handleGuardar} disabled={guardando || !form.nombre_negocio || !form.telefono_whatsapp} className="bg-[var(--color-acento)] hover:bg-cafe-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]">
                        {guardando ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {exito && (
                <div className="fixed bottom-6 right-6 bg-[var(--color-matcha)] text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in-up">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="font-medium">Configuración guardada exitosamente</span>
                </div>
            )}
        </div>
    );
}
