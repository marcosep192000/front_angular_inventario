import {
  BaseUnitRequest,
  ProductSaleConfiguration,
} from '../../../interfaces/inventory';

export interface InventoryBaseFormState extends Omit<BaseUnitRequest, 'unitId' | 'stock'> {
  unitId: number | null;
  stockQuantity: number;
}

export function inventoryBaseFormState(
  config: ProductSaleConfiguration,
): InventoryBaseFormState {
  return {
    unitId: config.unit?.id != null ? Number(config.unit.id) : null,
    stockQuantity: config.availableStock,
    minimumStock: config.minimumStock,
    fractionable: config.fractionable === true,
    variantStockManaged: config.variantStockManaged === true,
  };
}

export function baseUnitRequest(
  state: InventoryBaseFormState,
): BaseUnitRequest | null {
  if (state.unitId == null) return null;
  return {
    unitId: Number(state.unitId),
    stock: Number(state.stockQuantity),
    minimumStock: Number(state.minimumStock),
    fractionable: state.fractionable === true,
    variantStockManaged: state.variantStockManaged === true,
  };
}
