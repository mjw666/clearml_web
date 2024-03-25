import {AfterViewInit, ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {experimentListUpdated} from '../../actions/experiments-compare-details.actions';
import {selectExperimentsDetails} from '../../reducers';
import {filter, tap} from 'rxjs/operators';
import {ExperimentCompareTree, IExperimentDetail} from '~/features/experiments-compare/experiments-compare-models';
import {
  convertConfigurationFromExperiments, convertContainerScriptFromExperiments, convertExperimentsArrays, convertNetworkDesignFromExperiments, getAllKeysEmptyObject, isDetailsConverted
} from '../../jsonToDiffConvertor';
import {ExperimentCompareBase} from '../experiment-compare-base';
import {ConfigurationItem} from '~/business-logic/model/tasks/configurationItem';
import {LIMITED_VIEW_LIMIT} from '@common/experiments-compare/experiments-compare.constants';
import {EntityTypeEnum} from '~/shared/constants/non-common-consts';

@Component({
  selector: 'sm-experiment-compare-details',
  templateUrl: './experiment-compare-details.component.html',
  styleUrls: ['./experiment-compare-details.component.scss', '../../cdk-drag.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExperimentCompareDetailsComponent extends ExperimentCompareBase implements OnInit, AfterViewInit {
  public showEllipsis= true;

  constructor(
  ) {
    super();
    this.experiments$ = this.store.select(selectExperimentsDetails);
  }


  ngOnInit() {
    this.onInit();
    this.routerParamsSubscription = this.taskIds$.subscribe((experimentIds) => {
        this.store.dispatch(experimentListUpdated({ids: experimentIds.slice(0, LIMITED_VIEW_LIMIT), entity: EntityTypeEnum.experiment}));
      }
    );

    this.experimentsSubscription = this.experiments$.pipe(
      filter(experiments => !!experiments && experiments.length > 0),
      tap(experiments => {
        this.extractTags(experiments);
      }),
    ).subscribe(experiments => {
      this.originalExperiments = experiments.reduce((acc, exp) => {
        acc[exp.id] = isDetailsConverted(exp) ? this.originalExperiments[exp.id] : exp;
        return acc;
      }, {} as { [id: string]: ConfigurationItem });
      experiments = Object.values(this.originalExperiments).map(experiment => convertExperimentsArrays(experiment, this.originalExperiments[experiments[0].id], experiments));
      experiments = convertConfigurationFromExperiments(experiments, this.originalExperiments);
      experiments = convertNetworkDesignFromExperiments(experiments, this.originalExperiments);
      experiments = convertContainerScriptFromExperiments(experiments, this.originalExperiments);

      this.resetComponentState(experiments);
      this.calculateTree(experiments);
    });
  }

  buildCompareTree(experiments: Array<IExperimentDetail>, hasDataFeature?: boolean): ExperimentCompareTree {
    const mergedExperiment = getAllKeysEmptyObject(experiments);
    return experiments
      .reduce((acc, cur) => {
        acc[cur.id] = this.buildExperimentTree(cur, this.baseExperiment, mergedExperiment, hasDataFeature);

        return acc;
      }, {} as ExperimentCompareTree);
  }

  toggleEllipsis() {
    this.showEllipsis = !this.showEllipsis;
  }
}
