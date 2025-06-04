export interface DocumentoAdjunto {
  id: number;
  nombreArchivo: string;
  tipoDocumento: string;
  rutaArchivo: string;
  fechaSubida: string; // vendrá como ISO (LocalDateTime en Java)
}