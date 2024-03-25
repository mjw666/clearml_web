import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SelectableListItem} from '@common/shared/ui-components/data/selectable-list/selectable-list.model';
import {Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {distinctUntilChanged, filter, take, tap, withLatestFrom} from 'rxjs/operators';
import {combineLatest} from 'rxjs';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {convertMultiPlots, IMultiplot, prepareMultiPlots, sortMetricsList} from '@common/tasks/tasks.utils';
import {isEqual} from 'lodash-es';
import {
  getMultiPlotCharts,
  resetExperimentMetrics,
  setExperimentMetricsSearchTerm,
  setExperimentSettings,
  setSelectedExperiments
} from '../../actions/experiments-compare-charts.actions';
import {
  selectCompareTasksPlotCharts,
  selectExperimentMetricsSearchTerm,
  selectGlobalLegendData, selectSelectedMetricsSettingsPlot,
} from '../../reducers';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {RefreshService} from '@common/core/services/refresh.service';
import {addMessage} from '@common/core/actions/layout.actions';
import {ExperimentGraphsComponent} from '@common/shared/experiment-graphs/experiment-graphs.component';
import {ReportCodeEmbedService} from '~/shared/services/report-code-embed.service';
import {ActivatedRoute, Params} from '@angular/router';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {ExperimentCompareSettings} from '@common/experiments-compare/reducers/experiments-compare-charts.reducer';
import {MetricVariants} from '~/business-logic/model/events/metricVariants';
import {selectCompareSelectedMetrics, selectMetricVariantsPlots, selectSelectedExperiments, selectSplitSize} from '@common/experiments/reducers';
import {ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';
import {getCustomMetricsPerType} from '@common/experiments/actions/common-experiments-view.actions';
import {EventTypeEnum} from '~/business-logic/model/events/eventTypeEnum';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {AsyncPipe, NgIf} from '@angular/common';
import {SelectableFilterListComponent} from '@common/shared/ui-components/data/selectable-filter-list/selectable-filter-list.component';
import {ExperimentGraphsModule} from '@common/shared/experiment-graphs/experiment-graphs.module';
import {ReportsApiMultiplotsResponse} from '@common/constants';

@Component({
  selector: 'sm-experiment-compare-plots',
  templateUrl: './experiment-compare-plots.component.html',
  styleUrls: ['./experiment-compare-plots.component.scss'],
  imports: [
    NgIf,
    SelectableFilterListComponent,
    ExperimentGraphsModule,
    AsyncPipe
  ],
  standalone: true
})
export class ExperimentComparePlotsComponent implements OnInit, OnDestroy {

  private routerParams$: Observable<Params>;
  private selectedMetrics$: Observable<string[]>;
  public plots$: Observable<ReportsApiMultiplotsResponse>;
  public searchTerm$: Observable<string>;

  private subs = new Subscription();

  public graphList: SelectableListItem[] = [];
  private taskIds: Array<string>;
  public graphs: { [key: string]: ExtFrame[] };
  public refreshDisabled: boolean;

  @ViewChild(ExperimentGraphsComponent) graphsComponent: ExperimentGraphsComponent;
  private entityType: EntityTypeEnum;
  public modelsFeature: boolean;
  public settings: ExperimentCompareSettings = {} as ExperimentCompareSettings;
  private initialSettings = {
    selectedMetricsPlot: []
  } as ExperimentCompareSettings;
  private originalSettings: string[];
  private selectedVariants: MetricVariants[];
  public minimized = false;
  private previousSelectedMetrics: ISmCol[];
  public splitSize$: Observable<number>;
  private originMetrics: Array<MetricVariantResult>;
  private firstTime = true;

  @HostListener('window:beforeunload', ['$event']) unloadHandler() {
    this.saveSettingsState();
  }

  constructor(
    private store: Store,
    private changeDetection: ChangeDetectorRef,
    private route: ActivatedRoute,
    private refresh: RefreshService,
    private reportEmbed: ReportCodeEmbedService,
  ) {
    this.modelsFeature = this.route.snapshot?.parent.data?.setAllProject;
    this.selectedMetrics$ = this.store.select(selectSelectedMetricsSettingsPlot);
    this.searchTerm$ = this.store.select(selectExperimentMetricsSearchTerm);
    this.splitSize$ = this.store.select(selectSplitSize);
    this.plots$ = this.store.select(selectCompareTasksPlotCharts).pipe(
      filter(metrics => !!metrics),
      distinctUntilChanged()
    );

    this.routerParams$ = this.store.select(selectRouterParams).pipe(
      filter(params => !!params.ids),
      distinctUntilChanged(),
      tap(() => this.refreshDisabled = true)
    );

  }

  ngOnInit() {
    this.minimized = this.route.snapshot.routeConfig.data?.minimized;
    this.entityType = this.route.snapshot.parent.parent.data.entityType;
    this.subs.add(combineLatest([this.plots$, this.store.select(selectGlobalLegendData), this.store.select(selectSelectedExperiments)])
      .subscribe(([metricsPlots, globalLegend, selectedExperiments]) => {
        this.refreshDisabled = false;
        const globalLegendOrSelectedExperiments: Partial<ISelectedExperiment>[] = globalLegend ?? selectedExperiments;
        const {merged, parsingError} = prepareMultiPlots(metricsPlots, globalLegendOrSelectedExperiments);
        // this.graphList = this.prepareList(merged);
        const tagsLists = globalLegendOrSelectedExperiments.reduce((acc, task) => {
          acc[task.id] = task.tags ?? [];
          return acc;
        }, {} as { [id: string]: string[] });
        const newGraphs = convertMultiPlots(merged, tagsLists);
        if (!this.graphs || !isEqual(newGraphs, this.graphs)) {
          this.graphs = newGraphs;
        }
        this.changeDetection.detectChanges();
        parsingError && this.store.dispatch(addMessage('warn', `Couldn't read all plots. Please make sure all plots are properly formatted (NaN & Inf aren't supported).`, [], true));
      }));

    this.subs.add(this.routerParams$
      .pipe(withLatestFrom(this.store.select(selectMetricVariantsPlots),
        this.store.select(selectSelectedExperiments)))
      .subscribe(([params, metrics, selectedExperiments]) => {
        if (!this.taskIds || this.taskIds.join(',') !== params.ids) {
          const previousTaskIds = this.taskIds;
          this.taskIds = params.ids.split(',').sort();
          this.store.dispatch(setSelectedExperiments({selectedExperiments: this.taskIds}));
          if (metrics.length === 0 || (metrics.length > 0 && previousTaskIds !== undefined) || !isEqual(selectedExperiments, this.taskIds)) {
            this.store.dispatch(getCustomMetricsPerType({ids: this.taskIds, metricsType: EventTypeEnum.Plot, isModel: this.entityType === EntityTypeEnum.model}));
          }
        }
      }));

    this.subs.add(this.store.select(selectCompareSelectedMetrics('plots'))
      .pipe(
        filter(metrics => !!metrics && this.minimized),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)))
      .subscribe(selectedMetrics => {
        const metricsVariants = selectedMetrics.filter(m => !m.hidden).reduce((acc, curr) => {
          if (acc[curr.metricName]) {
            acc[curr.metricName].push(curr.variantName);
          } else {
            acc[curr.metricName] = [curr.variantName];
          }
          return acc;
        }, {} as { [metric: string]: string[] });
        this.settings.selectedMetricsPlot = selectedMetrics.filter(m => !m.hidden).map(m => `${m.metricName} - ${m.variantName}`);
        const variants = Object.entries(metricsVariants).map(([metricName, variants]) => ({metric: metricName, variants}))
        this.selectedVariants = variants;
        if (this.firstTime || this.previousSelectedMetrics?.length !== selectedMetrics?.length) {
          this.firstTime = false;
          this.store.dispatch(getMultiPlotCharts({taskIds: this.taskIds, entity: this.entityType, metrics: variants}));
        }
        this.previousSelectedMetrics = selectedMetrics;
      }));

    this.subs.add(this.refresh.tick
      .pipe(filter(auto => auto !== null))
      .subscribe(autoRefresh => {
          this.store.dispatch(getCustomMetricsPerType({ids: this.taskIds, metricsType: EventTypeEnum.Plot, isModel: this.entityType === EntityTypeEnum.model}));
          this.store.dispatch(getMultiPlotCharts({taskIds: this.taskIds, entity: this.entityType, metrics: this.selectedVariants, autoRefresh}))
        }
      ));

    this.subs.add(this.selectedMetrics$.pipe(take(1)).subscribe(selectedMetrics => {
      this.originalSettings = selectedMetrics;
      this.settings = selectedMetrics ? {...this.initialSettings, selectedMetricsPlot: selectedMetrics} : {...this.initialSettings, selectedMetricsPlot: this.graphList.slice(0, 5).map(a => a.name)} as ExperimentCompareSettings;
    }));

    this.subs.add(this.store.select(selectMetricVariantsPlots)
      .pipe(
        filter(metrics => !!metrics),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)))
      .subscribe(metrics => {
        this.originMetrics = metrics;
        const listSorted = sortMetricsList(metrics.map(m => `${m.metric} - ${m.variant}`));
        this.graphList = listSorted.map(metric => ({name: metric, value: metric}))
        if (this.settings.selectedMetricsPlot?.filter(sm => listSorted.includes(sm)).length === 0 && listSorted.length > 0) {
          this.settings.selectedMetricsPlot = listSorted.slice(0, 5);
        }

        if (!this.minimized) {
          const selectedMetricsCols = metrics.filter(metric => this.settings.selectedMetricsPlot.includes(`${metric.metric} - ${metric.variant}`))
          this.selectedVariants = this.buildMetricVariants(selectedMetricsCols)
          this.selectedVariants?.length > 0 && this.store.dispatch(getMultiPlotCharts({taskIds: this.taskIds, entity: this.entityType, metrics: this.selectedVariants}));
        }
      }));
  }

  buildMetricVariants = (metricsCols: MetricVariantResult[]): { metric: string; variants: string[] }[] => {
    const metricsVariants = metricsCols.reduce((acc, curr) => {
      if (acc[curr.metric]) {
        acc[curr.metric].push(curr.variant);
      } else {
        acc[curr.metric] = [curr.variant];
      }
      return acc;
    }, {} as { [metric: string]: string[] });

    return Object.entries(metricsVariants).map(([metricName, variants]) => ({metric: metricName, variants}))
  }

  ngOnDestroy() {
    this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm: ''}));
    this.saveSettingsState();
    this.subs.unsubscribe();
    this.resetMetrics();
  }

  private prepareList(metricsScalar): Array<SelectableListItem> {
    const list = metricsScalar ? Object.keys(metricsScalar) : [];
    const sortedList = sortMetricsList(list);
    return sortedList.map((item) => ({name: item, value: item}));
  }

  metricSelected(id) {
    this.graphsComponent?.scrollToGraph(id);
  }

  selectedListChanged(selectedList) {
    this.settings = {...this.settings, selectedMetricsPlot: selectedList ?? []};
    if (!this.minimized) {
      const selectedMetricsCols = this.originMetrics.filter(metric => this.settings.selectedMetricsPlot.includes(`${metric.metric} - ${metric.variant}`))
      const variants = this.buildMetricVariants(selectedMetricsCols)
      this.selectedVariants = variants;
      variants?.length > 0 && this.store.dispatch(getMultiPlotCharts({taskIds: this.taskIds, entity: this.entityType, metrics: variants}));
    }
  }


  searchTermChanged(searchTerm: string) {
    this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(resetExperimentMetrics());
  }

  createEmbedCode(event: { metrics?: string[]; variants?: string[]; originalObject?: string; domRect: DOMRect }) {
    const entityType = this.entityType === EntityTypeEnum.model ? 'model' : 'task';
    const idsOriginalFirst = event.originalObject ? [event.originalObject, ...this.taskIds.filter(id => id !== event.originalObject)] : this.taskIds;
    this.reportEmbed.createCode({
      type: 'plot',
      objects: idsOriginalFirst,
      objectType: entityType,
      ...event
    });
  }

  private saveSettingsState() {
    if (!isEqual(this.settings.selectedMetricsPlot, this.originalSettings)) {
      this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: {selectedMetricsPlot: this.settings.selectedMetricsPlot}}));
    }
  }
}
