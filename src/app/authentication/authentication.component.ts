import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiService } from '../Service/api.service';
import { NgClass, NgIf } from '@angular/common';
import { SharedService } from '../Service/shared.service';
import { LoaderComponent } from '../loader/loader.component';
import { TosterService } from '../Service/toster.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, LoaderComponent, NgClass,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './authentication.component.html',
  styleUrls: ['./authentication.component.scss'],
})
export class AuthenticationComponent implements OnInit {
  loader: boolean = false;
  loginForm!: FormGroup;
  signUpForm!: FormGroup;
  loginPage: boolean = true;
  signUpPage: boolean = false;
  authPage: boolean = true;
  profileUploadPic: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  changePassword: boolean = false;
  showPassword = false;
  url = environment.apiUrl;
  today = new Date().toISOString().split('T')[0];

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private sharedService: SharedService,
    private toster: TosterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.checkAuthStatus();

    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.signUpForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      schoolOrOrganization: ['', Validators.required],
      dob: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      interests: [''],
      profilePhoto: [null],
    });

    // this.signInWithGoogle();
    // Handle Google redirect token
    this.handleGoogleRedirectToken();
  }

  // ===================== LOGIN =====================
  login() {
    const email = this.loginForm.value.userName;
    const password = this.loginForm.value.password;

    if (this.loginForm.valid) {
      this.loader = true;

      this.api.post('auth/login', { email, password }).subscribe({
        next: (res: any) => {
          this.loader = false;
          this.toster.show('success', 'Login successfully');
          const isAdmin = res.user.role === 'admin';
          const authToken = res.token;

          localStorage.setItem('authToken', authToken);
          this.loginPage = false;
          this.authPage = false;
          this.sharedService.login(authToken, isAdmin);

          this.loginForm.reset();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.loader = false;
          this.toster.show('error', err.error?.message || 'Login failed');
        },
      });
    } else {
      this.toster.show('error', 'Form Invalid');
    }
  }

  // ===================== GOOGLE LOGIN =====================
  signInWithGoogle() {
    window.location.href = `${this.url}auth/google`;
  }

  handleGoogleRedirectToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      this.loader = true;

      localStorage.setItem('authToken', token);

      let isAdmin = false;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        isAdmin = payload.role === 'admin';
      } catch (e) {
        console.warn('Failed to decode JWT', e);
      }

      this.sharedService.login(token, isAdmin);

      this.loginPage = false;
      this.authPage = false;
      this.loader = false;

      this.router.navigate([], { replaceUrl: true, queryParams: {} });

      this.router.navigate(['/home']);
    }
  }

  formatDateToYYYYMMDD(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ===================== SIGNUP =====================
  signUp() {
    if (this.signUpForm.invalid) {
      this.toster.show('error', 'Please fill all required fields.');
      return;
    }

    this.loader = true;
    const formData = new FormData();
    formData.append('firstName', this.signUpForm.value.firstName);
    formData.append('lastName', this.signUpForm.value.lastName);
    formData.append('email', this.signUpForm.value.email);
    formData.append('password', this.signUpForm.value.password);
    formData.append(
      'schoolOrganization',
      this.signUpForm.value.schoolOrOrganization
    );
    formData.append('dateOfBirth', this.formatDateToYYYYMMDD(this.signUpForm.value.dob));
    formData.append('phoneNumber', this.signUpForm.value.phoneNumber);
    formData.append('state', this.signUpForm.value.state);
    formData.append('country', this.signUpForm.value.country);

    if (Array.isArray(this.signUpForm.value.interests)) {
      this.signUpForm.value.interests.forEach((item: string, index: number) => {
        formData.append(`causesOfInterest[${index}]`, item);
      });
    } else {
      formData.append('causesOfInterest', this.signUpForm.value.interests);
    }

    formData.append('referredBy', '');

    if (this.profileUploadPic) {
      formData.append('profilePicture', this.profileUploadPic);
    }

    this.api.post('auth/register', formData).subscribe({
      next: (res) => {
        this.loader = false;
        this.toster.show('success', 'Account created successfully!');
        this.router.navigate(['/login']);
        this.loginPage = true;
        this.signUpPage = false;
      },
      error: (err) => {
        this.loader = false;
        this.toster.show('error', err.error?.message || 'Signup failed');
      },
    });
  }

  logout() {
    localStorage.removeItem('authToken');
  }

  checkAuthStatus() {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      try {
        this.api
          .get('volunteers/dashboard', {
            headers: { Authorization: `Bearer ${authToken}` },
          })
          .subscribe((res) => {
            this.loginPage = false;
            this.authPage = false;
          });
      } catch (err: any) {
        this.toster.show('error', err.error?.message || 'Session expired');
      }
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.profileUploadPic = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

  forgetPassword() {
    this.router.navigate(['/forgetPassword']);
  }
}
