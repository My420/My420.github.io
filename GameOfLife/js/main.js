(function () {
  'use strict';

  class Cell {
    constructor(row, col, alive = false) {
      this._row = row;
      this._col = col;
      this._alive = alive;
    }

    get row() {
      return this._row;
    }

    get col() {
      return this._col;
    }

    get isAlive() {
      return this._alive;
    }

    die() {
      this._alive = false;
    }

    live() {
      this._alive = true;
    }

  }

  class Grid {
    constructor(gridSize, random) {
      this.size = gridSize;

      this.create(random);
    }

    create(random = false) {
      this.cells = new Array(this.size);

      for (let r = 0; r < this.size; r++ ) {
        this.cells[r] = new Array(this.size);
        for (let c = 0; c < this.size; c++ ) {
          if (random) {
            if (Math.random() < 0.4) {
              this.cells[r][c] = new Cell(r, c, true);
            } else {
              this.cells[r][c] = new Cell(r, c, false);
            }
          } else {
            this.cells[r][c] = new Cell(r, c, false);
          }
        }
      }
    }

    _isNeigborAlive(row, col) {
      if (row === -1) {
        row = this.size - 1;
      } else if (row === this.size) {
        row = 0;
      }

      if (col === -1) {
        col = this.size - 1;
      } else if (col === this.size) {
        col = 0;
      }
      return this.cells[row][col].isAlive;
    }

    _countNeighbor(cell) {
      const row = cell.row;
      const col = cell.col;
      let neighbor = 0;
      if (this._isNeigborAlive(row-1, col-1)) { neighbor++;}    if (this._isNeigborAlive(row-1, col)) { neighbor++;}    if (this._isNeigborAlive(row-1, col+1)) { neighbor++;}    if (this._isNeigborAlive(row, col-1)) { neighbor++;}    if (this._isNeigborAlive(row, col+1)) { neighbor++;}    if (this._isNeigborAlive(row+1, col-1)) { neighbor++;}    if (this._isNeigborAlive(row+1, col)) { neighbor++;}    if (this._isNeigborAlive(row+1, col+1)) { neighbor++;}
      return neighbor;
    }

    mutate() {
      let newGrid = new Grid(this.size);

      for (let r = 0; r < this.size; r++ ) {
        for (let c = 0; c < this.size; c++ ) {
          let cell = this.cells[r][c];
          let newCell = newGrid.cells[r][c];
          let neighbor = this._countNeighbor(cell);

          if (cell.isAlive) {
            if (neighbor < 2) {
              newCell.die();
            } else if (neighbor > 3) {
              newCell.die();
            } else {
              newCell.live();
            }
          } else {
            if (neighbor === 3) {
              newCell.live();
            } else {
              newCell.die();
            }
          }
        }
      }
      this.cells = newGrid.cells;
    }

    changeCell(row, col) {
      const cell = this.cells[row][col];
      if (cell.isAlive) {
        cell.die();
      } else {
        cell.live();
      }
    }
  }

  class GameView {
    constructor() {
      this._cell = document.createElement(`div`);
      this.gameField = document.querySelector(`.field`);
      this.speedField = document.querySelector(`.controls__output`);
    }

    createCell(row, col, isAlive) {
      let newCell = this._cell.cloneNode(true);
      newCell.setAttribute(`data-row`, `${row}`);
      newCell.setAttribute(`data-col`, `${col}`);
      if (isAlive) {
        newCell.className = `field__cell field__cell--alive`;
      } else {
        newCell.className = `field__cell`;
      }
      return newCell;
    }

    changeSpeed(speed) {
      this.speedField.innerHTML = `${speed}ms`;
    }

    render(grid) {
      this.gameField.innerHTML = ``;
      const fragment = document.createDocumentFragment();

      for (let r = 0; r < grid.length; r++ ) {
        for (let c = 0; c < grid.length; c++ ) {
          fragment.appendChild(this.createCell(r, c, grid[r][c]._alive));
        }
      }
      this.gameField.appendChild(fragment);
    }
  }

  const view = new GameView();

  class Game {
    constructor(gridSize, speed, random) {
      this.grid = new Grid(gridSize, random);
      this.gridSize = gridSize;
      this._timerId = undefined;
      this._speed = speed;
      this._currentSpeed = this._speed;
    }

    oneStep() {
      this.grid.mutate();
      this.changeView();
    }

    play() {
      this._timerId = setInterval(() => {
        this.grid.mutate();
        this.changeView();
      }, this._currentSpeed);
    }

    changeCellStatus(row, col) {
      this.grid.changeCell(row, col);
      this.changeView();
    }

    stop() {
      if (this._timerId) {
        clearInterval(this._timerId);
      }
    }

    resetSpeed() {
      this._currentSpeed = this._speed;
    }

    clear() {
      this.resetSpeed();
      this.stop();
      this.grid = new Grid(this.gridSize, false);
      this.changeView();
      view.changeSpeed(this._currentSpeed);
    }

    random() {
      this.stop();
      this.grid = new Grid(this.gridSize, true);
      this.changeView();
    }

    _speedUp() {
      if (this._currentSpeed !== 100) {
        this._currentSpeed -= 100;
      }
    }

    _speedDown() {
      if (this._currentSpeed !== 1000) {
        this._currentSpeed += 100;
      }
    }

    changeSpeed(direction) {
      this.stop();
      if (direction === `up`) {
        this._speedUp();
      } else if (direction === `down`) {
        this._speedDown();
      }
      view.changeSpeed(this._currentSpeed);
      this.play();
    }

    changeView() {
      view.render(this.grid.cells);
    }
  }

  class Settings {
    constructor() {
      this._field = document.querySelector(`.page_main`);
      this.size = 20;
      this.speed = 400;
      this.random = true;
    }

    calcSize() {
      let width = getComputedStyle(this._field).width;
      width = +width.slice(0, 3);
      if (width < 640) {
        this.size = 20;
      } else if (width < 920) {
        this.size = 32;
      } else {
        this.size = 40;
      }
    }
  }

  const setting = new Settings();
  setting.calcSize();
  const game = new Game(setting.size, setting.speed, setting.random);

  class GameController {
    constructor() {
      this._gameField = document.querySelector(`.field`);
      this._gameControls = document.querySelector(`.controls`);
      this._wikiLink = document.querySelector(`.page_header__link`);
      this._link = `https://ru.wikipedia.org/wiki/%D0%98%D0%B3%D1%80%D0%B0_%C2%AB%D0%96%D0%B8%D0%B7%D0%BD%D1%8C%C2%BB`;
      this._nextStepButton = document.querySelector(`.controls__button[data-action=oneStep]`);
      this._playButton = document.querySelector(`.controls__button[data-action=start]`);
      this._speedUpButton = document.querySelector(`.controls__button[data-action=speedUp]`);
      this._speedDownButton = document.querySelector(`.controls__button[data-action=speedDown]`);
    }

    _findCellNumber(evt) {
      return [+evt.target.dataset.row, +evt.target.dataset.col];
    }

    _setFirstOptionList() {
      this._playButton.disabled = true;
      this._nextStepButton.disabled = true;
      this._speedUpButton.disabled = false;
      this._speedDownButton.disabled = false;
    }

    _setSecondOptionList() {
      this._playButton.disabled = false;
      this._nextStepButton.disabled = false;
      this._speedUpButton.disabled = true;
      this._speedDownButton.disabled = true;
    }

    _onButtonClick(button) {
      switch (button) {
        case `start`:
          game.play();
          this._setFirstOptionList();
          break;
        case `oneStep`:
          game.oneStep();
          break;
        case `pause`:
          game.stop();
          this._setSecondOptionList();
          break;
        case `reset`:
          game.clear();
          this._setSecondOptionList();
          break;
        case `random`:
          game.random();
          this._setSecondOptionList();
          break;
        case `speedUp`:
          game.changeSpeed(`up`);
          break;
        case `speedDown`:
          game.changeSpeed(`down`);
          break;
      }
    }

    init() {
      this._gameControls.addEventListener(`click`, (evt) => { if (evt.target.dataset.action) { this._onButtonClick(evt.target.dataset.action); }});
      this._gameField.addEventListener('click', (evt) => { game.changeCellStatus(...this._findCellNumber(evt)); });
      this._wikiLink.addEventListener('click', (evt) => { evt.preventDefault(); window.open(this._link); });
      game.changeView();
    }
  }

  const controller = new GameController();

  controller.init();

}());

//# sourceMappingURL=main.js.map
