import {
  BaseUnitRequest,
  ProductSaleConfiguration,
} from '../../../interfaces/inventory';

export interface InventoryBaseFormState extends Omit<BaseUnitRequest, 'unitId'> {
  unitId: number | null;
}

export function inventoryBaseFormState(
  config: ProductSaleConfiguration,
  fallback: { stock: number; stockMin: number },
): InventoryBaseFormState {
  return {
    unitId: config.unit?.id != null ? Number(config.unit.id) : null,
    stock: config.stock ?? fallback.stock,
    minimumStock: fallback.stockMin,
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
    stock: Number(state.stock),
    minimumStock: Number(state.minimumStock),
    fractionable: state.fractionable === true,
    variantStockManaged: state.variantStockManaged === true,
  };
}
