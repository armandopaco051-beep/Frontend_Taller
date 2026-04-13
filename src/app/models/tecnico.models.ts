export interface Tecnico{
    codigo :number ; 
    disponible : boolean ;
    latitud: number ;
    longitud: number ;
    telefono: string; 
    id_taller: number; 
    id_usuario: string; 
    activo : boolean ;
}

export interface TecnicoCreate{
   telefono : string ;
   latitud :number; 
   longitud: number; 
   id_taller: number; 
   id_usuario: string; 
}
