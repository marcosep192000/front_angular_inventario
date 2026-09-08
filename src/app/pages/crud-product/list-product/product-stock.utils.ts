export function stockStatus(product: { availableStock: number; minimumStock: number }): 'sin-stock' | 'stock-bajo' | 'stock-ok' {
  return product.availableStock <= 0 ? 'sin-stock'
    : product.availableStock <= product.minimumStock ? 'stock-bajo' : 'stock-ok';
}
