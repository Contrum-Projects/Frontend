import type { Metadata, Viewport } from 'next';
import { dmSans, fraunces } from '@/compartido/fuentes';
import { Proveedores } from '@/compartido/proveedores';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Cabello Perfecto',
    template: '%s · Cabello Perfecto',
  },
  description:
    'Productos capilares para el cuidado en casa y precio profesional para peluqueros verificados.',
  ...(process.env.NEXT_PUBLIC_URL_SITIO && {
    metadataBase: new URL(process.env.NEXT_PUBLIC_URL_SITIO),
  }),
};

export const viewport: Viewport = {
  themeColor: '#f3efe6',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es-CL" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh">
        <Proveedores>{children}</Proveedores>
      </body>
    </html>
  );
}
