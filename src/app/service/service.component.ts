import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent {
  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
  constructor(private router: Router) {}

  showReservePopup() {
    Swal.fire({
      title: 'Buy product',
      text: 'Are you sure you want to buy our product ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, reserve it!',
      cancelButtonText: 'No, maybe later',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        // Optional: show a short confirmation before routing
        Swal.fire({
          title: 'Redirecting',
          text: 'Redirecting to homepage...',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/home']); // replace with your actual route
        });
      }
    });
  }
  


}
