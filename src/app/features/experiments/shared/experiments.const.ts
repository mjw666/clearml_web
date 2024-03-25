import {TaskStatusEnum} from '~/business-logic/model/tasks/taskStatusEnum';
import {ExperimentTableColFieldsEnum} from './experiments.model';

export type experimentSectionsEnum =
  'MODEL_INPUT'
  | 'MODEL_SOURCE'
  | 'MODEL_OUTPUT'
  | 'MODEL_NETWORK_DESIGN';
export const experimentSections = {
  MODEL_INPUT         : 'MODEL_INPUT' as experimentSectionsEnum,
  MODEL_SOURCE        : 'MODEL_SOURCE' as experimentSectionsEnum,
  MODEL_OUTPUT        : 'MODEL_OUTPUT' as experimentSectionsEnum,
  MODEL_NETWORK_DESIGN: 'MODEL_NETWORK_DESIGN' as experimentSectionsEnum,
};

export const DIGITS_AFTER_DECIMAL = 6;

export const EXPERIMENTS_TABLE_COL_FIELDS = {
  SELECTED      : 'selected' as ExperimentTableColFieldsEnum,
  ID            : 'id' as ExperimentTableColFieldsEnum,
  TYPE          : 'type' as ExperimentTableColFieldsEnum,
  NAME          : 'name' as ExperimentTableColFieldsEnum,
  TAGS          : 'tags' as ExperimentTableColFieldsEnum,
  USER          : 'users' as ExperimentTableColFieldsEnum,
  STARTED       : 'started' as ExperimentTableColFieldsEnum,
  COMPLETED     : 'completed' as ExperimentTableColFieldsEnum,
  STATUS        : 'status' as ExperimentTableColFieldsEnum,
  LAST_UPDATE   : 'last_update' as ExperimentTableColFieldsEnum,
  LAST_ITERATION: 'last_iteration' as ExperimentTableColFieldsEnum,
  COMMENT       : 'comment' as ExperimentTableColFieldsEnum,
  ACTIVE_DURATION: 'active_duration' as ExperimentTableColFieldsEnum,
  PROJECT       : 'project.name' as ExperimentTableColFieldsEnum,
  METRIC        : 'project.name' as ExperimentTableColFieldsEnum,
  HYPER_PARAM   : 'project.name' as ExperimentTableColFieldsEnum,
  PARENT        : 'parent.name' as ExperimentTableColFieldsEnum,
  VERSION       : 'hyperparams.properties.version' as ExperimentTableColFieldsEnum
};

export enum ExperimentTagsEnum {
  Development = 'development',
  Hidden = 'archived',
  Shared = 'shared',
  Pipeline = 'pipeline'
}

export const EXPERIMENTS_TAGS = {
  ['shared' as ExperimentTagsEnum]: 'SHARED'
};export const EXPERIMENTS_TAGS_TOOLTIP = {};
export const EXPERIMENTS_STATUS_LABELS = {
  [TaskStatusEnum.Created]   : '草稿',
  [TaskStatusEnum.Queued]    : '挂起',
  [TaskStatusEnum.InProgress]: '运行中',
  [TaskStatusEnum.Completed] : '已完成',
  [TaskStatusEnum.Published] : '已发布',
  [TaskStatusEnum.Failed]    : '失败',
  [TaskStatusEnum.Stopped]   : '异常停止',
  [TaskStatusEnum.Closed]    : '已完成'

};
export const DevWarningEnabled = false;

export const excludeTypes = [];

export const DATASETS_STATUS_LABEL = {
  [TaskStatusEnum.InProgress]: 'Uploading',
  [TaskStatusEnum.Completed]: 'Final',
  Running: 'Uploading',
  Completed: 'Final'
};

