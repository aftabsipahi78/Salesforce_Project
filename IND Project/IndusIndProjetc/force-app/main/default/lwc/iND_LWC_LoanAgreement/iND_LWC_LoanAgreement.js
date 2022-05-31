import { LightningElement, track, api, wire } from "lwc";
import { updateRecord, getRecordNotifyChange } from "lightning/uiRecordApi";
import updateLoanTransacionHistoryToSubmitted from "@salesforce/apex/LoanAgreementController.updateLoanTransacionHistoryToSubmitted";
import getAgreementBookletDetails from "@salesforce/apex/LoanAgreementController.getAgreementBookletDetails";
import getLoanEAgreementDetails from "@salesforce/apex/loanEAgreementController.getLoanEAgreementDetails";
import getLoanAgreement from "@salesforce/apex/LoanAgreementController.getLoanAgreement";
import getAgreementCopyDocumentData from "@salesforce/apex/LoanAgreementController.getDocumentData";
import getGeoGraphicalState from "@salesforce/apex/LoanAgreementController.getGeoGraphicalState";
import getTaxInvoiceDate from "@salesforce/apex/LoanAgreementController.getTaxInvoiceDate";
import getAdvancedEMI from "@salesforce/apex/LoanAgreementController.getAdvancedEMI";
import getApplicantDetails from "@salesforce/apex/loanEAgreementController.getApplicant";
import getStampingDetails from "@salesforce/apex/LoanAgreementController.getStampingDetails";
import insertAdditionalStampings from "@salesforce/apex/LoanAgreementController.insertAdditionalStampings";
import getNeslRetries from "@salesforce/apex/loanEAgreementController.getMaxTryCount";
import getSubmittedCheck from "@salesforce/apex/loanEAgreementController.getSubmittedCheck";
import doAgreementBookletCallout from "@salesforce/apexContinuation/IntegrationEngine.doAgreementBookletCallout";
import doStampingDetailsCallout from "@salesforce/apexContinuation/IntegrationEngine.doStampingDetailsCallout"
import doRegistrationJourneyCallout from "@salesforce/apexContinuation/IntegrationEngine.doRegistrationJourneyCallout";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import LoanAgreement_OBJECT from "@salesforce/schema/Loan_Agreement__c";
import { refreshApex } from "@salesforce/apex";
import ID_FIELD from "@salesforce/schema/Loan_Agreement__c.Id";
import BorrowerCount_FIELD from "@salesforce/schema/Loan_Agreement__c.BorrowerNesLCallCount__c";
import CoborrowerCount_FIELD from "@salesforce/schema/Loan_Agreement__c.CoBorrowerNeslCallCount__c";
import AgreementType_FIELD from "@salesforce/schema/Loan_Agreement__c.Agreement_Type__c";
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import STAMP_OBJECT from '@salesforce/schema/Stamp_Detail__c';
import STAMP_LOCATION_TYPE_FIELD from '@salesforce/schema/Stamp_Detail__c.Stamp_Location_Type__c';
import STAMP_TOWARDS_FIELD from '@salesforce/schema/Stamp_Detail__c.Stamp_Towards__c';
import { NavigationMixin } from "lightning/navigation";
import Cannot_Continue_with_EAgreement from '@salesforce/label/c.Cannot_Continue_with_EAgreement';
import Borrower_Agreement_Booklet_Received_Successfully from '@salesforce/label/c.Borrower_Agreement_Booklet_Received_Successfully';
import Co_Borrower_E_Agreement_Response_Received_Successfully from '@salesforce/label/c.Co_Borrower_E_Agreement_Response_Received_Successfully';
import Not_Eligible_for_EAgreement_Process from '@salesforce/label/c.Not_Eligible_for_EAgreement_Process';
import Application_is_eligible_for_e_agreement from '@salesforce/label/c.Application_is_eligible_for_e_agreement';
import Borrower_E_Agreement_Response_Received_Successfully from '@salesforce/label/c.Borrower_E_Agreement_Response_Received_Successfully';
import Cannot_Proceed_Further from '@salesforce/label/c.Cannot_Proceed_Further';
import Thank_you from '@salesforce/label/c.Thank_you';
import Stamps_successfully_created from '@salesforce/label/c.Stamps_successfully_created';
import getResponse from "@salesforce/apex/LoanAgreementController.getResponse";

// import eAgreementValidate from '@salesforce/apex/loanEAgreementController.eAgreementValidate';// Gaurav Changes
import NeslEAgreementConfirmMsg from '@salesforce/label/c.NeslEAgreementConfirmMsg';// Gaurav : Changes
import getInitiateAgreementDisable from '@salesforce/apex/loanEAgreementController.getInitiateAgreementDisable';// Gaurav Changes
import checkRetryExhausted from '@salesforce/apex/loanEAgreementController.checkRetryExhausted';// Gaurav Changes
import updateLoanAppHistory from '@salesforce/apex/loanEAgreementController.updateLoanAppHistory';// Gaurav Changes
import NeSLEAgreementApiErrorMsg from '@salesforce/label/c.NeSLEAgreementApiErrorMsg';// Gaurav Changes
import NeSLEAgreementSelfThankYouMsg from '@salesforce/label/c.NeSLEAgreementSelfThankYouMsg';// Gaurav Changes
import NESL_EAgreementRetryCount from '@salesforce/label/c.NESL_EAgreementRetryCount';// Gaurav Changes
import Borrower from '@salesforce/label/c.Borrower';// Gaurav Changes
import CoBorrower from '@salesforce/label/c.CoBorrower';// Gaurav Changes
import AgreementSigningPending from '@salesforce/label/c.AgreementSigningPending';// Gaurav Changes
import AgreementSignedSuccessfully from '@salesforce/label/c.AgreementSignedSuccessfully';// Gaurav Changes
import NoDataFound from '@salesforce/label/c.NoDataFound';// Gaurav Changes
import retryCountIncrease from '@salesforce/apex/loanEAgreementController.retryCountIncrease';// Gaurav Changes
import doInitiateNESLCallout from '@salesforce/apexContinuation/IntegrationEngine.doInitiateNESLCallout';// Gaurav Changes
import doNeSLAgreementStatusCallout from '@salesforce/apexContinuation/IntegrationEngine.doNeSLAgreementStatusCallout';// Gaurav Changes

// Deal_Number__c
// Agent_BL_code__c
export default class iND_LWC_LoanAgreement extends NavigationMixin(
    LightningElement
) {
    @api oppId;
    @api readonly = false;
    loanAgreementId;
    showSpinner;
    showApplDetails;
    total = 0;
    @track listOfStamps = [];
    @track totalAmount = 0;
    @track showExistingLASD = true;
    @track showExistingPOASD = true;
    @track showAddlSDLA = false;
    @track showAddlSDPOA = true;
    @track showAddlLASD = true;
    @track showAddlPOASD = true;
    showPOASDPhysicalAgreement = true;
    showFetchBookletSpinner;
    isEAgreementType;
    showSaveSpinner;
    showModal;

    loanAgreementData;
    disableInitiateAgreement;
    disableInitiateCoBorrowerAgreement = true;
    initiateMethodoptionlist;
    disableinitiateMethod = false;
    initateMethodValue;
    neslMaxRetryCount;
    coborrowerId;
    borrowerId;

    isSubmittedcheck;
    disableCheckstatus = true;
    disableSubmit = true;

    showConfirmModal; // Gaurav Changes
    confirmModalMessage = NeslEAgreementConfirmMsg; // Gaurav changes
    initiateAgreementBtnDisable; // Gaurav : Changes
    currentAgreementBookletNumber; // Gaurav : Changes
    agreementBookletNumber; // Gaurav : Changes
    isSpinnerVisible = false;// Gaurav : Changes
    currentStageName;// Gaurav : Changes

    @track agentBLCode;
    @track invoiceDate;
    @track agreementDate;
    @track tentativePaymentDate;
    @track sanctionDate;
    @track disableDealDateBasedOn = false;
    @track productType;
    @api recordId;
    @track disableGetBookletButton = false;
    @track additionalStampings = [];
    @track stampLocationTypes = [];
    @track stampTowards = [];
    @track totalAdditionalStampDone = 0;
    @track totalExistingStampDone = 0;
    @track geoStateCode;
    @track financeAmount;
    @track agreementType = 'Physical agreement';
    @wire(getObjectInfo, { objectApiName: STAMP_OBJECT })
    stampMetadata;

    @track showUpload;
    @track showPhotoCopy;
    @track showDocView;
    @track isVehicleDoc;
    @track isAllDocType;
    @track uploadViewDocFlag;
    @track uploadScannedBookletFlag = false;
    @track docType;
    @track stampingChargesCollected;
    @track totalStampingDone;
    @track agreeementDoc;
    @track docLabel = 'Upload Scanned Booklet';
    @track stampingDetails;
    @track stampingDetailsCalled = 0;
    @track additionalSDAdded = false
    @track requiredStampingChanges = 0;
    @wire(getPicklistValues, {
        recordTypeId: '$stampMetadata.data.defaultRecordTypeId',
        fieldApiName: STAMP_LOCATION_TYPE_FIELD
    }) fetchPicklist1({ error, data }) {
        if (data !== undefined) {
            console.debug(data.values);
            this.stampLocationTypes = data.values;
        } else if (error) {
            console.debug(error);
        }
    }

    renderedCallback() {
        console.debug(this.stampingDetailsCalled);
        console.debug(this.oppId);

        if (this.stampingDetailsCalled < 2) {
            getStampingDetails({
                loanAgrementId: this.loanAgreementId,
                loanAppId: this.oppId
            })
                .then((response) => {
                    if (response) {
                        this.stampingDetailsCalled += 1;
                        //this.stampingDetails = response;
                        for (let res of response.existingStamping) {
                            if (res.Type__c.includes('Loan Agreement')) {
                                this.disableGetBookletButton = true;
                                this.template
                                    .querySelectorAll("lightning-input-field")
                                    .forEach((input) => {
                                        if (input.fieldName == "Existing_LA_Stamp_S_No__c") {
                                            input.value = res.Stamp_S_No__c;
                                        } else if (input.fieldName == "Existing_LA_Stamp_On__c") {
                                            input.value = res.Stamp_Date__c;
                                        } else if (input.fieldName == "Existing_LA_Stamped_For__c") {
                                            input.value = res.Stamp_For__c;
                                        } else if (input.fieldName == "Existing_LA_Stamped_Towards__c") {
                                            input.value = res.Stamp_Towards__c;
                                        } else if (input.fieldName == "Existing_LA_Stamp_Location_Type__c") {
                                            input.value = res.Stamp_Location_Type__c;
                                        } else if (input.fieldName == "Existing_LA_Stamp_Type__c") {
                                            input.value = res.Stamp_Type__c;
                                        } else if (input.fieldName == "Existing_LA_Stamp_Value__c") {
                                            input.value = res.Stamp_Value__c;
                                            this.totalExistingStampDone = res.Stamp_Value__c;
                                        }
                                    });
                            }
                        }
                        if (this.totalExistingStampDone == this.requiredStampingChanges) {
                            this.template.querySelector("lightning-input-field[field-name=Loan_Agreement_Stamping_Met__c]").checked = true;
                        }
                        if (response.additionalStamping && response.additionalStamping.length > 0) {
                            this.listOfStamps = response.additionalStamping;
                            console.debug(this.listOfStamps);
                        }
                    }
                })
                .catch((error) => {
                    console.log("error:", error);
                    this.showToast("Error!", error ? error.body ? error.body.message : '' : '', "error", "dismissable");
                });
        }

        this.template
            .querySelectorAll("lightning-input-field")
            .forEach((input) => {
                if (input.fieldName == "Invoice_Date__c") {
                    input.value = this.invoiceDate;
                } else if (input.fieldName == "AgreementDate__c") {
                    if (!input.value) {
                        let agreementDate = new Date();
                        this.agreementDate = agreementDate.toLocaleDateString('en-CA');
                        input.value = this.agreementDate;

                    }
                } else if (input.fieldName == "Ist_EMI_Due_Date__c") {
                    if (input.value) {
                        //this.template
                        //.querySelector("lightning-input-field[field-name=Is_1st_EMI_due_date_correctly_captured__c]").checked = true;
                    }
                } else if (input.fieldName == "Finance_Amount__c") {
                    input.value = this.financeAmount;
                } else if (input.fieldName == "Is_Additional_Loan_Agreement_Stamp_Duty__c") {
                    input.checked = this.additionalSDAdded;
                } else if (input.fieldName == "Required_Loan_Agreement_Stamping_Charges__c") {
                    input.value = this.requiredStampingChanges;
                }
                if (this.readonly) {

                    input.disabled = true;
                }
            });
    }
    connectedCallback() {
        console.debug('adasda');
        if (this.readonly) {
            this.docLabel = 'View Scanned Booklet';
        }
        this.initRows();
        console.log("Connetedcall----" + this.oppId);
        console.log("Connetedcall- 1---" + this.neslMaxRetryCount);
        this.showSpinner = true;
        this.disableSubmit = false; // Gaurav : Changes
        getAgreementCopyDocumentData({
            loanAppId: this.oppId,
        })
            .then((response) => {

                this.agreeementDoc = response;

            })
            .catch((error) => {
                this.showSpinner = false;
                this.showToast("Error!", error ? error.body ? error.body.message : '' : '', "error", "dismissable");
            });
        getResponse()
            .then((response) => {
                console.debug('getResponse', response);
                const responseFetched = JSON.parse(response);
                console.debug(responseFetched);
                if (responseFetched ? responseFetched.content.length > 0 ? responseFetched.content[0].Dt_Stamping_Agree_Master.length > 0 : false : false) {
                    for (let res of responseFetched.content[0].Dt_Stamping_Agree_Master) {
                        if (res.Document_Type == "AGREEMENT") {
                            this.requiredStampingChanges += paserInt(res.StampDuty_Amount);
                            if (res.NESL_ESigning_Applicable_Flag.toLowerCase() == "y" &&
                                res.NESL_EStamp_Applicable_Flag.toLowerCase() == "y" &&
                                res.NESL_Digital_EStamp_Required_Flag.toLowerCase() == "y" &&
                                res.NESL_ESigning_Manual_Override_Flag.toLowerCase() == "n") {
                                this.agreementType = 'e-agreement';
                            } else {
                                this.agreementType = 'Physical agreement';
                            }

                            if (res.Adhesive_Flag.toLowerCase() == "y" || res.Stamp_Paper_Flag.toLowerCase() == "y" ||
                                res.Franking_Flag.toLowerCase() == "y") {
                                this.agreementType = 'Physical agreement';
                            }

                            if (res.SHCIL_EStamp_Flag.toLowerCase() == "y") {
                                this.agreementType = 'Physical agreement';
                            }
                        }
                    }
                }

            })
            .catch((error) => {
                this.showSpinner = false;
                this.showToast("Error!", error ? error.body ? error.body.message : '' : '', "error", "dismissable");
            });



        getTaxInvoiceDate({
            loanAppId: this.oppId,
        })
            .then((response) => {
                console.debug('getTaxInvoiceDate', response);
                this.invoiceDate = response;

            })
            .catch((error) => {
                this.showSpinner = false;
                this.showToast("Error!", error ? error.body ? error.body.message : '' : '', "error", "dismissable");
            });
        getLoanAgreement({
            oppId: this.oppId,
        })
            .then((response) => {
                console.debug('getLoanAgreement', response);
                this.showSpinner = false;
                if (response == null) {
                    this.isLoanAgreementAvailable = false;
                    this.showToast("Error!", "No Record Found", "error", "dismissable");
                    return;
                }
                console.log("response:", response);
                this.loanAgreementId = response.Id;
                this.agentBLCode = response.Loan_Application__r.Agent_BL_code__c;
                this.sanctionDate = response.Loan_Application__r.Sanction_Date__c;
                this.productType = response.Loan_Application__r.Product_Type__c;
                this.financeAmount = response.Loan_Application__r.Finance_Amount__c;
                this.additionalSDAdded = response.Is_Additional_Loan_Agreement_Stamp_Duty__c;
                if (response.Is_Additional_Loan_Agreement_Stamp_Duty__c) {
                    this.showAddlSDLA = true;
                }
                this.isEAgreementType = response ? response.Agreement_Type__c ?
                    response.Agreement_Type__c.toLowerCase() == "e-agreement" ?
                        true :
                        false :
                    false :
                    false;

                // isScannedBookletAvailable({
                //         oppId: this.oppId,
                //     })
                //     .then((response) => {
                //         console.debug('isScannedBookletAvailable', response);
                //         this.showSpinner = false;

                //         if (!this.isEAgreementType && response && this.stampingChargesCollected <= this.totalStampingDone) {

                //             this.disableSubmit = false;

                //         } else if (this.isEAgreementType) {
                //             this.disableSubmit = false;
                //         }
                //     })
                //     .catch((error) => {});
                console.debug(this.agentBLCode);
                getGeoGraphicalState({
                    agentBLCode: this.agentBLCode,
                })
                    .then((response) => {
                        this.showSpinner = false;
                        this.geoStateCode = response;
                        this.template
                            .querySelectorAll("lightning-input-field")
                            .forEach((input) => {
                                if (input.fieldName == "Geographical_State__c") {
                                    input.value = response;
                                }
                            });
                    })
                    .catch((error) => {
                        console.log("error:", error);
                        this.showToast("Error!", error ? error.body ? error.body.message : '' : '', "error", "dismissable");
                    });
                getAdvancedEMI({
                    loanAppId: this.oppId,
                })
                    .then((response) => {
                        this.showSpinner = false;
                        console.log('response:', response);
                        if (response == true) {
                            let today;
                            if (this.agreementDate) {
                                today = new Date(this.agreementDate);
                            } else {
                                today = new Date();
                            }

                            let x1stEMIDate = new Date(
                                today.getFullYear(),
                                (today.getMonth() == 12 ? 0 : today.getMonth()) + 1,
                                today.getDate()
                            );
                            let x2ndEMIDate = new Date(
                                today.getFullYear(),
                                (today.getMonth() == 12 ? 0 : today.getMonth()) + 2,
                                today.getDate()
                            );
                            let day = 4;
                            if (this.productType && this.productType.includes("Two Wheeler")) {
                                if (parseInt(x1stEMIDate.getDate()) < 21) {
                                    day = 6;
                                } else {
                                    day = 20;
                                }
                            } else if (this.productType && this.productType.includes("Passenger Vehicles")) {
                                if (parseInt(x1stEMIDate.getDate()) < 21) {
                                    day = 4;
                                } else {
                                    day = 20;
                                }
                            }
                            if (parseInt(String(x1stEMIDate.getDate())) > day) {
                                x1stEMIDate = new Date(
                                    x1stEMIDate.getFullYear(),
                                    x1stEMIDate.getMonth(),
                                    day + 1
                                );
                                x2ndEMIDate = new Date(
                                    x2ndEMIDate.getFullYear(),
                                    x2ndEMIDate.getMonth(),
                                    day + 1
                                );
                            }
                            this.template
                                .querySelectorAll("lightning-input-field")
                                .forEach((input) => {
                                    if (input.fieldName == "Ist_EMI_Due_Date__c") {
                                        input.value = x1stEMIDate.toLocaleDateString('en-CA');
                                    } else if (input.fieldName == "X2nd_EMI_Due_Date__c") {
                                        input.value = x2ndEMIDate.toLocaleDateString('en-CA');
                                    } else if (input.fieldName == "Agreement_Date__c") {
                                        input.value = today;
                                    } else if (input.fieldName == "Is_1st_EMI_due_date_correctly_captured__c") {
                                        console.debug(input);
                                        input.checked = true;
                                    }
                                });
                        }
                    })
                    .catch((error) => {
                        this.showSpinner = false;
                        this.showToast("Error!", error ? error.body ? error.body.message : '' : '', "error", "dismissable");
                    });
            })
            .catch((error) => {
                this.showSpinner = false;
                this.showToast("Error!", error ? error.body ? error.body.message : '' : '', "error", "dismissable");
            });
    }

    @wire(getNeslRetries)
    getMaxRetry({ error, data }) {
        if (data) {
            this.neslMaxRetryCount = data;
            console.log("getMaxRetrys- 1---" + this.neslMaxRetryCount);
        } else if (error) {
            console.log("Error--getMaxRetry--" + JSON.stringify(error));
        }
    }

    @wire(getSubmittedCheck, { loanAppId: "$oppId" })
    getSubmittedCheck({ error, data }) {
        if (data) {
            this.isSubmittedcheck = data;
            console.log("isSubmittedcheck- 1---" + this.isSubmittedcheck);
        } else if (error) {
            console.log("Error--getSubmittedCheck--" + JSON.stringify(error));
        }
    }

    @wire(getInitiateAgreementDisable, { loanAppId: '$oppId' })
    getInitiateAgreementDisable({ error, data }) {
        if (data) {
            this.initiateAgreementBtnDisable = data;
            console.log('getInitiateAgreementDisable- 1---' + this.initiateAgreementBtnDisable);
        } else if (error) {
            console.log('Error--getInitiateAgreementDisable--' + JSON.stringify(error));
        }
    }

    @wire(getLoanEAgreementDetails, { loanAppId: "$oppId" }) //'$recordId'
    getLoanEAgreement(value) {
        this.loanAgreementData = value;
        const { data, error } = value;
        if (data) {
            this.currentStageName = data.Loan_Application__r.StageName; //Gaurav : Changes
            this.agreementBookletNumber = data.Agreement_Booklet_Num__c; // Gaurav : Changes
            console.log("data-----" + JSON.stringify(data));
            if (data.Agreement_Type__c == "Physical agreement") {
                this.disableInitiateAgreement = true;
                this.disableInitiateCoBorrowerAgreement = true;
                this.disableinitiateMethod = true;
            } else if (data.Agreement_Type__c == "e-agreement") {
                this.disableInitiateAgreement = true;
                this.disableInitiateCoBorrowerAgreement = true;
                this.disableinitiateMethod = false;
            }
        } else if (error) {
            console.log("Error--getLoanEAgreement--" + error);
        }
    }

    @wire(getApplicantDetails, { loanAppId: "$oppId" })
    getApplicantDetails({ error, data }) {
        if (data) {
            console.log("Result getApplicantDetails-----" + JSON.stringify(data));
            data.forEach((x) => {
                console.log("Array----" + x.Applicant_Type__c);
                if (x.Applicant_Type__c == "Co-borrower") {
                    //this.disableInitiateCoBorrowerAgreement = true;
                    this.hasCoBorrower = true;
                    this.coborrowerId = x.Id;
                } else if (x.Applicant_Type__c == "Borrower") {
                    this.hasBorrower = true;
                    this.borrowerId = x.Id;
                }
            });
        } else if (error) {
            console.log("Error--getApplicantDetails--" + JSON.stringify(error));
        }
    }

    handleInitiateMethodChange(event) {
        let initateMethodVal = event.detail.value;
        console.log('initateMethodVal=====' + typeof initateMethodVal);
        this.initateMethodValue = initateMethodVal;
        this.disableSubmit = true;
        this.disableInitiateCoBorrowerAgreement = true;
        if (initateMethodVal.length == 0) {
            this.disableInitiateAgreement = true;
        } else {
            this.disableInitiateAgreement = this.initiateAgreementBtnDisable == true ? true : false;
        }
    }

    handleInitiateAgreementClick(event) {
        let checkRetryExhaustedFlag = false;
        this.isSpinnerVisible = true;

        console.log('this.isSpinnerVisible --> ', this.isSpinnerVisible);

        checkRetryExhausted({ loanApplicationId: this.oppId, serviceName: NESL_EAgreementRetryCount, applicantId: this.borrowerId, applicantType: Borrower,currentStageName:this.currentStageName }).then(result => {
            checkRetryExhaustedFlag = result;
            
            console.log('checkRetryExhaustedFlag 123 -- >', result);

            console.log('checkRetryExhaustedFlag -- >', checkRetryExhaustedFlag);
            console.log('this.isSubmittedcheck-- > ', this.isSubmittedcheck);
            if (checkRetryExhaustedFlag) {
                this.disableInitiateAgreement = true;
                this.disableInitiateCoBorrowerAgreement = true;
                const fields = {};

                fields[ID_FIELD.fieldApiName] = this.loanAgreementId;
                fields[AgreementType_FIELD.fieldApiName] = 'Physical agreement';
                const recordInput = {
                    fields: fields
                };
                this.isSpinnerVisible = false;
                updateRecord(recordInput).then(() => {
                    console.log('inside borrower maxtry update');
                    refreshApex(this.loanAgreementData);
                    this.isEAgreementType = false;
                })
                    .catch(error => {
                        console.error('record update fail in borrower maxtry catch', JSON.stringify(fields));
                    });
            }
            if (this.initateMethodValue == 'Face to Face') {
                doInitiateNESLCallout({ applicantId: this.borrowerId, loanAppId: this.oppId,initiationMethod : this.initateMethodValue })
                    .then(result => {
                        this.isSpinnerVisible = false;
                        const response = JSON.parse(result);
                        console.log('doInitiateNESLCallout ' + result);

                        if (response.response.status == 'SUCCESS') {
                            this.disableInitiateCoBorrowerAgreement = this.hasCoBorrower == true ? false : true;
                            // this.disableSubmit = this.hasCoBorrower == true ? true : false;

                            window.open(response.response.content[0].ResURL, '_blank');
                        } else {
                            
                            this.showToast('', `${NeSLEAgreementApiErrorMsg}`, 'error', 'dismissable');

                            retryCountIncrease({ loanApplicationId: this.oppId, serviceName: NESL_EAgreementRetryCount, applicantId: this.borrowerId, applicantType: Borrower,currentStageName:this.currentStageName }).then(result => {
                                if (result == true) {
                                    refreshApex(this.loanAgreementData);
                                }
                            }).catch(error => {
                                console.error('error --> ' + error);
                            });
                        }

                    })
                    .catch(error => {
                        this.isSpinnerVisible = false;
                        this.showToast('', `${error.body.message}`, 'error', 'dismissable');

                        retryCountIncrease({ loanApplicationId: this.oppId, serviceName: NESL_EAgreementRetryCount, applicantId: this.borrowerId, applicantType: Borrower,currentStageName:this.currentStageName }).then(result => {
                            if (result == true) {
                                refreshApex(this.loanAgreementData);
                            }
                        }).catch(error => {
                            console.error('error --> ' + error);
                        });
                    });
            } else if (this.initateMethodValue == 'Self') {
                doInitiateNESLCallout({ applicantId: this.borrowerId, loanAppId: this.oppId ,initiationMethod : this.initateMethodValue })
                    .then(result => {
                        const response = JSON.parse(result);
                        this.isSpinnerVisible = false;
                        if (response.response.status == 'SUCCESS') {
                            this.disableCheckstatus = false;
                            //    this.disableSubmit = false;
                            const event = new ShowToastEvent({
                                title: `${NeSLEAgreementSelfThankYouMsg}`,
                                message: '',
                                variant: 'success',
                                mode: 'dismissable'
                            });
                            this.dispatchEvent(event);
                            window.open(response.response.content[0].ResURL, '_blank');
                        } else {
                            this.showToast('', `${NeSLEAgreementApiErrorMsg}`, 'error', 'dismissable');

                            retryCountIncrease({ loanApplicationId: this.oppId, serviceName: NESL_EAgreementRetryCount, applicantId: this.borrowerId, applicantType: Borrower,currentStageName:this.currentStageName }).then(result => {
                                if (result == true) {
                                    refreshApex(this.loanAgreementData);
                                }
                            }).catch(error => {
                                console.error('error --> ' + error);
                            });
                        }

                    })
                    .catch(error => {
                        console.log('error --> ',error);
                        this.showToast('', `${error.body.message}`, 'error', 'dismissable');
                        this.isSpinnerVisible = false;
                        retryCountIncrease({ loanApplicationId: this.oppId, serviceName: NESL_EAgreementRetryCount, applicantId: this.borrowerId, applicantType: Borrower ,currentStageName:this.currentStageName}).then(result => {
                            if (result == true) {
                                refreshApex(this.loanAgreementData);
                            }
                        }).catch(error => {
                            console.error('error --> ' + error);
                        });
                    });
            }
        }).catch(error => {
            console.error(error);
            this.isSpinnerVisible = false;
        });

        
    }

    handleInitiateCoBorrowerAgreementClick(event) {
        let checkRetryExhaustedFlag = false;
        this.isSpinnerVisible = true;
        checkRetryExhausted({ loanApplicationId: this.oppId, serviceName: NESL_EAgreementRetryCount, applicantId: this.coborrowerId, applicantType: CoBorrower,currentStageName:this.currentStageName }).then(result => {
            checkRetryExhaustedFlag = result;
            console.log('checkRetryExhaustedFlag -- >', result);
            console.log('checkRetryExhaustedFlag--> ', checkRetryExhaustedFlag);
            if (checkRetryExhaustedFlag) {
                this.disableInitiateAgreement = true;
                this.disableInitiateCoBorrowerAgreement = true;
                const fields = {};

                this.isSpinnerVisible = false;

                fields[ID_FIELD.fieldApiName] = this.loanAgreementId;
                fields[AgreementType_FIELD.fieldApiName] = 'Physical agreement';
                const recordInput = {
                    fields: fields
                };
                updateRecord(recordInput).then(() => {
                    refreshApex(this.loanAgreementData);
                    this.isEAgreementType = false;
                })
                    .catch(error => {
                        console.error('record update fail in coborrower maxtry catch', JSON.stringify(fields));
                    });
            } else {
                if (this.initateMethodValue == 'Face to Face') {
                    doInitiateNESLCallout({ applicantId: this.coborrowerId, loanAppId: this.oppId ,initiationMethod : this.initateMethodValue })
                        .then(result => {
                            const response = JSON.parse(result);

                            
                            if (response.response.status == 'SUCCESS') {
                                this.disableCheckstatus = false;
                                window.open(response.response.content[0].ResURL, '_blank');
                                this.isSpinnerVisible = false;
                            }
                            else {
                                this.showToast('', `${NeSLEAgreementApiErrorMsg}`, 'error', 'dismissable');
                                this.isSpinnerVisible = false;
                                retryCountIncrease({ loanApplicationId: this.oppId, serviceName: NESL_EAgreementRetryCount, applicantId: this.coborrowerId, applicantType: CoBorrower,currentStageName:this.currentStageName }).then(result => {
                                    if (result == true) {
                                        refreshApex(this.loanAgreementData);
                                    }
                                }).catch(error => {
                                    console.log('error --> ' + error);
                                });

                            }
                        })
                        .catch(error => {
                            this.showToast('', `${error.body.message}`, 'error', 'dismissable');
                            this.isSpinnerVisible = false;
                            retryCountIncrease({ loanApplicationId: this.oppId, serviceName: NESL_EAgreementRetryCount, applicantId: this.coborrowerId, applicantType: CoBorrower,currentStageName:this.currentStageName }).then(result => {
                                if (result == true) {
                                    refreshApex(this.loanAgreementData);
                                }
                            }).catch(error => {
                                console.log('error --> ' + error);
                            });
                        });
                }
            }
        }).catch(error => {
            console.error(error);
            this.isSpinnerVisible = false;
        });

    }

    handleCheckStatusClick(event) {
        doNeSLAgreementStatusCallout({ applicantId: this.borrowerId, loanAppId: this.oppId })
            .then(result => {
                const response = JSON.parse(result);

                this.disableSubmit = false;

                if (response.response.status == 'SUCCESS') {
                    if (response.response.content[0].Status_Code == '1' && response.response.content[0].Esign_Link != null) {
                        this.showToast('', AgreementSigningPending, 'warning', "dismissable");
                    } else if (response.response.content[0].Status_Code == 'S002') {
                        let fields = {};
                        fields['Id'] = this.loanAgreementId;
                        this.template.querySelectorAll(`lightning-input-field[data-id="signed-fields"]`).forEach(element => {
                            element.checked = true;
                            fields[element.dataset.name] = element.checked;
                        });
                        const recordInput = { fields };
                        updateRecord(recordInput).then(() => {
                            this.showToast('', AgreementSignedSuccessfully, 'success', "dismissable");
                        });
                    }
                }
                else if (response.response.status == 'FAILED') {
                    this.showToast('', NoDataFound, 'failed', "dismissable");
                }

            })
            .catch(error => {
                console.error('Check Status Error->', error);
            });
    }

    handleChange(event) {
        let section = parseInt(event.target.dataset.section);
        let accord = parseInt(event.target.dataset.accord);
        if (accord == 1) {
            switch (section) {
                case 1:
                    break;
                case 2:
                    break;
                    var eAgreementSet = [];
                    this.template
                        .querySelectorAll("lightning-input-field")
                        .forEach((input) => {
                            if (
                                parseInt(input.dataset.section) == section &&
                                parseInt(input.dataset.accord) == accord
                            ) {
                                eAgreementSet.push(input.value);
                            }
                        });
                    if (eAgreementSet.length > 0) {
                        if (!eAgreementSet[1] || eAgreementSet[1].toLowerCase() == "no") {
                            this.showToast(
                                "Error !",
                                Not_Eligible_for_EAgreement_Process,
                                "error"
                            );
                        } else if (
                            eAgreementSet[1] &&
                            eAgreementSet[2] &&
                            eAgreementSet[3] &&
                            eAgreementSet[4] &&
                            eAgreementSet[5]
                        ) {
                            this.showToast(
                                "Success !",
                                Application_is_eligible_for_e_agreement,
                                "success"
                            );
                        } else if (
                            eAgreementSet[1] &&
                            (!eAgreementSet[2] ||
                                !eAgreementSet[3] ||
                                !eAgreementSet[4] ||
                                !eAgreementSet[5])
                        ) {
                            this.showToast(
                                "Error !",
                                Cannot_Continue_with_EAgreement,
                                "error"
                            );
                        }
                    }
                    break;
                case 4:
                    this.showExistingLASD = true;
                    this.showExistingPOASD = true;
                    break;
            }
        }
        if (accord == 3) {
            switch (section) {
                case 1:
                    this.showAddlSDLA = !this.showAddlSDLA;
                    break;
            }
        }
        if (accord == 4) {
            switch (section) {
                case 1:
                    this.showAddlSDPOA = true;
                    break;
            }
        }
        if (accord == 5) {
            switch (section) {
                case 1:
                    this.showAddlLASD = true;
                    break;
            }
        }
        if (accord == 6) {
            switch (section) {
                case 1:
                    this.showAddlPOASD = true;
                    break;
            }
        }
        if (accord == 7) {
            switch (section) {
                case 1:
                    if (this.readonly) {
                        if (this.agreeementDoc.length > 0) {
                            this.uploadScannedBookletFlag = true;
                            this.showUpload = false;
                            this.showPhotoCopy = false;
                            this.showDocView = true;
                            this.isVehicleDoc = true;
                            this.isAllDocType = false;
                            this.documentRecordId = agreeementDoc[0].Id;
                        } else {
                            const evt = new ShowToastEvent({
                                title: 'Document not found',
                                message: 'This type of document not uploded yet.',
                                variant: 'info',
                            });
                            this.dispatchEvent(evt);
                        }
                    } else {
                        this.showUpload = true;
                        this.showPhotoCopy = false;
                        this.showDocView = true;
                        this.isVehicleDoc = true;
                        this.isAllDocType = false;
                        this.uploadScannedBookletFlag = true;
                        this.docType = 'Agreement Copy';
                    }
                    break;
            }
        }
    }

    showConfirmationBox() {
        this.showModal = true;
    }

    hideModal() {
        this.showModal = false;
        this.showFetchBookletSpinner = false;
    }    
    
    //Gaurav
    hideConfirmModal() {
        this.showModal = false;
        this.showConfirmModal = false; // Confirm modal toggle ... Signing of e-agreement
        this.showFetchBookletSpinner = false; //
        this.template.querySelector(`lightning-input-field[data-name="Agreement_Booklet_Num__c"]`).value = this.agreementBookletNumber;
    }

    handleFieldChange(event) {
        console.debug(event.target);

        if (event.target.fieldName.includes("Invoice_Date__c")) {
            this.invoiceDate = event.target.value;
        } else if (event.target.fieldName.includes("Tentative_Payment_Date__c")) {
            this.tentativePaymentDate = event.target.value;
        } else if (event.target.fieldName.includes("Deal_Date_Based_On__c")) {
            let effectiveDealDate = "";
            if (event.target.value.includes("Invoice Date")) {
                effectiveDealDate = this.invoiceDate;
            } else if (event.target.value.includes("Sanction Date")) {
                effectiveDealDate = this.sanctionDate ? this.sanctionDate : null;
            } else if (event.target.value.includes("Tentative Payment Date")) {
                effectiveDealDate = this.tentativePaymentDate;
            }
            this.template
                .querySelectorAll("lightning-input-field")
                .forEach((input) => {
                    if (input.fieldName == "Effective_Deal_Date__c") {
                        input.value = effectiveDealDate;
                    }
                });
        }
    }

    getLABookletDetails(event) {
        var bookletdetails = {};
        var havingNullValue;
        var accordionIndex = parseInt(event.target.dataset.accord);
        this.currentAgreementBookletNumber = this.template.querySelector(`lightning-input-field[data-name="Agreement_Booklet_Num__c"]`).value;     // Gaurav : Changes
        console.debug(this.borrowerId);
        console.debug(this.oppId);
        this.template.querySelectorAll("lightning-input-field").forEach((input) => {
            if (
                parseInt(input.dataset.accord) == accordionIndex &&
                parseInt(input.dataset.section) == accordionIndex
            ) {
                bookletdetails[input.fieldName] = input.value;
                if (input.value == null) {
                    havingNullValue = true;
                }
            }
        });
        if (havingNullValue) {
            this.showToast(
                "Error!",
                Cannot_Proceed_Further,
                "error",
                "dismissable"
            );
            return;
        }
        this.showFetchBookletSpinner = true;
        
        // Open the confirmation modal -- Signing e-agreement : Gaurav Changes
        if ((this.agreementBookletNumber != null || this.agreementBookletNumber != undefined) && 
        (this.agreementBookletNumber != this.currentAgreementBookletNumber)) {
            this.showConfirmModal = true;
        } else if(this.agreementBookletNumber != this.currentAgreementBookletNumber){
            this.doAgreementBookletCalloutMethod(bookletdetails.Agreement_Booklet_Num__c);
        }else{
            this.showFetchBookletSpinner = false;
        }


    }

    doAgreementBookletCalloutMethod(agreementBookletNumber) {
        doAgreementBookletCallout({
            agreementBookletNo: agreementBookletNumber,
            applicantId: this.borrowerId,
            loanAppId: this.oppId,
        })
            .then((result) => {
                let response = JSON.parse(result);
                if (response) {
                    this.fetchAgreementBookletDetail(
                        JSON.stringify(response),
                        this.loanAgreementId,
                        this.oppId,
                        agreementBookletNumber
                    );
                    this.template
                        .querySelectorAll("lightning-input-field")
                        .forEach((input) => {
                            if (input.dataset.accord == "1" && input.dataset.section == "2") {
                                for (let key in response) {
                                    if (input.fieldName == key) {
                                        input.value = response[key];
                                    }
                                }
                            }
                            if (response && response.content.length > 0) {
                                for (let con of response.content) {
                                    if (con.Stamp_Towards == 'AGREEMENT') {
                                        if (input.fieldName == "Existing_LA_Stamp_S_No__c") {
                                            input.value = res.Stamp_S_No;
                                        } else if (input.fieldName == "Existing_LA_Stamp_On__c") {
                                            input.value = res.Stamp_On;
                                        } else if (input.fieldName == "Existing_LA_Stamped_For__c") {
                                            input.value = res.Stamped_For;
                                        } else if (input.fieldName == "Existing_LA_Stamped_Towards__c") {
                                            input.value = res.Stamp_Towards;
                                        } else if (input.fieldName == "Existing_LA_Stamp_Type__c") {
                                            input.value = res.Stamp_Type;
                                        } else if (input.fieldName == "Existing_LA_Stamp_Value__c") {
                                            input.value = res.Stamp_Value;
                                            this.totalExistingStampDone = res.Stamp_Value;
                                        }
                                    }
                                }
                            }
                        });
                    if (this.totalExistingStampDone == this.requiredStampingChanges) {
                        this.template.querySelector("lightning-input-field[field-name=Loan_Agreement_Stamping_Met__c]").checked = true;
                    }
                    //this.showFetchBookletSpinner = false;
                    this.showToast(
                        "Success!",
                        Borrower_Agreement_Booklet_Received_Successfully,
                        "success",
                        "dismissable"
                    );
                }
            })
            .catch((error) => {
                console.error('error:', error);
                this.showToast("Error!", error ? error.body ? error.body.message : '' : '', "error", "dismissable");
                this.showFetchBookletSpinner = false;
            });
    }

    fetchAgreementBookletDetail(response, loanAgreementId, bookletNumber) {

        getAgreementBookletDetails({
            responseStr: response,
            loanAgrementId: loanAgreementId,
            loanAppId: this.oppId,
            bookletNumber: bookletNumber
        })
            .then((response) => {
                this.showFetchBookletSpinner = false;
                this.template
                    .querySelectorAll("lightning-input-field")
                    .forEach((input) => {
                        if (input.dataset.accord == "1" && input.dataset.section == "2") {
                            for (let key in response) {
                                if (input.fieldName == key) {
                                    input.value = response[key];
                                }
                            }
                        }
                    });
                this.showApplDetails = true;
            })
            .catch((error) => {
                console.error('error:', error);
                this.showToast("Error!", error.message, "error", "dismissable");
                this.showFetchBookletSpinner = false;
            });
        doStampingDetailsCallout({
            applicantId: '',
            loanAppId: this.oppId,
            geoStateCode: this.geoStateCode,
        })
            .then((response) => {
                console.log("response:", response);
            })
            .catch((error) => {
                console.log('error:', error);
                this.showToast("Error!", error.message, "error", "dismissable");
                this.showFetchBookletSpinner = false;
            });
    }

    handleConfirmSave(event) {
        try {
            const fields = {};
            fields[ID_FIELD.fieldApiName] = this.loanAgreementId;
            this.template.querySelectorAll('lightning-input-field').forEach(input => {
                console.log(input.fieldName);
                if (input.disabled == false) {
                    if (input.fieldName == 'Deal_Date_Based_On__c' || input.fieldName == 'Due_Date_Pattern__c') {
                        input.value = '';
                        fields[input.fieldName] = input.value;
                    } else {
                        input.value = input.fieldName == 'Agreement_Booklet_Num__c' ? input.value : null;
                        fields[input.fieldName] = input.value;
                    }
                }
            });
            const recordInput = { fields };
            updateRecord(recordInput).then(() => {
                refreshApex(this.loanAgreementData);
            }).catch(error => {
                console.error(error);
            });
            updateLoanAppHistory({ loanAppId: this.oppId }).then(result => {
                if (result == true) {
                    this.isSubmittedcheck = false;
                    this.disableInitiateAgreement = false;
                    this.disableCheckstatus = true;
                    this.disableSubmit = true;
                } else {
                    this.showToast('Failed', 'Agreement field updation failed', 'error', true);
                }
            });
            this.showConfirmModal = false;
            this.doAgreementBookletCalloutMethod(this.currentAgreementBookletNumber);
            this.agreementBookletNumber = this.currentAgreementBookletNumber;
        } catch (error) {
            console.log(error);
        }
    }

    handleSave(event) {
        event.preventDefault();
        this.showSaveSpinner = true;
        this.showModal = false;
        this.emiDisabled = true;
        const fields = {};
        this.template.querySelectorAll("lightning-input-field").forEach((input) => {
            if (input.dataset.accord == "1" && input.dataset.section == "3") {
                fields[input.fieldName] = input.value;
            }
        });
        console.log("fields", fields);
        this.template.querySelector("lightning-record-edit-form").submit(fields);
    }

    handleSuccess(event) {
        event.preventDefault();
        this.showSaveSpinner = false;
    }

    handleError(event) {
        event.preventDefault();
        this.showSaveSpinner = false;
        this.showToast("Error", JSON.stringify(event.detail), "error");
    }

    showToast(title, message, variant, mode) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode,
        });
        this.dispatchEvent(event);
    }
    initRows() {
        let listOfStamps = [];
        this.createRow(listOfStamps);
        this.listOfStamps = listOfStamps;
    }
    createRow(listOfStamps) {
        let stampDetail = {};
        console.debug(this.loanAgreementId);
        if (listOfStamps && listOfStamps.length > 0) {
            stampDetail.Stamp_S_No__c = parseInt(listOfStamps[this.listOfStamps.length - 1].Stamp_S_No__c) + 1;
        } else {
            stampDetail.Stamp_S_No__c = 1;
        }
        stampDetail.Loan_Agreement__c = this.loanAgreementId;
        stampDetail.Stamp_Towards__c = 'AGREEMENT';
        stampDetail.Type__c = 'Additional LA';
        stampDetail.Stamp_Date__c = null;
        stampDetail.Stamp_Location_Type__c = '';
        stampDetail.Stamp_For__c = null;
        stampDetail.Stamp_Type__c = null;
        stampDetail.Stamp_Value__c = null;
        console.log('stampDetail:', stampDetail);
        listOfStamps.push(stampDetail);
    }

    addNewRow() {
        this.createRow(this.listOfStamps);
    }

    removeRow(event) {
        let toBeDeletedRowIndex = event.target.name;

        let listOfStamps = [];
        for (let i = 0; i < this.listOfStamps.length; i++) {
            let tempRecord = Object.assign({}, this.listOfStamps[i]); //cloning object
            if (tempRecord.Stamp_S_No__c !== toBeDeletedRowIndex) {
                listOfStamps.push(tempRecord);
            }
        }

        for (let i = 0; i < listOfStamps.length; i++) {
            listOfStamps[i].Stamp_S_No__c = i + 1;
        }

        this.listOfStamps = listOfStamps;
        if (this.listOfStamps.length === 0) {
            this.createRow(this.listOfStamps);
        }
        this.calculateValue();

    }

    removeAllRows(listOfStamps) {
        listOfStamps = [];
        this.createRow(listOfStamps);
        this.listOfStamps = listOfStamps;
        this.calculateValue();
    }

    calculateValue() {
        this.totalAdditionalStampDone = 0;
        if (this.listOfStamps && this.listOfStamps.length > 0) {

            for (let stamp of this.listOfStamps) {
                console.debug(stamp.Stamp_Value__c);
                this.totalAdditionalStampDone += parseInt(stamp.Stamp_Value__c);
            }
        }
        console.debug(this.totalAdditionalStampDone);
        this.totalStampingDone = this.totalAdditionalStampDone + this.totalExistingStampDone;
        if (this.totalStampingDone == this.requiredStampingChanges) {
            this.template.querySelector("lightning-input-field[field-name=Loan_Agreement_Stamping_Met__c]").checked = true;
        }
    }

    handleInputChange(event) {
        let index = event.target.dataset.id;
        let fieldName = event.target.name;
        let value = event.target.value;
        console.log('fieldName:', fieldName);

        for (let i = 0; i < this.listOfStamps.length; i++) {
            if (this.listOfStamps[i].Stamp_S_No__c === parseInt(index)) {
                this.listOfStamps[i][fieldName] = value;
                if (fieldName.includes('Stamp_Value__c')) {
                    this.calculateValue();
                }
                this.listOfStamps[i]['Loan_Agreement__c'] = this.loanAgreementId;
                this.listOfStamps[i]['Stamp_Towards__c'] = "AGREEMENT";
                this.listOfStamps[i]['Type__c'] = "Additional LA";
            }
        }
        console.debug(this.listOfStamps);
    }
    submitAdditionalStamps() {
        insertAdditionalStampings({
            JSONResponse: JSON.stringify(this.listOfStamps)
        })
            .then(data => {
                this.showToast('Success', Stamps_successfully_created, 'success', "dismissable");
            })
            .catch(error => {
                console.log(error);
            });
    }
    changeUploadBooklet(event) {
        this.uploadScannedBookletFlag = false;
        if (event.detail.contentDocumentId) {
            this.disableSubmit = false;
        }

    }
    handleSubmitClick() {
        if (this.readonly) {
            updateLoanTransacionHistoryToSubmitted({
                oppId: this.oppId
            })
                .then(data => {
                    if (data) {
                        this.showToast('Success', 'Pre-Disbursement Loan Agreement is submitted', 'success', "dismissable");
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        } else {
            if (this.stampingChargesCollected > this.totalStampingDone) {
                this.showToast("Error!", 'Stamping charges collected are more than total stamping done on the agreement. Please add ' + this.stampingChargesCollected - this.totalStampingDone + ' stamps to continue', "error", "dismissable");
            } else {
                this.showModal = true;
            }
        }
        // eAgreementValidate({loanAppId : this.oppId}).then(result=>{
        //     if(result == false){
        //         this.showToast('','Please ensure that all concerned parties e-sign the agreement.','Warning','dismissable')
        //     }
        // })
    }
}