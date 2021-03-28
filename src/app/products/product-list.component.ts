import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

import { combineLatest, EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { catchError, map, startWith, tap } from 'rxjs/operators';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  pageTitle = 'Product List';
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  private selectedCategorySubject = new Subject<number>();
  categorySelectedAction$ = this.selectedCategorySubject.asObservable();

  products$ = combineLatest([
    this.productService.productsWithAdd$,
    this.categorySelectedAction$
      .pipe(
        startWith(0)
      )
  ])
    .pipe(
      map(([products, selectedCategoryId]) =>
        products.filter(product =>
          selectedCategoryId ? selectedCategoryId === product.categoryId : true
        )
      ),
      catchError(error => {
        this.errorMessageSubject.next(error);
        return EMPTY;
      })
    );

    categories$ = this.categoriesService.productCategories$
      .pipe(
        catchError(error => {
          this.errorMessageSubject.next(error);
          return EMPTY;
        })
      );

    constructor(private productService: ProductService, private categoriesService: ProductCategoryService) { }

  onAdd(): void {
    this.productService.addProduct();
  }

  onSelected(categoryId: string): void {
    this.selectedCategorySubject.next(+categoryId);
  }
}
