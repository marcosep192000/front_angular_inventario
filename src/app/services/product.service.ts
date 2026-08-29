import { Injectable } from '@angular/core';

import { environments } from '../../environments/environments';

import { HttpClient } from '@angular/common/http';

import { Product } from '../interfaces/Product';

import { Observable } from 'rxjs';

import { ProductItemSale } from '../interfaces/ProductItemSale';

import { ProductItemBuy } from '../interfaces/ProductItemBuy';


@Injectable({
  providedIn: 'root',
})
export class ProductService {

  // =========================================================
  // URL BASE
  // =========================================================

  base: string = environments.baseURL;


  // =========================================================
  // FORM
  // =========================================================

  form: any;


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    private http: HttpClient
  ) {}


  // =========================================================
  // ACTUALIZAR PRECIOS MASIVO
  // =========================================================

  actualizarPreciosMasivo(
    payload: any
  ): Observable<void> {

    return this.http.post<void>(
      `${this.base}supermarket/actualizar-precios-masivo`,
      payload
    );
  }


  // =========================================================
  // OBTENER PRODUCTOS PAGINADOS
  // =========================================================

  getProducts(
    page: number,
    size: number,
    filter: string = ''
  ) {

    return this.http.get<any>(
      `${this.base}supermarket/products` +
      `?page=${page}` +
      `&size=${size}` +
      `&filter=${filter}`
    );
  }


  // =========================================================
  // BUSCAR PRODUCTO POR ID
  // =========================================================

  findById(
    id: number
  ): Observable<Product> {

    return this.http.get<Product>(
      `${this.base}supermarket/find/${id}`
    );
  }


  // =========================================================
  // PRODUCTOS POR CATEGORÍA / PROVEEDOR
  // =========================================================

  getProductoPorCategoria(
    idProveedor: number
  ): Observable<Product[]> {

    return this.http.get<Product[]>(
      `${this.base}supermarket/find-for-provider/${idProveedor}`
    );
  }


  // =========================================================
  // PRODUCTOS POR PROVEEDOR
  // =========================================================

  getProductoPorProveedor(
    idProveedor: number
  ): Observable<Product[]> {

    return this.http.get<Product[]>(
      `${this.base}supermarket/find-for-provider/${idProveedor}`
    );
  }


  // =========================================================
  // CREAR PRODUCTO
  // =========================================================

  save(
    product: Product
  ): Observable<Product> {

    return this.http.post<Product>(
      `${this.base}supermarket/create-supermarket`,
      product
    );
  }


  // =========================================================
  // ACTUALIZAR PRODUCTO
  // =========================================================

  update(
    id: number,
    product: Product
  ) {

    return this.http.put(
      `${this.base}supermarket/update-product/${id}`,
      product,
      {
        responseType: 'text' as 'json'
      }
    );
  }


  // =========================================================
  // ELIMINAR PRODUCTO
  // =========================================================

  delete(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.base}supermarket/supermarket-delete/${id}`,
      {}
    );
  }


  // =========================================================
  // BUSCAR PRODUCTO PARA VENTA
  //
  // Mantener ProductItemSale porque este método
  // pertenece al módulo de ventas.
  // =========================================================

  search(
    query: string
  ): Observable<ProductItemSale> {

    return this.http.get<ProductItemSale>(
      `${this.base}supermarket/findByCode/${query}`
    );
  }


  // =========================================================
  // BUSCAR PRODUCTOS PARA VENTA
  // =========================================================

  searchForSale(
    query: string
  ): Observable<ProductItemSale[]> {

    return this.http.get<ProductItemSale[]>(
      `${this.base}supermarket/search-for-sale`,
      {
        params: {
          query: query.trim()
        }
      }
    );
  }


  // =========================================================
  // BUSCAR PRODUCTO PARA COMPRA / PROVEEDOR
  //
  // IMPORTANTE:
  // Usa el mismo endpoint que ya funciona,
  // pero devuelve ProductItemBuy.
  // =========================================================

  searchProductBuy(
    code: string
  ): Observable<ProductItemBuy> {

    return this.http.get<ProductItemBuy>(
      `${this.base}supermarket/findByCode/${code.trim()}`
    );
  }


  // =========================================================
  // PRODUCTOS CON STOCK BAJO
  // =========================================================

  productosBajoStock(): Observable<Product> {

    return this.http.get<Product>(
      `${this.base}supermarket/get-all-low-stock`
    );
  }

}
