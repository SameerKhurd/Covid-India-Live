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

  constructor(public countryDataService: CountryDataService, private networkService: NetworkService) {
  }

  ngOnInit() {
    console.log("[Country Main : Init]")
    this.showProgressBar = true;
    this.progressBarType = "indeterminate"
    this.currCountry = this.countryDataService.getCurrMapDetail()
    this.genericParameters = this.countryDataService.getDataParameters().filter(d => !d.percent);

    this.countryDataService.getDataListener().subscribe(data => {
      this.genericData = data.genericData;
      this.progressBarUpdate();
    })

    this.networkService.getNetworkConnectivityListener().subscribe(networkConnectivity => {
      this.loading  = false;
      this.progressBarUpdate();
      //this.showToast();
    });

    this.networkService.refreshListener().subscribe(networkConnectivity => {
      this.showProgressBar = true;
      this.loading  = true;
      this.countryDataService.getData();
      //this.showToast();
    });
  }

  progressBarUpdate() {
    this.progressBarType = "determinate"
    setTimeout(() => {
      this.showProgressBar = false;
      this.progressBarType = "indeterminate"
    }, 2000);
  }


  doRefresh(event) {
    this.networkService.doRefresh();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }
}
