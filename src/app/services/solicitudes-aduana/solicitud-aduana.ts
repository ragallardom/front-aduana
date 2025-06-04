// src/app/services/solicitudes-aduana/solicitud-aduana.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SolicitudAduana } from '../../models/solicitud-aduana';

@Injectable({ providedIn: 'root' })
export class SolicitudAduanaService {
  // Debe coincidir con @RequestMapping("/api/solicitudAduana") en tu backend
  private readonly baseUrl = '/api/solicitudAduana';

  constructor(private http: HttpClient) {}

  /**
   * Crea una nueva SolicitudAduana enviando multipart/form-data:
   *  - 'solicitud': JSON con los campos básicos
   *  - 'paisOrigen': se envía por separado (si tu backend lo requiere explícitamente)
   *  - 'tipoDocumento': tipo de adjunto que identifica el archivo
   *  - 'archivo': el File que seleccionó el usuario
   */
  crearConAdjunto(
    data: Omit<SolicitudAduana, 'id' | 'estado' | 'fechaCreacion'>,
    tipoDocumento: string,
    archivo: File
  ): Observable<SolicitudAduana> {
    const formData = new FormData();

    // 1) Adjuntamos el JSON de la solicitud (sin los campos que el backend asigna)
    formData.append(
      'solicitud',
      new Blob([JSON.stringify(data)], { type: 'application/json' })
    );

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
