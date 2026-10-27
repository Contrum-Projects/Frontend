import { DisenoCuenta } from '@/tienda/cuenta/disenoCuenta';

export default function LayoutCuenta({ children }: LayoutProps<'/cuenta'>) {
  return <DisenoCuenta>{children}</DisenoCuenta>;
}
