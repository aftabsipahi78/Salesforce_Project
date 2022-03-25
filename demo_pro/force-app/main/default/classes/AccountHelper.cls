public class AccountHelper {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccountList() {
        return [SELECT Id, Name, Type, Rating, Phone FROM Account];
    }
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactList(String AccID) {
        return [SELECT Id, Name FROM Contact];
    }
}
