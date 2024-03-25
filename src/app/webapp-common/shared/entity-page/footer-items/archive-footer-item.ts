import {EntityTypeEnum} from '../../../../shared/constants/non-common-consts';
import {IconNames, ICONS} from '../../../constants';
import {ItemFooterModel, IFooterState} from './footer-items.models';
import {MenuItems} from '../items.utils';

export class ArchiveFooterItem extends ItemFooterModel {

  constructor(public entitiesType: EntityTypeEnum) {
    super();
    this.id = MenuItems.archive;
  }

  getItemState(state: IFooterState<any>): { icon?: IconNames; title?: string; description?: string; disable?: boolean; disableDescription?: string; emit?: boolean; emitValue?: boolean; preventCurrentItem?: boolean; class?: string; wrapperClass?: string } {
      const archive = state.data[this.id];
      const icon = (state.selectionAllIsArchive ? ICONS.RESTORE : ICONS.ARCHIVE) as Partial<IconNames>;
      const name = icon === ICONS.RESTORE ? 'Restore' : 'Archive';

      return {
        description: this.menuItemText.transform(archive?.available, icon === ICONS.RESTORE ? '撤档' : '存档'),
        icon,
        disable: archive?.disable,
        disableDescription: state.selectionIsOnlyExamples ? name : `Only ${this.entitiesType} owned can be ${name}`
      };
  }
}
