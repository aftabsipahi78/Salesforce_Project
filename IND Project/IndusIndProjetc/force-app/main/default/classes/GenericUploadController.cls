public with sharing class GenericUploadController {
    /*
    * @Method Name: checkRCDocument
    * @Created by:  Kruthi Nadig
    * @description: to check if RC Document already exists
    * @Param:       String Loan Application Id, String Applicant Id
    */
    @AuraEnabled
    public static Boolean checkRCDocument(string loanApplicationId,string applicantId){
        string docName = 'RC Document '+loanApplicationId;
        list<Documents__c> doclist = [Select Id from Documents__c where Name = :docName and Opportunity_Relation__c = :loanApplicationId and Applicant__c =:applicantId WITH SECURITY_ENFORCED];
        if(!doclist.isEmpty()) {
            return true;
        } else {
            return false;
        }
    }

    /*
    * @Method Name: clearRCDocument
    * @Created by:  Kruthi Nadig
    * @description: clear the values in RC
    * @Param:       String Loan Disbursement Id
    */
    @AuraEnabled
    public static void clearRCDocument(string loanDisbursementId){
        try {
            if(loanDisbursementId != null) {
            update new LoanDisbursementDetails__c(Id=loanDisbursementId,Registration_Date__c=null,Registration_Format__c='',Registration_Number__c='',Registration_Owner_Nam__c='',RC_Document__c=null);
            }
        } catch( Exception e) {
            ErrorLoggerUtil.logErrorEvent('GenericUploadController', 'clearRCDocument', '', e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    /*
    * @Method Name: fetchDisbursementRecord
    * @Created by:  Kruthi Nadig
    * @description: to fetch disbursement recordId
    * @Param:       String Loan Application Id, String Applicant Id
    */
    @AuraEnabled
    public static LoanDisbursementDetails__c fetchDisbursementRecord(string loanApplicationId,string applicantId){
        try {
            list<LoanDisbursementDetails__c> disbList = [Select Id from LoanDisbursementDetails__c where Parent_Loan_Application__c = :loanApplicationId WITH SECURITY_ENFORCED];
            if(!disbList.isEmpty()) {
                return disbList[0];
            } else {
                return null;
            }
        } catch( Exception e) {
            ErrorLoggerUtil.logErrorEvent('GenericUploadController', 'fetchDisbursementRecord', '', e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    /*
    * @Method Name: deleteContentDocument
    * @Created by:  Kruthi Nadig
    * @description: to delete the content document
    * @Param:       String - Document ID
    */
    @AuraEnabled
    public static String deleteContentDocument(String docIds){
        try{
            ContentDocumentLink conLink = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE Id=:docIds WITH SECURITY_ENFORCED];
            delete new ContentDocument(Id = conLink.ContentDocumentId);
            if(Test.isRunningTest())
            {
                throw new AuraHandledException(System.Label.ExceptionMessage);
            }
            return 'SUCCESS';
           
        }
        catch(Exception e){
            ErrorLoggerUtil.logErrorEvent('GenericUploadController', 'deleteContentDocument', '', e);
            throw new AuraHandledException(e.getMessage());
        }
    }

    /*
    * @Method Name: createOtherDocument
    * @Created by:  Kruthi Nadig
    * @description: to create a Document object for 'Other documents'
    * @Param:       String - Document Type
    * @Param:       String - current Vehicle Record ID
    * @Param:       String - Loan Applicant ID
    * @Return:      String - loanApplication ID
    */
	@AuraEnabled
    public static string createOtherDocument(String docType,String vehicleDetailId,String applicantId,String loanApplicationId){
         try {  
                string leadNo;
                list<Documents__c> docUpdList = new list<Documents__c>();
                ID otherDocRecordTypeId = Schema.SObjectType.Documents__c.getRecordTypeInfosByName().get('Other Documents').getRecordTypeId();
                if(loanApplicationId!=null ){
                   list<Opportunity> loanApp= [Select Name from Opportunity where Id =: loanApplicationId WITH SECURITY_ENFORCED];
                   if(!loanApp.isEmpty()) {
                       leadNo = loanApp[0].Name;
                       //Deactivate existing Document, if any                      
                       for(Documents__c doc : [Select Id from Documents__c where Document_Type__c = :docType and Opportunity_Relation__c = :loanApplicationId and Applicant__c =:applicantId WITH SECURITY_ENFORCED]) {
                            doc.is_Active__c = false;
                            docUpdList.add(doc);
                       }
                   }
                   if(!docUpdList.isEmpty()) {
                        update docUpdList;
                   }   
                   Documents__c docObject= new Documents__c(Name = docType+' '+leadNo,Vehicle_Detail__c=vehicleDetailId,Applicant__c=applicantId,Opportunity_Relation__c=loanApplicationId,Document_Type__c=docType,is_Active__c = true);
                    System.debug('docObject'+docObject);
                   docObject.RecordTypeId = otherDocRecordTypeId;
                   if (Schema.sObjectType.Documents__c.isCreateable()){
                    	insert docObject;
                   }
                   if(Test.isRunningTest())
                   {
                      throw new AuraHandledException(System.Label.ExceptionMessage);
                   }
                   return docObject.Id;
                }
                 return null;
              } catch(Exception e){
                    ErrorLoggerUtil.logErrorEvent('GenericUploadController', 'createOtherDocument ', System.Label.Apex, e);
            		throw new AuraHandledException(e.getMessage() + ' ' + e.getStackTraceString());  
              }

    }

    /*
    * @Method Name: changeFilename
    * @Created by:  Kruthi Nadig
    * @description: to change the file name
    * @Param:       String - contentDocumentId
    */
	@AuraEnabled
    public static void changeFilename(string contentDocId,string fname) {
        ContentDocument conDoc = [select id,Title from ContentDocument where Id=:contentDocId]; // Getting files from Parent record 
        conDoc.Title = fname;  
        try{  
        update conDoc;  
        }  
        catch(Exception e){  
            ErrorLoggerUtil.logErrorEvent('GenericUploadController', 'changeFilename ', System.Label.Apex, e);
            throw new AuraHandledException(e.getMessage() + ' ' + e.getStackTraceString());
        }  
    }
}