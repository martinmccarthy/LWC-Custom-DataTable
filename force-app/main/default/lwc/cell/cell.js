import { api, LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class Cell extends NavigationMixin(LightningElement) {
    @api cellInfo;
    @api apiName;
    @api rowId;

    connectedCallback(){ var parsedCell = JSON.parse(JSON.stringify(this.cellInfo)) 
        // console.log(parsedCell)
    };
    // Navigate to View Record Page
    navigateToRecord() {
        // console.log(this.apiName);
        // console.log(this.rowId);
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.rowId,
                objectApiName: this.apiName,
                actionName: 'view'
            },
        });
    }

    /* Getters here are pretty straight forward,
       check the value type and then display that
       type on the cell HTML */
    get isText() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.fieldName === 'Name') return false;
        if(parsedCell.type === 'string' || parsedCell.type === 'picklist' || parsedCell.type === 'textarea' || parsedCell.type === 'id')  return true;
        return false;
    }

    get isPhone() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'phone') return true;
        return false;
    }

    get isEmail() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'email') return true;
        return false;
    }

    get isDate() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'date') return true;
        return false;
    }

    get isDateTime() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'datetime') return true;
        return false;
    }

    get isAddress() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'address') return true;
        return false;
    }

    get isPercent() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'percent') return true;
       
        return false;
    }

    get isDecimal() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'decimal' || parsedCell.type === 'double') return true;
        return false;
    }

    get isCurrency() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'currency') return true;
        return false;
    }

    get isUrl() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'url') return true;
        return false;
    }

    get isBool() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'boolean') return true;
        return false;
    }

    get isInteger() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.type === 'number') return true;
        return false;
    }

    get isReference() {
        var parsedCell = JSON.parse(JSON.stringify(this.cellInfo));
        if(parsedCell.fieldName === 'Name') return true;
        return false;
    }
}