var TerrainTypes = ["road", "grass", "woods", "water", "hills", "rock" ];

var UIElement = function(game, opts){};
UIElement.prototype = { typeName:'UIElement' };

UIElement.prototype.init = function (){
  console.log('UIElement init');
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
  unit:null,
  treadable:true
}) ;

var Row = function (){
  this.init();
  this.cells=[];
  var me = this;
  this.addCell=function(c){me.cells.push(c); me.dom.append(c.dom);};
};
Row.prototype = $.extend(new UIElement(), {
  dom:$('<div class="row"></div>')
});

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
  console.log('board init');
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

var StatusPanel = function(game){
  this.game=game;
  if(game) this.init(game);
};
StatusPanel.prototype = $.extend(new UIElement(), {
  dom:$('<div class="status"></div>')
});
var InitiativePanel = function(game){
  this.game=game;
  if(game) this.init(game);
};
InitiativePanel.prototype = $.extend(new UIElement(), {
  dom:$('<div class="initiative"></div>')
});

var UI = function(game, uiHolder){
  this.init(game, uiHolder);
};
UI.prototype = {};
UI.prototype.init = function(game, uiHolder){
  this.game = game, this.uiHolder = uiHolder;
  this.board = new Board(game);
  this.initiativePanel = new InitiativePanel(game);
  this.statusPanel = new StatusPanel(game);
  this.uiHolder.append(this.board.dom)
    .append(this.initiativePanel.dom)
    .append(this.statusPanel.dom);
};


