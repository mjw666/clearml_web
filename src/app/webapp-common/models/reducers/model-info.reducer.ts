import {
  modelExperimentsTableFilterChanged,
  modelsExperimentsTableClearAllFilters,
  activateModelEdit, cancelModelEdit,
  editModel,
  modelDetailsUpdated,
  resetActiveSection,
  setSavingModel,
  setModelInfo, setPlots, saveMetaData
} from '../actions/models-info.actions';
import {TableModel} from '../shared/models.model';
import {cloneDeep} from 'lodash-es';
import {ITableExperiment} from '@common/experiments/shared/common-experiment-model.model';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {createReducer, on} from '@ngrx/store';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {MetricsPlotEvent} from '~/business-logic/model/events/metricsPlotEvent';
import {modelSelectionChanged} from '@common/models/actions/models-view.actions';

export interface ModelInfoState {
  selectedModel: TableModel;
  activeSectionEdit: boolean;
  infoDataFreeze: TableModel;
  saving: boolean;
  modelExperiments: ITableExperiment[];
  modelExperimentsTableFilter: { [columnId: string]: FilterMetadata };
  xAxisType: ScalarKeyEnum;
  cachedAxisType: ScalarKeyEnum;
  plots: MetricsPlotEvent[];
}

const initialState: ModelInfoState = {
  selectedModel: null,
  activeSectionEdit: null,
  infoDataFreeze: null,
  saving: false,
  modelExperiments: null,
  modelExperimentsTableFilter: {},
  xAxisType: ScalarKeyEnum.Timestamp,
  cachedAxisType: null,
  plots: null
};

export const modelsInfoReducer = createReducer(
  initialState,
  on(setModelInfo, (state, action): ModelInfoState => ({
    ...state,
    selectedModel: action.model as TableModel,
    infoDataFreeze: initialState.infoDataFreeze
  })),
  on(modelDetailsUpdated, (state, action): ModelInfoState => ({
    ...state,
    selectedModel: {...state.selectedModel, ...action.changes},
    infoDataFreeze: initialState.infoDataFreeze
  })),
  on(activateModelEdit, (state): ModelInfoState =>
    ({...state, activeSectionEdit: true, infoDataFreeze: state.selectedModel})),
  on(cancelModelEdit, (state): ModelInfoState => ({
    ...state,
    selectedModel: state.infoDataFreeze ? cloneDeep(state.infoDataFreeze) : state.selectedModel,
    activeSectionEdit: null
  })),
  on(setSavingModel, (state, action): ModelInfoState => ({...state, saving: action.saving})),
  on(saveMetaData, (state): ModelInfoState => ({...state, saving: true})),
  on(editModel, (state): ModelInfoState => ({...state, activeSectionEdit: null})),
  on(resetActiveSection, (state): ModelInfoState => ({...state, activeSectionEdit: null})),
  on(setPlots, (state, action): ModelInfoState => ({...state, plots: action.plots})),
  on(modelSelectionChanged, (state, ): ModelInfoState => ({...state, selectedModel: initialState.selectedModel })),
  on(modelExperimentsTableFilterChanged, (state, action): ModelInfoState => ({
    ...state,
    modelExperimentsTableFilter: {
      ...state.modelExperimentsTableFilter,
      [action.filter.col]: {value: action.filter.value, matchMode: action.filter.filterMatchMode}
    }
  })),
  on(modelsExperimentsTableClearAllFilters, (state): ModelInfoState =>
    ({...state, modelExperimentsTableFilter: initialState.modelExperimentsTableFilter,})
  )
);

