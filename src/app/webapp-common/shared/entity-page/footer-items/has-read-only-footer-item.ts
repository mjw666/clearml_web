import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';

export class HasReadOnlyFooterItem extends ItemFooterModel {

  constructor() {
    super();
    this.emit = true;
    this.icon = ICONS.ALERT as Partial<IconNames>;
    this.description = `所选的只读项不能修改`;
    this.wrapperClass = 'has-example-item';
  }

  getItemState(state: IFooterState<any>): { icon?: IconNames; title?: string; description?: string; disable?: boolean; disableDescription?: string; emit?: boolean; emitValue?: boolean; preventCurrentItem?: boolean; class?: string; wrapperClass?: string } {
    return {
      preventCurrentItem: !state.selectionHasExample,
      title: `所选的只读项不能修改`
    };
  }
}
