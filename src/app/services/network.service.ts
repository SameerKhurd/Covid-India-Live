import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private networkConnectivity: boolean;
  private networkConnectivityObservable = new Subject<any>();
  private refreshObservable = new Subject<any>();
  private loadStaticDataObservable = new Subject<boolean>();

  constructor() {
    this.networkConnectivity = true;
  }

  getNetworkConnectivityListener() {
    return this.networkConnectivityObservable.asObservable();
  }

  setNetworkConnectivity(networkConnectivity) {
    console.log("[Network Service : Status Prev, After]", this.networkConnectivity, networkConnectivity)
    //if ((this.networkConnectivity && networkConnectivity )||(!this.networkConnectivity && !networkConnectivity )) return;
    this.networkConnectivity = networkConnectivity;
    this.networkConnectivityObservable.next(this.networkConnectivity);
  }

  loadStaticDataListener() {
    return this.loadStaticDataObservable.asObservable();
  }

  loadStaticData(bool) {
    this.loadStaticDataObservable.next(true);
  }

  getNetworkConnectivityStatus() {
    return this.networkConnectivity;
  }

  doRefresh() {
    this.refreshObservable.next(this.networkConnectivity);
  }

  refreshListener() {
    return this.refreshObservable.asObservable();
  }
}
