import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable ,BehaviorSubject } from "rxjs";
import {tap} from "rxjs/operators"; 
import { loginRequest, RegisterRequest, Token, Usuario } from "../../models/usuario.model";
import { environment } from "../../../enviroments/enviroments";

@Injectable({providedIn: 'root'})
export class AuthService {
    private apiUrl = environment.apiUrl;
    private usuarioSubject = new BehaviorSubject<Usuario | null>(this.getUsuarioStorage());
    usuario$ = this.usuarioSubject.asObservable();

    constructor(private http: HttpClient) {}
    // CU-01
    registro(datos: RegisterRequest) : Observable<Usuario>{
        return this.http.post<Usuario>(`${this.apiUrl}/auth/registro`, datos);

    }

   // CU-02
    login(datos: loginRequest): Observable<Token>{
        return this.http.post<Token>(`${this.apiUrl}/auth/login`, datos).pipe(
            tap (response =>{
                localStorage.setItem('token', response.access_token);
                localStorage.setItem('usuario',JSON.stringify(response.usuario));
                this.usuarioSubject.next(response.usuario);
            })
        );
    }
    // CU-03
    recuperarPassword(email: string) : Observable<any>{
        return this.http.post(`${this.apiUrl}/auth/recuperar-password`, {email});
    }
    // CU-04
    cambiarPassword(token: string, newPassword: string) : Observable<any>{
        return this.http.put(`${this.apiUrl}/auth/cambiar-password`, { email: token, new_password: newPassword });

    }
    // CU-05
    logout() : void{
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.usuarioSubject.next(null);
    }
    getToken () : string | null{
        return localStorage.getItem('token');
    }
    isLoggedIn() : boolean {
        return !!this.getToken(); 
    }
    getUsuarioStorage(): Usuario | null{
        const u = localStorage.getItem('usuario');
        return u ? JSON.parse(u) : null;
    }
}
