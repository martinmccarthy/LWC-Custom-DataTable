public with sharing class ConditionController {
    @AuraEnabled(cacheable=true)
    public static List<Condition__c> getConditionsStep(String strId){
        try {
            Id key = strId;
            
            return [SELECT Value__c, Label__c
                    FROM Condition__c
                    WHERE Step__r.Id = :key];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled(cacheable=true)
    public static List<Condition__c> getConditionsElement(String strId){
        try {
            Id key = strId;
            return [SELECT Value__c, Label__c
                    FROM Condition__c
                    WHERE Element__r.Id = :key];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
