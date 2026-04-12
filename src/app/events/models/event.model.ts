export interface EventBartender {
  _id: string;
  name: string;
  lastName?: string;
  status?: string;
  bartenderData?: { specialty?: string; photo?: string };
}

export interface BaropsEvent {
  _id?: string;
  eventCode?: string;
  status?: string;

  // Client (populated or raw ID)
  clientId?: string | { _id: string; name: string; lastName?: string; email?: string; phone?: string };
  clientName?: string;
  email?: string;
  phone?: string;

  // Nested event info (canonical)
  eventInfo?: {
    title?: string;
    type?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
  };

  // Flat fallback fields (stored via strict: false)
  title?: string;
  eventType?: string;
  eventDate?: string;
  location?: string;
  guests?: string;
  notes?: string;

  // Quote / financial
  quoteId?: string;
  quotedTotal?: number;
  packageName?: string;

  // Operational (Phase 2)
  assignedBartenders?: EventBartender[] | string[];

  financials?: {
    budgetRange?: string;
    paidType?: string;
    paidStatus?: 'UNPAID' | 'PARTIAL' | 'PAID';
  };

  createdAt?: string;
  updatedAt?: string;
}

export const EVENT_STATUS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  PENDIENTE:  { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: 'hourglass_empty' },
  APROBADO:   { label: 'Confirmed', color: '#34d399', bg: 'rgba(52,211,153,0.12)',  icon: 'check_circle'    },
  RECHAZADO:  { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: 'cancel'          },
  FINALIZADO: { label: 'Completed', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  icon: 'celebration'     },
  pending:    { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: 'hourglass_empty' },
  confirmed:  { label: 'Confirmed', color: '#34d399', bg: 'rgba(52,211,153,0.12)',  icon: 'check_circle'    },
  cancelled:  { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: 'cancel'          },
  completed:  { label: 'Completed', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  icon: 'celebration'     },
};

export const PAY_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  UNPAID:  { label: 'Unpaid',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  PARTIAL: { label: 'Partial', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  PAID:    { label: 'Paid',    color: '#34d399', bg: 'rgba(52,211,153,0.12)'  },
};
