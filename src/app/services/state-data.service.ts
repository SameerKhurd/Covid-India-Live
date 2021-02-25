import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { STATE_MAPS } from './mapNames';
import { DATA_PARAMETERS } from './dataParameters'
import { MainDataService } from './main-data.service';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root'
})
export class StateDataService extends MainDataService {
  private allStatesCodeMap = new Map<string, String>();

  constructor(private http: HttpClient, storage: Storage, private networkService: NetworkService) {
    super(storage);

    console.log("[State Data Service : Constructor]")
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
    //this.loadStaticData();
  }

  /*getGQLQuery() {
    return `{
      state(countryName: "India", stateName: "` + this.getCurrMapDetail().name + `") {
        state
        cases
        deaths
        active
        recovered
        tests
        todayCases
        todayDeaths
        todayRecovered
        updated
        districts {
          district
          cases
          deaths
          active
          recovered
          todayCases
          todayDeaths
          todayRecovered
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


  // Abstract method implementations ------------------------------------------
  name() {
    return "StateDataService";
  }

  id() {
    return "State";
  }

  getDataFromServer() {
    console.log("[State Data Service : getDataFromServer]")
    this.setLoading(true);
    this.setAllData(new Map<String, any>())
    let urls = {
      district_wise: "https://api.covid19india.org/csv/latest/district_wise.csv",
      state_wise_daily: "https://api.covid19india.org/csv/latest/state_wise_daily.csv",
      state_wise: "https://api.covid19india.org/csv/latest/state_wise.csv"
    }
    this.makeApiCalls(urls, "FromServer", true);
  }

  processData() {
    let stateGQLData = this.getAllData().get(this.getCurrMapDetail().name);
    let stateDistrictData = this.addRecoveryDeathRate(stateGQLData["districts"]);

    let stateData = {
      genericData: stateGQLData["generic"],
      regionWiseData: stateDistrictData,
      timeWiseData: stateGQLData["historical"]
    }
    console.log(stateData)
    this.setProcessedData(stateData)
  }

  loadStaticData() {
    console.log("[State Data Service : loadStaticData]")
    this.setLoading(true);
    this.setAllData(new Map<String, any>())
    let staticDataDirPath = "assets/static_data/";
    let urls = {
      district_wise: staticDataDirPath + "district_wise.csv",
      state_wise_daily: staticDataDirPath + "state_wise_daily.csv",
      state_wise: staticDataDirPath + "state_wise.csv"
    }
    this.makeApiCalls(urls, "StaticData", this.networkService.getNetworkConnectivityStatus());
  }


  // Private Methods ----------------------------------------------------------
  private initialize() {
    this.setDataParameters(DATA_PARAMETERS);
    this.setMaps(STATE_MAPS);
    this.setMainParameter({
      name: "District",
      key: "district"
    });
    this.setMapConf({
      identifier: "district",
      objectIdentifier: "district",
      propertiesIdentifier: "district"
    });
    this.setCurrMap({ name: "Maharashtra", mapName: "maharashtra" });
  }

  private makeApiCalls(urls, call_info, networkConnectivityBool) {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.http.get(urls.district_wise, { headers, responseType: 'text' }
    ).subscribe(district_wise_response => {
      this.http.get(urls.state_wise_daily, { headers, responseType: 'text' }
      ).subscribe(state_wise_daily_response => {
        this.http.get(urls.state_wise, { headers, responseType: 'text' }
        ).subscribe(state_wise_response => {
          this.networkService.setNetworkConnectivity(networkConnectivityBool);
          this.getAllStatesDistrictCurrentData(this.convertCsvStringToJson(district_wise_response));
          this.getAllStatesHistoricalData(this.convertCsvStringToJson(state_wise_daily_response));
          this.getAllStatesGenericData(this.convertCsvStringToJson(state_wise_response));

          this.storeDataOnLocalStorage();
          console.log('[' + this.name() + ' : ' + call_info + ' ' + this.id() + ' Data] :', this.getAllData());

          this.processData();
          this.updateData();
        },
          state_wise_error => {
            console.log('[' + this.name() + ' : ERROR ' + call_info + ' ' + this.id() + ' Data Server : 3 state_wise_error] :', state_wise_error);
            this.networkService.setNetworkConnectivity(false);
          }, () => { });
      },
        state_wise_daily_error => {
          console.log('[' + this.name() + ' : ERROR ' + call_info + ' ' + this.id() + ' Data Server : 2 state_wise_daily_error] :', state_wise_daily_error);
          this.networkService.setNetworkConnectivity(false);
        }, () => { });
    },
      district_wise_error => {
        console.log('[' + this.name() + ' : ERROR ' + call_info + ' ' + this.id() + ' Data Server : 1 district_wise_error] :', district_wise_error);
        this.networkService.setNetworkConnectivity(false);
      }, () => { });
  }

  private getAllStatesDistrictCurrentData(district_wise_json) {
    let allStatesDataMap = this.getAllData();
    for (let d of district_wise_json) {
      if (!allStatesDataMap.has(d.State)) {
        allStatesDataMap.set(d.State, this.createState());
        this.allStatesCodeMap.set(d.State_Code, d.State);
      }
      d["district"] = d["District"]
      d["cases"] = Math.abs(Number(d["Confirmed"]))
      d["deaths"] = Math.abs(Number(d["Deceased"]))
      d["active"] = Math.abs(Number(d["Active"]))
      d["recovered"] = Math.abs(Number(d["Recovered"]))
      d["todayCases"] = Math.abs(Number(d["Delta_Confirmed"]))
      d["todayDeaths"] = Math.abs(Number(d["Delta_Deceased"]))
      d["todayRecovered"] = Math.abs(Number(d["Delta_Recovered"]))
      allStatesDataMap.get(d.State).districts.push(d);
    }
  }

  private getAllStatesHistoricalData(state_wise_daily_json) {
    let allStatesDataMap = this.getAllData();
    for (let d of state_wise_daily_json) {
      for (let stateCode of this.allStatesCodeMap) {
        let tmp = {}
        tmp["date"] = d["Date_YMD"]
        tmp[d["Status"]] = d[stateCode[0]]
        let state = allStatesDataMap.get(stateCode[1])
        if (!state.historical.has(d["Date_YMD"])) {
          state.historical.set(d["Date_YMD"], { date: d["Date_YMD"] });
        }
        state.historical.get(d["Date_YMD"])[d["Status"]] = d[stateCode[0]];
      }
    }
    for (let state of allStatesDataMap) {
      let historicalMap = state[1].historical;
      let dates = historicalMap.keys();
      //dates.sort();
      let historical = [];
      let cummulativeCases = 0, cummulativeDeaths = 0, cummulativeRecovered = 0;
      for (let date of dates) {
        //try{
        let tmp = historicalMap.get(date);
        cummulativeCases += Math.abs(Number(tmp["Confirmed"]));
        cummulativeDeaths += Math.abs(Number(tmp["Deceased"]));
        cummulativeRecovered += Math.abs(Number(tmp["Recovered"]));
        tmp["cases"] = cummulativeCases;
        tmp["deaths"] = cummulativeDeaths;
        tmp["recovered"] = cummulativeRecovered;
        tmp["todayCases"] = Math.abs(Number(tmp["Confirmed"]));
        tmp["todayDeaths"] = Math.abs(Number(tmp["Deceased"]));
        tmp["todayRecovered"] = Math.abs(Number(tmp["Recovered"]));
        historical.push(tmp);
        // }catch(e){console.log(e,date,historicalMap)}
      }
      state[1].historical = historical;
    }
  }

  private getAllStatesGenericData(state_wise_json) {
    let allStatesDataMap = this.getAllData();
    for (let d of state_wise_json) {
      let stateName = d.State.replace("\n", "")
      if (allStatesDataMap.has(stateName)) {
        let genericData = {};
        genericData["state"] = stateName;
        genericData["cases"] = Math.abs(Number(d["Confirmed"]));
        genericData["deaths"] = Math.abs(Number(d["Deaths"]));
        genericData["active"] = Math.abs(Number(d["Active"]));
        genericData["recovered"] = Math.abs(Number(d["Recovered"]));
        genericData["tests"] = Math.abs(Number("asdasd"));
        genericData["todayCases"] = Math.abs(Number(d["Delta_Confirmed"]));
        genericData["todayDeaths"] = Math.abs(Number(d["Delta_Deaths"]));
        genericData["todayRecovered"] = Math.abs(Number(d["Delta_Recovered"]));
        genericData["updated"] = d["Last_Updated_Time"];
        allStatesDataMap.get(stateName).generic = genericData;
      }
    }
  }

  private createState() {
    return {
      generic: {},
      districts: [],
      historical: new Map<string, any>()
    };
  }

  /*processData1() {
    let stateGQLData = this.getRawGQLData();
    let stateGenericData = {
      state: stateGQLData.data["state"]["state"],
      cases: stateGQLData.data["state"]["cases"],
      deaths: stateGQLData.data["state"]["deaths"],
      active: stateGQLData.data["state"]["active"],
      recovered: stateGQLData.data["state"]["recovered"],
      tests: stateGQLData.data["state"]["tests"],
      todayCases: stateGQLData.data["state"]["todayCases"],
      todayDeaths: stateGQLData.data["state"]["todayDeaths"],
      todayRecovered: stateGQLData.data["state"]["todayRecovered"],
      updated: stateGQLData.data["state"]["updated"],
    }
    let stateDistrictData = this.addRecoveryDeathRate(stateGQLData.data["state"]["districts"]);

    let stateHistoricalData = [...stateGQLData.data["state"]["historical"]];
    //stateHistoricalData.reverse();

    let stateData = {
      genericData: stateGenericData,
      regionWiseData: stateDistrictData,
      timeWiseData: stateHistoricalData
    }
    this.setProcessedData(stateData)
  }*/

}
