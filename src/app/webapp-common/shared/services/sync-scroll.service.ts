import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';

interface SyncScrollData {
  scrollTop: number;
  scrollLeft: number;
}

@Injectable({
  providedIn: 'root'
})
export class SyncScrollService {

  private scrollSubject: Subject<SyncScrollData> = new Subject();
  private timer: number;
  public  originalTarget: EventTarget;

  setScroll(scroll: SyncScrollData) {
    this.scrollSubject.next(scroll);
  }

  getScroll(): Observable<SyncScrollData> {
    return this.scrollSubject.asObservable();
  }

  updateOriginalTarget(target: EventTarget) {
    this.originalTarget = this.originalTarget || target;
    window.clearInterval(this.timer);
    this.timer = window.setTimeout( () => this.originalTarget = null, 200);
  }
}
