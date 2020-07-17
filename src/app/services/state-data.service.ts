import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Storage } from '@ionic/storage';

import { STATE_MAPS } from './mapNames';
import { DATA_PARAMETERS } from './dataParameters'
import { MainDataService } from './main-data.service';
import { NetworkService } from './network.service';

@Injectable({
  providedIn: 'root'
})
export class StateDataService extends MainDataService {

  constructor(apollo: Apollo, storage: Storage, networkService: NetworkService) {
    super(apollo, storage, networkService);

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
  }

  name() {
    return "StateDataService";
  }

  id() {
    return "State";
  }

  initialize() {
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

  getGQLQuery() {
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
  }

  processData() {
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
    stateHistoricalData.reverse();

    let stateData = {
      genericData: stateGenericData,
      regionWiseData: stateDistrictData,
      timeWiseData: stateHistoricalData
    }
    this.setProcessedData(stateData)
  }

}
