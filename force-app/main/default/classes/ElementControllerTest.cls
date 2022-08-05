@isTest
public class ElementControllerTest {
    @isTest static void getElementsWithStep() {
        Step__c s = new Step__c(Title__c='StepForElementTest');
        insert s;
        Element__c e = new Element__c(Step__c=s.id, Title__c='ElementForElementTest', Element_Type__c='TestElement');
        insert e;

        Test.startTest();
        ElementController.getElements(s.Id);
        Test.stopTest();
    }

    @isTest static void getElementFailsWithStep() {
        try {
            ElementController.getElements('test');
        }
        catch (Exception e) {
            System.debug(e.getMessage());
        }
    }
}