@isTest
public class ContactControllerTest {
    @isTest static void getContactsWithArr() {
        Test.startTest();
        List<String> fields = new List<String>{'Phone', 'Email', 'FirstName'};
        String sortQuery = 'FirstName';
        String sortOrder = 'ASC';
        List<Contact> contact_list = ContactController.getContactList(fields, sortQuery, sortOrder);
        Test.stopTest();
    }

    @isTest static void getContactsWithRelationship() {
        Test.startTest();
        List<String> fields = new List<String>{'Account.Fax', 'Account.Name'};
        List<Contact> contact_list = ContactController.getContactList(fields, '', '');
    }

    @isTest static void noFieldsReturnsNothing() {
        List<String> fields = new List<String>{};
        List<Contact> contact_list = ContactController.getContactList(fields, '', '');
        System.assert(contact_list.size() == 0, 'Contacts received');
    }

    @isTest static void onlyInvalidReturnsException() {
        Test.startTest();
        try { 
            List<String> fields = new List<String>{'hello', 'world'};
            List<Contact> contact_list = ContactController.getContactList(fields, '', '');
        }
        catch(Exception e) {
            System.debug(e.getMessage());
        }
        Test.stopTest();
    }
}
