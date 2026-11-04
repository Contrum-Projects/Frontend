import { DisenoVerificaciones } from '@/panel/verificaciones/disenoVerificaciones';

export default function LayoutVerificaciones({
  children,
}: LayoutProps<'/panel/verificaciones'>) {
  return <DisenoVerificaciones>{children}</DisenoVerificaciones>;
}
