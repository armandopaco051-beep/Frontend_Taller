import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {NavbarComponent} from '../../shared/navbar/navbar.component';
import {tallerService} from '../../core/services/taller.service';
import { TecnicoService } from '../../core/services/tecnico.service';
import {AuthService} from '../../core/services/auth.service';

@Component({
selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  totalTalleres = 0;
  totalTecnicos = 0;
  usuario: any;

  stats = [
    { label: 'Talleres Activos', value: 0, icon: '🏪', color: '#FF6B35' },
    { label: 'Técnicos Disponibles', value: 0, icon: '🔧', color: '#4CAF50' },
    { label: 'Incidentes Hoy', value: 0, icon: '🚨', color: '#FF9800' },
    { label: 'Atenciones Completadas', value: 0, icon: '✅', color: '#2196F3' }
  ];

_Today: string|number|Date = new Date();

  constructor(
    private tallerService: tallerService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.usuario = this.auth.getUsuarioStorage();
    this.tallerService.listar().subscribe(talleres => {
      this.stats[0].value = talleres.length;
    });
  }
}