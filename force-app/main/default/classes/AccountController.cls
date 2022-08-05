public with sharing class AccountController {
    @AuraEnabled(cacheable=true)
    public static string getAccountList(List<String> fieldsArray, String sortQuery, String sortOrder){
        try {
            return null;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
