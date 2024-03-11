export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

// Этот интерфейс хранится у нас, его мы можем расширить и т.д.
export interface IBasket {
    // Передаются именно строки, а не объекты карточек потому что
    // нам не нужна лишняя информация, получить доступ к карточке мы можем и по ID 
    items: string[];
    total: number;
}

export type PaymentMethod = 'cash' | 'card'

// А этот интерфейс используется для отправки данных на сервер
// Поэтому эти два интрефейса разделены и не связаны меж собой
export interface IOrder {
    payment: PaymentMethod;
    email: string;
    phone: string;
    address: string;
    items: string[];
    total: number;
}

export type OrderForm = Omit<IOrder, 'total' | 'items'>;

// Этот интерфейс получает данные с сервера после оформления заказа (итоговый попап с завершением заказа)
export interface IOrderResult {
    id: string;
    total: number;
}