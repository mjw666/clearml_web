import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProfileNameComponent} from '@common/settings/admin/profile-name/profile-name.component';
import {WebappConfigurationComponent} from '@common/settings/webapp-configuration/webapp-configuration.component';
import {WorkspaceConfigurationComponent} from '@common/settings/workspace-configuration/workspace-configuration.component';
import {SettingsComponent} from './settings.component';
import {CrumbTypeEnum} from '@common/layout/breadcrumbs/breadcrumbs.component';

const settingsBreadcrumb = {
  name: '设置',
  url: 'settings',
  type: CrumbTypeEnum.Feature
};

const routes: Routes = [
  {
    path: '',
    component: SettingsComponent,
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      },
      {path: 'profile',
        component: ProfileNameComponent,
        data: {
        staticBreadcrumb:[[settingsBreadcrumb, {
            name: '用户资料',
            type: CrumbTypeEnum.SubFeature
          }]]},
      },
      {
        path: 'webapp-configuration',
        component: WebappConfigurationComponent,
        data: {workspaceNeutral: true, staticBreadcrumb:[[settingsBreadcrumb, {
            name: '系统设置',
            type: CrumbTypeEnum.SubFeature
          }]]},
      },
      {
        path: 'workspace-configuration',
        component: WorkspaceConfigurationComponent,
        data: {workspaceNeutral: true, staticBreadcrumb:[[settingsBreadcrumb, {
            name: '工作空间',
            type: CrumbTypeEnum.SubFeature
          }]]},
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule {}

