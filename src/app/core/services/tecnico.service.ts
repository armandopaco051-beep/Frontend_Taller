import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroments';
import { Tecnico, TecnicoCreate } from '../../models/tecnico.models';

@Injectable({providedIn: 'root'})
export class TecnicoService{
    private apiUrl = `${environment.apiUrl}/tecnicos`;
    constructor (private http: HttpClient) {}
    // Listar técnicos por taller
    listarPorTaller(id_taller: number): Observable<Tecnico[]> {
    return this.http.get<Tecnico[]>(`${this.apiUrl}/taller/${id_taller}`);
  }

  // Crear técnico
  crear(datos: TecnicoCreate): Observable<Tecnico> {
    return this.http.post<Tecnico>(this.apiUrl, datos);
  }

  // Actualizar técnico hace petición PUT
 actualizar(codigo: number, datos: Partial<Tecnico>): Observable<Tecnico> {
  return this.http.patch<Tecnico>(`${this.apiUrl}/${codigo}`, datos);
  }

  // Eliminar técnico hace petición DELETE
  eliminar(codigo: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${codigo}`);
  }
}
