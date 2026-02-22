import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, NgModel, FormsModule } from '@angular/forms';
import { AsyncPipe, NgIf } from '@angular/common';
import { ApiService } from '../Service/api.service';
import { TosterService } from '../Service/toster.service';
import { environment } from '../../environments/environment';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  updateProfile: any = FormGroup;
  myProfile: boolean = false;
  editProfile: boolean = true;
  user: any;
  isDisabled = true;
  previewUrl: string | ArrayBuffer | null = null;
  profileUploadPic: File | null = null;
  fileBaseUrl = environment.fileBaseUrl;
  uploadPic: boolean = false;
  // today = (() => {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   const month = String(now.getMonth() + 1).padStart(2, '0');
  //   const day = String(now.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // })();
  today: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private toster: TosterService
  ) { }

  ngOnInit() {

    this.loadProfileData();

    this.updateProfile = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      // userName: ['', Validators.required],
      // password: ['', Validators.required],
      organization: ['', Validators.required],
      dob: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      // refCode: ['', Validators.required],
      interests: ['', Validators.required],
    });

    // updateProfile = this.fb.group({
    //   fullName: ['', Validators.required],
    //   organization: ['', Validators.required],
    //   dob: ['', Validators.required],
    //   email: ['', [Validators.required, Validators.email]],
    //   phoneNumber: ['', Validators.required],
    //   bio: ['']
    // });
  }

  enableEdit() {
    console.log('')
  }

  // onFileSelected(event: any) {
  //   const file = event.target.files[0];

  //   if (file) {
  //     this.profileUploadPic = file;
  //     const reader = new FileReader();
  //     reader.onload = () => (this.previewUrl = reader.result);
  //     reader.readAsDataURL(file);
  //   }
  // }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.uploadPic = true;
      this.profileUploadPic = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result?.toString() ?? null;   // FIXED 👍
      };
      reader.readAsDataURL(file);
    }
  }

  // onFileSelected(event: any) { this.previewUrl = event.target.files[0]; console.log(this.previewUrl) }

  onImageChange(event) {
    console.log('');
  }

  // loadProfileData() {
  //   try {
  //     // this.isLoading = true;
  //     const authToken = localStorage.getItem("authToken");
  //     let token = {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`
  //       }
  //     }
  //     this.api.get('volunteers/profile', token).subscribe(res => {
  //       console.log(this.updateProfile);
  //       console.log(res);
  //       let user = res.user;

  //     });
  //   } catch (err) {
  //     // this.loader = false;
  //     this.toster.show("error", err.message);
  //     console.log(err);
  //   }
  // }


  loadProfileData() {
    try {
      const authToken = localStorage.getItem("authToken");
      const token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      };

      this.api.get('volunteers/profile', token).subscribe({
        next: (res: any) => {
          const user = res.user;

          console.log('user: >> ', user);

          const dobFromApi = user.profile.dateOfBirth
                ? new Date(user.profile.dateOfBirth)
                : null;

          this.updateProfile.patchValue({
            firstName: user.profile.firstName || '',
            lastName: user.profile.lastName || '',
            organization: user.profile.schoolOrganization || '',
            dob: dobFromApi || '',
            // country: `${user.profile.location?.state || ''}, ${user.profile.location?.country || ''}`,
            state: user.profile.location?.state || '',
            country: user.profile.location?.country || '',
            phoneNumber: user.profile.phoneNumber || '',
            email: user.email || '',
            interests: user.profile.causesOfInterest?.join(', ') || ''
          });
          this.previewUrl = user.profile.profilePicture;
          // this.profileUploadPic = user.profile.profilePicture;

          console.log('Profile form patched:', this.updateProfile.value);
        },
        error: (err) => {
          this.toster.show("error", err.message);
          console.error(err);
        }
      });
    } catch (err) {
      this.toster.show("error", err.message);
      console.error(err);
    }
  }

  // updateProfileFun() {
  //   console.log(this.updateProfile)
  //   if (this.updateProfile.invalid) {
  //     this.toster.show('error', 'Please fill all required fields.');
  //     return;
  //   }

  //   // this.loader = true;

  //   const formData = {
  //     fullName: this.updateProfile.value.fullName,
  //     email: this.updateProfile.value.email,
  //     phoneNumber: this.updateProfile.value.phoneNumber,
  //     dateOfBirth: this.updateProfile.value.dob,
  //     organization: this.updateProfile.value.organization,
  //     bio: this.updateProfile.value.bio,
  //     profilePicture: this.profileUploadPic
  //   };

  //   const authToken = localStorage.getItem("authToken");
  //   let token = {
  //     headers: {
  //       Authorization: `Bearer ${authToken}`
  //     }
  //   }

  //   this.api.post('volunteers/profile/update', formData, token).subscribe({
  //     next: (res) => {
  //       // this.loader = false;
  //       this.toster.show('success', 'Profile updated successfully!');
  //       this.editProfile = false;
  //     },
  //     error: (err) => {
  //       // this.loader = false;
  //       this.toster.show('error', err.error?.message || 'Failed to update profile');
  //       console.error(err);
  //     }
  //   });
  // }

  updateProfileFun() {

    if (this.updateProfile.invalid) {
      this.toster.show('error', 'Please fill all required fields.');
      return;
    }

    const formData = new FormData();

    formData.append("firstName", this.updateProfile.value.firstName);
    formData.append("lastName", this.updateProfile.value.lastName);
    // formData.append("email", this.updateProfile.value.email);
    formData.append("phoneNumber", this.updateProfile.value.phoneNumber);
    formData.append("dateOfBirth", this.updateProfile.value.dob);
    formData.append("schoolOrganization", this.updateProfile.value.organization);
    formData.append("state", this.updateProfile.value.state);
    formData.append("country", this.updateProfile.value.country);
    formData.append("causesOfInterest", this.updateProfile.value.interests);

    // ⬇️ Append profile picture file (NOT Base64)
    if (this.profileUploadPic) {
      formData.append("profilePicture", this.profileUploadPic);
    }

    const authToken = localStorage.getItem("authToken");
    const token = {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    };

    this.api.post('volunteers/profile/update', formData, token).subscribe({
      next: (res) => {
        this.toster.show('success', 'Profile updated successfully!');
        // this.editProfile = false;
        this.uploadPic = false;
        this.loadProfileData();
      },
      error: (err) => {
        this.toster.show('error', err.error?.message || 'Failed to update profile');
        console.error(err);
      }
    });
  }

  onDobChange(event: MatDatepickerInputEvent<Date>) {
    const date = event.value;
    if (date) {
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const day = ('0' + date.getDate()).slice(-2);

      const formatted = `${year}-${month}-${day}`;
      
      this.updateProfile.patchValue({ dob: formatted }, { emitEvent: false });
    }
  }
}
