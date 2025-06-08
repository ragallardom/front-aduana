export interface AdjuntoViajeMenor {
  id: number;
  nombreArchivo: string;
  ruta: string;
  // Identificador de la solicitud; opcional para facilitar creacion
  solicitud?: number;
}
