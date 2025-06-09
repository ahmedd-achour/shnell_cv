export interface Product {
    id?: string;        // Optional because Firestore auto-generates ID
    name: string;
    price: number;
    description?: string;
  }