import { Component, OnInit, AfterViewInit, Input, ViewChildren, ViewChild, ElementRef, QueryList } from '@angular/core';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { DomController } from '@ionic/angular';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @Input() public dataService: any;
  @ViewChild('mycard', { static: true }) private mycard: ElementRef;

  public dataParameters: any;
  public cardParameters: any;
  public activeParameter: any;
  public testParameter: any;

  public genericData: any;
  public timeWiseData: any;

  constructor(private domController: DomController) {
  }

  ngOnInit() {
    console.log("[Card : Init]")
    /* let date: Date = new Date();  
     console.log("Date = " + date); //Date = Tue Feb 05 2019 12:05:22 GMT+0530 (IST)  
     console.log("Date = " + date.getDate()); //Date = Tue Feb 05 2019 12:05:22 GMT+0530 (IST)  
     console.log("Date = " + date.getDay()); //Date = Tue Feb 05 2019 12:05:22 GMT+0530 (IST)  
     console.log("Date = " + date.getMonth()); //Date = Tue Feb 05 2019 12:05:22 GMT+0530 (IST)  */
    this.dataParameters = this.dataService.getDataParameters();
    this.cardParameters = this.dataParameters.filter(d => d.cardDisplay);
    this.activeParameter = this.dataParameters.find(parameter => { return parameter.name === "Active" });
    this.testParameter = this.dataParameters.find(parameter => { return parameter.name === "Testing" });

    this.dataService.getDataListener().subscribe(data => {
      this.genericData = data.genericData;
      this.timeWiseData = data.timeWiseData;
    });
  }
}
