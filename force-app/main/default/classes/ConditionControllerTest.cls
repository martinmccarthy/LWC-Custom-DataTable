@isTest
public class ConditionControllerTest {
    @TestSetup
    static void makeData(){
        Step__c s = new Step__c(Title__c='StepForConditionTest');
        insert s;
        Element__c e = new Element__c(Step__c=s.Id, Title__c='ElementForConditionTest', Element_Type__c='TestElement');
        insert e;
        Condition__c c_step = new Condition__c(Step__c=s.Id, Value__c='TestCondition');
        insert c_step;
        Condition__c c_element = new Condition__c(Element__c=e.Id, Value__c='TestCondition');
        insert c_element;
    }

    @isTest static void getConditionsWithStep() {
        Test.startTest();
        Step__c query_step = [SELECT Id FROM Step__c WHERE Title__c ='StepForConditionTest'];
        ConditionController.getConditionsStep(query_step.Id);
        Test.stopTest();
    }

    @isTest static void getConditionsWithElement() {
        Test.startTest();
        Element__c query_element = [SELECT Id From Element__c WHERE Title__c = 'ElementForConditionTest'];
        ConditionController.getConditionsElement(query_element.Id);
        Test.stopTest();
    }

    @isTest static void getConditionsFailsWithStep() {
        Test.startTest();
        try {
            ConditionController.getConditionsStep('test');
        } catch(Exception e) {
            System.debug(e.getMessage());
        }
        Test.stopTest();
    }

    @isTest static void getConditionsFailsWithElement() {
        Test.startTest();
        try {
            ConditionController.getConditionsElement('test');
            
        } catch(Exception e) {
            System.debug(e.getMessage());
        }
        Test.stopTest();
    }
}
