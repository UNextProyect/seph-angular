import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, JsonPipe } from '@angular/common';

import { BitacoraService } from '../../../../core/services/bitacora/bitacora-service';
import { BitacoraEntryResponse } from '../../../../shared/models/bitacora/bitacoraEntryResponse';

/* Pantalla genérica de bitácora: lee el módulo desde la URL
(/admin/bitacoras/:modulo), así que para agregarla a un módulo
nuevo solo hace falta un link apuntando a esa ruta con el nombre
del módulo correspondiente — no hay que escribir componente nuevo. */
@Component({
  selector: 'app-bitacora-view',
  standalone: true,
  imports: [RouterLink, DatePipe, JsonPipe],
  templateUrl: './bitacora-view.html',
  styleUrl: './bitacora-view.scss'
})
export class BitacoraViewComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly bitacoraService = inject(BitacoraService);

  private static readonly NOMBRES_MODULO: Record<string, string> = {
    Institucion: 'Instituciones',
    EnlaceAcademico: 'Enlaces Académicos',
    Empleado: 'Empleados',
    Matricula: 'Matriculas',
    Infraestructura: 'Infraestructuras'
  };

  modulo = signal('');
  registros = signal<BitacoraEntryResponse[]>([]);
  totalRegistros = signal(0);
  pagina = signal(1);
  readonly tamanoPagina = 10;

  isLoading = signal(false);
  notificationMessage = signal('');

  filaExpandida = signal<string | null>(null);

  totalPaginas = computed(() => Math.max(1, Math.ceil(this.totalRegistros() / this.tamanoPagina)));

  tituloModulo = computed(() =>
    BitacoraViewComponent.NOMBRES_MODULO[this.modulo()] ?? this.modulo());

  ngOnInit(): void {
    const modulo = this.route.snapshot.paramMap.get('modulo') ?? '';
    this.modulo.set(modulo);
    this.cargarPagina(1);
  }

  cargarPagina(pagina: number): void {
    this.isLoading.set(true);

    this.bitacoraService.getBitacora(this.modulo(), pagina, this.tamanoPagina).subscribe({
      next: (response) => {
        this.registros.set(response.items ?? []);
        this.totalRegistros.set(response.totalRegistros ?? 0);
        this.pagina.set(response.pagina ?? pagina);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando bitácora:', error);
        this.notificationMessage.set('No fue posible cargar la bitácora.');
        this.isLoading.set(false);
      }
    });
  }

  irAPagina(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPaginas()) {
      return;
    }
    this.cargarPagina(pagina);
  }

  claseFila(accion: string): string {
    switch (accion) {
      case 'Agregar': return 'fila-agregar';
      case 'Editar': return 'fila-editar';
      case 'Desactivar': return 'fila-desactivar';
      case 'Reactivar':
      case 'Activar': return 'fila-reactivar';
      default: return '';
    }
  }

  toggleDetalle(id: string): void {
    this.filaExpandida.set(this.filaExpandida() === id ? null : id);
  }

  parsearJson(jsonData: string): unknown {
    try {
      return JSON.parse(jsonData);
    } catch {
      return {};
    }
  }
}
