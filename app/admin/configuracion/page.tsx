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
        color_primario: '#C68B59'
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
                <h1 className="text-2xl font-bold text-gray-900">Configuración del Negocio</h1>
                <p className="text-gray-500 text-sm mt-1">Ajustes generales de la cafetería</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Negocio *</label>
                            <input type="text" value={form.nombre_negocio} onChange={(e) => setForm({ ...form, nombre_negocio: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:bg-white transition-all shadow-sm" placeholder="Ej. El Buen Café" />
                            <p className="text-gray-400 text-xs mt-2">Aparece en el menú y en el ticket.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp para Pedidos *</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
                                <input type="text" value={form.telefono_whatsapp} onChange={(e) => setForm({ ...form, telefono_whatsapp: e.target.value.replace(/\D/g, '') })} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:bg-white transition-all shadow-sm" placeholder="521234567890" />
                            </div>
                            <p className="text-gray-400 text-xs mt-2">Incluye código de país (+52 para México).</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 py-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">URL del Logo (Opcional)</label>
                        <input type="url" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cafe-400 focus:bg-white transition-all shadow-sm" placeholder="https://ejemplo.com/logo.png" />
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Color Primario de la Tienda</label>
                        <div className="flex items-center gap-4">
                            <div className="relative w-12 h-12 rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                                <input type="color" value={form.color_primario} onChange={(e) => setForm({ ...form, color_primario: e.target.value })} className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer" />
                            </div>
                            <div>
                                <p className="text-gray-900 font-medium">{form.color_primario}</p>
                                <p className="text-gray-400 text-xs">Utilizado en tema oscuro/claro de app.</p>
                            </div>
                            <button onClick={() => setForm({ ...form, color_primario: '#C68B59' })} className="ml-auto text-cafe-500 hover:text-cafe-600 text-sm font-medium px-3 py-1.5 bg-cafe-50 rounded-lg">Restaurar Original</button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-4">
                    <button onClick={handleGuardar} disabled={guardando || !form.nombre_negocio || !form.telefono_whatsapp} className="bg-cafe-600 hover:bg-cafe-700 text-white font-medium px-8 py-3 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]">
                        {guardando ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            {exito && (
                <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-slide-in-up">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="font-medium">Configuración guardada exitosamente</span>
                </div>
            )}
        </div>
    );
}
