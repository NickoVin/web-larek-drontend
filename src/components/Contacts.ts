import { Form } from './common/Form';
import { OrderForm } from '../types/index';
import { EventEmitter } from './base/events';


export class Contacts extends Form<OrderForm> {
    constructor(events: EventEmitter, container: HTMLFormElement) {
        super(events, container);
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }
}