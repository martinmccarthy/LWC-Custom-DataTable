import { api, LightningElement, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class StepBuilder extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    selectedTabValue;
    stepId;
    steps;
    stepFound;
    elementFound;
    elementType;
    elementId;
    step;
    element;
    elementConditionArr;
    stepConditionArr;
    @api allSteps; // used because we cant grab using the IDs frontend w/o backend    

    actionItems = [
        {itemType: "Post Action", id: "post-drop", icon: 'standard:entity'},
    ]

    inputItems = [
        {itemType: "Button", id: "button-drop", icon: 'standard:actions_and_buttons'},
        {itemType: "Label", id: "label-drop", icon: 'standard:contact_list'},
        {itemType: "Checkbox", id: "checkbox-drop", icon: 'standard:multi_select_checkbox'},
        {itemType: "Currency", id: "currency-drop", icon: 'standard:currency'},
        {itemType: "Date", id: "date-drop", icon:'standard:date_input'},
        {itemType: "DateTime", id: "date-time-drop", icon:'standard:date_time'},
        {itemType: "Email", id: "email-drop", icon:'standard:email'},
        {itemType: "File", id: "file-drop", icon:'standard:file'},
        {itemType: "Password", id: "password-drop", icon:'standard:password'},
        {itemType: "Number", id: "number-drop", icon:'standard:number_input'},
        {itemType: "Telephone", id: "telephone-drop", icon:'standard:call'},
        {itemType: "Text", id: "text-drop", icon:'standard:text'},
        {itemType: "Time", id: "time-drop", icon:'custom:custom25'},
        {itemType: "Url", id: "url-drop", icon:'standard:link'},
        {itemType: "Number Range", id: "range-drop", icon:'standard:calibration'},
    ]

    displayItems = [
        {itemType: "Line Break", id: "line-break-drop", icon: "standard:apex"}
    ]

    groupItems = [
        {itemType: "Step", id: "step-drop", icon:'standard:timesheet'}
    ]

    updateSteps() {
        const comSave = new CustomEvent('communicatesave', {bubbles: true});
        this.dispatchEvent(comSave);
    }
    updateElements() {
        const comElSave = new CustomEvent('communicateelsave');
        this.dispatchEvent(comElSave);
    }

    //callback functions
    connectedCallback() {
        registerListener('stepselected', this.callBackMethodStep, this);
        registerListener('elementselected', this.callBackMethodElement, this);
    }
    callBackMethodStep(payload) {
        this.step = JSON.parse(JSON.stringify(payload));
        this.stepConditionArr = this.step.conditions;
        this.stepFound = true;
        if(this.elementFound) this.elementFound = false;
        this.selectedTabValue = 'customizetab';
    }
    callBackMethodElement(payload) {
        this.element = JSON.parse(JSON.stringify(payload));
        this.elementFound = true;
        this.elementConditionArr = this.element.conditions;
        if(this.stepFound) this.stepFound = false;
        this.selectedTabValue = 'customizetab';
    }
    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    tabChangeHandler(event) {
        this.selectedTabValue = event.target.value;
    }

    handleToggleSection() {

    }

    get editFound() {
        if(this.stepFound || this.elementFound) return true;
        return false;
    }

    get buildMode() {
        if(this.stepFound) return 'stepedit';
        if(this.elementFound) return 'elementedit'
        return null;
    }
}