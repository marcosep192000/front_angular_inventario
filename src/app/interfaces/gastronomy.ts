export type GastronomySelectionType = 'SINGLE' | 'MULTIPLE';

export interface GastronomyOption {
  id: number;
  name: string;
  description?: string | null;
  priceAdjustment: number;
  sortOrder: number;
}

export interface GastronomyGroup {
  id: number;
  name: string;
  description?: string | null;
  selectionType: GastronomySelectionType;
  minSelections: number;
  maxSelections: number;
  required: boolean;
  sortOrder: number;
  options: GastronomyOption[];
}

export type GastronomyGroupPayload = Omit<GastronomyGroup, 'id' | 'options'>;
export type GastronomyOptionPayload = Omit<GastronomyOption, 'id'>;
