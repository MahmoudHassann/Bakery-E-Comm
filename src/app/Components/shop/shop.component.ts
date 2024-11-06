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
  getAllProducts(page?: number) {

    this.Prod_Service.getProducts(page).subscribe({
      next: (res: any) => {
        // Assuming res.item contains an array of products with 'discount' property
        this.Products = res.item;
        this.filteredProducts = [...this.Products]
        // Assuming res.totalCount is the total number of products returned by the API
        const totalCount = res.totalCount;
        const pageSize = 12; // or whatever your page size is
        this.totalPages = Math.ceil(totalCount / pageSize); // Calculate total pages dynamically
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1); // Create an array of page numbers


        // Sort products only if discount exists, and then get the top 4 products with the highest discount
        this.Promotions = this.Products
          // Filter products where discount exists and is greater than 0
          .filter((product: any) => product.discount > 0)
          // Sort filtered products by discount in descending order
          .sort((a: any, b: any) => b.discount - a.discount)
          // Get the top 4 products with the highest discount
          .slice(0, 4);

      },
      error: (err) => {
        console.log('Fetch Error', err);
      }
    });


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

  }

  filter_cat(catName: string) {

    if (catName === 'all') {
      this.selectedSubCategory = ''
      this.selectedCategory = ''

      this.filteredProducts = [...this.Products]
    }
    else {

      this.selectedCategory = catName
      this.filteredProducts = this.Products.filter(product => product.category.name === catName);
    }
  }

  searchFilter() {
    this.selectedCategory = 'filter'
    const price = this.modalForm.value.price
    const sweet = this.modalForm.value.sweet
    const pastry = this.modalForm.value.Pastry
    const coffee = this.modalForm.value.Coffee
    const selectedCategories: string[] = [];

    // Add selected categories to the array
    if (sweet) selectedCategories.push("sweet");
    if (pastry) selectedCategories.push("Pastry");
    if (coffee) selectedCategories.push("Coffee");

    // Filter by price if specified
    if (price) {
      if (price === 'less1000') {
        this.filteredProducts = this.Products.filter(item => item.price <= 500);
      } else if (price === 'To3000') {
        this.filteredProducts = this.Products.filter(item => item.price > 500 && item.price <= 3000);
      } else if (price === 'more3000') {
        this.filteredProducts = this.Products.filter(item => item.price > 3000);
      }
    }
    // Filter by selected categories if no price is set
    else if (selectedCategories.length > 0) {
      this.filteredProducts = this.Products.filter(product =>
        selectedCategories.includes(product.category.name)
      );
      console.log(selectedCategories);

    }
    // If no filters are applied, return all products
    else {
      this.filteredProducts = [...this.Products];
    }

    this.modalForm.reset();

    const modalInstance = bootstrap.Modal.getInstance(this.exampleModal?.nativeElement);
    if (modalInstance) {
      modalInstance.hide();
    }

  }





}
