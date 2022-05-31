public class FetchRecord {
    @AuraEnabled(cacheable=true)
    public static Loan_Agreement__c fetchRecord(String oppId) {
        Loan_Agreement__c la = new Loan_Agreement__c();
        la = [SELECT Id, X2nd_EMI_Due_Date__c, ASD_POA_Additional_LA_stamping_amount_re__c, ASD_POA_Additional_POA_stamping_amount_r__c, Agreement_Booklet_Num__c, Agreement_Date__c, AgreementDate__c , 
        Add_POA_SD_Agreement_signed_for_borrower__c, Add_POA_SD_Agreement_signed_for_co_borro__c, Agreement_Type__c, BorrowerNesLCallCount__c, CoBorrowerNeslCallCount__c, Deal_Date_Based_On__c, E_Agreement_Supported_In_State__c, 
        Due_Date_Pattern__c, e_agreement_Agreement_Signed_For_Borrowe__c, e_agreement_Agreement_Signed_For_Co_Borr__c, E_Agreement_Stamp_Location_Type__c, E_Agreement_Stamp_On__c, E_Agreement_Stamp_Type__c, E_Agreement_Stamp_Value__c, E_Agreement_Stamped_For__c, 
        E_Agreement_Stamped_Towards__c, e_agreement_Total_stamping_done__c, Effective_Deal_Date__c, Finance_Amount__c, Geographical_State__c, Add_POA_SD_Initiation_method__c, Invoice_Date__c, Is_1st_EMI_due_date_correctly_captured__c, Is_Physical_Agreement_Eligible__c,
        Is_application_eligible_for_e_agreement__c, Borrower_Has_Aadharcard__c, Borrower_Aadhar_Mobile_In_Use__c, Borrower_Aadhar_Linked_To_Mobile__c, CoBorrower_Has_Aadharcard__c, CoBorrower_Aadhar_Mobile_In_Use__c, CoBorrower_Aadhar_Linked_To_Mobile__c, Is_Additional_Loan_Agreement_Stamp_Duty__c,
        ASD_LA_any_additional_POA_stamp_duty__c, Ist_EMI_Due_Date__c, ASD_POA_LA_stamping_requirement_met__c, LastModifiedById, Loan_Agreement_Accepted_by_CVO__c, Add_POA_SD_Loan_agreement_accepted_by_CV__c, Loan_agreement_details_Correctly_Capture__c, Name, Loan_Agreement_Stamping_Met__c, Loan_Application__c,
        ASD_POA_Physical_agreement_to_be_signed__c, POA_Stamping_Met__c, ASD_POA_stamping_requirement_met__c, Physical_Agreement_Remarks__c, Remarks__c, Add_POA_SD_Remarks__c, Require_Addl_Loan_Agreement_Stamp_Amount__c, Require_Physical_Agreement_Sign__c, Required_Loan_Agreement_Stamping_Charges__c, ASD_POA_Required_POA_Stamping_Charges__c,
        ScannedBookLet__c, Existing_POA_Stamp_Location_Type__c, Existing_LA_Stamp_Location_Type__c, Addl_Loan_Agreement_Stamp_Location_Type__c, Addl_POA_Stamp_Location_Type__c, ASD_LA_Stamp_Location_Type__c, ASD_POA_Stamp_Location_Type__c, Existing_POA_Stamp_On__c, Existing_LA_Stamp_On__c,
        Addl_Loan_Agreement_Stamp_On__c, Addl_POA_Stamp_On__c, ASD_LA_Stamp_On__c, ASD_POA_Stamp_On__c, Existing_LA_Stamp_S_No__c, Existing_POA_Stamp_S_No__c, Addl_Loan_Agreement_Stamp_S_No__c, Addl_POA_Stamp_S_No__c, Addl_Loan_Agreement_Stamped_Towards__c, Addl_POA_Stamp_Towards__c, ASD_LA_Stamp_Towards__c, ASD_POA_Stamp_Towards__c, Existing_LA_Stamp_Type__c, 
        Existing_POA_Stamp_Type__c, Addl_Loan_Agreement_Stamp_Type__c, Addl_POA_Stamp_Type__c, ASD_LA_Stamp_Type__c, ASD_POA_Stamp_Type__c, Existing_LA_Stamp_Value__c, Existing_POA_Stamp_Value__c, Addl_Loan_Agreement_Stamp_Value__c, Addl_POA_Stamp_Value__c, ASD_LA_Stamp_Value_Rs__c, ASD_POA_Stamp_Value_Rs__c, Existing_LA_Stamped_For__c, Existing_POA_Stamped_For__c, 
        Addl_Loan_Agreement_Stamped_For__c, Addl_POA_Stamped_For__c, ASD_LA_Stamped_For__c, ASD_POA_Stamped_For__c, Existing_POA_Stamped_Towards__c, Addl_POA_SD_Stamping_Charges_Collected__c, Stamping_Charges_Required_On_EAgreement__c, Tentative_Payment_Date__c, ASD_POA_Total_LA_stamping_done_on_the_ag__c, Total_Loan_Agreement_Stamping__c,
        ASD_POA_Total_POA_stamping_done_on_th__c, Total_POA_Stamping__c, Total_Value_to_be_Stamped__c, (SELECT Id, Loan_Agreement__c, Name, Stamp_Date__c, Stamp_For__c, Stamp_Location_Type__c, Stamp_S_No__c, Stamp_Towards__c, Stamp_Type__c, 
        Stamp_Value__c, Type__c FROM Stamp_Details__r WHERE Stamp_Towards__c='AGREEMENT') FROM Loan_Agreement__c WHERE Loan_Application__c := oppId LIMIT 1];

        return la;
    }
}
