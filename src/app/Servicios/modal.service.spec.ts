import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ModalService } from './modal.service';
import { createMatDialogSpy } from 'src/testing/spec-helpers';
import { ModalComponent } from '../modal/modal.component';

describe('ModalService', () => {
  let service: ModalService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogSpy = createMatDialogSpy();
    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: dialogSpy }],
    });
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open the modal with row data', () => {
    service.openModal({ id: 1 });

    expect(dialogSpy.open).toHaveBeenCalledWith(ModalComponent, {
      data: { rowData: { id: 1 } },
    });
  });

  it('should close the modal', () => {
    service.closeModal();

    expect(dialogSpy.closeAll).toHaveBeenCalled();
  });
});
