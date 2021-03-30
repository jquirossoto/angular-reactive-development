import { ChangeDetectionStrategy, Component } from '@angular/core';
import { combineLatest, EMPTY, Subject } from 'rxjs';
import { catchError, filter, map } from 'rxjs/operators';
import { Product } from '../product';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  pageTitle$ = this.productService.selectedProduct$
    .pipe(
      map((product:Product) =>
        product ? `Product Detail for ${product.productName}` : null
      )
    );

  product$ = this.productService.selectedProduct$
    .pipe(
      catchError(error => {
        this.errorMessageSubject.next(error);
        return EMPTY;
      })
    );

  productSuppliers$ = this.productService.selectedProductSuppliers$
    .pipe(
      catchError(error => {
        this.errorMessageSubject.next(error);
        return EMPTY;
      })
    );

  vm$ = combineLatest([this.pageTitle$, this.product$, this.productSuppliers$])
    .pipe(
      filter(([title, product]) => Boolean(product)),
      map(([title, product, suppliers]) =>
        ({title, product, suppliers})
      )
    )

  constructor(private productService: ProductService) { }

}
