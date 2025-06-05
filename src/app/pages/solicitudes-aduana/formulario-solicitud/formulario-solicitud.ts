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
  archivoSeleccionado: File | null = null;

  // Define los posibles tipos de adjunto (ajusta según tu backend)
  tiposAdjunto = ['comprobante', 'manifiesto', 'factura'];

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
      nombreSolicitante: ['', Validators.required],
      numeroDocumentoPadre: ['', Validators.required],
      motivo: ['', Validators.required],
      paisOrigen: ['', Validators.required],
      tipoAdjunto: ['', Validators.required],
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
  }

  // 2) Capturamos el archivo que el usuario selecciona
  onFileChange(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.archivoSeleccionado = event.target.files[0];
    }
  }

  // 3) Manejo del submit
  guardar(): void {
    // Validar campos
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    if (!this.archivoSeleccionado) {
      this.errorMsg = 'Debes seleccionar un archivo.';
      return;
    }

    // Construir payload con los campos básicos
    const f = this.formulario.value;
    const payload: Omit<
      SolicitudAduana,
      'id' | 'estado' | 'fechaCreacion' | 'tipoDocumento' | 'numeroDocumento'
    > = {
      nombreSolicitante: f.nombreSolicitante,
      motivo: f.motivo,
      paisOrigen: f.paisOrigen,
    };
    const tipoAdj = f.tipoAdjunto;

    this.service
      .crearConAdjunto(payload, tipoAdj, this.archivoSeleccionado)
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

