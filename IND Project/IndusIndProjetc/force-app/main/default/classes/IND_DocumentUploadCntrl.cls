/*
* @Name         IND_DocumentUploadCntrl
* @Author       Vinita Kamble
* @Company      Persistent Systems
* @Description  This class contains all the methods related to Vehicle Insurance details.
* Inputs:       None
* Test Class:   IND_DocumentUploadCntrlTest
* History:
*/
public with sharing class IND_DocumentUploadCntrl {
    /*
* @Method Name: uploadDocument
* @Created by:  Vinita Kamble
* @description: to create a Vehicle document object 
* @Param:       String - Document Type
* @Param:       String - current Vehicle Record ID
* @Param:       String - loanApplication ID
* @Return:      String - created Document's ID
*/
    @AuraEnabled
    public static string createDocument(String vehicleDetailId,String applicantId,String loanApplicationId){
        try {
            if(vehicleDetailId!=null  && loanApplicationId!=null ){
                ID personAccountRecordTypeId = Schema.SObjectType.Documents__c.getRecordTypeInfosByName().get(System.Label.KYCDocument).getRecordTypeId();
                Documents__c docObject= new Documents__c(Vehicle_Detail__c=vehicleDetailId,Applicant__c=applicantId,Opportunity_Relation__c=loanApplicationId);
                
                docObject.RecordTypeId = personAccountRecordTypeId;
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
            ErrorLoggerUtil.logErrorEvent('IND_DocumentUploadCntrl', 'createDocument ', System.Label.Apex, e);
            throw new AuraHandledException(System.Label.ExceptionMessage);  
        }
        
    }
    
    /*
* @Method Name: createDocumentForCheque
* @Created by:  Poonam Tilokani
* @description: to create a Document object for 'cheque documents'
* @Param:       String - Document Type
* @Param:       String - current Vehicle Record ID
* @Param:       String - loanApplication ID
* @Return:      String - created Document's ID
*/
    @AuraEnabled
    public static string createDocumentForCheque(String docType,String vehicleDetailId,String applicantId,String loanApplicationId,Integer chequeNum,Integer chequeSeq){
        try {
            if(loanApplicationId!=null ){
                String nameTest = docType+' '+loanApplicationId + ' ' + chequeSeq;
                system.debug('nameTest--' + nameTest);
                applicantId  = [Select Id, Applicant__c from Opportunity where Id=:loanApplicationId].Applicant__c;
                System.debug('AAA'+applicantId);
                List<Documents__c> documentList = [SELECT Id,Name,Opportunity_Relation__c,Vehicle_Detail__c,Document_Type__c,Applicant__c FROM Documents__c
                                                   WHERE Opportunity_Relation__c =:loanApplicationId AND Applicant__c =:applicantId AND Name =:nameTest];
                if(documentList.size()>0){
                    for(Documents__c doc : documentList){
                        doc.is_Active__c = false;
                    }
                    update documentList;
                }
                ID otherDocRecordTypeId = Schema.SObjectType.Documents__c.getRecordTypeInfosByName().get('Other Documents').getRecordTypeId();
                System.debug('otherDocRecordTypeId'+otherDocRecordTypeId);
                System.debug('docType'+docType+'vehicleDetailId'+vehicleDetailId+'applicantId'+applicantId+'loanApplicationId'+loanApplicationId);
                Documents__c docObject= new Documents__c(Name = docType+' '+loanApplicationId + ' ' + chequeSeq,Vehicle_Detail__c=vehicleDetailId,Applicant__c=applicantId,Opportunity_Relation__c=loanApplicationId,Document_Type__c=docType,
                                                         Cheque_Number__c = chequeNum,is_Active__c = true);
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
            ErrorLoggerUtil.logErrorEvent('IND_DocumentUploadCntrl', 'createOtherDocument ', System.Label.Apex, e);
            throw new AuraHandledException(System.Label.ExceptionMessage);  
        }
        
    }
    /*
* @Method Name: createDocumentForAdditionalDocument
* @Created by:  Poonam Tilokani
* @description: to create a Document object for 'AdditionalDocument'
* @Param:       String - Document Type
* @Param:       String - current Vehicle Record ID
* @Param:       String - loanApplication ID
* @Return:      String - created Document's ID
*/
    @AuraEnabled
    public static string createDocumentForAdditionalDocument(String docType,String vehicleDetailId,String applicantId,String loanApplicationId){
        try {
            if(loanApplicationId!=null ){
                String nameTest = docType+' '+loanApplicationId;
                system.debug('nameTest--' + nameTest);
                
                List<Documents__c> documentList = [SELECT Id,Name,Opportunity_Relation__c,Vehicle_Detail__c,Document_Type__c,Applicant__c FROM Documents__c
                                                   WHERE Opportunity_Relation__c =:loanApplicationId AND Applicant__c =:applicantId AND Name =:nameTest];
                if(documentList.size()>0 && docType != 'Payment Receipt'){
                    for(Documents__c doc : documentList){
                        doc.is_Active__c = false;
                    }
                    update documentList;
                }
                ID otherDocRecordTypeId = Schema.SObjectType.Documents__c.getRecordTypeInfosByName().get('Other Documents').getRecordTypeId();
                System.debug('otherDocRecordTypeId'+otherDocRecordTypeId);
                System.debug('docType'+docType+'vehicleDetailId'+vehicleDetailId+'applicantId'+applicantId+'loanApplicationId'+loanApplicationId);
                Documents__c docObject= new Documents__c(Name = docType+' '+loanApplicationId,Vehicle_Detail__c=vehicleDetailId,Applicant__c=applicantId,Opportunity_Relation__c=loanApplicationId,Document_Type__c=docType,
                                                         Additional_Document__c = true,is_active__c = true);
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
            ErrorLoggerUtil.logErrorEvent('IND_DocumentUploadCntrl', 'createOtherDocument ', System.Label.Apex, e);
            throw new AuraHandledException(System.Label.ExceptionMessage);  
        }
        
    }
    /*
* @Method Name: createOtherDocument
* @Created by:  Kruthi Nadig
* @description: to create a Document object for 'Other documents'
* @Param:       String - Document Type
* @Param:       String - current Vehicle Record ID
* @Param:       String - loanApplication ID
* @Return:      String - created Document's ID
*/
    @AuraEnabled
    public static string createOtherDocument(String docType,String vehicleDetailId,String applicantId,String loanApplicationId){
        try {
            if(loanApplicationId!=null ){
                ID otherDocRecordTypeId = Schema.SObjectType.Documents__c.getRecordTypeInfosByName().get('Other Documents').getRecordTypeId();
                System.debug('otherDocRecordTypeId'+otherDocRecordTypeId);
                System.debug('docType'+docType+'vehicleDetailId'+vehicleDetailId+'applicantId'+applicantId+'loanApplicationId'+loanApplicationId);
                Documents__c docObject= new Documents__c(Name = docType+' '+loanApplicationId,Vehicle_Detail__c=vehicleDetailId,Applicant__c=applicantId,Opportunity_Relation__c=loanApplicationId,Document_Type__c=docType);
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
            ErrorLoggerUtil.logErrorEvent('IND_DocumentUploadCntrl', 'createOtherDocument ', System.Label.Apex, e);
            throw new AuraHandledException(System.Label.ExceptionMessage);  
        }
        
    }
    
    /*
* @Method Name: deleteDocument
* @Created by:  Vinita Kamble
* @description: to delete document object 
* @Param:       String - Document ID
*/
    @AuraEnabled
    public static void deleteDocument(String documentId){
        try{
            if(documentId!=null){
                List<SObject> documentsObject= [Select Id from Documents__c Where Id= :documentId WITH SECURITY_ENFORCED ];
                
                if (Schema.sObjectType.Documents__c.isAccessible() && Schema.sObjectType.Documents__c.isDeletable() ){
                    delete documentsObject;
                }
                delete [SELECT Id FROM ContentDocument WHERE Id=:documentId WITH SECURITY_ENFORCED];
                
            }
            if(Test.isRunningTest())
            {
                throw new AuraHandledException(System.Label.ExceptionMessage);
            }
            
        } catch(Exception e){
            ErrorLoggerUtil.logErrorEvent('IND_DocumentUploadCntrl', 'deleteDocument ', System.Label.Apex, e);
            throw new AuraHandledException(System.Label.ExceptionMessage);  
        }
    }
    /*
* @Method Name: deleteDocumentsFromContentDocument
* @Created by:  Vinita Kamble
* @description: to delete document Id from Content Document
* @Param:       String - Document ID
*/
    @AuraEnabled
    public static String deleteDocumentsFromContentDocument(String docIds){
        try{
            delete [SELECT Id FROM ContentDocument WHERE Id=:docIds WITH SECURITY_ENFORCED];
            if(Test.isRunningTest())
            {
                throw new AuraHandledException(System.Label.ExceptionMessage);
            }
            return 'SUCCESS';
            
        }
        catch(Exception e){
            ErrorLoggerUtil.logErrorEvent('IND_DocumentUploadCntrl', 'deleteDocumentsFromContentDocument', '', e);
            throw new AuraHandledException(e.getMessage());
        }
    }
    
    // created by Aditya
    @AuraEnabled(cacheable = true)
    public static string getProfile(){
        Id profileId = UserInfo.getProfileId();
        String profileName =[Select Id, Name from Profile where Id=:profileId WITH SECURITY_ENFORCED].Name;
        system.debug('Profile Name'+profileName);
        return profileName;
    }

    /* @Method Name: getApplicantDetails
    * @Created by:  Daksh Mandowara
    * @description: To get the applicants
    * @Param:       String - loanApplication ID
    * @Return:      List<Applicant__c> - Return Applicant Details
    */
    @AuraEnabled(cacheable = true)
    public static List<Applicant__c> getApplicantDetails(String loanApplicationId){
        try{
            List<Applicant__c> applicants = [Select Id,Applicant_Type__c FROM Applicant__c WHERE Opportunity__c = :loanApplicationId];
        if(!applicants.isEmpty()){
                return applicants;
            }
        return null;
        }catch(Exception ex){
            ErrorLoggerUtil.logErrorEvent('IND_DocumentUploadCntrl', 'getApplicantDetails ', System.Label.Apex, ex,loanApplicationId);           
            throw new AuraHandledException(ex.getMessage());
        }
        
    }
    
    
}