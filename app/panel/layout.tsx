import type { Metadata } from 'next';
import { DisenoPanel } from '@/panel/diseno/disenoPanel';

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel · Cabello Perfecto' },
  robots: { index: false, follow: false },
};

export default function LayoutPanel({ children }: LayoutProps<'/panel'>) {
  return <DisenoPanel>{children}</DisenoPanel>;
}
