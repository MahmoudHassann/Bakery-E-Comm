import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Product } from '../../interfaces/product';
import { Category } from '../../interfaces/category';

const BASE_URL = environment.Base_Url

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private Http: HttpClient) { }


  getProducts(page?: number, size?: number): Observable<Product> {

    return this.Http.get<Product>(`${BASE_URL}item?page=${page ? page : page = 1}&size=${size ? size : size = 10}`);

  }
  getCategories(page?: number, size?: number): Observable<Category> {

    return this.Http.get<Category>(`${BASE_URL}category?page=${page ? page : page = 1}`);

  }

  getProductById(id:string | null):Observable<Product>{
    return this.Http.get<Product>(`${BASE_URL}item/${id}`)
  }
}
