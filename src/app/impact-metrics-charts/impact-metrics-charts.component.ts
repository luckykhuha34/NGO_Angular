import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ApiService } from '../Service/api.service';

Chart.register(...registerables);

@Component({
  selector: 'app-impact-metrics-charts',
  standalone: true,
  imports: [],
  templateUrl: './impact-metrics-charts.component.html',
  styleUrl: './impact-metrics-charts.component.scss'
})
export class ImpactMetricsChartsComponent {

  pieChart: any;
  barChart: any;

  dashboardData: any = null;

  constructor(
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.getDashboardData();
  }

  loadPieChart() {
  if (this.pieChart) this.pieChart.destroy();

  this.pieChart = new Chart("pieChartCanvas", {
    type: 'pie',
    data: {
      labels: this.dashboardData.serviceCategories.labels,
      datasets: [{
        data: this.dashboardData.serviceCategories.data,
        backgroundColor: [
          '#1E88E5', '#FB8C00', '#43A047', '#E53935', '#8E24AA',
          '#00ACC1', '#FDD835', '#D81B60', '#7CB342'
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,

      interaction: {
        mode: 'index',
        intersect: true
      },

      plugins: {
        legend: {
          position: 'left',
          labels: {
            font: {
              family: 'Poppins',
              size: 13,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          enabled: true,
          titleFont: {
            family: 'Poppins',
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            family: 'Poppins',
            size: 13,
            weight: 'bold'
          }
        }
      }
    }
  });
}


  loadBarChart() {
  if (this.barChart) this.barChart.destroy();

  this.barChart = new Chart("barChartCanvas", {
    type: 'bar',
    data: {
      labels: this.dashboardData.ageDistribution.labels,
      datasets: [{
        label: "Volunteers",
        data: this.dashboardData.ageDistribution.data,
        backgroundColor: '#8d6597',
        barPercentage: 0.7,
        categoryPercentage: 0.7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,

      interaction: {
        mode: 'index',
        intersect: true
      },

      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: {
              family: 'Poppins',
              size: 12,
              weight: 'bold'
            }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: {
              family: 'Poppins',
              size: 12,
              weight: 'bold'
            }
          }
        }
      },

      plugins: {
        legend: {
          display: true,
          labels: {
            font: {
              family: 'Poppins',
              size: 13,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          enabled: true,
          titleFont: {
            family: 'Poppins',
            size: 14,
            weight: 'bold'
          },
          bodyFont: {
            family: 'Poppins',
            size: 13
          }
        }
      }
    }
  });
}





  getDashboardData() {
    try {
      const authToken = localStorage.getItem("authToken");
      let token = {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }

      this.api.get('admin/analytics/dashboard', token).subscribe(res => {
        console.log('dashboard data: >>> ', res);
        this.dashboardData = res;
        this.loadPieChart();
        this.loadBarChart();
      })
    } catch (err) {
      console.log(err.message);
    }
  }


}
