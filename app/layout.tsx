import type { Metadata } from 'next';
import './globals.css';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Nube Alta Cafe | Menú Digital',
  description:
    'Explora nuestro menú digital, arma tu pedido y envíalo por WhatsApp. Café de especialidad, frappes, postres y más.',
  keywords: ['cafetería', 'menú digital', 'pedidos', 'WhatsApp', 'café'],
  openGraph: {
    title: 'Nube Alta Cafe | Menú Digital',
    description:
      'Explora nuestro menú digital y haz tu pedido por WhatsApp.',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: config } = await supabase
    .from('configuracion')
    .select('color_primario')
    .limit(1)
    .single();

  const colorPrimario = config?.color_primario ?? '#4A2C2A';

  return (
    <html lang="es">
      <body
        className="antialiased min-h-screen"
        style={{ '--color-primario': colorPrimario } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
