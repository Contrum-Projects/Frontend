/** El mensaje del backend junto a una parte del segmento, enlazado por `aria-describedby`. */
export const MensajeError = ({
  id,
  mensaje,
}: {
  id: string;
  mensaje?: string;
}) =>
  mensaje ? (
    <p id={id} className="texto-pequeno text-destructive">
      {mensaje}
    </p>
  ) : null;
