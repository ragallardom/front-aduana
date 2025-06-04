import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioSolicitudComponent } from './formulario-solicitud';

describe('FormularioSolicitudComponent', () => {
  let component: FormularioSolicitudComponent;
  let fixture: ComponentFixture<FormularioSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioSolicitudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
