import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  IDurationThan,
  ImmediateErrorStateMatcher,
  TableDurationSortBaseComponent
} from '../table-duration-sort-base.component';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {distinctUntilChanged, debounceTime, filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';
import {isNil} from 'lodash-es';
import {
  TableFilterDurationErrorComponent
} from '@common/shared/ui-components/data/table/table-duration-sort-template/table-filter-duration-error/table-filter-duration-error.component';
import {DividerComponent} from '@common/shared/ui-components/indicators/divider/divider.component';
import {MatInputModule} from '@angular/material/input';
import {NgIf} from '@angular/common';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {
  KeydownStopPropagationDirective
} from '@common/shared/ui-components/directives/keydown-stop-propagation.directive';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';

const getDurationValue = (value: IDurationThan) => value.checked ? `${value.value}` : '';


@Component({
  selector: 'sm-table-filter-duration-numeric',
  templateUrl: './table-filter-duration-numeric.component.html',
  styleUrls: ['./table-filter-duration-numeric.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TableFilterDurationErrorComponent,
    DividerComponent,
    MatInputModule,
    ReactiveFormsModule,
    NgIf,
    ClickStopPropagationDirective,
    KeydownStopPropagationDirective,
    LabeledFormFieldDirective
  ],
  standalone: true

})
export class TableFilterDurationNumericComponent extends TableDurationSortBaseComponent implements OnInit, OnDestroy {
  private subscription: Subscription;
  immediate = new ImmediateErrorStateMatcher();
  numericPattern = '(|-?(0\\.|\\.|)\\d*)';

  iterationsForm = new FormGroup( {
    greaterThan: new FormControl<string>('', [Validators.pattern(this.numericPattern)]),
    lessThan: new FormControl<string>('', [Validators.pattern(this.numericPattern)])
  });

  ngOnInit(): void {
    this.iterationsForm.valueChanges
      .pipe(
        debounceTime(200),
        filter(() => this.iterationsForm.valid),
        distinctUntilChanged()
      )
      .subscribe( ({greaterThan, lessThan}) => {
        !!greaterThan != this.greaterThan.checked && this.setCheckBox(!this.greaterThan.checked, 'greaterThan', false);
        this.timeStampChanged(greaterThan ? parseInt(greaterThan, 10) : greaterThan, 'greaterThan');
        !!lessThan != this.lessThan.checked && this.setCheckBox(!this.lessThan.checked, 'lessThan', false);
        this.timeStampChanged(lessThan ? parseInt(lessThan, 10) : lessThan, 'lessThan');
      });
  }

  parseServerDataFunction(data): number {
    return +data;
  }
  prepareDataToServerFunction(data): string | number | null {
    return isNil(data) || data === '' ? null : +data ;
  }

  _updateValue(): void {
    const greaterThan = getDurationValue(this.greaterThan);
    const lessThan = getDurationValue(this.lessThan);
    this.iterationsForm.get('greaterThan').setValue(greaterThan);
    this.iterationsForm.get('lessThan').setValue(lessThan);
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
