
var TerrainTypes = {};
var addTerrainType=function(name, moveRate){
  TerrainTypes[name]={name:name, moveRate:moveRate};
};
addTerrainType("road", 2);
addTerrainType("grass", 1);
addTerrainType("woods", .5);
addTerrainType("hills", .5);
addTerrainType("swamp", .25);
addTerrainType("water", 0);
addTerrainType("rock", 0);

var UIElement = function(game, opts){};
UIElement.prototype = { typeName:'UIElement' };

UIElement.prototype.init = function (){
  // console.log('UIElement init');
  if(this.dom) this.dom = this.dom.clone();
};

var Cell = function(row, col, type, elevation){
  $.extend(this, {row:row,col:col,type:type});
  this.init();
  this.dom[0].cell = this;
  this.dom.addClass(type);
};

Cell.prototype = $.extend(new UIElement(), {
  dom:$('<div class="cell"></div>'),
  stuff:null,
  unit:null
}) ;

Cell.prototype.setType=function(type){
  this.dom.removeClass().addClass('cell').addClass(type);
  this.type = type;
};

Cell.prototype.moveRate=function(){
  return TerrainTypes[this.type].moveRate;
};

var Row = function (){
  this.init();
  this.cells=[];
  var me = this;
  this.br=$('<div class="kill-float"></div>');
  this.dom.append(this.br);
};

Row.prototype = $.extend(new UIElement(), {
  dom:$('<div class="row"></div>')
});
Row.prototype.addCell=function(c){
  this.cells.push(c);
  this.br.before(c.dom);
};

var Board = function(game){
  $.extend(this, {
    nRows:game.nRows||10,
    nCols:game.nCols||10, game:game,
    highlights:{}, rows:[]});
  this.init();
};
Board.prototype = $.extend(new UIElement(), {
  dom:$('<div class="board"></div>')
});
Board.prototype.init = function(){
  UIElement.prototype.init.call(this);
};
Board.prototype.buildBoard=function(){
  var i,j,row,cell;
  for(i=0; i< this.nRows ;i++){
    row = new Row();
    for (j=0 ; j< this.nCols ;j++){
      row.addCell(new Cell(i,j,'grass'));
    }
    this.addRow(row);
  }
};
Board.prototype.addRow=function (r){
  this.rows.push(r);
  this.dom.append(r.dom);
  r.dom.width(r.cells.length*(r.cells[0].dom.width()+4));
};


Board.prototype.getCell = function(o){
  return this.rows[o.row].cells[o.col];
};
Board.prototype.doCells = function (fn, locations){
  var i,loc, them=locations;
  if(locations.indexes) them=locations.indexes;
  for( i=0; loc = them[i]; i++){
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

var StatusPanel = function(game){
  this.game=game;
  if(game) this.init(game);
};
StatusPanel.prototype = $.extend(new UIElement(), {
  dom:$('<div class="status"></div>')
});

StatusPanel.prototype.update = function(o){
  this.dom.empty();
  if(o && o.buildStats) this.dom.append(o.buildStats());
};

var TerrainPanel = function(game){
  this.game=game;
  if(game) this.init(game);
};
TerrainPanel.prototype = $.extend(new UIElement(), {
  dom:$('<div class="terrain"></div>')
});

TerrainPanel.prototype.update = function(o){
  var c = this.game.UI.cursor;
  this.dom.empty();
  if(c)
    this.dom
      .append($('<span class="coords"></span>')
	.addClass(c.type).html('<'+c.row+','+c.col+'>'))
      .append($('<span class="name"></span>')
	.addClass(c.type).html(c.type))
      .append($('<span class="moveRate"></span>')
	.html('Move: '+c.moveRate()));
};


var InitiativePanel = function(game){
  this.game=game;
  if(game) this.init(game);
};
InitiativePanel.prototype = $.extend(new UIElement(), {
  dom:$('<div class="initiative"></div>')
});

InitiativePanel.prototype.update = function(){
  this.dom.empty();
  var i = this.game.initiativeIdx;
  var cnt = 3, unit;
  var ctl;
  while (cnt-- >0){
    while((unit = this.game.initiativeQueue[i])){
      i++;
      this.dom.append(unit.buildHeading());
    }
    i=0;
    while(i<this.game.initiativeIdx
	  && (unit = this.game.initiativeQueue[i])){
      i++;
      this.dom.append(unit.buildHeading());
    }
  }
};

var UI = function(game, uiHolder){
  this.init(game, uiHolder);
};
UI.prototype = {};
UI.prototype.init = function(game, uiHolder){
  this.game = game, this.uiHolder = uiHolder;
  this.board = new Board(game);
  this.initiative = new InitiativePanel(game);
  this.status = new StatusPanel(game);
  this.terrain = new TerrainPanel(game);
  this.uiHolder.append(this.board.dom)
    .append(this.initiative.dom)
    .append(this.status.dom)
    .append(this.terrain.dom);

  this.board.buildBoard();
};

UI.prototype.scrollCursorIntoView = function(){
  var c= this.cursor, b=this.board.dom,
    rowHeight = c.dom.parent().height(),
    cellWidth = c.dom.width();

  var neededScrollTop = (c.row) * rowHeight;
  var neededScrollBottom = neededScrollTop+rowHeight;
  var currentScrollTop = b.scrollTop();
  var currentScrollBottom = b.height() + currentScrollTop;

  var neededScrollLeft = this.cursor.col * (cellWidth+4);
  var neededScrollRight = neededScrollLeft + (cellWidth+4);
  var currentScrollRight =
    this.board.dom.width() + this.board.dom.scrollLeft();
  var currentScrollLeft = this.board.dom.scrollLeft();

  if(neededScrollTop<currentScrollTop
     || neededScrollBottom>currentScrollBottom
     || neededScrollLeft<currentScrollLeft
     || neededScrollRight>currentScrollRight
    )
    this.cursor.dom[0].scrollIntoView();
};

UI.prototype.setCursor = function(cell){
  if(this.cursor) this.cursor.dom.removeClass('cursor');
  this.cursor = this.game.getCell(cell);
  this.cursor.dom.addClass('cursor');
  this.scrollCursorIntoView();
  // need To find a way to trigger only when the
  // cursor is not in view

  this.status.update(cell.unit);
  this.terrain.update(cell);
};


