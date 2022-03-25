public  class AccountController {
    @AuraEnabled(cacheable=true)
    public static List<Account> getAccounts(){
        List<Account> acc=[SELECT id,name,type,phone,industry FROM Account limit 4];
        return acc;
    } 
}
