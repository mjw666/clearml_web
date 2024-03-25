import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ProjectCardMenuExtendedComponent} from '~/features/projects/containers/project-card-menu-extended/project-card-menu-extended.component';
import {ProjectCardMenuComponent} from '@common/shared/ui-components/panel/project-card-menu/project-card-menu.component';
import {PipelineCardMenuComponent} from '@common/pipelines/pipeline-card-menu/pipeline-card-menu.component';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {DatasetEmptyComponent} from '@common/datasets/dataset-empty/dataset-empty.component';
import {NestedCardComponent} from '@common/nested-project-view/nested-card/nested-card.component';
import {PipelinesEmptyStateComponent} from '@common/pipelines/pipelines-page/pipelines-empty-state/pipelines-empty-state.component';
import {ProjectsHeaderComponent} from '@common/projects/dumb/projects-header/projects-header.component';
import {NestedProjectViewPageComponent} from '@common/nested-project-view/nested-project-view-page/nested-project-view-page.component';
import {TimeAgoPipe} from '@common/shared/pipes/timeAgo';
import {BreadcrumbsEllipsisPipe} from '@common/shared/pipes/breadcrumbs-ellipsis.pipe';
import {ShortProjectNamePipe} from '@common/shared/pipes/short-project-name.pipe';
import {CleanProjectPathPipe} from '@common/shared/pipes/clean-project-path.pipe';
import {CircleCounterComponent} from '@common/shared/ui-components/indicators/circle-counter/circle-counter.component';
import {InlineEditComponent} from '@common/shared/ui-components/inputs/inline-edit/inline-edit.component';
import {CardComponent} from '@common/shared/ui-components/panel/card/card.component';
import {MenuItemComponent} from '@common/shared/ui-components/panel/menu-item/menu-item.component';
import {TagsMenuComponent} from '@common/shared/ui-components/tags/tags-menu/tags-menu.component';
import {ClickStopPropagationDirective} from '@common/shared/ui-components/directives/click-stop-propagation.directive';
import {MenuComponent} from '@common/shared/ui-components/panel/menu/menu.component';
import {ShowOnlyUserWorkComponent} from '@common/shared/components/show-only-user-work/show-only-user-work.component';
import {
  MainPagesHeaderFilterComponent
} from '@common/shared/components/main-pages-header-filter/main-pages-header-filter.component';
import {DialogTemplateComponent} from '@common/shared/ui-components/overlay/dialog-template/dialog-template.component';
import {CodeEditorComponent} from '@common/shared/ui-components/data/code-editor/code-editor.component';
import {MatMenuModule} from '@angular/material/menu';
import {TooltipDirective} from '@common/shared/ui-components/indicators/tooltip/tooltip.directive';
import {ButtonToggleComponent} from '@common/shared/ui-components/inputs/button-toggle/button-toggle.component';
import {NavbarItemComponent} from '@common/shared/ui-components/panel/navbar-item/navbar-item.component';
import {SaferPipe} from '@common/shared/pipes/safe.pipe';
import {ShowTooltipIfEllipsisDirective} from '@common/shared/ui-components/indicators/tooltip/show-tooltip-if-ellipsis.directive';

const _declarations = [
  ProjectCardMenuExtendedComponent,
  PipelineCardMenuComponent,
  NestedCardComponent,
  DatasetEmptyComponent,
  NestedProjectViewPageComponent,
  ProjectsHeaderComponent
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    SaferPipe,
    TimeAgoPipe,
    BreadcrumbsEllipsisPipe,
    ShortProjectNamePipe,
    CleanProjectPathPipe,
    CircleCounterComponent,
    InlineEditComponent,
    CardComponent,
    MenuItemComponent,
    TagsMenuComponent,
    ClickStopPropagationDirective,
    ProjectCardMenuComponent,
    MenuComponent,
    ShowOnlyUserWorkComponent,
    MainPagesHeaderFilterComponent,
    DialogTemplateComponent,
    CodeEditorComponent,
    MatMenuModule,
    TooltipDirective,
    ButtonToggleComponent,
    NavbarItemComponent,
    ShowTooltipIfEllipsisDirective
  ],
  declarations: [..._declarations, PipelinesEmptyStateComponent],
  exports: [..._declarations, PipelinesEmptyStateComponent]
})
export class ProjectsSharedModule {
}
