import { Injectable } from '@angular/core';
import { HttpClient,HttpRequest, 
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject} from 'rxjs';
import { respuesta } from '../models/resp.model';
import jwtDecode, { JwtPayload } from "jwt-decode";
import { UsuarioModel } from '../models/usuario.models';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loggedIn = new BehaviorSubject<boolean>(false);
  public usuario: UsuarioModel;
  private token: string;
  
  constructor( private http: HttpClient, private router:Router ) { }

  registrarUsuario ( usuario ): Observable<respuesta> {
    console.log('URL', `${environment.url}/usuarios`)
    return this.http.post<respuesta>(`${environment.url}/usuarios`, usuario);
  }

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  

  login( cc_usuario: string, contrasena_usuario:string ){
    return this.http.post(`${environment.url}/login`, {cc_usuario, contrasena_usuario})
    .pipe( map (resp => {
        this.guardarToken(resp);
        this.loggedIn.next(true);
        console.log("bu");
        return resp;   
    }))
  }

  public async verificarToken(): Promise<boolean> {

    await this.cargarToken();

    return new Promise(resolve => {
      if (!this.token) {
        this.router.navigate(['/login']);
        return resolve(false);
      }

      this.http.get(`${environment.url}/token`, {headers: this.getHeaders()}).subscribe((resp: any) => {
        if (resp.success) {
          this.usuario = resp.result;
          resolve(true);
        } else {
          this.usuario = null;
          this.router.navigate(['/login']);
          resolve(false);
        }
      },
      () => {
        console.log('Autenticación', 'Error al validar el token', 'error');
      });
    });
  }

  private getHeaders() {
    return new HttpHeaders({
      'x-token': this.token
    });
  }

  private async cargarToken() {
    this.token = await localStorage.getItem('token');
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
    if (token)
    {
      let token_payload = jwtDecode<JwtPayload>(token);
      let expira = token_payload.exp*1000;
      let creacion = token_payload.nbf*1000;
      let ahora = Date.now();
      let rol = token_payload.sub["rol"]

      if( creacion < ahora && ahora < expira){
        //esta autenticado
        this.loggedIn.next(true);
        return true;
      } else {
        this.loggedIn.next(false);
        return false;
      }
    }
    else
    {
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
    
    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {
        const Token = localStorage.getItem("token");
        if (Token) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization",
                    "Bearer " + Token)
            });
            
            return next.handle(cloned);
            
        } else {
            return next.handle(req);
        }
        
    }
}
