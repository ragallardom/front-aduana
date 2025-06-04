import { DocumentoAdjunto } from './documento-adjunto';

export interface SolicitudAduana {
  id: number;
  nombreSolicitante: string;
  tipoDocumento: string;
  numeroDocumento: string;
  motivo: string;
  paisOrigen: string;
  estado?: string;
  fechaCreacion?: string; 
  documentos?: DocumentoAdjunto[];
}