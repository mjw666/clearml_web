import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from '../settings/settings.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from '~/shared/shared.module';
import {MatExpansionModule} from '@angular/material/expansion';
import {WebappConfigurationComponent} from '@common/settings/webapp-configuration/webapp-configuration.component';
import {WorkspaceConfigurationComponent} from '@common/settings/workspace-configuration/workspace-configuration.component';
import {ProfileKeyStorageComponent} from '@common/settings/admin/profile-key-storage/profile-key-storage.component';
import {ProfilePreferencesComponent} from '@common/settings/admin/profile-preferences/profile-preferences.component';
import {ProfileNameComponent} from '@common/settings/admin/profile-name/profile-name.component';
import {AdminFooterComponent} from '@common/settings/admin/admin-footer/admin-footer.component';
import {S3AccessComponent} from '@common/settings/admin/s3-access/s3-access.component';
import {AdminDialogTemplateComponent} from '@common/settings/admin/admin-dialog-template/admin-dialog-template.component';
import {AdminCredentialTableComponent} from '@common/settings/admin/admin-credential-table/admin-credential-table.component';
import {AdminFooterActionsComponent} from '~/features/settings/containers/admin/admin-footer-actions/admin-footer-actions.component';
import {UserCredentialsComponent} from '~/features/settings/containers/admin/user-credentials/user-credentials.component';
import {UserDataComponent} from '~/features/settings/containers/admin/user-data/user-data.component';
import {UsageStatsComponent} from '~/features/settings/containers/admin/usage-stats/usage-stats.component';
import {CreateCredentialDialogComponent} from '~/features/settings/containers/admin/create-credential-dialog/create-credential-dialog.component';
import {RedactedArgumentsDialogComponent} from '@common/settings/admin/redacted-arguments-dialog/redacted-arguments-dialog.component';
import {LayoutModule} from '~/layout/layout.module';
import {LabeledFormFieldDirective} from '@common/shared/directive/labeled-form-field.directive';
import {UuidPipe} from '@common/shared/pipes/uuid.pipe';
import {MatInputModule} from '@angular/material/input';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {InlineEditComponent} from '@common/shared/ui-components/inputs/inline-edit/inline-edit.component';
import {CopyClipboardComponent} from '@common/shared/ui-components/indicators/copy-clipboard/copy-clipboard.component';
import {NavbarItemComponent} from '@common/shared/ui-components/panel/navbar-item/navbar-item.component';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import {FilterPipe} from '@common/shared/pipes/filter.pipe';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {KeyValuePipe} from '@common/shared/pipes/key-value.pipe';
import {ButtonToggleComponent} from '@common/shared/ui-components/inputs/button-toggle/button-toggle.component';
import {LabelValuePipe} from '@common/shared/pipes/label-value.pipe';



@NgModule({
  declarations: [
    SettingsComponent,
    UsageStatsComponent,
    UserDataComponent,
    UserCredentialsComponent,
    AdminFooterActionsComponent,
    AdminCredentialTableComponent,
    AdminDialogTemplateComponent,
    S3AccessComponent,
    CreateCredentialDialogComponent,
    AdminFooterComponent,
    ProfileNameComponent,
    ProfilePreferencesComponent,
    ProfileKeyStorageComponent,
    WorkspaceConfigurationComponent,
    WebappConfigurationComponent,
    RedactedArgumentsDialogComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    MatExpansionModule,
    FormsModule,
    LayoutModule,
    LabeledFormFieldDirective,
    UuidPipe,
    MatInputModule,
    DialogTemplateComponent,
    MatSlideToggleModule,
    InlineEditComponent,
    CopyClipboardComponent,
    NavbarItemComponent,
    TooltipDirective,
    MatSidenavModule,
    MatListModule,
    FilterPipe,
    MatButtonToggleModule,
    KeyValuePipe,
    ButtonToggleComponent,
    LabelValuePipe
  ],
  exports: [
    UserCredentialsComponent,
    AdminFooterComponent,
    ProfilePreferencesComponent,
    ProfileNameComponent,
    WebappConfigurationComponent,
  ]
})
export class SettingsModule { }
