import { api, LightningElement, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { fireEvent } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';

import ELEMENT_ID from '@salesforce/schema/Element__c.Id';
import ELEMENT_INDEX from '@salesforce/schema/Element__c.Index__c';


//import { createRecord } from 'lightning/uiRecordApi';

export default class Step extends LightningElement {
    @api step;
    @api stepSelectedId;
    @api elementsTest;
    @api elementSelectedId;
    @api allSteps;

    @wire(CurrentPageReference) pageRef;

    isExpanded;


    clickHandler() {
        this.showToast(this.step.toastTitle, this.step.toastMessage, this.step.notificationVariant);
    }

    handleStepSelect() {
        fireEvent(this.pageRef, 'stepselected', this.step);
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

    deleteStep(event) {
        event.preventDefault();
        fireEvent(this.pageRef, 'stepdeleted', this.step);
    }

    //element code
    addElement(event) {
        var elementType = event.dataTransfer.getData("elementType");
        var fields = {};
        if(elementType.includes('checkbox-drop')) {
            fields.Value__c = 'unchecked';
        }
        else if(elementType.includes('range-drop') || elementType.includes('number-drop')) {
            fields.Value__c = 0;
        }
        else fields.Value__c = 'empty'
        fields = {
            Element_Type__c: elementType,
            Step__c: this.step.id,
            Index__c: this.step.elements.length
        }

        if(elementType.includes('button-drop')) {
            fields.Title__c = 'Button' + this.getTotalItem('button');
        }
        else if(elementType.includes('label-drop')) {
            fields.Title__c= 'Label' + this.getTotalItem('label');
        }
        else if(elementType.includes('checkbox-drop')) {
            fields.Title__c= 'Checkbox' + this.getTotalItem('checkbox');
        }
        else if(elementType.includes('currency-drop')) {
            fields.Title__c= 'Currency' + this.getTotalItem('currency');
        }
        else if(elementType.includes('date-drop')) {
            fields.Title__c= 'Date' + this.getTotalItem('date');
        }
        else if(elementType.includes('date-time-drop')) {
            fields.Title__c= 'Date Time' + this.getTotalItem('date-time');
        }
        else if(elementType.includes('email-drop')) {
            fields.Title__c= 'Email' + this.getTotalItem('email');
        }
        else if(elementType.includes('file-drop')) {
            fields.Title__c= 'File' + this.getTotalItem('file');
        }
        else if(elementType.includes('password-drop')) {
            fields.Title__c= 'Password' + this.getTotalItem('password');
        }
        else if(elementType.includes('number-drop')) {
            fields.Title__c = 'Number' + this.getTotalItem('number');
        }
        else if(elementType.includes('telephone-drop')) {
            fields.Title__c = 'Telephone' + this.getTotalItem('telephone');
        }
        else if(elementType.includes('text-drop')) {
            fields.Title__c = 'Text' + this.getTotalItem('text');
        }
        else if(elementType.includes('time-drop')) {
            fields.Title__c = 'Time' + this.getTotalItem('time');
        }
        else if(elementType.includes('url-drop')) {
            fields.Title__c= 'Url' + this.getTotalItem('url');
        }
        else if(elementType.includes('range-drop')) {
            fields.Title__c= 'Range' + this.getTotalItem('range');
        }
        else if(elementType.includes('post-drop')) {
            fields.Title__c = 'DataRaptor Post Action ' + this.getTotalItem('DataRaptor Post Action');
        }
        

        const recordInput = {apiName: 'Element__c', fields};
        createRecord(recordInput)
            .then(result =>{
                console.log(result);
                const element = {
                    title: result.fields.Title__c.value,
                    name: result.fields.Name.value,
                    id: this.step.id + '-' + result.id,
                    elementType: result.fields.Element_Type__c.value,
                    isVisible: true,
                    conditions: [],
                    value: result.fields.Value__c.value,
                    index: result.fields.Index__c.value
                }
                fireEvent(this.pageRef, 'elementadded', element);
            }).catch(error => {
                console.log(error);
            })
    }

    getTotalItem(elementKind) {
        var counter = 0;
        var stepsArr = JSON.parse(JSON.stringify(this.allSteps));
        for(let i = 0; i < stepsArr.length; i++) {
            for(let j = 0; j < stepsArr[i].elements.length; j++) {
                if(stepsArr[i].elements[j].elementType.includes(elementKind)) {
                    counter++;
                }
            }
        }

        return counter;
    }

    allowDrop(event) {
        event.preventDefault();
    }
    handleExpand() {
        if(this.isExpanded)
            this.isExpanded = false;
        else
            this.isExpanded = true;
    }

    handleDragover(event) {
        event.preventDefault();
        this.dropInfo = event.target.parentNode.title;
    }
    handleDrop(event) {
        var temp;
        var fields = {};
        var recordInput;
        if(this.dropInfo === undefined || this.dragInfo === undefined || !Number.isInteger(parseInt(this.dropInfo, 10)) || !Number.isInteger(parseInt(this.dragInfo, 10))) return false;
        event.stopPropagation();
        const dragValName = this.dragInfo;
        const dropValName = this.dropInfo;
        if(dragValName===dropValName) return false; // we dont want to drop in the same spot as it already is
        const currentIndex = dragValName;
        const newIndex = dropValName;
        temp = JSON.parse(JSON.stringify(this.step)).elements;
        const newArr = this.array_move(temp, currentIndex, newIndex);

        fields[ELEMENT_INDEX.fieldApiName] = currentIndex;
        fields[ELEMENT_ID.fieldApiName] = temp[currentIndex].id.split('-')[1];
        recordInput = {fields};
        updateRecord(recordInput)
            .then(result => {
                console.log(result);
            }).catch(error => {
                console.log(error);
            })
        
        fields = {};
        fields[ELEMENT_INDEX.fieldApiName] = newIndex;
        fields[ELEMENT_ID.fieldApiName] = temp[newIndex].id.split('-')[1];
        recordInput = {fields};
        updateRecord(recordInput).
            then(result => {
                console.log(result);
            }).catch(error => {
                console.log(error);
            })

        fireEvent(this.pageRef, 'elementsreordered', newArr);
        //reset so if we add new steps there arent any values stored here
        this.dropInfo = undefined;
        this.dragInfo = undefined;
        return true;
    }
    handleDrag(event) {
        this.dragInfo = event.target.title;
        event.target.classList.add('drag');
    }
    array_move(arr, old_index, new_index) {
        var k;
        if (new_index >= arr.length) {
            k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
    }

    get isStepSelected() {
        //if(this.elementSelectedId) return 'selectable';
        if(this.step.id === this.stepSelectedId) return 'isSelected';
        return 'selectable'
    }

    get expandedIcon() {
        if(this.isExpanded === true) return "utility:up";
        return "utility:down";
    }
    
}