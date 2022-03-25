import { LightningElement,track , wire,api} from 'lwc';
import getContactList from '@salesforce/apex/AccountHelper.getContactList';
export default class ContactListForEachLWC extends LightningElement {
    @track id;
    @api getaccid;
    
    connectedCallback(){
        alert('Contacts');
        console.log(this.getaccid);
    }
    @wire(getContactList) contacts;
}