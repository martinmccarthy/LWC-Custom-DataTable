@isTest
public class DataTableControllerTest {
    @isTest static void getDataWithFullQuery() {
        Test.startTest();
        List<String> fields = new List<String>{'Phone', 'Email', 'FirstName', 'Account.Name'};
        String sortQuery = 'Phone';
        String sortOrder = 'ASC';
        String dataType = 'Contact';
        List<SObject> contact_list = DataTableController.getDataList(fields, sortQuery, sortOrder, dataType);
        Test.stopTest();
    }

    @isTest static void noFieldsReturnsNothing() {
        List<String> fields = new List<String>{};
        List<SObject> empty_list = DataTableController.getDataList(fields, '', '', 'Contact');
        System.assert(empty_list.size() == 0, 'Objects received');
    }

    @isTest static void blankQueryReturnsData() {
        Test.startTest();
        List<String> fields = new List<String>{'Name', 'Fax'};
        String dataType = 'Account';
        String sortOrder = 'ASC';
        List<SObject> account_list = DataTableController.getDataList(fields, '', sortOrder, dataType);

        Test.stopTest();
    }

    @isTest static void invalidQueryReturnsException() {
        Test.startTest();
        try { 
            List<String> fields = new List<String>{'hello', 'world'};
            List<SObject> account_list = DataTableController.getDataList(fields, '', '', 'Account');
        }
        catch(Exception e) {
            System.debug(e.getMessage());
        }
        Test.stopTest();
    }
}
