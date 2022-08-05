public with sharing class ContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactList(List<String> fieldsArray, String sortQuery, String sortOrder) {
        try {
            if(fieldsArray.size() == 0 || fieldsArray == null) {
                List<Contact> emptyList = new List<Contact>{};
                return emptyList;
            }    // we aren't getting anything, just return empty array
            Set<String> contactFields = Schema.SObjectType.Contact.fields.getMap().keySet();
            Map<String, Schema.SObjectType> objResult = Schema.getGlobalDescribe();
            String fieldsString;
            for(String s : fieldsArray) {
                if(contactFields.contains(s.toLowerCase())) {
                    if(fieldsArray[0] == s) { // if it is the first string we don't want a , included before it
                        fieldsString = s;
                    }
                    else {
                        fieldsString = fieldsString + ', ' + s;
                    }
                }
                if(s.contains('.')) {
                    List<String> splitStr = s.split('\\.');

                    if(objResult.containsKey(splitStr[0].toLowerCase())) {
                        if(fieldsArray[0] == s) {
                            fieldsString = s;
                        }
                        else {
                            fieldsString = fieldsString + ', ' + s;
                        }
                    }
                }
            }
            List<sObject> contactList;
            if(String.isBlank(sortQuery)) {
                contactList = Database.query('SELECT Id, ' + fieldsString + ' FROM Contact LIMIT 10');
            }
            else {
                contactList = Database.query('SELECT Id, ' + fieldsString + ' FROM Contact ORDER BY ' + sortQuery + ' ' + sortOrder + ' NULLS LAST LIMIT 10');
            }
            return contactList;
        }
        catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
