import { LightningElement, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { createRecord, deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getSteps from '@salesforce/apex/StepController.getSteps';
import getElements from '@salesforce/apex/ElementController.getElements';
import getConditionsStep from '@salesforce/apex/ConditionController.getConditionsStep';
import getConditionsElement from '@salesforce/apex/ConditionController.getConditionsElement';

import STEP_ID from '@salesforce/schema/Step__c.Id';
import STEP_TITLE from '@salesforce/schema/Step__c.Title__c';
import STEP_INDEX from '@salesforce/schema/Step__c.Index__c';
import ELEMENT_ID from '@salesforce/schema/Element__c.Id';
import ELEMENT_TITLE from '@salesforce/schema/Element__c.Title__c';
import ELEMENT_INDEX from '@salesforce/schema/Element__c.Index__c';


export default class StepSheet extends LightningElement {
    @wire(CurrentPageReference) pageRef;

    @track steps = [];
    
    selectedStepId;
    selectedElementId;
    
    dragInfo;
    dropInfo;
    
    currentlySelected;

    isDragging;

    currentElement;

    visibleFlag = false;
    
    connectedCallback() {
        this.loadSteps();
        registerListener('stepupdated', this.stepUpdateHandler, this);
        registerListener('stepdeleted', this.stepDeleteHandler, this);
        registerListener('stepconditionadded', this.stepConditionHandler, this);
        registerListener('elementupdated', this.elementUpdateHandler, this);
        registerListener('elementdeleted', this.elementDeleteHandler, this);
        registerListener('elementselected', this.elementSelectHandler, this);
        registerListener('elementadded', this.elementAddedHandler, this);
        registerListener('elementvaluechange', this.elementValueHandler, this);
        registerListener('elementconditionadded', this.elementConditionHandler, this);
        registerListener('elementsreordered', this.elementReorderHandler, this);
        registerListener('conditiondeleted', this.conditionDeleteHandler, this);
        registerListener('conditionupdated', this.conditionUpdatedHandler, this);
    }
    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    loadSteps() {
        var i;
        var obj;
        var stepArr = [];
        getSteps()
            .then(result => {
                for(i = 0; i < result.length; i++) {
                    if(result[i].Element_Type__c) {
                        obj = {
                            title: result[i].Title__c,
                            name: result[i].Name,
                            id: result[i].Id,
                            isStep: false,
                            conditions: this.pullConditionsStep(result[i].Id),
                            elementType: result[i].Element_Type__c,
                            isVisible: true,
                            index: result[i].Index__c
                        }
                    }
                    else {
                        obj = {
                            title: result[i].Title__c,
                            name: result[i].Name,
                            id: result[i].Id,
                            elements: this.pullElements(result[i].Id),
                            isStep: true,
                            conditions: this.pullConditionsStep(result[i].Id),
                            isVisible: true,
                            index: result[i].Index__c
                        }
                    }

                    stepArr[result[i].Index__c] = obj;

                    /*if(result[i].Element_Type__c) {
                        obj.elementType = result[i].Element_Type__c;
                        if(result[i].Element_Type__c === 'post-drop') obj.isStep = false;
                        obj.id = 'stepX-element' + result[i].id
                    }*/
                }
                this.steps = stepArr;
            })
    }
    pullElements(stepId) {
        var i;
        var elementArray = [];
        var obj = {};
        getElements({strId: stepId})
            .then(result => {
                for(i = 0; i < result.length; i++) {
                    const elementStr = result[i].Element_Type__c.split('-');
                    obj = {
                        title: result[i].Title__c,
                        elementType: result[i].Element_Type__c,
                        id: stepId + '-' + result[i].Id,
                        isVisible: true,
                        conditions: this.pullConditionsElement(result[i].Id),
                        name: elementStr[0],
                        value: result[i].Value__c,
                        index: result[i].Index__c
                    }
                    if(result[i].Value__c === null) obj.value = null;
                    elementArray[result[i].Index__c] = obj;
                }
                console.log(elementArray);
                return elementArray;
            }).catch(error => {
                console.log(error.body.message);
            })

        return elementArray;
    }
    pullConditionsStep(stepId) {
        var i;
        var conditionArr = [];
        var obj = {};
        var labelArr;
        getConditionsStep({strId: stepId})
            .then(result => {
                for(i = 0; i < result.length; i++) {
                    labelArr = result[i].Label__c.split('_');
                    obj = {
                        value: result[i].Value__c,
                        string: labelArr[0] + ' ' + labelArr[1] + ' ' + labelArr[2],
                        preparsedStr: result[i].Label__c,
                        id: result[i].Id,
                        step: stepId
                    }
                    conditionArr.push(obj);
                }
                return conditionArr;
            }).catch(error => {
                console.log(error.body.message);
            })

        return conditionArr;
    }
    pullConditionsElement(elementId) {
        var i;
        var conditionArr = [];
        var obj = {};
        var labelArr;
        getConditionsElement({strId: elementId})
            .then(result => {
                for(i = 0; i < result.length; i++) {
                    labelArr = result[i].Label__c.split('_');
                    obj = {
                        value: result[i].Value__c,
                        string: labelArr[0] + ' ' + labelArr[1] + ' ' + labelArr[2],
                        id: result[i].Id,
                        element: elementId,
                        preparsedStr: result[i].Label__c,

                    }
                    conditionArr.push(obj);
                }
                return conditionArr;
            }).catch(error => {
                console.log(error.body.message);
            })

        return conditionArr;
    }

    checkVisibility() {
        if(this.visibleFlag === true) {
            for(let i = 0; i < this.steps.length; i++) {
                if(this.steps[i].isVisible === false) {
                    this.steps[i].isVisible = true;
                }
                if(('elements' in this.steps[i]) === false) continue;
                if(this.steps[i].elements.length > 0) {
                    for(let j = 0; j < this.steps[i].elements.length; j++) {
                        if(this.steps[i].elements[j].isVisible === false) {
                            this.steps[i].elements[j].isVisible = true;
                        }
                    }
                }
            }

            this.visibleFlag = false;
            return;
        }
        
        // for block under premise of AND conditions
        // will need to implement OR flag, this will be stored
        // in element/step, not condition
        for(let i = 0; i < this.steps.length; i++) {
            const conditions = this.steps[i].conditions;
            for(let j = 0; j < conditions.length; j++) {
                const condition = conditions[j].value.split('_');
                switch(condition[1]) {
                    case '===':
                        if(condition[0] === condition[2]) continue;
                        this.steps[i].isVisible = false;
                        break;
                    case '!=':
                        if(condition[0] !== condition[2]) continue;
                        this.steps[i].isVisible = false;
                        break;
                    case '<':
                        if(condition[0] < condition[2]) continue;
                        this.steps[i].isVisible = false;
                        break;
                    case '>':
                        if(condition[0] > condition[2]) continue;
                        this.steps[i].isVisible = false;
                        break;
                    case '<=':
                        if(condition[0] <= condition[2]) continue;
                        this.steps[i].isVisible = false;
                        break;
                    case '>=':
                        if(condition[0] >= condition[2]) continue;
                        this.steps[i].isVisible = false;
                        break;
                    default:
                        break;
                }
                
            }
            if(('elements' in this.steps[i]) === false) continue;
            if(this.steps[i].elements.length > 0) {
                for(let k = 0; k < this.steps[i].elements.length; k++) {
                    const conditionsElement = this.steps[i].elements[k].conditions;
                    for(let z = 0; z < conditionsElement.length; z++) {
                        const conditionElement = conditionsElement[z].value.split('_');
                        switch(conditionElement[1]) {
                            case '===':
                                if(conditionElement[0] === conditionElement[2]) continue;
                                this.steps[i].elements[k].isVisible = false;
                                break;
                            case '!=':
                                if(conditionElement[0] !== conditionElement[2]) continue;
                                this.steps[i].elements[k].isVisible = false;
                                break;
                            case '<':
                                if(conditionElement[0] < conditionElement[2]) continue;
                                this.steps[i].elements[k].isVisible = false;
                                break;
                            case '>':
                                if(conditionElement[0] > conditionElement[2]) continue;
                                this.steps[i].elements[k].isVisible = false;
                                break;
                            case '<=':
                                if(conditionElement[0] <= conditionElement[2]) continue;
                                this.steps[i].elements[k].elements[k].isVisible = false;
                                break;
                            case '>=':
                                if(conditionElement[0] >= conditionElement[2]) continue;
                                this.steps[i].elements[k].isVisible = false;
                                break;
                            default:
                                break;
                        }

                    }
                }
            }
        }
        this.visibleFlag = true;
    }

    elementUpdateHandler(payload) {
        var tempStepArr = JSON.parse(JSON.stringify(this.steps));
        const parsedElement = JSON.parse(JSON.stringify(payload));
        const indexIdentifier = parsedElement.id.split('-');
        const stepIndex = this.steps.findIndex(x=>x.id===indexIdentifier[0]);
        tempStepArr[stepIndex].elements[parsedElement.index] = parsedElement;
        this.steps = tempStepArr;
        const element = this.steps[stepIndex].elements[parsedElement.index];
        const fields = {};
        fields[ELEMENT_ID.fieldApiName] = indexIdentifier[1];
        fields[ELEMENT_TITLE.fieldApiName] = element.title;
        const recordInput = {fields};
        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(ShowToastEvent({
                    title: 'Success',
                    message: 'Element updated',
                    variant: 'success'
                }))
            }).catch(error => {
                this.dispatchEvent(ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                }))
                console.log(error);
            });
    }
    stepUpdateHandler(payload) {
        const index = this.steps.findIndex(x=>x.id === payload.id);
        this.steps[index] = payload;
        const step = this.steps[index];

        const fields = {}
        fields[STEP_ID.fieldApiName] = step.id;
        //fields[STEP_NAME.fieldApiName] = step.name;
        fields[STEP_TITLE.fieldApiName] = step.title;
        const recordInput = {fields};
        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(ShowToastEvent({
                    title: 'Success',
                    message: 'Step updated',
                    variant: 'success'
                }))

            }).catch(error => {
                this.dispatchEvent(ShowToastEvent({
                    title: 'Error',
                    message: error.body.message,
                    variant: 'error'
                }))
                console.log(error);
            })
    }

    stepConditionHandler(payload) {
        var step = JSON.parse(JSON.stringify(payload));
        const index = this.steps.findIndex(x=>x.id === step.id);
        this.steps[index] = step;
    }
    elementConditionHandler(payload) {
        const element = JSON.parse(JSON.stringify(payload));
        const stepIndicator = element.id.split('-')[0];
        const stepIndex = this.steps.findIndex(x=>x.id === stepIndicator)
        const elementIndex = this.steps[stepIndex].elements.findIndex(x=>x.id === element.id);
        this.steps[stepIndex].elements[elementIndex] = element;
    }

    stepDeleteHandler(payload) {
        var stepToDelete = JSON.parse(JSON.stringify(payload));
        deleteRecord(stepToDelete.id)
            .then(() => {
                const index = this.steps.findIndex(x => x.id === stepToDelete.id);
                this.reorderArray(stepToDelete.index);
                this.steps.splice(index, 1);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Step successfully deleted',
                        variant: 'success'
                    })
                )
            }).catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting step',
                        message: error.body.message,
                        variant: 'error'
                    })
                )
            })

    }
    elementDeleteHandler(payload) {
        var elementToDelete = JSON.parse(JSON.stringify(payload));
        const elementId = elementToDelete.id.split('-');

        deleteRecord(elementId[1])
            .then(() => {
                const stepIndex = this.steps.findIndex(x=>x.id===elementId[0]);
                const elementIndex = this.steps[stepIndex].elements.findIndex(x=>x.id===elementToDelete.id);
                this.reorderElementArray(stepIndex, elementIndex);
                this.steps[stepIndex].elements.splice(elementIndex, 1);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Element successfully deleted',
                        variant: 'success'
                    })
                )
            })
            .catch((error=> {
                console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting element',
                        message: error,
                        variant: 'error'
                    })
                )
            }))
    }
    conditionDeleteHandler(payload) {        
        deleteRecord(payload.condition)
            .then(() => {
                if('step' in payload) {
                    const stepIndex = this.steps.findIndex(x=>x.id === payload.step);
                    const conditionIndex = this.steps[stepIndex].conditions.findIndex(x=>x.id === payload.condition);
                    this.steps[stepIndex].conditions.splice(conditionIndex, 1);
                }
                else if('element' in payload) {
                    const identifier = payload.element.split('-')
                    const stepIndex = this.steps.findIndex(x=>x.id === identifier[0]);
                    console.log(identifier);
                    const elementIndex = this.steps[stepIndex].elements.findIndex(x=>x.id===identifier[1]);
                    console.log(stepIndex, elementIndex);
                    const conditionIndex = this.steps[stepIndex].elements[elementIndex].conditions.findIndex(x=>x.id===payload.condition);
                    this.steps[stepIndex].elements[elementIndex].conditions.splice(conditionIndex, 1);
                }
            })
            .catch(error => {
                console.log(error);
                /*this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting condition',
                        message: error.body.message,
                        variant: 'error'
                    })
                )*/
            })
    }

    conditionUpdatedHandler(payload) {
        var condition = JSON.parse(JSON.stringify(payload));
        console.log(condition);
        if('element' in condition) {
            const indexIdentifier = condition.element.id.split('-');
            const stepIndex = this.steps.findIndex(x => x.id === indexIdentifier[0]);
            const elementIndex = this.steps[stepIndex].elements.findIndex(x => x.id === indexIdentifier[1]);
            const conditionIndex = this.steps[stepIndex].elements[elementIndex].findIndex(x => x.id === condition.id);
            this.steps[stepIndex].elements[elementIndex].conditions[conditionIndex] = condition;
        }
        else if('step' in condition) {
            const stepIndex = condition.step;
            const conditionIndex = this.steps[stepIndex].conditions.findIndex(x => x.id === condition.id);
            this.steps[stepIndex].conditions[conditionIndex] = condition;
        }
    }

    reorderArray(index) {
        var fields = {};
        var recordInput;
        for(let i = 0; i < this.steps.length; i++) {
            if(this.steps[i].index === index + 1) {
                for(let j = i; j < this.steps.length; j++) {
                    this.steps[j].index = this.steps[j].index - 1;
                    fields[STEP_INDEX.fieldApiName] = this.steps[j].index;
                    fields[STEP_ID.fieldApiName] = this.steps[j].id;
                    recordInput = {fields};
                    updateRecord(recordInput)
                        .then(result => {
                            console.log(result);
                        }).catch(error => {
                            console.log(error);
                        })
                }
            }

        }
    }

    reorderElementArray(stepIndex, elementIndex) {
        var fields = {};
        var recordInput;
        console.log('entered');
        for(let i = 0; i < this.steps[stepIndex].elements.length; i++) {
            if(this.steps[stepIndex].elements[i].index === elementIndex + 1) {
                for(let j = i; j < this.steps[stepIndex].elements.length; j++) {
                    this.steps[stepIndex].elements[j].index = this.steps[stepIndex].elements[j].index - 1;
                    fields[ELEMENT_INDEX.fieldApiName] = this.steps[stepIndex].elements[j].index;
                    fields[ELEMENT_ID.fieldApiName] = this.steps[stepIndex].elements[j].id.split('-')[1];

                    recordInput = {fields};
                    updateRecord(recordInput)
                        .then(result => {
                            console.log(result);
                        }).catch(error => {
                            console.log(error);
                        })
                }
            }
        }
    }

    elementAddedHandler(payload) {
        const stepName = payload.id.split('-')[0];
        const index = this.steps.findIndex(x=>x.id===stepName)
        this.steps[index].elements.push(payload);
    }

    dropElement(event) {
        var obj;
        var fields = {};
        if(!event.dataTransfer.getData("elementType").includes("step-drop") && !event.dataTransfer.getData("elementType").includes("post-drop")) return;
        if(event.dataTransfer.getData("elementType").includes("step-drop")) {
            fields.Title__c = 'Step ' + this.getTotalSteps();
            fields.Element_Type__c = '';
        }
        else if(event.dataTransfer.getData("elementType").includes("post-drop")){
            if(event.target.step !== undefined) return;
            fields.Title__c = 'DataRaptor Post Action ' + this.getTotalElements();
            fields.Element_Type__c = 'post-drop';
        }
        fields.Index__c = this.steps.length;
        const recordInput = {apiName: 'Step__c', fields};
        createRecord(recordInput)
            .then(result => {
                obj = {
                    title: result.fields.Title__c.value,
                    name: result.fields.Name.value,
                    id: result.id,
                    elementType: result.fields.Element_Type__c.value,
                    isVisible: true,
                    conditions: [],
                    index: result.fields.Index__c.value
                };
                if(event.dataTransfer.getData("elementType").includes("post-drop")) {
                    obj.isStep = false;
                }
                else {
                    obj.isStep = true;
                }

                this.steps.push(obj);

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Step Saved to DB',
                        variant: 'success'
                    })
                )
            })
            .catch(error => {
                console.log(error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating step',
                        message: error.body.message,
                        variant: 'error'
                    })
                )
            });
    }

    getTotalElements() {
        var i;
        var counter = 0;
        for(i = 0; i < this.steps.length; i++) {
            if(!this.steps[i].isStep) {
                counter++;
            }
        }
        return counter;
    }
    getTotalSteps() {
        var i;
        var counter = 0;
        for(i = 0; i < this.steps.length; i++) {
            if(this.steps[i].isStep) {
                counter++;
            }
        }
        return counter;
    }

    handleDrag(event) {
        this.dragInfo = event.target.title;
        event.target.classList.add('drag');
    }

    handleDragover(event) {
        event.preventDefault();
        this.dropInfo = event.target.title;
    }
    handleDrop(event) {
        var fields = {}
        var recordInput;
        // if we are getting a step from the drop onto page we need to handle it differently
        if(this.dropInfo === undefined || this.dragInfo === undefined || !Number.isInteger(parseInt(this.dropInfo, 10)) || !Number.isInteger(parseInt(this.dragInfo, 10))) return false;
        event.stopPropagation();
        const dragValName = this.dragInfo;
        const dropValName = event.target.title;
        if(dragValName===dropValName) return false; // we dont want to drop in the same spot as it already is
        const currentIndex = dragValName;
        const newIndex = dropValName;
        const newArr = this.array_move(JSON.parse(JSON.stringify(this.steps)), currentIndex, newIndex);
        
        fields[STEP_INDEX.fieldApiName] = newIndex;
        fields[STEP_ID.fieldApiName] = this.steps[currentIndex].id;
        recordInput = {fields};
        updateRecord(recordInput)
            .then(() => {
            }).catch(error => {
                console.log(error);
            })

        fields = {};
        fields[STEP_INDEX.fieldApiName] = currentIndex;
        fields[STEP_ID.fieldApiName] = this.steps[newIndex].id;
        recordInput = {fields};
        updateRecord(recordInput)
            .then(() => {
                console.log('updated');
            }).catch(error => {
                console.log(error);
            })
        

        this.steps = newArr;

        //reset so if we add new steps there arent any values stored here
        this.dropInfo = undefined;
        this.dragInfo = undefined;
        return true;
    }
    elementReorderHandler(payload) {
        var newElements = JSON.parse(JSON.stringify(payload));
        // because we're moving elements we know theres always at least one item in arr
        var identifier = newElements[0].id.split('-');
        var stepIndex = this.steps.findIndex(x => x.id === identifier[0]);
        this.steps[stepIndex].elements = newElements;
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

    stepSelectHandler(event) {
        const stepId = event.target.parentNode.step.id;
        this.selectedStepId = stepId;
        this.selectedElementId = null;
    }

    elementSelectHandler(payload) {
        const elementId = payload.id;
        this.selectedElementId = elementId;
        this.selectedStepId = null;
    }

    elementValueHandler(payload) {
        const indexIdentifier = payload.id.split('-');
        const stepIndex = this.steps.findIndex(x=>x.id===indexIdentifier[0]);
        const elementIndex = this.steps[stepIndex].elements.findIndex(x=>x.id===payload.id);
        this.steps[stepIndex].elements[elementIndex] = payload;
        //const element = this.steps[stepIndex].elements[elementIndex];
    }

    allowDrop(event) {
        event.preventDefault();
    }
}