import { z } from 'zod';

export const esquemaDatosPedido = z.object({
    nombre_cliente: z
        .string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    direccion: z
        .string()
        .min(5, 'La dirección debe tener al menos 5 caracteres')
        .max(200, 'La dirección no puede exceder 200 caracteres'),
    notas: z.string().optional(),
    forma_pago: z.enum(['efectivo', 'transferencia'], {
        message: 'Selecciona una forma de pago válida',
    }),
});

export type DatosPedidoForm = z.infer<typeof esquemaDatosPedido>;
