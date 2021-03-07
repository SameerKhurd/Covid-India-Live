import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonSlides } from '@ionic/angular'
import { conditionallyCreateMapObjectLiteral } from '@angular/compiler/src/render3/view/util';

import { NetworkService } from './services/network.service';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('slide', { static: true }) private slide: IonSlides;
  public networkConnectivity: boolean;
  public showNetworkElement: boolean
  public retry: boolean;

  public slideNames: string[];
  public slideIndex = 0;
  public appPages = [
    {
      title: 'Inbox',
      url: '/folder/Inbox',
      icon: 'mail'
    },
    {
      title: 'Outbox',
      url: '/folder/Outbox',
      icon: 'paper-plane'
    },
    {
      title: 'Favorites',
      url: '/folder/Favorites',
      icon: 'heart'
    },
    {
      title: 'Archived',
      url: '/folder/Archived',
      icon: 'archive'
    },
    {
      title: 'Trash',
      url: '/folder/Trash',
      icon: 'trash'
    },
    {
      title: 'Spam',
      url: '/folder/Spam',
      icon: 'warning'
    }
  ];
  public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private networkService: NetworkService,
  ) {
    this.slideNames = ["State", "India"];
    this.showNetworkElement = false;
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  ngOnInit() {
    this.slideIndex = 0;

    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      //this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }

    this.networkService.getNetworkConnectivityListener().subscribe(networkConnectivity => {
      //console.log("[App : Network Status Update]", networkConnectivity);
      this.networkConnectivity = networkConnectivity;
      if (this.networkConnectivity) {
        setTimeout(() => {
          this.showNetworkElement = false;
        }, 3000);
      }
      else {
        this.retry = false;
        this.showNetworkElement = true;
      }
    });

    this.networkService.refreshListener().subscribe(networkConnectivity => {
      this.retry = true;
    });
  }

  onRetry() {
    this.retry = true;
    this.networkService.doRefresh();
  }

  onSlideChange(slide: IonSlides) {
    slide.getActiveIndex().then((index: number) => {
      this.slideIndex = index;
    });
  }

  onSlideButtonTap(slideIndex) {
    this.slide.slideTo(slideIndex);
  }


}
