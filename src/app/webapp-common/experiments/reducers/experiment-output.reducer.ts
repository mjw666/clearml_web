import * as actions from '../actions/common-experiment-output.actions';
import {HistogramCharts} from '../actions/common-experiment-output.actions';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {sortBy} from 'lodash-es';
import {LOG_BATCH_SIZE} from '../shared/common-experiments.const';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {EventsGetTaskSingleValueMetricsResponseValues} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseValues';
import {createReducer, on} from '@ngrx/store';
import {SmoothTypeEnum} from '@common/shared/single-graph/single-graph.utils';


export type GroupByCharts = 'metric' | 'none';

export const groupByCharts = {
  metric: 'metric' as GroupByCharts,
  none: 'none' as GroupByCharts
};

export interface Log {
  timestamp: number;
  type: 'log';
  task: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  worker: string;
  msg: string;
  metric: string;
  variant: string;
}

export interface ExperimentOutputState {
  metricsMultiScalarsCharts: any;
  metricsHistogramCharts: HistogramCharts;
  cachedAxisType: ScalarKeyEnum;
  metricsPlotsCharts: MetricsPlotEvent[];
  experimentLog: Log[];
  totalLogLines: number;
  beginningOfLog: boolean;
  settingsList: Array<ExperimentSettings>;
  searchTerm: string;
  logFilter: string;
  logLoading: boolean;
  showSettings: boolean;
  scalarSingleValue: Array<EventsGetTaskSingleValueMetricsResponseValues>;
  graphsPerRow: number;
}

export interface ExperimentSettings {
  id: string;
  hiddenMetricsScalar: Array<string>;
  hiddenMetricsPlot: Array<string>;
  selectedMetricsScalar: Array<string>;
  selectedMetricsPlot: Array<string>;
  selectedHyperParams: Array<string>;
  selectedMetric: string;
  smoothWeight: number;
  smoothType: SmoothTypeEnum;
  xAxisType: ScalarKeyEnum;
  groupBy: GroupByCharts;
  lastModified?: number;
  valueType?: "min_value" | "max_value" | "value"
}

export const experimentOutputInitState: ExperimentOutputState = {
  metricsMultiScalarsCharts: null,
  metricsHistogramCharts: null,
  cachedAxisType: null,
  metricsPlotsCharts: null,
  experimentLog: null,
  totalLogLines: null,
  beginningOfLog: false,
  settingsList: [],
  scalarSingleValue:[],
  searchTerm: '',
  logFilter: null,
  logLoading: false,
  showSettings: false,
  graphsPerRow: 2
};

export const experimentOutputReducer = createReducer(
  experimentOutputInitState,
  on(actions.resetOutput, state  => ({
    ...state,
    experimentLog: experimentOutputInitState.experimentLog,
    metricsMultiScalarsCharts: experimentOutputInitState.metricsMultiScalarsCharts,
    metricsHistogramCharts: experimentOutputInitState.metricsHistogramCharts,
    metricsPlotsCharts: experimentOutputInitState.metricsPlotsCharts
  })),
  on(actions.getExperimentLog, (state, action) => ({...state, logLoading: !action.autoRefresh})),
  on(actions.setExperimentLogLoading, (state, action) => ({...state, logLoading: action.loading})),
  on(actions.setExperimentLog, (state, action) => {
    const events = Array.from(action?.events || []).reverse();
    let currLog: any[];
    let atStart = false;
    if (action.direction) {
      if (action.refresh) {
        currLog = events;
      } else if (action.direction === 'prev') {
        if (action.events?.length < LOG_BATCH_SIZE) {
          atStart = true;
        }
        currLog = sortBy(events.concat(state.experimentLog), 'timestamp');
        if (currLog.length > 300) {
          currLog = currLog.slice(0, 300);
        }
      } else {
        currLog = sortBy( state.experimentLog?.concat(events), 'timestamp');
        if (currLog.length > 300) {
          currLog = currLog.slice(currLog.length - 300, currLog.length);
        }
      }
    } else {
      currLog = events;
    }
    return {
      ...state,
      experimentLog: currLog,
      totalLogLines: action.total,
      beginningOfLog: atStart,
      logLoading: false
    };
  }),
  on(actions.setExperimentLogAtStart, (state, action) => ({...state, beginningOfLog: action.atStart, logLoading: false})),
  on(actions.setExperimentMetricsSearchTerm, (state, action) => ({...state, searchTerm: action.searchTerm})),
  on(actions.setHistogram, (state, action) => ({...state, metricsHistogramCharts: action.histogram, cachedAxisType: action.axisType})),
  on(actions.setExperimentPlots, (state, action) => ({...state, metricsPlotsCharts: action.plots})),
  on(actions.setExperimentScalarSingleValue, (state, action) => ({...state, scalarSingleValue: action.values})),
  on(actions.setExperimentSettings, (state, action) => {
    let newSettings: ExperimentSettings[];
    const changes = {...action.changes, lastModified: (new Date()).getTime()} as ExperimentSettings;
    const experimentExists = state.settingsList.find(setting => setting.id === action.id);
    const discardBefore = new Date();
    discardBefore.setMonth(discardBefore.getMonth() - 2);
    if (experimentExists) {
      newSettings = state.settingsList
        .filter(setting => discardBefore < new Date(setting.lastModified || 1648771200000))
        .map(setting => setting.id === action.id ? {...setting, ...changes} : setting);
    } else {
      newSettings = [
        ...state.settingsList.filter(setting => discardBefore < new Date(setting.lastModified || 1648771200000)),
        {id: action.id, ...changes}
      ];
    }
    return {...state, settingsList: newSettings};
  }),
  on(actions.resetExperimentMetrics, state => ({
    ...state,
    metricsMultiScalarsCharts: experimentOutputInitState.metricsMultiScalarsCharts,
    metricsHistogramCharts: experimentOutputInitState.metricsHistogramCharts,
    metricsPlotsCharts: experimentOutputInitState.metricsPlotsCharts,
    cachedAxisType: experimentOutputInitState.cachedAxisType,
    searchTerm: ''
  })),
  on(actions.setLogFilter, (state, action) => ({...state, logFilter: (action as ReturnType<typeof actions.setLogFilter>).filter})),
  on(actions.resetLogFilter, state => ({...state, logFilter: null})),
  on(actions.toggleSettings, state => ({...state, showSettings: !state.showSettings})),
  on(actions.setGraphsPerRow, (state, action) => ({...state, graphsPerRow: action.graphsPerRow})),
);
