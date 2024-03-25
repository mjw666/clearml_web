import {InjectionToken, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExperimentConverterService} from './services/experiment-converter.service';
import { ExperimentMenuComponent } from '@common/experiments/shared/components/experiment-menu/experiment-menu.component';
import {ExperimentMenuExtendedComponent} from '../containers/experiment-menu-extended/experiment-menu-extended.component';
import {ExperimentHeaderComponent} from '@common/experiments/dumb/experiment-header/experiment-header.component';
import {SelectHyperParamsForCustomColComponent} from '@common/experiments/dumb/select-hyper-params-for-custom-col/select-hyper-params-for-custom-col.component';
import {ExperimentExecutionParametersComponent} from '@common/experiments/dumb/experiment-execution-parameters/experiment-execution-parameters.component';
import {CloneDialogComponent} from '@common/experiments/shared/components/clone-dialog/clone-dialog.component';
import {ExperimentSystemTagsComponent} from '@common/experiments/shared/components/experiments-system-tags/experiment-system-tags.component';
import {AbortAllChildrenDialogComponent} from '@common/experiments/shared/components/abort-all-children-dialog/abort-all-children-dialog.component';
import {ExperimentsTableComponent} from '@common/experiments/dumb/experiments-table/experiments-table.component';
import {ChangeProjectDialogComponent} from '@common/experiments/shared/components/change-project-dialog/change-project-dialog.component';
import {ExperimentOutputPlotsComponent} from '@common/experiments/containers/experiment-output-plots/experiment-output-plots.component';
import {ExperimentCustomColsMenuComponent} from '@common/experiments/dumb/experiment-custom-cols-menu/experiment-custom-cols-menu.component';
import {EffectsModule} from '@ngrx/effects';
import {CommonExperimentsMenuEffects} from '@common/experiments/effects/common-experiments-menu.effects';
import {CommonExperimentOutputEffects} from '@common/experiments/effects/common-experiment-output.effects';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {ExperimentsMenuEffects} from '~/features/experiments/effects/experiments-menu.effects';
import {ActionReducer, StoreConfig, StoreModule} from '@ngrx/store';
import {CommonLayoutModule} from '@common/layout/layout.module';
import {FormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {ExperimentOutputEffects} from '~/features/experiments/effects/experiment-output.effects';
import {EXPERIMENTS_PREFIX, EXPERIMENTS_STORE_KEY} from '@common/experiments/experiment.consts';
import {ExperimentCompareSharedModule} from '@common/experiments-compare/shared/experiment-compare-shared.module';
import {CommonExperimentsViewEffects} from '@common/experiments/effects/common-experiments-view.effects';
import {ExperimentGraphsModule} from '@common/shared/experiment-graphs/experiment-graphs.module';
import {CommonExperimentsInfoEffects} from '@common/experiments/effects/common-experiments-info.effects';
import {UserPreferences} from '@common/user-preferences';
import {createUserPrefFeatureReducer} from '@common/core/meta-reducers/user-pref-reducer';
import {ExperimentState} from '~/features/experiments/reducers';
import {merge, pick} from 'lodash-es';
import {EXPERIMENTS_OUTPUT_PREFIX} from '@common/experiments/actions/common-experiment-output.actions';
import {EXPERIMENTS_INFO_PREFIX} from '@common/experiments/actions/common-experiments-info.actions';
import {experimentsReducers} from '~/features/experiments/reducers';
import {CommonExperimentConverterService} from '@common/experiments/shared/services/common-experiment-converter.service';
import {HyperParamMetricColumnComponent} from '@common/experiments/shared/components/hyper-param-metric-column/hyper-param-metric-column.component';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {StringIncludedInArrayPipe} from '@common/shared/pipes/string-included-in-array.pipe';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {ReplaceViaMapPipe} from '@common/shared/pipes/replaceViaMap';
import {DurationPipe} from '@common/shared/pipes/duration.pipe';
import {MenuItemTextPipe} from '@common/shared/pipes/menu-item-text.pipe';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {UniqueNameValidatorDirective} from '@common/shared/ui-components/template-forms-ui/unique-name-validator.directive';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {CustomColumnsListComponent} from '@common/shared/components/custom-columns-list/custom-columns-list.component';
import {CheckboxControlComponent} from '@common/shared/ui-components/forms/checkbox-control/checkbox-control.component';
import {MenuComponent} from '@common/shared/ui-components/panel/menu/menu.component';
import {StatusIconLabelComponent} from '@common/shared/experiment-status-icon-label/status-icon-label.component';
import {ExperimentTypeIconLabelComponent} from '@common/shared/experiment-type-icon-label/experiment-type-icon-label.component';
import {ClearFiltersButtonComponent} from '@common/shared/components/clear-filters-button/clear-filters-button.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {MatInputModule} from '@angular/material/input';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {TagListComponent} from '@common/shared/ui-components/tags/tag-list/tag-list.component';
import {TagComponent} from '@common/shared/ui-components/indicators/tag/tag.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {TableFilterSortTemplateComponent} from '@common/shared/ui-components/data/table/table-filter-sort-template/table-filter-sort-template.component';
import {TableComponent} from '@common/shared/ui-components/data/table/table.component';
import {TableCardFilterTemplateComponent} from '@common/shared/ui-components/data/table/table-card-filter-template/table-card-filter-template.component';
import {MatSelectModule} from '@angular/material/select';
import {ButtonToggleComponent} from '@common/shared/ui-components/inputs/button-toggle/button-toggle.component';
import {GroupedCheckedFilterListComponent} from '@common/shared/ui-components/data/grouped-checked-filter-list/grouped-checked-filter-list.component';
import {SelectableFilterListComponent} from '@common/shared/ui-components/data/selectable-filter-list/selectable-filter-list.component';
import {TableCardComponent} from '@common/shared/ui-components/data/table-card/table-card.component';
import {ToggleArchiveComponent} from '@common/shared/ui-components/buttons/toggle-archive/toggle-archive.component';
import {RefreshButtonComponent} from '@common/shared/components/refresh-button/refresh-button.component';
import {TableModule} from 'primeng/table';
import {SearchTextDirective} from '@common/shared/ui-components/directives/searchText.directive';
import {ScrollEndDirective} from '@common/shared/ui-components/directives/scroll-end.directive';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {FilterPipe} from '@common/shared/pipes/filter.pipe';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';
import {MatCheckboxModule} from '@angular/material/checkbox';

export const experimentSyncedKeys = [
  'view.projectColumnsSortOrder',
  'view.projectColumnFilters',
  'view.projectColumnsWidth',
  'view.hiddenProjectTableCols',
  'view.metricsCols',
  'view.colsOrder',
  'output.scalarsHoverMode',
  'info.userKnowledge',
  'output.settingsList',
];

export const EXPERIMENT_CONFIG_TOKEN =
  new InjectionToken<StoreConfig<ExperimentState, any>>('ExperimentConfigToken');

const localStorageKey = '_saved_experiment_state_';

export const getExperimentsConfig = (userPreferences: UserPreferences) => ({
  metaReducers: [
    reducer => {
      let onInit = true;
      return (state, action) => {
        const nextState = reducer(state, action);
        if (onInit) {
          onInit = false;
          const savedState = JSON.parse(localStorage.getItem(localStorageKey));
          return merge({}, nextState, savedState);
        }
        if (action.type.startsWith(EXPERIMENTS_PREFIX)) {
          localStorage.setItem(localStorageKey, JSON.stringify(pick(nextState, ['view.tableMode', 'view.compareSelectedMetrics', 'view.compareSelectedMetricsPlots'])));
        }
        return nextState;
      };
    },
    (reducer: ActionReducer<any>) =>
      createUserPrefFeatureReducer(EXPERIMENTS_STORE_KEY, experimentSyncedKeys, [EXPERIMENTS_PREFIX, EXPERIMENTS_INFO_PREFIX, EXPERIMENTS_OUTPUT_PREFIX], userPreferences, reducer),
  ]
});
const DECLARATIONS = [
  ExperimentMenuComponent,
  ExperimentMenuExtendedComponent,
  ExperimentSystemTagsComponent,
  ChangeProjectDialogComponent,
  CloneDialogComponent,
  AbortAllChildrenDialogComponent,
  ExperimentExecutionParametersComponent,
  ExperimentsTableComponent,
  ExperimentHeaderComponent,
  ExperimentCustomColsMenuComponent,
  SelectHyperParamsForCustomColComponent,
  ExperimentOutputPlotsComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    StoreModule.forFeature(EXPERIMENTS_STORE_KEY, experimentsReducers, EXPERIMENT_CONFIG_TOKEN),
    EffectsModule.forFeature([
      ExperimentOutputEffects, ExperimentsMenuEffects,
      CommonExperimentsViewEffects,
      CommonExperimentsInfoEffects,
      CommonExperimentOutputEffects,
      CommonExperimentsMenuEffects
    ]),
    ExperimentCompareSharedModule,
    ExperimentGraphsModule,
    MatProgressSpinnerModule,
    ScrollingModule,
    CommonLayoutModule,
    HyperParamMetricColumnComponent,
    LabeledFormFieldDirective,
    StringIncludedInArrayPipe,
    TimeAgoPipe,
    ReplaceViaMapPipe,
    DurationPipe,
    MenuItemTextPipe,
    MenuItemComponent,
    UniqueNameValidatorDirective,
    TagsMenuComponent,
    CustomColumnsListComponent,
    CheckboxControlComponent,
    MenuComponent,
    StatusIconLabelComponent,
    ExperimentTypeIconLabelComponent,
    ClearFiltersButtonComponent,
    MatAutocompleteModule,
    MatInputModule,
    TooltipDirective,
    DialogTemplateComponent,
    TagListComponent,
    TagComponent,
    MatMenuModule,
    MatSidenavModule,
    TableFilterSortTemplateComponent,
    TableComponent,
    TableCardFilterTemplateComponent,
    MatSelectModule,
    ButtonToggleComponent,
    GroupedCheckedFilterListComponent,
    SelectableFilterListComponent,
    TableCardComponent,
    ToggleArchiveComponent,
    RefreshButtonComponent,
    TableModule,
    SearchTextDirective,
    ScrollEndDirective,
    ClickStopPropagationDirective,
    FilterPipe,
    ShowTooltipIfEllipsisDirective,
    MatCheckboxModule,
  ],
  declarations   : [...DECLARATIONS],
  providers      : [
    ExperimentConverterService,
    CommonExperimentConverterService,
    {provide: EXPERIMENT_CONFIG_TOKEN, useFactory: getExperimentsConfig, deps: [UserPreferences]},
  ],
  exports        : [...DECLARATIONS]
})
export class ExperimentSharedModule {
}
