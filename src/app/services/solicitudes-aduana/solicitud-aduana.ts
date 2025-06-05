// src/app/services/solicitudes-aduana/solicitud-aduana.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudAduana } from '../../models/solicitud-aduana';

@Injectable({ providedIn: 'root' })
export class SolicitudAduanaService {

  /**
   * Endpoint para crear solicitudes con adjunto.
   *
   * Se mantiene relativa para aprovechar el proxy de desarrollo
   * (`proxy.conf.json`) y evitar problemas de CORS en entornos locales.
   * Cuando se despliegue a producción puede apuntar a la URL absoluta
   * correspondiente.
   */
  private readonly baseUrl = '/api/solicitudes/adjuntar';

  constructor(private http: HttpClient) {}

  /**
   * Envía la solicitud como datos codificados en `application/x-www-form-urlencoded`.
   * El archivo se envía en Base64 para evitar problemas de compatibilidad con
   * `multipart/form-data`.
   */
  crearConAdjunto(
    data: Omit<SolicitudAduana, 'id' | 'estado' | 'fechaCreacion'>,
    tipoDocumento: string,
    archivoBase64: string
  ): Observable<SolicitudAduana> {
    const params = new HttpParams({
      fromObject: {
        nombreSolicitante: data.nombreSolicitante,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento,
        motivo: data.motivo,
        paisOrigen: data.paisOrigen,
        tipoDocumentoAdjunto: tipoDocumento,
        archivoBase64
      }
    });
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    return this.http.post<SolicitudAduana>(this.baseUrl, params.toString(), {
      headers
    });
  }
}
