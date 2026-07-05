-- Estado del negocio: controla el indicador "Abierto/Cerrado" de la tienda.
-- modo 'manual': el admin lo prende/apaga con un switch.
-- modo 'auto': se evalúa contra horario_reglas (días de la semana + rango horario).
ALTER TABLE "public"."configuracion"
    ADD COLUMN IF NOT EXISTS "estado_negocio_modo" text NOT NULL DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS "abierto_manual" boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS "horario_reglas" jsonb NOT NULL DEFAULT '[]'::jsonb;

-- horario_reglas: array de reglas tipo alarma. Ejemplo:
-- [{"dias": [1,2,3,4,5], "desde": "08:00", "hasta": "20:00"}]
-- dias usa la convención de JS Date.getDay(): 0=domingo ... 6=sábado.

-- Permite que la tienda reciba en vivo los cambios de configuración
-- (si la tabla ya está en la publicación, no hace nada).
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE "public"."configuracion";
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;
