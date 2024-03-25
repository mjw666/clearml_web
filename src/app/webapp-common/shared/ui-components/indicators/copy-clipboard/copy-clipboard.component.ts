import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input} from '@angular/core';
import { TooltipPosition } from '@angular/material/tooltip';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ClipboardModule} from 'ngx-clipboard';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';

@Component({
  selector: 'sm-copy-clipboard',
  templateUrl: './copy-clipboard.component.html',
  styleUrls: ['./copy-clipboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TooltipDirective,
    ClipboardModule,
    ClickStopPropagationDirective
  ],
  standalone: true
})
export class CopyClipboardComponent {

  @Input() clipboardText: string;
  @Input() disabled = false;
  @Input() label: string = 'Copy to clipboard';
  @Input() tooltipText = '复制到剪切板';
  @Input() hideBackground = false;
  @Input() inline = false;
  @Input() theme: string;
  @Input() copyIcon: string;
  @Input() tooltipPosition: TooltipPosition = 'above';

  public copied = false;

  constructor(private cdr: ChangeDetectorRef) {
  }

  copyToClipboard() {
    this.copied = true;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.copied = false;
      this.cdr.detectChanges();
    }, 5000);
  }

}
