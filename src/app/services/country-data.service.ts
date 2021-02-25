import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { COUNTRY_MAPS } from './mapNames';
import { DATA_PARAMETERS } from './dataParameters'
import { MainDataService } from './main-data.service';
import { NetworkService } from './network.service';


@Injectable({
  providedIn: 'root'
})
export class CountryDataService extends MainDataService {

  constructor(private http: HttpClient, storage: Storage, private networkService: NetworkService) {
    super(storage);

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
    //this.getDataFromServer()
    //this.loadStaticData();
  }

  // Abstract method implementations ------------------------------------------
  name() {
    return "CountryDataService";
  }

  id() {
    return "Country";
  }

  getDataFromServer() {
    console.log("[Country Data Service : getDataFromServer]")
    this.setLoading(true);
    this.setAllData({
      genericData: {},
      regionWiseData: [],
      timeWiseData: []
    });
    let urls = {
      case_time_series: "https://api.covid19india.org/csv/latest/case_time_series.csv",
      state_wise: "https://api.covid19india.org/csv/latest/state_wise.csv"
    }
    this.makeApiCalls(urls, "FromServer");
  }

  processData() {
    console.log(this.getAllData())
    this.setProcessedData(this.getAllData())
  }

  loadStaticData() {
    console.log("[Country Data Service : loadStaticData]")
    this.setLoading(true);
    this.setAllData({
      genericData: {},
      regionWiseData: [],
      timeWiseData: []
    });
    let staticDataDirPath = "assets/static_data/";
    let urls = {
      case_time_series: staticDataDirPath + "case_time_series.csv",
      state_wise: staticDataDirPath + "state_wise.csv"
    }
    this.makeApiCalls(urls, "StaticData");
  }


  // Private Methods ----------------------------------------------------------
  private initialize() {
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

  private makeApiCalls(urls, call_info) {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.http.get(urls.case_time_series, { headers, responseType: 'text' }
    ).subscribe(case_time_series_response => {
      this.http.get(urls.state_wise, { headers, responseType: 'text' }
      ).subscribe(state_wise_response => {
        //this.networkService.setNetworkConnectivity(true);
        this.getTimeWiseData(this.convertCsvStringToJson(case_time_series_response));
        this.getRegionWiseData(this.convertCsvStringToJson(state_wise_response));

        this.storeDataOnLocalStorage();
        console.log('[' + this.name() + ' : ' + call_info + ' ' + this.id() + ' Data] :', this.getAllData());

        this.processData();
        this.updateData();
      },
        state_wise_error => {
          console.log('[' + this.name() + ' : ERROR ' + call_info + ' ' + this.id() + ' Data Server : 2 state_wise_error] :', state_wise_error);
          //this.networkService.setNetworkConnectivity(false);
        }, () => { });
    },
      case_time_series_error => {
        console.log('[' + this.name() + ' : ERROR ' + call_info + ' ' + this.id() + ' Data Server : 1 case_time_series_error] :', case_time_series_error);
        //this.networkService.setNetworkConnectivity(false);
      }, () => { });
  }

  private getCountryGenericData(data) {
    this.getAllData().genericData = this.getGenericJson(data);
  }

  private getTimeWiseData(case_time_series_json) {
    for (let d of case_time_series_json) {
      d["date"] = d["Date_YMD"];
      d["cases"] = Math.abs(Number(d["Total Confirmed"]));;
      d["deaths"] = Math.abs(Number(d["Total Deceased"]));;
      d["recovered"] = Math.abs(Number(d["Total Recovered"]));;
      d["todayCases"] = Math.abs(Number(d["Daily Confirmed"]));
      d["todayDeaths"] = Math.abs(Number(d["Daily Deceased"]));
      d["todayRecovered"] = Math.abs(Number(d["Daily Recovered"]));
    }
    this.getAllData().timeWiseData = case_time_series_json;
  }

  private getRegionWiseData(state_wise_json) {
    let countryMainData = this.getAllData();
    for (let d of state_wise_json) {
      d.State = d.State.replace("\n", "")
      if (d.State == "Total") {
        d.State = "India";
        this.getCountryGenericData(d);
      }
      else {
        countryMainData.regionWiseData.push(this.getGenericJson(d));
      }
    }
  }

  private getGenericJson(region) {
    let genericData = {};
    genericData["state"] = region["State"];
    genericData["cases"] = Math.abs(Number(region["Confirmed"]));
    genericData["deaths"] = Math.abs(Number(region["Deaths"]));
    genericData["active"] = Math.abs(Number(region["Active"]));
    genericData["recovered"] = Math.abs(Number(region["Recovered"]));
    genericData["tests"] = Math.abs(Number("asdasd"));
    genericData["todayCases"] = Math.abs(Number(region["Delta_Confirmed"]));
    genericData["todayDeaths"] = Math.abs(Number(region["Delta_Deaths"]));
    genericData["todayRecovered"] = Math.abs(Number(region["Delta_Recovered"]));
    genericData["updated"] = region["Last_Updated_Time"];
    return genericData;
  }
  /*getGQLQuery() {
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
  }*/

  /*processData() {
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
  }*/

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
