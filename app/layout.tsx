import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { createClient } from '@/lib/supabase/server';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

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

  const colorPrimario = config?.color_primario ?? '#B35D33';

  return (
    <html lang="es">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen`}
        style={{ '--color-primario': colorPrimario } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}
