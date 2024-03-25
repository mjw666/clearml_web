export type ActiveSearchLink = 'projects' | 'experiments' | 'models' | 'pipelines' | 'datasets';

export const activeSearchLink = {
  projects: 'projects' as ActiveSearchLink,
  experiments: 'experiments' as ActiveSearchLink,
  models: 'models' as ActiveSearchLink,
  pipelines: 'pipelines' as ActiveSearchLink,
  openDatasets: 'datasets' as ActiveSearchLink,
  reports: 'reports' as ActiveSearchLink
};

export const activeLinksList = [
  {
    label: '项目',
    name: activeSearchLink.projects,
  },
  {
    label: '数据集',
    name: activeSearchLink.openDatasets,
  },
  {
    label: 'EXPERIMENTS',
    name: activeSearchLink.experiments,
  },
  {
    label: 'MODELS',
    name: activeSearchLink.models,
  },
  {
    label: '工作流',
    name: activeSearchLink.pipelines,
  },
  {
    label: '报告',
    name: activeSearchLink.reports,
  },
];
