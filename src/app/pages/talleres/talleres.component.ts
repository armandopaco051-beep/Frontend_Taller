import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { tallerService } from '../../core/services/taller.service';
import { Taller, TallerCreate } from '../../models/taller.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-talleres',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './talleres.component.html',
  styleUrls: ['./talleres.component.scss']
})
export class TalleresComponent implements OnInit, OnDestroy {

  talleres: Taller[] = [];
  mostrarModal = false;
  mostrarMapa = false;
  editando: Taller | null = null;
  loading = false;
  loadingDireccion = false;
  error = '';

  form: TallerCreate = {
    nombre: '',
    telefono: '',
    direccion: '',
    latitud: 0,
    longitud: 0
  };

  private mapa: L.Map | null = null;
  private marcador: L.Marker | null = null;

  constructor(private tallerService: tallerService) {}

  ngOnInit() {
    this.corregirIconosLeaflet();
    this.cargarTalleres();
  }

  ngOnDestroy() {
    this.destruirMapa();
  }

  cargarTalleres() {
    this.tallerService.listar().subscribe(data => this.talleres = data);
  }

  abrirModal(taller?: Taller) {
    this.editando = taller || null;
    this.form = taller
      ? {
          nombre: taller.nombre,
          telefono: taller.telefono,
          direccion: taller.direccion,
          latitud: taller.latitud,
          longitud: taller.longitud
        }
      : { nombre: '', telefono: '', direccion: '', latitud: 0, longitud: 0 };
    this.mostrarModal = true;
    this.error = '';
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.mostrarMapa = false;
    this.destruirMapa();
    this.error = '';
  }

  // Abre el mapa dentro del modal
  abrirMapa() {
    this.mostrarMapa = true;
    setTimeout(() => this.inicializarMapa(), 300);
  }

  cerrarMapa() {
    this.mostrarMapa = false;
    this.destruirMapa();
  }

  private inicializarMapa() {
    const contenedor = document.getElementById('mapa-leaflet');
    if (!contenedor) return;

    // Coordenadas iniciales: Santa Cruz de la Sierra Bolivia
    const latInicial = this.form.latitud !== 0 ? this.form.latitud : -17.7833;
    const lngInicial = this.form.longitud !== 0 ? this.form.longitud : -63.1821;

    this.mapa = L.map('mapa-leaflet').setView([latInicial, lngInicial], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapa);

    // Si ya hay coordenadas previas, poner marcador
    if (this.form.latitud !== 0 && this.form.longitud !== 0) {
      this.colocarMarcador(this.form.latitud, this.form.longitud);
    }

    // Evento click en el mapa
    this.mapa.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.colocarMarcador(lat, lng);
      this.obtenerDireccion(lat, lng);
    });
  }

  private colocarMarcador(lat: number, lng: number) {
    if (!this.mapa) return;

    if (this.marcador) {
      this.marcador.setLatLng([lat, lng]);
    } else {
      this.marcador = L.marker([lat, lng], { draggable: true }).addTo(this.mapa);

      // También al arrastrar el marcador
      this.marcador.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        this.obtenerDireccion(pos.lat, pos.lng);
      });
    }
  }

  // Reverse geocoding con Nominatim (gratis, sin API key)
  private async obtenerDireccion(lat: number, lng: number) {
    this.loadingDireccion = true;
    this.form.latitud = parseFloat(lat.toFixed(7));
    this.form.longitud = parseFloat(lng.toFixed(7));

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      const respuesta = await fetch(url, {
        headers: { 'Accept-Language': 'es' }
      });
      const datos = await respuesta.json();

      if (datos && datos.display_name) {
        const a = datos.address;
        // Construir dirección legible
        const partes = [];
        if (a.road) partes.push(a.road);
        if (a.house_number) partes.push(a.house_number);
        if (a.neighbourhood || a.suburb) partes.push(a.neighbourhood || a.suburb);
        if (a.city || a.town || a.municipality) partes.push(a.city || a.town || a.municipality);

        this.form.direccion = partes.length > 0
          ? partes.join(', ')
          : datos.display_name.split(',').slice(0, 3).join(',');
      }
    } catch (err) {
      this.form.direccion = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
    } finally {
      this.loadingDireccion = false;
    }
  }

  confirmarUbicacion() {
    if (this.form.latitud === 0 && this.form.longitud === 0) {
      alert('Por favor selecciona una ubicación en el mapa');
      return;
    }
    this.cerrarMapa();
  }

  private destruirMapa() {
    if (this.mapa) {
      this.mapa.remove();
      this.mapa = null;
      this.marcador = null;
    }
  }

  // Fix para los íconos de Leaflet con Angular
  private corregirIconosLeaflet() {
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  guardar() {
    this.loading = true;
    const accion = this.editando
      ? this.tallerService.actualizar(this.editando.codigo, this.form)
      : this.tallerService.crear(this.form);

    accion.subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarTalleres();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.detail || 'Error al guardar';
        this.loading = false;
      }
    });
  }

  desactivar(codigo: number) {
    if (confirm('¿Desactivar este taller?')) {
      this.tallerService.desactivar(codigo).subscribe(() => this.cargarTalleres());
    }
  }
}