import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BartenderService, Bartender } from '../../services/bartender.service';

@Component({
  selector: 'app-bartender-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bartender-detail.component.html',
  styleUrl: './bartender-detail.component.scss'
})
export class BartenderDetailComponent implements OnInit {
  bartender: Bartender | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bartenderService: BartenderService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.bartenderService.getBartenderById(id).subscribe({
        next: (data) => this.bartender = data,
        error: (err) => console.error('Error cargando bartender:', err)
      });
    }
  }

  editBartender() {
    this.router.navigate(['/bartenders', this.bartender?._id, 'edit']);
  }

  goBack() {
    this.router.navigate(['/bartenders']);
  }

  getFullName(): string {
    return `${this.bartender?.name} ${this.bartender?.lastName}`;
  }
}