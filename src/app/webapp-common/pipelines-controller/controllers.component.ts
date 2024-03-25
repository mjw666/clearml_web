import {Component, OnInit, ViewChild} from '@angular/core';
import {ExperimentsComponent} from '@common/experiments/experiments.component';
import {INITIAL_CONTROLLER_TABLE_COLS} from '@common/pipelines-controller/controllers.consts';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';
import {Observable} from 'rxjs';
import {
  CountAvailableAndIsDisableSelectedFiltered,
  MenuItems,
  selectionDisabledContinue
} from '@common/shared/entity-page/items.utils';
import {ShowItemsFooterSelected} from '@common/shared/entity-page/footer-items/show-items-footer-selected';
import {CompareFooterItem} from '@common/shared/entity-page/footer-items/compare-footer-item';
import {DividerFooterItem} from '@common/shared/entity-page/footer-items/divider-footer-item';
import {ArchiveFooterItem} from '@common/shared/entity-page/footer-items/archive-footer-item';
import {SelectedTagsFooterItem} from '@common/shared/entity-page/footer-items/selected-tags-footer-item';
import {HasReadOnlyFooterItem} from '@common/shared/entity-page/footer-items/has-read-only-footer-item';
import {
  PipelineControllerMenuComponent
} from '@common/pipelines-controller/pipeline-controller-menu/pipeline-controller-menu.component';
import {
  PipelineControllerInfoComponent
} from '@common/pipelines-controller/pipeline-controller-info/pipeline-controller-info.component';
import {AbortFooterItem} from '@common/shared/entity-page/footer-items/abort-footer-item';
import {removeTag} from '@common/experiments/actions/common-experiments-menu.actions';
import {ISelectedExperiment} from '~/features/experiments/shared/experiment-info.model';
import {DeleteFooterItem} from '@common/shared/entity-page/footer-items/delete-footer-item';
import {setBreadcrumbsOptions} from '@common/core/actions/projects.actions';
import {withLatestFrom} from 'rxjs/operators';
import {selectDefaultNestedModeForFeature} from '@common/core/reducers/projects.reducer';

@Component({
  selector: 'sm-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.scss']
})
export class ControllersComponent extends ExperimentsComponent implements OnInit {

  @ViewChild('contextMenu') override contextMenu: PipelineControllerMenuComponent;
  @ViewChild(PipelineControllerInfoComponent) diagram: PipelineControllerInfoComponent;

  constructor() {
    super();
    this.tableCols = INITIAL_CONTROLLER_TABLE_COLS;
    this.entityType = EntityTypeEnum.controller;
  }

  override createFooterItems(config: {
    entitiesType: EntityTypeEnum;
    selected$: Observable<Array<{id :string}>>;
    showAllSelectedIsActive$: Observable<boolean>;
    tags$: Observable<string[]>;
    data$?: Observable<Record<string, CountAvailableAndIsDisableSelectedFiltered>>;
    companyTags$: Observable<string[]>;
    projectTags$: Observable<string[]>;
    tagsFilterByProject$: Observable<boolean>;
  }) {
    super.createFooterItems(config);
    this.footerItems = [
      new ShowItemsFooterSelected(config.entitiesType),
      new CompareFooterItem(config.entitiesType),
      new DividerFooterItem(),
      new ArchiveFooterItem(config.entitiesType),
      new DeleteFooterItem(),
      new AbortFooterItem(config.entitiesType),
      new DividerFooterItem(),
      new SelectedTagsFooterItem(config.entitiesType),
      new HasReadOnlyFooterItem()
    ];
  }

  override onFooterHandler({emitValue, item}, entityType?) {
    this.singleRowContext = false;

    window.setTimeout(() => {
      switch (item.id) {
        case MenuItems.delete:
          this.contextMenu.deleteExperimentPopup(entityType || EntityTypeEnum.controller, true);
          break;
        case MenuItems.abort:
          this.contextMenu.abortControllerPopup();
          break;
        default:
          super.onFooterHandler({emitValue, item});
      }
    });
  }

  protected override getParamId(params) {
    return params?.controllerId;
  }

  newRun() {
    this.contextMenu.runPipelineController(true);
  }

  removeTag({experiment, tag}: { experiment: ISelectedExperiment; tag: string }) {
    this.store.dispatch(removeTag({experiments: [experiment], tag}));
  }

  override getSingleSelectedDisableAvailable(experiment) {
    return {
      ...(super.getSingleSelectedDisableAvailable(experiment)),
      [MenuItems.continue]: selectionDisabledContinue([experiment])
    };
  }

  override downloadTableAsCSV() {
    this.table.table.downloadTableAsCSV(`ClearML ${this.selectedProject.id === '*'? 'All': this.selectedProject?.basename?.substring(0,60)} Pipelines`);
  }
  override setupBreadcrumbsOptions() {
    this.sub.add(this.selectedProject$.pipe(
      withLatestFrom(this.store.select(selectDefaultNestedModeForFeature))
    ).subscribe(([selectedProject, defaultNestedModeForFeature]) => {
      this.store.dispatch(setBreadcrumbsOptions({
        breadcrumbOptions: {
          showProjects: !!selectedProject,
          featureBreadcrumb: {
            name: '工作流',
            url: defaultNestedModeForFeature['pipelines'] ? 'pipelines/*/projects' : 'pipelines'
          },
          projectsOptions: {
            basePath: 'pipelines',
            filterBaseNameWith: ['.pipelines'],
            compareModule: null,
            showSelectedProject: selectedProject?.id !== '*',
            ...(selectedProject && selectedProject?.id !== '*' && {selectedProjectBreadcrumb: {name: selectedProject?.basename}})
          }
        }
      }));
    }));
  }
}
