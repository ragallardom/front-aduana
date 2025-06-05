import { DocumentoAdjunto } from './documento-adjunto';

export interface SolicitudAduana {
  id: number;
  /** Pais de origen del menor */
  paisOrigen: string;
  /** Datos opcionales mantenidos por retrocompatibilidad */
  nombreSolicitante?: string;
  motivo?: string;
  estado?: string;
  fechaCreacion?: string;
  documentos?: DocumentoAdjunto[];
}