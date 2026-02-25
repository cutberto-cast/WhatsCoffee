import type { Metadata } from 'next';
import './globals.css';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
