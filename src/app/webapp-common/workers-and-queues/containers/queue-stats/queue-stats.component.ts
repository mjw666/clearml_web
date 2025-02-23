import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {Queue} from '~/business-logic/model/queues/queue';
import {getStats, setStats, setStatsParams} from '../../actions/queues.actions';
import {selectQueuesStatsTimeFrame, selectQueueStats, selectStatsErrorNotice} from '../../reducers/index.reducer';
import {filter} from 'rxjs/operators';
import {TIME_INTERVALS} from '../../workers-and-queues.consts';
import {
  IOption
} from '@common/shared/ui-components/inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';
import {Topic} from '@common/shared/utils/statistics';

@Component({
  selector: 'sm-queue-stats',
  templateUrl: './queue-stats.component.html',
  styleUrls: ['./queue-stats.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QueueStatsComponent implements OnInit, OnDestroy {
  private chartDataSubscription: Subscription;
  private chartParamSubscription: Subscription;
  public statsError$ = this.store.select(selectStatsErrorNotice);
  public selectedQueue: Queue;
  public refreshChart = true;
  public waitChartData: Topic[];
  public lenChartData: Topic[];

  public timeFrameOptions: IOption[] = [
    {label: '3小时', value: (3 * TIME_INTERVALS.HOUR).toString()},
    {label: '6小时', value: (6 * TIME_INTERVALS.HOUR).toString()},
    {label: '12小时', value: (12 * TIME_INTERVALS.HOUR).toString()},
    {label: '1天', value: (TIME_INTERVALS.DAY).toString()},
    {label: '1周', value: (TIME_INTERVALS.WEEK).toString()},
    {label: '1个月', value: (TIME_INTERVALS.MONTH).toString()}];

  @ViewChild('waitchart', {read: ViewContainerRef, static: true}) waitChartRef: ViewContainerRef;
  private intervaleHandle: number;
  public currentTimeFrame: string;
  public trackByFn = (index: number, option: IOption) => option.value;

  @Input() set queue(queue: Queue) {
    if (this.selectedQueue !== queue) {
      this.selectedQueue = queue;
      this.updateChart();
    }
  }

  constructor(public store: Store, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.chartParamSubscription = this.store.select(selectQueuesStatsTimeFrame)
      .pipe(filter((timeFrame: string) => !!timeFrame))
      .subscribe((timeFrame) => {
        this.currentTimeFrame = timeFrame;
        this.updateChart();
        this.cdr.detectChanges();
      });
    this.chartDataSubscription = this.store.select(selectQueueStats).subscribe(
      (data) => {
        if (data && (data.wait || data.length)) {
          this.refreshChart = false;
          this.waitChartData = data.wait;
          this.lenChartData = data.length;
          this.cdr.detectChanges();
        }
      }
    );

    this.updateChart();
  }

  ngOnDestroy() {
    this.chartDataSubscription.unsubscribe();
    this.chartParamSubscription.unsubscribe();
    clearInterval(this.intervaleHandle);
  }

  updateChart() {
    clearInterval(this.intervaleHandle);
    this.refreshChart = true;
    this.store.dispatch(setStats({data: {wait: null, length: null}}));
    const range = parseInt(this.currentTimeFrame, 10);
    let width = this.waitChartRef.element.nativeElement.clientWidth | 1000;
    width = Math.min(0.8 * width, 1000);
    const granularity = Math.max(Math.floor(range / width), 5);

    this.store.dispatch(getStats({maxPoints: width}));
    this.intervaleHandle = window.setInterval(() => {
      this.store.dispatch(getStats({maxPoints: width}));
    }, granularity * 1000);
  }

  tickFormatter(seconds: number) {
    seconds = Math.floor(seconds);
    const th = Math.floor(seconds / 3600); // 3,600 seconds in 1 hour
    seconds = seconds % 3600; // seconds remaining after extracting hours
    // 3- Extract minutes:
    const tm = `${Math.floor(seconds / 60) % 100}`.padStart(2, '0'); // 60 seconds in 1 minute
    // 4- Keep only seconds not extracted to minutes:
    const ts = `${seconds % 60}`.padStart(2, '0');
    return `${th}:${tm}:${ts}`;
  }

  timeFrameChanged(value: string) {
    this.store.dispatch(setStatsParams({timeFrame: value}));
  }
}
