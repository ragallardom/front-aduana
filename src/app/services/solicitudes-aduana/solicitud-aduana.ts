// src/app/services/solicitudes-aduana/solicitud-aduana.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudAduana } from '../../models/solicitud-aduana';

@Injectable({ providedIn: 'root' })
export class SolicitudAduanaService {
   * Envía la solicitud como JSON junto con el archivo codificado en Base64.
   * Esto evita problemas de compatibilidad con multipart/form-data cuando el
   * backend sólo acepta application/json.
    archivoBase64: string
    const payload = {
      ...data,
      tipoDocumentoAdjunto: tipoDocumento,
      archivoBase64
    };
    return this.http.post<SolicitudAduana>(this.baseUrl, payload);

    // 2) Si tu controlador espera explícitamente un RequestParam("paisOrigen"):
    formData.append('paisOrigen', data.paisOrigen);

    // 3) Tipo de documento adjunto
    formData.append('tipoDocumento', tipoDocumento);

    // 4) El archivo en sí
    formData.append('archivo', archivo, archivo.name);

    // Hacemos POST y retornamos el Observable<SolicitudAduana>
    return this.http.post<SolicitudAduana>(this.baseUrl, formData);
  }
}
