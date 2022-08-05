public with sharing class DataTableController {
    @AuraEnabled(cacheable=true)
    public static Map<String, List<String>> getFields(String dataType) {
        Map<String, Schema.SObjectField> fields = Schema.getGlobalDescribe().get(dataType).getDescribe().fields.getMap();
        Map<String, List<String>> fieldStrings = new Map<String, List<String>>();
        for(String key : fields.keySet()) {
            String fieldName = '' + fields.get(key);
            Schema.DisplayType fieldDataType = fields.get(key).getDescribe().getType();
            String fieldType = '' + fieldDataType;

            // AccountId -> reference
            // Account -> Name

            if(fieldType.contains('REFERENCE')) {
                List <Schema.SObjectType> referenceFieldList = fields.get(key).getDescribe().getReferenceTo();
                for(Schema.SObjectType fieldRef : referenceFieldList) {
                    String s = '' + fieldRef;
                    if(dataType.contains(s)) continue;
                    Map<String, Schema.SObjectField> referenceFields = Schema.getGlobalDescribe().get(s).getDescribe().fields.getMap();
                    for(String referenceKey : referenceFields.keySet()) {
                        String referenceFieldName = fieldRef + ' ' + referenceFields.get(referenceKey);
                        String testString = '' + referenceKey;

                        if(referenceFields.get(referenceKey).getDescribe().isUpdateable() == false || referenceFields.get(referenceKey).getDescribe().isFilterable() == false) continue;

                        Schema.DisplayType referenceFieldDataType = referenceFields.get(referenceKey).getDescribe().getType();

                        String referenceFieldType = '' + referenceFieldDataType;
                        List<String> currentField = new List<String>();
                        currentField.add(referenceFieldType);
                        currentField.add(referenceKey);
                        fieldStrings.put(referenceFieldName, currentField);
                        //System.debug(referenceFieldName);
                    }
                }
                //Map<String, Schema.SObjectField> referenceFields = Schema.getGlobalDescribe().get(referenceField).getDescribe().fields.getMap();

                //Map<String, Schema.SObjectField> fieldDescribe = field.getDescribe().fields.getMap();
                //List <Schema.SObjectType> fieldsList = fieldDescribe.getReferenceTo();
            }
            else {
                List<String> currentField = new List<String>();
                currentField.add(fieldType);
                currentField.add(key);
                fieldStrings.put(fieldName, currentField);
            }
        }
        return fieldStrings;
    }
    
    @AuraEnabled(cacheable=true) 
    public static List<SObject> getDataList(List<String> fieldsArray, String sortQuery, String sortOrder, String dataType) {
        try {
            System.debug(fieldsArray);
            if(fieldsArray.size() == 0 || fieldsArray == null || dataType == null) {
                List<SObject> emptyList = new List<SObject>{};
                return emptyList;
            }    // we aren't getting anything, just return empty array

            Set<String> fields = Schema.getGlobalDescribe().get(dataType).getDescribe().fields.getMap().keySet();
            Map<String, Schema.SObjectType> objResult = Schema.getGlobalDescribe();
            String fieldsString = '';
            for(String s : fieldsArray) {
                if(s.contains('Id')) continue; // we already are grabbing Id so no need to do so twice
                if(fields.contains(s.toLowerCase())) {
                    if(String.isBlank(fieldsString)) { // if it is the first string we don't want a , included before it
                        fieldsString = s;
                    }
                    else {
                        fieldsString = fieldsString + ', ' + s;
                    }
                }
                if(s.contains('.')) {
                    List<String> splitStr = s.split('\\.');
                    if(objResult.containsKey(splitStr[0].toLowerCase()) || splitStr[0] == 'Who' || splitStr[0] == 'What') {
                        if(String.isBlank(fieldsString)) {
                            fieldsString = s;
                        }
                        else {
                            fieldsString = fieldsString + ', ' + s;
                        }
                    }
                }
            }
            /* if we have nothing that's in the list of acceptable queries, 
                then there's no need to query and we just return an empty list */
            if(fieldsString == '') {
                List<SObject> emptyList = new List<SObject>{};
                return emptyList;
            }
            System.debug(fieldsString);
            List<SObject> dataList;
            if(String.isBlank(sortQuery) || !(fields.contains(sortQuery.toLowerCase()))) {
                dataList = Database.query('SELECT Id, ' + fieldsString  + ' FROM ' + dataType + ' LIMIT 10');
            }
            else {
                dataList = Database.query('SELECT Id, ' + fieldsString + ' FROM ' + dataType + ' ORDER BY ' + sortQuery + ' ' + sortOrder + ' NULLS LAST LIMIT 10');
            }
            return dataList;
        }
        catch(Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
