import {ColHeaderFilterTypeEnum, ColHeaderTypeEnum, ISmCol} from '../shared/ui-components/data/table/table.consts';
import {MODELS_TABLE_COL_FIELDS} from './shared/models.const';
import {rootProjectsPageSize} from '@common/constants';

export type ModelWizardMethodsEnum = 'create' | 'edit' | 'clone' | 'extend';
export const WIZARD_METHODS = {
  CREATE: 'create' as ModelWizardMethodsEnum,
  CLONE : 'clone' as ModelWizardMethodsEnum,
  EDIT  : 'edit' as ModelWizardMethodsEnum,
  EXTEND: 'extend' as ModelWizardMethodsEnum,
};

export type ModelsViewModesEnum = 'table' | 'tree';
export const MODELS_VIEW_MODES = {
  TABLE: 'table' as ModelsViewModesEnum,
  TREE : 'tree' as ModelsViewModesEnum,
};

export const MODELS_PAGE_SIZE = 15;
export const MODELS_STORE_KEY = 'models';

export const MODELS_PREFIX_INFO = 'MODELS_INFO_';
export const MODELS_PREFIX_MENU = 'MODELS_MENU_';
export const MODELS_PREFIX_VIEW = 'MODELS_';


export const STATUS = {
  PUBLISHED: 'Published',
  DRAFT    : 'Draft'
};

export const VIEWS = {
  TREE : 'TREE',
  TABLE: 'TABLE'
};

export const ASC = 1;
export const DESC = -1;
export const MODELS_TABLE_COLS: ISmCol[] = [
  {
    id              : MODELS_TABLE_COL_FIELDS.SELECTED,
    headerType      : ColHeaderTypeEnum.checkBox,
    sortable        : false,
    filterable      : false,
    hidden          : false,
    header          : '',
    headerStyleClass: 'selected-col-header',
    style           : {width: '70px', maxWidth: '70px'},
    disableDrag     : true,
    disablePointerEvents: true,
  },
  {
    id            : MODELS_TABLE_COL_FIELDS.ID,
    headerType    : ColHeaderTypeEnum.title,
    header        : 'ID',
    style         : {width: '100px'},
  },
  {
    id          : MODELS_TABLE_COL_FIELDS.FRAMEWORK,
    headerType  : ColHeaderTypeEnum.sortFilter,
    sortable    : true,
    filterable  : true,
    searchableFilter: true,
    header      : '框架',
    style       : {width: '100px'},
    showInCardFilters: true
  },
  {
    id          : MODELS_TABLE_COL_FIELDS.NAME,
    headerType  : ColHeaderTypeEnum.sortFilter,
    sortable    : true,
    header      : '名称',
    style       : {width: '300px'},
  },
  {
    id          : MODELS_TABLE_COL_FIELDS.TAGS,
    headerType  : ColHeaderTypeEnum.sortFilter,
    getter: ['tags', 'system_tags'],
    filterable  : true,
    sortable    : false,
    searchableFilter: true,
    header      : '标签',
    style       : {width: '240px'},
    excludeFilter: true,
    andFilter: true,
    columnExplain: 'Click to include tag. Click again to exclude.',
    showInCardFilters: true
  },
  {
    id          : MODELS_TABLE_COL_FIELDS.READY,
    headerType  : ColHeaderTypeEnum.sortFilter,
    sortable    : true,
    filterable  : true,
    header      : '状态',
    style       : {width: '135px'},
    showInCardFilters: true
  },
  {
    id          : MODELS_TABLE_COL_FIELDS.PROJECT,
    headerType  : ColHeaderTypeEnum.sortFilter,
    filterable  :  true,
    searchableFilter: true,
    sortable    : false,
    asyncFilter : true,
    paginatedFilterPageSize : rootProjectsPageSize,
    header      : '关联项目',
    style       : {width: '135px'}
  },
  {
    id              : MODELS_TABLE_COL_FIELDS.USER,
    headerType      : ColHeaderTypeEnum.sortFilter,
    searchableFilter: true,
    filterable      : true,
    sortable        : false,
    header          : '用户',
    style           : {width: '240px'},
    showInCardFilters: true
  },
  {
    id        : MODELS_TABLE_COL_FIELDS.TASK,
    headerType: ColHeaderTypeEnum.title,
    sortable  : false,
    header    : '工作任务',
    style     : {width: '240px'}
  },
  {
    id        : MODELS_TABLE_COL_FIELDS.LAST_UPDATE,
    headerType  : ColHeaderTypeEnum.sortFilter,
    sortable  : true,
    filterType    : ColHeaderFilterTypeEnum.durationDate,
    filterable: true,
    searchableFilter: false,
    header      : '更新时间',
    label       : '更新时间',
    style       : {width: '150px'},
  },
  {
    id        : MODELS_TABLE_COL_FIELDS.COMMENT,
    headerType: ColHeaderTypeEnum.sortFilter,
    sortable  : true,
    header    : '描述',
    style     : {width: '240px'}
  },
];
