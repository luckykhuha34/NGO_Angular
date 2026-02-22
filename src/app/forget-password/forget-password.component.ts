import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../Service/api.service';
import { TosterService } from '../Service/toster.service';
import { SharedService } from '../Service/shared.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss'
})
export class ForgetPasswordComponent {
  step = 1;

  emailForm!: FormGroup;
  resetForm!: FormGroup;

  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toster: TosterService,
    private sharedService: SharedService,
    private router: Router
  ) { }

  ngOnInit() {
    // Step 1 → Email form
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    // Step 2 → OTP + New Password form
    this.resetForm = this.fb.group({
      otp: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }

  togglePassword(type: string) {
    if (type === 'new') this.showNewPassword = !this.showNewPassword;
    if (type === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }

  sendOtp() {
    try {

      if (!this.emailForm.valid) {
        this.toster.show('error', 'Email is invalid');
        return;
      }

      const email = this.emailForm.value.email;
      console.log("Sending OTP to:", email);

      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      let obj = {
        email: email
      }
      this.api.post('auth/forget-password', obj, token).subscribe(res => {
        console.log(res);
        this.toster.show("success", res.message);
      });

      this.step = 2; // Move to next step
    } catch (err) {
      console.log(err.message);
    }
  }

  submitReset() {
    try {
      if (!this.resetForm.valid) return;

      const data = {
        email: this.emailForm.value.email,
        code: String(this.resetForm.value.otp),
        newPassword: this.resetForm.value.newPassword,
        confirmPassword: this.resetForm.value.confirmPassword,
      };

      if (data.newPassword !== data.confirmPassword) {
        alert("New Password and Confirm Password do not match");
        return;
      }

      console.log("Reset password:", data);

      // API CALL → resetPassword(data)
      // this.api.resetPassword(data).subscribe(...)
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.post('auth/reset-password', data, token).subscribe(res => {
        console.log(res);
        this.toster.show("success", res.message);
        this.router.navigate(['/login']);
      });

    } catch (err) {
      console.log(err.message);
    }
  }

}
