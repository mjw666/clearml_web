import {ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {MetricVariantResult} from '~/business-logic/model/projects/metricVariantResult';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {MetricValueType} from '@common/experiments-compare/experiments-compare.constants';

export interface SelectionEvent {
  variant: MetricVariantResult;
  addCol: boolean;
  valueType: MetricValueType;
}

@Component({
  selector   : 'sm-select-metric-for-custom-col',
  templateUrl: './select-metric-for-custom-col.component.html',
  styleUrls  : ['./select-metric-for-custom-col.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectMetricForCustomColComponent {
  public metricTree: {[metricName: string]: MetricVariantResult[]};
  public filteredMetricTree: [string, MetricVariantResult[]][];
  public expandedMetrics = {};
  public metricsCols: {[metVar: string]: string[]};
  public searchText: any;
  public entriesLimit = 300;
  public moreResults: number;
  trackByMetric = (index, entry: [string, MetricVariantResult[]]) => entry[1][0].metric_hash;
  trackByVariant = (index, variant: MetricVariantResult) => variant.variant_hash;
  private debounceTimer: number;

  @Input() set metricVariants(metricVar: Array<MetricVariantResult>) {
    if (metricVar === null) {
      return;
    }
    this.metricTree = metricVar?.reduce((result, metric) => {
      result[metric.metric] ? result[metric.metric].push(metric) : result[metric.metric] = [metric];
      return result;
    }, {} as {[metricName: string]: MetricVariantResult[]});
    this.filteredMetricTree = Object.entries(this.metricTree || {}).slice(0, this.entriesLimit);
    this.moreResults = Object.keys(this.metricTree || {}).length - this.filteredMetricTree.length;
  }

  @Input() set tableCols(tableCols) {
    this.metricsCols = {};
    tableCols.filter(tableCol => tableCol.metric_hash).forEach(tableCol => {
      this.expandedMetrics[tableCol.metric_hash] = this.expandedMetrics[tableCol.metric_hash] ?? true;
      this.metricsCols[tableCol.metric_hash + tableCol.variant_hash] ?
        this.metricsCols[tableCol.metric_hash + tableCol.variant_hash].push(tableCol.valueType) :
        this.metricsCols[tableCol.metric_hash + tableCol.variant_hash] = [tableCol.valueType];
    });
  }
  @Input() multiSelect = true;
  @Input() skipValueType = false;
  @Output() getMetricsToDisplay  = new EventEmitter();
  @Output() selectedMetricToShow = new EventEmitter<SelectionEvent>();
  @Output() goBack               = new EventEmitter();

  constructor(private changeDetectorRef: ChangeDetectorRef) {
  }

  toggleAllMetricsToDisplay(variant: any, on: boolean) {
    if (!on) {
      this.toggleMetricToDisplay(variant, on, null);
      this.multiSelect ?
        this.metricsCols[variant.metric_hash + variant.variant_hash] = [] :
        this.metricsCols = {[variant.metric_hash + variant.variant_hash]: []};
    } else {
      this.toggleMetricToDisplay(variant, on, 'value');
      this.toggleMetricToDisplay(variant, on, 'min_value');
      this.toggleMetricToDisplay(variant, on, 'max_value');
    }
  }

  public toggleMetricToDisplay(variant: ISmCol, value: boolean, valueType: MetricValueType) {
    this.selectedMetricToShow.emit({variant, addCol: !value, valueType});
  }

  public searchQ(value: string) {
    window.clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      this.searchText = value;
      if (value?.length > 0) {
        this.filteredMetricTree = Object.entries(this.metricTree).filter(([, results]) =>
          results.some(variant => variant.variant.includes(value))
        );
        this.moreResults = this.filteredMetricTree.length - this.entriesLimit;
        this.filteredMetricTree = this.filteredMetricTree.slice(0, this.entriesLimit);
      } else {
        this.filteredMetricTree = Object.entries(this.metricTree).slice(0, this.entriesLimit);
        this.moreResults = Object.keys(this.metricTree).length - this.filteredMetricTree.length;
      }
      this.changeDetectorRef.detectChanges();
    }, 275);
  }
}
