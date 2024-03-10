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

## Архитектура приложения

В данном приложении используется паттерн MVP. Кодовая база разделена на 3 слоя:
- Слой данных (Model). Работает с данными (хранение и изменение)
- Слой представлений. Отвечает за отображение данных из модели
- Презентер. Служит прослойкой между моделью и представлением

### Базовый слой

#### Класс Component

Базовый класс для отображения HTML компонента на странице.
Принимает дженерик с типом `T`, который используется в методе `render` для отображения.
```ts
abstract class Component<T> {
    protected constructor(protected readonly container: HTMLElement);

    // Переключить класс
    toggleClass(element: HTMLElement, className: string, force?: boolean);

    // Установить текстовое содержимое
    protected setText(element: HTMLElement, value: unknown);

    // Сменить статус блокировки
    setDisabled(element: HTMLElement, state: boolean);

    // Скрыть
    protected setHidden(element: HTMLElement);

    // Показать
    protected setVisible(element: HTMLElement);

    // Установить изображение с алтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string);

    /*
        Главный метод класса.
        Принимает данные, которые необходимо отобразить в HTML компоненте, записывает их в поля класса и возвращает ссылку на DOM-элемент
    */
    render(data?: Partial<T>): HTMLElement;
}
```

#### Класс View

Дочерний класс от класса `Component`. Реализует те же методы, что и родитель. Единственным отличием является наличие внутри класса брокера событий `IEvents`

```ts
class View<T> extends Component<T> {
    constructor(protected readonly events: IEvents, container: HTMLElement);
}
```

#### Класс Api

Класс с базовой логикой отправки запросов. Конструктор принимает базовый адрес сервера и опциональный объект с заголовками запросов.

```ts
class Api {
    readonly baseUrl: string;
    protected options: RequestInit;

    constructor(baseUrl: string, options: RequestInit = {});

    // Проверка ответа от сервера на наличие ошибок
    protected handleResponse(response: Response): Promise<object>;

    // Выполняет GET-запрос на эндпоинт `uri` и возвращает промис
    get(uri: string);

    /*
        Выполняет POST-запрос на эндпоинт `uri` и возвращает промис.
        Принимает данные, которые будет отправлены в JSON теле запроса.
        Метод POST является методом по умолчанию, он может быть переопределён
    */
    post(uri: string, data: object, method: ApiPostMethods = 'POST');
}
```

#### Класс EventEmmiter

Брокер событий, реализующий паттерн "Наблюдатель". Позволяет отправлять события и подписываться на них. Используется для связи слоя данных и представлений.

```ts
interface IEvents {
    // Подписка на событие
    on<T extends object>(event: EventName, callback: (data: T) => void): void;

    // Инициализация события
    emit<T extends object>(event: string, data?: T): void;

    // Возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
}
```

### Описание данных

#### IProduct

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

#### IBasket

Интерфейс `IBasket` исползуется для хранения данных, необходимых для отображения товаров, находящихся в корзине.

```ts
export interface IBasket { 
    items: string[];
    total: number;
}
```

#### IOrder

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
#### OrderType

Тип `OrderType` используется для хранения данных заказа при его оформлении через форму.

```ts
export type OrderForm = Omit<IOrder, 'total' | 'items'>;
```

#### IOrderResult

Интерфейс `IOrderResult` используется для хранения данных полученных с сервера после оформления заказа.


```ts
export interface IOrderResult {
    id: string;
    total: number;
}
```

#### IPage

Интерфейс для управления самой web-страницей.

```ts
interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}
```

#### IModalData

Интерфейс содержимого модального окна.

```ts
interface IModalData {
    content: HTMLElement;
}
```

#### ICardActions

Интерфейс обработчика событий `onClick` для карточек на странице. Используется для того, чтобы устанавливать различное поведение по нажатию на карточки.

```ts
interface ICardActions {
    onClick: (event: MouseEvent) => void;
}
```

### Классы представления

Классы слоя представлений служат для отображения внутри HTML контейнера передаваемых в них данных. Наследуются от класса `Component` или от класса `View`

#### Класс Basket

Отвечает за отображения корзины с товарами.

```ts
class Basket extends View<IBasketView> {

    static template: HTMLTemplateElement;

    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLElement;

    constructor(protected events: EventEmitter);

    // Установка списка товаров
    set items(items: HTMLElement[]);

    // Установка итоговой цены
    set total(price: number);
}
```

#### Класс Form

Базовый класс, отвечающий за работу с формами. Обрабатывает события ввода данных в поля форм и генерирует при этом события. Генерирует событие при отправке формы.

```ts
export class Form<T> extends View<IFormState> {
    protected _submit: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(protected events: EventEmitter, protected container: HTMLFormElement);

    /*
        Генерация событий при изменении в полях формы, например:
        - `contacts:submit` - событие, генерируемое при отправке формы с контактными данными
        - `order:submit` - событие, генерируемое при отправке формы со способом платежа и адреса
    */
    protected onInputChange(field: keyof T, value: string);

    // Валидация формы
    set valid(value: boolean);

    // Установка ошибок формы
    set errors(value: string);

    // Формирование ссылки на DOM-элемент формы
    render(state: Partial<T> & IFormState);
}
```

#### Классы Contacts и Order

Наследуются от класса `Form` и добавляют управление отображением элементов формы - полей ввода и переключателя способа оплаты для формы `Order`

```ts
class Contacts extends Form<OrderForm> {
    constructor(events: EventEmitter, container: HTMLFormElement);

    set email(value: string);

    set phone(value: string);
}

class Order extends Form<OrderForm> {

    protected _paymentCard: HTMLButtonElement;
    protected _paymentCash: HTMLButtonElement;

    constructor(events: EventEmitter, container: HTMLFormElement);

    set payment(value: PaymentMethod);

    set address(value: string);
}
```

#### Класс Modal

Класс реализует модальное окно, в котором отображается содержимое поля `content`.

```ts
class Modal extends View<IModalData> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;

    constructor(events: IEvents, container: HTMLElement);

    set content(value: HTMLElement);

    open();

    close();

    render(data: IModalData): HTMLElement;
```

#### Класс Success

Отвечает за отображение содержимого окна успешного выполнения заказа.

```ts
interface ISuccess {
    total: number;
}

interface ISuccessActions {
    onClick: () => void;
}

class Success extends Component<ISuccess> {
    protected _close: HTMLElement;
    protected _description: HTMLElement;

    constructor(container: HTMLElement, actions: ISuccessActions);

    set total(value: number);
}
```

#### Класс Card

Класс, отображающий информацию о товаре, заполняя в карточке товара сообветствующие поля. Используется для отображения карточки товара в различных частях приложения:
- в каталоге
- в модальном окне товара
- в спике товаров в корзине
В конструктор передаётся DOM-элемент, созданный на основе HTML шаблона.
Генерирует событие `card:select` при клике по карточке товара в каталоге или в корзине.

```ts
class Card extends Component<IProduct> {
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _price: HTMLElement;
    protected _category?: HTMLElement; 
    protected _description?: HTMLElement;
    protected _button?: HTMLButtonElement;

    constructor(
        container: HTMLElement,
        actions?: ICardActions
    );

    set id(value: string);

    get id(): string;

    set title(value: string);

    get title(): string;

    get price(): string;

    set price(value: string);

    get category(): string;

    set category(value: string);

    set image(value: string);

    set description(value: string);

    set button(value: string);
}
```

#### Класс Page

Класс для отображения главной страницы:
- каталог товаров
- счётчик корзины
- блокировка скрола при открытии модального окна
Генерирует событие `basket:open` при клике на иконку корзины.

```ts
class Page extends View<IPage> {
    protected _counter: HTMLElement;
    protected _catalog: HTMLElement;
    protected _wrapper: HTMLElement;
    protected _basket: HTMLElement;


    constructor(events: IEvents, container: HTMLElement);

    set counter(value: number);

    set catalog(items: HTMLElement[]);

    set locked(value: boolean);
}
```

### Модель данных

За хранение данных и реализациб логики работы с ними отвечает класс `AppData`. Класс содержит:
- массив товаров каталога
- товар, открытый в модальном окне
- массив товаров корзины
- общая стоимость товаров корзины
- данные заказа, введённые в форме
- данные валидации форм

В конструкторе принимает экземпляр брокера событи и генерирует события:
- `items:change` - изменение массива товаров каталога
- `preview:change` - изменение открываемого в модальном окне товара
- `basket:change` - изменение списка товаров корзины
- `formErrors:change` - изменение ошибки валидации форм

```ts
class AppData {
    items: IProduct[];
    basket: IBasket;
    preview: IProduct;
    order: IOrder;

    formErrors: Partial<Record<keyof OrderForm, string>>;

    constructor(protected readonly events: IEvents);

    clearBasket();

    inBasket(item: IProduct): boolean;

    addToBasket(item: IProduct);

    removeFromBasket(item: IProduct);

    setItems(items: IProduct[]);

    setPreview(item: IProduct);

    setPaymentMethod(value: PaymentMethod);

    setOrderField(field: keyof OrderForm, value: string);

    validateOrder();
}
```

### Класс WebLarekApi

Класс для работы с API. Наследуется от класса `Api`. 
 
```ts 
class WebLarekAPI extends Api implements IWebLarekAPI {
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit);

    getProductList(): Promise<IProduct[]>;

    getProductItem(id: string): Promise<IProduct>;

    orderProducts(order: IOrder): Promise<IOrderResult>;

}
``` 

## Презентер

Код взаимодействия слоя представлений и моделей данных найходится в `index.ts`. Взаимодействие реализуется через отслеживание событий.
Сначала создаютсяэкземпляры всех необходимых классов, а затем настраивается обработка событий

Для эмита событий используется класс `EventEmitter` который реализует интерфейс `IEvents`

### Описание событий

#### Событие modla:open

Блокиреуем `Page` при открытии модального окна.

#### Событие modla:close

Снимаем блокировку `Page` при закрытии модального окна

#### Событие items:change

Сигнализирует о том, что список предметов для отображения на главной странице изменился. Рендерим измененный список карточек предметов на главной странице.

#### Событие card:select

Карточка добавляется в модели данных `Page` в поле preview как 'выбранная'. После чего вызывается событие 'preview:change'.

#### Событие preview:change

Реагируем на изменение 'выбранной' карточки и рендерим её на странице.

#### Событие basket:open

Добавляем карточку корзины в модели данных `Page` в поле preview как 'выбранная'. После чего вызывается событие 'preview:change'.

#### Событие basket:change

Сигнализирует о том, что список предметов корзины изменился. Рендерим изменённый список предметов корзины и счётчик предмеов.

#### Событие order:open

Нажали на кнопку оформления заказа. Показываем форму с выбором метода оплаты и указанием адреса.

#### Событие /^order\..*:change$/

Изменились данные в форме оформления заказа. Сохраняем обновлённые данные заказа и валидируем форму.

#### Событие /^contacts\..*:change$/

Изменились данные в форме заполнения контактных данных для заказа. Сохраняем обновлённые данные заказа и валидируем форму.

#### Событие formErrors:change

Изменились ошибки валидации форм `Order` и `Contacts`. Проверяем валидны ли поля для каждой из форм и блокируем/разблокируем кнопку сабмита формы.

#### Событие order:submit

Данные на форме оформления заказа введены корректно, кнопка сабмита активна и на неё нажали. Рендерим форму с заполнением контактных данных.

#### Событие contacts:submit

Данные на форме с контактными данными введены корректно, кнопка сабмита активна и на неё нажали. Рендерим модальное окно с завершением оформления заказа.
