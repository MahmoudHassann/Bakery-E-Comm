import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ProductsService } from '../../services/products/products.service';
import { Product } from '../../interfaces/product';
import { Category } from '../../interfaces/category';
import { SubCategory } from '../../interfaces/sub-category';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit {
  @ViewChild('exampleModal', { static: false }) exampleModal?: ElementRef;

  constructor(private router: Router, private Prod_Service: ProductsService) {
    this.modalForm = new FormGroup({
      price: new FormControl(0),
      Pastry: new FormControl(false),
      sweet: new FormControl(false),
      Coffee: new FormControl(false)
    })
  }

  Products: Product[] = []
  filteredProducts: Product[] = []
  showProducts: Product[] = []
  Promotions: Product[] = []
  Categories: Category[] = []
  subCategories: SubCategory[] = []
  selectedCategory: string = ''
  selectedSubCategory: string = ''
  faFilter = faFilter
  modalForm: FormGroup
  currentPage = 1;
  totalPages = 1;
  pages: number[] = [];
  filterState: { price?: string; categories?: string[] } = {}
  totalCount: number = 0


  ngOnInit() {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0)
    });

    this.getAllProducts();
    this.getAllCategories();
    this.getAllProducts(this.currentPage);

  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.getAllProducts(page);
  }


  product(id: any) {

    this.router.navigate([`/product/${id}`])
  }
  getAllProducts(page?: number, filter?: any, pageSize = 12) {

    if (filter && filter.length > 0) {
      // Fetch all items to apply the filter locally
      this.Prod_Service.getProducts(1).subscribe({
        next: (res: any) => {
          this.Products = res.item; // Load all items from the backend

          this.filteredProducts = this.Products.filter((product: any) => {
            let matchesCategory = true;
            let matchesPrice = true;

            // Apply each filter condition
            filter.forEach((criteria: any) => {
              if (criteria.price) {
                if (criteria.price === 'less1000') {
                  matchesPrice = matchesPrice && product.price <= 500;
                } else if (criteria.price === 'To3000') {
                  matchesPrice = matchesPrice && product.price > 500 && product.price <= 3000;
                } else if (criteria.price === 'more3000') {
                  matchesPrice = matchesPrice && product.price > 3000;
                }
              }
              if (criteria.category) {
                matchesCategory = matchesCategory && criteria.category.includes(product.category.name);
              }
            });

            return matchesCategory && matchesPrice;
          });

          // Display filtered results on a single page
          this.totalPages = 1;
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        },
        error: (err) => {
          console.log('Fetch Error', err);
        }
      });
    } else {
      // If no filter, fetch paginated data with default page size
      this.Prod_Service.getProducts(page, pageSize).subscribe({
        next: (res: any) => {
          this.Products = res.item;
          this.showProducts = [...this.Products];
          this.filteredProducts = [...this.Products];

          this.totalCount = res.totalCount;
          this.totalPages = Math.ceil(this.totalCount / pageSize);
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

          // Process promotions
          this.Promotions = this.Products
            .filter((product: any) => product.discount > 0)
            .sort((a: any, b: any) => b.discount - a.discount)
            .slice(0, 4);
        },
        error: (err) => {
          console.log('Fetch Error', err);
        }
      });
    }
  }



  getAllCategories() {
    this.Prod_Service.getCategories().subscribe({
      next: (res: any) => {
        this.Categories = res.categories

      },
      error: (err) => {
        console.log('Fetch Error', err);
      }
    })
  }

  filter_subCat(subCatName: string, catName: string) {

    this.selectedSubCategory = subCatName
    this.selectedCategory = catName
    this.filteredProducts = this.Products.filter(product => product.subCategory.name === subCatName);
    this.totalPages = Math.ceil(this.filteredProducts.length / 12);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  filter_cat(catName: string) {

    if (catName === 'all') {
      this.selectedSubCategory = ''
      this.selectedCategory = ''
      this.totalPages = Math.ceil(this.totalCount / 12);
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

      this.filteredProducts = this.showProducts
    }
    else {
      this.selectedCategory = catName
      this.filteredProducts = this.showProducts.filter(product => product.category.name === catName);
      this.totalPages = Math.ceil(this.filteredProducts.length / 12);
      this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
  }

  searchFilter() {
    const filter = [];
    this.selectedCategory = 'filter';
    const price = this.modalForm.value.price;
    const sweet = this.modalForm.value.sweet;
    const pastry = this.modalForm.value.Pastry;
    const coffee = this.modalForm.value.Coffee;
    const selectedCategories: string[] = [];

    // Add selected categories to the array
    if (sweet) selectedCategories.push("Sweet");
    if (pastry) selectedCategories.push("Pastry");
    if (coffee) selectedCategories.push("Coffee");

    // Filter by price if specified
    if (price) {
      if (price === 'less1000') {
        filter.push({ price: 'less1000' });
      } else if (price === 'To3000') {
        filter.push({ price: 'To3000' });
      } else if (price === 'more3000') {
        filter.push({ price: 'more3000' });
      }
    }

    // Filter by selected categories if no price is set
    if (selectedCategories.length > 0) {
      filter.push({ category: selectedCategories });
    }



    this.getAllProducts(1, filter);
    this.modalForm.reset();

    const modalInstance = bootstrap.Modal.getInstance(this.exampleModal?.nativeElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  }





}
