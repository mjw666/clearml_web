import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {NgIf} from '@angular/common';

@Component({
  selector: 'sm-section-header',
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss'],
  standalone: true,
  imports: [
    TooltipDirective,
    NgIf
  ]
})
export class SectionHeaderComponent {

  @Input() label: string;
  @Input() helpText: string;
  @Input() showBlob: boolean;
  @Input() error: string | null;

  @Output() learnMoreClicked = new EventEmitter();


  @ViewChild(MatMenuTrigger, { static: true }) trigger: MatMenuTrigger;

  openMenu() {
    this.trigger.openMenu();
  }

  closeMenu() {
    this.trigger.closeMenu();
  }
}
