import {
  Component, inject, signal, OnInit, OnDestroy, HostListener, ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { filter, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { AuthService }     from '../../auth/services/auth.service';
import { ClientService, Client } from '../../clients/services/client.service';
import { RequestsService } from '../../requests/services/request.service';

interface PageInfo { title: string; subtitle: string; icon: string; }

const PAGES: Record<string, PageInfo> = {
  'dashboard':    { title: 'Dashboard',        subtitle: 'Overview & metrics',         icon: 'dashboard'        },
  'events':       { title: 'Events',           subtitle: 'All scheduled events',       icon: 'event'            },
  'reservations': { title: 'Reservations',     subtitle: 'Table & venue bookings',     icon: 'table_restaurant' },
  'clients':      { title: 'Clients',          subtitle: 'Client directory',           icon: 'people'           },
  'bartenders':   { title: 'Bartenders',       subtitle: 'Staff & availability',       icon: 'sports_bar'       },
  'quotes':       { title: 'Quotes',           subtitle: 'Proposals & pricing',        icon: 'request_quote'    },
  'requests':     { title: 'Inbox',            subtitle: 'Incoming quote requests',    icon: 'inbox'            },
  'drinks':       { title: 'Drinks & Menu',    subtitle: 'Bar catalog',                icon: 'local_bar'        },
  'packages':     { title: 'Packages',         subtitle: 'Service bundles',            icon: 'inventory_2'      },
  'add-ons':      { title: 'Add-ons',          subtitle: 'Extras & enhancements',      icon: 'extension'        },
  'admins':       { title: 'Administrators',   subtitle: 'Account management',         icon: 'manage_accounts'  },
};

const DEFAULT_PAGE: PageInfo = { title: 'Sabor Latino', subtitle: 'Bar management', icon: 'sports_bar' };

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent implements OnInit, OnDestroy {
  private router   = inject(Router);
  private auth     = inject(AuthService);
  private clients  = inject(ClientService);
  private requests = inject(RequestsService);
  private el       = inject(ElementRef);

  // ── Auth ───────────────────────────────────────────────────────────────────
  user = this.auth.user;

  get initials(): string {
    const u = this.user();
    if (!u) return '?';
    return (u.name[0] + (u.lastName?.[0] ?? '')).toUpperCase();
  }

  // ── Page title ─────────────────────────────────────────────────────────────
  pageInfo = signal<PageInfo>(DEFAULT_PAGE);

  // ── Date ───────────────────────────────────────────────────────────────────
  get today(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  searchQuery  = '';
  searchResults = signal<Client[]>([]);
  searchOpen    = signal(false);
  searching     = signal(false);

  private searchSubject = new Subject<string>();

  // ── Notifications ──────────────────────────────────────────────────────────
  pendingCount = signal(0);

  // ── Subscriptions ──────────────────────────────────────────────────────────
  private subs = new Subscription();

  // ──────────────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Page title from URL
    this.subs.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd))
        .subscribe((e: any) => this.updatePageTitle(e.urlAfterRedirects ?? e.url))
    );
    this.updatePageTitle(this.router.url);

    // Debounced client search
    this.subs.add(
      this.searchSubject.pipe(
        debounceTime(280),
        distinctUntilChanged(),
        switchMap(q => {
          if (!q.trim()) {
            this.searchResults.set([]);
            this.searching.set(false);
            return [];
          }
          this.searching.set(true);
          return this.clients.getClients();
        })
      ).subscribe({
        next: (res: any) => {
          if (!Array.isArray(res)) return;
          const q = this.searchQuery.toLowerCase();
          const filtered = res.filter((c: Client) =>
            `${c.name} ${c.lastName}`.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.includes(q)
          ).slice(0, 7);
          this.searchResults.set(filtered);
          this.searching.set(false);
          if (filtered.length > 0) this.searchOpen.set(true);
        },
        error: () => this.searching.set(false),
      })
    );

    // Pending requests count
    this.loadPendingCount();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private updatePageTitle(url: string): void {
    const segment = url.split('/').filter(Boolean)[0] ?? '';
    this.pageInfo.set(PAGES[segment] ?? DEFAULT_PAGE);
  }

  onSearchInput(value: string): void {
    this.searchQuery = value;
    if (!value.trim()) {
      this.searchResults.set([]);
      this.searchOpen.set(false);
    }
    this.searchSubject.next(value);
  }

  selectClient(client: Client): void {
    this.searchOpen.set(false);
    this.searchQuery = '';
    this.searchResults.set([]);
    this.router.navigate(['/clients', client._id]);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults.set([]);
    this.searchOpen.set(false);
  }

  goToRequests(): void {
    this.router.navigate(['/requests']);
  }

  private loadPendingCount(): void {
    this.requests.getInbox().subscribe({
      next: res => {
        const count = res.data?.filter(r => r.status === 'NEW').length ?? 0;
        this.pendingCount.set(count);
      },
      error: () => {},
    });
  }

  // ── Click outside to close search ─────────────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target)) {
      this.searchOpen.set(false);
    }
  }
}
