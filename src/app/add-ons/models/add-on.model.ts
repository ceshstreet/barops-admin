export type AddOnCategory = 'bartending' | 'bar' | 'cocktail' | 'equipment' | 'other';

export interface AddOn {
  _id: string;
  name: string;
  category: AddOnCategory;
  defaultDetail: string;
  defaultIncluded: boolean;
  defaultPrice?: number;
  description?: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddOnListResponse {
  data: AddOn[];
  total: number;
}

export const ADDON_CATEGORY_LABELS: Record<AddOnCategory, string> = {
  bartending: 'Bartending',
  bar:        'Bar Setup',
  cocktail:   'Cocktails',
  equipment:  'Equipment',
  other:      'Other',
};
