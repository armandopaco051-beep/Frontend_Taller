import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import {FormsModule} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../core/services/auth.service";

@Component({
    selector : 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl : 'login.component.html',
    styleUrls : ['login.component.scss']
})
export class LoginComponent {
    email = ''; 
    password = ''; 
    loading =false ; 
    error = ''; 
    constructor(private auth: AuthService, private router: Router) {}
    onLogin(){
        this.loading = true ; 
        this.error = ''; 
        this.auth.login({ email: this.email, password: this.password}).subscribe({
             next: () => this.router.navigate(['/dashboard']),
             error: (err) => {
               this.error = err.error?.detail || 'Error al iniciar sesión';
               this.loading = false;
             }
        })
    }
    
}