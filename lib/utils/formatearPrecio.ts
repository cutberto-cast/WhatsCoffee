/**
 * Formatea un número como precio en pesos mexicanos.
 * @param precio - El valor numérico del precio
 * @returns String formateado, ej: "$49.00"
 */
export function formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(precio);
}
