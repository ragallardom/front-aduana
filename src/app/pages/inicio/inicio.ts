import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss']
})
export class InicioComponent {}
