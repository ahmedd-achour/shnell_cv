import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;
import emailjs from '@emailjs/browser';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  // Form data object
  formData = {
    pickupTime: '',
    fullName: '',
    email: '',
    phone: '',
    additionalInfo: ''
  };

  // Update onSubmit to use formData



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
        Swal.fire(
          'Contact of our admins!',
          'feel the form need it .',
          'warning'
        );
      }
    });
  }
  showPopup = true;

installApp() {
    // Replace with your actual APK or app download URL
    const appLink = 'https://zingy-chaja-4ea57d.netlify.app/Car-Care.apk';
    window.open(appLink, '_blank');
  }

  closePopup() {
    this.showPopup = false;
  }

  onSubmit(formValue: any) {
    if (!this.isValidForm(formValue)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please make sure all fields are filled correctly.',
      });
      return;
    }

    const data = {
      full_name: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      additional_info: formValue.additionalInfo,
      name: formValue.fullName,
      time: formValue.pickupTime,
      timestamp: new Date().toLocaleString()
    };

    emailjs.init('Zd5YEhvp49eBkeX-W');

    emailjs.send('service_qn0iqj6', 'template_z30ovkn', data)
      .then((response) => {
        Swal.fire({
          icon: 'success',
          title: 'Message Sent!',
          text: 'Your message has been successfully sent.'
        });
      }, (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Sending Failed',
          text: 'There was an error sending your message.'
        });
      });
  }

  isValidForm(form: any): boolean {
    const phoneRegex = /^\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return (
      form.fullName?.trim() &&
      form.email?.trim() &&
      form.pickupTime?.trim() &&
      form.phone?.trim() &&
      phoneRegex.test(form.phone) &&
      emailRegex.test(form.email)
    );
  }

















  constructor() { }

  ngOnInit(): void {
    // Set background image dynamically if needed
    setTimeout(() => {
      this.showPopup = true;
    }, 3000);

    this.setBackgroundImage();

    // Set current year in copyright
    this.setCurrentYear();

    // Load Cloudinary script
    this.loadCloudinaryScript();

  }



















  // Method to set background image
  setBackgroundImage(): void {
    // You can dynamically set the background image here if needed
    const heroElement = document.querySelector('.hero') as HTMLElement;
    if (heroElement) {
      // Make sure the image path is correct
      heroElement.style.backgroundImage = "url('../../assets/image.png')";
    }
  }

  // Method to set current year in copyright
  setCurrentYear(): void {
    const year = new Date().getFullYear();
    const copyrightElement = document.querySelector('.copyright p');
    if (copyrightElement) {
      copyrightElement.innerHTML = copyrightElement.innerHTML.replace('<script>document.write(new Date().getFullYear());</script>', year.toString());
    }
  }

  // Load Cloudinary script
  loadCloudinaryScript(): void {
    if (!document.getElementById('cloudinary-script')) {
      console.log('Loading Cloudinary script...');
      const script = document.createElement('script');
      script.id = 'cloudinary-script';
      script.src = 'https://unpkg.com/cloudinary-video-player@1.9.0/dist/cld-video-player.min.js';
      script.onload = () => {
        console.log('Cloudinary script loaded successfully');
      };
      script.onerror = (error) => {
        console.error('Failed to load Cloudinary script:', error);
      };
      document.body.appendChild(script);

      // Also load the CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/cloudinary-video-player@1.9.0/dist/cld-video-player.min.css';
      document.head.appendChild(link);
    }
  }

  // Open video modal
  openVideoModal(event: Event): void {
    event.preventDefault();

    // Initialize modal
    const modalElement = document.getElementById('videoModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();

      // Initialize player after modal is shown
      modalElement.addEventListener('shown.bs.modal', () => {
        this.initCloudinaryPlayer();
      });

      // Reset player when modal is hidden
      modalElement.addEventListener('hidden.bs.modal', () => {
        const playerElement = document.getElementById('player');
        if (playerElement) {
          playerElement.innerHTML = '';
        }
      });
    }
  }

  // Initialize Cloudinary player
  initCloudinaryPlayer(): void {
    const playerElement = document.getElementById('player');
    if (playerElement) {
      // Use iframe as fallback
      playerElement.innerHTML = `
        <iframe
          src="https://player.cloudinary.com/embed/?cloud_name=dhuu8yxey&public_id=px6dlhxk8miqzyzfgi1l&fluid=true&controls=true&autoplay=true"
          width="100%"
          height="400"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowfullscreen
          frameborder="0">
        </iframe>
      `;
    }
  }
}






