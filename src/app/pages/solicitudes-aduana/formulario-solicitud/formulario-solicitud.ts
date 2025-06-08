// src/app/pages/solicitudes-aduana/formulario-solicitud/formulario-solicitud.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SolicitudAduanaService } from '../../../services/solicitudes-aduana/solicitud-aduana';
import { SolicitudViajeMenor } from '../../../models/solicitud-viaje-menor';
import { RouterModule } from '@angular/router';

export function rutValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) {
    return null;
  }
  const clean = value.replace(/\./g, '');
  const rutPattern = /^[0-9]+-[0-9kK]{1}$/;
  if (!rutPattern.test(clean)) {
    return { rutInvalido: true };
  }
  const [num, dv] = clean.split('-');
  let sum = 0;
  let multiplier = 2;
  for (let i = num.length - 1; i >= 0; i--) {
    sum += parseInt(num.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const expected = 11 - (sum % 11);
  const dvCalc = expected === 11 ? '0' : expected === 10 ? 'K' : expected.toString();
  return dvCalc.toUpperCase() === dv.toUpperCase() ? null : { rutInvalido: true };
}

export function fechaNacimientoMenorValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) {
    return null;
  }
  const fechaNacimiento = new Date(value);
  const hoy = new Date();
  const fecha18 = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
  if (fechaNacimiento > hoy) {
    return { fechaFutura: true };
  }
  return fechaNacimiento > fecha18 ? null : { mayorDeEdad: true };
}

export const documentosDistintosValidator: ValidatorFn = (
  group: AbstractControl
): ValidationErrors | null => {
  const docMenor = group.get('numeroDocumentoMenor')?.value as string;
  const docPadre = group.get('numeroDocumentoPadre')?.value as string;
  if (
    docMenor &&
    docPadre &&
    docMenor.trim().toLowerCase() === docPadre.trim().toLowerCase()
  ) {
    return { documentoDuplicado: true };
  }
  return null;
};

export function fechaViajeValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) {
    return null;
  }
  const fechaViaje = new Date(value);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const limite = new Date(hoy);
  limite.setFullYear(limite.getFullYear() + 1);
  if (fechaViaje < hoy) {
    return { fechaPasada: true };
  }
  if (fechaViaje > limite) {
    return { fechaLejana: true };
  }
  return null;
}

@Component({
  selector: 'app-formulario-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './formulario-solicitud.html',
  styleUrls: ['./formulario-solicitud.scss']
})
export class FormularioSolicitudComponent implements OnInit {
  formulario!: FormGroup;
  errorMsg = '';
  successMsg = '';
  submitAttempted = false;

  adjuntos: Record<string, File | null> = {
    idMenor: null,
    certNacimiento: null,
    permisoNotarial: null,
    idPadres: null,
    pasajeItinerario: null,
  };

  constructor(
    private fb: FormBuilder,
    private service: SolicitudAduanaService,
    public router: Router
  ) {}

  ngOnInit(): void {
    // 1) Construimos el FormGroup con validaciones
    this.formulario = this.fb.group(
      {
        nombrePadreMadre: ['', Validators.required],
        relacionMenor: ['', Validators.required],
        documentoPadre: ['', Validators.required],
        telefonoPadre: ['', Validators.required],
        emailPadre: [
          '',
          [Validators.required, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)],
        ],
        tipoSolicitudMenor: ['', Validators.required],
        nombreMenor: ['', Validators.required],
        fechaNacimientoMenor: ['', [Validators.required, fechaNacimientoMenorValidator]],
        documentoMenor: ['', Validators.required],
        numeroDocumentoMenor: ['', Validators.required],
        nacionalidadMenor: ['', Validators.required],
        numeroDocumentoPadre: ['', Validators.required],
        fechaViaje: ['', [Validators.required, fechaViajeValidator]],
        numeroTransporte: ['', Validators.required],
        paisOrigen: ['', Validators.required],
        paisDestino: ['', Validators.required],
        motivoViaje: ['', Validators.required],
        // El input file no se asocia directamente a FormControl; lo validamos por código
      },
      { validators: documentosDistintosValidator }
    );

    this.formulario.get('documentoPadre')?.valueChanges.subscribe((tipo) => {
      const control = this.formulario.get('numeroDocumentoPadre');
      if (tipo === 'RUT') {
        control?.setValidators([Validators.required, rutValidator]);
      } else {
        control?.setValidators([Validators.required]);
      }
      control?.updateValueAndValidity();
    });

    this.formulario.get('documentoMenor')?.valueChanges.subscribe((tipo) => {
      const control = this.formulario.get('numeroDocumentoMenor');
      if (tipo === 'RUT') {
        control?.setValidators([Validators.required, rutValidator]);
      } else {
        control?.setValidators([Validators.required]);
      }
      control?.updateValueAndValidity();
    });

    this.formulario.get('tipoSolicitudMenor')?.valueChanges.subscribe((tipo) => {
      const paisOrigenCtrl = this.formulario.get('paisOrigen');
      const paisDestinoCtrl = this.formulario.get('paisDestino');
      if (tipo === 'Entrada') {
        paisOrigenCtrl?.setValidators([Validators.required]);
        paisDestinoCtrl?.clearValidators();
        paisDestinoCtrl?.setValue('');
      } else if (tipo === 'Salida') {
        paisDestinoCtrl?.setValidators([Validators.required]);
        paisOrigenCtrl?.clearValidators();
        paisOrigenCtrl?.setValue('');
      } else {
        paisOrigenCtrl?.clearValidators();
        paisDestinoCtrl?.clearValidators();
      }
      paisOrigenCtrl?.updateValueAndValidity();
      paisDestinoCtrl?.updateValueAndValidity();
    });
  }

  // Manejo del submit
  guardar(): void {
    this.submitAttempted = true;
    // Validar campos
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.scrollToFirstError();
      return;
    }
    // Construir payload con los campos básicos
    const f = this.formulario.value;
    const payload: Omit<
      SolicitudViajeMenor,
      'id' | 'estado' | 'fechaCreacion' | 'documentos'
    > = {
      tipoSolicitudMenor: f.tipoSolicitudMenor,
      nombreMenor: f.nombreMenor,
      fechaNacimientoMenor: f.fechaNacimientoMenor,
      documentoMenor: f.documentoMenor,
      numeroDocumentoMenor: f.numeroDocumentoMenor,
      nacionalidadMenor: f.nacionalidadMenor,
      nombrePadreMadre: f.nombrePadreMadre,
      relacionMenor: f.relacionMenor,
      documentoPadre: f.documentoPadre,
      numeroDocumentoPadre: f.numeroDocumentoPadre,
      telefonoPadre: f.telefonoPadre,
      emailPadre: f.emailPadre,
      fechaViaje: f.fechaViaje,
      numeroTransporte: f.numeroTransporte,
      paisOrigen: f.paisOrigen,
      paisDestino: f.paisDestino,
      motivoViaje: f.motivoViaje,
    };

    const adjunto = this.adjuntos['idMenor'] ?? undefined;
    this.service
      .crearConAdjunto(
        payload,
        'idMenor',
        f.numeroDocumentoMenor,
        adjunto
      )
      .subscribe({
        next: () => {
          this.successMsg = 'Solicitud enviada correctamente.';
          this.errorMsg = '';
          setTimeout(() => this.router.navigate(['/solicitud-aduana']), 1500);
        },
        error: (err) => {
          console.error('Error al crear solicitud:', err);
          this.errorMsg = 'Ocurrió un error al crear la solicitud.';
        },
      });

  }


  formatearRut(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9kK]/g, '').toUpperCase();
    if (value.length > 1) {
      const cuerpo = value.slice(0, -1);
      const dv = value.slice(-1);
      let formatted = '';
      for (let i = cuerpo.length - 1, j = 1; i >= 0; i--, j++) {
        formatted = cuerpo.charAt(i) + formatted;
        if (j % 3 === 0 && i !== 0) {
          formatted = '.' + formatted;
        }
      }
      formatted += '-' + dv;
      input.value = formatted;
    } else {
      input.value = value;
    }
    this.formulario.get(controlName)?.setValue(input.value, { emitEvent: false });
  }

  onArchivoSeleccionado(event: Event, tipo: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.adjuntos[tipo] = input.files[0];
    }
  }

  private tieneErroresMenor(): boolean {
    return (
      !!this.formulario.get('tipoSolicitudMenor')?.invalid ||
      !!this.formulario.get('nombreMenor')?.invalid ||
      !!this.formulario.get('fechaNacimientoMenor')?.invalid ||
      !!this.formulario.get('documentoMenor')?.invalid ||
      !!this.formulario.get('numeroDocumentoMenor')?.invalid ||
      !!this.formulario.get('nacionalidadMenor')?.invalid ||
      !!this.formulario.hasError('documentoDuplicado')
    );
  }

  private tieneErroresPadre(): boolean {
    return (
      !!this.formulario.get('nombrePadreMadre')?.invalid ||
      !!this.formulario.get('relacionMenor')?.invalid ||
      !!this.formulario.get('documentoPadre')?.invalid ||
      !!this.formulario.get('numeroDocumentoPadre')?.invalid ||
      !!this.formulario.get('telefonoPadre')?.invalid ||
      !!this.formulario.get('emailPadre')?.invalid ||
      !!this.formulario.hasError('documentoDuplicado')
    );
  }

  private tieneErroresViaje(): boolean {
    return (
      !!this.formulario.get('fechaViaje')?.invalid ||
      !!this.formulario.get('numeroTransporte')?.invalid ||
      !!this.formulario.get('paisOrigen')?.invalid ||
      !!this.formulario.get('paisDestino')?.invalid ||
      !!this.formulario.get('motivoViaje')?.invalid
    );
  }

  private tieneErroresDocumentos(): boolean {
    return false; // no validaciones de adjuntos
  }

  private scrollToFirstError(): void {
    setTimeout(() => {
      const first = document.querySelector('.ng-invalid') as HTMLElement;
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  cancelar(): void {
    this.router.navigate(['/solicitud-aduana']);
  }
}

