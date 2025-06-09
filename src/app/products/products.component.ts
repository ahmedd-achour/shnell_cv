import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

// Define Product Interface
export interface Product {
  id?: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  active: boolean;
}


  
  @Component({
    selector: 'app-products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css']
  })
  export class ProductsComponent implements OnInit {
    // Data Variables
    products: Product[] = [];
    filteredProducts: Product[] = [];
    loading: boolean = true;
    error: string | null = null;
  
    // Stats Variables
    totalProducts: number = 0;
    activeProductsCount: number = 0;
    pendingProductsCount: number = 0;
    outOfStockProductsCount: number = 0;
  
    // Modal Variables
    newProduct: Product = { name: '', price: 0, category: '', stock: 0, active: true };
    editingProduct: Product = { name: '', price: 0, category: '', stock: 0, active: true };
  
    constructor(private firestore: AngularFirestore,    private authService: AuthService,
    ) {}
  
    ngOnInit(): void {
      this.loadProducts();
    }
  
    // Load Products from Firestore
    loadProducts(): void {
      this.loading = true;
      this.firestore.collection<Product>('products').snapshotChanges().subscribe({
        next: (res) => {
          this.products = res.map((e) => {
            const data = e.payload.doc.data() as Product;
            data.id = e.payload.doc.id;
            return data;
          });
          this.filteredProducts = [...this.products];
          this.calculateStats();
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load products.';
          this.loading = false;
        }
      });
    }
  
    // Calculate Stats
    calculateStats(): void {
      this.totalProducts = this.products.length;
      this.activeProductsCount = this.products.filter(p => p.active).length;
      this.pendingProductsCount = this.products.filter(p => !p.active && p.stock > 0).length;
      this.outOfStockProductsCount = this.products.filter(p => p.stock === 0).length;
    }
  
    // Add New Product
    saveNewProduct(): void {
      if (!this.newProduct.name || this.newProduct.price <= 0) {
        Swal.fire('Validation Error', 'Please fill all required fields.', 'warning');
        return;
      }
  
      this.firestore.collection('products').add(this.newProduct).then(() => {
        Swal.fire('Success!', 'Product added successfully.', 'success');
        this.resetNewProductForm();
        const modalElement = document.getElementById('addProductModal');
        // if (modalElement) {
        //   const modal = bootstrap.Modal.getInstance(modalElement);
        //   if (modal) modal.hide();
        // }
      }).catch(err => {
        Swal.fire('Error', 'Failed to add product.', 'error');
      });
    }
  
    // Reset Add Product Form
    resetNewProductForm(): void {
      this.newProduct = { name: '', price: 0, category: '', stock: 0, active: true };
    }
  
    // Open Edit Modal and Prefill Data
    editProduct(product: Product): void {
      this.editingProduct = { ...product }; // Copy product to form
      const modalElement = document.getElementById('editProductModal');
      // if (modalElement) {
      //   const modal = new bootstrap.Modal(modalElement);
      //   modal.show();
      // }
    }
  
    // Save Edited Product
    saveEditedProduct(): void {
      if (!this.editingProduct.name || this.editingProduct.price <= 0) {
        Swal.fire('Validation Error', 'Please fill all required fields.', 'warning');
        return;
      }
  
      if (this.editingProduct.id) {
        this.firestore.collection('products').doc(this.editingProduct.id).update(this.editingProduct).then(() => {
          Swal.fire('Success!', 'Product updated successfully.', 'success');
          this.resetEditProductForm();
          const modalElement = document.getElementById('editProductModal');
          // if (modalElement) {
          //   const modal = bootstrap.Modal.getInstance(modalElement);
          //   if (modal) modal.hide();
          // }
        }).catch(err => {
          Swal.fire('Error', 'Failed to update product.', 'error');
        });
      }
    }
  
    // Reset Edit Product Form
    resetEditProductForm(): void {
      this.editingProduct = { name: '', price: 0, category: '', stock: 0, active: true };
    }
  
    // Delete Product
    deleteProduct(productId: string): void {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.firestore.collection('products').doc(productId).delete().then(() => {
            Swal.fire('Deleted!', 'Product has been deleted.', 'success');
          }).catch(err => {
            Swal.fire('Error', 'Failed to delete product.', 'error');
          });
        }
      });
    }
  
    // Toggle Product Status
    toggleStatus(product: Product): void {
      const updatedProduct = { ...product, active: !product.active };
      this.firestore.collection('products').doc(updatedProduct.id!).update(updatedProduct).then(() => {
        Swal.fire('Success!', 'Product status updated.', 'success');
      }).catch(err => {
        Swal.fire('Error', 'Failed to update status.', 'error');
      });
    }
  
    // Search Products
    filterProducts(event: any): void {
      const term = event.target.value.toLowerCase();
      this.filteredProducts = this.products.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term)
      );
    }
  
    // Sort Table
    sortTable(field: string): void {
      this.filteredProducts.sort((a, b) => {
        if (a[field] < b[field]) return -1;
        if (a[field] > b[field]) return 1;
        return 0;
      });
    }
    logout(): void {
      this.authService.signOut();
    }
  }
