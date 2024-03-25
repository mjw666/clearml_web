import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {Task} from '~/business-logic/model/tasks/task';
import {Store} from '@ngrx/store';
import {ActivatedRoute, Router} from '@angular/router';
import {
  clearQueue,
  deleteQueue,
  getQueues,
  moveExperimentInQueue,
  moveExperimentToBottomOfQueue,
  moveExperimentToOtherQueue,
  moveExperimentToTopOfQueue, Queue,
  queuesTableSortChanged,
  removeExperimentFromQueue,
  setSelectedQueue
} from '../../actions/queues.actions';
import {
  selectQueues,
  selectQueuesTableSortFields,
  selectSelectedQueue
} from '../../reducers/index.reducer';
import {filter, take, withLatestFrom} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ISmCol} from '@common/shared/ui-components/data/table/table.consts';
import {QueueCreateDialogComponent} from '@common/shared/queue-create-dialog/queue-create-dialog.component';
import {SortMeta} from 'primeng/api';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'sm-queues',
  templateUrl: './queues.component.html',
  styleUrls: ['./queues.component.scss']
})
export class QueuesComponent implements OnInit {

  public queues$: Observable<Queue[]>;
  public selectedQueue$: Observable<Queue>;
  private createQueueDialog: MatDialogRef<QueueCreateDialogComponent>;
  public tableSortOrder$: Observable<1 | -1>;
  public tableSortFields$: Observable<SortMeta[]>;
  public queuesManager: boolean;

  get routerQueueId() {
    const url = new URL(window.location.href);
    return url.searchParams.get('id');
  }

  constructor(private store: Store, private router: Router, private route: ActivatedRoute, private dialog: MatDialog) {
    this.queues$ = this.store.select(selectQueues);
    this.selectedQueue$ = this.store.select(selectSelectedQueue);
    this.tableSortFields$ = this.store.select(selectQueuesTableSortFields);
    this.queuesManager = route.snapshot.data.queuesManager;


  }

  ngOnInit(): void {
    this.store.dispatch(getQueues());

    this.queues$.pipe(
      withLatestFrom(this.selectedQueue$),
      filter(([queues, selectedQueue]) => queues && selectedQueue?.id !== this.routerQueueId),
      take(1))
      .subscribe(([queues]) => {
        const selectedQueue = queues.find(queue => queue.id === this.routerQueueId);
        this.selectQueue(selectedQueue);
      });
  }

  sortedChanged(sort: { isShift: boolean; colId: ISmCol['id'] }) {
    this.store.dispatch(queuesTableSortChanged({colId: sort.colId, isShift: sort.isShift}));
  }


  public selectQueue(queue) {
    this.router.navigate(
      [],
      {
        relativeTo: this.route,
        queryParams: {id: queue?.id},
        queryParamsHandling: 'merge'
      });
    this.store.dispatch(setSelectedQueue({queue}));
  }

  deleteQueue(queue) {
    this.store.dispatch(deleteQueue({queue}));
  }
  clearQueue(queue) {
      const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
        data: {
          title    : '清除所有挂起的任务',
          body     : `你确定要清除正在排队的${queue.entries.length}个任务${queue.entries.length>1?'':''} 当前挂起的${queue.name}队列?`,
          yes      : '确定',
          no       : '取消',
          iconClass: 'i-alert',
        }
      });

      confirmDialogRef.afterClosed().subscribe((confirmed) => {
        if (confirmed) {
          this.store.dispatch(clearQueue({queue}));
        }
      });
    }



  renameQueue(queue) {
    this.createQueueDialog = this.dialog.open(QueueCreateDialogComponent, {data: queue});
    this.createQueueDialog.afterClosed()
      .pipe(
        filter(q => !!q),
        take(1)
      )
      .subscribe(() => {
        this.store.dispatch(getQueues());
      });
  }

  moveExperimentToBottomOfQueue(task: Task) {
    this.store.dispatch(moveExperimentToBottomOfQueue({task: task.id}));
  }

  moveExperimentToTopOfQueue(task: Task) {
    this.store.dispatch(moveExperimentToTopOfQueue({task: task.id}));
  }

  removeExperimentFromQueue(task: Task) {
    this.store.dispatch(removeExperimentFromQueue({task: task.id}));
  }

  moveExperimentToOtherQueue($event) {
    this.store.dispatch(moveExperimentToOtherQueue({task: $event.task.id, queue: $event.queue.id}));
  }

  moveExperimentInQueue({task, count}) {
    this.store.dispatch(moveExperimentInQueue({task, count}));
  }
  addQueue() {
    this.dialog.open(QueueCreateDialogComponent)
      .afterClosed()
      .pipe(
        filter(queue => !!queue),
        take(1)
      )
      .subscribe(() => {
        this.store.dispatch(getQueues());
      });
  }

}
