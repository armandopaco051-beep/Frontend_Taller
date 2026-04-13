export interface Usuario {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    telefono :string ;
    estado :boolean;
    fecha_registro:string ; 
    rol: string;
    id_rol: number; 
}
export interface loginRequest {
    email: string;
    password: string;
}
export interface RegisterRequest {
  codigo: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  id_rol: number;
}

export interface Token{
    access_token: string;
    token_type: string;
    usuario: Usuario;
}
export interface Rol{
    id: number; 
    nombre: string;
}
