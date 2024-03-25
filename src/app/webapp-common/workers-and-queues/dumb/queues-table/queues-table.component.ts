import {ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {ColHeaderTypeEnum, ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {find, get} from 'lodash-es';
import {QUEUES_TABLE_COL_FIELDS} from '../../workers-and-queues.consts';
import {BaseTableView} from '@common/shared/ui-components/data/table/base-table-view';
import {ActivatedRoute} from '@angular/router';
import {ICONS} from '@common/constants';
import {Queue} from '@common/workers-and-queues/actions/queues.actions';


@Component({
  selector: 'sm-queues-table',
  templateUrl: './queues-table.component.html',
  styleUrls: ['./queues-table.component.scss']
})
export class QueuesTableComponent extends BaseTableView {
  public cols: Array<ISmCol>;
  public readonly QUEUES_TABLE_COL_FIELDS = QUEUES_TABLE_COL_FIELDS;
  public menuOpen: boolean;
  private _queues: Array<Queue>;
  public queuesManager: boolean;
  readonly ICONS = ICONS;
  contextQueue: Queue;

  @Input() set queues(queues: Queue[]) {
    this._queues = queues;
    this.table && this.table.focusSelected();
  }

  get queues() {
    return this._queues;
  }

  @Input() selectedQueue: Queue;
  @Output() queueSelected = new EventEmitter();
  @Output() deleteQueue = new EventEmitter();
  @Output() renameQueue = new EventEmitter();
  @Output() clearQueue = new EventEmitter();
  @Output() sortedChanged = new EventEmitter<{ isShift: boolean; colId: ISmCol['id'] }>();

  @ViewChild('tableContainer', {static: false}) tableContainer;

  public menuPosition: { x: number; y: number };

  constructor(private changeDetector: ChangeDetectorRef, private route: ActivatedRoute) {
    super();
    this.queuesManager = route.snapshot.data.queuesManager;
    this.cols = [
      {
        id: QUEUES_TABLE_COL_FIELDS.NAME,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: '队列',
        style: {width: '35%', maxWidth: '600px'},
        sortable: true,
      },
      {
        id: QUEUES_TABLE_COL_FIELDS.WORKERS,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: '工作',
        style: {width: '80px', maxWidth: '100px'},
        sortable: true,
      },
      {
        id: QUEUES_TABLE_COL_FIELDS.TASK,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: '下一个实验',
        style: {width: '30%', maxWidth: '600px'},
        sortable: true,
      },
      {
        id: QUEUES_TABLE_COL_FIELDS.LAST_UPDATED,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: '最后更新时间',
        style: {width: '150px',  maxWidth: '200px'},
        sortable: true,
      },
      {
        id: QUEUES_TABLE_COL_FIELDS.IN_QUEUE,
        headerType: ColHeaderTypeEnum.sortFilter,
        header: '在队列中',
        style: {width: '100px',  maxWidth: '150px'},
        sortable: true,
      }
    ];
  }

  getBodyData(rowData: any, col: ISmCol) {
    return get(rowData, col.id);
  }

  getQNames(queues) {
    return queues.map(queue => this.getQName(queue));
  }

  getQName(queue) {
    const queueIns: any = find(this.queues, {id: queue});
    return queueIns ? queueIns.name : queue;
  }

  onRowClicked(event) {
    this.queueSelected.emit(event.data);
  }

  openContextMenu(data) {
    data.e.preventDefault();
    this.contextQueue = data.rowData;
    this.menuOpen = false;
    setTimeout(() => {
      this.menuPosition = {x: data.e.clientX, y: data.e.clientY};
      this.menuOpen = true;
      this.changeDetector.detectChanges();
    }, 0);

  }

  override scrollTableToTop() {
    this.tableContainer.nativeElement.scroll({top: 0});
  }

  onSortChanged(isShift: boolean, colId: ISmCol['id']) {
    this.sortedChanged.emit({isShift, colId});
    this.scrollTableToTop();
  }

  override afterTableInit(): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  emitSelection(selection: any[]) {
  }
}
