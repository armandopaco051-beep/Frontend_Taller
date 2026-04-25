import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { TecnicoService } from '../../core/services/tecnico.service';
import { DashboardTallerResponse, SolicitudPendienteTaller } from '../../models/dashboard_taller.model';
import { Tecnico } from '../../models/tecnico.models';

@Component({
  selector: 'app-dashboard-taller',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, NavbarComponent],
  templateUrl: './dashboard-taller.component.html',
  styleUrls: ['./dashboard-taller.component.scss']
})
export class DashboardTallerComponent implements OnInit {
  idTaller = 0;
  loading = true;
  error = '';

  stats = {
    total_solicitudes: 0,
    pendientes: 0,
    aceptadas: 0,
    completadas: 0,
    total_tecnicos: 0,
    tecnicos_disponibles: 0
  };

  solicitudes: SolicitudPendienteTaller[] = [];
  tecnicos: Tecnico[] = [];

  categorias: Record<number, string> = {
    1: 'Batería',
    2: 'Llanta',
    3: 'Motor',
    4: 'Choque',
    5: 'Otros'
  };

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private tecnicoService: TecnicoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.idTaller = Number(params.get('idTaller') || 0);

      const idGuardado = Number(localStorage.getItem('id_taller') || 0);

      if (!this.idTaller) {
        this.loading = false;
        this.error = 'No se recibió el id del taller';
        return;
      }

      if (idGuardado && idGuardado !== this.idTaller) {
        this.loading = false;
        this.error = 'No tienes acceso a este taller';
        return;
      }

      localStorage.setItem('id_taller', String(this.idTaller));
      this.cargarDashboard();
      this.cargarTecnicos();
    });
  }

  cargarDashboard(): void {
    this.loading = true;

    this.dashboardService.getTaller(this.idTaller).subscribe({
      next: (data: DashboardTallerResponse) => {
        this.stats = data.stats;
        this.solicitudes = data.solicitudes_pendientes || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.error = err.error?.detail || 'Error al cargar dashboard del taller';
        this.loading = false;
      }
    });
  }

  cargarTecnicos(): void {
    this.tecnicoService.listarMisTecnicos().subscribe({
      next: (data: Tecnico[]) => {
        this.tecnicos = data || [];
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  getNombreCategoria(id: number): string {
    return this.categorias[id] || 'Otros';
  }

  getEstadoTecnico(tecnico: Tecnico): string {
    return tecnico.disponibilidad ? 'Disponible' : 'Ocupado';
  }

  getClaseTecnico(tecnico: Tecnico): string {
    return tecnico.disponibilidad ? 'estado-ok' : 'estado-busy';
  }

  getEstadoSolicitud(idEstado: number): string {
    if (idEstado === 1) return 'Asignado';
    if (idEstado === 2) return 'Aceptado';
    if (idEstado === 5) return 'Completado';
    return 'Nuevo';
  }

  getClaseSolicitud(idEstado: number): string {
    if (idEstado === 1) return 'chip-warning';
    if (idEstado === 2) return 'chip-info';
    if (idEstado === 5) return 'chip-success';
    return 'chip-danger';
  }

  getTextoResumen(s: SolicitudPendienteTaller): string {
    if (s.id_estado_asignacion === 5) return 'Servicio completado';
    if (s.id_prioridad === 1) return 'Prioridad alta';
    if (s.id_prioridad === 2) return 'Prioridad media';
    return 'Pendiente de técnico';
  }

  getCriticos(): number {
    return this.solicitudes.filter(s => s.id_prioridad === 1).length;
  }

  getCobrosFake(): number {
    return this.stats.completadas * 35;
  }
}