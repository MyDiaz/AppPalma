import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { AuthService } from './Servicios/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent{
  title = 'AppPalma';
  estaAutenticado: boolean;


  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.isLoggedIn.subscribe(value => {
      this.estaAutenticado = value;
    });
  }
}
