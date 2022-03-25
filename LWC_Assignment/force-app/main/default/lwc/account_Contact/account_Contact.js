import { LightningElement, wire ,track,api} from 'lwc';
import getAccountList from '@salesforce/apex/AccountHelper.getAccountList';
	
import { NavigationMixin } from 'lightning/navigation';
import {ShowToastEvent} from 'lightning/platformShowToastEvent'

export default class AccountListForEachLWC extends NavigationMixin(LightningElement) {
    @track accounts=[];
    @track accId;
    @api accid;
   
    @track contactsRecord;
    @track searchValue = '';
    @wire(getAccountList,{searchKey:'$searchValue'}) 
    accounts;
    openAllContactRecords(event) {
        console.log(event.target.value);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId:event.target.value,
                objectApiName: 'Account',
                actionName: 'edit'
            },
        });
    }
    navigateNext(event) {
        console.log(event.currentTarget.dataset.value);
        this.accId=event.currentTarget.dataset.value;
        console.log(this.accId);
        event.preventDefault();

        let componentDef = { 
            componentDef: "c:display", 
            attributes: { 
                 accid:this.accId, 
                label: 'Navigated From Another LWC Without Using Aura' 
            } 
        };
  
        let encodedComponentDef = btoa(JSON.stringify(componentDef)); 
        console.log(encodedComponentDef); 
        this[NavigationMixin.Navigate]({ 
            type: 'standard__webPage', 
            attributes: { 
                url: '/one/one.app#' + encodedComponentDef 
            } 
        });
    }
   
 
    searchKeyword(event) {
        this.searchValue = event.target.value;
        console.log(this.searchValue);
    }
 
    handleSearchKeyword() {
        
        if (this.searchValue !== '') {
            getAccountList({
                    searchKey: this.searchValue
                })
                .then(result => {
                    this.accountsRecord = result;
                })
                .catch(error => {
                   
                    const event = new ShowToastEvent({
                        title: 'Error',
                        variant: 'error',
                        message: error.body.message,
                    });
                    this.dispatchEvent(event);
                    this.accountsRecord = null;
                });
        } else {
            const event = new ShowToastEvent({
                variant: 'error',
                message: 'Search text missing..',
            });
            this.dispatchEvent(event);
        }
    }
}