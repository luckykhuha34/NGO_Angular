import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { ApiService } from '../Service/api.service';
import { TosterService } from '../Service/toster.service';
import { environment } from '../../environments/environment';
import { LoaderComponent } from '../loader/loader.component';
import { FormsModule } from '@angular/forms';

interface Volunteer {
  _id: string;
  email: string;
  totalHours: number;
  thisYearHours: number;
  tier: string;
  badges: string[];
  createdAt: string;
  profile: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
    schoolOrganization?: string;
    dateOfBirth?: string;
    phoneNumber?: string;
    causesOfInterest?: string[];
    location?: {
      state?: string;
      country?: string;
    };
  };
}

@Component({
  selector: 'app-volunteers',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe, LoaderComponent, FormsModule],
  templateUrl: './volunteers.component.html',
  styleUrl: './volunteers.component.scss'
})
export class VolunteersComponent implements OnInit {
  volunteersData: Volunteer[] = [];
  paginatedVolunteers: Volunteer[] = [];
  volunteerDetails: any;
  volunteerCard: boolean = false;
  imgUrl = environment.fileBaseUrl;

  pageSize = 10;
  currentPage = 1;
  totalPages = 0;
  loaderVisible = false;

  searchText: string = '';

  constructor(
    private readonly sharedService: SharedService,
    private readonly api: ApiService,
    private readonly toster: TosterService
  ) { }

  ngOnInit() {
    this.loadAllVolunteers();
  }

  loadAllVolunteers() {
    this.loaderVisible = true;
    const authToken = localStorage.getItem("authToken");
    const token = {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    };
    
    this.api.get('admin/volunteers', token).subscribe(
      (res: any) => {
        this.volunteersData = res || [];
        this.currentPage = 1;
        this.updatePagination();
        this.loaderVisible = false;
      },
      (error) => {
        this.loaderVisible = false;
        this.toster.show("error", error.message || "Failed to load volunteers");
      }
    );
  }

  getVolunteerDetails(volunteer: Volunteer) {
    const authToken = localStorage.getItem("authToken");
    const token = {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    };
    
    this.api.post('admin/user-details', { userId: volunteer._id }, token).subscribe(
      (res: any) => {
        this.volunteerDetails = res;
        this.volunteerCard = true;
      },
      (error) => {
        this.toster.show("error", error.message || "Failed to load volunteer details");
      }
    );
  }

  getFilteredVolunteers(): Volunteer[] {
    let filtered = this.volunteersData;

    if (this.searchText.trim()) {
      const search = this.searchText.toLowerCase();
      filtered = filtered.filter(v =>
        v.profile.firstName.toLowerCase().includes(search) ||
        v.profile.lastName.toLowerCase().includes(search) ||
        v.email.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  updatePagination() {
    const filtered = this.getFilteredVolunteers();
    this.totalPages = Math.ceil(filtered.length / this.pageSize);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.paginatedVolunteers = filtered.slice(startIndex, endIndex);
  }

  nextPage() {
    const filtered = this.getFilteredVolunteers();
    if (this.currentPage < Math.ceil(filtered.length / this.pageSize)) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  onSearchChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  closeDetails() {
    this.volunteerCard = false;
  }
}
