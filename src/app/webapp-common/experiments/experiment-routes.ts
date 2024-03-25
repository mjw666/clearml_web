import {Routes} from '@angular/router';
import {ExperimentsComponent} from '@common/experiments/experiments.component';
import {ExperimentInfoExecutionComponent} from './containers/experiment-info-execution/experiment-info-execution.component';
import {leavingBeforeSaveAlertGuard} from '../shared/guards/leaving-before-save-alert.guard';
import {ExperimentInfoArtifactsComponent} from './containers/experiment-info-aritfacts/experiment-info-artifacts.component';
import {ExperimentInfoModelComponent} from './containers/experiment-info-model/experiment-info-model.component';
import {ExperimentInfoArtifactItemComponent} from './containers/experiment-info-artifact-item/experiment-info-artifact-item.component';
import {ExperimentInfoHyperParametersComponent} from './containers/experiment-info-hyper-parameters/experiment-info-hyper-parameters.component';
import {ExperimentInfoTaskModelComponent} from './containers/experiment-info-task-model/experiment-info-task-model.component';
import {ExperimentInfoHyperParametersFormContainerComponent} from './containers/experiment-info-hyper-parameters-form-container/experiment-info-hyper-parameters-form-container.component';
import {ExperimentInfoGeneralComponent} from './containers/experiment-info-general/experiment-info-general.component';
import {ExperimentOutputComponent} from '~/features/experiments/containers/experiment-ouptut/experiment-output.component';
import {ExperimentOutputScalarsComponent} from './containers/experiment-output-scalars/experiment-output-scalars.component';
import {ExperimentOutputPlotsComponent} from './containers/experiment-output-plots/experiment-output-plots.component';
import {DebugImagesComponent} from '../debug-images/debug-images.component';
import {ExperimentOutputLogComponent} from './containers/experiment-output-log/experiment-output-log.component';
import {selectIsExperimentInEditMode} from '@common/experiments/reducers';
import {ExperimentCompareScalarChartsComponent} from '@common/experiments-compare/containers/experiment-compare-metric-charts/experiment-compare-scalar-charts.component';
import {COMPARE_CONFIG_TOKEN, COMPARE_STORE_KEY, getCompareConfig} from '@common/experiments-compare/experiments-compare.module';
import {UserPreferences} from '@common/user-preferences';
import {ExperimentComparePlotsComponent} from '@common/experiments-compare/containers/experiment-compare-plots/experiment-compare-plots.component';
import {importProvidersFrom} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {experimentsCompareReducers} from '@common/experiments-compare/reducers';

export const routes: Routes = [
  {
    path: '',
    component: ExperimentsComponent,
    children: [
      {
        path: ':experimentId', component: ExperimentOutputComponent,
        children: [
          {path: '', redirectTo: 'execution', pathMatch: 'full'},
          {
            path: 'execution',
            component: ExperimentInfoExecutionComponent,
            canDeactivate: [leavingBeforeSaveAlertGuard(selectIsExperimentInEditMode)],
            data: {minimized: true}
          },
          {
            path: 'artifacts',
            component: ExperimentInfoArtifactsComponent,
            canDeactivate: [leavingBeforeSaveAlertGuard(selectIsExperimentInEditMode)],
            data     : {minimized: true},
            children: [
              {path: '', redirectTo: 'input-model', pathMatch: 'full'},
              {path: 'input-model/:modelId', component: ExperimentInfoModelComponent, data: {outputModel: false}},
              {path: 'output-model/:modelId', component: ExperimentInfoModelComponent , data: {outputModel: true}},
              {
                path: 'artifact/:artifactId',
                children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]
              },
              {path: 'other/:artifactId', children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]}
            ]
          },
          {
            path: 'hyper-params',
            component: ExperimentInfoHyperParametersComponent,
            canDeactivate: [leavingBeforeSaveAlertGuard(selectIsExperimentInEditMode)],
            data     : {minimized: true},
            children: [
              {path: 'configuration/:configObject', component: ExperimentInfoTaskModelComponent},
              {path: 'hyper-param/:hyperParamId', component: ExperimentInfoHyperParametersFormContainerComponent}
            ]
          },
          {path: 'general', component: ExperimentInfoGeneralComponent, data: {minimized: true}},
          {
            path: 'info-output',
            data: {minimized: true},
            children: [
              {path: 'metrics/scalar', component: ExperimentOutputScalarsComponent, data: {minimized: true}},
              {path: 'metrics/plots', component: ExperimentOutputPlotsComponent, data: {minimized: true}},
              {path: 'debugImages', component: DebugImagesComponent, data: {minimized: true}},
              {path: 'log', component: ExperimentOutputLogComponent, data: {minimized: true}},
              {path: '', redirectTo: 'log', pathMatch: 'full'}
            ]
          }
        ]
      },
      {
        path: 'compare/scalars',
        component: ExperimentCompareScalarChartsComponent,
        data: {minimized: true},
        providers: [
          {provide: COMPARE_CONFIG_TOKEN, useFactory: getCompareConfig, deps: [UserPreferences]},
          importProvidersFrom(
            StoreModule.forFeature(COMPARE_STORE_KEY, experimentsCompareReducers, COMPARE_CONFIG_TOKEN),
          ),
        ],
      },
      {
        path: 'compare/plots',
        component: ExperimentComparePlotsComponent,
        data: {minimized: true},
        providers: [
          {provide: COMPARE_CONFIG_TOKEN, useFactory: getCompareConfig, deps: [UserPreferences]},
        ],
      }
    ]
  },

  {
    path: ':experimentId/output',
    component: ExperimentOutputComponent,
    data: {search: false},
    children: [
      {path: '', redirectTo: 'execution', pathMatch: 'full'},
      {path: 'execution',
        component: ExperimentInfoExecutionComponent,
        canDeactivate: [leavingBeforeSaveAlertGuard(selectIsExperimentInEditMode)]
      },
      {
        path: 'hyper-params',
        component: ExperimentInfoHyperParametersComponent,
        data: {},
        canDeactivate: [leavingBeforeSaveAlertGuard(selectIsExperimentInEditMode)],
        children: [
          {path: 'configuration/:configObject', component: ExperimentInfoTaskModelComponent},
          {path: 'hyper-param/:hyperParamId', component: ExperimentInfoHyperParametersFormContainerComponent}
        ]
      },
      {
        path: 'artifacts',
        component: ExperimentInfoArtifactsComponent,
        data: {},
        canDeactivate: [leavingBeforeSaveAlertGuard(selectIsExperimentInEditMode)],
        children: [
          {path: '', redirectTo: 'input-model', pathMatch: 'full'},
          {path: 'input-model/:modelId', component: ExperimentInfoModelComponent , data: {outputModel: false}},
          {path: 'output-model/:modelId', component: ExperimentInfoModelComponent , data: {outputModel: true}},
          {path: 'artifact/:artifactId', children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]},
          {path: 'other/:artifactId', children: [{path: ':mode', component: ExperimentInfoArtifactItemComponent}]}
        ]
      },
      {path: 'general', component: ExperimentInfoGeneralComponent, data: {}},
      {path: 'metrics/scalar', component: ExperimentOutputScalarsComponent, data: {}},
      {path: 'metrics/plots', component: ExperimentOutputPlotsComponent, data: {}},
      {path: 'debugImages', component: DebugImagesComponent},
      {path: 'log', component: ExperimentOutputLogComponent},
    ]
  },
];
