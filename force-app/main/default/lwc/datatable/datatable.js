import { LightningElement, api } from 'lwc';

export default class Datatable extends LightningElement {
    @api columns;
    @api rows;
    @api apiName;

    isEditOpen;

    columnReset = true;
    modalOpen = false;

    currentCol = '';

    currentSortedCol = '';
    sortOrder = 'ASC';

    colTitle = '';
    colField = '';
    colType = '';

    clientX = 0;
    colX = 0;
    currentResize = '';

    typeOptions = [
        {label: "Text", value: "text"},
        {label: "Phone", value: "phone"},
        {label: "Email", value: "email"},
        {label: "Date", value: "date"},
        {label: "Address", value: "address"},
        {label: "Percent", value: "percent"},
        {label: "Decimal", value: "decimal"},
        {label: "Currency", value: "currency"},
        {label: "Url", value: "url"},
        {label: "Boolean", value: "bool"},
        {label: "Integer", value: "int"}

    ]

    handleEditTitle(event) {
        this.colTitle = event.detail.value;
    }
    handleEditField(event) {
        this.colField = event.detail.value;
    }
    handleEditType(event) {
        this.colType = event.detail.value;
    }



    deleteColumn(event) {
        event.stopPropagation();
        const columnToDelete = event.currentTarget.dataset.id;
        const colIndex = this.columns.findIndex(col => col.title === columnToDelete);
        const colField = this.columns[colIndex].fieldName;
        const deleteCol = new CustomEvent('deletecolumn', {detail: colField})
        this.dispatchEvent(deleteCol);
    }

    sortByColumn(event) {
        var columnField = event.currentTarget.dataset.id;
        var index = this.columns.findIndex(col => col.fieldName === columnField);
        const columnSort = new CustomEvent('sortcolumn', {detail: index})
        this.dispatchEvent(columnSort);
    }

    editColumn(event) {
        event.stopPropagation();
        this.currentCol = event.currentTarget.dataset.id;
        this.modalOpen = true;
    }
    closeModal() {
        this.modalOpen = false;
    }

    saveColumn() {
        var savedTitle;
        var savedField;
        var savedType;
        var updatedCol = {};
        var colIndex = this.columns.findIndex(col => col.title === this.currentCol);
        
        if(this.colTitle === '') savedTitle = this.currentCol;
        else savedTitle = this.colTitle;
        
        if(this.colField === '') savedField = this.columns[colIndex].fieldName;
        else savedField = this.colField;
        
        if(this.colType === '') savedType = this.columns[colIndex].type;
        else savedType = this.colType;

        updatedCol = {title: savedTitle, fieldName: savedField, type: savedType, index: colIndex};
        const updateCol = new CustomEvent('updatecolumn', {detail: updatedCol});
        this.dispatchEvent(updateCol);
        this.modalOpen = false;
    }

    /* These functions allow us to move the columns based on the user's
       mouse input/positioning */
    registerDrag(event) {
        event.stopPropagation();
        event.preventDefault();
        this.clientX = event.clientX;
        this.currentResize = event.currentTarget.dataset.id;
        const str = '[data-id="' + event.currentTarget.dataset.id + '"]';
        let columnStyle = window.getComputedStyle(this.template.querySelector(str));
        this.colX = parseInt(columnStyle.width, 10);
        this.template.querySelector(str).classList.add('resizing');
    }
    deregisterDrag(event) {
        event.stopPropagation();
        const str = '[data-id="' + event.currentTarget.dataset.id + '"]';
        this.template.querySelector(str).classList.remove('resizing');
        this.currentResize = '';
    }
    resizeColumn(event) {
        event.stopPropagation();
        if(event.currentTarget.dataset.id !== this.currentResize) return;
        const dx = event.clientX - this.clientX;
        this.template.querySelector('.resizing').style.width = `${this.colX + dx}px`;
    }

    /* Gets the data from the parent component and parses it into readable data */
    get displayRows() {
        if(!this.rows) return [];
        let rowData = JSON.parse(JSON.stringify(this.rows));
        let rowArr = [];
        for(let i = 0; i < rowData.length; i++) {
            let currentObj = {};
            for(let j = 0; j < this.columns.length; j++) {
                if(this.columns[j].fieldName in rowData[i]) {
                    let currentData = rowData[i];
                    currentObj[this.columns[j].fieldName] = currentData[this.columns[j].fieldName];
                }
                else if(this.columns[j].fieldName.includes(".")) { // if we have a reference i.e 'Account.Name'
                    /* Objects returned from a reference are stored in a child object
                       i.e calling 'Account.Name' returns:
                        {
                            Account: {
                                Name: 'Joe Smith Industries'
                            }
                        } 
                        because of this we need to split the field and see if there's an account and then if there's a name
                    */
                    let splitField = this.columns[j].fieldName.split('.');
                    if(splitField[0] in rowData[i]) {
                        let currentContact = rowData[i];
                        if(splitField[1] in currentContact[splitField[0]]) {
                            let referenceValues = currentContact[splitField[0]];
                            currentObj[this.columns[j].fieldName] = referenceValues[splitField[1]];
                        }
                    }
                }
            }
            currentObj.Id = rowData[i].Id;
            rowArr.push(currentObj);
        }
        return rowArr;
    }

    /* Gets the data from the parent component and parses it into readable data */
    get columnDisplay() {
        return JSON.parse(JSON.stringify(this.columns));
    }
}