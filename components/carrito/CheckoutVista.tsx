'use client';

import { useState, useEffect } from 'react';
import { useCarrito } from '@/stores/carritoStore';
import { formatearPrecio } from '@/lib/utils/formatearPrecio';
import { esquemaDatosPedido } from '@/lib/validations/pedido';
import { createClient } from '@/lib/supabase/client';
import type { DatosPedido, CarritoItem } from '@/types';

interface CheckoutVistaProps {
    onVolver: () => void;
}

interface ConfigNegocio {
    telefono_whatsapp: string;
    nombre_negocio: string;
    banco: string;
    beneficiario: string;
    clabe: string;
    concepto_transferencia: string;
}

export function CheckoutVista({ onVolver }: CheckoutVistaProps) {
    const items = useCarrito((state) => state.items);
    const totalPrecio = useCarrito((state) => state.totalPrecio);
    const limpiar = useCarrito((state) => state.limpiar);

    const [datos, setDatos] = useState<DatosPedido>({
        nombre_cliente: '',
        direccion: '',
        forma_pago: 'efectivo',
        notas: '',
    });

    const [errores, setErrores] = useState<Record<string, string>>({});
    const [pedidoEnviado, setPedidoEnviado] = useState(false);
    const [config, setConfig] = useState<ConfigNegocio>({
        telefono_whatsapp: '',
        nombre_negocio: 'Nube Alta Cafe',
        banco: '',
        beneficiario: '',
        clabe: '',
        concepto_transferencia: 'Pago de pedido',
    });
    const [copiado, setCopiado] = useState<string | null>(null);
    const [itemsCliente, setItemsCliente] = useState<CarritoItem[]>([]);

    const supabase = createClient();

    useEffect(() => {
        setItemsCliente(items);
    }, [items]);

    useEffect(() => {
        supabase
            .from('configuracion')
            .select('telefono_whatsapp, nombre_negocio, banco, beneficiario, clabe, concepto_transferencia')
            .limit(1)
            .single()
            .then(({ data }) => {
                if (data) setConfig(data);
            });
    }, [supabase]);

    const copiarAlPortapapeles = async (texto: string, campo: string) => {
        try {
            await navigator.clipboard.writeText(texto);
            setCopiado(campo);
            setTimeout(() => setCopiado(null), 2000);
        } catch {
            // Fallback para navegadores sin clipboard API
            const el = document.createElement('textarea');
            el.value = texto;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
            setCopiado(campo);
            setTimeout(() => setCopiado(null), 2000);
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setDatos((prev) => ({ ...prev, [name]: value }));
        if (errores[name]) {
            setErrores((prev) => {
                const nuevo = { ...prev };
                delete nuevo[name];
                return nuevo;
            });
        }
    };

    const generarMensajePedido = (
        itemsParam: CarritoItem[],
        datosParam: DatosPedido,
        totalParam: number,
        esTransferencia: boolean
    ) => {
        let mensaje = `*NUEVO PEDIDO — ${config.nombre_negocio}*\n\n`;
        mensaje += `*Cliente:* ${datosParam.nombre_cliente}\n`;
        if (datosParam.direccion) {
            mensaje += `*Dirección:* ${datosParam.direccion}\n`;
        }
        if (datosParam.notas) {
            mensaje += `*Notas:* ${datosParam.notas}\n`;
        }
        mensaje += `*Forma de pago:* ${esTransferencia ? '� Transferencia' : '� Efectivo'}\n\n`;

        mensaje += `*🛒 DETALLE DEL PEDIDO:*\n`;
        itemsParam.forEach((item) => {
            const partes: string[] = [];
            if (item.variante_elegida) partes.push(item.variante_elegida.nombre);
            if (item.toppings_elegidos && item.toppings_elegidos.length > 0) {
                partes.push(item.toppings_elegidos.map((t) => t.nombre).join(', '));
            }
            const detalle = partes.length > 0 ? ` — ${partes.join(' · ')}` : '';
            mensaje += `• ${item.cantidad}x ${item.producto.nombre}${detalle} — ${formatearPrecio(item.precio_final * item.cantidad)}\n`;
        });

        mensaje += `\n*TOTAL: ${formatearPrecio(totalParam)}*`;

        if (esTransferencia) {
            mensaje += `\n\n💳 *Pago por transferencia*`;
            mensaje += `\nAdjunto mi comprobante de pago.`;
        }

        return mensaje;
    };

    const handleEnviar = (e: React.FormEvent) => {
        e.preventDefault();

        const resultado = esquemaDatosPedido.safeParse(datos);
        if (!resultado.success) {
            const nuevosErrores: Record<string, string> = {};
            resultado.error.issues.forEach((err) => {
                const campo = err.path[0];
                if (campo) nuevosErrores[String(campo)] = err.message;
            });
            setErrores(nuevosErrores);
            return;
        }

        if (itemsCliente.length === 0) {
            setErrores({ general: 'Tu carrito está vacío.' });
            return;
        }

        if (!config.telefono_whatsapp) {
            setErrores({ general: 'El negocio aún no configuró su WhatsApp.' });
            return;
        }

        const esTransferencia = datos.forma_pago === 'transferencia';
        const mensaje = generarMensajePedido(
            itemsCliente, datos, totalPrecio(), esTransferencia
        );
        const url = `https://api.whatsapp.com/send/?phone=${config.telefono_whatsapp}&text=${encodeURIComponent(mensaje)}&type=phone_number&app_absent=0`;
        window.open(url, '_blank');
        setPedidoEnviado(true);
    };

    // ── Pantalla post-pedido ──────────────────────────────
    if (pedidoEnviado) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-14 h-14 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Pedido Enviado!</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-xs">
                    {datos.forma_pago === 'transferencia'
                        ? 'Tu pedido fue enviado por WhatsApp. Recuerda enviar tu comprobante de transferencia para confirmar tu orden.'
                        : 'Tu pedido fue enviado por WhatsApp. El negocio te contactará pronto para confirmar tu orden.'
                    }
                </p>
                <button
                    onClick={() => { limpiar(); window.location.href = '/'; }}
                    className="w-full max-w-xs bg-[#4A2C2A] hover:bg-[#3A2220] text-white font-semibold py-3.5 rounded-xl transition-all active:scale-95"
                >
                    Volver al menú
                </button>
            </div>
        );
    }

    const hayDatosBancarios = config.banco || config.beneficiario || config.clabe;

    return (
        <div className="animate-fade-in">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={onVolver}
                    className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm"
                    aria-label="Volver al carrito"
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
            </div>

            {/* Resumen del pedido */}
            <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    Resumen del Pedido
                </h3>
                <div className="space-y-2">
                    {itemsCliente.map((item, idx) => (
                        <div key={`checkout-${idx}`} className="flex justify-between text-sm">
                            <div className="flex-1 min-w-0">
                                <span className="text-gray-700">
                                    {item.cantidad}x {item.producto.nombre}
                                </span>
                                {item.variante_elegida && (
                                    <span className="text-xs text-gray-400 ml-1">
                                        · {item.variante_elegida.nombre}
                                    </span>
                                )}
                                {item.toppings_elegidos && item.toppings_elegidos.length > 0 && (
                                    <p className="text-xs text-gray-400 truncate">
                                        · {item.toppings_elegidos.map((t) => t.nombre).join(', ')}
                                    </p>
                                )}
                            </div>
                            <span className="text-gray-900 font-medium flex-shrink-0 ml-2">
                                {formatearPrecio(item.precio_final * item.cantidad)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="font-bold text-gray-900 text-lg">
                        {formatearPrecio(totalPrecio())}
                    </span>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleEnviar} className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    Datos de Entrega
                </h3>

                {/* Nombre */}
                <div>
                    <label htmlFor="nombre_cliente" className="block text-xs font-medium text-gray-600 mb-1.5">
                        Nombre completo *
                    </label>
                    <input
                        type="text"
                        id="nombre_cliente"
                        name="nombre_cliente"
                        value={datos.nombre_cliente}
                        onChange={handleChange}
                        placeholder="Ej: María García"
                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all focus:bg-white ${errores.nombre_cliente ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-400'}`}
                    />
                    {errores.nombre_cliente && (
                        <p className="text-red-400 text-xs mt-1">{errores.nombre_cliente}</p>
                    )}
                </div>

                {/* Dirección */}
                <div>
                    <label htmlFor="direccion" className="block text-xs font-medium text-gray-600 mb-1.5">
                        Dirección de entrega *
                    </label>
                    <input
                        type="text"
                        id="direccion"
                        name="direccion"
                        value={datos.direccion}
                        onChange={handleChange}
                        placeholder="Ej: Calle 5 de Mayo #123, Centro"
                        className={`w-full px-4 py-3 bg-gray-50 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all focus:bg-white ${errores.direccion ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-400'}`}
                    />
                    {errores.direccion && (
                        <p className="text-red-400 text-xs mt-1">{errores.direccion}</p>
                    )}
                </div>

                {/* Notas */}
                <div>
                    <label htmlFor="notas" className="block text-xs font-medium text-gray-600 mb-1.5">
                        Notas adicionales (Opcional)
                    </label>
                    <textarea
                        id="notas"
                        name="notas"
                        rows={2}
                        value={datos.notas || ''}
                        onChange={handleChange}
                        placeholder="Ej: Tocar el timbre, traer cambio de $500..."
                        className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all focus:bg-white resize-none"
                    />
                </div>

                {/* Forma de pago */}
                <div className="pt-1">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                        Forma de pago *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {/* <button
                            type="button"
                            onClick={() => setDatos((prev) => ({ ...prev, forma_pago: 'efectivo' }))}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${datos.forma_pago === 'efectivo'
                                ? 'border-[#4A2C2A] bg-[#4A2C2A]/5 text-[#4A2C2A] ring-2 ring-[#4A2C2A]/20'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <span>💵</span> Efectivo
                        </button> */}
                        <div className="flex flex-col">
                            <button
                                type="button"
                                onClick={() => setDatos((prev) => ({ ...prev, forma_pago: 'efectivo' }))}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${datos.forma_pago === 'efectivo'
                                    ? 'border-[#4A2C2A] bg-[#4A2C2A]/5 text-[#4A2C2A] ring-2 ring-[#4A2C2A]/20'
                                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <span>💵</span> Efectivo
                            </button>
                            <span className="text-xs text-gray-500 mt-1 ml-1">
                                Paga cuando recibes tu pedido
                            </span>
                        </div>
                        {/* <button
                            type="button"
                            onClick={() => setDatos((prev) => ({ ...prev, forma_pago: 'transferencia' }))}
                            className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${datos.forma_pago === 'transferencia'
                                ? 'border-[#4A2C2A] bg-[#4A2C2A]/5 text-[#4A2C2A] ring-2 ring-[#4A2C2A]/20'
                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <span>💳</span> Transferencia
                        </button> */}
                        <div className="flex flex-col">
                            <button
                                type="button"
                                onClick={() => setDatos((prev) => ({ ...prev, forma_pago: 'transferencia' }))}
                                className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${datos.forma_pago === 'transferencia'
                                    ? 'border-[#4A2C2A] bg-[#4A2C2A]/5 text-[#4A2C2A] ring-2 ring-[#4A2C2A]/20'
                                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                <span>💳</span> Transferencia
                            </button>
                            <span className="text-xs text-gray-500 mt-1 ml-1">
                                Envía el comprobante por WhatsApp
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── CARD DE DATOS BANCARIOS ────────────────────── */}
                {datos.forma_pago === 'transferencia' && hayDatosBancarios && (
                    <div className="mt-1 rounded-2xl border-2 border-[#4A2C2A]/20 bg-[#4A2C2A]/5 p-4 space-y-3 animate-fade-in">

                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-base">💳</span>
                            <p className="text-sm font-bold text-gray-900">
                                Datos para transferencia
                            </p>
                        </div>

                        {/* Fila banco */}
                        {config.banco && (
                            <button
                                type="button"
                                onClick={() => copiarAlPortapapeles(config.banco, 'banco')}
                                className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-200 hover:border-[#4A2C2A]/40 transition-all active:scale-[0.98] group"
                            >
                                <div className="text-left">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                        Banco
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                        {config.banco}
                                    </p>
                                </div>
                                <span className="text-xs font-medium text-gray-400 group-hover:text-[#4A2C2A] transition-colors">
                                    {copiado === 'banco' ? '✓ Copiado' : 'Copiar'}
                                </span>
                            </button>
                        )}

                        {/* Fila beneficiario */}
                        {config.beneficiario && (
                            <button
                                type="button"
                                onClick={() => copiarAlPortapapeles(config.beneficiario, 'beneficiario')}
                                className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-200 hover:border-[#4A2C2A]/40 transition-all active:scale-[0.98] group"
                            >
                                <div className="text-left">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                        Beneficiario
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                        {config.beneficiario}
                                    </p>
                                </div>
                                <span className="text-xs font-medium text-gray-400 group-hover:text-[#4A2C2A] transition-colors">
                                    {copiado === 'beneficiario' ? '✓ Copiado' : 'Copiar'}
                                </span>
                            </button>
                        )}

                        {/* Fila CLABE — la más importante, más destacada */}
                        {config.clabe && (
                            <button
                                type="button"
                                onClick={() => copiarAlPortapapeles(config.clabe, 'clabe')}
                                className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 border-2 border-[#4A2C2A]/30 hover:border-[#4A2C2A]/60 transition-all active:scale-[0.98] group"
                            >
                                <div className="text-left">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                        CLABE / Cuenta
                                    </p>
                                    <p className="text-base font-bold text-gray-900 mt-0.5 font-mono tracking-wide">
                                        {config.clabe}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg transition-all ${copiado === 'clabe'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-[#4A2C2A]/10 text-[#4A2C2A] group-hover:bg-[#4A2C2A]/20'
                                        }`}>
                                        {copiado === 'clabe' ? '✓ Copiado' : 'Toca para copiar'}
                                    </span>
                                </div>
                            </button>
                        )}

                        {/* Fila concepto */}
                        {config.concepto_transferencia && (
                            <button
                                type="button"
                                onClick={() => copiarAlPortapapeles(config.concepto_transferencia, 'concepto')}
                                className="w-full flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-200 hover:border-[#4A2C2A]/40 transition-all active:scale-[0.98] group"
                            >
                                <div className="text-left">
                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                                        Concepto
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                                        {config.concepto_transferencia}
                                    </p>
                                </div>
                                <span className="text-xs font-medium text-gray-400 group-hover:text-[#4A2C2A] transition-colors">
                                    {copiado === 'concepto' ? '✓ Copiado' : 'Copiar'}
                                </span>
                            </button>
                        )}

                        {/* Instrucción */}
                        <div className="flex items-start gap-2 pt-1">
                            <span className="text-sm mt-0.5">📲</span>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Realiza tu transferencia y al enviar tu pedido
                                <strong className="text-gray-800"> adjunta el comprobante por WhatsApp</strong>.
                                Tu orden se confirmará una vez que verifiquemos el pago.
                            </p>
                        </div>
                    </div>
                )}

                {/* Aviso si eligió transferencia pero no hay datos configurados */}
                {datos.forma_pago === 'transferencia' && !hayDatosBancarios && (
                    <div className="mt-1 rounded-xl bg-amber-50 border border-amber-200 p-3">
                        <p className="text-xs text-amber-700 text-center">
                            El negocio aún no ha configurado sus datos bancarios.
                            Puedes preguntar por WhatsApp al enviar tu pedido.
                        </p>
                    </div>
                )}

                {errores.general && (
                    <p className="text-red-400 text-sm text-center bg-red-50 p-3 rounded-xl">
                        {errores.general}
                    </p>
                )}

                {/* Botón enviar */}
                <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 rounded-xl transition-all active:scale-[0.98] shadow-md flex items-center justify-center gap-2 text-base mt-2"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {datos.forma_pago === 'transferencia'
                        ? 'Enviar Pedido y Comprobante por WhatsApp'
                        : 'Enviar Pedido por WhatsApp'
                    }
                </button>
            </form>
        </div>
    );
}
