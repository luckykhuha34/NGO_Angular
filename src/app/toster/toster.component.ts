import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TosterService, ToastMessage } from '../Service/toster.service';

@Component({
  selector: 'app-toster',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toster.component.html',
  styleUrl: './toster.component.scss'
})
export class TosterComponent {
   toast: ToastMessage | null = null;

  constructor(private toastService: TosterService) {
    this.toastService.toast$.subscribe(msg => {
      this.toast = msg;
    });
  }

  closeToast() {
    this.toastService.clear();
  }
}
