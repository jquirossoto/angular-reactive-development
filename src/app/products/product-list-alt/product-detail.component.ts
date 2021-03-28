import { ChangeDetectionStrategy, Component } from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetailComponent {
  pageTitle = 'Product Detail';
  errorMessage = '';

  product$ = this.productService.selectedProduct$
    .pipe(
      catchError(error => {
        this.errorMessage = error;
        return EMPTY;
      })
    )

  constructor(private productService: ProductService) { }

}
