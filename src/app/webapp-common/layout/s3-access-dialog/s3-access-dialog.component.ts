import {Component, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {AdminService} from '~/shared/services/admin.service';
import {NgForm} from '@angular/forms';
import {EventEmitter} from '@angular/core';
import {Credentials} from '@common/core/reducers/common-auth-reducer';

@Component({
  selector   : 'sm-s3-access-dialog',
  templateUrl: './s3-access-dialog.component.html',
  styleUrls  : ['./s3-access-dialog.component.scss']
})
export class S3AccessDialogComponent implements OnChanges {
  public formIsSubmitted: boolean;
  public secured = window.location.protocol === 'https:';
  public s3Form: Credentials;

  @ViewChild('S3NGForm', {static: true}) s3NGForm: NgForm;

  @Input() isAzure: boolean;
  @Input() isGCS: boolean;
  @Input() key: string;
  @Input() secret = '';
  @Input() region = '';
  @Input() token = '';
  @Input() bucket: string;
  @Input() endpoint: string;
  @Input() editMode = false;
  @Input() header: string;

  @Output() closeCancel: EventEmitter<Credentials> = new EventEmitter();
  @Output() closeSave: EventEmitter<Credentials> = new EventEmitter<any>();
  @Input() saveEnabled = true;


  constructor(public adminService: AdminService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes) {
      this.s3Form = {
        Key     : changes.isAzure.currentValue ? 'azure' : changes.key.currentValue,
        Secret  : changes.secret.currentValue,
        Token   : changes.token.currentValue,
        Region  : changes.region.currentValue,
        Bucket  : changes.bucket.currentValue,
        Endpoint: (changes.endpoint.currentValue === null || changes.endpoint.currentValue?.startsWith('http')) ?
          changes.endpoint.currentValue:
           `http${(changes.endpoint.currentValue as string).endsWith('443') ? 's' : ''}://${changes.endpoint.currentValue}`,
      };
    }
  }


  public saveNewCredentials() {
    this.formIsSubmitted = true;
    if (this.s3NGForm.invalid) {
      return false;
    } else {
      this.closeSave.emit(this.s3Form);
      return true;
    }
  }

  public cancel() {
    this.closeCancel.emit(this.s3Form);
  }

}
