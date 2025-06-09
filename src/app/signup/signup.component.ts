import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    // Redirect if already logged in
    this.authService.currentUser$.subscribe(user => {
      if (user && user.emailVerified) {
        this.router.navigate(['/registre']);
      }
    });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSubmit(): Promise<void> {
    if (this.signupForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { email, password, name } = this.signupForm.value;

      // Sign up the user
      const result = await this.authService.signUp(email, password);

      // Update display name
      await this.authService.updateUserProfile(name);

      // Send email verification
      await this.authService.sendEmailVerification();

      // Sign out immediately after signup to enforce email verification
      await this.authService.signOut();

      // Alert the user
      await Swal.fire({
        icon: 'success',
        title: 'registration successful',
        text: 'please check your email and verify your account before signing in.',
        confirmButtonText: 'ok'
      });

      // Redirect to login
      this.router.navigate(['/signin']);

    } catch (error: any) {
      console.error('Signup error:', error);
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.errorMessage = 'this email is already in use.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'invalid email format.';
          break;
        case 'auth/weak-password':
          this.errorMessage = 'password is too weak.';
          break;
        default:
          this.errorMessage = 'an error occurred during sign up. please try again.';
      }
    } finally {
      this.loading = false;
    }
  }
}
