'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Topping } from '@/types';

export default function AdminToppingsPage() {
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [cargando, setCargando] = useState(true);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [editando, setEditando] = useState<Topping | null>(null);
    const [confirmarEliminar, setConfirmarEliminar] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);

    const [form, setForm] = useState({
        nombre: '',
        activo: true,
    });

    const supabase = createClient();

    const cargarDatos = useCallback(async () => {
        setCargando(true);
        const { data } = await supabase
            .from('toppings')
            .select('*')
            .order('nombre');

        if (data) setToppings(data);
        setCargando(false);
    }, [supabase]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const abrirCrear = () => {
        setEditando(null);
        setForm({ nombre: '', activo: true });
        setModalAbierto(true);
    };

    const abrirEditar = (topping: Topping) => {
        setEditando(topping);
        setForm({
            nombre: topping.nombre,
            activo: topping.activo,
        });
        setModalAbierto(true);
    };

    const handleGuardar = async () => {
        if (!form.nombre.trim()) return;
        setGuardando(true);

        const datos = {
            nombre: form.nombre.trim(),
            activo: form.activo,
        };

        if (editando) {
            const { error } = await supabase
                .from('toppings')
                .update(datos)
                .eq('id', editando.id);
            if (!error) {
                setToppings(toppings.map((t) =>
                    t.id === editando.id ? { ...t, ...datos } : t
                ));
            } else {
                alert('Error al guardar el topping.');
            }
        } else {
            const { data, error } = await supabase
                .from('toppings')
                .insert(datos)
                .select()
                .single();
            if (!error && data) {
                setToppings([...toppings, data].sort((a, b) =>
                    a.nombre.localeCompare(b.nombre)
                ));
            } else {
                alert('Error al crear el topping.');
            }
        }

        setGuardando(false);
        setModalAbierto(false);
    };

    const handleEliminar = async (id: string) => {
        const { error } = await supabase.from('toppings').delete().eq('id', id);
        if (!error) {
            setToppings(toppings.filter((t) => t.id !== id));
        } else {
            alert('Error al eliminar el topping.');
        }
        setConfirmarEliminar(null);
    };

    const toggleActivo = async (topping: Topping) => {
        const nuevoEstado = !topping.activo;
        // Actualización optimista
        setToppings(toppings.map((t) =>
            t.id === topping.id ? { ...t, activo: nuevoEstado } : t
        ));

        const { error } = await supabase
            .from('toppings')
            .update({ activo: nuevoEstado })
            .eq('id', topping.id);

        if (error) {
            // Revertir si hay error
            setToppings(toppings.map((t) =>
                t.id === topping.id ? { ...t, activo: topping.activo } : t
            ));
        }
    };

    if (cargando) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-48" />
                <div className="h-64 bg-gray-100 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-semibold text-[var(--color-texto-1)] tracking-tight">Toppings</h1>
                    <p className="text-[13px] text-[var(--color-texto-3)]">
                        {toppings.length} toppings en el catálogo
                    </p>
                </div>
                <button
                    onClick={abrirCrear}
                    className="bg-[var(--color-primario)] hover:bg-[var(--color-primario)]/90 text-white font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm shadow-sm"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Topping
                </button>
            </div>

            {/* Tabla de toppings */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[var(--color-base)] border-b border-gray-100">
                                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--color-texto-3)] uppercase tracking-wider">
                                    Nombre
                                </th>
                                <th className="text-center px-5 py-3.5 text-xs font-semibold text-[var(--color-texto-3)] uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--color-texto-3)] uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {toppings.map((topping) => (
                                <tr key={topping.id} className="hover:bg-[var(--color-base)]/50 transition-colors">
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                                                </svg>
                                            </div>
                                            <span className="font-medium text-[var(--color-texto-1)] text-sm">
                                                {topping.nombre}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-center">
                                        <button
                                            onClick={() => toggleActivo(topping)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${topping.activo ? 'bg-[var(--color-matcha)]' : 'bg-red-400'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${topping.activo ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => abrirEditar(topping)}
                                                className="p-2 hover:bg-[var(--color-base)] rounded-lg transition-colors text-[var(--color-texto-2)] hover:text-[var(--color-texto-1)]"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => setConfirmarEliminar(topping.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {toppings.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-[var(--color-texto-3)] text-sm">
                            Aún no hay toppings en el catálogo
                        </p>
                    </div>
                )}
            </div>

            {/* Modal Crear/Editar */}
            {modalAbierto && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-[var(--color-espresso-dark)]/40 backdrop-blur-sm"
                        onClick={() => setModalAbierto(false)}
                    />
                    <div className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                            <h3 className="text-lg font-semibold text-[var(--color-texto-1)]">
                                {editando ? 'Editar Topping' : 'Nuevo Topping'}
                            </h3>
                            <button
                                onClick={() => setModalAbierto(false)}
                                className="text-[var(--color-texto-3)] hover:text-[var(--color-texto-2)] transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-[var(--color-texto-3)] mb-1">
                                    Nombre del topping *
                                </label>
                                <input
                                    type="text"
                                    value={form.nombre}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            nombre: e.target.value.substring(0, 50),
                                        })
                                    }
                                    placeholder="Ej: Nutella, Fresa, Cajeta..."
                                    className="w-full px-3 py-2 border border-[var(--color-borde)] rounded-lg text-[13px] text-[var(--color-texto-1)] placeholder:text-[var(--color-texto-3)] focus:outline-none focus:ring-1 focus:ring-[var(--color-espresso)] shadow-sm transition-all"
                                />
                                <p className="text-right text-xs text-[var(--color-texto-3)] mt-1">
                                    {form.nombre.length}/50
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() =>
                                        setForm({ ...form, activo: !form.activo })
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.activo ? 'bg-[var(--color-matcha)]' : 'bg-red-400'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${form.activo ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <span className="text-sm text-[var(--color-texto-2)]">
                                    {form.activo ? 'Activo' : 'Inactivo'}
                                </span>
                            </div>
                        </div>
                        <div className="border-t border-[var(--color-borde)] px-6 py-4 flex gap-3">
                            <button
                                onClick={() => setModalAbierto(false)}
                                className="flex-1 px-4 py-2.5 text-[var(--color-texto-2)] hover:bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleGuardar}
                                disabled={!form.nombre.trim() || guardando}
                                className="flex-1 px-4 py-2.5 bg-[var(--color-primario)] hover:bg-[var(--color-primario)]/90 disabled:opacity-50 flex justify-center items-center text-white rounded-xl text-sm font-medium"
                            >
                                {guardando ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : editando ? (
                                    'Guardar Cambios'
                                ) : (
                                    'Crear Topping'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminar */}
            {confirmarEliminar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-[var(--color-espresso-dark)]/40 backdrop-blur-sm"
                        onClick={() => setConfirmarEliminar(null)}
                    />
                    <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-[var(--shadow-modal)] border border-[var(--color-borde)] animate-scale-in text-center text-center">
                        <h3 className="text-lg font-semibold text-[var(--color-texto-1)] mb-2">
                            ¿Eliminar topping?
                        </h3>
                        <p className="text-[13px] text-[var(--color-texto-3)] mb-6">
                            Se eliminará del catálogo y de todos los productos que lo tengan vinculado.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmarEliminar(null)}
                                className="flex-1 px-4 py-2.5 text-[var(--color-texto-2)] hover:bg-[var(--color-base)] border border-[var(--color-borde)] rounded-xl text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => handleEliminar(confirmarEliminar)}
                                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
