import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AddOn, AddOnCategory, ADDON_CATEGORY_LABELS } from '../../models/add-on.model';
import { AddOnService } from '../../services/add-on.service';

@Component({
  selector: 'app-add-on-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-on-form.component.html',
  styleUrl: './add-on-form.component.scss',
})
export class AddOnFormComponent implements OnInit {
  isEdit = false;
  addOnId: string | null = null;
  saving = false;

  name = '';
  category: AddOnCategory = 'bartending';
  defaultDetail = '';
  defaultIncluded = true;
  defaultPrice = 0;
  description = '';
  active = true;

  categories = Object.entries(ADDON_CATEGORY_LABELS) as [AddOnCategory, string][];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private addOnService: AddOnService,
  ) {}

  ngOnInit(): void {
    this.addOnId = this.route.snapshot.paramMap.get('id');
    if (this.addOnId) {
      this.isEdit = true;
      this.addOnService.getById(this.addOnId).subscribe({
        next: (addOn: AddOn) => {
          this.name = addOn.name;
          this.category = addOn.category;
          this.defaultDetail = addOn.defaultDetail || '';
          this.defaultIncluded = addOn.defaultIncluded;
          this.defaultPrice = addOn.defaultPrice ?? 0;
          this.description = addOn.description || '';
          this.active = addOn.active;
        },
      });
    }
  }

  save(): void {
    this.saving = true;
    const payload: Partial<AddOn> = {
      name: this.name,
      category: this.category,
      defaultDetail: this.defaultDetail,
      defaultIncluded: this.defaultIncluded,
      defaultPrice: this.defaultIncluded ? undefined : this.defaultPrice,
      description: this.description,
      active: this.active,
    };

    const req$ = this.isEdit && this.addOnId
      ? this.addOnService.update(this.addOnId, payload)
      : this.addOnService.create(payload);

    req$.subscribe({
      next: () => this.router.navigate(['/add-ons']),
      error: (err) => {
        console.error('Error saving:', err);
        alert(err.error?.message || 'Error saving service');
        this.saving = false;
      },
    });
  }

  cancel(): void { this.router.navigate(['/add-ons']); }
}
