import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BarTypeService, BarType } from '../../services/bar-type.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-bar-type-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-type-list.component.html',
  styleUrl: './bar-type-list.component.scss'
})
export class BarTypeListComponent implements OnInit {
  barTypes: BarType[] = [];
  loading = false;
  error = '';

  showDeleteModal = false;
  barToDelete: BarType | null = null;

  constructor(
    private router: Router,
    private barTypeService: BarTypeService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadBarTypes();
  }

  loadBarTypes() {
    this.loading = true;
    this.error = '';
    this.barTypeService.getBarTypes().subscribe({
      next: (data) => {
        this.barTypes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not load bar types. Check that the API is running.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  createBarType() {
    this.router.navigate(['/bar-types/new']);
  }

  // Navegar al detalle (Recuerda que el backend usa _id)
  openBarType(bar: BarType) {
    this.router.navigate(['/bar-types', bar._id]);
  }

  // Navegar a edición
  editBarType(event: Event, bar: BarType) {
    event.stopPropagation(); // Evita que se dispare el click de la fila (openBarType)
    this.router.navigate(['/bar-types', bar._id, 'edit']);
  }

  // Lógica del Modal de Eliminación
  confirmDelete(event: Event, bar: BarType) {
    event.stopPropagation();
    this.barToDelete = bar;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.barToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDeleteAction() {
    if (!this.barToDelete || !this.barToDelete._id) return;

    this.barTypeService.deleteBarType(this.barToDelete._id).subscribe({
      next: () => {
        this.toastService.show('Bar type deleted successfully', 'success');
        this.barTypes = this.barTypes.filter(b => b._id !== this.barToDelete!._id);
        this.cancelDelete();
      },
      error: (err) => {
        this.toastService.show('Error deleting bar type', 'error');
        console.error(err);
      }
    });
  }
}