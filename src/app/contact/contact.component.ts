import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import emailjs from '@emailjs/browser';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    // Initialize any data or services
  }

  contactData = {
    name: '',
    email: '',
    subject: '',
    inquiryType: '',
    message: ''
  };

  onSubmit() {
    if (!this.isValidForm(this.contactData)) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill out all required fields correctly.',
      });
      return;
    }

    const data = {
      name: this.contactData.name,
      email: this.contactData.email,
      subject: this.contactData.subject,
      inquiryType: this.contactData.inquiryType,
      message: this.contactData.message,
      timestamp: new Date().toLocaleString()
    };

    emailjs.init('Zd5YEhvp49eBkeX-W'); // Replace with your EmailJS public key

    emailjs.send('service_qn0iqj6', 'template_6gv9t6l', data)
      .then((res) => {
        Swal.fire({
          icon: 'success',
          title: 'Message Sent!',
          text: 'We will get back to you as soon as possible.',
        });
        this.resetForm();
      })
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while sending your message.',
        });
      });
  }

  isValidForm(data: any): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      data.name?.trim() &&
      data.subject?.trim() &&
      data.message?.trim() &&
      data.inquiryType?.trim() &&
      emailRegex.test(data.email)
    );
  }

  resetForm() {
    this.contactData = {
      name: '',
      email: '',
      subject: '',
      inquiryType: '',
      message: ''
    };
  }
}


