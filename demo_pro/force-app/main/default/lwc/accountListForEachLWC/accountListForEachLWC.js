import { LightningElement, wire ,track} from 'lwc';
import getAccountList from '@salesforce/apex/AccountHelper.getAccountList';
export default class AccountListForEachLWC extends LightningElement {

    @track accounts=[];
    accId;
    @wire(getAccountList) accounts;

    getContact(event){
        console.log(event.currentTarget.dataset.value);
        this.accId=event.target.value;
        event.preventDefault();
            
        let componentDef = {
 
            componentDef: "c:contactListForEachLWC",
 
            attributes: {
 
                 getaccid:this.accId,
 
                label: 'Navigated From Another LWC Without Using Aura'
 
            }
 
        };
 
        // Encode the componentDefinition JS object to Base64 format to make it url addressable
 
        let encodedComponentDef = btoa(JSON.stringify(componentDef));
 
        console.log(encodedComponentDef);
 
        this[NavigationMixin.Navigate]({
 
            type: 'standard__webPage',
 
            attributes: {
 
                url: '/one/one.app#' + encodedComponentDef
 
            }
 
        });
    }
}