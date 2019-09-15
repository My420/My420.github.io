(function () {
  'use strict';

  class Item {
    constructor(task, state = false) {
      this.task = task;
      this.state = state;
    }
  }

  class Store {
    constructor() {
      this.Item = Item;
      this.list = [];

      this.getListFromLocalStorage();
    }

    getListFromLocalStorage() {
      const list = localStorage.getItem(`toDoTaskList`);
      if (list) {
        this.list = JSON.parse(list);
      }
    }

    writeListInLocalStorage() {
      localStorage.setItem(`toDoTaskList`, JSON.stringify(this.list));
    }

    deleteItem() {
      const deleteItemNumber = [];
      const newList = this.list.filter((item, i) => {
        if (!item.state) {
          return true;
        } else {
          deleteItemNumber.push(i);
          return false;
        }
      });

      this.list = newList;
      this.writeListInLocalStorage();
      return deleteItemNumber;
    }

    addItem(text) {
      this.list.push(new this.Item(text));
      this.writeListInLocalStorage();
      return [this.list[this.list.length - 1], this.list.length - 1];
    }

    changeItemStatus(number, isComplete) {
      this.list[number].state = isComplete;
      this.writeListInLocalStorage();
    }

  }

  const mainProgramScreen = document.querySelector(`.tasks__list`);

  const cleanScreen = function () {
    while (mainProgramScreen.firstChild) {
      mainProgramScreen.removeChild(mainProgramScreen.firstChild);
    }
  };

  const showScreen = function (element, needCleanScreen = true) {
    if (needCleanScreen) {
      cleanScreen();
      mainProgramScreen.appendChild(element);
    } else {
      mainProgramScreen.appendChild(element);
    }
  };

  const template = {

    _chooseElementVisibility: function (element, sortType) {
      if (sortType === `#active` && element.state === true) {
        return `visually-hidden`;
      } else if (sortType === `#completed` && element.state === false) {
        return `visually-hidden`;
      } else {
        return ``;
      }
    },

    getElementTemplate: function (element, number, sortType) {

      return `<li class="tasks__item ${this._chooseElementVisibility(element, sortType)}" data-number="${number}">
            <input class="tasks__checkbox visually-hidden" id="${number}" type="checkbox" ${element.state ? `checked` : ``}>
            <label class="tasks__label" for="${number}"></label>
            <label class="tasks__text" for="${number}">${element.task}</label>
        </li>`;
    },

    getListTemplate: function (list, sortType) {
      return list.map((element, i) => {
        return this.getElementTemplate(element, i, sortType);
      }).join(``);
    },

    createElement: function (html) {
      const template = document.createElement(`template`);
      template.innerHTML = html;
      return template.content;
    }
  };

  class ListView {

    constructor() {
      this.appList = document.querySelector(`.tasks__list`);
      this.userInput = document.querySelector(`.input__field`);
      this.controls = document.querySelector(`.controls`);
      this.footerOpenBatton = document.querySelector(`.page-header__button`);
      this.footerCloseBatton = document.querySelector(`.page-footer__button`);
      this.footer = document.querySelector(`.page-footer`);
      this.bind();
    }

    bind() {
      this.userInput.addEventListener(`keydown`, (evt) => {this.onInputEnter(evt);});
      this.appList.addEventListener(`click`, (evt) => {this.onListClick(evt);});
      this.controls.addEventListener(`click`, (evt) => {this.onControlsClick(evt);});
      this.footerOpenBatton.addEventListener(`click`, (evt) => {this.changeFooterView(evt);});
      this.footerCloseBatton.addEventListener(`click`, (evt) => {this.changeFooterView(evt);});
    }

    render(list, sortType) {
      const element = template.createElement(template.getListTemplate(list, sortType));
      showScreen(element);
    }

    addItem(item, sortType) {
      const element = template.createElement(template.getElementTemplate(...item, sortType));
      element.querySelector(`li`).classList.add(`animation-add`);
      showScreen(element, false);
      setTimeout(() => {
        document.querySelector(`li[data-number='${item[1]}']`).classList.remove(`animation-add`);
      }, 1000);

      this.userInput.value = ``;
      this.userInput.blur();
    }

    deleteItem(item) {

      if (item.length === 0) {
        return new Promise((resolve, reject)=>{ return resolve(`deleted from page`)});
      } else {

        let promise = new Promise((resolve, reject) => {

          const deletedElements = item.map((elem) => {
            return document.querySelector(`li[data-number='${elem}']`);
          });

          deletedElements.forEach((elem) => {
            elem.classList.add(`animation-deleted`);
          });

          setTimeout(() => {
            resolve(`deleted from page`);
          }, 2000);

        });

        return promise;
      }
    }

    changeFooterView(evt) {
      this.footer.classList.toggle(`page-footer--close`);
    }

    onInputEnter(evt) {

    }

    onListClick(evt) {

    }

    onControlsClick(evt) {


    }

    onHashChange(sortType) {

    }

  }

  class Controller {
    constructor() {
      this.model = new Store();
      this.view = new ListView();
    }

    init() {

      location.hash = `all`;
      window.onhashchange = () => {
        this.onHashChange(location.hash);
      };

      this.view.render(this.model.list, location.hash);
      this.view.onInputEnter = this.onInputEnter.bind(this);
      this.view.onListClick = this.onListClick.bind(this);
      this.view.onControlsClick = this.onControlsClick.bind(this);
      this.view.onHashChange = this.onHashChange.bind(this);
    }

    onInputEnter(evt) {
      if (evt.keyCode === 13 && evt.target.value !== ``) {
        const task = evt.target.value;
        const newItem = this.model.addItem(task);
        this.view.addItem(newItem, location.hash);
      }
    }

    onListClick(evt) {
      if (evt.target.tagName === `INPUT`) {
        const number = +evt.target.id;
        const isChecked = evt.target.checked;
        this.model.changeItemStatus(number, isChecked);
      }
    }

    onControlsClick(evt) {
      if (evt.target.tagName === `BUTTON`) {

        const action = evt.target.dataset.action;

        if (action === `delete`) {

          evt.target.disabled = true;

          this.view.deleteItem(this.model.deleteItem()).then(() => {
            this.view.render(this.model.list, location.hash);
            evt.target.disabled = false;
          }).catch((error) => {
            this.view.render(this.model.list, location.hash);
            evt.target.disabled = false;
          });

        } else {
          const prevHash = location.hash.slice(1);
          location.hash = action;
          this._changeActiveSortButton(prevHash, evt.target);
        }
      }
    }

    _changeActiveSortButton(prevHash, newSortButton) {

      const prevSortButton = document.querySelector(`button[data-action=${prevHash}]`);

      prevSortButton.classList.remove(`controls__button--active`);
      newSortButton.classList.add(`controls__button--active`);
    }


    onHashChange(sortType) {

      this.view.render(this.model.list, location.hash);

    }

  }

  let controller = new Controller();

  controller.init();

}());

//# sourceMappingURL=main.js.map
