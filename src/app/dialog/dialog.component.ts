import { ChangeDetectionStrategy, Component, Inject, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormsModule } from '@angular/forms';
import { NgIf, DatePipe, NgFor } from '@angular/common';
import html2pdf from 'html2pdf.js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SharedService } from '../Service/shared.service';
import { ApiService } from '../Service/api.service';
import { TosterService } from '../Service/toster.service';
import { MatTabsModule } from '@angular/material/tabs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment } from '../../environments/environment';



import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { LoaderComponent } from "../loader/loader.component";

@Component({
  selector: 'app-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [MatButtonModule, MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    NgIf,
    NgFor,
    DatePipe,
    MatTabsModule,

    MatAutocompleteModule,
    MatOptionModule,
    MatSelectModule,
    MatNativeDateModule,
    LoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {

  badge: any;
  type: any;

  fromDate: Date;
  toDate: Date;
  pdfExportData: any;
  authToken = localStorage.getItem('authToken');
  showPdf: boolean = false;
  isAdmin: any;
  proofImageUrl = '';
  hourRejectReason: string = '';
  proofBaseUrl = environment.fileBaseUrl;
  selectedTab = 0; // default: Single Date
  tierContent: any;
  unlockedTier: any;
  fullName: any;
  tierMessage: any;

  volunteerName = '';
  serviceType = '';

  volunteerSuggestions: any[] = [];
  serviceTypes: any[] = [];
  today = new Date();

  loaderVisible: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sharedService: SharedService,
    private api: ApiService,
    private toster: TosterService,
    private cdr: ChangeDetectorRef,
  ) {
    this.isAdmin = this.sharedService.isAdmin$;
  }

  ngOnInit(): void {

    this.isAdmin = localStorage.getItem('user') == 'admin' ? true : false;

    this.type = this.data.type;
    if (this.data.type == 'exportDate') {
      this.badge = this.data.badge;
      this.type = this.data.type;
      this.isAdmin = this.data?.isAdmin;
      this.fullName = this.data?.fullName;
      this.getServiceTypes();
    }
    if (this.type == 'badge') {
      this.badge = this.data.badge;
      this.tierMessage = this.data.tierMessage;
    }
    if (this.data.type === 'viewProof') {
      // this.proofImageUrl = this.fileBaseUrl + this.data.proof;
      this.proofImageUrl = this.proofBaseUrl + '/uploads/proof/' + this.data.proof;
      console.log('this.proofImageUrl: >> ', this.proofImageUrl)
    }
    if (this.type == 'newTier') {
      this.tierContent = this.data.tierContent;
      this.unlockedTier = this.data.unlockedTier;
    }
  }

  closeDialog() {
    const returnData = {
      fromDate: this.fromDate,
      toDate: this.toDate,
      type: this.data.type
    };

    this.dialogRef.close(returnData);
  }

  viewBadge(badge) {

    let badgePath;

    if (badge == 'Kindness Ambassador') {
      badgePath = `assets/Image/badge/kindness_Ambassador.png`;
    } else if (badge == 'Change Catalyst') {
      badgePath = `assets/Image/badge/Change_Catalyst.png`;
    } else if (badge == 'Service Champion') {
      badgePath = `assets/Image/badge/Service_Champion.png`;
    } else if (badge == 'Legacy Leader') {
      badgePath = `assets/Image/badge/Lagacy_Leader.jfif`;
    }

    // 1️⃣ Open in a new tab for preview
    const newTab = window.open(badgePath, '_blank');

  }

  downloadBadge(badgeName: string) {
    // Encode and build path
    let badgePath = `assets/Image/badge/kindness_Ambassador.png`;
    if (badgeName == 'Kindness Ambassador') {
      badgePath = `assets/Image/badge/kindness_Ambassador.png`;
    } else if (badgeName == 'Change Catalyst') {
      badgePath = `assets/Image/badge/Change_Catalyst.png`;
    } else if (badgeName == 'Service Champion') {
      badgePath = `assets/Image/badge/Service_Champion.png`;
    } else if (badgeName == 'Legacy Leader') {
      badgePath = `assets/Image/badge/Lagacy_Leader.jfif`;
    }

    // const newTab = window.open(badgePath, '_blank');

    setTimeout(() => {
      const link = document.createElement('a');
      link.href = badgePath;
      link.download = `${badgeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1000);
  }

  redirectToDrive(badge) {
    const linkMap: any = {
      'Kindness Ambassador': 'https://drive.google.com/drive/folders/1aaD97IJLoribdnWT4l5gAaYciBgfKpdG?usp=drive_link',
      'Change Catalyst': 'https://drive.google.com/drive/folders/1ydrpNK7umQgefh76c2X2ukd00pB0RFxn?usp=drive_link',
      'Service Champion': 'https://drive.google.com/drive/folders/1MEKxekM9335RN0rYR3GEW-s3fKtG_1W_?usp=drive_link',
      'Legacy Leader': 'https://drive.google.com/drive/folders/1u8cgSmWmYOIbrRdejAInlW2Y_ZDVTAdM?usp=drive_link'
    };

    const driveLink = linkMap[badge];
    if (!driveLink) {
      this.toster.show('error',`No Drive link found for badge: ${badge}`);
      return;
    }

    window.open(driveLink, '_blank', 'noopener,noreferrer');
  }

  downloadMediaKit(badge: string) {
    const fileMap: any = {
      'Kindness Ambassador': 'Kindness_Ambassador.pdf',
      'Change Catalyst': 'Change_Catalyst.pdf',
      'Service Champion': 'Service_Champion.pdf',
      'Legacy Leader': 'Legacy_Leader.pdf'
    };

    const fileName = fileMap[badge];
    if (!fileName) return;

    const badgePath = `assets/Image/mediaKit/${fileName}`;

    const link = document.createElement('a');
    link.href = badgePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  formatDate(date: Date) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  exportData(type) {
    let obj: any = {};

    if (type === 'submitSingle') {
      const selected = this.formatDate(this.fromDate);
      obj = {
        fromDate: selected
      };
    }

    else if (type === 'submitRange') {
      obj = {
        fromDate: this.formatDate(this.fromDate),
        toDate: this.formatDate(this.toDate)
      };
    }
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });
    this.api.post(`volunteers/hours/export`, obj, { headers }).subscribe(res => {
      console.log(res);

      this.pdfExportData = res;
      this.cdr.detectChanges();

      requestAnimationFrame(() => {

        if (this.isAdmin) {

          const headers = new HttpHeaders({ Authorization: `Bearer ${this.authToken}` });
          this.api.post(`volunteers/hours/export`, obj, { headers }).subscribe(res => {
            console.log(res);

            if (res.records.length > 0) {
              const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(res.records);
              const workbook: XLSX.WorkBook = {
                Sheets: { 'Volunteer Hours': worksheet },
                SheetNames: ['Volunteer Hours']
              };
              const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
              const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
              saveAs(data, `volunteer_hours_${new Date().toISOString().slice(0, 10)
                }.xlsx`);
              this.toster.show('success', 'File exported');
            } else {
              this.toster.show('error', 'Data not found');

            }
          });
        }
        else {
          const element = document.getElementById('pdfContent');
          console.log("PDF Content:", element?.innerHTML);

          if (!element) return;

          const opt = {
            margin: 0.5,
            filename: 'NEST4US Volunteer Report.pdf',
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
          };

          (html2pdf as any)()
            .from(element)
            .set(opt)
            .save();
        }

        this.dialogRef.close();
      });
    });
  }
  /* ================== VOLUNTEER SEARCH ================== */
  searchVolunteer() {
    if (!this.volunteerName || this.volunteerName.length < 2) {
      this.volunteerSuggestions = [];
      return;
    }

    const headers = {
      headers: { Authorization: `Bearer ${this.authToken}` }
    };

    this.api
      .get(`admin/users/search?query=${encodeURIComponent(this.volunteerName)}`, headers)
      .subscribe(res => {
        this.volunteerSuggestions = res?.users || [];
      });
  }

  selectVolunteer(name: string) {
    this.volunteerName = name;
    this.volunteerSuggestions = [];
  }

  /* ================== SERVICE TYPES ================== */
  getServiceTypes() {
    const headers = {
      headers: { Authorization: `Bearer ${this.authToken}` }
    };

    this.api.get('volunteers/service-types', headers).subscribe(res => {
      this.serviceTypes = res?.data || [];
    });
  }

  /* ================== SUBMIT ================== */
  // submit(type: 'single' | 'range') {

  //   let payload: any = {};

  //   if (this.volunteerName) {
  //     payload.volunteerName = this.volunteerName;
  //   }

  //   if (this.serviceType) {
  //     payload.serviceType = this.serviceType;
  //   }

  //   if (type === 'single') {
  //     payload.fromDate = this.formatDate(this.fromDate);
  //   }

  //   if (type === 'range') {
  //     payload.fromDate = this.formatDate(this.fromDate);
  //     payload.toDate = this.formatDate(this.toDate);
  //   }

  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.authToken}`
  //   });
  //   // const headers = {
  //   //   headers: { Authorization: `Bearer ${this.authToken}` }
  //   // };

  //   this.api.post('admin/volunteer-report', payload, { headers })
  //     .subscribe(res => {

  //       if (!res?.data || res.data.length === 0) {
  //         this.toster.show('error', 'Data not found');
  //         return;
  //       }

  //       // ===== EXPORT EXCEL =====
  //       const worksheet = XLSX.utils.json_to_sheet(res.data);
  //       const workbook = {
  //         Sheets: { 'Volunteer Report': worksheet },
  //         SheetNames: ['Volunteer Report']
  //       };

  //       const excelBuffer = XLSX.write(workbook, {
  //         bookType: 'xlsx',
  //         type: 'array'
  //       });

  //       const data = new Blob([excelBuffer], {
  //         type: 'application/octet-stream'
  //       });

  //       saveAs(
  //         data,
  //         `NEST4US Volunteer Report ${new Date().toISOString().slice(0, 10)}.xlsx`
  //       );

  //       this.toster.show('success', 'Report exported');
  //       this.dialogRef.close();
  //     });
  // }

  submit(type: 'single' | 'range') {

    this.loaderVisible = true;
    this.cdr.markForCheck();

    let payload: any = {};

    // ===== Filters =====
    // if (this.volunteerName) {
    //   // if using object-based autocomplete
    //   payload.volunteerName =
    //     typeof this.volunteerName === 'string'
    //       ? this.volunteerName
    //       : `${this.volunteerName.profile.firstName} ${this.volunteerName.profile.lastName}`;
    // }

    if (this.volunteerName) {
      payload.volunteerName = this.volunteerName;
    }

    if (this.serviceType) {
      payload.serviceType = this.serviceType;
    }

    // ===== Dates =====
    if (type === 'single' && this.fromDate) {
      payload.fromDate = this.formatDate(this.fromDate);
    }

    if (type === 'range' && this.fromDate && this.toDate) {
      payload.fromDate = this.formatDate(this.fromDate);
      payload.toDate = this.formatDate(this.toDate);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authToken}`
    });

    let endPoint = this.isAdmin ? 'admin/volunteer-report' : 'volunteers/hours/export'

    this.api.post(endPoint, payload, { headers })
      .subscribe(res => {
        if (this.isAdmin ? !res?.data : !res.records || this.isAdmin ? res.data.length === 0 : res.records.length === 0) {
          this.toster.show('error', 'Data not found');
          this.dialogRef.close();
          this.loaderVisible = false;
          this.cdr.markForCheck();
          return;
        }

        /* =====================================================
           ADMIN → EXCEL DOWNLOAD
        ====================================================== */
        if (this.isAdmin) {

          const worksheet: XLSX.WorkSheet =
            XLSX.utils.json_to_sheet(res.data);

          const workbook: XLSX.WorkBook = {
            Sheets: { 'NEST4US Volunteer Report': worksheet },
            SheetNames: ['NEST4US Volunteer Report']
          };

          const excelBuffer: any =
            XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

          const file = new Blob([excelBuffer], {
            type: 'application/octet-stream'
          });

          saveAs(
            file,
            `NEST4US Volunteer Report ${new Date().toISOString().slice(0, 10)}.xlsx`
          );

          this.toster.show('success', 'Excel exported');
          this.dialogRef.close();
          this.loaderVisible = false;
          this.cdr.markForCheck();
          return;
        }

        /* =====================================================
           NON-ADMIN → PDF DOWNLOAD (same as exportData)
        ====================================================== */
        this.pdfExportData = res;
        this.cdr.detectChanges();

        requestAnimationFrame(() => {
          const element = document.getElementById('pdfContent');

          if (!element) {
            this.toster.show('error', 'PDF content not found');
            this.dialogRef.close();
            this.loaderVisible = false;
            this.cdr.markForCheck();
            return;
          }

          const opt = {
            margin: 0.5,
            filename: 'NEST4US Volunteer Report.pdf',
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
          };

          (html2pdf as any)()
            .from(element)
            .set(opt)
            .save()
            .then(() => {
              this.toster.show('success', 'PDF downloaded');
              this.dialogRef.close();
              this.loaderVisible = false;
              this.cdr.markForCheck();
            });
        });

      });
  }



  submitHourReason() {
    this.dialogRef.close(this.hourRejectReason);
  }
}
