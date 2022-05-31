import { LightningElement, track, api, wire } from "lwc";
import { updateRecord, getRecordNotifyChange } from "lightning/uiRecordApi";
import getAgreementBookletDetails from "@salesforce/apex/LoanAgreementController.getAgreementBookletDetails";
import getLoanEAgreementDetails from "@salesforce/apex/loanEAgreementController.getLoanEAgreementDetails";
import getLoanAgreement from "@salesforce/apex/LoanAgreementController.getLoanAgreement";
import getGeoGraphicalState from "@salesforce/apex/LoanAgreementController.getGeoGraphicalState";
import getTaxInvoiceDate from "@salesforce/apex/LoanAgreementController.getTaxInvoiceDate";
import getAdvancedEMI from "@salesforce/apex/LoanAgreementController.getAdvancedEMI";
import getApplicantDetails from "@salesforce/apex/loanEAgreementController.getApplicant";
import getNeslRetries from "@salesforce/apex/loanEAgreementController.getMaxTryCount";
import getSubmittedCheck from "@salesforce/apex/loanEAgreementController.getSubmittedCheck";
import doAgreementBookletCallout from "@salesforce/apexContinuation/IntegrationEngine.doAgreementBookletCallout";
import doRegistrationJourneyCallout from "@salesforce/apexContinuation/IntegrationEngine.doRegistrationJourneyCallout";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import LoanAgreement_OBJECT from "@salesforce/schema/Loan_Agreement__c";
import { refreshApex } from "@salesforce/apex";
import ID_FIELD from "@salesforce/schema/Loan_Agreement__c.Id";
import BorrowerCount_FIELD from "@salesforce/schema/Loan_Agreement__c.BorrowerNesLCallCount__c";
import CoborrowerCount_FIELD from "@salesforce/schema/Loan_Agreement__c.CoBorrowerNeslCallCount__c";
import AgreementType_FIELD from "@salesforce/schema/Loan_Agreement__c.Agreement_Type__c";
import { NavigationMixin } from "lightning/navigation";
import fetchRecord from '@salesforce/apex/FetchRecord.fetchRecord';
// Deal_Number__c
// Agent_BL_code__c
export default class iND_LWC_LoanAgreement extends NavigationMixin(
    LightningElement
) {
    @api oppId;
    @api readonly;
    loanAgreementId;
    showSpinner;
    showApplDetails;
    total = 0;
    @track listOfStamps;
    @track totalAmount = 0;
    @track showExistingLASD = true;
    @track showExistingPOASD = true;
    @track showAddlSDLA = true;
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
    borrowerRetryCount;
    coborrowerRetryCount;
    isSubmittedcheck;
    disableCheckstatus = true;
    disableSubmit = true;
    @track agreementData;
    @track stampingDetails;
    @track agentBLCode;
    @track invoiceDate;
    @track agreementDate;
    @track tentativePaymentDate;
    @track sanctionDate;
    @track disableDealDateBasedOn = false;
    @track productType;
    @api recordId;
    
    renderedCallback() {

        fetchRecord({
            oppId: this.oppId,
        })
        .then((response) => {
            this.showSpinner = false;
            console.debug("response :",response);
            //this.invoiceDate = response;
            this.agreementData = response;
            console.debug("agreementdata booklet num test",this.agreementData);
        })
        .catch((error) => {
            console.log("error:", error);
            this.showToast("Error!", error?error.body?error.body.message:'':'', "error", "sticky");
        });

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
                        this.template
                            .querySelector("lightning-input-field[field-name=Is_1st_EMI_due_date_correctly_captured__c]").checked = true;
                    }
                } else if  (input.fieldName == "Agreement_Booklet_Num__c") {
                    console.debug(this.agreementData.Agreement_Booklet_Num__c);
                    input.value = this.agreementData.Agreement_Booklet_Num__c;
                } else if (input.fieldName == "Agreement_Type__c") {
                    input.value = this.agreementData.Agreement_Type__c;
                } else if (input.fieldName == "E_Agreement_Supported_In_State__c") {
                    input.value = this.agreementData.E_Agreement_Supported_In_State__c;
                } else if (input.fieldName == "Borrower_Has_Aadharcard__c") {
                    input.value = this.agreementData.Borrower_Has_Aadharcard__c;
                } else if (input.fieldName == "Borrower_Aadhar_Linked_To_Mobile__c") {
                    input.value = this.agreementData.Borrower_Aadhar_Linked_To_Mobile__c;
                } else if (input.fieldName == "Borrower_Aadhar_Mobile_In_Use__c") {
                    input.value = this.agreementData.Borrower_Aadhar_Mobile_In_Use__c;
                } else if (input.fieldName == "CoBorrower_Has_Aadharcard__c") {
                    input.value = this.agreementData.CoBorrower_Has_Aadharcard__c;
                } else if (input.fieldName == "CoBorrower_Aadhar_Mobile_In_Use__c") {
                    input.value = this.agreementData.CoBorrower_Aadhar_Mobile_In_Use__c;
                } else if (input.fieldName == "Tentative_Payment_Date__c") {
                    input.value = this.agreementData.Tentative_Payment_Date__c;
                } else if (input.fieldName == "Effective_Deal_Date__c") {
                    input.value = this.agreementData.Effective_Deal_Date__c;
                } else if (input.fieldName == "Deal_Date_Based_On__c") {
                    input.value = this.agreementData.Deal_Date_Based_On__c;
                } else if (input.fieldName == "Due_Date_Pattern__c") {
                    input.value = this.agreementData.Due_Date_Pattern__c;
                } else if (input.fieldName == "Ist_EMI_Due_Date__c") {
                    input.value = this.agreementData.Ist_EMI_Due_Date__c;
                } else if (input.fieldName == "Is_1st_EMI_due_date_correctly_captured__c") {
                    input.value = this.agreementData.Is_1st_EMI_due_date_correctly_captured__c;
                } else if (input.fieldName == "X2nd_EMI_Due_Date__c") {
                    input.value = this.agreementData.X2nd_EMI_Due_Date__c;
                } else if (input.fieldName == "Finance_Amount__c") {
                    input.value = this.agreementData.Finance_Amount__c;
                } else if (input.fieldName == "Required_Loan_Agreement_Stamping_Charges__c") {
                    input.value = this.agreementData.Required_Loan_Agreement_Stamping_Charges__c;
                } else if (input.fieldName == "ASD_POA_Required_POA_Stamping_Charges__c") {
                    input.value = this.agreementData.ASD_POA_Required_POA_Stamping_Charges__c;
                } else if (input.fieldName == "Total_Value_to_be_Stamped__c") {
                    input.value = this.agreementData.Total_Value_to_be_Stamped__c;
                } else if (input.fieldName == "Existing_LA_Stamp_S_No__c") {
                    input.value = this.agreementData.Existing_LA_Stamp_S_No__c;
                } else if (input.fieldName == "Existing_LA_Stamp_On__c") {
                    input.value = this.agreementData.Existing_LA_Stamp_On__c;
                } else if (input.fieldName == "Existing_LA_Stamp_Location_Type__c") {
                    input.value = this.agreementData.Existing_LA_Stamp_Location_Type__c;
                } else if (input.fieldName == "Existing_LA_Stamped_For__c") {
                    input.value = this.agreementData.Existing_LA_Stamped_For__c;
                } else if (input.fieldName == "Existing_LA_Stamped_Towards__c") {
                    input.value = this.agreementData.Existing_LA_Stamped_Towards__c;
                } else if (input.fieldName == "Existing_LA_Stamp_Type__c") {
                    input.value = this.agreementData.Existing_LA_Stamp_Type__c;
                } else if (input.fieldName == "Existing_LA_Stamp_Value__c") {
                    input.value = this.agreementData.Existing_LA_Stamp_Value__c;
                } else if (input.fieldName == "Add_POA_SD_Initiation_method__c") {
                    input.value = this.agreementData.Add_POA_SD_Initiation_method__c;
                } else if (input.fieldName == "Add_POA_SD_Agreement_signed_for_borrower__c") {
                    input.value = this.agreementData.Add_POA_SD_Agreement_signed_for_borrower__c;
                } else if (input.fieldName == "Add_POA_SD_Agreement_signed_for_co_borro__c") {
                    input.value = this.agreementData.Add_POA_SD_Agreement_signed_for_co_borro__c;
                } else if (input.fieldName == "Add_POA_SD_Loan_agreement_accepted_by_CV__c") {
                    input.value = this.agreementData.Add_POA_SD_Loan_agreement_accepted_by_CV__c;
                } else if (input.fieldName == "Add_POA_SD_Remarks__c") {
                    input.value = this.agreementData.Add_POA_SD_Remarks__c;
                }  
            });
        
           

    }
    connectedCallback() {
        console.log("Connetedcall----" + this.oppId);
        console.log("Connetedcall- 1---" + this.neslMaxRetryCount);
        this.showSpinner = true;
        this.readonly = true;
        if(this.readonly){
            this.disableDealDateBasedOn = true;
            this.emiDisabled = true;
            this.isEAgreementType = true;
            this.disableinitiateMethod = true;
            this.disableInitiateAgreement = true;
            this.disableInitiateCoBorrowerAgreement = true;
            this.disableCheckstatus = true;
            this.disableSubmit = true;
        }

        fetchRecord({
            oppId: this.oppId,
        })
        .then((response) => {
            this.showSpinner = false;
            console.debug("response :",response);
            //this.invoiceDate = response;
            this.agreementData = response;
            console.debug("agreementdata booklet num",this.agreementData);
        })
        .catch((error) => {
            console.log("error:", error);
            this.showToast("Error!", error?error.body?error.body.message:'':'', "error", "sticky");
        });


        getTaxInvoiceDate({
                loanAppId: this.oppId,
            })
            .then((response) => {
                this.showSpinner = false;
                console.debug(response);
                this.invoiceDate = response;

            })
            .catch((error) => {
                console.log("error:", error);
                this.showToast("Error!", error?error.body?error.body.message:'':'', "error", "sticky");            });
        getLoanAgreement({
                oppId: this.oppId,
            })
            .then((response) => {
                this.showSpinner = false;
                if (response == null) {
                    this.isLoanAgreementAvailable = false;
                    this.showToast("Error!", "No Record Found", "error", "sticky");
                    return;
                }
                console.log("response:", response);
                this.loanAgreementId = response.Id;
                this.agentBLCode = response.Loan_Application__r.Agent_BL_code__c;
                this.sanctionDate = response.Loan_Application__r.Sanction_Date__c;
                this.productType = response.Loan_Application__r.Product_Type__c;
                this.isEAgreementType = response ? response.Agreement_Type__c ?
                    response.Agreement_Type__c.toLowerCase() == "e-agreement" ?
                    true :
                    false :
                    false :
                    false;
                console.log("this.agentBLCode:", this.agentBLCode);

                getGeoGraphicalState({
                        agentBLCode: this.agentBLCode,
                    })
                    .then((response) => {
                        this.showSpinner = false;
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
                        this.showToast("Error!", error?error.body?error.body.message:'':'', "error", "sticky");                    });
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
                            if (this.productType.includes("Two Wheeler")) {
                                if (parseInt(x1stEMIDate.getDate()) < 21) {
                                    day = 6;
                                } else {
                                    day = 20;
                                }
                            } else if (this.productType.includes("Passenger Vehicles")) {
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
                        console.log("error:", error);
                        this.showToast("Error!", error?error.body?error.body.message:'':'', "error", "sticky");                    });
            })
            .catch((error) => {
                console.log("error:", error);
                this.showToast("Error!", error?error.body?error.body.message:'':'', "error", "sticky");            });

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

    @wire(getLoanEAgreementDetails, { loanAppId: "$oppId" }) //'$recordId'
    getLoanEAgreement(value) {
        this.loanAgreementData = value;
        const { data, error } = value;
        if (data) {
            console.log("data-----" + JSON.stringify(data));
            this.borrowerRetryCount =
                data.BorrowerNesLCallCount__c == undefined ?
                0 :
                data.BorrowerNesLCallCount__c;
            this.coborrowerRetryCount =
                data.CoBorrowerNeslCallCount__c == undefined ?
                0 :
                data.CoBorrowerNeslCallCount__c;
            if (data.Agreement_Type__c == "Physical agreement") {
                this.disableInitiateAgreement = true;
                this.disableInitiateCoBorrowerAgreement = true;
                this.disableinitiateMethod = true;
            } else if (data.Agreement_Type__c == "e-agreement") {
                this.disableInitiateAgreement = false;
                //this.disableInitiateCoBorrowerAgreement = true;
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
        console.log("initateMethodVal=====" + initateMethodVal);
        this.initateMethodValue = initateMethodVal;
        if (initateMethodVal == "Self") {
            this.disableInitiateAgreement = false;
            this.disableInitiateCoBorrowerAgreement = true;
        }
    }

    handleInitiateAgreementClick(event) {
        console.log("Inside handleInitiateAgreementClick");
        console.log(
            "neslMaxRetryCount---" +
            this.neslMaxRetryCount +
            "----this.borrowerRetryCount--" +
            this.borrowerRetryCount +
            "---this.isSubmittedcheck---" +
            this.isSubmittedcheck
        );
        if (
            this.neslMaxRetryCount == this.borrowerRetryCount &&
            !this.isSubmittedcheck
        ) {
            this.disableInitiateAgreement = true;
            this.disableInitiateCoBorrowerAgreement = true;
            const fields = {};

            fields[ID_FIELD.fieldApiName] = this.loanAgreementId;
            fields[AgreementType_FIELD.fieldApiName] = "Physical agreement";
            const recordInput = {
                fields: fields,
            };
            updateRecord(recordInput)
                .then(() => {
                    console.log("inside borrower maxtry update");
                    refreshApex(this.loanAgreementData);
                })
                .catch((error) => {
                    console.log(
                        "record update fail in borrower maxtry catch",
                        JSON.stringify(fields)
                    );
                    console.log("record update Fields: ", fields);
                    console.log("record update error", error);
                });
        } else {
            if (this.initateMethodValue != "Self") {
                doRegistrationJourneyCallout({
                        applicantId: this.borrowerId,
                        loanAppId: this.oppId,
                    })
                    .then((result) => {
                        const response = JSON.parse(result);

                        console.log(
                            "Borrower Agreement Initiate Response ->",
                            JSON.stringify(response)
                        );
                        this.disableCheckstatus = false;
                        this.showToast(
                            "Success!",
                            "Borrower E-Agreement Response Received Successfully",
                            "errSuccessor",
                            "sticky"
                        );
                    })
                    .catch((error) => {
                        console.log("Borrower Agreement initate Error->", error);
                    });
            }
            const fields = {};

            fields[ID_FIELD.fieldApiName] = this.loanAgreementId;
            fields[BorrowerCount_FIELD.fieldApiName] = this.borrowerRetryCount + 1;
            const recordInput = {
                fields: fields,
            };
            console.log("recordInput-----" + JSON.stringify(recordInput));
            updateRecord(recordInput)
                .then(() => {
                    console.log("inside borrower update");
                    refreshApex(this.loanAgreementData);
                })
                .catch((error) => {
                    console.log(
                        "record update fail in borrower catch",
                        JSON.stringify(fields)
                    );
                    console.log("record update Fields: ", fields);
                    console.log("record update error", error);
                });
        }
        if (this.initateMethodValue == "Self") {
            const event = new ShowToastEvent({
                title: "Thank You",
                message: "Thank You",
                variant: "success",
                mode: "dismissable",
            });
            this.dispatchEvent(event);
        } else {
            this.disableInitiateCoBorrowerAgreement = false;
        }
    }

    handleInitiateCoBorrowerAgreementClick(event) {
        console.log("Inside handleInitiateCoBorrowerAgreementClick");
        if (
            this.neslMaxRetryCount == this.coborrowerRetryCount &&
            !this.isSubmittedcheck
        ) {
            //this.disableInitiateAgreement = false;
            this.disableInitiateCoBorrowerAgreement = false;
            const fields = {};

            fields[ID_FIELD.fieldApiName] = this.loanAgreementId;
            fields[AgreementType_FIELD.fieldApiName] = "Physical agreement";
            const recordInput = {
                fields: fields,
            };
            updateRecord(recordInput)
                .then(() => {
                    console.log("inside coborrower maxtry update");
                    refreshApex(this.loanAgreementData);
                })
                .catch((error) => {
                    console.log(
                        "record update fail in coborrower maxtry catch",
                        JSON.stringify(fields)
                    );
                    console.log("record update Fields: ", fields);
                    console.log("record update error", error);
                });
        } else {
            if (this.initateMethodValue != "Self") {
                doRegistrationJourneyCallout({
                        applicantId: this.coborrowerId,
                        loanAppId: this.oppId,
                    })
                    .then((result) => {
                        const response = JSON.parse(result);

                        console.log(
                            "Co-Borrower Agreement Initiate Response ->",
                            JSON.stringify(response)
                        );

                        this.showToast(
                            "Success!",
                            "Co-Borrower E-Agreement Response Received Successfully",
                            "errSuccessor",
                            "sticky"
                        );
                    })
                    .catch((error) => {
                        console.log("Co-Borrower Agreement initate Error->", error);
                    });
            }
            const fields = {};

            fields[ID_FIELD.fieldApiName] = this.loanAgreementId;
            fields[CoborrowerCount_FIELD.fieldApiName] =
                this.coborrowerRetryCount + 1;
            const recordInput = {
                fields: fields,
            };
            updateRecord(recordInput)
                .then(() => {
                    console.log("inside coborrower update");
                    refreshApex(this.loanAgreementData);
                })
                .catch((error) => {
                    console.log(
                        "record update fail in coborrower catch",
                        JSON.stringify(fields)
                    );
                    console.log("record update Fields: ", fields);
                    console.log("record update error", error);
                });
        }
    }

    handleCheckStatusClick(event) {
        doRegistrationJourneyCallout({
                applicantId: this.borrowerId,
                loanAppId: this.oppId,
            })
            .then((result) => {
                const response = JSON.parse(result);

                console.log("Check Status Response ->", JSON.stringify(response));

                //this.showToast('Success!', 'Co-Borrower E-Agreement Response Received Successfully','errSuccessor','sticky');
            })
            .catch((error) => {
                console.log("Check Status Error->", error);
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
                                "State is not eligible for E-Agreement process. Please change the Agreement Booklet Number to Physical Loan Agreement Booklet No.",
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
                                "Application is eligible for e-agreement",
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
                                "Customer cannot continue with E-Agreement, please change the Agreement Booklet Number to Physical Loan Agreement Booklet No.",
                                "error"
                            );
                        }
                    }
                    console.log("This ", JSON.stringify(allTrue));
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
                    this.showAddlSDLA = true;
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
        console.log("section --- ", section);
    }

    showConfirmationBox() {
        this.showModal = true;
    }

    hideModal() {
        this.showModal = false;
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
                effectiveDealDate = this.sanctionDate;
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
        console.log("Bookelt Details : ", JSON.stringify(bookletdetails));
        if (havingNullValue) {
            this.showToast(
                "Error!",
                "Cannot proceed further as some values are missing.",
                "error",
                "sticky"
            );
            return;
        }
        this.showFetchBookletSpinner = true;

        doAgreementBookletCallout({
                agreementBookletNo: bookletdetails.Agreement_Booklet_Num__c,
                applicantId: this.borrowerId,
                loanAppId: this.oppId,
            })
            .then((result) => {
                let response = JSON.parse(result);
                if (response) {
                    this.fetchAgreementBookletDetail(
                        JSON.stringify(response),
                        this.loanAgreementId,
                        this.oppId
                    );

                    console.log("Borrower Agreement Initiate Response ->", response);
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
                    //this.showFetchBookletSpinner = false;
                    this.showToast(
                        "Success!",
                        "Borrower Agreement Booklet Received Successfully",
                        "success",
                        "dismissable"
                    );
                }
            })
            .catch((error) => {
                console.log('error:', error);
                this.showToast("Error!", error?error.body?error.body.message:'':'', "error", "sticky");                this.showFetchBookletSpinner = false;
            });
    }

    fetchAgreementBookletDetail(response, loanAgreementId, oppId) {

        getAgreementBookletDetails({
                responseStr: response,
                loanAgrementId: loanAgreementId,
                loanAppId: this.oppId,
            })
            .then((response) => {
                this.showFetchBookletSpinner = false;
                console.log("response:", response);
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
                console.log('error:', error);
                this.showToast("Error!", error.message, "error", "sticky");
                this.showFetchBookletSpinner = false;
            });
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

    createRow(listOfStamps) {
        let accountObject = {};

        if(listOfStamps.length > 0) {
            accountObject.index = listOfStamps[listOfStamps.length - 1].index + 1;
        } else {
            accountObject.index = 1;
        }
        accountObject.Stamp_number = null;
        accountObject.Stamp_on = null;
        accountObject.Stamp_location_type = null;
        accountObject.Stamp_for = null;
        accountObject.Stamp_type = null;
        accountObject.Stamp_value = null;
        listOfStamps.push(accountObject);
        console.log(listOfStamps);
    }

    addNewRow() {
        this.createRow(this.listOfStamps);
    }

    calculateValue(){
        this.totalAmount = 0;
        for(let acc of this.listOfStamps){
            this.totalAmount += acc.Amount;
        }
        console.debug(this.totalAmount);
    }

    handleInputChange(event) {
        console.debug(this.listOfStamps);
        for(let acc of this.listOfStamps){
            if(acc.index==event.target.dataset.id){
                if(event.target.name.includes('Stamp_number')){
                    acc.Stamp_number = event.target.value 
                }else if(event.target.name.includes('Stamp_on')){
                    acc.Stamp_on = event.target.value 
                }else if(event.target.name.includes('Stamp_location_type')){
                    acc.Stamp_location_type = event.target.value 
                }else if(event.target.name.includes('Stamp_for')){
                    acc.Stamp_for = event.target.value 
                }else if(event.target.name.includes('Stamp_type')){
                    acc.Stamp_type = event.target.value 
                }else if(event.target.name.includes('Stamp_value')){
                    acc.Stamp_value = parseInt(event.target.value)
                    this.calculateValue(); 
                }
            }
        }
        console.debug(this.listOfStamps);
    }
}