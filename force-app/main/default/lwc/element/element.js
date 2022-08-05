import { api, LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent, unregisterAllListeners } from 'c/pubsub';
import { updateRecord } from 'lightning/uiRecordApi';

import ELEMENT_ID from '@salesforce/schema/Element__c.Id';
import ELEMENT_VALUE from '@salesforce/schema/Element__c.Value__c';


export default class Element extends LightningElement {
    @wire(CurrentPageReference) pageRef;

    @api element;
    @api elementSelectedId;
    isButton;
    isLabel;
    isCheckbox;
    isCurrency;
    isDate;
    isDateTime;
    isEmail;
    isFile;
    isPassword;
    isNumber;
    isRange;
    isTelephone;
    isText;
    isTime;
    isUrl;
    isLineBreak;
    isPost;

    val = 5;

    connectedCallback() {
        this.injectElement();
    }
    disconnectedCallback() {
        unregisterAllListeners(this);

    }

    handleElementSelect() {
        //event.preventDefault();
        fireEvent(this.pageRef, 'elementselected', this.element);
    }
    elementDeleteHandler(event) {
        event.preventDefault();
        const target = JSON.parse(JSON.stringify(event.target.value));
        if('isStep' in target) {
            fireEvent(this.pageRef, 'stepdeleted', this.element);
            return;
        }
        fireEvent(this.pageRef, 'elementdeleted', this.element);
    }

    injectElement() {
        if(this.element.elementType.includes('button-drop'))
            this.isButton = true;
        else if(this.element.elementType.includes('label-drop'))
            this.isLabel = true;
        else if(this.element.elementType.includes('checkbox-drop'))
            this.isCheckbox = true;
        else if(this.element.elementType.includes('currency-drop'))
            this.isCurrency = true;
        else if(this.element.elementType.includes('date-drop'))
            this.isDate = true;
        else if(this.element.elementType.includes('date-time-drop'))
            this.isDateTime = true;
        else if(this.element.elementType.includes('email-drop'))
            this.isEmail = true;
        else if(this.element.elementType.includes('file-drop'))
            this.isFile = true;
        else if(this.element.elementType.includes('password-drop'))
            this.isPassword = true;
        else if(this.element.elementType.includes('number-drop'))
            this.isNumber = true;
        else if(this.element.elementType.includes('telephone-drop'))
            this.isTelephone = true;
        else if(this.element.elementType.includes('text-drop'))
            this.isText = true;
        else if(this.element.elementType.includes('time-drop'))
            this.isTime = true;
        else if(this.element.elementType.includes('url-drop'))
            this.isUrl = true;
        else if(this.element.elementType.includes('range-drop'))
            this.isRange = true;
        else if(this.element.elementType.includes('line-break-drop'))
            this.isLineBreak = true;
        else if(this.element.elementType.includes('post-drop'))
            this.isPost = true;
    }

    handleElementValueChange(event) {
        var elementObj = JSON.parse(JSON.stringify(this.element));
        event.stopPropagation();
        if(this.element.elementType.includes('checkbox')) {
            //elementObj.value = event.target.checked;
            if(this.element.value === 'unchecked') elementObj.value = 'checked';
            else elementObj.value = 'unchecked';
        }
        else if(this.element.elementType.includes('file')) {
            elementObj.value = this.element.title;
        }
        else if(this.element.elementType.includes('range')) {
            elementObj.value = event.detail.value;
        }
        else {
            elementObj.value = event.target.value;
        }

        const fields = {};
        const elementId = elementObj.id.split('-');
        fields[ELEMENT_ID.fieldApiName] = elementId[1];
        fields[ELEMENT_VALUE.fieldApiName] = elementObj.value;
        const recordInput = {fields};
        updateRecord(recordInput)
            .then(result => {
                console.log(result);
            }).catch(error => {
                console.log(error);
            })

        fireEvent(this.pageRef, 'elementvaluechange', elementObj);
    }


    get buttonTitle() {
        return this.element.buttonTitle;
    }
    get labelInfo() {
        return this.element.labelInfo;
    }
    get elementName() {
        return this.element.name;
    }
    get title() {
        return this.element.title;
    }

    get elementSelected() {
        if(this.element.id === this.elementSelectedId) return true;
        return false;
    }


    get isElementSelectedClass() {
        if(this.element.id === this.elementSelectedId) return 'isSelected';
        return 'selectable';
    }

    get checkedValue() {
        if(this.element.value === 'checked') return true;
        return false;
    }
}