import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;
  resetPasswordMode: boolean = false;
  resetEmailSent: boolean = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [true]
    });
  }

  async ngOnInit(): Promise<void> {
    try {
      // Check if user is already signed in
      const user = await this.authService.getCurrentUser();  // <-- add this method in AuthService if not exists
      if (user) {
        // Optionally check if email is verified here
        this.router.navigate(['/cars']); // redirect to RegisterCar component
      }
    } catch (error) {
      console.error('Error checking current user:', error);
      // Just continue showing login form if error
    }
  }
  async onSubmit(): Promise<void> {
    if (this.resetPasswordMode) {
      await this.resetPassword();
      return;
    }

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { email, password } = this.loginForm.value;

      // Sign in the user
      await this.authService.signIn(email, password);

      // Reload user to get latest email verification status
      const user = await this.authService.reloadUser();

      if (!user.emailVerified) {
        // Send a new verification email
        await this.authService.sendEmailVerification();
        // Sign out to prevent access
        await this.authService.signOut();

        this.errorMessage = 'please verify your email. a new verification email has been sent.';
        return;
      }

      // Email is verified — show success alert and redirect
      Swal.fire({
        icon: 'success',
        title: 'login successful!',
        text: 'welcome back!',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        this.router.navigate(['/cars']);
      });

    } catch (error: any) {
      console.error('login error:', error);
      switch (error.code) {
        case 'auth/user-not-found':
          this.errorMessage = 'no account found with this email.';
          break;
        case 'auth/wrong-password':
          this.errorMessage = 'invalid password.';
          break;
        case 'auth/invalid-email':
          this.errorMessage = 'invalid email format.';
          break;
        case 'auth/user-disabled':
          this.errorMessage = 'this account has been disabled.';
          break;
        default:
          this.errorMessage = 'an error occurred during sign in. please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  async resetPassword(): Promise<void> {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.errorMessage = 'please enter your email address.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.resetPassword(email);
      this.resetEmailSent = true;
    } catch (error: any) {
      console.error('reset password error:', error);
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'no account found with this email.';
      } else {
        this.errorMessage = 'an error occurred. please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  toggleResetPasswordMode(): void {
    this.resetPasswordMode = !this.resetPasswordMode;
    this.resetEmailSent = false;
    this.errorMessage = '';
  }
}
