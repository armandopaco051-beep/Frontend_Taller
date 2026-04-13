import { Injectable } from "@angular/core";
import {HttpClient} from '@angular/common/http'
import { Observable } from "rxjs";
import { environment } from "../../../enviroments/enviroments";
import {Taller, TallerCreate} from '../../models/taller.model';

@Injectable({providedIn: 'root'})
// crear servicio para taller
export class tallerService{
    private apiUrl = `${environment.apiUrl}/talleres`;
    constructor (private http: HttpClient){}
    listar () : Observable<Taller[]>{
        return this.http.get<Taller[]>(this.apiUrl);
    }
    // Listar todos los talleres hace petición GET
    obtener(codigo: number): Observable<Taller> {
    return this.http.get<Taller>(`${this.apiUrl}/${codigo}`);
  }
 // Obtener taller por código hace petición GET
  crear(datos: TallerCreate): Observable<Taller> {
    return this.http.post<Taller>(this.apiUrl, datos);
  }
 // Actualizar taller hace petición PUT
  actualizar(codigo: number, datos: Partial<TallerCreate>): Observable<Taller> {
    return this.http.put<Taller>(`${this.apiUrl}/${codigo}`, datos);
  }
 // Desactivar taller hace petición DELETE
  desactivar(codigo: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${codigo}`);
  }
}
