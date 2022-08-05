import { api, LightningElement, wire } from 'lwc';
//import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';

import CONDITION_ID from '@salesforce/schema/Condition__c.Id';
import CONDITION_VALUE from '@salesforce/schema/Condition__c.Value__c';
import CONDITION_LABEL from '@salesforce/schema/Condition__c.Label__c';




export default class StepCustomizer extends LightningElement {
    @api steps;
    @api buildMode;
    @api stepConditionArr;
    @api elementConditionArr;
    //@api stepId;
    //@api stepEdit;
   // @api elementType;
    //@api elementId;

    conditionsArr;
    editFlag = false;
    conditionId;

    currentSelection;

    @api element;
    @api step;


    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        if(this.step) {
            console.log(JSON.parse(JSON.stringify(this.stepConditionArr)))
            this.conditionsArr = JSON.parse(JSON.stringify(this.stepConditionArr));
            console.log(this.conditionsArr);
        }
        else if(this.element) {
            this.conditionsArr = JSON.parse(JSON.stringify(this.elementConditionArr));
            console.log(this.conditionsArr);
        }
        registerListener('stepselected', this.stepSelectedHandler, this);
        registerListener('elementselected', this.elementSelectHandler, this);
        //if(this.buildMode === 'stepedit') this.conditionsArr = this.step.conditions;
        //else this.conditionsArr = this.element.conditions;
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    stepSelectedHandler(payload) {
        this.conditionsArr = JSON.parse(JSON.stringify(payload)).conditions;
    }
    elementSelectHandler(payload) {
        this.conditionsArr = JSON.parse(JSON.stringify(payload)).conditions;
    }

    conditionDeleteHandler(payload) {
        const conditionIndex = this.conditionsArr.findIndex(x=>x.id === payload.condition)
        this.conditionsArr.splice(conditionIndex, 1);
    }
    
    title = '';
    name = '';
    labelText = '';
    buttonLabel = '';
    buttonVariant = 'base';
    nameValue = '';
    parsedArr;

    value = "showElIfTrue";

    isModalOpen;
    modalValue = "allCond";
    modalFieldsValue = "";
    modalFieldsLabel = "";
    modalOperatorValue = "equalTo";
    modalInput = "";

    anythingElse;

    conditionalStr;
    conditionalFlag = false;


    handleTitleChange(event) {
        this.title = event.target.value;
    }
    handleNameChange(event) {
        this.name = event.target.value;
    }

    handleLabelChange(event) {
        this.labelText = event.target.value;
    }
    handleButtonLabelChange(event) {
        this.buttonLabel = event.target.value;
    }
    handleButtonVariantChange(event) {
        this.buttonVariant = event.detail.value;
    }

    handleModalComboChange(event) {
        this.modalValue = event.detail.value;
    }
    handleModalFieldChange(event) {
        event.preventDefault();
        this.modalFieldsValue = event.detail.value;
        const options = JSON.parse(JSON.stringify(event.target.options));
        const x = options.find(opt => opt.value === event.detail.value);
        this.modalFieldsLabel = x.label;
        console.log(this.modalFieldsLabel);
    }
    handleModalOperatorChange(event) {
        this.modalOperatorValue = event.detail.value;
    }
    handleModalValueChange(event) {
        this.modalInput = event.target.value;
    }

    update() {
        var currentItem;
        if(this.step) {
            currentItem = JSON.parse(JSON.stringify(this.step));
            console.log(currentItem);
            if(!(this.title === "")) currentItem.title = this.title;
            if(!(this.name === "")) currentItem.name = this.name;
            console.log(currentItem);
            fireEvent(this.pageRef, 'stepupdated', currentItem);

            return;
        }
        if(this.element.elementType.includes('post')) {
            currentItem = this.element;
            if(!(this.title === "")) currentItem.title = this.title;
            if(!(this.name === "")) currentItem.name = this.name;
            fireEvent(this.pageRef, 'stepupdated', currentItem);
        }
        else {
            currentItem = JSON.parse(JSON.stringify(this.element));
            console.log(currentItem);
            if(!(this.title === "")) currentItem.title = this.title;
            if(!(this.name === "")) currentItem.element.name = this.name;
            fireEvent(this.pageRef, 'elementupdated', currentItem);
        }
    }

    conditionalPopUp() {
        this.isModalOpen = true;
    }
    closeModal() {
        this.isModalOpen = false;
    }

    editCondition(event) {
        var conditionInfo;
        console.log(event.target.dataset.name);
        if(this.element) {
            const index = this.element.conditions.findIndex(x => x.id === event.target.dataset.name);
            console.log(index);
            //this.modalFieldsValue = this.element.conditions[index];
            conditionInfo = JSON.parse(JSON.stringify(this.element.conditions[index]));
        }
        else if(this.step) {
            const index = this.step.conditions.findIndex(x => x.id === event.target.dataset.name);
            console.log(index);
            conditionInfo = JSON.parse(JSON.stringify(this.step.conditions[index]));
        }
        const stringArr = conditionInfo.preparsedStr.split('_');
        this.modalFieldsLabel = stringArr[0];
        for(let i = 0; i < this.steps.length; i++) {
            if(this.steps[i].elements.length === 0) continue;
            for(let j = 0; j < this.steps[i].elements.length; j++) {
                if(this.steps[i].elements[j].title === stringArr[0]) {
                    this.modalFieldsValue = this.steps[i].elements[j].value;
                    break;
                }
            }
        }

        switch(stringArr[1]) {
            case '===':
                this.modalOperatorValue = 'equalTo';
                break;
            case '!=':
                this.modalOperatorValue = 'dne';
                break;
            case '<':
                this.modalOperatorValue = 'lessThan';
                break;
            case '>':
                this.modalOperatorValue = 'greaterThan';
                break;
            case '<=':
                this.modalOperatorValue = 'ltet';
                break;
            case '>=':
                this.modalOperatorValue = 'gtet';
                break;
            default:
                break;
        }
        this.modalInput = stringArr[2];
        this.editFlag = true;
        this.conditionId = event.target.dataset.name;
        this.conditionalPopUp();
    }

    addCondition() {
        var valueStr;
        var modalStrVal;
        var fields;
        var resultArr;
        var updatedCondition;
        var tempConditionsArr;
        console.log('entered');
        if(this.modalFieldsValue === null)  valueStr = 'null';
        else valueStr = this.modalFieldsValue;
        valueStr = valueStr.concat('_');
        if(this.modalOperatorValue === 'equalTo') {
            valueStr = valueStr.concat('===');
            modalStrVal = '===';
        } 
        else if(this.modalOperatorValue === 'dne') {
            valueStr = valueStr.concat('!=');
            modalStrVal = '!=';
        } 
        else if(this.modalOperatorValue === 'lessThan') { 
            valueStr = valueStr.concat('<');
            modalStrVal = '<';
        }
        else if(this.modalOperatorValue === 'greaterThan') {
            valueStr = valueStr.concat('>');
            modalStrVal = '>';
        } 
        else if(this.modalOperatorValue === 'ltet') {
            valueStr = valueStr.concat('<=');
            modalStrVal = '<=';
        } 
        else if(this.modalOperatorValue === 'gtet') {
            valueStr = valueStr.concat('>=');
            modalStrVal = '>=';
        }
        valueStr = valueStr.concat("_");
        valueStr = valueStr.concat(this.modalInput);
        const conditionStr = this.modalFieldsLabel + "_" + modalStrVal + "_" + this.modalInput;
        
        if(this.editFlag === true) {
            console.log('entered edit');
            fields = {};
            fields[CONDITION_ID.fieldApiName] = this.conditionId;
            fields[CONDITION_VALUE.fieldApiName] = valueStr;
            fields[CONDITION_LABEL.fieldApiName] = conditionStr;
            console.log(fields);
            const recordInput = {fields};
            updateRecord(recordInput)
                .then(result => {
                    console.log(result);
                    if(this.step) {
                        updatedCondition = JSON.parse(JSON.stringify(this.step.conditions.find(x => x.id === result.id)));                        
                    }
                    else if(this.element) {
                        updatedCondition = JSON.parse(JSON.stringify(this.element.conditions.find(x => x.id === result.id)));
                    }
                    updatedCondition.value = valueStr;
                    updatedCondition.string = this.modalFieldsLabel + " " + modalStrVal + " " + this.modalInput;
                    updatedCondition.preparsedStr = conditionStr;
                    fireEvent(this.pageRef, 'conditionupdated', updatedCondition);
                    this.editFlag = false;
                    const conditionIndex = this.conditionsArr.findIndex(x => x.id === this.conditionId);
                    tempConditionsArr = JSON.parse(JSON.stringify(this.conditionsArr));
                    tempConditionsArr[conditionIndex] = updatedCondition;
                    this.conditionsArr = tempConditionsArr;
                    this.closeModal();
                }).catch(error => {
                    console.log(error);
                })
            return;
        }
        
        if(this.step) {
            fields = {
                Value__c: valueStr,
                Label__c: conditionStr,
                Step__c: this.step.id
            }
            const recordInput = {apiName: 'Condition__c', fields};
            createRecord(recordInput)
                .then(result => {
                    const condition = {
                        value: valueStr,
                        string: this.modalFieldsLabel + " " + modalStrVal + " " + this.modalInput,
                        id: result.id,
                        step: this.step.id,
                        preparsedStr: conditionStr
                    }
                    resultArr = JSON.parse(JSON.stringify(this.step));
                    resultArr.conditions.push(condition);
                    this.conditionsArr = resultArr.conditions;
                    fireEvent(this.pageRef, 'stepconditionadded', resultArr);

                }).catch(error => {
                    console.log(error.body.message);
            
                })
        }
        else if(this.element) {
            if('isStep' in this.element) {
                fields = {
                    Value__c: valueStr,
                    Label__c: conditionStr,
                    Step__c: this.element.id
                }
                const recordInput = {apiName: 'Condition__c', fields};
                createRecord(recordInput)
                    .then(result => {
                        const condition = {
                            value: valueStr,
                            string: this.modalFieldsLabel + " " + this.modalStrVal + " " + this.modalInput,
                            id: result.id,
                            step: this.step.id,
                            preparsedStr: conditionStr
                        }
                        resultArr = JSON.parse(JSON.stringify(this.element));
                        resultArr.conditions.push(condition);
                        this.conditionsArr = resultArr.conditions;
                        fireEvent(this.pageRef, 'stepconditionadded', resultArr);
                    })
                    .catch(error => {
                        console.log(error.body.message);
                    })
            }
            else {
                fields = {
                    Value__c: valueStr,
                    Label__c: conditionStr,
                    Element__c: this.element.id.split('-')[1]
                }
                const recordInput = {apiName: 'Condition__c', fields}
                createRecord(recordInput)
                    .then(result => {
                        const condition = {
                            value: valueStr,
                            string: this.modalFieldsLabel + " " + modalStrVal + " " + this.modalInput,
                            id: result.id,
                            element: this.element.id,
                            preparsedStr: conditionStr
                        }
                        resultArr = JSON.parse(JSON.stringify(this.element));
                        resultArr.conditions.push(condition);
                        this.conditionsArr = resultArr.conditions;
                        fireEvent(this.pageRef, 'elementconditionadded', resultArr);
                    })
            }
        }


        this.closeModal();
    }

    deleteCondition(event) {
        var obj = {};
        var conditionArr;
        if(this.element) obj.element = this.element.id;
        else if(this.step) obj.step = this.step.id;
        obj.condition = event.target.dataset.name;
        const index = this.conditionsArr.findIndex(x => x.id === obj.condition)
        conditionArr = JSON.parse(JSON.stringify(this.conditionsArr));
        conditionArr.splice(index, 1);
        this.conditionsArr = conditionArr;
        fireEvent(this.pageRef, 'conditiondeleted', obj);
    }

    @api getNewSteps() {
        return this.parsedArr;
    }

    get options() {
        return [{label: "Show Element if True", value: "showElIfTrue"}];
    }
    get modalOptions() {
        return [
            {label: 'All Conditions Are Met', value: 'allCond'},
            {label: 'Any Condition Is Met', value: 'anyCond'}
        ];
    }
    get modalFieldOptions() {
        // grab all the elements on the page and return them
        var i, j;
        var modalFieldsArr = [];
        var currentObj = {};
        for(i = 0; i < this.steps.length; i++) {
            if(this.steps[i].elements) {
                for(j = 0; j < this.steps[i].elements.length; j++) {
                    if(this.steps[i].elements[j].elementType.includes('post-drop') || this.steps[i].elements[j].elementType.includes('button-drop') 
                        || this.steps[i].elements[j].elementType.includes('label-drop')|| this.steps[i].elements[j].elementType.includes('line-break-drop')
                        || this.steps[i].elements[j].elementType.includes('button-drop')) {
                            continue;
                        }
                    currentObj = {};
                    currentObj.label = this.steps[i].elements[j].title;
                    if(this.steps[i].elements[j].value === null) currentObj.value = null;
                    else currentObj.value = this.steps[i].elements[j].value;
                    modalFieldsArr.push(currentObj);
                }
            }
            currentObj = {};
        }
        return modalFieldsArr;
    }
    get modalOperatorOptions() {
        return [
            {label: 'Equal To', value: 'equalTo'},
            {label: 'Does Not Equal', value: 'dne'},
            {label: 'Less Than', value: 'lessThan'},
            {label: 'Greater Than', value: 'greaterThan'},
            {label: 'Less Than or Equal To', value: 'ltet'},
            {label: 'Greater Than or Equal To', value: 'gtet'}
        ];
    }
    get buttonOptions() {
        return [
            { label: 'Base', value: 'base' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Brand', value: 'brand' },
            { label: 'Brand Outline', value: 'brand-outline' },
            { label: 'Destructive', value: 'destructive' },
            { label: 'Destructive Text', value: 'destructive-text' },
            { label: 'Inverse', value: 'inverse' },
            { label: 'Success', value: 'success' }
        ]
    }
    get notificationOptions() {
        return [
            { label: 'Error', value: 'error' },
            { label: 'Warning', value: 'warning' },
            { label: 'Success', value: 'success' },
            { label: 'Info', value: 'info' }
        ]
    }

    get stepLabel(){
        //var temp = JSON.parse(JSON.stringify(this.steps));
        //return temp.find(x => x.id === this.stepId).title;
        if(!this.step) return 'null';
        return this.step.title;
    }
    get elementLabel() {
        if(!this.element) return 'null';
        return this.element.title;
    }

    get currentCondition() {
        return this.conditions;
    }

    get stepEdit() {
        if(this.buildMode === 'stepedit') return true;
        return false;
    }

    get conditions() {
        /*if(this.buildMode==='stepedit') return this.conditionsArr;
        else if(this.buildMode==='elementedit') return this.element.conditions;
        return null;*/
        return this.conditionsArr;
    }
}