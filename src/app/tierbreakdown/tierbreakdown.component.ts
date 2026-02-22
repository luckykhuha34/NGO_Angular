import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { SharedService } from '../Service/shared.service';
import { ApiService } from '../Service/api.service';
import { TosterService } from '../Service/toster.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-tierbreakdown',
  standalone: true,
  imports: [NgIf, NgFor, DatePipe],
  templateUrl: './tierbreakdown.component.html',
  styleUrl: './tierbreakdown.component.scss'
})
export class TierbreakdownComponent {
  ambassadorList = [
    "Random Name #1", "Random Name #2", "Random Name #3", "Random Name #4", "John Doe",
    "Random Name #6", "Random Name #7", "Random Name #8", "Random Name #9", "Random Name #10",
    "Random Name #11", "Random Name #12", "Random Name #13", "Random Name #14", "Random Name #15",
    "Random Name #16", "Random Name #17", "Random Name #18", "Random Name #19", "Random Name #20",
    "Random Name #21", "Random Name #22", "Random Name #23", "Random Name #24", "Random Name #25"
  ];

  tiers: any;
  volunteersData: any;
  activeTier: any;
  selectTier: boolean = false;
  volunteerDetails: any;
  volunteerCard: boolean = false;
  imgUrl = environment.fileBaseUrl;

  pageSize = 10;
  currentPage = 1;
  totalPages = 0;

  paginatedVolunteers: any[] = [];

  constructor(
    private sharedService: SharedService,
    private api: ApiService,
    private toster: TosterService
  ) { }


  ngOnInit() {
    this.loadTier();
  }

  loadTier() {
    try {

      

      // after API data is assigned to volunteersData
      // this.updatePagination();

      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      this.api.get('admin/tiers', token).subscribe(res => {
        console.log(res);
        this.tiers = res.data;
      });
    } catch (err) {
      // this.loader = false;
      this.toster.show("error", err.message);
      console.log(err);
    }
  }

  loadvolunteerData(badge) {
    try {
      this.volunteerCard = false;
      this.activeTier = badge;
      console.log("badge : ", badge);
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      const data = {
        tierName: badge
      }
      this.api.post('admin/tiers', data, token).subscribe(res => {
        console.log(res);
        this.selectTier = true;
        this.volunteersData = res.data;
        this.currentPage = 1;
        this.updatePagination();
      });
    } catch (err) {
      // this.loader = false;
      this.toster.show("error", err.message);
      console.log(err);
    }
  }

  getVolunteerDetails(id) {
    try {
      console.log(id)
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
      const data = {
        userId: id
      }
      this.api.post('admin/user-details', data, token).subscribe(res => {
        console.log(res);
        this.volunteerDetails = res;
        this.volunteerCard = true;
      });
    } catch (err) {
      // this.loader = false;
      this.toster.show("error", err.message);
      console.log(err);
    }
  }


  updatePagination() {
    this.totalPages = Math.ceil(this.volunteersData.length / this.pageSize);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.paginatedVolunteers = this.volunteersData.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
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

}
