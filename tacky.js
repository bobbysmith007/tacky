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
  $.extend(this, {
    teams:[],units:[],initiativeIdx:0,initiativeQueue:[],
    boardHolder:null
  });
};
Game.prototype = {};

Game.prototype.init = function(){
  this.uiHolder = $(document.body);
  this.UI = new UI(this, this.uiHolder);
};

Game.prototype.victoryCondition = function(){
  return false;
};
Game.prototype.failCondition = function(){
  return false;
};
Game.prototype.getCell = function(o){
  return this.UI.board.getCell(o);
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
  do cell = this.getCell({row:randomInRange(this.UI.board.nRows),
			 cell:randomInRange(this.UI.board.nCols)});
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




