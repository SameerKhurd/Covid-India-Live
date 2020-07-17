import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Storage } from '@ionic/storage';

import { COUNTRY_MAPS } from './mapNames';
import { DATA_PARAMETERS } from './dataParameters'
import { MainDataService } from './main-data.service';
import { NetworkService } from './network.service';


@Injectable({
  providedIn: 'root'
})
export class CountryDataService extends MainDataService {

  constructor(apollo: Apollo, storage: Storage, networkService: NetworkService) {
    super(apollo, storage, networkService);

    console.log("[Country Data Service : Constructor]")
    this.initialize();
    /*this.countryName = "India";
    this.homeState =
      //this.homeState = { name: "Assam", mapName: "assam" }
      this.currState = this.stateMaps.find(state => {
        return state.name === this.homeState.name;
      });
    //this.getStoredStateData();
    this.getStateDataFromServer();*/
    this.getDataFromLocalStorage();
  }

  name() {
    return "CountryDataService";
  }

  id() {
    return "Country";
  }

  initialize() {
    this.setDataParameters(DATA_PARAMETERS);
    this.setMaps(COUNTRY_MAPS);
    this.setMainParameter({
      name: "State",
      key: "state"
    });
    this.setMapConf({
      identifier: "state",
      objectIdentifier: "states",
      propertiesIdentifier: "st_nm"
    });
    this.setCurrMap({ name: "India", mapName: "india" });
  }

  getGQLQuery() {
    return `{
      country(name: "`+ this.getCurrMapDetail().name + `") {
        testsPerOneMillion
        states {
          state
          cases
          active
          deaths
          recovered
          tests
          todayCases
          todayDeaths
          todayRecovered
          updated
        }
        historical(count: 30, reverse: true) {
          date
          cases
          deaths
          recovered
          todayCases
          todayRecovered
          todayDeaths
        }
      }
    }`
  }

  processData() {
    let countryGQLData = this.getRawGQLData();
    let countryGenericData = countryGQLData.data["country"]["states"].find(state => state.state === "Total");
    countryGenericData["tests"] = countryGQLData.data["country"]["testsPerOneMillion"];
    let countryStateData = this.addRecoveryDeathRate(countryGQLData.data["country"]["states"].filter(state => state.state !== "Total"));

    let countryHistoricalData = [...countryGQLData.data["country"]["historical"]];
    countryHistoricalData.reverse();

    let countryData = {
      genericData: countryGenericData,
      regionWiseData: countryStateData,
      timeWiseData: countryHistoricalData
    }
    this.setProcessedData(countryData)
  }

  /*private countryName: string;
  private currCountry: any;

  private homeState: any;

  private countryGQLData: any;
  private countryDataObservable = new Subject<any>();

  private countryData: any;

  private mapConf = {
    identifier: "state",
    objectIdentifier: "states",
    propertiesIdentifier: "st_nm"
  }

  private mainParamter = {
    name: "State",
    key: "state"
  }

  private dataParameters: any;


  constructor(private apollo: Apollo, private storage: Storage) {
    console.log("[Country Data Service : Constructor]")
    this.dataParameters = DATA_PARAMETERS;
    this.countryName = "India";
    this.homeState = { name: "Maharashtra", mapName: "maharashtra" }
    this.currCountry = COUNTRY_MAPS.find(country => {
      return country.name === this.countryName;
    });
    this.getStoredCountryData();
    //this.getCountryDataFromServer();
  }

  name(){
    return "CountryDataService";
  }

  setCurrCountry(country) {
    this.currCountry = country;
    this.getCountryDataFromServer();
  }

  getMainParameter() {
    return this.mainParamter;
  }

  getMapConf() {
    return this.mapConf;
  }

  getCurrMapDetail() {
    return this.currCountry;
  }

  getCountryDataFromServer() {
    let qdlquery = ` {
          country(name: "`+ this.currCountry.name + `") {
            states {
              state
              cases
              active
              deaths
              recovered
              tests
              todayCases
              todayDeaths
              todayRecovered
              updated
            }
            historical(count: 30, reverse: true) {
              date
              cases
              deaths
              recovered
              todayCases
              todayRecovered
              todayDeaths
            }
          }
        }`;

    this.apollo.query({
      query: gql(qdlquery)
    }).subscribe(result => {
      this.countryGQLData = result;
      console.log('[DataService : Fetched Country Data Server] :', this.countryGQLData);
      this.updateCountryData();
      this.storeCountryData();
    })
  }

  updateCountryData() {
    let countryGenericData = this.countryGQLData.data["country"]["states"].find(state => state.state === "Total");
    let countryStateData = this.addRecoveryDeathRate(this.countryGQLData.data["country"]["states"].filter(state => state.state !== "Total"));

    let countryHistoricalData = [... this.countryGQLData.data["country"]["historical"]];
    countryHistoricalData.reverse();

    let countryData = {
      genericData: countryGenericData,
      regionWiseData: countryStateData,
      timeWiseData: countryHistoricalData
    }
    this.countryDataObservable.next(countryData);
  }
  
  addRecoveryDeathRate(regionData) {
    for (let region of regionData) {
      region["recoveryRate"] = (region["recovered"] / (region["cases"] || 1) * 100).toFixed(2);
      region["deathRate"] = (region["deaths"] / (region["cases"] || 1) * 100).toFixed(2);
    }
    return regionData;
  }

  getDataListener() {
    return this.countryDataObservable.asObservable();
  }

  getDataParameters() {
    return this.dataParameters;
  }

  storeCountryData() {
    // set a key/value
    this.storage.set('country-json', this.countryGQLData);
  }

  getStoredCountryData() {
    this.storage.get('country-json').then((result) => {
      console.log('[DataService : Stored Country Data] :', result);
      this.countryGQLData = result;
      this.updateCountryData();
    });
  }*/
}
