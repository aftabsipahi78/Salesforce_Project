import {LightningElement,api,wire,track} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import {getRecord,getFieldValue} from "lightning/uiRecordApi";
import {CloseActionScreenEvent} from 'lightning/actions';
import STATUS_FIELD from "@salesforce/schema/Case.Status";
import OWNER_ID from "@salesforce/schema/Case.OwnerId";
import CURRENTUSERID from '@salesforce/user/Id';
import UpdateFieldsOnConformation from '@salesforce/apex/OffRollEmpApproval.UpdateFieldsOnConformation';


const fields = [STATUS_FIELD, OWNER_ID];
export default class iND_LWC_ApplicationApprovalByOffRollEmployee extends LightningElement {

  userId = CURRENTUSERID;
  @api recordId;
  @track name;

  @track checkValue1;
  @track checkValue2;
  @track checkValue3;
  @track checkValue4;

  @wire(getRecord, {
    recordId: '$recordId',
    fields
  })
  case;


  handleConform() {
    if (this.OwnerId == this.userId) {
        UpdateFieldsOnConformation({
          CaseId: this.recordId
        })
        .then(result => {
          //alert('sucess');


        })
        .catch(error => {
          alert('failed');
        });
        const event = new ShowToastEvent({
        title: 'Submit Success',
        message: 'Your response has been Submitted !',
        variant: 'success',
        mode: 'dismissable'
      });
      this.dispatchEvent(event);
    } else {
      // alert('error');
      const evt = new ShowToastEvent({
        title: 'Toast Error',
        message: 'You are not Approver',
        variant: 'error',
        mode: 'dismissable'
      });
      this.dispatchEvent(evt);
    }
    // alert('uid'+this.userId);
    // alert('caseid'+this.OwnerId);
    // alert('reeyyy');
    this.dispatchEvent(new CloseActionScreenEvent());
  }

  get status() {
    return getFieldValue(this.case.data, STATUS_FIELD);
  }

  get OwnerId() {
    return getFieldValue(this.case.data, OWNER_ID);
  }
}