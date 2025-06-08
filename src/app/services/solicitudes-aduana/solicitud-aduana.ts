// src/app/services/solicitudes-aduana/solicitud-aduana.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudAduana } from '../../models/solicitud-aduana';

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
  private readonly baseUrl = '/api/solicitudes/adjuntar';

  constructor(private http: HttpClient) {}

  /**
   * Envía la solicitud como JSON junto con el archivo codificado en Base64.
   * Esto evita problemas de compatibilidad con multipart/form-data cuando el
   * backend sólo acepta application/json.
   */
  crearConAdjunto(
    data: Omit<SolicitudAduana, 'id' | 'estado' | 'fechaCreacion'>,
    tipoDocumento = '',
    numeroDocumento = '',
    archivoBase64 = ''
  ): Observable<SolicitudAduana> {
    const payload: any = {
      ...data,
    };
    if (tipoDocumento) {
      payload.tipoDocumentoAdjunto = tipoDocumento;
    }
    if (archivoBase64) {
      payload.archivoBase64 = archivoBase64;
    }

    let params: HttpParams | undefined;
    if (data.nombreSolicitante) {
      params = new HttpParams().set(
        'nombreSolicitante',
        data.nombreSolicitante
      );
    }

    if (tipoDocumento) {
      params = (params ?? new HttpParams()).set('tipoDocumento', tipoDocumento);
    }

    if (numeroDocumento) {
      params = (params ?? new HttpParams()).set(
        'numeroDocumento',
        numeroDocumento
      );
    }

    return this.http.post<SolicitudAduana>(this.baseUrl, payload, {
      params,
    });
  }
}
