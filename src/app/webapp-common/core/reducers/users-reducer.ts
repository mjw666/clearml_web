import {ActionCreator, createSelector, on, ReducerTypes} from '@ngrx/store';
import {
  logout,
  setFilterByUser,
  setApiVersion,
  fetchCurrentUser,
  setCurrentUserName
} from '../actions/users.actions';
import {GetCurrentUserResponseUserObject} from '~/business-logic/model/users/getCurrentUserResponseUserObject';
import {
  GetCurrentUserResponseUserObjectCompany
} from '~/business-logic/model/users/getCurrentUserResponseUserObjectCompany';
import {
  OrganizationGetUserCompaniesResponseCompanies
} from '~/business-logic/model/organization/organizationGetUserCompaniesResponseCompanies';
import {GettingStarted} from '~/core/actions/users.action';
import {UsersGetCurrentUserResponseSettings} from '~/business-logic/model/users/usersGetCurrentUserResponseSettings';

export interface UsersState {
  currentUser: GetCurrentUserResponseUserObject;
  activeWorkspace: GetCurrentUserResponseUserObjectCompany;
  userWorkspaces: OrganizationGetUserCompaniesResponseCompanies[];
  selectedWorkspaceTab: GetCurrentUserResponseUserObjectCompany;
  workspaces: GetCurrentUserResponseUserObjectCompany[];
  showOnlyUserWork: boolean;
  serverVersions: { server: string; api: string };
  gettingStarted: GettingStarted;
  settings: UsersGetCurrentUserResponseSettings;
}

export const initUsers: UsersState = {
  currentUser: null,
  activeWorkspace: null,
  userWorkspaces: [],
  selectedWorkspaceTab: null,
  workspaces: [],
  showOnlyUserWork: false,
  serverVersions: null,
  gettingStarted: null,
  settings: null,
};

export const users = state => state.users as UsersState;
export const selectSettings = createSelector(users, (state) => state?.settings);
export const selectMaxDownloadItems = createSelector(selectSettings, (state): number => state?.max_download_items ?? 1000);
export const selectCurrentUser = createSelector(users, state => state.currentUser);
export const selectActiveWorkspace = createSelector(users, state => state.activeWorkspace);
export const selectActiveWorkspaceTier = createSelector(selectActiveWorkspace, workspace => workspace?.tier);
export const selectUserWorkspaces = createSelector(users, state => state.userWorkspaces);
export const selectSelectedWorkspaceTab = createSelector(users, state => state.selectedWorkspaceTab);
export const selectWorkspaces = createSelector(users, state => state.workspaces);
export const selectShowOnlyUserWork = createSelector(users, state => state.showOnlyUserWork);
export const selectServerVersions = createSelector(users, state => state.serverVersions);
export const selectGettingStarted = createSelector(users, state => state.gettingStarted);
export const selectWorkspaceOwner = createSelector(selectActiveWorkspace, selectUserWorkspaces, (active, workspaces) => {
  if (workspaces && active) {
    const activeWs = workspaces.find(ws => ws.id === active.id);
    return activeWs?.owners?.[0]?.name || '';
  }
  return null;
});

export const usersReducerFunctions = [
  on(fetchCurrentUser, state => ({...state})),
  on(setCurrentUserName, (state, action) => ({
    ...state,
    currentUser: {...state.currentUser, name: action.name}
  })),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  on(logout, state => ({
    ...state,
    currentUser: null
  })),
  on(setFilterByUser, (state, action) => {
    return ({...state, showOnlyUserWork: action.showOnlyUserWork});
  }),
  on(setApiVersion, (state, action) => ({...state, serverVersions: action.serverVersions}))
] as ReducerTypes<UsersState, ActionCreator[]>[];
