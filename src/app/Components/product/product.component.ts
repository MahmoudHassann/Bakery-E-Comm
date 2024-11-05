import { Component, OnInit } from '@angular/core';
import { GalleriaModule } from 'primeng/galleria';
import { PhotosService } from '../../photos.service';
import { ProductsService } from '../../services/products/products.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PaymentService } from '../../services/Payments/payment.service';
import { CartItems } from '../../interfaces/cart-items';


@Component({
  selector: 'app-product',
  standalone: true,
  imports: [GalleriaModule,RouterModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss',
})
export class ProductComponent implements OnInit {
  images: any[] = [];
  Product: any = null;
  Id: string | null = null
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '960px',
      numVisible: 4,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];
  constructor(private PaymentService: PaymentService, private Prod_Service: ProductsService, private actvRoute: ActivatedRoute) { }
  ngOnInit() {
    this.Id = this.actvRoute.snapshot.paramMap.get('id')
    /* this.photoService.getImages().then((images) => (this.images = images)); */
    this.getProduct()
  }

  getProduct() {
    this.Prod_Service.getProductById(this.Id).subscribe({
      next: (res: any) => {
        this.Product = res.item
        console.log(this.Product);
        
      },
      error: (err) => {
        console.log('Fetch Error', err);
      }
    })
  }

  addToCart()
  {
    let data:CartItems = {items:[{itemId:this.Id,quantity:1}]}
    this.PaymentService.addCart(data).subscribe({
      next: (res:any)=>{
        console.log(res);
        // Directly increment the cart count by 1
        this.PaymentService.incrementCartCount(1);
      },
      error: (err) => {
        console.log('Fetch Error', err);
      }
    })
    
  }

}
