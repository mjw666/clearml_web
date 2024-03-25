import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {Observable, Subscription} from 'rxjs';
import {IExecutionForm, sourceTypesEnum} from '~/features/experiments/shared/experiment-execution.model';
import {
  selectIsExperimentEditable,
  selectShowExtraDataSpinner
} from '~/features/experiments/reducers';
import * as commonInfoActions from '../../actions/common-experiments-info.actions';
import {
  selectExperimentExecutionInfoData,
  selectIsExperimentSaving,
  selectIsSelectedExperimentInDev
} from '../../reducers';
import {selectBackdropActive, selectHideRedactedArguments} from '@common/core/reducers/view.reducer';
import {EditJsonComponent, EditJsonData} from '@common/shared/ui-components/overlay/edit-json/edit-json.component';
import {filter, take} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {EditableSectionComponent} from '@common/shared/ui-components/panel/editable-section/editable-section.component';
import {
  ExperimentExecutionSourceCodeComponent
} from '../../dumb/experiment-execution-source-code/experiment-execution-source-code.component';
import {isUndefined} from 'lodash-es';
import {ActivatedRoute} from '@angular/router';
import {Container} from '~/business-logic/model/tasks/container';
import {
  IOption
} from '@common/shared/ui-components/inputs/select-autocomplete-with-chips/select-autocomplete-with-chips.component';

@Component({
  selector: 'sm-experiment-info-execution',
  templateUrl: './experiment-info-execution.component.html',
  styleUrls: ['./experiment-info-execution.component.scss']
})
export class ExperimentInfoExecutionComponent implements OnInit, OnDestroy {

  public executionInfo$: Observable<IExecutionForm>;
  public showExtraDataSpinner$: Observable<boolean>;
  public editable$: Observable<boolean>;
  public isInDev$: Observable<boolean>;
  public saving$: Observable<boolean>;
  public backdropActive$: Observable<boolean>;
  public formData: IExecutionForm;
  private formDataSubscription: Subscription;
  public minimized: boolean;

  @ViewChild('outputDestination') outputDestination: ElementRef;
  @ViewChild('orchestration') orchestration: ElementRef;
  @ViewChild('sourceCode') sourceCode: ExperimentExecutionSourceCodeComponent;

  @ViewChild('diffSection') diffSection: EditableSectionComponent;
  @ViewChild('requirementsSection') requirementsSection: EditableSectionComponent;

  @ViewChild('containerImage') containerImage: ElementRef;
  @ViewChild('containerArguments') containerArguments: ElementRef;
  links = ['details', 'uncommitted changes', 'installed packages', 'container'];
  currentLink = 'details';
  public redactedArguments$: Observable<{ key: string }[]>;
  public selectedRequirement = 'pip';
  public editableRequirements = false;
  private requirementLabels: IExecutionForm['requirements'] = {
    pip: 'PIP',
    orgPip: 'Original PIP',
    conda: 'Conda',
    orgConda: 'Original Conda'
  };
  public requirementsOptions: IOption[];

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private element: ElementRef
  ) {
    this.minimized = this.route.snapshot.routeConfig?.data?.minimized ?? false;
    this.executionInfo$ = this.store.select(selectExperimentExecutionInfoData);
    this.showExtraDataSpinner$ = this.store.select(selectShowExtraDataSpinner);
    this.editable$ = this.store.select(selectIsExperimentEditable);
    this.isInDev$ = this.store.select(selectIsSelectedExperimentInDev);
    this.saving$ = this.store.select(selectIsExperimentSaving);
    this.backdropActive$ = this.store.select(selectBackdropActive);
    this.redactedArguments$ = this.store.select(selectHideRedactedArguments);

  }

  ngOnInit() {
    this.store.dispatch(commonInfoActions.setExperimentFormErrors({errors: null}));

    this.formDataSubscription = this.executionInfo$.subscribe(formData => {
      this.formData = formData;
      if (formData) {
        this.requirementsOptions = Object.keys(this.requirementLabels)
          .filter(key => Object.hasOwn(formData?.requirements ?? {}, key))
          .map(key => ({
          value: key,
          label: this.requirementLabels[key]
        } as IOption));
        if (!Object.hasOwn(formData?.requirements ?? {}, this.selectedRequirement)) {
          this.selectedRequirement = 'pip';
        }
        this.editableRequirements = this.selectedRequirement === 'pip';
      }
    });
  }

  ngOnDestroy(): void {
    this.formDataSubscription.unsubscribe();
  }

  saveSourceData() {
    const source = this.sourceCode.sourceCodeForm.form.value as IExecutionForm['source'];
    this.store.dispatch(commonInfoActions.saveExperimentSection({
      script: {
        /* eslint-disable @typescript-eslint/naming-convention */
        repository: source.repository,
        entry_point: source.entry_point,
        working_dir: source.working_dir,
        binary: source.binary?.trim(),
        /* eslint-enable @typescript-eslint/naming-convention */
        ...this.convertScriptType(source)
      }
    }));
  }

  saveContainerData(container: Container) {
    this.store.dispatch(commonInfoActions.saveExperimentSection({container: {...this.formData.container, ...container}}));
  }

  saveOutputData() {
    const outputDestination = this.outputDestination.nativeElement.value;

    // why BE can't get output.destination as task.edit?
    // eslint-disable-next-line @typescript-eslint/naming-convention
    this.store.dispatch(commonInfoActions.saveExperimentSection({output_dest: outputDestination} as any));
  }

  cancelFormChange() {
    this.store.dispatch(commonInfoActions.deactivateEdit());
  }

  activateEditChanged(sectionName: string, section?: EditableSectionComponent) {
    const element = section?.elementRef?.nativeElement;
    if (element) {
      window.setTimeout(() => {
        const bounding = element.getBoundingClientRect();
        const containerRect = this.element.nativeElement.getBoundingClientRect();
        if (bounding.bottom > window.innerHeight && bounding.top > containerRect.top) {
          this.element.nativeElement.scroll({top: element.offsetTop, behavior: 'smooth'} as ScrollToOptions);
        }
      });
    }
    this.store.dispatch(commonInfoActions.activateEdit(sectionName));
  }

  discardDiff() {
    const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Discard diff',
        body: 'Uncommitted changes will be discarded',
        yes: 'Discard',
        no: 'Cancel',
        iconClass: 'al-icon al-ico-trash al-color blue-300',
      }
    });

    confirmDialogRef.afterClosed().pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.activateEditChanged('diff');
        this.store.dispatch(commonInfoActions.saveExperimentSection({script: {diff: ''}}));
      }
    });
  }

  editContainerSetupShellScript(smEditableSection?: EditableSectionComponent) {
    this.openEditJsonDialog({
      textData: this.formData.container?.setup_shell_script,
      title: '编辑启动脚本'
    }, smEditableSection)
      .afterClosed()
      .pipe(filter(bool => !isUndefined(bool)))
      .subscribe(setupShellScript => {
        if (this.formData.container.setup_shell_script !== setupShellScript) {
          smEditableSection.saveSection();
          // eslint-disable-next-line @typescript-eslint/naming-convention
          this.store.dispatch(commonInfoActions.saveExperimentSection({
            container: {
              ...this.formData.container,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              setup_shell_script: setupShellScript
            }
          }));
        } else {
          smEditableSection.cancelClickedEvent();
        }
      });
  }

  editInstallPackages() {
    const editInstallPackagesDialog = this.dialog.open(EditJsonComponent, {
      data: {
        textData: this.formData?.requirements?.pip,
        readOnly: false,
        title: '编辑已安装的软件包',
      } as EditJsonData
    });

    editInstallPackagesDialog.afterClosed().pipe(take(1)).subscribe((data) => {
      if (data === undefined) {
        this.requirementsSection.cancelClickedEvent();
      } else {
        this.requirementsSection.saveSection();
        this.store.dispatch(commonInfoActions.saveExperimentSection({
          script: {
            requirements: {
              ...this.formData.requirements,
              pip: data
            }
          }
        }));
      }
    });
  }

  editDiff() {
    this.openEditJsonDialog({
      textData: this.formData?.diff,
      readOnly: false,
      title: '编辑未提交的更改',
    }, this.diffSection)
      .afterClosed()
      .pipe(take(1))
      .subscribe((data) => {
        this.diffSection.unsubscribeToEventListener();
        if (!isUndefined(data)) {
          this.store.dispatch(commonInfoActions.saveExperimentSection({script: {diff: data}}));
        }
      });
  }

  clearInstalledPackages() {
    this.clearConfirmDialog('已安装的软件包').pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.activateEditChanged('requirements');
        this.store.dispatch(commonInfoActions.saveExperimentSection({script: {requirements: {}}}));
      }
    });
  }

  clearSetupShellScript() {
    this.clearConfirmDialog('shell脚本').pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        this.store.dispatch(commonInfoActions.saveExperimentSection({
          container: {
            ...this.formData.container,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            setup_shell_script: ''
          }
        }));
      }
    });
  }

  private clearConfirmDialog(title: string): Observable<boolean> {
    return this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: `清除${title}`,
        body: `你确定要清除${title.charAt(0).toUpperCase() + title.slice(1)}的全部内容吗?`,
        yes: '确定',
        no: '取消',
        iconClass: 'al-icon al-ico-trash al-color blue-300',
      }
    }).afterClosed();

  }

  private openEditJsonDialog(data: { textData: string; readOnly?: boolean; title?: string; format?: string }, editableSectionComponent?: EditableSectionComponent): MatDialogRef<EditJsonComponent> {
    const editJsonComponent = this.dialog.open(EditJsonComponent, {
      data
    });
    editJsonComponent.afterClosed().subscribe(res => {
      if (isUndefined(res) && !isUndefined(editJsonComponent)) {
        editableSectionComponent.cancelClickedEvent();
      }
    });
    return editJsonComponent;
  }

  private convertScriptType(source: IExecutionForm['source']) {
    switch (source.scriptType) {
      case sourceTypesEnum.Branch:
        return {[sourceTypesEnum.Branch]: source.branch, [sourceTypesEnum.Tag]: '', [sourceTypesEnum.VersionNum]: ''};
      case sourceTypesEnum.Tag:
        return {
          [sourceTypesEnum.Branch]: source.branch,
          [sourceTypesEnum.Tag]: source.tag,
          [sourceTypesEnum.VersionNum]: ''
        };
      case sourceTypesEnum.VersionNum:
        return {
          [sourceTypesEnum.Branch]: source.branch,
          [sourceTypesEnum.Tag]: source.tag,
          [sourceTypesEnum.VersionNum]: source.version_num
        };
    }
  }

  showSection(selection: string) {
    this.currentLink = selection;
  }

  requirementChanged(type: string) {
    this.selectedRequirement = type;
    this.editableRequirements = this.selectedRequirement === 'pip';
  }
}
