import { Injectable, OnInit } from '@angular/core';
import { environments } from '../../environments/environments';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Category } from '../interfaces/Category';


@Injectable({
  providedIn: 'root',
})
export class CategoryService implements OnInit {
  baseUrl = environments.baseURL;

  constructor(private http: HttpClient) { }

  ngOnInit(): void { }
 
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}category`);
  }
  deleteCategory(id: number): Observable<Category> {
    return this.http.delete<Category>(`${this.baseUrl}category/${id}`);
  }
  finById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}category/find/${id}`);
  }
  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}category/create`, category);
  }
  updateCategory(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.baseUrl}category/update/${id}`, category);
  }
}
