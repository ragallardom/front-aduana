// src/app/pages/solicitudes-aduana/formulario-solicitud/formulario-solicitud.ts

import { Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SolicitudAduanaService } from '../../../services/solicitudes-aduana/solicitud-aduana';
import { SolicitudAduana } from '../../../models/solicitud-aduana';
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

export function menorDeEdadValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) {
    return null;
  }
  const fechaNacimiento = new Date(value);
  const hoy = new Date();
  const fecha18 = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
  if (fechaNacimiento > hoy) {
    return { menorDeEdad: true };
  }
  return fechaNacimiento > fecha18 ? null : { menorDeEdad: true };
}

@Component({
  selector: 'app-formulario-solicitud',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './formulario-solicitud.html',
  styleUrls: ['./formulario-solicitud.scss'],
  animations: [
    trigger('expandCollapse', [
      state(
        'expanded',
        style({ height: '*', opacity: 1, overflow: 'hidden' })
      ),
      state(
        'collapsed',
        style({
          height: '0px',
          opacity: 0,
          overflow: 'hidden',
          margin: '0',
          padding: '0'
        })
      ),
      transition('expanded <=> collapsed', animate('300ms ease-in-out')),
    ]),
  ]
})
export class FormularioSolicitudComponent implements OnInit {
  formulario!: FormGroup;
  errorMsg = '';
  datosMenorVisible = false;
  datosPadreVisible = false;
  datosViajeVisible = false;
  datosDocumentosVisible = false;

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
    this.formulario = this.fb.group({
      nombrePadreMadre: ['', Validators.required],
      relacionMenor: ['', Validators.required],
      documentoPadre: ['', Validators.required],
      telefonoPadre: ['', Validators.required],
      emailPadre: ['', [
        Validators.required,
        Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
      ]],
      tipoSolicitudMenor: ['', Validators.required],
      nombreMenor: ['', Validators.required],
      fechaNacimientoMenor: ['', [Validators.required, menorDeEdadValidator]],
      documentoMenor: ['', Validators.required],
      numeroDocumentoMenor: ['', Validators.required],
      nacionalidadMenor: ['', Validators.required],
      numeroDocumentoPadre: ['', Validators.required],
      fechaViaje: ['', Validators.required],
      numeroTransporte: ['', Validators.required],
      paisOrigen: ['', Validators.required],
      paisDestino: ['', Validators.required],
      motivoViaje: ['', Validators.required],
      // El input file no se asocia directamente a FormControl; lo validamos por código
    });

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
    // Validar campos
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    // Construir payload con los campos básicos
    const f = this.formulario.value;
    const payload: Pick<SolicitudAduana,
      'paisOrigen' | 'paisDestino' | 'fechaViaje' | 'numeroTransporte' | 'motivoViaje'> = {
      paisOrigen: f.paisOrigen,
      paisDestino: f.paisDestino,
      fechaViaje: f.fechaViaje,
      numeroTransporte: f.numeroTransporte,
      motivoViaje: f.motivoViaje,
    };

    this.service
      .crearConAdjunto(payload)
      .subscribe({
        next: () => {
          // Al éxito, navegamos al listado
          this.router.navigate(['/solicitud-aduana']);
        },
        error: (err) => {
          console.error('Error al crear solicitud:', err);
          this.errorMsg = 'Ocurrió un error al crear la solicitud.';
        },
      });

  }

  toggleMenor(): void {
    this.datosMenorVisible = !this.datosMenorVisible;
  }

  togglePadre(): void {
    this.datosPadreVisible = !this.datosPadreVisible;
  }

  toggleViaje(): void {
    this.datosViajeVisible = !this.datosViajeVisible;
  }

  toggleDocumentos(): void {
    this.datosDocumentosVisible = !this.datosDocumentosVisible;
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

  cancelar(): void {
    this.router.navigate(['/solicitud-aduana']);
  }
}

