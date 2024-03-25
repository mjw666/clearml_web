import {createReducer, on} from '@ngrx/store';
import {ISmCol, TABLE_SORT_ORDER} from '../../shared/ui-components/data/table/table.consts';
import * as actions from '../actions/models-view.actions';
import {TableModel, SelectedModel} from '../shared/models.model';
import {MODELS_TABLE_COL_FIELDS} from '../shared/models.const';
import {TableFilter} from '../../shared/utils/tableParamEncode';
import {SearchState} from '../../common-search/common-search.reducer';
import {SortMeta} from 'primeng/api';
import {CountAvailableAndIsDisableSelectedFiltered} from '@common/shared/entity-page/items.utils';
import {setSelectedProject} from '@common/core/actions/projects.actions';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {FilterMetadata} from 'primeng/api/filtermetadata';

export interface ModelsViewState {
  splitSize: number;
  models: TableModel[];
  tableFilters: { [s: string]: FilterMetadata };
  tempFilters: { [columnId: string]: FilterMetadata};
  projectColumnFilters: { [projectId: string]: {[columnId: string]: FilterMetadata} };
  colsOrder: { [Project: string]: string[] };
  tableSortFields: SortMeta[];
  projectColumnsSortOrder: { [projectId: string]: SortMeta[] };
  projectColumnsWidth: { [projectId: string]: { [colId: string]: number } };
  hiddenTableCols: { [colName: string]: boolean };
  hiddenProjectTableCols: { [projectId: string]: { [colName: string]: boolean | undefined } };
  selectedModels: TableModel[]; // TODO: declare type.
  selectedModel: SelectedModel;
  noMoreModels: boolean;
  selectedModelSource: string;
  modelToken: string;
  scrollId: string;
  globalFilter: SearchState['searchQuery'];
  showAllSelectedIsActive: boolean;
  frameworks: string[];
  projectTags: string[];
  projectMetadataKeys: string[];
  metadataCols: ISmCol[];
  metadataColsOptions: Record<ISmCol['id'], string[]>;
  metricsCols: ISmCol[];
  metricVariants: Array<MetricVariantResult>;
  selectedModelsDisableAvailable: Record<string, CountAvailableAndIsDisableSelectedFiltered>;
  tableMode: 'info' | 'table';
}

export const modelsInitialState: ModelsViewState = {
  splitSize: 65,
  models: null,
  frameworks: [],
  hiddenTableCols: {comment: true, id: true},
  hiddenProjectTableCols: {},
  tableFilters: {},
  tempFilters: {},
  projectColumnFilters: {},
  tableSortFields: [{field: MODELS_TABLE_COL_FIELDS.CREATED, order: TABLE_SORT_ORDER.DESC}],
  projectColumnsSortOrder: {},
  projectColumnsWidth: {},
  projectMetadataKeys: null,
  metadataCols: [],
  metricsCols: [],
  metricVariants: null,
  colsOrder: {},
  selectedModels: [],
  selectedModelsDisableAvailable: {},
  selectedModel: null,
  noMoreModels: false,
  selectedModelSource: null,
  modelToken: null,
  scrollId: null,
  globalFilter: null,
  showAllSelectedIsActive: false,
  metadataColsOptions: {},
  projectTags: [],
  tableMode: 'table',
};

export const modelsViewReducer = createReducer<ModelsViewState>(
  modelsInitialState,
  on(actions.resetState, (state): ModelsViewState => ({
    ...state,
    models: modelsInitialState.models,
    selectedModel: modelsInitialState.selectedModel,
  })),
  on(setSelectedProject, (state): ModelsViewState => ({...state, selectedModels: modelsInitialState.selectedModels})),
  on(actions.addModels, (state, action): ModelsViewState =>
    ({...state, models: state.models?.concat(action.models) || null})),
  on(actions.removeModels, (state, action): ModelsViewState =>
    ({
      ...state,
      models: state.models?.filter(exp => !action.modelIds.includes(exp.id)) || null
    })),
  on(actions.showSelectedOnly, (state, action): ModelsViewState =>
    ({
      ...state,
      showAllSelectedIsActive: action.active,
      globalFilter: modelsInitialState.globalFilter,
      tempFilters: state.projectColumnFilters[action.projectId] || {},
      ...(state.showAllSelectedIsActive && {
        projectColumnFilters: {
          ...state.projectColumnFilters,
          [action.projectId]: action.active ? modelsInitialState.tableFilters : state.tempFilters
        }
      })
    })),
  on(actions.updateModel, (state, action): ModelsViewState => {
    const newState = {
      ...state, models:
        state.models?.map(ex => ex.id === action.id ? {...ex, ...action.changes} : ex)
    };
    if (state.selectedModel?.id === action.id) {
      newState.selectedModel = {...state.selectedModel, ...action.changes};
    }
    if (state.selectedModels.find(ex => ex.id === action.id)) {
      newState.selectedModels = state.selectedModels.map(ex => ex.id === action.id ? {...ex, ...action.changes} : ex);
    }
    return newState;
  }),
  on(actions.setModels, (state, action): ModelsViewState =>
    ({...state, models: action.models})),
  on(actions.setModelsInPlace, (state, action): ModelsViewState =>
    ({...state, models: state.models?.map(currModel => action.models?.find(newModel => newModel.id === currModel.id)) || null
    })),
  on(actions.setNoMoreModels, (state, action): ModelsViewState =>
    ({...state, noMoreModels: action.payload})),
  on(actions.setCurrentScrollId, (state, action): ModelsViewState =>
    ({...state, scrollId: action.scrollId})),
  on(actions.setSelectedModels, (state, action): ModelsViewState =>
    ({...state, selectedModels: action.models as unknown as TableModel[]})),
  on(actions.setSelectedModelsDisableAvailable, (state, action): ModelsViewState  =>
    ({...state, selectedModelsDisableAvailable: action.selectedModelsDisableAvailable})),
  on(actions.setSelectedModel, (state, action): ModelsViewState =>
    ({...state, selectedModel: action.model})),
  on(actions.globalFilterChanged, (state, action): ModelsViewState =>
    ({...state, globalFilter: action as ReturnType<typeof actions.globalFilterChanged>})),
  on(actions.resetGlobalFilter, (state): ModelsViewState =>
    ({...state, globalFilter: modelsInitialState.globalFilter})),
  on(actions.toggleColHidden, (state, action): ModelsViewState =>
    ({
      ...state,
      hiddenProjectTableCols: {
        ...state.hiddenProjectTableCols,
        [action.projectId]: {
          ...(state.hiddenProjectTableCols[action.projectId] || modelsInitialState.hiddenTableCols),
          [action.columnId]: state.hiddenProjectTableCols?.[action.projectId]?.[action.columnId] ? undefined : true
        }
      }
    })),
  on(actions.setHiddenCols, (state, action): ModelsViewState =>
    ({...state, hiddenTableCols: action.hiddenCols})),
  on(actions.addColumn, (state, action): ModelsViewState =>
    ({...state, metadataCols: [...state.metadataCols, action.col]})),
  on(actions.removeCol, (state, action): ModelsViewState => ({
    ...state,
    metadataCols: [...state.metadataCols.filter(tableCol => !(tableCol.key === action.id && tableCol.projectId === action.projectId))],
    colsOrder: {
      ...state.colsOrder,
      [action.projectId]: state.colsOrder[action.projectId] ? state.colsOrder[action.projectId].filter(colId => colId !== action.id) : null
    }
  })),
  on(actions.setExtraColumns, (state, action): ModelsViewState =>
    ({
      ...state,
      metadataCols: [...state.metadataCols.filter(tableCol => !(tableCol.projectId === action['projectId'])), ...action['columns']]
    })),
  on(actions.setFrameworks, (state, action): ModelsViewState =>
    ({...state, frameworks: action.frameworks})),
  on(actions.setTags, (state, action): ModelsViewState => ({...state, projectTags: action.tags})),
  on(actions.addProjectTag, (state, action): ModelsViewState => ({...state, projectTags: Array.from(new Set(state.projectTags.concat(action.tag))).sort()})),
  on(actions.setMetadataKeys, (state, action): ModelsViewState => ({...state, projectMetadataKeys: action.keys})),
  on(actions.setMetadataColValuesOptions, (state, action): ModelsViewState =>
    ({...state, metadataColsOptions: {...state.metadataColsOptions, [action.col.id]: action.values}})),
  on(actions.setTableSort, (state, action): ModelsViewState => {
    const colIds = (Object.values(MODELS_TABLE_COL_FIELDS) as string[]).concat(state.metadataCols.map(col => col.id));
    let orders = action.orders.filter(order => colIds.includes(order.field));
    orders = orders.length > 0 ? orders : null;
    return {
      ...state,
      projectColumnsSortOrder: {
        ...state.projectColumnsSortOrder,
        [action.projectId]: orders
      }
    };
  }),
  on(actions.setColumnWidth, (state, action): ModelsViewState => ({
    ...state,
    projectColumnsWidth: {
      ...state.projectColumnsWidth,
      [action.projectId]: {
        ...state.projectColumnsWidth[action.projectId],
        [action.columnId]: action.widthPx
      }
    }
  })),
  on(actions.setColsOrderForProject, (state, action): ModelsViewState =>
    ({...state, colsOrder: {...state.colsOrder, [action.project]: action.cols}})),
  on(actions.setTableFilters, (state, action): ModelsViewState => ({
    ...state,
    projectColumnFilters: {
      ...state.projectColumnFilters,
      [action.projectId]: {
        ...action.filters.reduce((obj, filter: TableFilter) => {
          obj[filter.col] = {value: filter.value, matchMode: filter.filterMatchMode};
          return obj;
        }, {} as { [columnId: string]: FilterMetadata })
      }
    }
  })),
  on(actions.removeMetricCol, (state, action): ModelsViewState => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {[action.id]: removedCol, ...remainingColsWidth} = state.projectColumnsWidth[action.projectId] || {};
    return {
      ...state,
      metadataCols: [...state.metadataCols.filter(tableCol => !(tableCol.id === action.id && tableCol.projectId === action.projectId))],
      projectColumnsSortOrder: {
        ...state.projectColumnsSortOrder,
        [action.projectId]: state.projectColumnsSortOrder[action.projectId]?.filter(order => order.field !== action.id) || null
      },
      projectColumnsWidth: {...state.projectColumnsWidth, [action.projectId]: remainingColsWidth},
      colsOrder: {
        ...state.colsOrder,
        [action.projectId]: state.colsOrder[action.projectId] ? state.colsOrder[action.projectId].filter(colId => colId !== action.id) : null
      }
    };
  }),
  on(actions.setSplitSize, (state, action): ModelsViewState =>
    ({...state, splitSize: action.splitSize})),
  on(actions.setTableMode, (state, action): ModelsViewState => ({...state, tableMode: action.mode})),
  on(actions.setCustomMetrics, (state, action): ModelsViewState => ({...state, metricVariants: action.metrics})),
  on(actions.updateManyModels, (state, action): ModelsViewState => ({
    ...state,
    models: state.models?.map(model => Object.hasOwn(action.changeList, model.id) ? {...model, ...action.changeList[model.id]} : model) ?? null,
    ...(Object.hasOwn(action.changeList, state.selectedModel?.id) && {selectedModel: {...state.selectedModel, ...action.changeList[state.selectedModel.id]}}),
    selectedModels: state.selectedModels.map(model => Object.hasOwn(action.changeList, model.id) ? {...model, ...action.changeList[model.id]} : model),
  })),
);
