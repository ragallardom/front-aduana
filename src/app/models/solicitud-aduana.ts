import { DocumentoAdjunto } from './documento-adjunto';

export interface SolicitudAduana {
  id: number;
  /** Pais de origen del menor */
  paisOrigen: string;
  /** Pais de destino del menor */
  paisDestino?: string;
  /** Fecha programada para el viaje */
  fechaViaje?: string;
  /** Identificador del vuelo, barco o bus */
  numeroTransporte?: string;
  /** Motivo declarado del viaje */
  motivoViaje?: string;
  /** Datos opcionales mantenidos por retrocompatibilidad */
  nombreSolicitante?: string;
  motivo?: string;
  estado?: string;
  fechaCreacion?: string;
  documentos?: DocumentoAdjunto[];
}