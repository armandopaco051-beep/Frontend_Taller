export interface Taller{
    codigo :number ; 
    nombre : string ;
    telefono : string ;
    direccion : string ;
    latitud: number ;
    longitud: number ;
    activo : boolean ;
}

export interface TallerCreate{
    nombre :string 
    telefono : string; 
    direccion:string ;
    latitud: number;
    longitud :number;

}
   
