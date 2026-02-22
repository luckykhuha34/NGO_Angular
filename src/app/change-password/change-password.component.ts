import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../Service/api.service';
import { TosterService } from '../Service/toster.service';
import { SharedService } from '../Service/shared.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {

  changePassword: any = FormGroup;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toster: TosterService,
    private sharedService: SharedService,
  ) { }

  ngOnInit(): void {
    this.changePassword = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmNewPassword: ['', Validators.required]
    });
  }


  changePasswordFun() {
    try {
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      let obj = {
        oldPassword: this.changePassword.value.oldPassword,
        newPassword: this.changePassword.value.newPassword,
        confirmPassword: this.changePassword.value.confirmNewPassword
      }
      this.api.post('volunteers/change-password', obj, token).subscribe(res => {
        console.log(res);
        this.changePassword.reset();
        this.toster.show("success", res.message);
        localStorage.removeItem('authToken');
        this.sharedService.logout();
        setTimeout(() => {
          this.toster.show("success", "Login Again");
        }, 100);

      });
    } catch (err) {
      // this.loader = false;
      this.toster.show("error", err.message);
      console.log(err);
    }
  }

  togglePassword(field: string) {
    if (field === 'old') this.showOldPassword = !this.showOldPassword;
    else if (field === 'new') this.showNewPassword = !this.showNewPassword;
    else if (field === 'confirm') this.showConfirmPassword = !this.showConfirmPassword;
  }
}
