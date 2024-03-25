import {AfterViewInit, Component, inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActionCreator, Store} from '@ngrx/store';
import {combineLatest, Observable, of, Subject, Subscription, switchMap} from 'rxjs';
import {debounceTime,distinctUntilChanged, filter, map, take, takeUntil, tap, throttleTime, withLatestFrom} from 'rxjs/operators';
import {Project} from '~/business-logic/model/projects/project';
import {
  selectSelectedProject,
  selectSelectedProjectUsers,
  selectTablesFilterProjectsOptions
} from '../../core/reducers/projects.reducer';
import {IOutputData} from 'angular-split/lib/interface';
import {SplitComponent} from 'angular-split';
import {selectRouterParams} from '../../core/reducers/router-reducer';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {IFooterState, ItemFooterModel} from './footer-items/footer-items.models';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  selectionAllHasExample,
  selectionAllIsArchive,
  selectionExamplesCount,
  selectionHasExample
} from './items.utils';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {
  getTablesFilterProjectsOptions,
  resetProjectSelection,
  resetTablesFilterProjectsOptions,
  setTablesFilterProjectsOptions
} from '@common/core/actions/projects.actions';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {RefreshService} from '@common/core/services/refresh.service';
import {selectTableModeAwareness} from '@common/projects/common-projects.reducer';
import {setTableModeAwareness} from '@common/projects/common-projects.actions';
import {User} from '~/business-logic/model/users/user';
import {neverShowPopupAgain, toggleCardsCollapsed} from '../../core/actions/layout.actions';
import {selectNeverShowPopups, selectTableCardsCollapsed} from '../../core/reducers/view.reducer';
import {isReadOnly} from '@common/shared/utils/is-read-only';
import {setCustomMetrics} from '@common/models/actions/models-view.actions';
import * as experimentsActions from '@common/experiments/actions/common-experiments-view.actions';
import {
  hyperParamSelectedExperiments,
  hyperParamSelectedInfoExperiments,
  setHyperParamsFiltersPage,
  setParents
} from '@common/experiments/actions/common-experiments-view.actions';
import {IExperimentInfo} from '~/features/experiments/shared/experiment-info.model';
import {ContextMenuService} from '@common/shared/services/context-menu.service';

@Component({
  selector: 'sm-base-entity-page',
  template: ''
})
export abstract class BaseEntityPageComponent implements OnInit, AfterViewInit, OnDestroy {
  protected entities = [];
  protected entityType: EntityTypeEnum;
  public selectedProject$: Observable<Project>;
  protected setSplitSizeAction: ActionCreator<string, any>;
  protected addTag: ActionCreator<string, any>;
  protected abstract setTableModeAction: ActionCreator<string, any>;
  public shouldOpenDetails = false;
  protected sub = new Subscription();
  public selectedExperiments: IExperimentInfo[];
  public projectId: string;
  public isExampleProject: boolean;
  public selectSplitSize$?: Observable<number>;
  public infoDisabled: boolean;
  public splitInitialSize: number;
  public minimizedView: boolean;
  public footerItems = [] as ItemFooterModel[];
  public footerState$: Observable<IFooterState<any>>;
  public tableModeAwareness$: Observable<boolean>;
  private tableModeAwareness: boolean;
  private destroy$ = new Subject();
  public users$: Observable<User[]>;
  public projectsOptions$: Observable<Project[]>;
  protected parents = [];
  public compareViewMode: 'scalars' | 'plots';

  @ViewChild('split') split: SplitComponent;
  protected abstract inEditMode$: Observable<boolean>;
  public selectedProject: Project;
  private currentSelection: { id: string }[];
  public showAllSelectedIsActive$: Observable<boolean>;
  private allProjects: boolean;
  public cardsCollapsed$: Observable<boolean>;
  protected minimizedView$: Observable<boolean>;

  abstract onFooterHandler({emitValue, item}): void;

  abstract getSelectedEntities();

  abstract afterArchiveChanged();

  protected abstract getParamId(params);

  abstract refreshList(auto: boolean);


  get selectedProjectId() {
    return this.route.parent.snapshot.params.projectId;
  }

  protected store: Store;
  protected route: ActivatedRoute;
  protected router: Router;
  protected dialog: MatDialog;
  protected refresh: RefreshService;
  protected contextMenuService: ContextMenuService;

  protected constructor() {
    this.store = inject(Store);
    this.route = inject(ActivatedRoute);
    this.router = inject(Router);
    this.dialog = inject(MatDialog);
    this.refresh = inject(RefreshService);
    this.contextMenuService = inject(ContextMenuService);

    this.users$ = this.store.select(selectSelectedProjectUsers);
    this.sub.add(this.store.select(selectSelectedProject).pipe(filter(p => !!p)).subscribe((project: Project) => {
      this.selectedProject = project;
      this.allProjects = project?.id === '*';
      this.isExampleProject = isReadOnly(project);
    }));
    this.projectsOptions$ = this.store.select(selectTablesFilterProjectsOptions);

    this.minimizedView$ = this.store.select(selectRouterParams).pipe(
      map(params => !!this.getParamId(params) || Object.hasOwn(params, 'ids'))
    );
    this.tableModeAwareness$ = this.store.select(selectTableModeAwareness)
      .pipe(
        filter(featuresAwareness => featuresAwareness !== null && featuresAwareness !== undefined),
        tap(aware => this.tableModeAwareness = aware)
      );

  }

  ngOnInit() {
    this.cardsCollapsed$ = this.store.select(selectTableCardsCollapsed(this.entityType)).pipe(distinctUntilChanged());
    this.selectedProject$ = this.store.select(selectSelectedProject);
    this.selectSplitSize$?.pipe(filter(x => !!x), take(1))
      .subscribe(x => this.splitInitialSize = x);

    this.sub.add(this.minimizedView$.subscribe( minimized => {
        if (this.split && this.minimizedView === true && !minimized) {
          this.splitInitialSize = this.split.getVisibleAreaSizes()[1] as number;
        }
        this.minimizedView = minimized;
      }
    ));

    this.sub.add(this.refresh.tick
      .pipe(
        withLatestFrom(this.inEditMode$, this.showAllSelectedIsActive$),
        filter(([, edit, showAllSelectedIsActive]) => !edit && !showAllSelectedIsActive),
        map(([auto]) => auto)
      )
      .subscribe(auto => this.refreshList(auto === null))
    );
    this.setupBreadcrumbsOptions();
  }

  ngAfterViewInit() {
    this.store.dispatch(resetTablesFilterProjectsOptions());
    if (this.setSplitSizeAction) {
      this.sub.add(this.split.dragProgress$.pipe(throttleTime(100))
        .subscribe((progress) => this.store.dispatch(this.setSplitSizeAction({splitSize: progress.sizes[1] as number})))
      );
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.footerItems = [];
    this.store.dispatch(setCustomMetrics({metrics: null}));
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  closePanel(queryParams?: Params) {
    window.setTimeout(() => this.infoDisabled = false);
    this.store.dispatch(this.setTableModeAction({mode: 'table'}));
    return this.router.navigate(this.minimizedView ? [{}] : [], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams
    });
  }

  protected compareView() {
    const comparedEntities = this.selectedExperiments.length > 0 ? this.selectedExperiments : this.entities
    return this.router.navigate(['compare', this.compareViewMode ?? 'scalars', {ids: comparedEntities.map(e => e.id).join(',')}], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve'
    });
  }

  splitSizeChange(event: IOutputData) {
    if (this.setSplitSizeAction) {
      this.store.dispatch(this.setSplitSizeAction({splitSize: event.sizes[1] as number}));
    }
    this.infoDisabled = false;
  }

  disableInfoPanel() {
    this.infoDisabled = true;
  }

  clickOnSplit() {
    this.infoDisabled = false;
  }

  tableModeUserAware() {
    if (this.tableModeAwareness === true) {
      this.store.dispatch(setTableModeAwareness({awareness: false}));
    }
  }

  tagSelected({tags, emitValue}, entitiesType) {
    this.store.dispatch(this.addTag({
      tag: tags,
      [entitiesType]: emitValue
    }));
  }

  createFooterItems(config: {
    entitiesType: EntityTypeEnum;
    selected$: Observable<{ id: string }[]>;
    showAllSelectedIsActive$: Observable<boolean>;
    data$?: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;
    tags$?: Observable<string[]>;
    companyTags$?: Observable<string[]>;
    projectTags$?: Observable<string[]>;
    tagsFilterByProject$?: Observable<boolean>;
  }) {
    this.footerState$ = this.createFooterState(
      config.selected$,
      config.data$,
      config.showAllSelectedIsActive$,
      this.allProjects ? of(null) : config.companyTags$,
      this.allProjects ? config.companyTags$ : config.projectTags$,
      this.allProjects ? of(true) : config.tagsFilterByProject$
    );
  }

  createFooterState<T extends { id: string }>(
    selected$: Observable<T[]>,
    data$?: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>,
    showAllSelectedIsActive$?: Observable<boolean>,
    companyTags$?: Observable<string[]>,
    projectTags$?: Observable<string[]>,
    tagsFilterByProject$?: Observable<boolean>
  ): Observable<IFooterState<T>> {
    data$ = data$ || of({});
    projectTags$ = projectTags$ || of([]);
    companyTags$ = companyTags$ || of([]);
    tagsFilterByProject$ = tagsFilterByProject$ || of(true);
    return combineLatest(
      [
        selected$,
        data$,
        showAllSelectedIsActive$,
        companyTags$,
        projectTags$,
        tagsFilterByProject$
      ]
    ).pipe(
      takeUntil(this.destroy$),
      debounceTime(100),
      filter(([selected]) => selected.length > 1 || this.currentSelection?.length > 1),
      tap(([selected]) => this.currentSelection = selected),
      map(([selected, data, showAllSelectedIsActive, companyTags, projectTags, tagsFilterByProject]) => {
          const _selectionAllHasExample = selectionAllHasExample(selected);
          const _selectionHasExample = selectionHasExample(selected);
          const _selectionExamplesCount = selectionExamplesCount(selected);
          const isArchive = selectionAllIsArchive(selected);
          return {
            selectionHasExample: _selectionHasExample,
            selectionAllHasExample: _selectionAllHasExample,
            selectionIsOnlyExamples: _selectionExamplesCount.length === selected.length,
            selected,
            selectionAllIsArchive: isArchive,
            data,
            showAllSelectedIsActive,
            companyTags,
            projectTags,
            tagsFilterByProject
          };
        }
      ),
      filter(({selected, data}) => !!selected && !!data)
    );
  }

  archivedChanged(isArchived: boolean) {
    const navigate = () => this.closePanel({archive: isArchived || null}).then(() => {
      this.afterArchiveChanged();
      this.store.dispatch(resetProjectSelection());
    });
    this.store.select(selectNeverShowPopups)
      .pipe(
        take(1),
        switchMap(neverShow => {
          if (this.getSelectedEntities().length > 0 && !neverShow?.includes('go-to-archive')) {
            return this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Are you sure?',
                body: `Navigating between "Live" and "Archive" will deselect your selected ${this.entityType}s.`,
                yes: 'Proceed',
                no: 'Back',
                iconClass: '',
                showNeverShowAgain: true
              }
            }).afterClosed();
          } else {
            navigate();
            return of(false);
          }
        })
      )
      .subscribe((confirmed) => {
        if (confirmed) {
          navigate();
          if (confirmed.neverShowAgain) {
            this.store.dispatch(neverShowPopupAgain({popupId: 'go-to-archive'}));
          }
        }
      });
  }

  filterSearchChanged({colId, value}: { colId: string; value: { value: string; loadMore?: boolean } }) {
    switch (colId) {
      case 'project.name':
        if ((this.projectId || this.selectedProjectId) === '*') {
          !value.loadMore && this.store.dispatch(resetTablesFilterProjectsOptions());
          this.store.dispatch(getTablesFilterProjectsOptions({
            searchString: value.value || '',
            loadMore: value.loadMore
          }));
        } else {
          this.store.dispatch(setTablesFilterProjectsOptions({
            projects: this.selectedProject ? [this.selectedProject,
              ...(this.selectedProject?.sub_projects ?? [])] : [], scrollId: null
          }));
        }
        break;
      case 'parent.name':
        // No pagination in BE - setting same list will set noMoreOptions to true
        if (value.loadMore) {
          this.store.dispatch(setParents({parents: [...this.parents]}));
        } else {
          this.store.dispatch(experimentsActions.resetTablesFilterParentsOptions());
          this.store.dispatch(experimentsActions.getParents({searchValue: value.value}));
        }
    }
    if (colId.startsWith('hyperparams.')) {
      if (!value.loadMore) {
        this.store.dispatch(hyperParamSelectedInfoExperiments({col: {id: colId}, loadMore: false, values: null}));
        this.store.dispatch(setHyperParamsFiltersPage({page: 0}));
      }
      this.store.dispatch(hyperParamSelectedExperiments({
        col: {id: colId, getter: `${colId}.value`},
        searchValue: value.value
      }));
    }
  }

  public setupBreadcrumbsOptions() {
  }

  public setupContextMenu(entitiesType) {
    this.contextMenuService.setupProjectContextMenu(entitiesType, this.projectId);
  }

  cardsCollapsedToggle() {
    this.store.dispatch(toggleCardsCollapsed({entityType: this.entityType}))
  }
}
