import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { TecnicoService } from '../../core/services/tecnico.service';
import { DashboardTallerResponse, SolicitudPendienteTaller } from '../../models/dashboard_taller.model';
import { Tecnico } from '../../models/tecnico.models';
import { AsignacionService } from '../../core/services/asignacion.service';
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
  1: 'Batería descargada',
  2: 'Llanta pinchada',
  3: 'Falla de motor',
  4: 'Sobrecalentamiento',
  5: 'Accidente leve',
  6: 'Falta de combustible',
  7: 'Cerrajería vehicular',
  8: 'No arranca',
  9: 'Falla eléctrica',
  10: 'Otro problema'
};

  constructor(
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private tecnicoService: TecnicoService,
    private asignacionServices: AsignacionService
  ) {}

  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    const idRuta = Number(params.get('idTaller') || 0);
    const idGuardado = Number(localStorage.getItem('id_taller') || 0);

    this.idTaller = idRuta || idGuardado;

    if (!this.idTaller) {
      this.loading = false;
      this.error = 'No se encontró el id del taller del usuario logueado';
      return;
    }

    if (idRuta && idGuardado && idGuardado !== idRuta) {
      this.loading = false;
      this.error = 'No tienes acceso a este taller';
      return;
    }

    localStorage.setItem('id_taller', String(this.idTaller));

    this.cargarDashboard();
    this.cargarTecnicos();
    this.cargarIncidentesTaller();
  });
}
  cargarIncidentesTaller(): void {
  this.asignacionServices.listarPorTaller(this.idTaller).subscribe({
    next: (data: any[]) => {
      console.log('Asignaciones del taller:', data);

      this.solicitudes = (data || []).map((a: any): SolicitudPendienteTaller => {
  const incidente = a.incidente || {};

  return {
    id_asignacion: a.id,
    id_incidente: a.id_incidente || incidente.codigo,

    descripcion:
      incidente.descripcion ||
      a.descripcion ||
      a.observacion ||
      'Sin descripción',

    id_categoria:
      incidente.id_categoria_problema ||
      a.id_categoria ||
      10,

    id_prioridad:
      incidente.id_prioridad ||
      a.id_prioridad ||
      2,

    id_estado_asignacion:
      a.id_estado_asignacion ||
      1,

    fecha:
      incidente.fecha_reporte ||
      a.fecha_asignacion,

    latitud:
      Number(incidente.latitud || a.latitud || 0),

    longitud:
      Number(incidente.longitud || a.longitud || 0),
  };
});

      this.stats.pendientes = this.solicitudes.filter(s => s.id_estado_asignacion === 1).length;
      this.stats.aceptadas = this.solicitudes.filter(s => s.id_estado_asignacion === 2).length;
      this.stats.completadas = this.solicitudes.filter(s => s.id_estado_asignacion === 5).length;
      this.stats.total_solicitudes = this.solicitudes.length;
    },
    error: (err: any) => {
      console.error('Error cargando incidentes del taller:', err);
    }
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