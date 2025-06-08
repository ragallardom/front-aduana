// src/app/services/solicitudes-aduana/solicitud-aduana.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudViajeMenor } from '../../models/solicitud-viaje-menor';

@Injectable({ providedIn: 'root' })
export class SolicitudAduanaService {

  /**
   * Base URL para las solicitudes de la API.
   *
   * Se deja relativa para aprovechar el proxy de desarrollo
   * (proxy.conf.json) y evitar problemas de CORS en entornos
   * locales. Cuando se despliegue a producción puede apuntar a la
   * URL absoluta correspondiente.
   */
  private readonly baseUrl = '/api/solicitudes';

  constructor(private http: HttpClient) {}

  /**
   * Envía la solicitud como JSON junto con el archivo codificado en Base64.
   * Esto evita problemas de compatibilidad con multipart/form-data cuando el
   * backend sólo acepta application/json.
   */
  crearConAdjunto(
    data: Omit<
      SolicitudViajeMenor,
      'id' | 'estado' | 'fechaCreacion' | 'documentos'
    >,
    tipoAdjunto = '',
    numeroDocumento = '',
    archivoBase64 = ''
  ): Observable<SolicitudViajeMenor> {
    const payload: any = {
      ...data,
    };
    if (tipoAdjunto) {
      payload.tipoAdjunto = tipoAdjunto;
    }
    if (archivoBase64) {
      payload.archivoBase64 = archivoBase64;
    }

    let params: HttpParams | undefined;
    if (data.nombrePadreMadre) {
      params = new HttpParams().set(
        'nombreSolicitante',
        data.nombrePadreMadre
      );
    }
    if (tipoAdjunto) {
      params = (params ?? new HttpParams()).set('tipoAdjunto', tipoAdjunto);
    }
    if (numeroDocumento) {
      params = (params ?? new HttpParams()).set(
        'numeroDocumento',
        numeroDocumento
      );
    }

    return this.http.post<SolicitudViajeMenor>(this.baseUrl, payload, {
      params,
    });
  }
}
