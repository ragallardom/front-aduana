import { TestBed } from '@angular/core/testing';

import { SolicitudAduanaService } from './solicitud-aduana';

describe('SolicitudAduana', () => {
  let service: SolicitudAduanaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SolicitudAduanaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
