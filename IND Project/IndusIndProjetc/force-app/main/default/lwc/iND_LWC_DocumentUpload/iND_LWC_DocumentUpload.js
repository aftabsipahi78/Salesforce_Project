import { LightningElement, track, wire, api } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import changeFilename from '@salesforce/apex/GenericUploadController.changeFilename';
import deleteDocument from '@salesforce/apex/IND_DocumentUploadCntrl.deleteDocument';
import getApplicantDetails from '@salesforce/apex/IND_DocumentUploadCntrl.getApplicantDetails';
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import FORM_FACTOR from '@salesforce/client/formFactor';
import DOC_ID_FIELD from '@salesforce/schema/Documents__c.Id';
import imageuploaded from '@salesforce/label/c.imageuploaded';
import DocumentDeleted from '@salesforce/label/c.DocumentDeleted';
import DocumentTypeNotSelected from '@salesforce/label/c.DocumentTypeNotSelected';
import FileUpload from '@salesforce/label/c.FileUpload';
import DOCUMENT_TYPE_FIELD from '@salesforce/schema/Documents__c.Document_Type__c';
import DOCUMENT_OPP_FIELD from '@salesforce/schema/Documents__c.Opportunity_Relation__c';
import DOCUMENT_APP_FIELD from '@salesforce/schema/Documents__c.Applicant__c';
import DOCUMENT_NAME_FIELD from '@salesforce/schema/Documents__c.Name';
import DOCUMENT_RECORDTYPEID_FIELD from '@salesforce/schema/Documents__c.RecordTypeId';
import IS_PHOTOCOPY_FIELD from '@salesforce/schema/Documents__c.Is_Photocopy__c';
import { NavigationMixin } from 'lightning/navigation';
import DOCUMENT_OBJECT_INFO from '@salesforce/schema/Documents__c';
import SystemModstamp from '@salesforce/schema/Account.SystemModstamp';

export default class IND_LWC_DocumentUpload extends LightningElement {
    @api contentDocumentId;
    @api recordid = '00671000001UfjVAAS';
    @track defaultRecordTypeId;
    @track recordTypeIds;
    loanApplicationId;
    uploadViewDocPopup = true;
    showModal = true;
    fileUploadResp = {};
    @track docUploadSuccessfully = false;
    @track docIdList = [];
    @track docUploaded = false;
    @track applicants;
    @track borrowerVisible = false;
    @track coBorrowerVisible = false;
    @track borrowerApplicantId;
    @track coBorrowerApplicantId;
    @track currentapplicantid;
    @api documentrecordidfromparent;
    @api docotherrecordtype = false;
    @track documentRecordId;
    @api filename;
    webApp = true;
    mobileTabApp = false;
    disabledFileUpload = true;
    @api isphotocopy = false;
    docType;
    @api additionaldocument;

    @track documentsConfig = {
        objectName: "ContentDocumentLink",
        tableConfig: {
            columns: [
                { api: 'ContentDocument.Title', label: 'Title', fieldName: 'title', sortable: true },
                { api: 'ContentDocument.ContentSize', label: 'Size (bytes)', fieldName: 'ContentSize', type: 'number', sortable: true, callAttributes: { alignment: 'left' } },
                { api: 'ContentDocument.FileType', label: 'File Type', fieldName: 'FileType', sortable: true },
                { api: 'ContentDocument.Owner.Name', label: 'Owner', fieldName: 'OwnerName', sortable: true },
                { label: 'preview', type: 'button-icon', typeAttributes: { name: 'Preview', iconName: 'utility:preview', variant: 'brand-outline' } },
                { label: '#', type: 'button-icon', typeAttributes: { name: 'delete', iconName: 'utility:delete', variant: 'bare' } }
            ],
            hideCheckboxColumn: true
        },
        queryFilters: 'LinkedEntityId =' + this.recordid,
        pageSize: '5',
        limit: '100'
    };

    label = {
        imageuploaded,
        DocumentDeleted,
        DocumentTypeNotSelected,
        FileUpload

    }



    @wire(getObjectInfo, { objectApiName: DOCUMENT_OBJECT_INFO })
    documentMetaData({data, error}) {
        if(data) {
            let optionsValues = [];
            this.defaultRecordTypeId = data.defaultRecordTypeId;
            const rtInfos = data.recordTypeInfos;

            let rtValues = Object.values(rtInfos);

            for(let i = 0; i < rtValues.length; i++) {
                if(rtValues[i].name !== 'Master') {
                    optionsValues.push({
                        label: rtValues[i].name,
                        value: rtValues[i].recordTypeId
                    })
                }
            }

            this.recordTypeIds = optionsValues;
        }
        else if(error) {
            window.console.log('Error ===> '+JSON.stringify(error));
        }
    }

    @wire(getPicklistValues, {
        recordTypeId: '$defaultRecordTypeId',
        fieldApiName: DOCUMENT_TYPE_FIELD
    })
    documentTypeValues;

    renderedCallback() {

    }
    get acceptedFormats() {
        return ['.jpg', '.png', '.jpeg', '.docx', '.pdf'];
    }

    connectedCallback() {
        if (FORM_FACTOR != 'Large') {
            this.mobileTabApp = true;
            this.webApp = false;
        } else {
            this.mobileTabApp = false;
            this.webApp = true;
        }
        getApplicantDetails({loanApplicationId : this.recordid})
        .then(result => {
            if(result){
                if(result.length>0){
                    this.applicants = result;
                    for(let res of result){
                        if(res.Applicant_Type__c.includes('Borrower')){
                            this.borrowerVisible = true;
                            this.borrowerApplicantId = res.Id;
                        }else if(res.Applicant_Type__c.includes('Co-borrower')){
                            this.coBorrowerVisible = true;
                            this.coBorrowerApplicantId =  res.Id;
                        }
                    }
                }
            }
                console.debug(result);
            }
        ).catch(error => {
            console.log('FileName not change error'+JSON.stringify(error));
        });  

        // getDocumentData({loanApplicationId : this.loanApplicationId})
        // .then(result => {

        //     }
        // ).catch(error => {
        //     console.log('FileName not change error'+JSON.stringify(error));
        // });  
        if (this.documentrecordidfromparent) {
            console.log('in  documentrecordidfromparent: ', );
            this.documentRecordId = this.documentrecordidfromparent;
            this.documentsConfig.queryFilters = 'LinkedEntityId =\'' + this.recordid + '\'';
            console.log('in  documentrecordidfromparent: ', this.documentRecordId);
        }
    }


    handleRecordType(event){
        try{
        if(this.documentRecordId && this.defaultRecordTypeId && event.target.value!=this.defaultRecordTypeId){
            this.defaultRecordTypeId = event.target.value;
            const fields = {};
            fields[DOCUMENT_TYPE_FIELD.fieldApiName] = '';
            fields[DOCUMENT_RECORDTYPEID_FIELD.fieldApiName] = this.defaultRecordTypeId; 
            fields[DOC_ID_FIELD.fieldApiName] = this.documentRecordId;
            var objRecordInput = {fields};
            updateRecord(objRecordInput).then(response => {}).catch(error => {
                console.error('Error: ' +JSON.stringify(error));
            });
        }else{
            this.defaultRecordTypeId = event.target.value;
        }
        }catch(err){
            console.debug(err);
        }
    }
    handleDocType(event) {
        
        console.debug(this.documentRecordId);
        if (this.documentRecordId && this.docType && event.target.value!=this.docType) {
            this.docType = event.detail.value;
            const fields = {};
            fields[DOCUMENT_TYPE_FIELD.fieldApiName] = this.docType; 
            fields[DOC_ID_FIELD.fieldApiName] = this.documentRecordId;
            var objRecordInput = {fields};
            updateRecord(objRecordInput).then(response => {}).catch(error => {
                console.error('Error: ' +JSON.stringify(error));
            });
            
        } else if(!event.detail.value) {
            const evt = new ShowToastEvent({
                message: this.label.DocumentTypeNotSelected,
                variant: 'warning',
            });
            this.dispatchEvent(evt);
        }else{
            this.docType = event.detail.value;
            this.createDocument();
        }
    }

    handlerIsPhotocopy(event) {
        this.isPhotocopy = event.target.checked;
    }

    handleFileUpload(event) {
        console.debug('handle')
        console.log('handleFileUpload ' + event.detail.files);
        for (var index = 0; index < event.detail.files.length; index++) {
            this.docIdList.push(event.detail.files[index].documentId)
        }
        console.log('this.docIdList ' + this.docIdList);
        //this.contentDocumentId = event.detail.files[0].documentId;

        console.log('Check Document Id : ' + this.contentDocumentId);
        const evt = new ShowToastEvent({
            title: 'Uploaded',
            message: 'File Uploaded successfully..!',
            variant: 'success',
        });
        this.dispatchEvent(evt);
        this.documentRecordId = null;
        this.docType = '';
        this.createRecord();
        // Added By Poonam 
        if (this.doctype == 'Cheques SPDC' || this.additionaldocument == "true") {
            this.dispatchEvent(new CustomEvent('fileuploadstatus', { detail: this.contentDocumentId }));
        } else {
            //this.saveDocumentRecord();
        }
    }

    saveDocumentRecord() {
        const docFields = {};
        console.log('Check Document Values : ' + this.documentRecordId, '', this.docType, '', this.isPhotocopy);
        docFields[DOC_ID_FIELD.fieldApiName] = this.documentRecordId;
        docFields[DOCUMENT_TYPE_FIELD.fieldApiName] = this.docType;
        docFields[DOCUMENT_NAME_FIELD.fieldApiName] = this.docType;
        docFields[IS_PHOTOCOPY_FIELD.fieldApiName] = this.isPhotocopy;
        this.updateRecordDetails(docFields)
            .then(() => {
                this.docUploadSuccessfully = true;
                console.log('File Uploaded');
                this.dispatchEvent(new CustomEvent('fileuploadstatus', { detail: this.docUploadSuccessfully }));
            });
        this.docUploaded = true;
    }

    uploadDone() {
        //this.uploadViewDocPopup = false;
        console.log('Check COntent File Id :' + this.contentDocumentId);
        this.fileUploadResp.contentDocumentId = this.contentDocumentId;
        this.fileUploadResp.DocumentId = this.documentRecordId;
        this.dispatchEvent(new CustomEvent('changeflagvalue', { detail: this.fileUploadResp }));
        this.uploadViewDocPopup = false;
    }

    uploadImageClose() {
        console.debug(this.documentRecordId);
        if(this.documentRecordId){
            deleteRecord(this.documentRecordId)
            .then(() => {
                console.debug('Record deleted');
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
        }
        this.uploadViewDocPopup = false;
        //this.dispatchEvent(new CustomEvent('changeflagvalue', { detail: this.contentDocumentId }));
    }

    captureCustomerImageApp() {
        var appDocType = ['Aadhaar', 'Driving Licence', 'PAN', 'Passport', 'Voter Id', 'Form 60', 'Bank Statement', 'Electronic Bill', 'Telephone bill', 'Post paid mobile bill', 'Gas bill', 'Water Bill', 'Property or municipal tax receipt', 'Govt pension payment order', 'Govt letter of accommodation allotment', 'Customer ITR', 'Customer Bank Statement'];
        var oppDocType = ['Customer Insurance Policy', 'Vehicle RC Copy', 'Vehicle Image'];

        if (appDocType.includes(this.doctype)) {
            this.leadId = this.currentapplicantid;
        } else if (oppDocType.includes(this.doctype)) {
            this.leadId = this.currentloanapplicationid;
        }

        this[NavigationMixin.Navigate]({
            type: "standard__webPage",
            attributes: {
                url: 'ibl://indusindbank.com/integratorInfo?' + 'leadId' + '=' + this.leadId + '&' + 'userid' + '=' + this.currentUserId + '&' + 'mode' + '=' + this.doctype + '&' + '	username' + '=' + this.currentUserName + '&' + 'useremailid' + '=' + this.currentUserEmailId + '&documentSide=' + 'Front'
            }
        });
    }
    handleActive(event){
        
        if(this.documentRecordId && this.currentapplicantid){
            if(this.applicants){
                this.applicants.forEach(element => {
                    if(element.Applicant_Type__c.includes(event.target.value)){
                        this.currentapplicantid = element.Id;
                    }
                });
            }
            const fields = {};
            fields[DOCUMENT_APP_FIELD.fieldApiName] = this.currentapplicantid;
            fields[DOC_ID_FIELD.fieldApiName] = this.documentRecordId;
            var objRecordInput = {fields};
            updateRecord(objRecordInput).then(response => {}).catch(error => {
                console.error('Error: ' +JSON.stringify(error));
            });
        }else{
            if(this.applicants){
                this.applicants.forEach(element => {
                    if(element.Applicant_Type__c.includes(event.target.value)){
                        this.currentapplicantid = element.Id;
                    }
                });
            }
        }
    }
    
    createDocument(){
        // Creating mapping of fields of Document with values
        console.debug(this.recordTypeIds);
        let recordTypeId;
        console.debug('in create document');
        console.debug(this.defaultRecordTypeId);      
        const fields = {};
        fields[DOCUMENT_RECORDTYPEID_FIELD.fieldApiName] = this.defaultRecordTypeId; 
        fields[DOCUMENT_TYPE_FIELD.fieldApiName] = this.docType;
        fields[DOCUMENT_OPP_FIELD.fieldApiName] = this.recordid;
        fields[DOCUMENT_APP_FIELD.fieldApiName] = this.currentapplicantid;
        fields[DOCUMENT_NAME_FIELD.fieldApiName] = this.docType;
        // Record details to pass to create method with api name of Object.
        var objRecordInput = {'apiName' : DOCUMENT_OBJECT_INFO.objectApiName, fields};
        // LDS method to create record.
        createRecord(objRecordInput).then(response => {
            this.documentRecordId = response.id;
            this.disabledFileUpload = false;
            console.debug(this.documentRecordId);

        }).catch(error => {
            console.error('Error: ' +JSON.stringify(error));
        });
    }

    updateDocument(){
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.docuId;
        fields[SUBJECT_FIELD.fieldApiName] = this.template.querySelector("[data-field='Document']").value;
        const recordInput = { fields };
        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Document Updated',
                    variant: 'success'
                })
            );
        })
        .catch(error => {
            console.log(error);
        });
    }
}
