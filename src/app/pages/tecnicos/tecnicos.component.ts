import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { TecnicoService } from '../../core/services/tecnico.service';
import { tallerService } from '../../core/services/taller.service';
import { Tecnico,TecnicoCreate } from '../../models/tecnico.models';
import { Taller } from '../../models/taller.model';

@Component({
  selector: 'app-tecnicos',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './tecnicos.component.html',
  styleUrls: ['./tecnico.component.scss']
})
export class TecnicosComponent implements OnInit {
  tecnicos: Tecnico[] = [];
  talleres: Taller[] = [];
  mostrarModal = false;
  editando: Tecnico | null = null;
  loading = false;
  error = '';

  form: TecnicoCreate = {
    telefono: '',
    latitud: 0,
    longitud: 0,
    id_taller: 0,
    id_usuario: ''
  };

  constructor(
    private tecnicoService: TecnicoService,
    private tallerService: tallerService
  ) {}

  ngOnInit() {
    this.cargarTalleres();
  }

  cargarTalleres() {
    this.tallerService.listar().subscribe(data => {
      this.talleres = data;
      if (data.length > 0) {
        this.cargarTecnicos(data[0].codigo);
      }
    });
  }

  cargarTecnicos(id_taller: number) {
    this.tecnicoService.listarPorTaller(id_taller).subscribe(data => {
      this.tecnicos = data;
    });
  }

  abrirModal(tecnico?: Tecnico) {
    this.editando = tecnico || null;
    this.form = tecnico
      ? {
          telefono: tecnico.telefono,
          latitud: tecnico.latitud,
          longitud: tecnico.longitud,
          id_taller: tecnico.id_taller,
          id_usuario: String(tecnico.id_usuario)
        }
      : { telefono: '', latitud: 0, longitud: 0, id_taller: 0, id_usuario: '' };
    this.mostrarModal = true;
    this.error = '';
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.error = '';
  }

  guardar() {
    this.loading = true;
    const accion = this.editando
      ? this.tecnicoService.actualizar(this.editando.codigo, this.form)
      : this.tecnicoService.crear(this.form);

    accion.subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarTalleres();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al guardar técnico';
        this.loading = false;
      }
    });
  }

  eliminar(codigo: number) {
    if (confirm('¿Eliminar este técnico?')) {
      this.tecnicoService.eliminar(codigo).subscribe(() => this.cargarTalleres());
    }
  }

  toggleDisponibilidad(tecnico: Tecnico) {
  this.tecnicoService.actualizar(tecnico.codigo, {
    disponible: !tecnico.disponible
  }).subscribe(() => this.cargarTalleres());
}
}