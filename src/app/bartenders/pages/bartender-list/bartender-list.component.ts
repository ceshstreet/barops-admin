import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BartenderService, Bartender } from '../../services/bartender.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-bartender-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bartender-list.component.html',
  styleUrl: './bartender-list.component.scss'
})
export class BartenderListComponent implements OnInit {
  bartenders: Bartender[] = [];
  showDeleteModal = false;
  bartenderToDelete: Bartender | null = null;

  constructor(
    private router: Router,
    private bartenderService: BartenderService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.bartenderService.getBartenders().subscribe({
      next: (data) => this.bartenders = data,
      error: (err) => console.error('Error cargando bartenders:', err)
    });
  }

  createBartender() {
    this.router.navigate(['/bartenders/new']);
  }

  openBartender(bartender: Bartender) {
    this.router.navigate(['/bartenders', bartender._id]);
  }

  editBartender(event: Event, bartender: Bartender) {
    event.stopPropagation(); // Para que no se abra el Detail al mismo tiempo
    this.router.navigate(['/bartenders', bartender._id, 'edit']);
  }


  confirmDelete(event: Event, bartender: Bartender) {
    event.stopPropagation();
    this.bartenderToDelete = bartender;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.bartenderToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDeleteAction() {
    if (!this.bartenderToDelete) return;
    this.bartenderService.deleteBartender(this.bartenderToDelete._id!).subscribe({
      next: () => {
        this.bartenders = this.bartenders.filter(b => b._id !== this.bartenderToDelete!._id);
        this.toastService.show('Bartender deleted successfully.', 'success');
        this.cancelDelete();
      },
      error: (err) => {
        this.toastService.show('Error deleting bartender.', 'error');
        console.error(err);
      }
    });
  }

  getFullName(bartender: Bartender): string {
    return `${bartender.name} ${bartender.lastName}`;
  }

  getStatusClass(status: string): string {
    if (status === 'AVAILABLE') return 'available';
    if (status === 'BUSY') return 'busy';
    return 'inactive';
  }
}