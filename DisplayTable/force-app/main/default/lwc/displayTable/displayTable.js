import Amount from '@salesforce/schema/Opportunity.Amount';
import {LightningElement, track} from 'lwc';

export default class DisplayTable extends LightningElement {
    @track listOfAccounts;
    @track totalAmount = 0;
    total = 0;
    connectedCallback() {
        this.initData();
    }

    initData() {
        let listOfAccounts = [];
        this.createRow(listOfAccounts);
        this.listOfAccounts = listOfAccounts;
    }

    createRow(listOfAccounts) {
        let accountObject = {};

        if(listOfAccounts.length > 0) {
            accountObject.index = listOfAccounts[listOfAccounts.length - 1].index + 1;
        } else {
            accountObject.index = 1;
        }
        accountObject.Name = null;
        accountObject.Website = null;
        accountObject.Phone = null;
        accountObject.Amount = 0;
        listOfAccounts.push(accountObject);
        console.log(listOfAccounts);
    }

    /**
     * Adds a new row
     */
    addNewRow() {
        this.createRow(this.listOfAccounts);
    }

    /**
     * Removes the selected row
     */
    removeRow(event) {
        let toBeDeletedRowIndex = event.target.name;

        let listOfAccounts = [];
        for(let i = 0; i < this.listOfAccounts.length; i++) {
            let tempRecord = Object.assign({}, this.listOfAccounts[i]); //cloning object
            if(tempRecord.index !== toBeDeletedRowIndex) {
                listOfAccounts.push(tempRecord);
            }
        }

        for(let i = 0; i < listOfAccounts.length; i++) {
            listOfAccounts[i].index = i + 1;
        }

        this.listOfAccounts = listOfAccounts;
    }

    /**
     * Removes all rows
     */
    removeAllRows() {
        let listOfAccounts = [];
        this.createRow(listOfAccounts);
        this.listOfAccounts = listOfAccounts;
    }
    calculateAmount(){
        this.totalAmount = 0;
        for(let acc of this.listOfAccounts){
            this.totalAmount += acc.Amount;
        }
        console.debug(this.totalAmount);
    }
    handleInputChange(event) {
        console.debug(this.listOfAccounts);
        for(let acc of this.listOfAccounts){
            if(acc.index==event.target.dataset.id){
                if(event.target.name.includes('Name')){
                    acc.Name = event.target.value 
                }else if(event.target.name.includes('Website')){
                    acc.Website = event.target.value 
                }else if(event.target.name.includes('Phone')){
                    acc.Phone = event.target.value 
                }else if(event.target.name.includes('Phone')){
                    acc.Phone = event.target.value 
                }
                else if(event.target.name.includes('Amount')){
                    acc.Amount = parseInt(event.target.value)
                    this.calculateAmount(); 
                }
            }
        }
        console.debug(this.listOfAccounts);
        // let fieldName = event.target.value;
        // this.total += fieldName;
        //this.template.
        // let index = event.target.dataset.id;
        // let fieldName = event.target.name;
        // let value = event.target.value;

        // for(let i = 0; i < this.listOfAccounts.length; i++) {
        //     if(this.listOfAccounts[i].index === parseInt(index)) {
        //         this.listOfAccounts[i][fieldName] = value;
                

        //     }
        // }
    }
}