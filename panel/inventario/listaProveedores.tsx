import type { Proveedor } from '@/compartido/api/respuestas';
import { formatearRut } from '@/compartido/formato/rut';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/compartido/ui/table';

interface ListaProps {
  proveedores: Proveedor[];
}

/** Hasta que el backend envíe `cantidadEntradas` (pedido a SCRUM-36), «—». */
const entradas = (proveedor: Proveedor) => proveedor.cantidadEntradas ?? '—';

/** Une los datos presentes con «·»: un contacto sin teléfono no deja separadores sueltos. */
const unir = (...partes: (string | null)[]) =>
  partes.filter(Boolean).join(' · ');

const CABECERA = 'px-3 texto-leyenda text-texto-secundario';
/** Los textos largos pasan a otra línea en vez de cortarse: no hay otra forma de leerlos. */
const CELDA =
  'px-3 py-3 align-top break-words whitespace-normal texto-pequeno text-texto-principal';

/** Escritorio (Figma P5f 2064:3428): una columna por dato y las entradas al final. */
export const TablaProveedores = ({ proveedores }: ListaProps) => (
  <Table className="table-fixed" aria-label="Proveedores">
    <TableHeader>
      <TableRow className="hover:bg-transparent">
        <TableHead className={CABECERA}>Razón social</TableHead>
        <TableHead className={`w-32 ${CABECERA}`}>RUT</TableHead>
        <TableHead className={`w-40 ${CABECERA}`}>Contacto</TableHead>
        <TableHead className={CABECERA}>Correo</TableHead>
        <TableHead className={`w-40 ${CABECERA}`}>Teléfono</TableHead>
        <TableHead className={`w-24 ${CABECERA}`}>Entradas</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {proveedores.map((proveedor) => (
        <TableRow key={proveedor.id} className="hover:bg-transparent">
          <TableCell className={CELDA}>{proveedor.razonSocial}</TableCell>
          <TableCell className={CELDA}>{formatearRut(proveedor.rut)}</TableCell>
          <TableCell className={CELDA}>{proveedor.nombreContacto}</TableCell>
          <TableCell className={CELDA}>{proveedor.email}</TableCell>
          <TableCell className={CELDA}>{proveedor.telefono}</TableCell>
          <TableCell className={CELDA}>{entradas(proveedor)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

/** Celular (Figma P5f 2069:1836): razón social, dos líneas de detalle y las entradas a la derecha. */
export const ListaProveedoresCelular = ({ proveedores }: ListaProps) => (
  <ul className="flex flex-col">
    {proveedores.map((proveedor) => {
      const correoYTelefono = unir(proveedor.email, proveedor.telefono);
      return (
        <li
          key={proveedor.id}
          className="flex items-start gap-3 border-t py-3 first:border-t-0"
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="texto-etiqueta break-words text-texto-principal">
              {proveedor.razonSocial}
            </span>
            <span className="texto-leyenda break-words text-texto-secundario">
              {unir(formatearRut(proveedor.rut), proveedor.nombreContacto)}
            </span>
            {correoYTelefono && (
              <span className="texto-leyenda break-all text-texto-secundario">
                {correoYTelefono}
              </span>
            )}
          </div>
          <span className="texto-cuerpo-fuerte text-texto-principal">
            <span className="sr-only">Entradas: </span>
            {entradas(proveedor)}
          </span>
        </li>
      );
    })}
  </ul>
);
