import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterLink } from '@angular/router';

import { CatalogService } from '../../../../core/services/catalogs/catalog.service';
import { InstitutionsService } from '../../../../core/services/institutions/institutions-service';
import { MunicipioResponse } from '../../../../shared/models/catalogs/responses/municipioResponse';
import { CreateInstitutionRequest } from '../../../../shared/models/institutions/requests/createInstitutionRequest';

/* Alta y edición de una Institución de Educación Superior.
Solo accesible por SuperAdmin (protegido en el guard de la ruta).
Si la ruta trae un :id (/admin/instituciones/:id/editar), el
formulario carga esa institución y "Guardar" actualiza en vez
de crear, igual que el patrón ya usado en Información Personal
para retomar un registro incompleto.
Nota: se usan signals porque la aplicación es zoneless; con campos
normales la vista no se actualiza al llegar la respuesta. */
@Component({
  selector: 'app-institution-create',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './institution-create.html',
  styleUrl: './institution-create.scss'
})
export class InstitutionCreateComponent implements OnInit {

  private readonly catalogService = inject(CatalogService);
  private readonly institutionsService = inject(InstitutionsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  /* Id de la institución a editar. null cuando se está
  registrando una institución nueva. */
  institucionId: number | null = null;

  municipios = signal<MunicipioResponse[]>([]);

  isSaving = signal(false);
  isLoading = signal(false);

  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');

  institucion: CreateInstitutionRequest = {
    strNombre: '',
    strSiglas: null,
    strCct: null,
    strDireccion: null,
    dateFechaCreacion: null,
    strDecretoCreacion: null,
    strSitioWeb: null,
    strCorreoInstitucional: null,
    strTelefonoInstitucional: null,
    idMunicipio: 0
  };

  ngOnInit(): void {
    this.loadMunicipios();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.institucionId = Number(idParam);
      this.loadInstitucion(this.institucionId);
    }
  }

  loadMunicipios(): void {
    this.catalogService.getMunicipios().subscribe({
      next: (response) => {
        this.municipios.set(response.data ?? []);
      },
      error: (error) => {
        console.error('Error cargando municipios:', error);
      }
    });
  }

  /* Carga los datos ya guardados de la institución a editar. */
  loadInstitucion(id: number): void {
    this.isLoading.set(true);

    this.institutionsService.getInstitutionById(id).subscribe({
      next: (response) => {
        const data = response.data;

        if (!data) {
          this.isLoading.set(false);
          return;
        }

        this.institucion = {
          strNombre: data.strNombre,
          strSiglas: data.strSiglas,
          strCct: data.strCct,
          strDireccion: data.strDireccion,
          dateFechaCreacion: data.dateFechaCreacion ? data.dateFechaCreacion.split('T')[0] : null,
          strDecretoCreacion: data.strDecretoCreacion,
          strSitioWeb: data.strSitioWeb,
          strCorreoInstitucional: data.strCorreoInstitucional,
          strTelefonoInstitucional: data.strTelefonoInstitucional,
          idMunicipio: data.idMunicipio
        };

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error cargando institución:', error);

        this.showNotification(
          'No fue posible cargar la información de la institución.',
          'error'
        );

        this.isLoading.set(false);
      }
    });
  }

  saveInstitucion(): void {
    if (this.isSaving()) {
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.isSaving.set(true);

    const request$ = this.institucionId
      ? this.institutionsService.updateInstitution(this.institucionId, this.institucion)
      : this.institutionsService.createInstitution(this.institucion);

    const successMessage = this.institucionId
      ? 'Institución actualizada correctamente.'
      : 'Institución registrada correctamente.';

    const errorMessage = this.institucionId
      ? 'No fue posible actualizar la institución.'
      : 'No fue posible registrar la institución.';

    request$.subscribe({
      next: (response) => {
        if (response.statusCode !== 200) {
          this.showNotification(response.message ?? errorMessage, 'error');
          this.isSaving.set(false);
          return;
        }

        this.showNotification(successMessage, 'success');

        setTimeout(() => {
          this.isSaving.set(false);
          this.router.navigateByUrl('/admin/instituciones');
        }, 1500);
      },
      error: (error) => {
        console.error('Error al guardar institución:', error);

        this.showNotification(error?.error?.message ?? errorMessage, 'error');

        this.isSaving.set(false);
      }
    });
  }

  /* Refleja las mismas reglas que ya exige el backend
  (CreateInstitucionCommandValidator/UpdateInstitucionCommandValidator):
  nombre y municipio obligatorios, correo con formato válido si se captura,
  y los máximos de longitud reales de cada columna en SEPH_DB (evita el 400
  del backend o, peor, un error de truncamiento en SQL). */
  private validateForm(): boolean {
    if (!this.institucion.strNombre.trim()) {
      this.showNotification('El nombre de la institución es obligatorio.', 'error');
      return false;
    }

    if (this.institucion.strNombre.length > 250) {
      this.showNotification('El nombre no debe superar 250 caracteres.', 'error');
      return false;
    }

    if (!this.institucion.idMunicipio) {
      this.showNotification('Debe seleccionar el municipio de la institución.', 'error');
      return false;
    }

    if (
      this.institucion.strCorreoInstitucional &&
      !this.isValidEmail(this.institucion.strCorreoInstitucional)
    ) {
      this.showNotification('El correo institucional no es válido.', 'error');
      return false;
    }
    
    if (!this.institucion.strSiglas?.trim()) {
      this.showNotification('Las siglas de la institución son obligatorias.', 'error');
      return false;
    }

    if (!this.institucion.strCct?.trim()) {
      this.showNotification('El CCT de la institución es obligatorio.', 'error');
      return false;
    }

    if (!this.institucion.strDireccion?.trim()) {
      this.showNotification('La dirección de la institución es obligatoria.', 'error');
      return false;
    }

    const maxLengths: Array<[keyof CreateInstitutionRequest, number, string]> = [
      ['strSiglas', 50, 'Las siglas'],
      ['strCct', 30, 'El CCT'],
      ['strDireccion', 500, 'La dirección'],
      ['strDecretoCreacion', 500, 'El decreto de creación'],
      ['strSitioWeb', 250, 'El sitio web'],
      ['strCorreoInstitucional', 250, 'El correo institucional'],
      ['strTelefonoInstitucional', 20, 'El teléfono institucional']
    ];

    for (const [field, max, label] of maxLengths) {
      const value = this.institucion[field];

      if (typeof value === 'string' && value.length > max) {
        this.showNotification(`${label} no debe superar ${max} caracteres.`, 'error');
        return false;
      }
    }

    return true;
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  private showNotification(
    message: string,
    type: 'success' | 'error'
  ): void {
    this.notificationMessage.set(message);
    this.notificationType.set(type);

    setTimeout(() => {
      this.notificationMessage.set('');
    }, 4000);
  }
}
