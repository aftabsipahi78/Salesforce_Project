public without sharing class AccountHelper{
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountList(string searchKey) {
        string searchKeyword = '%' + searchKey + '%';
        List<Account> acc=new List<Account>();
        acc= [SELECT Id, Name, Type, OwnerId,Phone FROM Account WHERE Name LIKE = searchKeyword limit 16];
        return acc;
    }

  
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactList(String accid, String searchcontact){
        string searchKeyword = '%' + searchcontact + '%';
        return [SELECT Name,Phone,Email FROM Contact WHERE AccountId =:accid AND Name LIKE : searchKeyword ];
        
    }
}
