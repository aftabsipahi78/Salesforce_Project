import { LightningElement,track,wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
export default class Component1 extends LightningElement {
    @track data=[];
    @track columns = [
        {label:'Name', fieldname:'Name',type:'text'},
        {label:'Industry', fieldname:'Industry',type:'text'},
        {label:'Type', fieldname:'Type',type:'Picklist'},
        {label:'Phone', fieldname:'Phone', type:'phone'}
    ];
    @wire (getAccounts) 
    accounts({error,data}){
        if(data){
            console.log(data);
            this.data=data;
        }
        else if(error){
            
            console.log(error);
            this.data=undefined;
        }
    }

}