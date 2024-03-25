import {ColHeaderFilterTypeEnum, ColHeaderTypeEnum, ISmCol} from '../shared/ui-components/data/table/table.consts';
import {EXPERIMENTS_TABLE_COL_FIELDS} from '~/features/experiments/shared/experiments.const';
import {rootProjectsPageSize} from '@common/constants';

export const EXPERIMENTS_STORE_KEY = 'experiments';
export const EXPERIMENTS_PREFIX = 'EXPERIMENTS_';


export const INITIAL_EXPERIMENT_TABLE_COLS: ISmCol[] = [
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.SELECTED,
    sortable: false,
    filterable: false,
    headerType: ColHeaderTypeEnum.checkBox,
    header: '',
    hidden: false,
    bodyStyleClass: 'selected-col-body type-col',
    headerStyleClass: 'selected-col-header',
    style: {width: '65px'},
    disableDrag: true,
    disablePointerEvents: true,
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.ID,
    headerType: ColHeaderTypeEnum.title,
    header: 'ID',
    style: {width: '100px'},
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.TYPE,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable: true,
    filterable: true,
    header: '类型',
    bodyStyleClass: 'type-col',
    style: {width: '115px'},
    showInCardFilters: true
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.NAME,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable: true,
    header: '名称',
    style: {width: '400px'},
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.TAGS,
    getter: ['tags', 'system_tags'],
    headerType: ColHeaderTypeEnum.sortFilter,
    filterable: true,
    searchableFilter: true,
    sortable: false,
    header: '标签',
    style: {width: '300px'},
    excludeFilter: true,
    andFilter: true,
    columnExplain: 'Click to include tag. Click again to exclude.',
    showInCardFilters: true
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.STATUS,
    headerType: ColHeaderTypeEnum.sortFilter,
    filterable: true,
    header: '状态',
    style: {width: '115px'},
    showInCardFilters: true
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.PROJECT,
    headerType: ColHeaderTypeEnum.sortFilter,
    header: '项目',
    filterable: true,
    searchableFilter: true,
    asyncFilter: true,
    paginatedFilterPageSize: rootProjectsPageSize,
    sortable: false,
    style: {width: '150px'},
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.USER,
    getter: 'user.name',
    headerType: ColHeaderTypeEnum.sortFilter,
    searchableFilter: true,
    filterable: true,
    sortable: false,
    header: '用户名',
    style: {width: '115px'},
    showInCardFilters: true
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.STARTED,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable: true,
    filterType: ColHeaderFilterTypeEnum.durationDate,
    filterable: true,
    searchableFilter: false,
    header: '开始时间',
    style: {width: '150px'},
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.LAST_UPDATE,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable: true,
    filterType: ColHeaderFilterTypeEnum.durationDate,
    filterable: true,
    searchableFilter: false,
    header: '更新时间',
    label: 'Updated',
    style: {width: '150px'},
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.LAST_ITERATION,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable: true,
    filterType: ColHeaderFilterTypeEnum.durationNumeric,
    filterable: true,
    searchableFilter: false,
    header: '迭代次数',
    label: 'Iterations:',
    style: {width: '115px'},
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.COMMENT,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable: true,
    header: '描述',
    style: {width: '300px'}
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.ACTIVE_DURATION,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable: true,
    filterable: true,
    filterType: ColHeaderFilterTypeEnum.duration,
    searchableFilter: false,
    bodyStyleClass: 'type-col',
    header: '运行时间',
    style: {width: '150px'}
  },
  {
    id: EXPERIMENTS_TABLE_COL_FIELDS.PARENT,
    getter: [EXPERIMENTS_TABLE_COL_FIELDS.PARENT, 'parent.project.id', 'parent.project.name'],
    headerType: ColHeaderTypeEnum.sortFilter,
    searchableFilter: true,
    filterable: true,
    sortable: false,
    header: '父任务',
    style: {width: '200px'},
    showInCardFilters: true,
    asyncFilter: true
  }
];

export const EXPERIMENT_INFO_ONLY_FIELDS_BASE = [
  'id',
  'name',
  'user.name',
  'company',
  'type',
  'status',
  'status_changed',
  'status_message',
  'status_reason',
  'comment',
  'created',
  'last_update',
  'last_change',
  'completed',
  'started',
  'parent.name',
  'parent.project.name',
  'project.name',
  'output',
  'hyperparams',
  'execution.queue.name',
  'script.binary',
  'script.repository',
  'script.tag',
  'script.branch',
  'script.version_num',
  'script.entry_point',
  'script.working_dir',
  'script.requirements',
  'system_tags',
  'published',
  'last_iteration',
  'last_worker',
  'tags',
  'active_duration',
  'container',
  'runtime'
];

export const MINIMUM_ONLY_FIELDS = [
  'name', 'status', 'system_tags', 'project.name', 'company', 'last_change', 'last_update', 'started', 'last_iteration', 'tags',
  'user.name', 'runtime.progress'
];

export const ARTIFACTS_ONLY_FIELDS = [
  'name',
  'project.id',
  'execution.artifacts',
  'models.output.name',
  'models.output.model.name',
  'models.output.model.design',
  'models.output.model.uri',
  'models.output.model.framework',
  'models.output.model.created',
  'models.input.name',
  'models.input.model.name',
  'models.input.model.design',
  'models.input.model.uri',
  'models.input.model.framework',
  'models.input.model.created',
  'models.input.model.task.id',
  'models.input.model.task.name',
  'models.input.model.task.project.id',
];
export enum ActiveSectionEnum {
  'input-model' = 'input-model',
  'output-model' = 'output-model',
  'artifact' = 'artifact',
  'other' = 'other',
}
