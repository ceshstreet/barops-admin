import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BarTypeService, BarType } from '../../services/bar-type.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-bar-type-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bar-type-form.component.html',
  styleUrl: './bar-type-form.component.scss'
})
export class BarTypeFormComponent implements OnInit {
  isEditMode = false;
  barTypeId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private barTypeService: BarTypeService,
    private toastService: ToastService
  ) {}

  barType = {
    name: '',
    category: '',
    lighting: false,
    capacity: 0,
    setupType: '',
    status: true
  };

  categories = ['Portable', 'Premium Lighted', 'Large Lighted', 'Custom'];
  setupTypes = ['Indoor', 'Outdoor', 'Indoor / Outdoor'];

  ngOnInit() {
    this.barTypeId = this.route.snapshot.paramMap.get('id');
    if (this.barTypeId) {
      this.isEditMode = true;
      this.barTypeService.getBarTypeById(this.barTypeId).subscribe({
        next: (data) => {
          this.barType = {
            name: data.name,
            category: data.category,
            lighting: data.lighting,
            capacity: data.capacity,
            setupType: data.setupType,
            status: data.status
          };
        },
        error: (err) => console.error(err)
      });
    }
  }

  saveBarType() {
    if (this.isEditMode && this.barTypeId) {
      this.barTypeService.updateBarType(this.barTypeId, this.barType as BarType).subscribe({
        next: () => {
          this.toastService.show('Bar type updated successfully.', 'success');
          setTimeout(() => this.router.navigate(['/bar-types']), 1500);
        },
        error: (err) => {
          this.toastService.show('Error updating bar type.', 'error');
          console.error(err);
        }
      });
    } else {
      this.barTypeService.insertBarType(this.barType as BarType).subscribe({
        next: () => {
          this.toastService.show('Bar type created successfully.', 'success');
          setTimeout(() => this.router.navigate(['/bar-types']), 1500);
        },
        error: (err) => {
          this.toastService.show('Error creating bar type.', 'error');
          console.error(err);
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/bar-types']);
  }
}