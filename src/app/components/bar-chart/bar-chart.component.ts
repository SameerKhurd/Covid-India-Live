import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { Platform } from '@ionic/angular';
import * as d3 from 'd3';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
})
export class BarChartComponent implements OnInit {
  @Input() public dataService: any;
  @ViewChild('barchart', { static: true }) private chartContainer: ElementRef;

  public dataParameters: any;
  public barchartParameters: any;
  public timeWiseData: any;

  public currParameterIndex: number;
  public currParameter: any;

  private key: any;
  private slice: number;

  public granularities: any;
  public currGranularityIndex: number;
  public prevGranularityIndex: number;

  public bulkMode: boolean = false;

  public cummulativeTypes: any;
  public currCummulativeTypeIndex: any;

  private margin = { top: 0, left: 10, bottom: 0, right: 0 };
  private svg: any;
  private width: number;
  private height: number;
  private xAxis: any;
  private yAxis: any;
  private yAxisRight: any;
  private yLabel: any;
  private xLabel: any;
  private g: any;
  private g1: any;
  private z: any;
  private x: any;
  private y: any;
  private y1: any;
  private tooltip: any;
  private rects: any;
  private speed: number = 500;
  private xLabelName: string;
  private yLabelName: string;
  private xColumn: string;
  private dataType: string;
  private tip: any;
  public total: number;

  constructor(private platform: Platform) { }

  ngOnInit() {
    console.log("[Bar-Chart : Init]")
    this.granularities = [
      { name: "  All  ", slice: 0, value: "1+ year" },
      { name: "6 Months", slice: 180, value: "6 Months" },
      { name: "1 Month", slice: 30, value: "1 Month" },
      { name: "15 Days", slice: 15, value: "15 Days" },
      // { name: "7 Days", slice: 7 }
    ].reverse();
    this.cummulativeTypes = [
      { name: "Cummulative", bool: true },
      { name: "Daily", bool: false }
    ];

    this.dataParameters = this.dataService.getDataParameters();
    this.barchartParameters = this.dataParameters.filter(d => d.cardDisplay);

    this.xColumn = "date"
    this.dataService.getDataListener().subscribe(data => {
      this.onDataRecevied(data);
    });
    this.onDataRecevied(this.dataService.getProcessedData());
  }

  onDataRecevied(data) {
    if (!data) return;
    this.bulkMode = false;
    this.timeWiseData = data.timeWiseData;
    this.currParameterIndex = 0;
    this.currGranularityIndex = 0;
    this.currCummulativeTypeIndex = 1;
    this.prevGranularityIndex = this.currGranularityIndex;
    this.granularities[3].value = this.timeWiseData.length.toLocaleString() + " Days"

    this.updateCurrParameter();
    this.updateCummulative();
    this.updateGranularity();
    this.createChart();
    this.createLine();
    this.updateChart();
    this.updateLine();
  }

  onGranularityChange(currGranularityIndex) {
    this.currGranularityIndex = currGranularityIndex;
    this.updateGranularity();

    this.bulkMode = this.currGranularityIndex > 1
    this.updateChart();
    this.updateLine();

    //this.prevGranularityIndex = this.currGranularityIndex;
    //this.bulkMode = !this.bulkMode;
  }

  updateGranularity() {
    this.slice = this.granularities[this.currGranularityIndex]["slice"];
  }

  onCummulativeTypeChange(currCummulativeTypeIndex) {
    this.currCummulativeTypeIndex = currCummulativeTypeIndex;
    this.updateCummulative();

    this.updateChart();
    this.updateLine();
  }

  updateCummulative() {
    this.key = this.cummulativeTypes[this.currCummulativeTypeIndex]["bool"] ? "totalKey" : "historicalKey";
  }

  onParameterchange(currParameterIndex) {
    this.currParameterIndex = currParameterIndex;
    this.updateCurrParameter();
    this.updateChart();
    this.updateLine();

  }

  updateCurrParameter() {
    this.currParameter = this.barchartParameters[this.currParameterIndex];
  }


  createChart() {
    // create the svg
    let element = this.chartContainer.nativeElement;
    this.width = element.offsetWidth - this.margin.left - this.margin.right;
    this.width = this.platform.width() * 0.9;
    this.height = this.platform.width() * 0.4;
    //this.height = element.offsetHeight - this.margin.top - this.margin.bottom;
    d3.select("#" + this.dataService.name() + "bc").remove();

    this.svg = d3.select(element)
      .append('svg')
      .attr("id", this.dataService.name() + "bc")
      .attr('width', this.width)
      .attr('height', this.height + 75)
    //.style('border-radius', "10px");

    this.width -= 10
    this.height -= this.margin.bottom
    this.margin.top = this.height / 2;
    this.g = this.svg.append('g').attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

    // add the Y gridlines
    this.svg.append("g")
      .attr("transform", `translate(${this.margin.left - 5},0)`)
      .attr("class", "y-axis-grid")
      .style("color", "lightgray")
      .style('opacity', 0.5);

    this.g1 = this.svg.append("g");

    // X Axis
    this.xAxis = this.svg.append("g")
      .attr("transform", `translate(0,${this.height - this.margin.bottom})`)
      .attr("class", "x-axis");
    /*
        // Y Axis  
        this.yAxis = this.svg.append("g")
          .attr("transform", `translate(${this.margin.left - 5},0)`)
          .attr("class", "y-axis");
    
        // X Label
        /*this.xLabel = this.g.append("text")
          .attr("y", this.height + this.margin.bottom) // - this.margin.bottom/2)
          .attr("x", (this.width - this.margin.left - this.margin.right) / 2)
          .attr("font-size", "18px")
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .attr("font-family", "sans-serif")
          .text(this.xLabelName);
    
        // Y label 
        this.yLabel = this.g.append("text")
          .attr("x", (-this.height + this.margin.bottom + this.margin.top) / 2)
          .attr("y", -this.margin.left / 1.2)
          .attr("font-size", "18px")
          .attr("text-anchor", "middle")
          .attr("transform", "rotate(-90)")
          .attr("font-weight", "bold")
          .attr("font-family", "sans-serif")
          .text(this.yLabelName);*/

    // set the colors 
    //this.z = d3.scaleOrdinal([...d3.schemeSet2, ...d3.schemePaired, ...d3.schemeTableau10]);
    //this.z.domain(this.keys);
  }

  createLine() {
    // Y-Right label 
    /*this.g.append("text")
      .attr("class", "y1-text")
      .attr("x", (this.height - this.margin.bottom - this.margin.top) / 2 - 10)
      .attr("y", -this.width + this.margin.right + this.margin.left / 2)
      .attr("font-size", "18px")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(90)")
      .attr("font-weight", "bold")
      .attr("font-family", "sans-serif")
      .text("Population");
*/
    // Y-Right Axis
    this.y1 = d3.scaleLinear().rangeRound([this.height - this.margin.bottom, this.margin.top])
    /* this.yAxisRight = this.svg.append("g")
       .attr("transform", "translate(" + (this.width - this.margin.right + 5) + " ,0)")
       .attr("class", "y1-axis");*/
  }


  // Update the chart
  updateChart() {
    let data = this.timeWiseData.slice(-this.slice);
    this.total = 0;
    for (let d of data) {
      this.total += d[this.currParameter["historicalKey"]];
    }
    // Set X & Y domains
    let xDomain = data.map(d => d[this.xColumn]);
    let yDomain = [0, d3.max(data, d => (d[this.currParameter[this.key]] == 0) ? 0.1 : d[this.currParameter[this.key]])];

    // Set x scale
    this.x = d3.scaleBand()
      .range([this.margin.left, this.width - this.margin.right])
      .paddingInner(0.3)
      .align(0.1);

    // Set y scale
    this.y = d3.scaleLinear()
      .rangeRound([this.height - this.margin.bottom, this.margin.top])
    //.rangeRound([-this.margin.top, this.height - this.margin.bottom])

    this.x.domain(xDomain)
    this.y.domain(yDomain).nice();

    // add new bars
    let rects = this.g1.selectAll('rect')
      .attr("class", "verticalbar")
      .data(data);

    // remove exiting bars
    rects.exit().remove();

    if (this.bulkMode) {
      d3.selectAll(".verticalbar").remove();

      let dataMinimize = []
      for (let i = 0; i < data.length - 1; i += 30) {
        dataMinimize.push(data[i])
      }
      dataMinimize.push(data[data.length - 1]);
      console.log(dataMinimize)

      data = dataMinimize;
      this.x.domain(data.map(d => d[this.xColumn]))

    }
    else {
      rects.enter()
        .append('rect')
        .attr("class", "bar")
        .merge(rects)
        .attr('x', d => this.x(d[this.xColumn]))
        .attr('y', d => this.y(0))
        .attr("width", this.x.bandwidth())
        .attr('height', 0)
        .style('fill', this.currParameter["color"])
        .style("opacity", 0.5)
        .transition().duration(this.speed)
        .attr('y', d => this.y(d[this.currParameter[this.key]]))
        .attr('height', d => this.height - this.y(d[this.currParameter[this.key]]))
        .attr('rx', "0.75%");
    }
    this.svg.selectAll(".x-axis").exit().remove();
    let parseDate = d3.timeFormat("%d %b");

    this.svg.selectAll(".x-axis")
      .transition().duration(this.speed)
      .call(
        d3.axisBottom(this.x)
          //.tickSize(0)
          .tickSizeOuter(0)
      ).selectAll("text")
      //.data(data, d => d[this.xColumn])
      .attr("y", "-5")
      .attr("x", "-10")
      .attr("font-size", "13px")
      //.attr("font-weight", "bold")
      .attr("text-anchor", "end")
      .attr("font-family", "Everson Mono")
      .attr("transform", "rotate(-90)")
      //.attr("fill", this.currParameter["color"])
      .text(d => { let t = parseDate(new Date(d)); return t[0] == 0 ? t.slice(1) : t });

    this.x.domain(xDomain);


    // Text above each bar  
    let text = this.g1.selectAll(".text")
      .data(data, d => d[this.xColumn])
      .attr("fill", this.currParameter["color"]);

    text.exit().remove();

    text.enter().append("text")
      .attr("class", "text")
      .attr("text-anchor", "middle")
      .attr("transform", function (d) { return "rotate(-0)" })
      .attr("font-size", "11px")
      .merge(text)
      .transition().duration(this.speed)
      .attr("transform", (d) => {
        return ("translate(" + this.x(d[this.xColumn]) + "," + this.y(d[this.currParameter[this.key]]) + ")rotate(-90)")
      })
      .attr("fill", this.currParameter["color"])

      .attr("y", this.x.bandwidth() / 2 + 3)
      .attr("x", 30)
      .text(d => d[this.currParameter[this.key]].toLocaleString());

    this.svg.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot1")

    let dots = this.svg.selectAll("circle").data(data);
    dots.exit().remove();
    dots.style('fill', this.currParameter["color"])
      .style('opacity', 0.9)
      //.attr("cy", d => this.y1(0))
      .transition().duration(this.speed)
      .attr("cx", d => this.x(d[this.xColumn]) + this.x.bandwidth() / 2)
      .attr("cy", d => this.y(d[this.currParameter[this.key]]))
      .attr("r", 3.5);

  }

  updateLine() {
    let data = this.timeWiseData.slice(-this.slice);

    let yDomainRight = [0, d3.max(data, d => (d[this.currParameter[this.key]] == 0) ? 0.1 : d[this.currParameter[this.key]])];

    this.y1.domain(yDomainRight).nice();

    // Update Right-Y Axis
    /* this.svg.selectAll(".y1-axis").transition().duration(this.speed)
       .call(d3.axisRight(this.y1)
         .tickFormat(d3.format(".0s"))
         .ticks(10))
       .attr("font-size", "14px");*/

    var line = d3.line()
      .x(d => this.x(d[this.xColumn]) + this.x.bandwidth() / 2)
      .y(d => this.y(d[this.currParameter[this.key]]))
      .curve(d3.curveMonotoneX);

    let path = this.svg.append("path")
      .attr("class", "line")
      .attr("fill", "none")
    path = this.svg.selectAll("path").datum(data)
    path.exit().remove()
    this.svg.select(".line")
      .style('opacity', 0.7)
      .attr("stroke-width", "0.5px")
      .attr("stroke", this.currParameter["color"])

      .transition().duration(this.speed)
      .attr("d", line);

    const tip = this.tip;
    var area = d3.area()
      .x(d => this.x(d[this.xColumn]) + this.x.bandwidth() / 2) // set the x values for the line generator
      .y0(this.height - this.margin.bottom)
      .y1(d => this.y(d[this.currParameter[this.key]])) // set the y values for the line generator 
      .curve(d3.curveMonotoneX)

    let pathArea = this.svg.append("path")
      .attr("class", "area")
      .attr("fill", "none");

    pathArea = this.svg.selectAll("path").datum(data)
    pathArea.exit().remove()

    if (this.bulkMode) {
      this.svg.select(".area")
        .style("opacity", 0.4)
        .attr("fill", "white")
        .transition().duration(this.speed)
        .attr("d", area)
        .attr("fill", this.currParameter["color"]);
    }
    else {
      d3.selectAll(".area").remove();

    }

  }

}
