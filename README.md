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

#### Описание данных

##### Интерфейс IProduct

```
interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}
```

Интерфейс хранит данные о товаре, приходящие с сервера

##### Интерфейс IBasket

```
interface IBasket {
    items: string[];
    total: number;
}
```

Интерфес хранит данные, необъодимые для отображения товаров, находящихся в корзине

##### Интерфейс IOrder

```
interface IOrder {
    payment: 'cash' | 'card';
    email: string;
    phone: string;
    address: string;
    items: string[];
    total: number;
}
```

Интерфейс хранит данные, которые будут отправляться на сервер при оформлении заказа

##### Тип OrderType

```
type OrderForm = Omit<IOrder, 'total' | 'items'>;
```

Используется для хранения данных заказа при его оформлении через форму

##### Интерфейс IOrderResult

```
export interface IOrderResult {
    id: string;
    total: number;
}
```

Интерфейс, который хранит данные, полученные с сервера после оформления заказа
