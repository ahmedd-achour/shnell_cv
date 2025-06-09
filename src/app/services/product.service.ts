import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsCollection!: AngularFirestoreCollection<Product>;
  public products!: Observable<Product[]>;

  constructor(private afs: AngularFirestore) {
    this.productsCollection = this.afs.collection<Product>('products');
    this.products = this.productsCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Product;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  }

  getProducts(): Observable<Product[]> {
    return this.products;
  }

  addProduct(product: Product): Promise<any> {
    return this.productsCollection.add(product);
  }

  updateProduct(id: string, product: Product): Promise<void> {
    return this.productsCollection.doc(id).update(product);
  }

  deleteProduct(id: string): Promise<void> {
    return this.productsCollection.doc(id).delete();
  }
}