import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subject } from 'rxjs';
import { Storage } from '@ionic/storage';

import { NetworkService } from './network.service';
import { exception } from 'console';

@Injectable({
  providedIn: 'root'
})
export abstract class MainDataService {
  abstract name(): string;
  abstract id(): string;
  abstract processData(): void;
  abstract getGQLQuery(): string;

  private homeMap: any;
  private currMap: any;
  private prevMap: any;

  private maps: any;

  private rawGQLData: any;
  private processedData: any;
  private dataObservable = new Subject<any>();

  private mapConf: any;
  private mainParameter: any;
  private dataParameters: any;


  constructor(private apollo: Apollo, private storage: Storage, private networkService: NetworkService) {
    console.log('[' + this.name() + ' : Super Constructor]')

  }

  getData() {
    //this.getDataFromLocalStorage();
    this.getDataFromServer();
  }

  onRefresh() {
    this.getDataFromServer();
  }

  // Private Methods

  private getDataFromServer() {
    console.log("called",this.currMap)
    this.apollo.query({
      query: gql(this.getGQLQuery())
    }).subscribe(
      result => {
        if (this.id() == "State") this.networkService.setNetworkConnectivity(true);
        this.rawGQLData = result;
        console.log('[' + this.name() + ' : Fetched ' + this.id() + ' Data Server] :', this.currMap, this.rawGQLData);
        this.processData();
        this.updateData();

        this.storeDataOnLocalStorage();
      },
      error => {
        console.log('[' + this.name() + ' : ERROR Fetched ' + this.id() + ' Data Server] :', this.currMap, error);
        //this.setCurrMap(this.prevMap);
        if (this.id() == "State") this.networkService.setNetworkConnectivity(false);
        // handle error condition from returned Observable
      }, () => {
        // handle subscription complete (no more data coming)
        //console.log('[' + this.name() + ' : COMPLETE Fetched ' + this.id() + ' Data Server] :', this.currMap);

      }
    )
  }

  private updateData() {
    this.setPrevMap();
    this.dataObservable.next(this.processedData);
  }

  private storeDataOnLocalStorage() {
    this.storage.set(this.id() + '-map-json', this.currMap);
    this.storage.set(this.id() + '-json', this.rawGQLData);
  }

  getDataFromLocalStorage() {
    this.storage.get(this.id() + '-map-json').then((resultMap) => {
      if (!resultMap) {
        this.getDataFromServer();
        return;
      }
      this.setCurrMap(resultMap);
      this.homeMap = this.getCurrMapDetail();
      this.storage.get(this.id() + '-json').then((result) => {
        if (!result) {
          this.getDataFromServer();
          return;
        }

        console.log('[' + this.name() + ' : Stored ' + this.id() + ' Data] :', this.currMap, result);
        this.rawGQLData = result;
        this.processData();
        this.updateData();
        this.getDataFromServer();
      }).catch((ex) => {
        console.log('[' + this.name() + ' : ERROR Stored ' + this.id() + ' Data] :', ex)
        this.getDataFromServer();
      });
    })
  }

  // Public Methods

  addRecoveryDeathRate(regionData) {
    for (let region of regionData) {
      region["recoveryRate"] = (region["recovered"] / (region["cases"] || 1) * 100).toFixed(2);
      region["deathRate"] = (region["deaths"] / (region["cases"] || 1) * 100).toFixed(2);
    }
    return regionData;
  }


  // GETTER Methods

  getDataListener() {
    return this.dataObservable.asObservable();
  }

  getDataParameters() {
    return this.dataParameters;
  }

  getMainParameter() {
    return this.mainParameter;
  }

  getMapConf() {
    return this.mapConf;
  }

  getCurrMapDetail() {
    return this.currMap;
  }

  getMaps() {
    return this.maps;
  }

  getRawGQLData() {
    return this.rawGQLData;
  }

  getProcessedData() {
    return this.processedData;
  }
  // SETTER Methods

  setDataParameters(dataParameters) {
    this.dataParameters = dataParameters;
  }

  setMaps(maps) {
    this.maps = maps;
  }

  setCurrMap(map) {
    this.currMap = this.maps.find(m => m.name === map.name);
  }

  setPrevMap() {
    this.prevMap = this.currMap;
  }

  setMainParameter(mainParameter) {
    this.mainParameter = mainParameter;
  }

  setMapConf(mapConf) {
    this.mapConf = mapConf;
  }

  setProcessedData(processedData) {
    this.processedData = processedData;
  }
}
