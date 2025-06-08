import { AdjuntoViajeMenor } from './adjunto-viaje-menor';

export interface SolicitudViajeMenor {
  id: number;
  estado: string;
  fechaCreacion: string;
  tipoSolicitudMenor: string;
  nombreMenor: string;
  fechaNacimientoMenor: string;
  documentoMenor: string;
  numeroDocumentoMenor: string;
  nacionalidadMenor: string;
  nombrePadreMadre: string;
  relacionMenor: string;
  documentoPadre: string;
  numeroDocumentoPadre: string;
  telefonoPadre: string;
  emailPadre: string;
  fechaViaje: string;
  numeroTransporte: string;
  paisOrigen: string;
  paisDestino: string;
  motivoViaje: string;
  documentos: AdjuntoViajeMenor[];
}
