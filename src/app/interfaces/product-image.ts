export interface ProductImage {
  id: number;
  originalFileName: string;
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
  sizeBytes: number;
  principal: boolean;
  sortOrder: number;
  createdAt?: string;
  /** URL temporal local creada desde el Blob autenticado; nunca viene del backend. */
  previewUrl?: string;
}
