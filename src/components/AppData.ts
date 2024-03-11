import { IOrder, IProduct, IBasket, OrderForm, PaymentMethod } from "../types";
import { IEvents } from "./base/events";

export class AppData {
    items: IProduct[] = [];
    basket: IBasket = {
        items: [],
        total: 0
    };
    preview: IProduct = null;
    order: IOrder = {
        payment: 'card',
        email: '',
        phone: '',
        address: '',
        items: [],
        total: 0
    }

    formErrors: Partial<Record<keyof OrderForm, string>> = {};

    constructor(protected readonly events: IEvents){};

    clearBasket() {
        this.basket.items = [];
        this.basket.total = 0;
        this.events.emit('basket:change');
    }

    inBasket(item: IProduct): boolean {
        return this.basket.items.includes(item.id);
    }

    addToBasket(item: IProduct) {
        this.basket.items.push(item.id);
        this.basket.total += item.price;
        this.events.emit('basket:change', this.basket);
    }

    removeFromBasket(item: IProduct) {
        this.basket.items = this.basket.items.filter( id => id !== item.id );
        this.basket.total -= item.price;
        this.events.emit('basket:change', this.basket);
    }

    setItems(items: IProduct[]) {
        this.items = items;
        this.events.emit('items:change', this.items);
    }

    setPreview(item: IProduct) {
        this.preview = item;
        this.events.emit('preview:change', this.preview);
    }

    setPaymentMethod(value: PaymentMethod) {
        this.order.payment = value;
    }

    setOrderField(field: keyof OrderForm, value: string) {
        if (field == 'payment') {
            this.setPaymentMethod(value as PaymentMethod);
        } else {
            this.order[field] = value;
        }

        if (this.order.payment && this.validateOrder()) {
            this.order.total = this.basket.total;
            this.order.items = this.basket.items;
        }
    }

    validateOrder() {
        const errors: typeof this.formErrors = {};
        if (!this.order.email) {
            errors.email = 'Необходимо указать email';
        }
        if (!this.order.phone) {
            errors.phone = 'Необходимо указать телефон';
        }
        if (!this.order.address) {
            errors.address = 'Необходимо указать адрес';
        }
        this.formErrors = errors;
        this.events.emit('formErrors:change', this.formErrors);
        return Object.keys(errors).length === 0;
    }
}