import { api, LightningElement } from 'lwc';

export default class BuildItem extends LightningElement {
    @api item;
    @api idtag;

    dragStart(event) {
        event.dataTransfer.setData('elementType', event.target.id);
    }
}