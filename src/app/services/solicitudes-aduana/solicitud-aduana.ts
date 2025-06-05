// src/app/services/solicitudes-aduana/solicitud-aduana.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
   * Envía la solicitud utilizando `multipart/form-data`.
   */
  crearConAdjunto(
    data: Pick<SolicitudAduana, 'paisOrigen' | 'paisDestino'>,
    tipoAdjunto?: string,
    archivo?: File
  ): Observable<SolicitudAduana> {
    const formData = new FormData();
    formData.append('paisOrigen', data.paisOrigen);
    if (data.paisDestino) {
      formData.append('paisDestino', data.paisDestino);
    }
    if (tipoAdjunto) {
      formData.append('tipoAdjunto', tipoAdjunto);
    }
    if (archivo) {
      formData.append('archivo', archivo, archivo.name);
    }

    return this.http.post<SolicitudAduana>(this.baseUrl, formData);
  }
}

