@isTest
public class StepControllerTest {
    static testMethod void validateStepInsertion() {
        //declare a new step to insert
        Step__c s = new Step__c(Title__c='Step Example Title');
        insert s;
        //declare a second step return the new one
        List<Step__c> step_list = StepController.getSteps();
        //see if they have the same title
        System.assert(step_list.size() > 0, 'Steps not pulled');
    }
}
