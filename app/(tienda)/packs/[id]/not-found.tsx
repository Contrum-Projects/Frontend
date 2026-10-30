import { NoEncontrado } from '@/compartido/ui/noEncontrado';
import { PackExclusivo } from '@/tienda/ficha/fichaSegunRol';

/** Un pack exclusivo responde 404 al visitante; el profesional lo ve (SCRUM-109). */
export default function PackNoEncontrado() {
  return <PackExclusivo noEncontrado={<NoEncontrado className="py-16" />} />;
}
