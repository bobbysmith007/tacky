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

var Unit = function(game, opts){
  opts=opts||{};
  this.dom = this.dom.clone();
  this.row=opts.row||0;
  this.col=opts.col||0;
  this.setFacing(opts.facing||RIGHT);
  this.team = opts.team;
  if(this.team) this.dom.addClass(this.team);
};

Unit.prototype = {
  dom: $('<div class="unit"></div>'),
  nextTurn: 0,
  speed: 10,
  moveRate: 4,
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
Unit.prototype.move = function(o){
  var cell;
  if(this.game){
    this.game.getCell(this).unit = null;
    this.dom.remove();
  }
  if( o )this.row = o.row, this.col = o.col;
  if(this.game){
    cell = this.game.getCell(this);
    cell.dom.append(this.dom);
    cell.unit = this;
  }
};

Unit.prototype.isAlly = function(other){
  console.log(this.team, other.team, this.team == other.team);
  return (this.team && other.team && this.team == other.team);
};

Unit.prototype.moveToPoss = function(){
  var locs = new IndexSet(), i,j,
    maxR = this.game.board.nRows-1,
    maxC = this.game.board.nCols-1,
    thisidx = new Index(this.row, this.col),
    me = this;

  function rec(idx, move){
    var newMove=move-1;
    var cell = this.game.getCell(idx);
    if(!cell.treadable) return; // cell is impassible
    if(cell.unit && move==0) return; // occupied cant end there
    if(cell.unit && !cell.unit.isAlly(me)) return; //cant move through enemies

    if(!cell.unit) locs.add(idx);
    if(move==0) return;
    if(idx.col>0) rec(new Index(idx.row,idx.col-1),newMove);
    if(idx.col<maxC) rec(new Index(idx.row,idx.col+1),newMove);
    if(idx.row>0) rec(new Index(idx.row-1,idx.col),newMove);
    if(idx.row<maxR) rec(new Index(idx.row+1,idx.col),newMove);
  }
  locs.add(thisidx);
  rec(thisidx,this.moveRate);
  return locs;
};

var Game = function(opts){
  opts = opts||{};
  this.board = new Board(opts);
  this.units = [];
  this.initiativeQueue = [];
  this.controls = new MoveControls(this);
  this.controls.bind();
};
Game.prototype = { };
Game.prototype.getCell = function(o){
  return this.board.getCell(o);
};
Game.prototype.addUnit = function(u){
  u.game = this;
  this.units.push(u);
  u.move();
};

Game.prototype.findRandomEmptyLocation = function(){
  var cell;
  do cell = this.getCell({row:randomInRange(this.board.nRows),
			 cell:randomInRange(this.board.nCols)});
  while(cell.unit);
  return cell;
};

Game.prototype.turn = function(){

};

var CreateGame = function (opts){
  var game = window.game = new Game(opts);
  $(document.body).append(game.board.dom);
  game.addUnit(new Unit(game,{row:0,col:0,team:"redteam"}));
  game.addUnit(new Unit(game,{row:1,col:0,team:"redteam"}));
  game.addUnit(new Unit(game,{row:6,col:5,team:"blueteam"}));
  game.controls.setCursor({row:0,col:0});

  var idxs = new IndexSet();
  for(var i=3; i<=12; i++){
    idxs.add(new Index(3,i));
    idxs.add(new Index(8,i));
  }
  idxs.add(new Index(4,5));
  idxs.add(new Index(5,5));
  idxs.add(new Index(7,5));


  game.board.doCells(function(c){
    c.dom.removeClass('grass');
    c.treadable=false;
    c.dom.addClass('rock');
  }, idxs);
};

$(window).ready(function(){
  CreateGame({rows:15,cols:20});});
