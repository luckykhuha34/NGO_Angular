import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { AuthenticationComponent } from '../authentication/authentication.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { SharedService } from '../Service/shared.service';
import { Observable } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';
import { FooterComponent } from '../footer/footer.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, AuthenticationComponent, DashboardComponent, AsyncPipe, NgIf, FooterComponent,
    ChangePasswordComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  // showChangePassword = false;
  isLoggedIn$: Observable<boolean>;
  constructor(private sharedService: SharedService) {
    this.isLoggedIn$ = this.sharedService.isLoggedIn$;
  }

  ngOnInit() {
    // this.sharedService.showChangePassword$.subscribe(value => {
    //   this.showChangePassword = value;
    // });
  }
}
