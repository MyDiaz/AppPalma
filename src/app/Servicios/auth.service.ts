import { Injectable } from '@angular/core';
import { HttpClient,HttpRequest, 
  HttpHandler,
  HttpEvent,
  HttpInterceptor } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject} from 'rxjs';
import { respuesta } from '../models/resp.model';
import jwtDecode, { JwtPayload } from "jwt-decode";
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = new BehaviorSubject<boolean>(false);
  
  constructor( private http: HttpClient ) { }

  registrarUsuario ( usuario ): Observable<respuesta> {
    console.log('URL', `${environment.url}/usuarios`)
    return this.http.post<respuesta>(`${environment.url}/usuarios`, usuario);
  }

  get isLoggedIn() {
    return this.loggedIn;
  }

  login(cc_usuario: string, contrasena_usuario:string): Observable<any> {
    return this.http.post(`${environment.url}/login`, {cc_usuario, contrasena_usuario})
    .pipe(map(resp => {
        this.guardarToken(resp);
        this.loggedIn.next(true);
        return resp;
    }));
  }

  guardarToken( authResult ){
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('expira', authResult.vence);
    localStorage.setItem('creacion', authResult.creacion);
  }

  getIdUsuario(){
    let token = localStorage.getItem('token');
    return jwtDecode<JwtPayload>(token).sub["cc_usuario"];
  }

  estaAutenticado(){
    let token = localStorage.getItem('token');
    if (token) {
      let token_payload = jwtDecode<JwtPayload>(token);
      let expira = token_payload.exp*1000;
      let creacion = token_payload.nbf*1000;
      let ahora = Date.now();
      if ( creacion < ahora && ahora < expira) {
        //esta autenticado
        this.loggedIn.next(true);
        return true;
      } else {
        this.loggedIn.next(false);
        return false;
      }
    } else {
      return false;
    }
  }

  cerrarSesion() {
    this.loggedIn.next(false);
    localStorage.removeItem('token');
  }

  /*recuperacionContraseña(correo_usuario: string, nueva_contrasena:string, codigo_usuario:string):Observable<any>{
    return this.http.post<any>(`${this.url}/recuperacion`,{ correo_usuario, nueva_contrasena, codigo_usuario }).pipe(
      map (  resp => {
        return resp;
      })
    )
  }*/  
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const token = localStorage.getItem("token");
      if (token) {
          const cloned = req.clone({
              headers: req.headers.set("Authorization", "Bearer " + token)
          });
          return next.handle(cloned);
      } else {
          return next.handle(req);
      }
    }
}
