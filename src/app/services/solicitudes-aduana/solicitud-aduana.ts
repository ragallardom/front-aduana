// src/app/services/solicitudes-aduana/solicitud-aduana.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudAduana } from '../../models/solicitud-aduana';

@Injectable({ providedIn: 'root' })
export class SolicitudAduanaService {

  private readonly baseUrl = 'http://localhost:8080/api/solicitudes';

  constructor(private http: HttpClient) {}

  /**
   * Envía la solicitud como JSON junto con el archivo codificado en Base64.
   * Esto evita problemas de compatibilidad con multipart/form-data cuando el
   * backend sólo acepta application/json.
   */
  crearConAdjunto(
    data: Omit<SolicitudAduana, 'id' | 'estado' | 'fechaCreacion'>,
    tipoDocumento: string,
    archivoBase64: string
  ): Observable<SolicitudAduana> {
    const payload = {
      ...data,
      tipoDocumentoAdjunto: tipoDocumento,
      archivoBase64
    };
    return this.http.post<SolicitudAduana>(this.baseUrl, payload);
  }
}
