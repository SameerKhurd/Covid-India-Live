import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  @Input() public dataService: any;
  public dataParameters: any;
  //public tableParameters: any;
  public mainParameter: any;

  public categories: any;
  public currCategoryIndex: number;

  public regionWiseData: any;

  public sortKey: string;
  public sortAscending: boolean;

  constructor() { }

  ngOnInit() {
    console.log("[Table : Init]")
    this.mainParameter = this.dataService.getMainParameter();
    this.dataParameters = this.dataService.getDataParameters();
    this.createCategories();
    /*this.tableParameters = this.dataParameters.filter(d => d.tableDisplay);

    for (let parameter of this.tableParameters) {
      let c = parameter.color.substring(1).split('');
      c = '0x' + c.join('');
      parameter["backgroundColor"] = 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.2)';
    };*/

    this.dataService.getDataListener().subscribe(data => {
      this.onDataRecevied(data);
    });
    this.onDataRecevied(this.dataService.getProcessedData());
  }

  createCategories() {
    this.categories = [
      {
        name: "Overall",
        sortKeyName: "totalKey",
        showToday: true,
        tableParameters: this.dataParameters.filter(d => d.category == "General")
      },
      {
        name: "Today's",
        sortKeyName: "todayKey",
        showToday: false,
        tableParameters: this.dataParameters.filter(d => d.cardDisplay)
      },
      {
        name: "Percentage-wise",
        sortKeyName: "totalKey",
        showToday: false,
        tableParameters: this.dataParameters.filter(d => d.category == "Percentage")
      },
    ]
    this.currCategoryIndex = 0;

    for (let category of this.categories) {
      for (let parameter of category.tableParameters) {
        let c = parameter.color.substring(1).split('');
        c = '0x' + c.join('');
        parameter["backgroundColor"] = 'rgba(' + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',') + ',0.2)';
      };
    }
  }

  onGranularityChange(currCategoryIndex) {
    this.currCategoryIndex = currCategoryIndex;
    this.resetParameters();
  }

  onDataRecevied(data) {
    if (!data) return;
    this.currCategoryIndex = 0;
    this.regionWiseData = data.regionWiseData;
    this.resetParameters();
  }

  resetParameters() {
    this.sortAscending = true;
    this.sortKey = this.categories[this.currCategoryIndex].tableParameters[0][this.categories[this.currCategoryIndex].sortKeyName];
    this.sortData();
  }

  onTap(sortKey) {
    if (this.sortKey == sortKey)
      this.sortAscending = !this.sortAscending;
    else
      this.sortAscending = true;

    this.sortKey = sortKey;
    this.sortData();
  }

  sortData() {
    let key = this.sortKey;
    let sortAscending = this.sortAscending;
    this.regionWiseData.sort(function (a, b) {
      return sortAscending ? (b[key] < a[key] ? -1 : b[key] > a[key] ? 1 : 0) : (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0);
    })
  }
}
