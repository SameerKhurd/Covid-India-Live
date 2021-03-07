import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export abstract class MainDataService {
  private homeMap: any;
  private currMap: any;
  private prevMap: any;

  private maps: any; 

  //private rawGQLData: any;
  private processedData: any;
  private dataObservable = new Subject<any>();
  private loadingObservable = new Subject<boolean>();

  private mapConf: any;
  private mainParameter: any;
  private dataParameters: any;

  private allData: any;

  constructor(private storage: Storage) {
    //console.log('[' + this.name() + ' : Super Constructor]');
  }

  // Abstract Method Declarations ---------------------------------------------  
  abstract name(): string;
  abstract id(): string;
  abstract getDataFromServer(): void;
  abstract processData(): void;
  abstract loadStaticData(): void;

  // Public Methods -----------------------------------------------------------  
  public getData() {
    //this.getDataFromLocalStorage();
    //this.getDataFromServer();
    this.processData();
    this.updateData();
  }

  public onRefresh() {
    this.getDataFromServer();
  }

  // Protected Methods --------------------------------------------------------  
  protected convertCsvStringToJson(csvStringResponse) {
    csvStringResponse = JSON.parse(JSON.stringify(csvStringResponse)).split("\r");
    let tableHeaders = csvStringResponse[0].split(",");
    let data = []
    for (let row of csvStringResponse.slice(1,)) {
      row = row.split(",");
      let tmp = {}, i = 0;
      for (let tableHeader of tableHeaders) {
        tmp[tableHeader] = row[i++];
      }
      data.push(tmp);
    }
    return data;
  }
  
  protected updateData() {
    this.setPrevMap();
    this.dataObservable.next(this.processedData);
    this.storeMapDetailsOnLocalStorage();
  }

  protected storeMapDetailsOnLocalStorage() {
    this.storage.set(this.id() + '-map-json', this.currMap);
  }

  protected storeDataOnLocalStorage() {
    //this.storage.set(this.id() + '-map-json', this.currMap);
    this.storage.set(this.id() + '-json', this.allData);
  }

  protected getDataFromLocalStorage() {
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

        //console.log('[' + this.name() + ' : Stored ' + this.id() + ' Data] :', this.currMap, result);
        this.allData = result;
        this.processData();
        this.updateData();
        this.getDataFromServer();
      }).catch((ex) => {
        //console.log('[' + this.name() + ' : ERROR Stored ' + this.id() + ' Data] :', ex)
        this.getDataFromServer();
      });
    })
  }

  protected addRecoveryDeathRate(regionData) {
    for (let region of regionData) {
      region["recoveryRate"] = (region["recovered"] / (region["cases"] || 1) * 100).toFixed(2);
      region["deathRate"] = (region["deaths"] / (region["cases"] || 1) * 100).toFixed(2);
    }
    return regionData;
  }

  // Listner Methods ----------------------------------------------------------
  getLoadingListener() {
    return this.loadingObservable.asObservable();
  }

  getDataListener() {
    return this.dataObservable.asObservable();
  }

  // GETTER Methods -----------------------------------------------------------
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

  getProcessedData() {
    return this.processedData;
  }

  getAllData() {
    return this.allData;
  }

  // SETTER Methods -----------------------------------------------------------
  setLoading(bool){
    this.loadingObservable.next(bool);
  }
  
  setAllData(allData) {
    this.allData = allData;
  }

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
