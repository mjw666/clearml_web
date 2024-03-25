import {NgModule} from '@angular/core';
import {CommonModule, NgOptimizedImage, TitleCasePipe} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {LoggedOutAlertComponent} from './logged-out-alert/logged-out-alert.component';
import {S3AccessDialogComponent} from './s3-access-dialog/s3-access-dialog.component';
import {S3AccessResolverComponent} from './s3-access-resolver/s3-access-resolver.component';
import {StoreModule} from '@ngrx/store';
import {LayoutReducer} from './layout.reducer';
import {ServerNotificationDialogContainerComponent} from './server-notification-dialog-container/server-notification-dialog-container.component';
import {CommonSearchModule} from '../common-search/common-search.module';
import {HeaderComponent} from './header/header.component';
import { UiUpdateDialogComponent } from './ui-update-dialog/ui-update-dialog.component';
import {SharedModule} from '~/shared/shared.module';
import {TipOfTheDayModalComponent} from './tip-of-the-day-modal/tip-of-the-day-modal.component';
import {HeaderUserMenuActionsComponent} from '~/layout/header/header-user-menu-actions/header-user-menu-actions.component';
import {WelcomeMessageComponent} from '@common/layout/welcome-message/welcome-message.component';
import {YouTubePlayerModule} from '@angular/youtube-player';
import {BreadcrumbsComponent} from '@common/layout/breadcrumbs/breadcrumbs.component';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import { HeaderNavbarTabsComponent } from '@common/layout/header-navbar-tabs/header-navbar-tabs.component';
import {SafePipe} from '@common/shared/pipes/safe.pipe';
import {CheckPermissionDirective} from '~/shared/directives/check-permission.directive';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {CheckboxControlComponent} from '@common/shared/ui-components/forms/checkbox-control/checkbox-control.component';
import {ShowOnlyUserWorkComponent} from '@common/shared/components/show-only-user-work/show-only-user-work.component';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {NavbarItemComponent} from '@common/shared/ui-components/panel/navbar-item/navbar-item.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CommonSearchModule,
    RouterModule,
    StoreModule.forFeature('layout', LayoutReducer),
    SharedModule,
    YouTubePlayerModule,
    NgOptimizedImage,
    BreadcrumbsComponent,
    LabeledFormFieldDirective,
    SafePipe,
    CheckPermissionDirective,
    CopyClipboardComponent,
    CheckboxControlComponent,
    ShowOnlyUserWorkComponent,
    DialogTemplateComponent,
    MatInputModule,
    MatMenuModule,
    NavbarItemComponent,
    MatCheckboxModule,
    TooltipDirective
  ],
  declarations: [
    HeaderComponent, LoggedOutAlertComponent,
    S3AccessResolverComponent, S3AccessDialogComponent, ServerNotificationDialogContainerComponent,
    UiUpdateDialogComponent, TipOfTheDayModalComponent, HeaderUserMenuActionsComponent, WelcomeMessageComponent, HeaderNavbarTabsComponent
  ],
  providers:[TitleCasePipe],
  exports: [HeaderComponent, LoggedOutAlertComponent, S3AccessResolverComponent, S3AccessDialogComponent, ServerNotificationDialogContainerComponent, UiUpdateDialogComponent, WelcomeMessageComponent]
})
export class CommonLayoutModule {
}
