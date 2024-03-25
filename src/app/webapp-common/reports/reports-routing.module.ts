import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {ReportsPageComponent} from './reports-page/reports-page.component';
import {ReportComponent} from '@common/reports/report/report.component';
import {CrumbTypeEnum} from '@common/layout/breadcrumbs/breadcrumbs.component';
import {NestedReportsPageComponent} from '@common/reports/nested-reports-page/nested-reports-page.component';
import {leavingBeforeSaveAlertGuard} from '@common/shared/guards/leaving-before-save-alert.guard';
import {selectDirtyReport} from '@common/reports/reports.reducer';

export const routes: Routes = [
  {
    path: '', component: ReportsPageComponent, data: {search: true, staticBreadcrumb: [[{
        name: '报告',
        type: CrumbTypeEnum.Feature
      }]]}
  },
  // Adding project param to url, for automatic workspace switching.
  {
    path: ':projectId',
    children: [
      {path: 'reports', component: ReportsPageComponent, data: {search: true}},
      {path: 'projects', component: NestedReportsPageComponent, data: {search: true}},
      {
        path: ':reportId', component: ReportComponent,
        canDeactivate: [leavingBeforeSaveAlertGuard(selectDirtyReport)],
      }
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class ReportsRoutingModule {
}
