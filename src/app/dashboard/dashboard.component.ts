import { AsyncPipe, DatePipe, JsonPipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, inject, HostListener, ChangeDetectorRef } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { ApiService } from '../Service/api.service';
import { FormsModule, NgModel } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoaderComponent } from '../loader/loader.component';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { TosterService } from '../Service/toster.service';
import { FooterComponent } from '../footer/footer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Dialog } from '@angular/cdk/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


import html2pdf from 'html2pdf.js';
import { SearchFilterPipe } from '../search-filter.pipe';
import { environment } from '../../environments/environment';
import { TREE_KEY_MANAGER_FACTORY_PROVIDER } from '@angular/cdk/a11y';

interface DashboardData {
  profile: { firstName: string; lastName: string; fullName: string; schoolOrganization: string };
  totalHours: number;
  thisYearHours: number;
  tier: string;
  referralCode: string;
  badges: string[];
  hoursHistory: any[];
  tierMessages: any;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf,
    NgFor, NgClass, DatePipe, TitleCasePipe, FormsModule, LoaderComponent, AsyncPipe,
    JsonPipe, FooterComponent, MatButtonModule, MatDialogModule, DialogComponent,
    SearchFilterPipe,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly dialog = inject(MatDialog);
  loader: boolean = false;
  API_BASE = 'http://localhost:3000/api';
  authToken = localStorage.getItem('authToken');
  dashboardData!: DashboardData;
  progressInfo: any;
  statusFilter: string = '';

  statCards: any[] = [];
  statCardsAdmin: any[] = [];
  dashboardPage: boolean = false;

  showSubmitModal = false;
  // isAdmin$ : Observable<boolean>; // toggle based on login
  isAdmin: any; // toggle based on login
  // today = new Date().toISOString().split('T')[0];
  today = new Date();
  isLoading = false;
  pdfExportData: any;
  adminCardsData: any;
  searchBy: string = 'activityName';
  searchText: string = '';
  searchType: string = '';
  dropdownOpen = false;
  displayLabel: string = 'Select Filter';
  path: boolean = false;
  fileBaseUrl = environment.fileBaseUrl;

  selectedFilter = '';
  searchFromDate: string = '';
  searchToDate: string = '';

  loaderVisible: boolean = false;

  hours: any = {
    firstName: '',
    lastName: '',
    // schoolOrganization: '',
    activityName: '',
    serviceDate: '',
    hours: '',
    serviceType: '',
    description: '',
    isHistorical: false
  };
  proofFile: File | null = null;

  serviceTypes = [
    'NEST4US Service Projects',
    'NEST4US Community/School Events',
    'NEST4US Food Rescues',
    'NEST4US Community Resource Distributions',
    'NEST Tutors',
    'NEST4US Notes of Kindness',
    'NEST4US Workshops',
    'NEST4US Donations',
    'NEST4US Impact Internship',
    "Other"
  ];

  adminStats = { totalVolunteers: 0, totalHours: 0, pendingSubmissions: 0 };
  pendingHours: any[] = [];

  constructor(
    private sharedService: SharedService,
    private api: ApiService,
    private toster: TosterService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.isAdmin = this.sharedService.isAdmin$;
  }

  ngOnInit() {
    this.loadDashboardData();
    this.isAdmin = localStorage.getItem('user') == 'admin' ? true : false;
    this.newTier();
    this.getServiceTypes();
    if (this.isAdmin) {
      this.loadAdminPanel();
      this.loadAdminCards();
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  // selectFilter(type: string, label: string) {
  //   this.searchType = type;
  //   this.displayLabel = label;
  //   this.dropdownOpen = false;
  // }

  // CLOSE DROPDOWN ON CLICK OUTSIDE
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    // If click is outside the dropdown, close it
    if (!target.closest('.dropdown')) {
      this.dropdownOpen = false;
    }
  }

  newTier() {
    try {
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.get('volunteers/newTier', token).subscribe(res => {
        console.log('newTier: ', res);
        const unlockedTier = res.unlockedTier;
        // res = {
        //   "newTierUnlocked": true,
        //   "unlockedTier": "Legacy Leader",
        //   "tierContent": {
        //     "subject": "You Are Now a Legacy Leader!",
        //     "message": "You’ve gone above and beyond! NEST4US is proud to recognize you as a <strong>LEGACY LEADER</strong> for your 250+ hours of volunteer service. Your dedication has built a legacy of kindness and impact that will inspire generations to come!"
        //   }
        // }
        // const unlockedTier = res.unlockedTier;

        const tierContent = res.tierContent
        if (res.newTierUnlocked) {
          const type = 'newTier'
          const dialogRef = this.dialog.open(DialogComponent, {
            // width: '400px',
            data: { type, tierContent, unlockedTier }
          });
        }

        // this.dashboardData = res;
        // this.calculateProgress();
        // this.prepareStatCards();
        // this.loadAdminPanel();
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  loadDashboardData() {
    try {
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.get('volunteers/dashboard', token).subscribe(res => {
        console.log('volunteers/dashboard >>> ', res);
        this.dashboardData = res;
        this.calculateProgress();
        this.prepareStatCards();
        this.loadAdminPanel();
        this.hours.firstName = this.dashboardData.profile.firstName;
        this.hours.lastName = this.dashboardData.profile.lastName;
      });
    } catch (err) {
      // this.loader = false;
      this.toster.show("error", err.message);
      console.log(err);
    }
  }
  loadDashboardDataRefresh() {
    try {
      this.isLoading = true;
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.get('volunteers/dashboard', token).subscribe(res => {
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
        // this.toster.show('success', 'Dashboard data refresh');
        console.log('dashboardData >>> ', res);
        this.dashboardData = res;
        this.calculateProgress();
        this.prepareStatCards();
        this.loadAdminPanel();
        this.hours.fullName = this.dashboardData.profile.fullName;
      });
    } catch (err) {
      // this.loader = false;
      this.toster.show("error", err.message);
      console.log(err);
    }
  }


  prepareStatCards() {
    this.statCards = [
      {
        icon: 'fas fa-clock',
        label: 'Lifetime Hours',
        value: this.dashboardData?.totalHours || 0,
      },
      {
        icon: 'fas fa-dollar-sign',
        label: 'Value of Service',
        // value: `$${this.dashboardData.valueOfService || '0.00'}`,
        // value: `$${(this.dashboardData?.totalHours * 34.79)}`,
        value: `$${((this.dashboardData?.totalHours || 0) * 34.79).toFixed(2)}`,
        // value: `$${(43877.6666666666666).toFixed(2)}`,
      },
      {
        icon: 'fas fa-calendar',
        // label: 'Annual Year',
        label: 'This Year',
        value: this.dashboardData?.thisYearHours || 0,
      },
      {
        icon: 'fas fa-award',
        label: 'Recognition Tier',
        value: this.dashboardData?.tier || 'N/A',
      },
    ],
      this.statCardsAdmin = [
        {
          icon: 'fa-solid fa-heart',
          label: 'Total Volunteers',
          value: this.adminCardsData?.totalVolunteers || 0,
        },
        {
          icon: 'fa-solid fa-clock',
          label: 'Total Hours',
          // value: `$${this.dashboardData.valueOfService || '0.00'}`,
          value: this.adminCardsData?.totalHours || 0,
        },
        {
          icon: 'fas fa-dollar-sign',
          label: 'Value of Service',
          value: this.adminCardsData?.valueOfService || '0.00',
        },
        {
          icon: 'fa-solid fa-clipboard-list',
          label: 'Pending Submissions',
          value: this.adminCardsData?.pendingSubmissions || 'N/A',
        },
      ];
  }

  getServiceTypes() {
    try {
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.get('volunteers/service-types', token).subscribe(res => {
        console.log(res);
        if (res?.data) {
          this.serviceTypes = res?.data;
        }
      })
    } catch (err) {
      console.log(err.message);
    }
  }

  loadAdminCards() {
    try {
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.get('admin/summary', token).subscribe(res => {
        console.log(res);
        this.adminCardsData = res?.summary;
        this.prepareStatCards();
      })
    } catch (err) {
      console.log(err.message);
    }
  }

  calculateProgress() {
    const tiers = [
      { name: 'Kindness Ambassador', hours: 50 },
      { name: 'Change Catalyst', hours: 100 },
      { name: 'Service Champion', hours: 150 },
      { name: 'Legacy Leader', hours: 250 },
    ];

    const totalHours = this.dashboardData.totalHours;
    const nextTier = tiers.find((t) => totalHours < t.hours);

    if (!nextTier) {
      this.progressInfo = null; // Already max tier
      return;
    }

    const progress = (totalHours / nextTier.hours) * 100;
    const remaining = nextTier.hours - totalHours;

    this.progressInfo = { nextTier, progress, remaining };
  }


  get filteredHistory() {
    if (!this.dashboardData?.hoursHistory) return [];
    return this.statusFilter
      ? this.dashboardData.hoursHistory.filter(
        (h) => h.status === this.statusFilter
      )
      : this.dashboardData.hoursHistory;
  }

  statusClass(status: string) {
    return {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    }[status];
  }

  statusIcon(status: string) {
    return {
      pending: 'fas fa-clock',
      approved: 'fas fa-check-circle',
      rejected: 'fas fa-times-circle',
    }[status];
  }

  onSubmitHours() {
    this.path = false;
    const authToken = localStorage.getItem("authToken");
    let token = {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }
    this.hours = {
      serviceDate: new Date(),
      firstName: this.dashboardData.profile.firstName,
      lastName: this.dashboardData.profile.lastName,
    };

    this.api.get('volunteers/check-profile-completion', token).subscribe(res => {
      if (res?.isProfileComplete == true) {
        this.showSubmitModal = true;
      } else {
        this.toster.show('error', 'Complete your profile to continue');
      }
    });
  }

  onExportData() {
    console.log('Export data clicked');
  }

  editHoursAdmin(id: string) {
    console.log(this.dashboardData)
    const entry = this.pendingHours.find(e => e._id === id);
    const serviceDate = entry.serviceDate
                ? new Date(entry.serviceDate)
                : null;
    console.log(entry)
    if (entry) {
      this.hours = {
        firstName: entry.firstName,
        lastName: entry.lastName,
        activityName: entry.activityName,
        serviceDate: serviceDate, // keep YYYY-MM-DD
        hours: entry.hours,
        serviceType: entry.serviceType,
        description: entry.description,
        isHistorical: entry.isHistorical || false,
        id: id,
        proofOfService: entry.proofOfService
      };

      this.showSubmitModal = true;
    }
  }

  editHours(id: string) {
    this.path = true;
    const obj = {
      id: id
    }

    const authToken = localStorage.getItem("authToken");
    let token = {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    }

    this.api.post('hours/get-entry', obj, token).subscribe(res => {

      const entry = res?.entry;
      console.log('edit hour: ', entry);

      const serviceDate = entry.serviceDate
                ? new Date(entry.serviceDate)
                : null;
      if (entry) {
        this.hours = {
          firstName: entry.firstName,
          lastName: entry.lastName,
          activityName: entry.activityName,
          serviceDate: serviceDate, // keep YYYY-MM-DD
          hours: entry.hours,
          serviceType: entry.serviceType,
          description: entry.description,
          isHistorical: entry.isHistorical || false,
          id: id,
          proofOfService: entry.proofOfService
        };
        this.showSubmitModal = true;
      }
    });
  }

  updateHours() {
    if (!this.hours || !this.hours.id) {
      console.error("No entry selected for update");
      this.toster.show('error', "No entry selected for update");
      return;
    }

    const authToken = localStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${authToken}`
    };

    // ---------- CASE 1: Update WITH Image ----------
    if (this.proofFile) {
      const formData = new FormData();

      formData.append("id", this.hours.id);
      formData.append("firstName", this.hours.firstName);
      formData.append("lastName", this.hours.lastName);
      formData.append("activityName", this.hours.activityName);
      formData.append("serviceDate", this.hours.serviceDate);
      formData.append("serviceType", this.hours.serviceType);
      formData.append("hours", String(this.hours.hours));
      formData.append("description", this.hours.description);
      formData.append("isHistorical", String(this.hours.isHistorical));
      formData.append("proofOfService", this.proofFile);

      this.api.post('hours/update', formData, { headers }).subscribe({
        next: (res) => {
          console.log("Updated Successfully (With Image)", res);
          this.hideSubmitHoursModal();
          this.loadAdminPanel();
          this.loadDashboardData();
          this.toster.show('success', 'Hours Updated');
        },
        error: (err) => { console.error("Update Failed:", err.message); this.toster.show('error', err.message) }
      });

      return; // stop here
    }

    // ---------- CASE 2: Update WITHOUT Image ----------
    const body = {
      id: this.hours.id,
      firstName: this.hours.firstName,
      lastName: this.hours.lastName,
      activityName: this.hours.activityName,
      serviceDate: this.hours.serviceDate,
      serviceType: this.hours.serviceType,
      hours: this.hours.hours,
      description: this.hours.description,
      isHistorical: this.hours.isHistorical
    };

    this.api.post('hours/update', body, {
      headers: {
        ...headers,
        "Content-Type": "application/json"
      }
    }).subscribe({
      next: (res) => {
        console.log("Updated Successfully (Without Image)", res);
        this.hideSubmitHoursModal();
        this.loadAdminPanel();
        this.loadDashboardData();
        this.toster.show('success', 'Hours Updated');
      },
      error: (err) => { console.error("Update Failed:", err); this.toster.show('error', err.message) }
    });
  }


  showRejectionReason(reason: string) {
    this.toster.show('info', `Rejection Reason: ${reason}`);
  }

  // Modal Functions
  hideSubmitHoursModal() { this.showSubmitModal = false; this.hours = {}; this.proofFile = null; }

  onFileSelected(event: any) { this.proofFile = event.target.files[0]; console.log(this.proofFile) }

  formatDateToYYYYMMDD(date: Date | string): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  handleSubmitHours() {

    // Required field validation (manual)
    const requiredFields = [
      'firstName',
      'lastName',
      'activityName',
      'serviceDate',
      'hours',
      'serviceType',
      'description'
    ];



    for (let field of requiredFields) {
      if (!this.hours[field]) {
        this.toster.show('error', `${field} is required.`);
        return;
      }
    }

    // Proof image required only when user is NOT admin
    if (!this.isAdmin && !this.proofFile && !this.hours.proofOfService) {
      this.toster.show('error', 'Proof of Service is required.');
      return;
    }

    // --- Build FormData ---
    const formData = new FormData();
    // Object.keys(this.hours).forEach(key => {
    //   if (this.hours[key] !== null && this.hours[key] !== undefined) {
    //     formData.append(key, this.hours[key]);
    //   }
    // });

    Object.keys(this.hours).forEach(key => {
      if (this.hours[key] !== null && this.hours[key] !== undefined) {
        if (key === 'serviceDate') {
          // const formattedDate = this.formatDateToYYYYMMDD(this.hours.serviceDate);
          const formattedDate = this.toIsoMidnight(this.hours.serviceDate);
          formData.append('serviceDate', formattedDate);
        } else {
          formData.append(key, this.hours[key]);
        }
      }
    });

    if (this.proofFile) {
      formData.append('proofOfService', this.proofFile);
    }

    const authToken = localStorage.getItem("authToken");
    let token = {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    };

    this.loaderVisible = true;
    this.cdr.markForCheck();
    // Submit API
    this.api.post(`hours/submit`, formData, token)
      .subscribe({
        next: () => {
          this.hideSubmitHoursModal();
          this.loadAdminPanel();
          this.loadDashboardData();
          this.toster.show('success', 'Hours submitted');
        },
        error: (err) => {
          this.toster.show('error', err.error?.message || 'Failed to submit hours');
        },
        complete: () => {
          this.loaderVisible = false;
          this.cdr.markForCheck();
        }
      });
  }

  private toIsoMidnight(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }

  // Admin Panel
  loadAdminPanel() {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });

    this.api.get(`admin/stats`, { headers }).subscribe(stats => this.adminStats = stats);
    // this.api.post(`admin/pending-hours`, {}, { headers }).subscribe(data => {
    //   console.log('pendingHour data: ', data)
    //   this.pendingHours = data;
    // });
    this.loadPendingHours();

    console.log('__');
    console.log('this.pendingHours : ', this.pendingHours)
  }

  allPendingHours: any[] = [];
  loadPendingHours() {
    try {
      const authToken = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${authToken}`
      };

      this.api.post(`admin/pending-hours`, {}, { headers }).subscribe(res => {
        console.log('pendingHour data: ', res);
        this.allPendingHours = res.data;
        // this.pendingHours = res.data;
        this.pendingHours = [...res.data];
      });
    } catch (err) {
      console.log(err.message)
    }
  }

  approveHours(id: string) {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}`, 'Content-Type': 'application/json' });
    this.api.put(`admin/review-hours/${id}`, { status: 'approved' }, { headers }).subscribe((res) => {
      console.log(res);
      this.toster.show('info', 'Hours approved!');
      this.loadAdminPanel();
      this.calculateProgress();
      this.prepareStatCards();
      this.loadAdminPanel();
      this.loadAdminCards();
    });
  }

  rejectHours(id: string) {
    const type = 'rejectHours'
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: { type }
    });

    dialogRef.afterClosed().subscribe(reason => {
      if (reason === undefined) return; // user canceled

      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      });

      this.api.put(`admin/review-hours/${id}`,
        { status: 'rejected', rejectionReason: reason },
        { headers }
      ).subscribe((res) => {
        this.toster.show('info', 'Hours rejected!');
        this.loadAdminPanel();
        this.calculateProgress();
        this.prepareStatCards();
        this.loadAdminCards();
      });
    });
  }


  viewHourDetails(id: string, proof) {

    console.log('Proof url: ', proof)
    const type = 'viewProof'
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '450px',
      data: { type, proof }
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {

    //   }
    // });
    // this.toster.show('info', `Viewing details for: ${id}`)
  }
  openImageFullscreen(img: string) {
    this.dialog.open(DialogComponent, {
      // width: '90vw',
      // height: '90vh',
      width: '450px',
      data: { type: 'viewProof', proof: img }
    });
  }

  // Message utility
  showMessage(message: string, type: 'success' | 'error') {
    const container = document.getElementById('messageContainer');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-4 rounded-lg shadow-lg mb-4 relative`;
    div.innerHTML = `<span>${message}</span>
      <button class="absolute top-2 right-2" (click)="div.remove()">×</button>`;

    container.appendChild(div);
    setTimeout(() => div.remove(), 5000);
  }


  exportVolunteerData() {
    try {

      const type = 'exportDate'
      const badge = '';
      const isAdmin = this.isAdmin ? true : false;
      const fullName = `${this.dashboardData.profile.firstName} ${this.dashboardData.profile.lastName}`;
      const dialogRef = this.dialog.open(DialogComponent, {
        data: { badge, type, isAdmin, fullName }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('Dialog closed with data:', result);
          // example: access the returned data
          console.log('From:', result.fromDate);
          console.log('To:', result.toDate);
          console.log('Type:', result.type);
        }
      });

      if (false) {

        let obj = {
          "fromDate": "2024-01-03",
          "toDate": "2025-11-08"
        }
        const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });
        // this.api.get(`hours/export?format=json`, { headers }).subscribe(res => {
        this.api.post(`volunteers/hours/export`, obj, { headers }).subscribe(res => {
          console.log(res);

          // 1. Convert JSON to worksheet
          // const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(res);

          // // 2. Create a workbook
          // const workbook: XLSX.WorkBook = {
          //   Sheets: { 'Volunteer Hours': worksheet },
          //   SheetNames: ['Volunteer Hours']
          // };

          // // 3. Generate Excel file buffer
          // const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

          // // 4. Save as file
          // const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          // saveAs(data, `volunteer_hours_${new Date().toISOString().slice(0, 10)
          //   }.xlsx`);
          // this.toster.show('success', 'File exported')
        });
      }

    } catch (error) {
      this.toster.show('error', error.error?.message)
      console.log(error);
    }
  }

  adminUpdateHours(id) {
    try {

      const headers = new HttpHeaders({
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      });

      const data = {
        firstName: this.hours.firstName,
        lastName: this.hours.lastName,
        activityName: this.hours.activityName,
        serviceDate: this.hours.serviceDate,
        serviceType: this.hours.serviceType,
        hours: this.hours.hours,
        description: this.hours.description,
        isHistorical: this.hours.isHistorical
      }

      console.log('updated hours: >>> ', this.hours.hours);
      this.api.put(`admin/edit-hours/${id}`, data, { headers }).subscribe((res) => {
        this.toster.show('info', 'Hours updated!');
        this.loadAdminPanel();
      });
    } catch (err) {
      console.log(err.message);
    }
  }


  openDialog(badge) {

    const badgeMessage = this.dashboardData.tierMessages[badge] || null;

    const dialogData = {
      badge,
      type: 'badge',
      tierMessage: badgeMessage
    };
    const dialogRef = this.dialog.open(DialogComponent, {
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  downloadProofOfImg(imgUrl: string) {
    fetch(imgUrl, { mode: 'cors' })
      .then(response => response.blob())
      .then(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;

        link.download = `ProofOfImage.png`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(err => {
        console.error('Download error:', err);
      });
  }

  selectFilter(filter: string, label: string) {
    this.selectedFilter = filter;
    this.displayLabel = label;
    this.dropdownOpen = false;

    // Reset inputs when switching filters
    this.searchText = '';
    this.searchFromDate = '';
    this.searchToDate = '';
    // if (!filter) {
    //   this.loadPendingHours();
    // }
    this.pendingHours = [...this.allPendingHours];
  }

  // applyTextFilter() {
  //   if (!this.searchText || !this.selectedFilter) {
  //     this.loadPendingHours();
  //     return;
  //   }

  //   const searchValue = this.searchText.toLowerCase();

  //   this.pendingHours = this.pendingHours.filter(item =>
  //     item[this.selectedFilter]?.toString().toLowerCase().includes(searchValue)
  //   );
  // }

  applyTextFilter() {
    if (!this.searchText || !this.selectedFilter) {
      this.pendingHours = [...this.allPendingHours];
      return;
    }
    if (this.pendingHours.length == 0) this.pendingHours = [...this.allPendingHours];

    const searchValue = this.searchText.toLowerCase();

    this.pendingHours = this.pendingHours.filter(item => {

      if (this.selectedFilter === 'fullName') {
        const fullName =
          `${item.firstName ?? ''} ${item.lastName ?? ''}`.toLowerCase();
        return fullName.includes(searchValue);
      }

      // 🔁 Other filters (Activity, Type, etc.)
      return item[this.selectedFilter]
        ?.toString()
        .toLowerCase()
        .includes(searchValue);
    });
  }



  applyDateFilter() {
    if (!this.searchFromDate || !this.searchToDate) {
      this.toster.show('error', 'Please select both From and To dates')
      return;
    }
    const authToken = localStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${authToken}`
    };
    console.log('Apply Date Filter:', this.searchFromDate, this.searchToDate);

    let data = {
      fromDate: this.searchFromDate,
      toDate: this.searchToDate
    }
    this.api.post(`admin/pending-hours`, data, { headers }).subscribe(res => {
      console.log('pendingHour data: ', res)
      this.pendingHours = res.data;
    });

    // 🔥 call your API / filter logic here
  }

  cancelDateFilter() {
    this.selectedFilter = '';
    this.displayLabel = 'Select Filter';
    this.searchFromDate = '';
    this.searchToDate = '';
  }

  goToAllVolunteers() {
    this.router.navigate(['/volunteers']);
  }

}
