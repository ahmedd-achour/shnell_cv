import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
export interface Subscription {
  id?: string;
  userId: string;
  startDate: string;
  endDate: string;
  active: boolean;
}
@Component({
  selector: 'app-abonnement',
  templateUrl: './abonnement.component.html',
  styleUrls: ['./abonnement.component.css']
})

export class AbonnementComponent implements OnInit {


    // Data Variables
    cars: any[] = [];
    filteredCars: any[] = [];
    loading: boolean = true;
    error: string | null = null;
totalCars: number = 0;
activeSubscriptionsCount: number = 0;
expiredSubscriptionsCount: number = 0;
  
    constructor(private firestore: AngularFirestore,private router: Router  ,private authService: AuthService,
    ) {}
  
    ngOnInit(): void {
      this.loadCars();
    }
  
    // Calculate statistics from loaded cars
    calculateStats(): void {
      this.totalCars = this.cars.length;
      this.activeSubscriptionsCount = this.cars.filter(car => this.isSubscriptionActive(car)).length;
      this.expiredSubscriptionsCount = this.cars.filter(car => !this.isSubscriptionActive(car)).length;
    }
  
    // Load Cars from Firestore
    loadCars(): void {
      this.loading = true;
      this.firestore.collection('voiture').snapshotChanges().subscribe({
        next: (res) => {
          this.cars = res.map((e) => {
            const data = e.payload.doc.data() as any;
            data.id = e.payload.doc.id;
    
            // Handle startDate as Timestamp
            if (data.startDate?.toDate) {
              data.startDate = data.startDate.toDate(); // Convert to JavaScript Date
            }
    
            // Optional: Convert expiry to Date if it's stored as Timestamp
            if (data.expiry?.toDate) {
              data.expiry = data.expiry.toDate();
            }
    
            return data;
          });
    
          this.filteredCars = [...this.cars];
          this.calculateStats(); // Calculate statistics after loading data
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load cars.';
          this.loading = false;
        }
      });
    }
    
  
    // Check if Subscription is Active
    isSubscriptionActive(car: any): boolean {
      const today = new Date();
      const expiryDate = new Date(car.expiry);
      return expiryDate > today;
    }
  
    // Calculate End Date Based on Subscription Type
    getCalculatedEndDate(car: any): string {
      if (!car.startDate || !car.subscriptionType) return '';
    
      const startDate = new Date(car.startDate); // Already a Date object
      let monthsToAdd = 0;
    
      switch (car.subscriptionType) {
        case 'gold':
          monthsToAdd = 12;
          break;
        case 'platinum':
          monthsToAdd = 9;
          break;
        case 'bronze':
          monthsToAdd = 6;
          break;
        default:
          monthsToAdd = 0;
      }
    
      startDate.setMonth(startDate.getMonth() + monthsToAdd);
      return startDate.toISOString().split('T')[0];
    }
    
  
    // Update End Date Dynamically
    updateEndDate(car: any): void {
      car.expiry = this.getCalculatedEndDate(car); // Update expiry date
    }
  
    // Save Changes to Firestore
    saveCarChanges(car: any): void {
      this.firestore.collection('voiture').doc(car.id).update(car).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Car updated successfully!',
          confirmButtonText: 'OK',
        }).then(() => {
          this.router.navigate(['/abonnement']); // Route to abonnement after alert
        });
      }).catch(err => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update car.',
        });
        console.error('Error updating car:', err);
      });
    }
    logout(): void {
      this.authService.signOut();
    }
    
  }





