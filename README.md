# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```

### IEvents

Интерфейс для работы с событиями. Поддерживает подписку на события и их эмитацию.

```ts
export interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
```

### Класс Component

Класс, содержащий в себе методы для работы с DOM.

### Класс View

Дочерний класс от класса `Component`. Содержит в себе все родительские методы. Единственное отличие в том, что в него добавлен `IEvents` для эммита событий.

### Класс AppData

Агрегирует в себе все необходимые объекты, такие как список продуктов, корзину, заказ, превью для продукта, методы для работы с полями формы заказа, методы для взаимодействия с корзиной.

# Описание данных

### IProduct

Интерфейс `IProduct` исползуется для хранения данных о продукте, приходящие с сервера.

```ts
export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}
```

### IBasket

Интерфейс `IBasket` исползуется для хранения данных, необходимых для отображения товаров, находящихся в корзине.

```ts
export interface IBasket { 
    items: string[];
    total: number;
}
```

### IOrder

Интерфейс `IOrder` исползуется для хранения данных, которые будут отправляться на сервер при оформлении заказа.

```ts
export interface IOrder {
    payment: 'cash' | 'card';
    email: string;
    phone: string;
    address: string;
    items: string[];
    total: number;
}
```
### OrderType

Тип `OrderType` используется для хранения данных заказа при его оформлении через форму.

```ts
export type OrderForm = Omit<IOrder, 'total' | 'items'>;
```

### IOrderResult

Интерфейс `IOrderResult` используется для хранения данных полученных с сервера после оформления заказа.


```ts
export interface IOrderResult {
    id: string;
    total: number;
}
```

### IWebLarekAPI 

Интерфейс для работы с API.

```ts
export interface IWebLarekAPI {
    getProductList: () => Promise<IProduct[]>;
    getProductItem: (id: string) => Promise<IProduct>;
    orderProducts: (order: IOrder) => Promise<IOrderResult>;
}
```

### IPage

Интерфейс для управления самой web-страницей.

```ts
interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}
```

### IModalData

Интерфейс содержимого модального окна.

```ts
interface IModalData {
    content: HTMLElement;
}
```

### ICardActions

Интерфейс обработчика событий `onClick` для карточек на странице. Используется для того, чтобы устанавливать различное поведение по нажатию на карточки.

```ts
interface ICardActions {
    onClick: (event: MouseEvent) => void;
}
```

# Модели данных

### Класс AppData

В этом классе агрегируются все основные объекты предметной области, такие как: список продуктов, корзина, превью для продукта, данные о заказе. Помимо этого класс реализует методы для управления этими объектами, например: очистка корзицы, удаление одного элемента из корзины, установка продуктового списка, установка превью для продукта, установка метода оплаты, установка данных заказа, валидация формы заказа.

### Класс Modal 

Реализует методы для взаимодействия с модальным окном: установить контент, открыть или закрыть модальное окно, зарендерить окно на странице.
Является дочерним классом от класса `View` т.к. его методы будут эммитить определённые события, например "modal:open" и т.д.
 
### Класс Card

Класс для заполнения html-шаблона карточки данными о продукте и привязывания к карточке обработчиков собития `onClick`.
Наследуется от класса `Component` с `IProduct` дженериком

### Класс Page

Класс для управления страницей: взаимодействие с корзиной, установка каталога продуктов, блокировка страницы (при открытии модального окна и т.п.)
Наследуется от класса `View` с `IPage` дженериком. Данное наследование обусловлено навешиванием на корзину (внутри конструктора этого класса) обработчика события `onClick` который будет эммитить событие `basket:open` при открытии корзины.