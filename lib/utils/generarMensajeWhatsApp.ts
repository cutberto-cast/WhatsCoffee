/* import type { CarritoItem, DatosPedido } from '@/types';
import { formatearPrecio } from './formatearPrecio';

const TELEFONO_WHATSAPP = '522722815138'; */

/**
 * Genera el mensaje formateado del pedido para enviar por WhatsApp.
 */
/* export function generarMensajeWhatsApp(
    items: CarritoItem[],
    datos: DatosPedido,
    total: number
): string {
    const lineasProductos = items
        .map(
            (item) =>
                `• ${item.cantidad}x ${item.producto.nombre} — ${formatearPrecio(item.producto.precio * item.cantidad)}`
        )
        .join('\n');

    const mensaje = `🛒 *NUEVO PEDIDO - Nube Alta Cafe*

👤 *Cliente:* ${datos.nombre_cliente}
📍 *Dirección:* ${datos.direccion}
💳 *Forma de pago:* ${datos.forma_pago === 'efectivo' ? 'Efectivo' : 'Transferencia'}

📋 *Detalle del pedido:*
${lineasProductos}

💰 *TOTAL: ${formatearPrecio(total)}*

¡Gracias por tu pedido! 🙌`;

    return mensaje;
} */

/**
 * Genera la URL completa de WhatsApp con el mensaje del pedido precargado.
 */
/* export function generarUrlWhatsApp(
    items: CarritoItem[],
    datos: DatosPedido,
    total: number
): string {
    const mensaje = generarMensajeWhatsApp(items, datos, total);
    const mensajeCodificado = encodeURIComponent(mensaje);
    return `https://wa.me/${TELEFONO_WHATSAPP}?text=${mensajeCodificado}`;
}
 */