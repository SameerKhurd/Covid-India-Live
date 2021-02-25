import { Component, OnInit } from '@angular/core';
import { CountryDataService } from '../../services/country-data.service';
import { NetworkService } from '../../services/network.service';

@Component({
  selector: 'app-country',
  templateUrl: './country.component.html',
  styleUrls: ['./country.component.scss'],
})
export class CountryComponent implements OnInit {
  public currCountry: any;
  public genericParameters: any;
  public genericData: any;

  public showProgressBar: boolean;
  public progressBarType: string;
  public loading: boolean = true;
  private onGoingFetch: boolean = false;

  constructor(public countryDataService: CountryDataService, private networkService: NetworkService) {
  }

  ngOnInit() {
    console.log("[Country Main : Init]")
    this.showProgressBar = true;
    this.progressBarType = "indeterminate"
    this.currCountry = this.countryDataService.getCurrMapDetail()
    this.genericParameters = this.countryDataService.getDataParameters().filter(d => !d.percent);

    this.countryDataService.getDataListener().subscribe(data => {
      this.onGoingFetch = false;
      this.genericData = data.genericData;
      this.progressBarUpdate();
    })

    this.countryDataService.getLoadingListener().subscribe(bool => {
      this.onGoingFetch = true;
      this.showProgressBar = true;
      this.loading = true;
      this.progressBarType = "indeterminate"
    })

    this.networkService.getNetworkConnectivityListener().subscribe(networkConnectivity => {
      this.onGoingFetch = false;
      this.loading = false;
      this.progressBarUpdate();
      //this.showToast();
    });

    this.networkService.refreshListener().subscribe(networkConnectivity => {
      this.countryDataService.onRefresh();
      //this.showToast();
    });

    this.networkService.loadStaticDataListener().subscribe(bool => {
      this.countryDataService.loadStaticData();
    });

  }

  progressBarUpdate() {
    this.progressBarType = "determinate"
    setTimeout(() => {
      if (!this.onGoingFetch) {
        this.showProgressBar = false;
      }
    }, 2000);
  }

  doRefresh(event) {
    this.networkService.doRefresh();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  showStaticData() {
    this.networkService.loadStaticData(true);
  }
}
