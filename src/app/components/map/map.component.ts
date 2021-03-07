import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  @Input() public dataService: any;
  @ViewChild('map', { static: true }) private chartContainer: ElementRef;
  @ViewChild('mapLabel', { static: true }) private chartLabelContainer: ElementRef;

  private regionWiseData: any;
  private regionWiseDataMap = new Map<string, any>();
  public dataParameters: any;
  public mapParameters: any;
  private mapDetail: any;

  public currParameterIndex: number;
  private currParameter: any;

  private normalize: boolean;
  private mapDirPath: string;
  private fileExt: string;
  private mapConf: any;

  private margin: any = { top: 0, bottom: 0, left: 10, right: 0 };
  private svg: any;
  private width: number;
  private height: number;
  private jsondata: any;
  private formattedData: any = null;
  private dataType: string;
  private currkeys: string[];
  private z: any;
  private populationDisabled: boolean;
  private timerEvent: any;
  private map: any;
  private state: any;

  constructor(
    private http: HttpClient,
    private platform: Platform) {
  }

  ngOnInit() {
    //console.log("[Map : Init]");
    this.fileExt = ".json";
    this.mapDirPath = "assets/maps/";

    this.dataParameters = this.dataService.getDataParameters();
    this.mapParameters = this.dataParameters.filter(d => d.mapDisplay);
    this.mapConf = this.dataService.getMapConf();

    this.dataService.getDataListener().subscribe(data => {
      this.onDataRecevied(data);
    });
    this.onDataRecevied(this.dataService.getProcessedData());
  }

  onDataRecevied(data) {
    if (!data) return;
    this.regionWiseData = data.regionWiseData;
    this.currParameterIndex = 0;
    this.mapDetail = this.dataService.getCurrMapDetail();
    this.createRegionWiseDataMap()
    this.updateCurrParameter();
    this.getMap();
  }

  createRegionWiseDataMap() {
    this.regionWiseDataMap = new Map<string, any>();

    for (let region of this.regionWiseData)
      this.regionWiseDataMap.set(region[this.mapConf.identifier], region);
  }

  onParameterchange(currParameterIndex) {
    clearInterval(this.timerEvent);
    this.currParameterIndex = currParameterIndex
    this.updateCurrParameter();
    this.createMap();
  }

  updateCurrParameter() {
    this.currParameter = this.mapParameters[this.currParameterIndex];
  }

  getMap() {
    //console.log("[Map : Get Map]", this.mapDetail)
    clearInterval(this.timerEvent);
    this.http.get(this.mapDirPath + this.mapDetail.mapName + this.fileExt).subscribe(responseData => {
      //this.mapName = this.mapName.replace(" ", "_");
      this.jsondata = responseData;
      this.createMap();
    })
  }

  getMaxValue() {
    return this.regionWiseData.reduce((max, p) => p[this.currParameter["totalKey"]] > max ? p[this.currParameter["totalKey"]] : max, this.regionWiseData[0][this.currParameter["totalKey"]]);
  }

  createMap() {
    //console.log("[Map : Create Map]", this.mapDetail)
    clearInterval(this.timerEvent);

    let element = this.chartContainer.nativeElement;
    d3.select("#" + this.dataService.name() + "map").remove();
    this.width = element.offsetWidth - this.margin.left - this.margin.right;   //800
    this.height = element.offsetHeight - this.margin.top - this.margin.bottom; //400
    this.width = this.platform.width() * 0.9;
    this.height = this.platform.width() * 0.8;

    this.svg = d3.select(element)
      .append('svg')
      .attr("id", this.dataService.name() + "map")
      .attr('width', this.platform.width())//500)
      .attr('height', this.height)//element.offsetHeight)
      //.attr('viewBox',"0 0 480 450")
      .attr('preserveAspectRatio', "xMinYMax meet")
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);
    this.width -= 10;
    this.state = topojson.feature(this.jsondata, this.jsondata.objects[this.mapDetail.mapName + "_" + this.mapConf.objectIdentifier]);

    const projection = d3.geoMercator();
    projection.fitExtent(
      [
        [this.margin.left, 5],
        //[element.offsetWidth, element.offsetHeight],   // [500,450]
        [this.width, this.height],   // [500,450]
      ],
      this.state
    );
    const path = d3.geoPath(projection);

    this.map = this.svg.selectAll(".country")
      .data(this.state.features)
      .enter()
      .append("path")
      .attr("class", "country").attr("d", path)

    let maxValue = this.getMaxValue();
    this.map.attr("fill", "white")
      .attr("stroke-width", "1px")
      .attr("stroke", "#660000")
      .transition().duration('750')
      .attr("fill", (d) => {
        let curValue = this.regionWiseDataMap.get(d.properties[this.mapConf.propertiesIdentifier])[this.currParameter["totalKey"]];
        return d3[this.currParameter["interpolateColor"]](curValue / (maxValue || 0.01));
      })
      .attr("stroke-opacity", 0.2);

    let addMapLabels = (bool) => {
      this.svg.selectAll("labels")
        .data(this.state.features)
        .enter()
        .append("text")
        .attr("class", "map-labels" + this.dataService.name())
        .attr("x", function (d) { return path.centroid(d)[0] })
        .attr("y", function (d) { return path.centroid(d)[1] })
        .attr("dy", ".35em")
        .style("font-size", "0px")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .style('font-family', "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif")
        .style("font-weight", "bold")
        .style("stroke", "black")
        .attr("stroke-width", "0.5px")
        .attr("stroke-opacity", 0.2)
        .style("fill", (d) => {
          let curValue = this.regionWiseDataMap.get(d.properties[this.mapConf.propertiesIdentifier])[this.currParameter["totalKey"]];
          let val = (curValue / (maxValue || 0.01));
          return d3[this.currParameter["interpolateColor"]](val > 0.65 ? 0.4 : 1);
        })
        //.style("fill", "rgba(30, 0, 0, 0.9)")
        .transition().duration(100)
        .text((d) => !bool ? d.properties[this.mapConf.propertiesIdentifier] : this.regionWiseDataMap.get(d.properties[this.mapConf.propertiesIdentifier])[this.currParameter["totalKey"]].toLocaleString() + (this.currParameter.percent ? "%" : ""))
        .style("font-size", "10px");
    }
    let bo = true;

    addMapLabels(bo);

    this.timerEvent = setInterval(() => {
      //console.log("[Map : Timer Triggered] :", this.mapDetail.mapName);
      d3.selectAll(".map-labels" + this.dataService.name()).remove();
      bo = !bo
      addMapLabels(bo);

    }, 2500);

    this.addLabel(maxValue)

  }

  addLabel(maxValue) {
    let element = this.chartLabelContainer.nativeElement;
    d3.select("#" + this.dataService.name() + "mapLabel").remove();

    let svg = d3.select(element)
      .append('svg')
      .attr("id", this.dataService.name() + "mapLabel")
      .attr('width', this.platform.width())//500)
      .attr('height', 60)//element.offsetHeight)
      //.attr('viewBox',"0 0 480 450")
      .attr('preserveAspectRatio', "xMinYMax meet")
      .append('g')
      .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    var legend = svg.append("defs")
      .append("svg:linearGradient")
      .attr("id", "gradient" + this.currParameter["interpolateColor"])
      .attr("x1", "100%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "100%")
      .attr("spreadMethod", "pad");

    legend.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", d3[this.currParameter["interpolateColor"]](1))
      .attr("stop-opacity", 1);
    legend.append("stop")
      .attr("offset", "25%")
      .attr("stop-color", d3[this.currParameter["interpolateColor"]](0.75))
      .attr("stop-opacity", 1);
    legend.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", d3[this.currParameter["interpolateColor"]](0.5))
      .attr("stop-opacity", 1);
    legend.append("stop")
      .attr("offset", "75%")
      .attr("stop-color", d3[this.currParameter["interpolateColor"]](0.25))
      .attr("stop-opacity", 1);
    legend.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", d3[this.currParameter["interpolateColor"]](0))
      .attr("stop-opacity", 1);

    svg.append("rect")
      .attr("width", this.width - 10)
      .attr("height", 20)
      .style("fill", "url(#gradient" + this.currParameter["interpolateColor"] + ")")
      //.attr("transform", "translate(0,10)");
      .attr("transform", "translate(5,10)")
      .attr("stroke", "black")
      .attr("stroke-width", "0.5px")
    //.attr("stroke-opacity", "0.3")

    var y = d3.scaleLinear()
      .range([0, this.width - 10])
      .domain([0, maxValue]);

    svg.append("g")
      .attr("transform", "translate(5,30)")
      .attr("class", "y-axis")
      .transition().duration(500)
      .call(d3.axisBottom(y)
        .ticks(5)
        .tickSize(-20))
      .selectAll("text")
      .attr("y", "10")
      .style("text-anchor", "middle")
      .style("font-weight", "bold")
      .style("font-size", "11px")
      .text(d => d.toLocaleString() + (this.currParameter.percent ? "%" : ""));
    /*this.svg.append("g")
      .attr("class", "y axis")
      .transition().duration(500)
      .call(d3.axisBottom(y).ticks(5))*/
  }
}
