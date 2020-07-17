import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MapComponent } from "./components/map/map.component"
import { TableComponent } from "./components/table/table.component"
import { CardComponent } from "./components/card/card.component"
import { CardChartComponent } from "./components/card/card-chart/card-chart.component"
import { BarChartComponent } from "./components/bar-chart/bar-chart.component"
import { PieChartComponent } from "./components/pie-chart/pie-chart.component"


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
    ],

    declarations: [
        MapComponent,
        CardComponent,
        CardChartComponent,
        TableComponent,
        BarChartComponent,
        PieChartComponent
    ],
    exports: [
        MapComponent,
        CardComponent,
        CardChartComponent,
        TableComponent,
        BarChartComponent,
        PieChartComponent
    ],

})

export class SharedComponentModule { }