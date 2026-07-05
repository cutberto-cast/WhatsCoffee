'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { estaAbiertoSegunReglas } from '@/lib/horario';
import { SelectorHora } from '@/components/admin/SelectorHora';
import type { HorarioRegla } from '@/types';

const FORM_DEFAULTS = {
    id: '',
    nombre_negocio: '',
    telefono_whatsapp: '',
    logo_url: '',
    color_primario: '#4A2C2A',
    banco: '',
    beneficiario: '',
    clabe: '',
    concepto_transferencia: 'Pago de pedido',
    estado_negocio_modo: 'manual' as 'manual' | 'auto',
    abierto_manual: true,
    horario_reglas: [] as HorarioRegla[],
};

const DIAS_SEMANA = [
    { valor: 1, etiqueta: 'Lun' },
    { valor: 2, etiqueta: 'Mar' },
    { valor: 3, etiqueta: 'Mié' },
    { valor: 4, etiqueta: 'Jue' },
    { valor: 5, etiqueta: 'Vie' },
    { valor: 6, etiqueta: 'Sáb' },
    { valor: 0, etiqueta: 'Dom' },
];

export default function AdminConfiguracionPage() {
    const [cargandoDatos, setCargandoDatos] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [exito, setExito] = useState(false);

    const [form, setForm] = useState({ ...FORM_DEFAULTS });

    const supabase = createClient();

    const cargarDatos = useCallback(async () => {
        setCargandoDatos(true);
        const { data } = await supabase.from('configuracion').select('*').limit(1).single();
        if (data) {
            setForm({ ...FORM_DEFAULTS, ...data });
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

    // Handlers del horario automático
    const reglas: HorarioRegla[] = form.horario_reglas || [];
    const setReglas = (nuevas: HorarioRegla[]) => setForm({ ...form, horario_reglas: nuevas });
    const agregarRegla = () =>
        setReglas([...reglas, { dias: [1, 2, 3, 4, 5], desde: '08:00', hasta: '20:00' }]);
    const eliminarRegla = (indice: number) => setReglas(reglas.filter((_, i) => i !== indice));
    const actualizarRegla = (indice: number, cambios: Partial<HorarioRegla>) =>
        setReglas(reglas.map((r, i) => (i === indice ? { ...r, ...cambios } : r)));
    const toggleDia = (indice: number, dia: number) => {
        const regla = reglas[indice];
        if (!regla) return;
        actualizarRegla(indice, {
            dias: regla.dias.includes(dia)
                ? regla.dias.filter((d) => d !== dia)
                : [...regla.dias, dia],
        });
    };

    const modoAuto = form.estado_negocio_modo === 'auto';
    const previewAbierto = estaAbiertoSegunReglas(reglas);

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
                        <label className="block text-sm font-semibold text-[var(--color-texto-1)] mb-1">
                            Color Principal de la Tienda
                        </label>
                        <p className="text-xs text-[var(--color-texto-3)] mb-3">
                            Define el color del header y botones de la app. Puedes usar el selector o pegar un código hex directamente (ej. #4A2C2A).
                        </p>

                        <div className="flex items-center gap-3">

                            {/* Selector visual de color */}
                            <div className="relative w-10 h-10 rounded-lg border-2 border-[var(--color-borde)] overflow-hidden shadow-sm flex-shrink-0 cursor-pointer">
                                <input
                                    type="color"
                                    value={form.color_primario}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setForm({ ...form, color_primario: val });
                                        document.documentElement.style.setProperty(
                                            '--color-primario', val
                                        );
                                    }}
                                    className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0 p-0"
                                />
                            </div>

                            {/* Input de texto hexadecimal */}
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-texto-3)] font-mono text-sm select-none">
                                    #
                                </span>
                                <input
                                    type="text"
                                    value={form.color_primario.replace('#', '')}
                                    onChange={(e) => {
                                        // Limpiar input: solo caracteres hex válidos
                                        const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                                        const hex = `#${raw}`;
                                        setForm({ ...form, color_primario: hex });
                                        // Aplicar solo si es un hex completo válido
                                        if (raw.length === 6) {
                                            document.documentElement.style.setProperty(
                                                '--color-primario', hex
                                            );
                                        }
                                    }}
                                    placeholder="4A2C2A"
                                    maxLength={6}
                                    className="w-full pl-7 pr-4 py-2.5 border border-[var(--color-borde)] bg-white rounded-lg font-mono text-sm text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)]/20 focus:border-[var(--color-texto-2)] transition-all"
                                />
                            </div>

                            {/* Preview del color actual */}
                            <div
                                className="w-10 h-10 rounded-lg flex-shrink-0 border border-[var(--color-borde)] shadow-sm"
                                style={{ backgroundColor: form.color_primario }}
                            />

                            {/* Botón restaurar */}
                            <button
                                onClick={() => {
                                    const colorDefault = '#4A2C2A';
                                    setForm({ ...form, color_primario: colorDefault });
                                    document.documentElement.style.setProperty(
                                        '--color-primario', colorDefault
                                    );
                                }}
                                className="text-xs text-[var(--color-texto-3)] hover:text-[var(--color-texto-1)] px-3 py-2.5 border border-[var(--color-borde)] bg-white rounded-lg hover:bg-[var(--color-base)] transition-all whitespace-nowrap"
                            >
                                Restaurar
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-borde)] pt-6">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-[var(--color-texto-1)]">
                                Datos para Transferencia
                            </h3>
                            <p className="text-xs text-[var(--color-texto-3)] mt-1">
                                Se mostrarán al cliente cuando elija pagar por transferencia en el checkout.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-texto-1)] mb-2">
                                    Banco
                                </label>
                                <input
                                    type="text"
                                    value={form.banco}
                                    onChange={(e) => setForm({ ...form, banco: e.target.value })}
                                    placeholder="Ej. BBVA, Banamex, HSBC..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-borde)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-espresso)]/20 focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-texto-1)] mb-2">
                                    Beneficiario
                                </label>
                                <input
                                    type="text"
                                    value={form.beneficiario}
                                    onChange={(e) => setForm({ ...form, beneficiario: e.target.value })}
                                    placeholder="Nombre completo del titular"
                                    className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-borde)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-espresso)]/20 focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-texto-1)] mb-2">
                                    CLABE / Número de cuenta
                                </label>
                                <input
                                    type="text"
                                    value={form.clabe}
                                    onChange={(e) => setForm({ ...form, clabe: e.target.value.replace(/\D/g, '') })}
                                    placeholder="18 dígitos CLABE interbancaria"
                                    maxLength={18}
                                    className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-borde)] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-espresso)]/20 focus:bg-white transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-texto-1)] mb-2">
                                    Concepto sugerido
                                </label>
                                <input
                                    type="text"
                                    value={form.concepto_transferencia}
                                    onChange={(e) => setForm({ ...form, concepto_transferencia: e.target.value })}
                                    placeholder="Ej. Pago de pedido"
                                    className="w-full px-4 py-3 bg-gray-50 border border-[var(--color-borde)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-espresso)]/20 focus:bg-white transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-[var(--color-borde)] pt-6">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-[var(--color-texto-1)]">
                                Estado del Negocio
                            </h3>
                            <p className="text-xs text-[var(--color-texto-3)] mt-1">
                                Controla el indicador &quot;Abierto / Cerrado&quot; que ven los clientes junto al logo del menú.
                            </p>
                        </div>

                        {/* Selector de modo */}
                        <div className="inline-flex bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl p-1 mb-5">
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, estado_negocio_modo: 'manual' })}
                                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${!modoAuto ? 'bg-white shadow-sm text-[var(--color-texto-1)]' : 'text-[var(--color-texto-3)] hover:text-[var(--color-texto-2)]'}`}
                            >
                                Manual
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, estado_negocio_modo: 'auto' })}
                                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${modoAuto ? 'bg-white shadow-sm text-[var(--color-texto-1)]' : 'text-[var(--color-texto-3)] hover:text-[var(--color-texto-2)]'}`}
                            >
                                Automático (horario)
                            </button>
                        </div>

                        {!modoAuto ? (
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, abierto_manual: !form.abierto_manual })}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${form.abierto_manual ? 'bg-green-500' : 'bg-gray-300'}`}
                                    aria-label="Cambiar estado abierto/cerrado"
                                >
                                    <span
                                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${form.abierto_manual ? 'left-6' : 'left-1'}`}
                                    />
                                </button>
                                <span className={`text-sm font-semibold ${form.abierto_manual ? 'text-green-600' : 'text-gray-500'}`}>
                                    {form.abierto_manual ? 'Abierto' : 'Cerrado'}
                                </span>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {reglas.length === 0 && (
                                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                        Sin horarios definidos el negocio se mostrará siempre como cerrado. Agrega al menos un horario.
                                    </p>
                                )}

                                {reglas.map((regla, indice) => (
                                    <div key={indice} className="border border-[var(--color-borde)] rounded-xl p-4 bg-[var(--color-base)]">
                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                            {DIAS_SEMANA.map((dia) => (
                                                <button
                                                    key={dia.valor}
                                                    type="button"
                                                    onClick={() => toggleDia(indice, dia.valor)}
                                                    className={`w-11 h-8 rounded-lg text-xs font-medium transition-all ${regla.dias.includes(dia.valor) ? 'bg-[var(--color-acento)] text-white shadow-sm' : 'bg-white border border-[var(--color-borde)] text-[var(--color-texto-3)] hover:border-[var(--color-texto-3)]'}`}
                                                >
                                                    {dia.etiqueta}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <label className="text-xs text-[var(--color-texto-3)]">De</label>
                                            <SelectorHora
                                                valor={regla.desde}
                                                onCambiar={(hora) => actualizarRegla(indice, { desde: hora })}
                                            />
                                            <label className="text-xs text-[var(--color-texto-3)]">a</label>
                                            <SelectorHora
                                                valor={regla.hasta}
                                                onCambiar={(hora) => actualizarRegla(indice, { hasta: hora })}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => eliminarRegla(indice)}
                                                className="ml-auto text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                        {regla.desde && regla.hasta && regla.hasta < regla.desde && (
                                            <p className="text-[11px] text-[var(--color-texto-3)] mt-2">
                                                Este horario cruza la medianoche: cierra al día siguiente a las {regla.hasta}.
                                            </p>
                                        )}
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    onClick={agregarRegla}
                                    className="w-full text-[13px] font-medium text-[var(--color-acento)] border border-dashed border-[var(--color-borde)] rounded-xl px-4 py-2.5 hover:bg-[var(--color-base)] transition-all"
                                >
                                    + Agregar horario
                                </button>

                                <p className="text-xs text-[var(--color-texto-3)]">
                                    Con este horario, ahora mismo el menú mostraría:{' '}
                                    <strong className={previewAbierto ? 'text-green-600' : 'text-red-500'}>
                                        {previewAbierto ? 'Abierto' : 'Cerrado'}
                                    </strong>
                                </p>
                            </div>
                        )}
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
