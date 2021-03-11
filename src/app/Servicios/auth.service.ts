import { Injectable } from '@angular/core';
import { HttpClient,HttpRequest, 
  HttpHandler,
  HttpEvent,
  HttpInterceptor } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject} from 'rxjs';
import { respuesta } from '../models/resp.model';
import jwtDecode, { JwtPayload } from "jwt-decode";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url_autenticacion:string = 'http://localhost:3000'; 
  private loggedIn = new BehaviorSubject<boolean>(false);
  
  constructor( private http: HttpClient ) { }

  registrarUsuario ( usuario ): Observable<respuesta> {
    return this.http.post<respuesta>(`${this.url_autenticacion}/registro`, usuario)
    .pipe(map (resp =>{
        return resp;
      })
    );
  }

  get isLoggedIn() {
    return this.loggedIn.asObservable();
  }

  login( cc_usuario: string, contrasena_usuario:string ){
    return this.http.post(`${this.url_autenticacion}/login`, {cc_usuario, contrasena_usuario})
    .pipe( map (resp => {
      this.guardarToken(resp);
      
        
        this.loggedIn.next(true);
        console.log("bu");
      
      return resp;   
    }))
  }

  private guardarToken( authResult ){
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('expira', authResult.vence);
    localStorage.setItem('creacion', authResult.creacion);
  }

  getIdUsuario(){
    let token = localStorage.getItem('token');
    return jwtDecode<JwtPayload>(token).sub["cc_usuario"];
  }

  
  
  /*estaAutenticado(){
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
        return true;
      }else{
        return false;
      }
    }
    else
    {
      return false;
    }
  }*/

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