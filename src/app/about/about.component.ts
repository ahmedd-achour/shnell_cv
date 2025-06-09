import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Any initialization code can go here
  }
  showReservePopup() {
    Swal.fire({
      title: 'Contact Us',
      text: 'Are you sure you want to contact us?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, contact',
      cancelButtonText: 'No, maybe later',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        // Optional: show a confirmation message before redirecting
        Swal.fire({
          title: 'Please fill out the form!',
          text: 'Redirecting you now...',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/contact']); // Change this route if needed
        });
      }
    });}}


