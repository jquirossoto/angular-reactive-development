import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, combineLatest, merge, Observable, Subject, throwError } from 'rxjs';
import { catchError, map, scan, share, shareReplay, tap } from 'rxjs/operators';

import { Product } from './product';
import { Supplier } from '../suppliers/supplier';
import { SupplierService } from '../suppliers/supplier.service';
import { ProductCategoryService } from './../product-categories/product-category.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = this.supplierService.suppliersUrl;

  products$ = this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(data => console.log('Products: ', JSON.stringify(data))),
      catchError(this.handleError)
    );

  productsWithCategory$ = combineLatest([this.products$, this.categoriesService.productCategories$])
    .pipe(
      map(([products, categories]) =>
        products.map(product => ({
          ...product,
          price: product.price * 1.5,
          searchKey: [product.productName],
          category: categories.find(c =>  product.categoryId === c.id).name
        }) as Product),
        shareReplay(1)
      )
    );

  private productSelectedSubject = new BehaviorSubject<number>(0);
  productSelectedAction$ = this.productSelectedSubject.asObservable();

  selectedProduct$ = combineLatest([this.productsWithCategory$, this.productSelectedAction$])
    .pipe(
      map(([products, selectedProductId]) =>
        products.find(product => product.id === selectedProductId)
      ),
      tap(product => console.log(`Selected product: ${JSON.stringify(product)}`)),
      shareReplay(1)
    ); 

  private productAddedSubject = new Subject<Product>();
  productAddedAction$ = this.productAddedSubject.asObservable();

  productsWithAdd$ = merge(this.productsWithCategory$,this.productAddedAction$)
    .pipe(
      scan((acc: Product[], value: Product) => [...acc, value]),
      catchError(err => {
        console.error(err);
        return throwError(err);
      })
    );

  constructor(private http: HttpClient, private supplierService: SupplierService, private categoriesService: ProductCategoryService) { }

  selectedProductChanged(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
  }

  addProduct(product?: Product): void {
    product = product|| this.fakeProduct();
    this.productAddedSubject.next(product);
  }

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      category: 'Toolbox',
      quantityInStock: 30
    };
  }

  private handleError(err: any): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }

}
