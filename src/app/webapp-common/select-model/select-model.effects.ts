import {Injectable} from '@angular/core';
import {Store} from '@ngrx/store';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import * as actions from './select-model.actions';
import {getNextModels, getSelectedModels, setSelectedModels, setSelectedModelsList} from './select-model.actions';
import * as exSelectors from './select-model.reducer';
import {selectTableSortFields} from './select-model.reducer';
import {MODELS_PAGE_SIZE} from '../models/models.consts';
import {catchError, debounceTime, map, mergeMap, switchMap} from 'rxjs/operators';
import {get} from 'lodash-es';
import {MODEL_TAGS, MODELS_TABLE_COL_FIELDS} from '../models/shared/models.const';
import {ApiModelsService} from '~/business-logic/api-services/models.service';
import {requestFailed} from '../core/actions/http.actions';
import {activeLoader, deactivateLoader, setServerError} from '../core/actions/layout.actions';
import {addMultipleSortColumns} from '../shared/utils/shared-utils';
import {of} from 'rxjs';
import {FilterMetadata} from 'primeng/api/filtermetadata';
import {ModelsGetAllExRequest} from '~/business-logic/model/models/modelsGetAllExRequest';
import {SortMeta} from 'primeng/api';
import {createFiltersFromStore, encodeOrder, excludedKey, getTagsFilters} from '../shared/utils/tableParamEncode';
import {escapeRegex} from '@common/shared/utils/escape-regex';
import {selectMetadataColsForProject} from '@common/models/reducers';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {selectRouterProjectId} from '@common/core/reducers/projects.reducer';

@Injectable()
export class SelectModelEffects {
  private selectModelsOnlyFields = ['created', 'framework', 'id', 'labels', 'name', 'ready', 'tags', 'system_tags', 'task.name', 'uri', 'user.name', 'parent', 'design', 'company', 'project.name', 'comment', 'last_update'];

  constructor(private actions$: Actions, private store: Store, private apiModels: ApiModelsService) {
  }

  activeLoader = createEffect(() => this.actions$.pipe(
    ofType(actions.getNextModels, actions.globalFilterChanged, actions.tableSortChanged, actions.tableFilterChanged),
    map(action => activeLoader(action.type))
  ));

  tableSortChange = createEffect(() => this.actions$.pipe(
    ofType(actions.tableSortChanged),
    concatLatestFrom(() => this.store.select(selectTableSortFields)),
    switchMap(([action, oldOrders]) => {
      const orders = addMultipleSortColumns(oldOrders, action.colId, action.isShift);
      return [actions.setTableSort({orders})];
    })
  ));

  modelsFilterChanged = createEffect(() => this.actions$.pipe(
    ofType(actions.globalFilterChanged, actions.tableSortChanged, actions.tableFilterChanged, actions.showArchive, actions.clearTableFilter),
    debounceTime(0), // Let other effects finish first
    switchMap((action) => this.fetchModels$(null)
      .pipe(
        mergeMap(res => [
          actions.setNoMoreModels({noMore: res.models.length < MODELS_PAGE_SIZE}),
          actions.setModels({models: res.models}),
          actions.setCurrentScrollId({scrollId: res.scroll_id}),
          deactivateLoader(action.type)
        ]),
        catchError(error => [requestFailed(error), deactivateLoader(action.type), setServerError(error, null, 'Fetch Models failed')])
      )
    )
  ));

  getModels = createEffect(() => this.actions$.pipe(
    ofType(getNextModels),
    concatLatestFrom(() => this.store.select(exSelectors.selectCurrentScrollId)),
    switchMap(([action, scrollId]) =>
      this.fetchModels$(scrollId)
        .pipe(
          mergeMap(res => [
            actions.setNoMoreModels({noMore: res.models.length < MODELS_PAGE_SIZE}),
            actions.addModels({models: res.models}),
            actions.setCurrentScrollId({scrollId: res.scroll_id}),
            deactivateLoader(action.type)
          ]),
          catchError(error => [requestFailed(error), deactivateLoader(action.type), setServerError(error, null, 'Fetch Models failed')])
        )
    )
  ));

  getSelectedModels = createEffect(() => this.actions$.pipe(
    ofType(getSelectedModels),
    switchMap(action => this.apiModels.modelsGetAllEx({
      id: action.selectedIds,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      only_fields: this.selectModelsOnlyFields
    })),
    mergeMap(res => [
      setSelectedModelsList({models: res.models}),
      setSelectedModels({models: res.models})
    ])
  ));

  getGetAllQuery(
    scrollId: string, projectId: string, searchQuery: string, orderFields: SortMeta[],
    tableFilters: { [s: string]: FilterMetadata }, showArchived: boolean, metadataCols: ISmCol[]
  ): ModelsGetAllExRequest {
    const userFilter = get(tableFilters, [MODELS_TABLE_COL_FIELDS.USER, 'value']);
    const tagsFilter = tableFilters?.[MODELS_TABLE_COL_FIELDS.TAGS]?.value;
    const tagsFilterAnd = tableFilters?.[MODELS_TABLE_COL_FIELDS.TAGS]?.matchMode === 'AND';
    const projectFilter = get(tableFilters, [MODELS_TABLE_COL_FIELDS.PROJECT, 'value']);
    const systemTags = tableFilters?.system_tags?.value;
    const systemTagsFilter = (showArchived ? [] :
      ['__$and', excludedKey, MODEL_TAGS.HIDDEN]).concat(systemTags ? systemTags : []);
    const filters = createFiltersFromStore(tableFilters, true);
    delete filters['tags'];
    return {
      ...filters,
      _any_: searchQuery ? {
        pattern: escapeRegex(searchQuery),
        fields: ['id', 'name', 'framework', 'system_tags', 'uri']
      } : undefined,
      /* eslint-disable @typescript-eslint/naming-convention */
      project: projectFilter,
      scroll_id: scrollId || null, // null to create new scroll (undefined doesn't generate scroll)
      size: MODELS_PAGE_SIZE,
      order_by: encodeOrder(orderFields),
      ...(tagsFilter?.length > 0 && {
        filters: {
          tags: getTagsFilters(tagsFilterAnd, tagsFilter),
        }
      }),
      system_tags: (systemTagsFilter && systemTagsFilter.length > 0) ? systemTagsFilter : [],
      only_fields: [...this.selectModelsOnlyFields, ...metadataCols.map(col => col.id)],
      ...(tableFilters?.[MODELS_TABLE_COL_FIELDS.READY]?.value.length == 1 && !!tableFilters) ?
        {ready: tableFilters?.[MODELS_TABLE_COL_FIELDS.READY]?.value[0] === 'true'} : {ready: undefined},
      ...(!window.location.href.includes('compare') && {ready: true}),
      framework: tableFilters?.[MODELS_TABLE_COL_FIELDS.FRAMEWORK]?.value ?? undefined,
      user: (userFilter && userFilter.length > 0) ? userFilter : undefined
      /* eslint-enable @typescript-eslint/naming-convention */
    };
  }

  fetchModels$(scrollId1: string) {
    return of(scrollId1)
      .pipe(
        concatLatestFrom(() => [
          // TODO: refactor with ngrx router.
          this.store.select(selectRouterProjectId),
          this.store.select(exSelectors.selectGlobalFilter),
          this.store.select(exSelectors.selectTableSortFields),
          this.store.select(exSelectors.selectSelectModelTableFilters),
          this.store.select(exSelectors.selectShowArchive),
          this.store.select(selectMetadataColsForProject),
        ]),
        switchMap(([scrollId, projectId, gb, sortFields, filters, showArchive, metadataCols]) =>
          this.apiModels.modelsGetAllEx(this.getGetAllQuery(scrollId, projectId, gb, sortFields, filters, showArchive, metadataCols))
        )
      );
  }

  getReadyFilter(tableFilters) {
    switch (tableFilters?.ready?.value?.length) {
      case 0:
        return null;
      case 1:
        return tableFilters.ready.value[0] === 'true';
      case 2:
        return null;
      default:
        return null;
    }
  }
}
