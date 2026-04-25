import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../models/usuario.model';

interface NavItem {
  label: string;
  path: string;
  exact?: boolean;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  usuario: Usuario | null = null;
  menuItems: NavItem[] = [];
  idTallerNav = 0;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.usuario = this.auth.getUsuarioActual();
    this.configurarMenu();

    this.auth.usuario$.subscribe(usuario => {
      this.usuario = usuario;
      this.configurarMenu();
    });
  }

  esAdminPlataforma(): boolean {
    return this.auth.esAdminPlataforma();
  }

  esAdminTaller(): boolean {
    return this.auth.esAdminTaller();
  }

  private configurarMenu(): void {
    this.idTallerNav = Number(localStorage.getItem('id_taller') || 0);

    if (this.esAdminPlataforma()) {
      this.menuItems = [
        { label: 'Salpicadero', path: '/dashboard', exact: true },
        { label: 'Usuarios', path: '/usuarios' },
        { label: 'Roles', path: '/roles' },
        { label: 'Talleres', path: '/talleres' },
        { label: 'Técnicos', path: '/tecnicos' },
        { label: 'Bitácora', path: '/bitacora' },
        { label: 'Perfil', path: '/perfil' }
      ];
      return;
    }

    if (this.esAdminTaller()) {
      if (!this.idTallerNav) {
        this.menuItems = [];
        return;
      }

      this.menuItems = [
        { label: 'Dashboard', path: `/admin-taller/dashboard/${this.idTallerNav}`, exact: true },
        { label: 'Técnicos', path: '/admin-taller/tecnicos' },
        { label: 'Bitácora', path: '/bitacora' },
        { label: 'Perfil', path: '/perfil' }
      ];
      return;
    }

    this.menuItems = [];
  }

  getBrandLink(): string {
    if (this.esAdminTaller()) {
      return this.idTallerNav ? `/admin-taller/dashboard/${this.idTallerNav}` : '/login';
    }

    if (this.esAdminPlataforma()) {
      return '/dashboard';
    }

    return '/';
  }

  logout(): void {
    this.auth.logout();
    localStorage.removeItem('id_taller');
    this.router.navigate(['/login']);
  }
}