import {AfterViewInit, Directive, OnDestroy} from '@angular/core';
import {ResizableColumn} from 'primeng/table';
import {fromEvent, Subscription} from 'rxjs';
import {cloneItemIntoDummy} from '@common/shared/utils/shared-utils';

@Directive({
  selector: '[smResizableColumn]',
  standalone: true,
})
export class ResizableColumnDirective extends ResizableColumn implements AfterViewInit, OnDestroy {
  private sub: Subscription;

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    if (this.resizer) {
      this.sub = fromEvent(this.resizer, 'dblclick').subscribe((event: MouseEvent) => {
        const width = this.calcWidth(this.el.nativeElement);
        const delta = width - this.el.nativeElement.offsetWidth;
        this.dt.onColumnResizeBegin(event);
        this.dt.onColumnResize({pageX: event.pageX + delta});
        this.dt.onColumnResizeEnd();
      });
    }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.sub?.unsubscribe();
  }

  private calcWidth(column: HTMLTableHeaderCellElement) {
    const index = column.cellIndex;
    const table = this.dt;
    const rows = [...table.el.nativeElement.getElementsByTagName('tr')] as HTMLTableRowElement[];

    const dummyContainer = document.createElement('span');
    dummyContainer.style.position = 'fixed';
    // attach the dummy container to our table so all relevant styles will apply to it
    table.el.nativeElement.appendChild(dummyContainer);

    cloneItemIntoDummy(column, dummyContainer);
    // add all relevant cells to dummy container
    rows.forEach(row => {
      const cells = row.getElementsByTagName('td');
      if (cells.length > index) {
        cloneItemIntoDummy(cells.item(index), dummyContainer);
      }
    });
    // measure and detach container
    const width = dummyContainer.offsetWidth;
    table.el.nativeElement.removeChild(dummyContainer);

    return width;
  }


}
