import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AddOn, ADDON_CATEGORY_LABELS } from '../../models/add-on.model';
import { AddOnService } from '../../services/add-on.service';

@Component({
  selector: 'app-add-on-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './add-on-list.component.html',
  styleUrl: './add-on-list.component.scss',
})
export class AddOnListComponent implements OnInit {
  private addOnService = inject(AddOnService);
  private router = inject(Router);

  addOns: AddOn[] = [];
  loading = false;
  error = '';

  categoryLabels = ADDON_CATEGORY_LABELS;

  showDeleteModal = false;
  deleting = false;
  selectedId: string | null = null;
  selectedName = '';
  toast: { message: string; type: 'success' | 'error' } | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.addOnService.getAll().subscribe({
      next: (res) => {
        this.addOns = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Could not load services.';
        this.loading = false;
      },
    });
  }

  edit(id: string): void { this.router.navigate(['/add-ons', id, 'edit']); }

  openDelete(addOn: AddOn): void {
    this.selectedId = addOn._id;
    this.selectedName = addOn.name;
    this.showDeleteModal = true;
  }

  closeDelete(): void { this.showDeleteModal = false; this.selectedId = null; }

  confirmDelete(): void {
    if (!this.selectedId) return;
    this.deleting = true;
    this.addOnService.delete(this.selectedId).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.deleting = false;
        this.showToast('Service deleted.', 'success');
        this.load();
      },
      error: () => {
        this.showDeleteModal = false;
        this.deleting = false;
        this.showToast('Error deleting service.', 'error');
      },
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    this.toast = { message, type };
    setTimeout(() => this.toast = null, 3000);
  }

  trackById(_: number, item: AddOn): string { return item._id; }
}
