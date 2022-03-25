import { LightningElement, api, wire, track} from 'lwc';
import getContactList from '@salesforce/apex/AccountHelper.getContactList';
import { NavigationMixin } from 'lightning/navigation';
export default class Display extends NavigationMixin(LightningElement) {
  @api accid;
 @track contacts=[];
 @track searchValue='';
  @wire(getContactList,{accid:'$accid', searchcontact:'$searchValue'}) 
  contacts;
    connectedCallback(){
        console.log(this.contacts);
        console.log(this.accid);
    }
  
    searchKeyword(event) {
        this.searchValue = event.target.value;
        console.log(this.searchValue);
    }
 
    handleSearchKeyword() {
        
        if (this.searchValue !== '') {
            getContactList({
                    searchcontact: this.searchValue
                })
                .then(result => {
                    this.contactsRecord = result;
                })
                .catch(error => {
                   
                    const event = new ShowToastEvent({
                        title: 'Error',
                        variant: 'error',
                        message: error.body.message,
                    });
                    this.dispatchEvent(event);
                    this.contactsRecord = null;
                });
        } else {
            const event = new ShowToastEvent({
                variant: 'error',
                message: 'Search text missing..',
            });
            this.dispatchEvent(event);
        }
    }
    navigateToWebPage() {
    
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: 'https://aimdektechnologies35-dev-ed.lightning.force.com/lightning/n/Account_List'
            }
        },
        true 
      );
    }
}