import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../Service/api.service';
import { SharedService } from '../Service/shared.service';
import { TosterService } from '../Service/toster.service';
import { LoaderComponent } from '../loader/loader.component';
import { NgClass, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [LoaderComponent, NgIf, ReactiveFormsModule, NgClass],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {

  loader: boolean = false;
  loginForm: any = FormGroup;
  loginPage: boolean = true;
  authPage: boolean = true;
  showPassword = false;

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
      password: ['', Validators.required]
    });
  }

  login() {
    const email = this.loginForm.value.userName;
    const password = this.loginForm.value.password;

    if (this.loginForm.valid) {

      this.loader = true;

      this.api.post('auth/admin/login', { email, password }).subscribe({
        next: (res: any) => {
          this.loader = false;
          console.log(res);
          this.toster.show("success", "Login successfully")
          const isAdmin = res.user.role == 'admin' ? true : false;
          
          const authToken = res.token;
          localStorage.setItem("authToken", authToken);

          this.loginPage = false;
          this.sharedService.login(authToken, isAdmin);

          this.loginForm.reset();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.loader = false;
          console.error('Login failed', err);

          this.toster.show('error', err.error?.message);
        }
      });
    } else {
      this.loader = false;
      console.error('Form Invalid');

      this.toster.show('error', 'Form Invalid');
    }
  }

  routeForgetPass(){
    this.router.navigate(['/forgetPassword']);
  }

  checkAuthStatus() {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      try {
        let obj = {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
        this.api.get('volunteers/dashboard', obj).subscribe(res => {
          console.log(res);
          this.loginPage = false;
          this.authPage = false;
          // this.sharedService.updateDashboardPage(true);
        })
      } catch (err) {
        this.toster.show('error', err.error?.message);
        console.log(err.message);
      }
    }
  }
}
