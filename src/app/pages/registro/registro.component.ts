import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
    selector: 'app-registro',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './registro.component.html',
    styleUrls: ['./registro.component.scss']
})
export class RegistroComponent {
    form = { codigo:'', nombre: '', apellido: '', email: '', password: '', telefono: '', id_rol: 2 };
    loading = false;
    error = '';
    success = ''; 
    
    constructor(private auth: AuthService, private router: Router) {}

    onRegistro(){
        this.loading = true; 
        this.error = ''; 
        this.auth.registro(this.form).subscribe({
            next: () =>{
              this.success = 'Cuenta creada Correctamente. Redirigiendo.......'; 
              setTimeout(() =>this.router.navigate(['/login']), 2000);      
            },
            error: (err) =>{
                this.error = err.error?.detail || 'Error al crear cuenta'; 
                this.loading = false ; 

            }
        })
    }
    
}