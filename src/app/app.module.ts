import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

// IonicStorege - npm install --save @ionic/storage
import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Services
import { StateDataService } from './services/state-data.service'
import { CountryDataService } from './services/country-data.service';
import { NetworkService } from './services/network.service';
import { HttpClientModule } from '@angular/common/http'

import { SharedComponentModule } from './shared-component.module'
import { StateComponent } from './main-components/state/state.component'
import { CountryComponent } from './main-components/country/country.component'

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// sudo ng add @angular/material
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  declarations: [
    AppComponent,
    StateComponent,
    CountryComponent
  ],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    SharedComponentModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    NetworkService,
    StateDataService,
    CountryDataService,
    {
      provide: RouteReuseStrategy,
      useClass: IonicRouteStrategy
    },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
