// src/app/pages/solicitudes-aduana/formulario-solicitud/formulario-solicitud.ts

import { Component, OnInit } from '@angular/core';
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
  const rutPattern = /^[0-9]+-[0-9kK]{1}$/;
  if (!rutPattern.test(value)) {
    return { rutInvalido: true };
  }
  const [num, dv] = value.split('-');
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
      fechaNacimientoMenor: ['', Validators.required],
      documentoMenor: ['', Validators.required],
      numeroDocumentoMenor: ['', Validators.required],
      nacionalidadMenor: ['', Validators.required],
      numeroDocumentoPadre: ['', Validators.required],
      paisOrigen: ['', Validators.required],
      paisDestino: ['', Validators.required],
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
    const payload: Pick<SolicitudAduana, 'paisOrigen' | 'paisDestino'> = {
      paisOrigen: f.paisOrigen,
      paisDestino: f.paisDestino,
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

  cancelar(): void {
    this.router.navigate(['/solicitud-aduana']);
  }
}

