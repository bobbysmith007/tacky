var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;

var isA = function(o,type){
  if(o.constructor == type)return true;
  if(o.constructor == object) return false;
  return isA.call(this.constructor);
};

var randomInRange = function(max,min){
  if(!min)min=0;
  return Math.floor(Math.random()*(max+min))-min;
};
var TerrainTypes = ["road", "grass", "woods", "water", "hills", "rock" ];

var Cell = function(row, col, type, elevation){
  this.row=row, this.col = col;
  this.type = type;
  this.dom = this.dom.clone();
  this.dom[0].cell = this;
  this.dom.addClass(type);
};
Cell.prototype = {
  dom:$('<div class="cell"></div>'),
  stuff:null,
  unit:null,
  treadable:true
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

var Board = function(opts){
  opts = opts||{};
  this.dom = this.dom.clone(),
    this.nRows = opts.rows||10,
    this.nCols = opts.cols||10,
    this.rows = [];
  var me = this;
  this.addRow = function(r){
    this.rows.push(r); this.dom.append(r.dom);
  };
  var i,j,row,cell;
  for(i=0; i< this.nRows ;i++){
    row = new Row();
    for (j=0 ; j< this.nCols ;j++){
      row.addCell(new Cell(i,j,'grass'));
    }
    this.addRow(row);
  }
};
Board.prototype = {
  dom:$('<div class="board"></div>'),
  highlights:{}
};
Board.prototype.getCell = function(o){
  return this.rows[o.row].cells[o.col];
};
Board.prototype.doCells = function (fn, locations){
  var i,loc;
  for( i=0; loc = locations.indexes[i]; i++){
    var cell = this.getCell(loc);
    fn(cell);
  }
};
Board.prototype.highlight = function (name, locations){
  if(this.highlights[name])this.unhighlight(name);
  this.highlights[name] = locations;
  var i,loc;
  for( i=0; loc = locations.indexes[i]; i++){
    this.getCell(loc).dom.addClass(name+' highlight');
  }
};
Board.prototype.unhighlight = function (name){
  if(!this.highlights[name])return;
  $('.highlight.'+name).removeClass(name).removeClass('highlight');
  delete(this.highlights[name]);
};

var Index = function(row,col){
  this.row = row, this.col=col;
};
Index.prototype = { };
Index.prototype.toString = function(){ return this.row+','+this.col; };

var IndexSet = function(idxs){
  this.indexes = [];
  this.hash={};
};
IndexSet.prototype = { };
IndexSet.prototype.inSet = function(idx){ return this.hash[idx]; };
IndexSet.prototype.add = function(idx){
  if(!this.hash[idx]){
    this.indexes.push(idx);
    this.hash[idx]=idx;
  }
};

var Game = function(opts){
  this.init(opts);
  //this.controls = new MoveControls(this);
  //this.controls.bind();
};
Game.prototype = {
  teams:[],units:[],initiativeIdx:0,initiativeQueue:[],
  boardHolder:null
};

Game.prototype.init = function(opts){
  opts = opts||{};
  this.boardHolder = $(document.body);
  this.board = new Board(opts);
  this.boardHolder.append(this.board.dom);
};

Game.prototype.victoryCondition = function(){
  return false;
};
Game.prototype.failCondition = function(){
  return false;
};
Game.prototype.getCell = function(o){
  return this.board.getCell(o);
};
Game.prototype.addUnit = function(u){
  u.game = this;
  this.units.push(u);
  if(u.team){
    if(!this.teams[u.team]) this.teams[u.team] =[];
    this.teams[u.team].push(u);
  }
  u.move();
  this.initiativeQueue.push(u);
};

Game.prototype.findRandomEmptyLocation = function(){
  var cell;
  do cell = this.getCell({row:randomInRange(this.board.nRows),
			 cell:randomInRange(this.board.nCols)});
  while(cell.unit);
  return cell;
};

Game.prototype.scheduleNextTurn = function(){
  var game = this;
  window.setTimeout(function(){game.turn();}, 100);
};

Game.prototype.turn = function(){
  if (this.failCondition()) return game.announceFailure();
  else if(this.victoryCondition()) return game.announceVictory();

  var unit = this.initiativeQueue[this.initiativeIdx];
  if(unit.controller == HUMAN){
    this.controls.setCursor(unit);
    this.controls.setSelected(unit);
  }
  else{
    unit.aiTurn();
    this.scheduleNextTurn();
  }

  if((this.initiativeIdx+=1)>=this.initiativeQueue.length)
    this.initiativeIdx=0;

  return null;
};

Game.prototype.announceFailure = function(){
  alert('You lose');
};

Game.prototype.announceVictory = function(){
  alert('You win');
};



