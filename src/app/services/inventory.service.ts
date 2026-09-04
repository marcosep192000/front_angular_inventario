import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environments } from '../../environments/environments';
import {
  BaseUnitRequest,
  ProductPresentation,
  ProductPresentationRequest,
  ProductSaleConfiguration,
  ProductVariant,
  ProductVariantRequest,
  UnitOfMeasure,
  UnitOfMeasureRequest,
  VariantAttribute,
  VariantAttributeValue,
} from '../interfaces/inventory';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly url = `${environments.baseURL}inventory`;
  constructor(private http: HttpClient) {}
  getUnits() {
    return this.http.get<UnitOfMeasure[]>(`${this.url}/units`);
  }
  createUnit(body: UnitOfMeasureRequest) {
    return this.http.post<UnitOfMeasure>(`${this.url}/units`, body);
  }
  updateUnit(id: number, body: UnitOfMeasureRequest) {
    return this.http.put<UnitOfMeasure>(`${this.url}/units/${id}`, body);
  }
  getSaleConfiguration(productId: number) {
    return this.http.get<ProductSaleConfiguration>(
      `${this.url}/products/${productId}/sale-configuration`,
    );
  }
  updateBaseUnit(productId: number, body: BaseUnitRequest) {
    const params = new HttpParams()
      .set('unitId', body.unitId)
      .set('stock', body.stock)
      .set('minimumStock', body.minimumStock)
      .set('fractionable', body.fractionable)
      .set('variantStockManaged', body.variantStockManaged);
    return this.http.put<void>(
      `${this.url}/products/${productId}/base-unit`,
      null,
      { params },
    );
  }
  createPresentation(productId: number, body: ProductPresentationRequest) {
    return this.http.post<ProductPresentation>(
      `${this.url}/products/${productId}/presentations`,
      body,
    );
  }
  updatePresentation(id: number, body: ProductPresentationRequest) {
    return this.http.put<ProductPresentation>(
      `${this.url}/presentations/${id}`,
      body,
    );
  }
  deletePresentation(id: number) {
    return this.http.delete<void>(`${this.url}/presentations/${id}`);
  }
  getAttributes() {
    return this.http.get<VariantAttribute[]>(`${this.url}/attributes`);
  }
  createAttribute(name: string) {
    return this.http.post<VariantAttribute>(`${this.url}/attributes`, { name });
  }
  getAttributeValues(id: number) {
    return this.http.get<VariantAttributeValue[]>(
      `${this.url}/attributes/${id}/values`,
    );
  }
  createAttributeValue(id: number, value: string) {
    return this.http.post<VariantAttributeValue>(
      `${this.url}/attributes/${id}/values`,
      { value },
    );
  }
  createVariant(productId: number, body: ProductVariantRequest) {
    return this.http.post<ProductVariant>(
      `${this.url}/products/${productId}/variants`,
      body,
    );
  }
  updateVariant(id: number, body: ProductVariantRequest) {
    return this.http.put<ProductVariant>(`${this.url}/variants/${id}`, body);
  }
  deleteVariant(id: number) {
    return this.http.delete<void>(`${this.url}/variants/${id}`);
  }
}
