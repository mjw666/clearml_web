import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {isEmpty} from 'lodash-es';
import {TIME_FORMAT_STRING} from '@common/constants';
import {ITask} from '~/business-logic/model/al-task';
import {CardComponent} from '@common/shared/ui-components/panel/card/card.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {CircleStatusComponent} from '@common/shared/ui-components/indicators/circle-status/circle-status.component';
import {DatePipe} from '@angular/common';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';


@Component({
  selector: 'sm-experiment-card',
  templateUrl: './experiment-card.component.html',
  styleUrls: ['./experiment-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CardComponent,
    TooltipDirective,
    CopyClipboardComponent,
    CircleStatusComponent,
    DatePipe,
    TimeAgoPipe,
    ShowTooltipIfEllipsisDirective
  ]
})
export class ExperimentCardComponent {

  public isEmpty = isEmpty;

  @Input() experiment: ITask;
  @Output() experimentCardClicked = new EventEmitter();
  TIME_FORMAT_STRING = TIME_FORMAT_STRING;

  public experimentClicked() {
    this.experimentCardClicked.emit(this.experiment);
  }

}
