import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {getModelDesign} from '@common/tasks/tasks.utils';
import {EditJsonComponent, EditJsonData} from '@common/shared/ui-components/overlay/edit-json/edit-json.component';
import {take} from 'rxjs/operators';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '@common/shared/ui-components/overlay/confirm-dialog/confirm-dialog.component';
import {EditableSectionComponent} from '@common/shared/ui-components/panel/editable-section/editable-section.component';

@Component({
  selector   : 'sm-model-view-network',
  templateUrl: './model-view-network.component.html',
  styleUrls  : ['./model-view-network.component.scss']
})
export class ModelViewNetworkComponent {
  private _model: any;
  public design: string;
  private designKey: string;

  @Input() set model(model) {
    this._model = model;
    const design = getModelDesign(model?.design);
    this.designKey = design.key;
    this.design = typeof design.value === 'string' ? design.value : '';
  }

  get model() {
    return this._model;
  }
  @Input() isSharedAndNotOwner: boolean = false;
  @Input() saving: boolean;
  @Output() openNetworkDesignClicked: EventEmitter<any> = new EventEmitter();
  @Output() saveFormData = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();
  @Output() activateEditClicked = new EventEmitter();
  @ViewChild('prototext') prototextSection: EditableSectionComponent;
  public inEditMode: boolean = false;
  private unsavedValue: string;

  constructor(private dialog: MatDialog) {
  }

  fieldValueChanged(value: any) {
    this.unsavedValue = value;
    this.design = value;
  }

  activateEdit() {
    this.inEditMode = true;
    this.activateEditClicked.emit();
  }

  saveClicked() {
    this.inEditMode = false;
    this.saveFormData.emit({...this.model, design: this.designKey ? {[this.designKey]: this.unsavedValue} : this.unsavedValue});
  }

  cancelEdit() {
    this.inEditMode = false;
    this.cancelClicked.emit();
  }

  editPrototext() {
    const editPrototextDialog = this.dialog.open(EditJsonComponent, {
      data: {textData: this.design, readOnly: false, title: 'EDIT MODEL CONFIGURATION'} as EditJsonData
    });

    editPrototextDialog.afterClosed().pipe(take(1)).subscribe((data) => {
      if (data === undefined) {
        this.prototextSection.cancelClickedEvent();
      } else {
        this.fieldValueChanged(data);
        this.saveClicked();
      }
    });
  }

  clearPrototext() {
    const confirmDialogRef: MatDialogRef<any, boolean> = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title    : '清除配置文件',
        body     : '您确定要清除模型配置的全部内容吗?',
        yes      : '确定',
        no       : '取消',
        iconClass: 'al-icon al-ico-trash al-color blue-300',
      }
    });

    confirmDialogRef.afterClosed().pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.activateEdit();
        this.fieldValueChanged('');
        this.saveClicked();
      }
    });
  }
}

