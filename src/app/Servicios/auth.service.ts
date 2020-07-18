import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.models';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = 'https://identitytoolkit.googleapis.com/v1';
  private api_key = 'AIzaSyDbIXzK5Wcj5T-z1IqSJFe9XB0InSmKRtA';
  userToken: string;

//sign ip //https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=[API_KEY]
// sign in https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=[API_KEY]

  constructor( private http: HttpClient ) { }

  login( usuario:UsuarioModel){

    const authData = {
      ...usuario,
      returnSecureToken: true
    };

    return this.http.post(
      `${ this.url }/accounts:signInWithPassword?key=${ this.api_key}`,
      authData).pipe(
      map( resp => {
        this.guardarToken(resp['idToken']);
        return resp;
      })
    );
  }

  nuevoUsuario ( usuario:UsuarioModel ) {
    const authData = {
      ...usuario,
      returnSecureToken: true
    };

    return this.http.post(
      `${ this.url }/accounts:signUp?key=${ this.api_key}`,
      authData
    ).pipe(
      map( resp => {
        console.log("entro en el map")
        this.guardarToken(resp['idToken']);
        return resp;
      })
    );
  }

  private guardarToken( idToken:string ){
    this.userToken = idToken;
    localStorage.setItem('token', idToken);

    let hoy = new Date();
    hoy.setSeconds(3600);

    localStorage.setItem('expira', hoy.getTime.toString());
  }

  leerToken(){
    if (localStorage.getItem('token')){
      this.userToken = localStorage.getItem('token');
    } else { 
      this.userToken = '';
    }

    return this.userToken;
  }

  //saber si el usuario esta autenticado
  estaAutenticado(): boolean{
    if (this.userToken.length < 2) {
      return false;
    }

    const expira = Number(localStorage.getItem('expira'));
    const expiraDate = new Date();
    expiraDate.setTime(expira);

    if( expiraDate > new Date()){
      return true;
    }else{
      return false;
    }
  }

  logout(){
    localStorage.removeItem('token');
  }

}