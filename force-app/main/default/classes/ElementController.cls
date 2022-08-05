public with sharing class ElementController {
    @AuraEnabled(cacheable=true)
    public static List<Element__c> getElements(String strId) {
        try {
            Id key = strId;
            return [SELECT Name, Title__c, Element_Type__c, Value__c, Index__c
                    FROM Element__c
                    WHERE Step__r.Id = :key];
        }
        catch(Exception ex) {
            throw new AuraHandledException(ex.getMessage());
        }
    }
}
