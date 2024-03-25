import {ActionReducerMap, createSelector} from '@ngrx/store';
import {ExperimentCompareDetailsState, experimentsCompareDetailsReducer} from './experiments-compare-details.reducer';
import {
  ExperimentCompareSettings,
  experimentsCompareChartsReducer,
  GroupedHyperParams,
  IExperimentCompareChartsState,
  MetricOption
} from './experiments-compare-charts.reducer';
import {
  experimentsCompareMetricsValuesReducer,
  IExperimentCompareMetricsValuesState,
  MetricSortBy
} from './experiments-compare-metrics-values.reducer';
import {compareHeader, CompareHeaderState} from './compare-header.reducer';
import {IExperimentDetail} from '~/features/experiments-compare/experiments-compare-models';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {scalarsGraphReducer, ScalarsGraphState} from './experiments-compare-scalars-graph.reducer';
import {ExperimentParams, ModelDetail} from '../shared/experiments-compare-details.model';
import {CompareParamsState, experimentsCompareParamsReducer} from './experiments-compare-params.reducer';
import {groupByCharts, GroupByCharts} from '../../experiments/reducers/experiment-output.reducer';
import {selectSelectedProjectId} from '../../core/reducers/projects.reducer';
import {selectRouterConfig} from '../../core/reducers/router-reducer';
import {ChartHoverModeEnum} from '@common/experiments/shared/common-experiments.const';

export const experimentsCompareReducers: ActionReducerMap<any, any> = {
  details: experimentsCompareDetailsReducer,
  params: experimentsCompareParamsReducer,
  metricsValues: experimentsCompareMetricsValuesReducer,
  charts: experimentsCompareChartsReducer,
  compareHeader,
  scalarsGraph: scalarsGraphReducer
};

export const experimentsCompare = state => state.experimentsCompare;

// Details
export const experimentsDetails = createSelector(experimentsCompare, (state): ExperimentCompareDetailsState => state ? state.details : {});
export const selectExperimentsDetails = createSelector(experimentsDetails, (state): Array<IExperimentDetail> => state.experiments);
export const selectModelsDetails = createSelector(experimentsDetails, (state): Array<ModelDetail> => state.models);
export const selectExperimentIdsDetails = createSelector(selectExperimentsDetails,
  (experiments): Array<IExperimentDetail['id']> => experiments.map(exp => exp.id));
export const selectModelIdsDetails = createSelector(selectModelsDetails,
  (models): Array<ModelDetail['id']> => models.map(model => model.id));

// Params
export const experimentsParams = createSelector(experimentsCompare, (state): CompareParamsState => state ? state.params : {});
export const selectExperimentsParams = createSelector(experimentsParams, (state): Array<ExperimentParams> => state.experiments);
export const selectExperimentIdsParams = createSelector(selectExperimentsParams,
  (experiments): Array<IExperimentDetail['id']> => experiments.map(exp => exp.id));


// select experiments for compare and header
export const selectCompareHeader = createSelector(experimentsCompare, state => (state?.compareHeader ?? {}) as CompareHeaderState);
export const selectIsCompare = createSelector(selectRouterConfig, (config): boolean => config?.includes('compare-experiments'));
// export const selectIsSelectModel = createSelector(selectRouterConfig, (config): boolean => config?.includes('compare-models') || config?.includes('input-model'));
export const selectIsModels = createSelector(selectRouterConfig, (config): boolean => config?.includes('models'));
export const selectIsPipelines = createSelector(selectRouterConfig, (config): boolean => config?.[0] === 'pipelines');
export const selectIsDatasets = createSelector(selectRouterConfig, (config): boolean => config?.[0] === 'datasets');
// export const selectSelectedFeature = createSelector(selectRouterConfig, (config): string => config?.[0]);
// export const selectCustomProject = createSelector(selectRouterConfig, (config): boolean => ['pipelines', 'datasets'].includes(config?.[0]));

export const selectCompareAddTableSortFields = createSelector(selectCompareHeader, selectSelectedProjectId,
  (state, projectId) => state.projectColumnsSortOrder?.[projectId] || null);
export const selectCompareAddTableFilters = createSelector(selectCompareHeader, selectSelectedProjectId,
  (state, projectId) => state.projectColumnFilters?.[projectId] || {});
export const selectSelectedExperimentsForCompareAdd = createSelector(selectCompareHeader, state => state?.searchResultsExperiments);
export const selectExperimentsForCompareSearchTerm = createSelector(selectCompareHeader, state => state?.searchTerm);
// export const selectShowAddExperimentsForCompare = createSelector(selectCompareHeader, state => state?.showSearch);
export const selectHideIdenticalFields = createSelector(selectCompareHeader, state => state?.hideIdenticalRows);
export const selectShowRowExtremes = createSelector(selectCompareHeader, state => state?.showRowExtremes);
export const selectShowGlobalLegend = createSelector(selectCompareHeader, state => state?.showGlobalLegend);
// export const selectShowScalarsOptions = createSelector(selectCompareHeader, state => state?.showScalarOptions);
export const selectExperimentsUpdateTime = createSelector(selectCompareHeader, state => state ? state.experimentsUpdateTime : {});
export const selectViewArchivedInAddTable = createSelector(selectCompareHeader, state => state?.viewArchived);
export const selectExportTable = createSelector(selectCompareHeader, state => state?.exportTable);

// Metric Values
export const compareMetricsValues = createSelector(experimentsCompare, (state): IExperimentCompareMetricsValuesState => state ? state.metricsValues : {});
export const selectCompareMetricsValuesExperiments = createSelector(compareMetricsValues, state => state.experiments);
export const selectCompareMetricsValuesSortConfig = createSelector(compareMetricsValues, (state): MetricSortBy => state.metricSortBy);

// Charts
export const compareCharts = createSelector(experimentsCompare, (state): IExperimentCompareChartsState => state ? state.charts : {});
export const selectSelectedExperiments = createSelector(compareCharts, (state): Array<string> => state ? state.selectedExperiments : []);
export const selectGlobalLegendData = createSelector(compareCharts, state => state.globalLegendData);
export const selectCompareHistogramCacheAxisType = createSelector(compareCharts, state => state.cachedAxisType);
export const selectCompareTasksPlotCharts = createSelector(compareCharts, state => state.metricsPlotsCharts);
export const selectMultiSingleValues = createSelector(compareCharts, state => state.multiSingleValues);

export const selectScalarsHoverMode = createSelector(compareCharts, (state): ChartHoverModeEnum => state.scalarsHoverMode);

export const selectSelectedExperimentSettings = createSelector(compareCharts, selectSelectedExperiments,
  (output, currentExperiments): ExperimentCompareSettings => output.settingsList?.find(setting => setting?.id?.join() === currentExperiments?.join()));

export const selectSelectedSettingsHyperParams = createSelector(selectSelectedExperimentSettings,
  (settings): Array<string> => settings?.selectedHyperParams || []);

export const selectSelectedSettingsMetric = createSelector(selectSelectedExperimentSettings,
  (settings) => settings?.selectedMetric || null);

export const selectSelectedSettingsValueType = createSelector(selectSelectedExperimentSettings,
  (settings) => settings?.valueType || 'value');

export const selectSelectedSettingsHiddenScalar = createSelector(selectSelectedExperimentSettings,
  (settings): Array<string> => settings?.hiddenMetricsScalar || []);

export const selectSelectedSettingsHiddenPlot = createSelector(selectSelectedExperimentSettings,
  (settings): Array<string> => settings?.hiddenMetricsPlot || []);

export const selectSelectedMetricsSettingsScalar = createSelector(selectSelectedExperimentSettings,
  (settings): Array<string> => settings?.selectedMetricsScalar || []);

export const selectSelectedMetricsSettingsPlot = createSelector(selectSelectedExperimentSettings,
  (settings): Array<string> => settings?.selectedMetricsPlot);


export const selectExperimentMetricsSearchTerm = createSelector(compareCharts, (state) => state.searchTerm);

export const selectCompareSelectedSettingsxAxisType = createSelector(selectSelectedExperimentSettings,
  settings => settings?.xAxisType ?? ScalarKeyEnum.Iter as ScalarKeyEnum);

export const selectCompareSelectedSettingsGroupBy = createSelector(selectSelectedExperimentSettings,
  (settings): GroupByCharts => settings?.groupBy || groupByCharts.none);

export const selectViewMode = (page: string) => createSelector(experimentsParams , state => state.viewMode[page]);

export const selectScalarsGraph = createSelector(experimentsCompare, (state): ScalarsGraphState => state?.scalarsGraph ?? {});
export const selectScalarsGraphShowIdenticalHyperParams = createSelector(selectScalarsGraph, (state): boolean => state ? state.showIdenticalHyperParams : true);
export const selectScalarsGraphMetrics = createSelector(selectScalarsGraph, (state): MetricOption[] => state.metrics);
export const selectScalarsGraphHyperParams = createSelector(selectScalarsGraph, (state): GroupedHyperParams => state ? state.hyperParams : {});
export const selectScalarsGraphTasks = createSelector(selectScalarsGraph, (state): any[] => state ? state.tasks : []);

export const selectCompareTasksScalarCharts = createSelector(
  selectCompareHistogramCacheAxisType,
  compareCharts,
  (axisType, state) => {
    if (state?.metricsHistogramCharts?.metrics && (!axisType || axisType === ScalarKeyEnum.IsoTime)) {
      return {
        metrics: Object.keys(state.metricsHistogramCharts.metrics).reduce((metricAcc, metricName) => {
          const metric = state.metricsHistogramCharts.metrics[metricName];
          metricAcc[metricName] = Object.keys(metric).reduce((groupAcc, groupName) => {
            const group = metric[groupName];
            groupAcc[groupName] = Object.keys(group).reduce((graphAcc, graphName) => {
              const graph = group[graphName];
              graphAcc[graphName] = {...graph, x: graph.x.map(ts => new Date(ts))};
              return graphAcc;
            }, {});
            return groupAcc;
          }, {});
          return metricAcc;
        }, {})
      };
    }
    return state.metricsHistogramCharts;
  });
