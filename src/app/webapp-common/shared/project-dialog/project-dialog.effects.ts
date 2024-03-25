import * as newProjectActions from './project-dialog.actions';
import {activeLoader, addMessage, deactivateLoader} from '../../core/actions/layout.actions';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {ApiProjectsService} from '~/business-logic/api-services/projects.service';
import {requestFailed} from '../../core/actions/http.actions';
import {Injectable} from '@angular/core';
import {CREATION_STATUS} from './project-dialog.reducer';
import {catchError, filter, map, mergeMap, switchMap, withLatestFrom} from 'rxjs/operators';
import {Router} from '@angular/router';
import {getAllSystemProjects} from '../../core/actions/projects.actions';
import {Store} from '@ngrx/store';
import {selectActiveWorkspace} from '../../core/reducers/users-reducer';
import {ShortProjectNamePipe} from '../pipes/short-project-name.pipe';
import {ProjectLocationPipe} from '../pipes/project-location.pipe';
import {MESSAGES_SEVERITY} from '@common/constants';

@Injectable()
export class ProjectDialogEffects {
  constructor(
    private actions: Actions,
    private projectsApiService: ApiProjectsService,
    private router: Router,
    private store: Store,
  ) {
  }

  activeLoader = createEffect(() => this.actions.pipe(
    ofType(newProjectActions.createNewProject),
    map(action => activeLoader(action.type))
  ));

  navigateToNewProject = createEffect(() => this.actions.pipe(
    ofType(newProjectActions.navigateToNewProject),
    filter(action => !!action.id),
    map((action) => this.router.navigateByUrl(`projects/${action.id}`))
  ), {dispatch: false});

  createProject = createEffect(() => this.actions.pipe(
    ofType(newProjectActions.createNewProject),
    withLatestFrom(this.store.select(selectActiveWorkspace)),
    switchMap(([action]) => this.projectsApiService.projectsCreate({...action.req})
      .pipe(
        mergeMap(() => [
            deactivateLoader(action.type),
            newProjectActions.setCreationStatus({status: CREATION_STATUS.SUCCESS}),
            getAllSystemProjects(),
            addMessage(MESSAGES_SEVERITY.SUCCESS, `${(new ShortProjectNamePipe()).transform(action.req.name)} 已成功创建在 ${(new ProjectLocationPipe()).transform(action.req.name)} 中`),
          ]
        ),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, '项目创建失败'), newProjectActions.setCreationStatus({status: CREATION_STATUS.FAILED})])
      )
    )
  ));

  moveProject = createEffect(() => this.actions.pipe(
    ofType(newProjectActions.moveProject),
    withLatestFrom(this.store.select(selectActiveWorkspace)),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    switchMap(([action]) => this.projectsApiService.projectsMove({project: action.project, new_location: action.new_location})
      .pipe(
        mergeMap(() => [
            deactivateLoader(action.type),
            newProjectActions.setCreationStatus({status: CREATION_STATUS.SUCCESS}),
            getAllSystemProjects(),
            addMessage(MESSAGES_SEVERITY.SUCCESS, `${action.projectName} has been moved from ${action.fromName} to ${action.toName}`),
          ]
        ),
        catchError(error => [deactivateLoader(action.type), requestFailed(error), addMessage(MESSAGES_SEVERITY.ERROR, 'Project Move Failed'), newProjectActions.setCreationStatus({status: CREATION_STATUS.FAILED})])
      )
    )
  ));
}
