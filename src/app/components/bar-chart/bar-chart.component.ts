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
      { name: "1 Month", slice: 30 },
      { name: "15 Days", slice: 15 },
      { name: "7 Days", slice: 7 }
    ];
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
    this.timeWiseData = data.timeWiseData;
    this.currParameterIndex = 0;
    this.currGranularityIndex = 1;
    this.currCummulativeTypeIndex = 1;

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
    this.updateChart();
    this.updateLine();

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

    /*// Plot bars
    let group = this.g1.selectAll("g.layer")
      .data(d3.stack().keys(this.currkeys)(this.data))
      .attr("fill", d => this.z(d.key));

    group.exit().remove();

    group.enter().append("g")
      .classed("layer", true)
      .attr("fill", d => this.z(d.key));

    let bars = this.svg.selectAll("g.layer").selectAll("rect")
      .data(function (d) { return d; });

    bars.exit().remove();

    bars.enter().append("rect")
      .attr("width", this.x.bandwidth())
      .merge(bars)
      .attr("x", d => this.x(d.data[this.xColumn]))
      .attr('y', d => this.y(0))
      .attr('height', 0)
      .transition().duration(this.speed)
      .attr("y", d => this.y(d[1]))
      .attr("height", d => this.y(d[0]) - this.y(d[1]))
      .attr("cursor", "pointer");*/

    let rects = this.g1.selectAll('rect')
      .data(data);

    // remove exiting bars
    rects.exit().remove();

    // update existing bars
    //this.chart.selectAll('rects').transition()
    /*rects.transition().duration(this.speed)
      .style('fill', this.currParameter["color"])
      .style("opacity", 0.5)
      .attr('x', d => this.x(d[this.xColumn]))
      .attr('y', d => this.y(d[this.currParameter[this.key]]))
      .attr("width", this.x.bandwidth())
      .attr('height', d => this.height - this.y(d[this.currParameter[this.key]]))
      .attr('rx', "0.75%");*/

    // add new bars
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

    this.svg.selectAll(".x-axis").exit().remove();
    let parseDate = d3.timeFormat("%d %b");

    this.svg.selectAll(".x-axis").transition().duration(this.speed)
      .call(d3.axisBottom(this.x)
        //.tickSize(0)
        .tickSizeOuter(0))

      .selectAll("text")
      .attr("y", "-5")
      .attr("x", "-10")
      .attr("font-size", "13px")
      //.attr("font-weight", "bold")
      .attr("text-anchor", "end")
      .attr("font-family", "Everson Mono")
      .attr("transform", "rotate(-90)")
      //.attr("fill", this.currParameter["color"])
      .text(d => { let t = parseDate(new Date(d)); return t[0] == 0 ? t.slice(1) : t });
    ;

    /*
    
        // Update Y Axis
        this.svg.selectAll(".y-axis").transition().duration(this.speed)
          .call(d3.axisLeft(this.y)
            .ticks(10))
          .attr("font-size", "14px");
    
        // Update the Y gridlines
        this.svg.selectAll(".y-axis-grid").transition().duration(this.speed)
          .call(d3.axisLeft(this.y)
            .ticks(10)
            .tickSize(-this.width + this.margin.left + this.margin.right - 10)
            .tickFormat("")
          );
    
        // Update X Axis 
        this.svg.selectAll(".x-axis").transition().duration(this.speed)
          .call(d3.axisBottom(this.x).tickSizeOuter(0)).selectAll("text")
          .attr("y", "3")
          .attr("x", "-5")
          .attr("font-size", "14px")
          .attr("text-anchor", "end")
          .attr("transform", "rotate(-55)");
    */
    // Text above each bar  
    let text = this.g1.selectAll(".text")
      .data(data, d => d[this.xColumn]);

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
      .attr("y", this.x.bandwidth() / 2 + 3)
      .attr("x", 30)
      .attr("fill", this.currParameter["color"])
      .text(d => d[this.currParameter[this.key]].toLocaleString());
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
}
