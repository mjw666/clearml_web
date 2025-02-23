import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {SingleGraphComponent} from '@common/shared/single-graph/single-graph.component';
import {GraphViewerComponent} from '@common/shared/single-graph/graph-viewer/graph-viewer.component';
import {singleGraphReducer} from '@common/shared/single-graph/single-graph.reducer';
import { SingleGraphEffects } from './single-graph.effects';
import {MatSliderModule} from '@angular/material/slider';
import {MatSelectModule} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {ChooseColorModule} from '@common/shared/ui-components/directives/choose-color/choose-color.module';



@NgModule({
  declarations: [SingleGraphComponent, GraphViewerComponent],
  exports: [SingleGraphComponent, GraphViewerComponent],
  imports: [
    CommonModule,
    StoreModule.forFeature('singleGraph', singleGraphReducer),
    EffectsModule.forFeature([SingleGraphEffects]),
    MatSliderModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    TooltipDirective,
    MatProgressSpinnerModule,
    TagListComponent,
    ChooseColorModule,
  ]
})
export class SingleGraphModule { }
