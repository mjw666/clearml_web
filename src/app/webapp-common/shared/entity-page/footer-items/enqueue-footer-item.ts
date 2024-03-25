import {ItemFooterModel, IFooterState} from './footer-items.models';
import {IconNames, ICONS} from '../../../constants';
import {MenuItems} from '../items.utils';

export class EnqueueFooterItem extends ItemFooterModel {

  constructor() {
    super();
    this.id = MenuItems.enqueue;
    this.emit = true;
    this.icon = ICONS.ENQUEUE as Partial<IconNames>;
  }

  getItemState(state: IFooterState<any>): { icon?: IconNames; title?: string; description?: string; disable?: boolean; disableDescription?: string; emit?: boolean; emitValue?: boolean; preventCurrentItem?: boolean; class?: string; wrapperClass?: string } {
    const enqueue = state.data[this.id];

    return {
      disable: enqueue?.disable,
      preventCurrentItem: state.selectionAllIsArchive,
      description: this.menuItemText.transform(enqueue?.available, 'Enqueue'),
      disableDescription: state.selectionIsOnlyExamples ? 'Enqueue' : `You can only enqueue experiments with ‘Draft’/'Aborted' status`

    };
  }
}
