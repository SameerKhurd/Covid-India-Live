import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import * as d3 from 'd3';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-card-chart',
  templateUrl: './card-chart.component.html',
  styleUrls: ['./card-chart.component.scss'],
})
export class CardChartComponent implements OnInit {
  @Input() private cardParameter: any;
  @Input() private data: any;
  @ViewChild('smallChart', { static: true }) private chartContainer: ElementRef;

  public margin: any = { top: 0, right: 0, bottom: 0, left: 0 };
  public width: number;
  public height: number;
  public g: any;
  public x: any;
  public y: any;
  public yScaleLine: any;
  yLabel: any;
  xLabel: any;
  public svg: any;

  expenseData: any;

  public xAxis;
  public yAxis;


  constructor(private platform: Platform) { }


  ngOnInit() {
    console.log("[Card-Chart : Init]")

    this.createChart();
    this.createLineChart();
  }


  createChart() {
    // create the svg
    let element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.width = this.platform.width() / 3.3;
    //this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
    this.height = this.platform.width() / 10;
    this.svg = d3.select(element)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .style('border-radius', "10px");

    this.width -= 4
    this.height += 0
    // chart plot area
    this.g = this.svg.append('g')
    //.attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // set x scale
    this.x = d3.scaleBand()
      .range([2, this.width]);

    // set y scale
    this.y = d3.scaleLinear()
      .rangeRound([this.height, -0]);
  }


  createLineChart() {
    let yDomain = [0, d3.max(this.data, d => d[this.cardParameter["historicalKey"]])];
    let xDomain = this.data.map(function (d) { return d["date"]; });

    this.x.domain(xDomain);
    this.y.domain(yDomain).nice();

    this.yScaleLine = d3.scaleLinear()
      .range([this.height, -0]); // output 

    this.yScaleLine.domain(yDomain);

    var line = d3.line()
      .x(d => this.x(d["date"]) + (this.x.bandwidth() / 2)) // set the x values for the line generator
      .y(d => this.y(d[this.cardParameter["historicalKey"]])) // set the y values for the line generator 
      .curve(d3.curveMonotoneX) // apply smoothing to the line

    // define the area
    var area = d3.area()
      .x(d => this.x(d["date"]) + (this.x.bandwidth() / 2)) // set the x values for the line generator
      .y0(this.height - this.margin.bottom)
      .y1(d => this.y(d[this.cardParameter["historicalKey"]])) // set the y values for the line generator 
      .curve(d3.curveMonotoneX)

    this.g.append("path")
      .data([this.data])
      .attr("class", "area")
      .style("opacity", 0.1)
      .attr("fill", "white")
      .transition().duration(500)
      .attr("d", area)
      .attr("fill", this.cardParameter["color"]);

    this.g.append("path")
      .datum(this.data) // 10. Binds data to the line 
      .attr("class", "lines") // Assign a class for styling 
      .style("opacity", 0.9)
      .attr("stroke", "white")
      .transition().duration(500)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", this.cardParameter["color"])
      .attr("stroke-width", 1); // 11. Calls the line generator

    this.svg.append("circle")
      .transition().duration(500)
      .attr("cx", this.x(this.data[this.data.length - 1]["date"]) + (this.x.bandwidth() / 2))
      .attr("cy", this.y(this.data[this.data.length - 1][this.cardParameter["historicalKey"]]))
      .attr("r", 2)
      .attr("fill", this.cardParameter["color"]);


  }

}