import {ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {distinctUntilChanged, filter, take, withLatestFrom} from 'rxjs/operators';
import {isEqual} from 'lodash-es';
import {createMultiSingleValuesChart, mergeMultiMetrics, mergeMultiMetricsGroupedVariant, prepareGraph} from '@common/tasks/tasks.utils';
import {getMultiScalarCharts, getMultiSingleScalars, resetExperimentMetrics, setExperimentMetricsSearchTerm, setExperimentSettings, setScalarsHoverMode, setSelectedExperiments} from '../../actions/experiments-compare-charts.actions';
import {selectCompareTasksScalarCharts, selectExperimentMetricsSearchTerm, selectMultiSingleValues, selectScalarsHoverMode, selectSelectedExperiments, selectSelectedExperimentSettings} from '../../reducers';
import {ScalarKeyEnum} from '~/business-logic/model/events/scalarKeyEnum';
import {GroupByCharts, groupByCharts} from '@common/experiments/reducers/experiment-output.reducer';
import {ExtFrame} from '@common/shared/single-graph/plotly-graph-base';
import {RefreshService} from '@common/core/services/refresh.service';
import {selectRouterParams} from '@common/core/reducers/router-reducer';
import {ExperimentGraphsComponent} from '@common/shared/experiment-graphs/experiment-graphs.component';
import {ChartHoverModeEnum} from '@common/experiments/shared/common-experiments.const';
import {ReportCodeEmbedService} from '~/shared/services/report-code-embed.service';
import {ActivatedRoute, Params} from '@angular/router';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {smoothTypeEnum, SmoothTypeEnum} from '@common/shared/single-graph/single-graph.utils';
import {EventsGetTaskSingleValueMetricsResponseTasks} from '~/business-logic/model/events/eventsGetTaskSingleValueMetricsResponseTasks';
import {ExperimentCompareSettings} from '@common/experiments-compare/reducers/experiments-compare-charts.reducer';
import {selectCompareSelectedMetrics, selectMetricVariants, selectShowCompareScalarSettings, selectSplitSize} from '@common/experiments/reducers';
import {getCustomMetricsPerType, toggleCompareScalarSettings} from '@common/experiments/actions/common-experiments-view.actions';
import {MetricVariants} from '~/business-logic/model/events/metricVariants';
import {GroupedList} from '@common/tasks/tasks.model';
import {buildMetricsList, SelectableGroupedFilterListComponent} from '@common/shared/ui-components/data/selectable-grouped-filter-list/selectable-grouped-filter-list.component';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {EventTypeEnum} from '~/business-logic/model/events/eventTypeEnum';
import {MatSidenavModule} from '@angular/material/sidenav';
import {ExperimentGraphsModule} from '@common/shared/experiment-graphs/experiment-graphs.module';
import {AsyncPipe, NgIf} from '@angular/common';


@Component({
  selector: 'sm-experiment-compare-scalar-charts',
  templateUrl: './experiment-compare-scalar-charts.component.html',
  styleUrls: ['./experiment-compare-scalar-charts.component.scss'],
  imports: [
    MatSidenavModule,
    ExperimentGraphsModule,
    SelectableGroupedFilterListComponent,
    AsyncPipe,
    NgIf
  ],
  standalone: true
})
export class ExperimentCompareScalarChartsComponent implements OnInit, OnDestroy {

  private routerParams$: Observable<Params>;
  public metrics$: Observable<any>;
  public searchTerm$: Observable<string>;

  private subs = new Subscription();

  public graphList: GroupedList = {};
  private taskIds: Array<string>;
  public graphs: { [key: string]: ExtFrame[] };
  private metrics: GroupedList;
  groupByOptions = [
    {
      name: 'Metric',
      value: groupByCharts.metric
    },
    {
      name: 'Metric + Variant',
      value: groupByCharts.none
    }
  ];

  @ViewChild(ExperimentGraphsComponent) graphsComponent: ExperimentGraphsComponent;
  public hoverMode$: Observable<ChartHoverModeEnum>;
  private entityType: EntityTypeEnum;
  public modelsFeature: boolean;
  private singleValues$: Observable<EventsGetTaskSingleValueMetricsResponseTasks[]>;
  public singleValues: ExtFrame;
  private settings$: Observable<ExperimentCompareSettings>;
  public settings: ExperimentCompareSettings = {} as ExperimentCompareSettings;
  private initialSettings = {
    groupBy: 'none',
    smoothWeight: 0,
    smoothType: smoothTypeEnum.exponential,
    xAxisType: ScalarKeyEnum.Iter,
    selectedMetricsScalar: []
  }
  private originalSettings: ExperimentCompareSettings;
  public minimized = false;
  public splitSize$: Observable<number>;
  public showSettingsBar = false;
  private selectedVariants: MetricVariants[];
  private originMetrics: Array<MetricVariantResult>;
  private previousTaskIds: Array<string>;
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
    this.settings$ = this.store.select(selectSelectedExperimentSettings);
    this.searchTerm$ = this.store.select(selectExperimentMetricsSearchTerm);
    this.splitSize$ = this.store.select(selectSplitSize);
    this.hoverMode$ = this.store.select(selectScalarsHoverMode).pipe(
      filter(h => !!h),
      distinctUntilChanged());
    this.singleValues$ = this.store.select(selectMultiSingleValues);
    this.metrics$ = this.store.select(selectCompareTasksScalarCharts).pipe(
      filter(metrics => !!metrics),
      distinctUntilChanged()
    );
    this.routerParams$ = this.store.select(selectRouterParams).pipe(
      filter(params => !!params.ids),
      distinctUntilChanged()
    );

    this.subs.add(this.store.select(selectShowCompareScalarSettings)
      .subscribe((show) => this.showSettingsBar = show)
    );

  }

  ngOnInit() {
    this.minimized = this.route.snapshot.routeConfig.data?.minimized;
    this.entityType = this.route.snapshot.parent.parent.data.entityType;

    this.subs.add(combineLatest([this.metrics$, this.singleValues$])
      .subscribe(([metricsWrapped, singleValues]) => {
        const metrics = metricsWrapped.metrics || {};

        if (singleValues) {
          const visibles = this.graphsComponent?.singleValueGraph.first?.chart.data.reduce((curr, data) => {
            curr[data.task] = data.visible
            return curr;
          }, {}) ?? {};
          const singleValuesData = createMultiSingleValuesChart(singleValues, visibles);
          this.singleValues = prepareGraph(singleValuesData.data, singleValuesData.layout, {}, {type: 'singleValue'});
        }
        this.metrics = metrics;
        this.prepareGraphsAndUpdate(metrics, this.singleValues);
      }));

    this.subs.add(this.routerParams$
      .pipe(withLatestFrom(
        this.store.select(selectMetricVariants),
        this.store.select(selectSelectedExperiments)))
      .subscribe(([params, metrics, selectedExperiments]) => {
      if (!this.taskIds || this.taskIds.join(',') !== params.ids) {
        const previousTaskIds = this.taskIds;
        this.taskIds = params.ids.split(',').sort();
        this.store.dispatch(setSelectedExperiments({selectedExperiments: this.taskIds}));
        if (metrics.length === 0 || (metrics.length > 0 && previousTaskIds !== undefined) || !isEqual(selectedExperiments, this.taskIds)) {
          this.store.dispatch(getCustomMetricsPerType({ids: this.taskIds, metricsType: EventTypeEnum.TrainingStatsScalar, isModel: this.entityType === EntityTypeEnum.model}));
        }
      }
    }));

    this.subs.add(this.store.select(selectCompareSelectedMetrics('scalars'))
      .pipe(
        filter(metrics => !!metrics && this.minimized),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr)))
      .subscribe(selectedMetrics => {
        const metricsVariants = selectedMetrics.filter(m => !m.hidden).reduce((acc, curr) => {
          const currMetric = curr.metricName.replace(' Summary', 'Summary');
          if (acc[currMetric]) {
            acc[currMetric].push(curr.variantName);
          } else {
            acc[currMetric] = [curr.variantName];
          }
          return acc;
        }, {} as { [metric: string]: string[] });

        const newSelectedMetricsScalar = selectedMetrics.filter(m => !m.hidden).map(m => m.metricName + m.variantName);
        const VariantWasAdded = newSelectedMetricsScalar?.length > this.settings.selectedMetricsScalar?.length;
        this.settings.selectedMetricsScalar = newSelectedMetricsScalar;
        const variants = Object.entries(metricsVariants).map(([metricName, variants]) => ({metric: metricName, variants}))
        this.selectedVariants = variants;
        if (variants.length > 0) {
          if (this.firstTime || VariantWasAdded && this.missingVariantGraphInStore()) {
            this.firstTime = false;
            this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType, metrics: variants, xAxisType: this.settings.xAxisType}));
          }
          this.store.dispatch(getMultiSingleScalars({taskIds: this.taskIds, entity: this.entityType, metrics: variants}));
        }
      }));

    this.subs.add(this.refresh.tick
      .pipe(filter(auto => auto !== null && this.graphs !== null))
      .subscribe(autoRefresh => {
        this.store.dispatch(getCustomMetricsPerType({ids: this.taskIds, metricsType: EventTypeEnum.TrainingStatsScalar, isModel: this.entityType === EntityTypeEnum.model}));
        this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType, metrics: this.selectedVariants, xAxisType: this.settings.xAxisType}));
        this.store.dispatch(getMultiSingleScalars({taskIds: this.taskIds, entity: this.entityType, metrics: this.selectedVariants, autoRefresh}));
      }));

    this.subs.add(this.settings$.pipe(take(1)).subscribe(settings => {
      this.originalSettings = settings;
      this.settings = settings ? {...this.initialSettings, ...settings, ...(this.settings ?? {})} : {...this.initialSettings, ...(this.settings ?? {})} as ExperimentCompareSettings;
    }));

    this.subs.add(this.store.select(selectMetricVariants)
      .pipe(
        filter(metrics => !!metrics),
        distinctUntilChanged((prev, curr) => isEqual(prev, curr) && this.taskIds === this.previousTaskIds)
      )
      .subscribe(metrics => {
        this.previousTaskIds = this.taskIds;
        this.originMetrics = metrics;
        this.graphList = this.settings.groupBy === 'none' ? buildMetricsList(metrics) : this.buildNestedListWithoutChildren(metrics);

        if (!this.minimized) {
          let selectedMetricsCols: MetricVariantResult[];
          if (this.settings.selectedMetricsScalar?.length > 0) {
            selectedMetricsCols = metrics.filter(metric => this.settings.selectedMetricsScalar.includes(metric.metric + metric.variant) || this.settings.selectedMetricsScalar.includes(metric.metric));
          } else {
            if (this.settings.groupBy === 'metric') {
              const uniqueMetrics = Array.from( new Set(metrics.map(a => a.metric)))
              const FifthMetric = uniqueMetrics[5] ?? uniqueMetrics.at(-1)
              selectedMetricsCols = metrics.slice(0, metrics.findIndex(metric => metric.metric === FifthMetric) ?? 5);

            } else {
              selectedMetricsCols = metrics.slice(0, 5);
            }
            this.settings.selectedMetricsScalar = [...selectedMetricsCols.map(metric => metric.metric + metric.variant), ...Array.from(new Set(selectedMetricsCols.map(metric => metric.metric)))];
          }
          this.selectedVariants = this.buildMetricVariants(selectedMetricsCols);
        }
        this.selectedVariants?.length > 0 && this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType, metrics: this.selectedVariants, xAxisType: this.settings.xAxisType}));
        this.selectedVariants?.length > 0 && this.store.dispatch(getMultiSingleScalars({taskIds: this.taskIds, entity: this.entityType, metrics: this.selectedVariants}));
      }));

  }

  buildMetricVariants = (selectedMetricsCols: MetricVariantResult[]) => {
    const selectedMetricsVariants = selectedMetricsCols.reduce((acc, curr) => {
      const currMetric = curr.metric.replace(' Summary', 'Summary');
      if (this.settings.groupBy === 'metric') {
        acc[currMetric] = [];
      } else {
        if (acc[currMetric]) {
          acc[currMetric].push(curr.variant);
        } else {
          acc[currMetric] = [curr.variant];
        }
      }
      return acc;
    }, {} as { [metric: string]: string[] });

    return Object.entries(selectedMetricsVariants).map(([metricName, variants]) => ({metric: metricName, variants}))
  }

  private prepareGraphsAndUpdate(metrics, singleValues) {
    if (metrics || singleValues) {
      let merged = {};
      if (metrics) {
        merged = this.settings.groupBy === 'metric' ? mergeMultiMetricsGroupedVariant(metrics) : mergeMultiMetrics(metrics);
      }
      // this.graphList = {...(this.settings.groupBy === 'metric' ? this.buildNestedListWithoutChildren(merged) : metrics), ...(singleValues?.data.length > 0 && {[singleValueChartTitle]: {}})};
      if (!this.graphs || !isEqual(merged, this.graphs)) {
        this.graphs = merged;
      }
      this.changeDetection.detectChanges();
    }
  }

  private buildNestedListWithoutChildren(metricsList: MetricVariantResult[]) {
    return metricsList.reduce((acc, metric) => {
      acc[metric.metric] = {};
      return acc;
    }, {} as GroupedList);
  }

  // private buildNestedListWithoutChildren(merged: { [p: string]: ExtFrame[] }) {
  //   return Object.keys(merged).reduce((acc, metric) => {
  //     acc[metric] = {};
  //     return acc;
  //   }, {});
  // }

  ngOnDestroy() {
    this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm: ''}));
    this.saveSettingsState();
    this.subs.unsubscribe();
    this.resetMetrics();
  }

  metricSelected(id) {
    this.graphsComponent.scrollToGraph(id);
  }

  selectedListChanged(selectedList) {
    if (isEqual(selectedList, this.settings.selectedMetricsScalar)) {
      return;
    }
    this.settings = {...this.settings, selectedMetricsScalar: selectedList ?? []};
    if (!this.minimized) {
      const selectedMetricsCols = this.originMetrics.filter(metric => this.settings.selectedMetricsScalar.includes(metric.metric + metric.variant) || this.settings.selectedMetricsScalar.includes(metric.metric))
      this.selectedVariants = this.buildMetricVariants(selectedMetricsCols);
      if (this.selectedVariants.length > 0) {
        this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType, metrics: this.selectedVariants, xAxisType: this.settings.xAxisType}));
        this.store.dispatch(getMultiSingleScalars({taskIds: this.taskIds, entity: this.entityType, metrics: this.selectedVariants}));
      }
    }
  }

  searchTermChanged(searchTerm: string) {
    this.store.dispatch(setExperimentMetricsSearchTerm({searchTerm}));
  }

  resetMetrics() {
    this.store.dispatch(resetExperimentMetrics());
  }

  changeSmoothness($event: number) {
    this.settings = {...this.settings, smoothWeight: $event};
  }

  changeSmoothType($event: SmoothTypeEnum) {
    this.settings = {...this.settings, smoothType: $event};
  }

  changeXAxisType($event: ScalarKeyEnum) {
    this.settings = {...this.settings, xAxisType: $event};
    this.store.dispatch(getMultiScalarCharts({taskIds: this.taskIds, entity: this.entityType, metrics: this.selectedVariants, xAxisType: this.settings.xAxisType}));
  }

  changeGroupBy($event: GroupByCharts) {
    this.settings = {...this.settings, groupBy: $event};
    this.prepareGraphsAndUpdate(this.metrics, this.singleValues);
    this.graphList = this.settings.groupBy === 'none' ? buildMetricsList(this.originMetrics) : this.buildNestedListWithoutChildren(this.originMetrics);
    const selectedMetricsWithoutVariants = this.selectedVariants.map(metric => ({metric: metric.metric, variants: []}));
    this.store.dispatch(getMultiScalarCharts({
      taskIds: this.taskIds,
      entity: this.entityType,
      metrics: this.settings.groupBy === 'none' ? this.selectedVariants : selectedMetricsWithoutVariants,
      xAxisType: this.settings.xAxisType
    }));
    // if (this.singleValues) {
    //   this.graphList[singleValueChartTitle] = {singleValueChartTitle: {}};
    // }
  }

  toggleSettingsBar() {
    this.store.dispatch(toggleCompareScalarSettings());
  }

  hoverModeChanged(hoverMode: ChartHoverModeEnum) {
    this.store.dispatch(setScalarsHoverMode({hoverMode}));
  }

  createEmbedCode(event: { metrics?: string[]; variants?: string[]; domRect: DOMRect }) {
    const entityType = this.entityType === EntityTypeEnum.model ? 'model' : 'task';
    this.reportEmbed.createCode({
      type: event.metrics ? 'scalar' : 'single',
      objects: (!!event.metrics || this.taskIds.length > 1) ? this.taskIds : [...this.taskIds, ''],
      objectType: entityType,
      ...event
    });
  }

  private saveSettingsState() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {id, lastModified, selectedMetricsPlot, ...cleanSettings} = this.settings;
    if (!isEqual(cleanSettings, this.originalSettings)) {
      this.store.dispatch(setExperimentSettings({id: this.taskIds, changes: cleanSettings}));
    }
  }

  private missingVariantGraphInStore() {
    const graphs = this.graphs ? Object.keys(this.graphs) : [];
    return this.settings.selectedMetricsScalar.filter(metric => !metric.startsWith(' Summary')).some( graph => !graphs.includes(graph));
  }
}
