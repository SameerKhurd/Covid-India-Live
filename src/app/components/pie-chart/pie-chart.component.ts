import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as d3 from 'd3';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
})
export class PieChartComponent implements OnInit {
  // Input Parameter
  @Input() public dataService: any;

  @ViewChild('piechart', { static: true }) private chartContainer: ElementRef;
  private margin = { top: 0, left: 0, bottom: 0, right: 0 };
  private thickness: number;
  private svg: any;
  private keys: string[];
  private xColumn: string;
  private width: number;
  private height: number;
  private radius: number;
  private g1: any;
  private g2: any;
  private color: string[];

  public genericData: any;
  public pieChartData: any;
  public dataParameters: any;
  public genericParameters: any;
  public pieChartParameters: any;
  public confirmedParameter: any;
  public testParameter: any;
  public currMap: any;
  public date;
  private speed: number;
  public spinner = true;
  constructor(private platform: Platform) { }

  ngOnInit() {
    //console.log("[Pie-Chart : Init]");

    this.dataParameters = this.dataService.getDataParameters();
    this.genericParameters = this.dataParameters.filter(d => !d.percent);
    this.pieChartParameters = this.dataParameters.filter(d => d.pieChartDisplay);
    this.confirmedParameter = this.dataParameters.find(parameter => { return parameter.name === "Confirmed" });
    this.testParameter = this.dataParameters.find(parameter => { return parameter.name === "Testing" });

    this.dataService.getDataListener().subscribe(data => {
      this.onDataRecevied(data);
    });
    this.onDataRecevied(this.dataService.getProcessedData());
  }

  onDataRecevied(data) {
    if (!data) return;
    this.genericData = data.genericData;
    this.pieChartData = this.pieChartParameters.map((parameter, index) => {
      return {
        index: index,
        label: parameter.name,
        value: this.genericData[parameter.totalKey],
        color: parameter.color,
        percentage: ((this.genericData[parameter.totalKey] / (this.genericData[this.confirmedParameter.totalKey] || 1)) * 100).toFixed(2) + "%"

      }
    });
    let date = this.genericData["updated"].split(" ");
    date = [date[0].split("/"), date[1]];
    this.date = new Date(date[0][2] + "-" + date[0][1] + "-" + date[0][0] + " " + date[1]); // The 0 there is the key, which sets the date to the epoch
    //this.date = 
    //this.date.setUTCSeconds();

    this.currMap = this.dataService.getCurrMapDetail()
    this.createChart();
    this.updateChart();
  }

  createChart() {
    let element = this.chartContainer.nativeElement;

    d3.select("#" + this.dataService.name() + "pc").remove();
    this.width = this.platform.width() * 0.7;
    this.height = this.platform.width() * 0.4;
    this.svg = d3.select(element)
      .append('svg')
      .attr("id", this.dataService.name() + "pc")
      .attr('width', this.platform.width())// +200+ this.margin.left + this.margin.right)
      .attr('height', this.height + 30)
      .attr('preserveAspectRatio', "xMinYMax meet")
    //.attr('transform', `translate(${300}, ${300})`)

    //this.width = Math.min(element1.offsetHeight - 60, element1.offsetWidth - 60)//element.offsetWidth / 3 //- this.margin.left - this.margin.right;
    //this.height = Math.min(element1.offsetHeight - 60, element1.offsetWidth - 60)//element.offsetHeight / 3// - this.margin.top - this.margin.bottom;
    this.radius = Math.min(this.width, this.height) / 1.5;
    this.thickness = this.radius / 2;



    this.g1 = this.svg.append('g')
      .attr('transform', `translate(${this.platform.width() / 2 - 10}, ${(this.height + 30) * 0.8})`)
    this.g2 = this.svg.append('g')
      .attr('transform', `translate(${this.platform.width() / 2 - 10}, ${(this.height + 30) * 0.8})`)



    this.g2.append("text")
      .attr("class", "name-text")
      .attr('text-anchor', 'middle')
      .attr("font-size", "1em")
      .attr('dy', '-1.2em')
      .attr("font-weight", "bold")
      .style("fill", this.confirmedParameter.color);

    this.g2.append("text")
      .attr("class", "value-text")
      .attr('text-anchor', 'middle')
      .attr("font-size", "1em")
      .attr('dy', '1em')
      .style("fill", this.confirmedParameter.color);

  }

  updateChart() {
    let pie = d3.pie()
      .sort(null)
      .startAngle(-Math.PI * 0.5)
      .endAngle(Math.PI * 0.5)
      .value(d => d.value.value);
    let transformedData = pie(d3.entries(this.pieChartData))

    let arc = d3.arc()
      .innerRadius(this.radius - this.thickness)
      .outerRadius(this.radius)

    let arc1 = (d) => d3.arc()
      .innerRadius(this.radius - this.thickness + 30 * d.data.value.index)
      .outerRadius(this.radius + 30 * d.data.value.index);


    this.g1.selectAll(".slice").remove()
    var labelArc = d3.arc()
      .innerRadius((this.radius - this.thickness) * 1.2)
      .outerRadius(this.radius * 2);
    let speed = 300;
    let slice = this.g1.selectAll("path.slice")
      .data(transformedData)
      .enter().append("g")
      .attr("class", "slice")
      .style("cursor", "pointer")

    slice.append("path")
      .style("fill", (d) => d.data.value.color)
      .style("opacity", 0.5)
      .attr("id", (d) => "a" + d.data.name)
      //.attr('filter', 'url(#dropshadow)') // !!! important - set id of predefined filter

      .transition().delay(function (d, i) {
        return i * speed;
      }).duration(speed)
      .attrTween('d', function (d) {
        var i = d3.interpolate(d.startAngle + 0.0001, d.endAngle);
        return function (t) {
          d.endAngle = i(t);
          return arc(d)
        }
      })
      //.attr('d', arc)
      .style("stroke-width", "3px")
      .attr("stroke", (d) => "white")//d.data.value.color)
      .attr("stroke-opacity", 0.3)
    //.attr("box-shadow","5px 5px #dddddd")


    slice.append("text")
      .attr("transform", function (d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("text-anchor", "middle")
      .attr("dy", "0em")
      .attr("font-size", "0px")
      .attr("font-weight", "bold")
      .style("fill", (d) => d.data.value.color)
      .text("")
      .transition().delay(function (d, i) {
        return 3 * speed;
      }).duration(speed / 3)
      .text((d) => d.data.value.label)
      .attr("font-size", "12px")


    slice.append("text")
      .attr("transform", function (d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("font-size", "0px")
      .attr("font-weight", "bold")
      .style("fill", (d) => d.data.value.color)
      .text("")
      .transition().delay(function (d, i) {
        return 3 * speed;
      }).duration(speed / 3)
      .text((d) => d.data.value.percentage)
      .attr("font-size", "20px")

    slice.append("text")
      .attr("transform", function (d) { return "translate(" + labelArc.centroid(d) + ")"; })
      .attr("text-anchor", "middle")
      .attr("dy", "3em")
      .attr("font-size", "0px")
      .attr("font-weight", "bold")
      .style("fill", (d) => d.data.value.color)
      .text("")
      .transition().delay(function (d, i) {
        return 3 * speed;
      }).duration(speed / 3)
      .text((d) => d.data.value.value.toLocaleString())
      .attr("font-size", "12px")
    /*
        var outerArc = d3.arc()
          .innerRadius((this.radius - this.thickness) * 1.2)
          .outerRadius(this.radius * 1.2);
    
        this.g1
          .selectAll('allPolylines')
          .data(transformedData)
          .enter()
          .append('polyline')
          .attr("stroke", "#333333")
          .attr("stroke-opacity", 0.5)
          .style("stroke-width", "2px")
          .style("fill", "none")
          .attr("stroke-width", 1)
          .attr('points', (d) => {
            var posA = arc.centroid(d) // line insertion in the slice
            var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
            var posC = outerArc.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = this.radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
          });
    
        this.g1
          .selectAll('allLabels')
          .data(transformedData)
          .enter()
          .append('text')
          .attr("dy", "0em")
          .style("fill", (d) => d.data.value.color)
          .attr("font-weight", "bold")
          .text((d) => d.data.value.label)
          .attr('transform', (d) => {
            var pos = outerArc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = this.radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
          })
          .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
          })
    
        this.g1
          .selectAll('allLabels1')
          .data(transformedData)
          .enter()
          .append('text')
          .style("fill", (d) => d.data.value.color)
          .attr("font-weight", "bold")
          .attr('transform', (d) => {
            var pos = outerArc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = this.radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
          })
          .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
          })
          .attr("dy", "1em")
          .text((d) => d.data.value.value.toLocaleString())
    
        this.g1
          .selectAll('allLabels1')
          .data(transformedData)
          .enter()
          .append('text')
          .style("fill", (d) => d.data.value.color)
          .attr("font-weight", "bold")
          .attr('transform', (d) => {
            var pos = outerArc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            pos[0] = this.radius * 0.99 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos + ')';
          })
          .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
            return (midangle < Math.PI ? 'start' : 'end')
          })
          .attr("dy", "2em")
          .text((d) => d.data.value.percentage)
    *//*
    this.g2.select(".name-text")
      .text("");

    this.g2.select(".value-text")
      .text("Total  "+ this.genericData[this.confirmedParameter.totalKey].toLocaleString());*/
  }
}
