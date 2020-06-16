import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
     <!-- Modal -->
     <div class="modal fade" id="staticBackdrop" data-backdrop="static" tabindex="-1" role="dialog" aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <b class="modal-title">Confirmación</b>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
                </div>
                <div class="modal-body">
                    ¿Esta seguro que quiere guardar?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal"> Confirmar </button>
                </div>
            </div>
        </div>
    </div>
  `,
  styles: []
})
export class ModalComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
