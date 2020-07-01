# React Widgets

React Widgets позволяет работать с React компонентами в смешанном стиле - функционально-объектном. 

Фреймворк не предоставляет свой набор компонентов. Он дает модель и паттерны, позволяющие абстрагировать любую React библиотеку компонентов.

В основе фреймворка лежит следующий принцип.

**Виджет** - это объект, а не функция или класс.
 
Виджеты существуют, имеют свой жизненный цикл, API по управлению и состояние.

---

## Виджеты можно разделить на два типа:

### Простые

Простые виджеты без конфигурации. Их рендеринг не зависит от значений, такие виджеты будут всегда
 рендерится при вызове render метода.

### Управляемые

Управляемые виджеты с конфигурацией и API. Управляемые виджеты будут рендерится только в следующих случаях: 
1. вызов notify метода
2. вызов continue метода или завершение lock метода
3. изменение свойства в конфигурации

Управляемые виджеты позволяют контролировать рендер компонента извне посредством API функций.

Дополнительно - рендер можно "приостановить" или "заблокировать" с помощью функций:
* `pause`
* `continue`
* `lock`  
  
В момент блокировки изменения свойств не вызовут рендеринг компонента. Тем самым становится возможным отобразить изменение группы свойств за одну операцию рендера 


---

Фреймворк предоставляет следующий набор паттернов:

## ArrayCache

Идея паттерна - кеш для массива. 

Паттерн представляет собой функцию со следующим поведением:

1. Первый вызов - инициализация массива на основе фабрики
2. Следующие вызовы - возвращение созданного массива 

## Conditional

Идея паттерна - условный рендеринг.

Паттерн представляет собой виджет со следующим поведением:

1. Если условие истинно - выполнится рендер виджета переданного в функции `widget`, `cache`, `persist`
2. Иначе - выполнится рендер виджета `else`

## Configurable
Паттерн является базовым классом для конфигураций управляемых виджетов.

Конфигурации - набор свойств, а также контейнеры для React Hooks.


## Configurator
Паттерн является базовым интерфейсом для виджетов-конфигураторов.

## Deferred

Идея паттерна - отложенный рендеринг.

Паттерн позволяет отложить создание React компонента до момента своего вызова. 
Дополнительно - паттерн использует useMemo хук для предотвращения лишних вызовов рендера.

## Event

Идея паттерна - передача событий.

События могут быть обработаны `handle` и вызваны `execute`

## HookContainer

Идя паттерна - хранилище для React Hooks.

Паттерн позволяет обращаться к хукам до момента их выполнения.

Используется в тех случаях, когда необходимо обратиться к хуку на этапе создания или настройки виджета (до момента фактического рендера виджета и вызова хуков). Например, нам нужно повесить обработчик события клика на дочерний виджет, а в обработчике обратиться к хуку. 

## Hooked

Паттерн позволяет создать виджет, который будет иметь доступ к результатам выполнения React Hooks. 
Hooked виджеты инициализируются после выполнения хуков. 

Методы регистрации виджета:

* persist - виджет будет создан один раз и при изменении хука не будет пересоздаваться
* cache - виджет будет пересоздаваться, если значение хука не соответствует предыдущему
* widget - виджет будет пересоздаваться при каждом выполнении хука


## Immutable

Паттерн - обертка над useMemo, задающий пустой массив в качестве зависимости

## Lazy

Идея паттерна - отложенная инициализация.

## Lifecycle

Паттерн используется для управления жизненный циклом компонента.

## Observable

Паттерн - инвертирующий использование хука useMemo.

`observe` - принимает на вход набор объектов, использующихся в качестве зависимостей useMemo.

`render` - вызывается при срабатывании useMemo

## Optional
Идея паттерна - опциональный рендеринг.

Паттерн представляет собой виджет со следующим поведением:

1. При вызове spawn - виджет создается и рендерится
2. При вызове destroy - виджет уничтожается 

## Property

Идея паттерна - контролируемое свойство.

Паттерн предоставляет обертку над полем/свойством виджета.

Основной функционал:

* `get` - получение значения
* `set/=` - изменение значения
* `consume` - подписка на изменение
* `prevent` - предотвращение изменения
* `clear` - очистка 
* `cleared` - подписка на очистку

Дополнительной особенностью паттерна является проверка значения на изменения.

Если новое значение свойство deep-equals предыдущему, то изменений не произойдет. 
 
## Render

Идея паттерна - фабричный рендеринг.

Паттерн является универсальным компонентом для рендера компонентов - функций.

На вход передается фабрика компонента и вызов функции произойдет в момент mount-а Render компонента.

## Stream

Идея паттерна - поток событий по сущностям.

Паттерн позволяет обрабатывать три операции по произвольным сущностям:

* `add` - сущность добавления
* `update` - сущность обновления
* `delete` - сущность изменена

## Subscribe

Паттерн - обертка над useEffect с пустым массивом в качестве зависимостей

## Synchronizer

Идея паттерна - синхронизация множества действий с отложенным результатом

## When

todo...

## Trigger

todo...

---

На текущий момент фреймворк поддерживает следующие библиотеки компонентов:

* Material UI

Планируется поддержка:

* Ant
* Semantic UI 
