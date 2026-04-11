import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ModalService } from './modal.service';
import { createMatDialogSpy } from 'src/testing/spec-helpers';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: createMatDialogSpy() }],
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
