import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  Output, SimpleChanges,
  ViewChild
} from '@angular/core';
import {Subject, Subscription, timer} from 'rxjs';
import {debounce, distinctUntilChanged, filter, tap} from 'rxjs/operators';
import {NgIf} from '@angular/common';


@Component({
  selector: 'sm-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    NgIf
  ]
})
export class SearchComponent implements OnInit, OnChanges, OnDestroy {

  public value$ = new Subject();

  @Input() minimumChars = 3;
  @Input() debounceTime = 300;
  @Input() placeholder: string = '输入要搜索的内容';
  @Input() hideIcons: boolean = false;
  @Input() expandOnHover = false;
  @Input() enableNavigation = false;
  @Input() searchResultsCount = null;
  @Input() searchCounterIndex = -1;
  public empty = true;
  public active: boolean = true;
  public countResults: number;
  public focused: boolean;
  private subs = new Subscription();

  @Input() set value(value: string) {
    this.searchBarInput.nativeElement.value = value || '';
  }

  @Output() valueChanged = new EventEmitter<string>();
  @ViewChild('searchBar', {static: true}) searchBarInput;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subs.add(this.value$.pipe(
      tap((val: string) => this.empty = val?.length === 0),
      distinctUntilChanged(),
      debounce((val: string) => val.length > 0 ? timer(this.debounceTime) : timer(0)),
      filter(val => val.length >= this.minimumChars || val.length === 0)
    )
      .subscribe((value: string) => {
        if (value.length >= this.minimumChars) {
          this.valueChanged.emit(value);
        } else {
          // in case user backspace all chars
          this.valueChanged.emit('');
          this.clear(true);
        }
        this.cdr.detectChanges();
      }));
  }

  ngOnDestroy() {
    this.subs?.unsubscribe();
  }

  onKeyDown(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
      this.clear();
    } else if (event.key === 'Enter' &&
      (!this.enableNavigation || (this.searchCounterIndex + 1 < this.searchResultsCount)) &&
      this.searchBarInput.nativeElement.value.length > 0
    ) {
      this.valueChanged.emit(this.searchBarInput.nativeElement.value);
    }
  }

  onValueChange() {
    this.value$.next(this.searchBarInput.nativeElement.value);
  }

  clear(focus = true) {
    this.value$.next('');
    this.searchBarInput.nativeElement.value = '';
    focus && this.searchBarInput.nativeElement.focus();
  }

  updateActive(active: boolean) {
    if (this.expandOnHover) {
      if (this.empty) {
        this.active = active;
        this.searchBarInput.nativeElement.focus();
      } else {
        this.active = true;
      }
    }
  }

  findNext(backward?: boolean) {
    this.valueChanged.emit(backward ? null : this.searchBarInput.nativeElement.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.expandOnHover) {
      this.active = !changes.expandOnHover.currentValue;
    }
  }

  focusInput($event: boolean) {
    this.focused = $event;
  }

  getFocus() {
    this.searchBarInput.nativeElement.focus();
  }
}
