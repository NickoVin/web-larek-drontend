import { AppData } from './components/AppData';
import { WebLarekAPI } from './components/WebLarekApi';
import { EventEmitter } from './components/base/events';
import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Page } from './components/Page';
import { Basket } from './components/common/Basket'
import { OrderField, IProduct, OrderForm } from './types';
import { Card } from './components/Card';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';
import { Success } from './components/common/Success';

const api = new WebLarekAPI(CDN_URL, API_URL);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const modalTemplate = ensureElement<HTMLTemplateElement>('#modal-container'); 
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

// Эммитер событий
const events = new EventEmitter();

// Модель данных приложения
const appData = new AppData(events);

// Глобалные контейнеры
const modal = new Modal(events, modalTemplate);
const page = new Page(events, document.body);
const basket = new Basket(events);
const orderForm = new Order(events, cloneTemplate(orderTemplate));
const contactsForm = new Contacts(events, cloneTemplate(contactsTemplate));

events.on('modal:open', () => {
    page.locked = true;

});

events.on('modal:close', () => {
    page.locked = false;
    
});

events.on('items:change', (items: IProduct[]) => {
    page.catalog = items.map(item => {
        const card = new Card(
            cloneTemplate(cardCatalogTemplate),
            {
                onClick: () => events.emit('card:select', item)
            }
        )

        return card.render(item);
    });
})

events.on('card:select', (item: IProduct) => {
    appData.setPreview(item);
})

events.on('preview:change', (item: IProduct) => {
    const card = new Card(
        cloneTemplate(cardPreviewTemplate),
        {
            onClick: () => {
                if (appData.inBasket(item)) {
                    appData.removeFromBasket(item);
                    card.button = 'В корзину';
                } else {
                    appData.addToBasket(item);
                    card.button = 'Удалить из корзины';
                }
            }
        }
    )

    card.button = appData.inBasket(item) ? 'Удалить из корзины' : 'Добавить в корзину';

    modal.render({content: card.render(item)});
})

events.on('basket:change', () => {
    page.counter = appData.basket.items.length;

    basket.items = appData.basket.items.map(id => {
        const item = appData.items.find(item => item.id == id);
        const card = new Card(cloneTemplate(cardBasketTemplate),
        {
            onClick: () => {
                appData.removeFromBasket(item);
            } 
        })

        return card.render(item);
    })

    basket.total = appData.basket.total;
})

events.on('basket:open', () => {
    modal.render({
        content: basket.render()
    });
})

events.on('order:open', () => {
    modal.render({
        content: orderForm.render({
            payment: 'card',
            address: '',
            valid: false,
            errors: []
        })
    })
})

events.on(
    /^order\..*:change$/,
    (data: OrderField) => {
        appData.setOrderField(data.field, data.value);
    }
);

events.on(
    /^contacts\..*:change$/,
    (data: OrderField) => {
        appData.setOrderField(data.field, data.value);
    }
);

events.on('formErrors:change', (errors: Partial<OrderForm>) => {
    const { payment, address, email, phone } = errors;
    orderForm.valid = !payment && !address;
    contactsForm.valid = !email && !phone;
});

events.on('order:submit', () => {
    modal.render({
        content: contactsForm.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    })
});

events.on('contacts:submit', () => {

    api.orderProducts(appData.order)
        .then(result => {
            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => { modal.close() }
            })

            appData.clearBasket();

            modal.render({
                content: success.render(result)
            })
        })
        .catch(err => console.log(err));
})

api.getProductList()
    .then(appData.setItems.bind(appData))
    .catch(err => console.log(err));
