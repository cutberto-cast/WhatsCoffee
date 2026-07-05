import type { HorarioRegla } from '@/types';

function aMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

export function estaAbiertoSegunReglas(reglas: HorarioRegla[], ahora: Date = new Date()): boolean {
    const dia = ahora.getDay();
    const minutos = ahora.getHours() * 60 + ahora.getMinutes();

    return reglas.some((regla) => {
        if (!regla.desde || !regla.hasta || !regla.dias?.length) return false;
        const desde = aMinutos(regla.desde);
        const hasta = aMinutos(regla.hasta);

        if (desde === hasta) return false;
        if (desde < hasta) {
            return regla.dias.includes(dia) && minutos >= desde && minutos < hasta;
        }
        // Rango que cruza medianoche (ej. 18:00 a 02:00): aplica desde la noche
        // del día seleccionado hasta la madrugada del día siguiente.
        const diaAnterior = (dia + 6) % 7;
        return (
            (regla.dias.includes(dia) && minutos >= desde) ||
            (regla.dias.includes(diaAnterior) && minutos < hasta)
        );
    });
}

export function estaAbierto(
    config: {
        estado_negocio_modo?: string | null;
        abierto_manual?: boolean | null;
        horario_reglas?: HorarioRegla[] | null;
    } | null,
    ahora: Date = new Date()
): boolean {
    if (!config) return true;
    if (config.estado_negocio_modo === 'auto') {
        return estaAbiertoSegunReglas(config.horario_reglas ?? [], ahora);
    }
    return config.abierto_manual ?? true;
}
