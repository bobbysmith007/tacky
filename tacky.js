var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;

var randomInRange = function(max,min){
  if(!min)min=0;
  return Math.floor(Math.random()*(max+min))-min;
};
var TerrainTypes = ["road", "grass", "woods", "water", "hills" ];

var Cell = function(row, col, type, elevation){
  this.row=row, this.col = col;
  this.type = type;
  this.dom = this.dom.clone();
  this.dom.addClass(type);
  this.stuff = null;
};
Cell.prototype = {
  dom:$('<div class="cell"></div>')
};

var Row = function (){
  this.dom = this.dom.clone();
  this.cells=[];
  var me = this;
  this.addCell=function(c){me.cells.push(c); me.dom.append(c.dom);};
};
Row.prototype = {
  dom:$('<div class="row"></div>')
};

var Board = function(nCols, nRows){
  this.dom = this.dom.clone(),
    this.nRows = nRows,
    this.nCols = nCols,
    this.rows = [];
  var me = this;
  this.addRow = function(r){
    this.rows.push(r); this.dom.append(r.dom);
  };
  var i,j,row,cell;
  for(i=0; i< nRows ;i++){
    row = new Row();
    for (j=0 ; j< nCols ;j++){
      row.addCell(new Cell(i,j,'grass'));
    }
    this.addRow(row);
  }
};
Board.prototype = {
  dom:$('<div class="board"></div>')
};


var Unit = function(game, opts){
  opts=opts||{};
  this.dom = this.dom.clone();
  this.row=opts.row||0;
  this.col=opts.col||0;
  this.setFacing(opts.facing||RIGHT);
};

Unit.prototype = {
  dom: $('<div class="unit"></div>'),
  nextTurn: 0,
  speed: 10,
  facing: UP,
  control: "HUMAN"
};

Unit.prototype.setFacing = function (f){
  this.facing = f;
  this.dom.removeClass('fup fdown fleft fright').addClass(
   f==UP?"fup":
   f==DOWN?"fdown":
   f==RIGHT?"fright":"fleft");
};

var Game = function(){
  this.board = new Board(10,10);
  this.units = [];
  this.initiativeQueue = [];
  this.controls = new Controls(this);
};
Game.prototype = { };
Game.prototype.getCell = function(o){
  return this.board.rows[o.row].cells[o.col];
};
Game.prototype.addUnit = function(u){
  this.units.push(u);
  this.getCell(u).dom.append(u.dom);
};
Game.prototype.findRandomEmptyLocation = function(){
  var cell;
  do cell = this.getCell({row:randomInRange(this.board.nRows),
			 cell:randomInRange(this.board.nCols)});
  while(cell.stuff);
  return cell;
};

var CreateGame = function (opts){
  var game = window.game = new Game(opts);
  $(document.body).append(game.board.dom);
  game.addUnit(new Unit(game));
  game.controls.setSelected({row:1,col:2});
};

$(window).ready(function(){CreateGame();});
