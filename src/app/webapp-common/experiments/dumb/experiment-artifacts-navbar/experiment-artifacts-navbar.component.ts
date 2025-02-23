import {Component, Input, OnChanges} from '@angular/core';
import {ActiveSectionEnum} from '@common/experiments/experiment.consts';
import {Artifact} from '~/business-logic/model/tasks/artifact';
import {IModelInfo} from '../../shared/common-experiment-model.model';

@Component({
  selector   : 'sm-experiment-artifacts-navbar',
  templateUrl: './experiment-artifacts-navbar.component.html',
  styleUrls  : ['./experiment-artifacts-navbar.component.scss']
})
export class ExperimentArtifactsNavbarComponent implements OnChanges{
  readonly DATA_AUDIT_TABLE = 'data-audit-table';
  public dataAuditArtifacts: Artifact[];
  public otherArtifacts: Artifact[];
  public ACTIVE_SECTIONS    = ActiveSectionEnum;
  public noItemsMode: boolean;

  @Input() set artifacts(artifacts: Array<Artifact>) {
    if (artifacts) {
      this.dataAuditArtifacts = artifacts.filter(artifact => artifact.type === this.DATA_AUDIT_TABLE);
      this.otherArtifacts     = artifacts.filter(artifact => artifact.type !== this.DATA_AUDIT_TABLE);
    }
  }

  @Input() selectedArtifactKey;
  @Input() outputModels: IModelInfo[];
  @Input() inputModels: IModelInfo[];
  @Input() editable;
  @Input() activeSection: ActiveSectionEnum;
  @Input() routerConfig: string[];

  constructor() {
  }

  trackByFn(index, artifact) {
    return (artifact.key + artifact.mode);
  }

  ngOnChanges(): void {
    this.noItemsMode = this.outputModels?.length === 0 && this.inputModels?.length === 0 && this.dataAuditArtifacts?.length === 0 && this.otherArtifacts?.length === 0;
  }
}
