import { NoEncontrado } from '@/compartido/ui/noEncontrado';
import { ProductoExclusivo } from '@/tienda/ficha/fichaSegunRol';

/** Un exclusivo responde 404 al visitante; el profesional lo ve (SCRUM-109). */
export default function ProductoNoEncontrado() {
  return (
    <ProductoExclusivo noEncontrado={<NoEncontrado className="py-16" />} />
  );
}
