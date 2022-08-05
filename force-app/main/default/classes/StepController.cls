public with sharing class StepController {
    @AuraEnabled(cacheable=true)
    public static List<Step__c> getSteps(){
        return [SELECT Element_Type__c, Name, Title__c, Index__c
                FROM Step__c];
    }
}
