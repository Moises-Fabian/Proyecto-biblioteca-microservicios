import {Subject} from 'rxjs';
import { Usuario } from './usuario.model';
import { LoginData } from './login-data.model';
import {Router} from '@angular/router';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Token } from '@angular/compiler/src/ml_parser/lexer';

@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  private token!: string;
  baseUrl = environment.baseUrl;

  seguridadCambio = new Subject<boolean>();
  private usuario!: Usuario | null;

  cargarUsuario(): void {
    const tokenBrowser = localStorage.getItem('token');
    if( !tokenBrowser){
      return;
    }

    this.token = tokenBrowser;
    this.seguridadCambio.next(true);

    this.http.get<Usuario>(this.baseUrl + 'usuario')
    .subscribe( (Response) => {
      console.log('login respuesta', Response);

      this.token = Response.token;
      this.usuario = {
        email: Response.email,
        nombre: Response.nombre,
        apellido: Response.apellido,
        token: Response.token,
        password: '',
        username: Response.username,
        usuarioId: Response.usuarioId
      };
      this.seguridadCambio.next(true);
      localStorage.setItem('token', Response.token);
    });
  }

  obtenerToken(): string{
    return this.token;
  }

  constructor(private router: Router, private http: HttpClient){

  }

  registrarUsuario(usr: Usuario): void {
    this.http
      .post<Usuario>(this.baseUrl + 'usuario/registrar', usr)
      .subscribe((response) => {
        this.token = response.token;
        this.usuario = {
          email: response.email,
          nombre: response.nombre,
          apellido: response.apellido,
          token: response.token,
          password: '',
          username: response.username,
          usuarioId: response.usuarioId,
        };
        this.seguridadCambio.next(true);
        localStorage.setItem('token', response.token);
        this.router.navigate(['/']);
      });
  }

  login(loginData: LoginData): void {
    this.http.post<Usuario>(this.baseUrl + 'usuario/login', loginData)
    .subscribe( (Response) => {
      console.log('login respuesta', Response);

      this.token = Response.token;
      this.usuario = {
        email: Response.email,
        nombre: Response.nombre,
        apellido: Response.apellido,
        token: Response.token,
        password: '',
        username: Response.username,
        usuarioId: Response.usuarioId
      };
      this.seguridadCambio.next(true);
      localStorage.setItem('token', Response.token);
      this.router.navigate(['/']);
    });
  }

  salirSesion() {
    this.usuario = null;
    this.seguridadCambio.next(false);
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  obtenerUsuario() {
    return { ...this.usuario };
  }

  onSesion(){
    return this.token != null;
  }
}
