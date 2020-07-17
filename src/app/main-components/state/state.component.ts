import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { StateDataService } from '../../services/state-data.service';
//import { Network } from '@ionic-native/network/ngx';
//import { Platform } from '@ionic/angular';
import { NetworkService } from '../../services/network.service';
import { ToastController } from '@ionic/angular';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss'],
})
export class StateComponent implements OnInit, AfterViewInit {
  @ViewChild('content', {static: true}) content: IonContent;

  public stateMaps;
  public currState: any;
  public genericParameters: any;
  public genericData: any;
  public showProgressBar: boolean;
  public progressBarType: string;
  public generalText: string
  public loading: boolean = true;

  constructor(public stateDataService: StateDataService, private networkService: NetworkService, private toastController: ToastController) {
    this.showProgressBar = true;
    /*this.platform.ready().then(() => {
      console.log('\n\n\n\n\n\n\n\n\n\n \n\n\n\n\n  network ',this.network,this.network.Connection);
      
      this.network.onDisconnect().subscribe(() => {
        console.log('\n\n\n\n\n \n\n\n\n\n \n\n\n\n\n network was disconnected :-(');
      });


      this.network.onConnect().subscribe(() => {
        console.log('\n\n\n\n\n \n\n\n\n\n \n\n\n\n\n network connected!');
        // We just got a connection but we need to wait briefly
        // before we determine the connection type. Might need to wait.
        // prior to doing any api requests as well.
        setTimeout(() => {
          if (this.network.type === 'wifi') {
            console.log('we got a wifi connection, woohoo!');
          }
        }, 3000);
      });
    })
    this.platform.ready().then(() => {
      this.network.onDisconnect().subscribe(() => {
       console.log('network was disconnected :-(');
       alert("FirstPage onDisconnect");
      });
      this.network.onConnect().subscribe(() => {
       console.log('network was connected :-)');
       alert("FirstPage onConnect");
      });
     });*/
  }

  ngOnInit() {
    this.generalText = "loading"
    console.log("[State Main : Init]");
    this.showProgressBar = true;
    this.progressBarType = "indeterminate"
    this.stateMaps = this.stateDataService.getMaps();
    //this.currState = this.stateDataService.getCurrMapDetail();
    this.genericParameters = this.stateDataService.getDataParameters().filter(d => !d.percent);

    this.stateDataService.getDataListener().subscribe(data => {
      this.genericData = data.genericData;
      this.currState = this.stateDataService.getCurrMapDetail();
      this.scrollToTop();
      this.progressBarUpdate();
    })

    this.networkService.getNetworkConnectivityListener().subscribe(networkConnectivity => {
      this.currState = this.stateDataService.getCurrMapDetail();
      this.loading  = false;
      this.progressBarUpdate();
      //this.showToast();
    });

    this.networkService.refreshListener().subscribe(networkConnectivity => {
      this.showProgressBar = true;
      this.loading  = true;
      this.stateDataService.getData();
      //this.showToast();
    });

    window.addEventListener('ionPopoverDidPresent', e => {
      const selected = (e.target as HTMLElement).querySelector('[aria-checked="true"]');
      selected && selected.scrollIntoView({ block: 'center' });
    });
  }

  scrollToTop() {
    this.content.scrollToTop(400);
  }

  progressBarUpdate() {
    this.progressBarType = "determinate"
    setTimeout(() => {
      this.showProgressBar = false;
      this.progressBarType = "indeterminate"
    }, 2000);
  }

  ngAfterViewInit() {
    console.log("[State Main : AFETRInit]")
    this.showProgressBar = true;
    //this.stateDataService.getData();
  }

  onStateSelect() {
    this.showProgressBar = true;
    this.loading  = true;
    console.log("[State Main  : State Changed]", this.currState);
    this.stateDataService.setCurrMap(this.currState);
    this.stateDataService.getData();
  }

  doRefresh(event) {
    this.networkService.doRefresh();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  async showToast() {
    const toast = await this.toastController.create({
      header: 'Toast header',

      //duration: 2000,
      message: 'Cannot Load',
      buttons: [
        {
          side: 'start',
          icon: 'star',
          text: 'Favorite',
          handler: () => {
            console.log('Favorite clicked');
          }
        }, {
          text: 'Done',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    toast.present();
  }

}
