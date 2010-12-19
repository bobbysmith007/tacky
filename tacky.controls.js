var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var SPACE = 32;
var ENTER = 13;
var ESC = 27;

window.CURRENT_CTLS = [];
$(window).keypress( function(event){
  var stack = window.CURRENT_CTLS, ctls;
  if ((ctls=stack[stack.length-1])){
    //console.log('Handling keys', stack, ctls, event);
    if(ctls.keyPressHandler)ctls.keyPressHandler(event);
  }
});

var Controls = function(game){
  var controls = this;
  this.game = game;
  if(this.game){
    this.setCursor({row:0,col:0});
  }

};
Controls.prototype = {selected:null,cursor:null};
Controls.prototype.bind=function(){
  window.CURRENT_CTLS.push(this);
  if(!this._mouseOverHandler){
    this._mouseOverHandler = function(event){
      var stack = window.CURRENT_CTLS, ctls;
      if ((ctls=stack[stack.length-1])){
	//console.log('Handling keys', stack, ctls, event);
	if(ctls.mouseOverHandler) ctls.mouseOverHandler(event);
      }
    };
    $('.cell', this.game.UI.board.dom).mouseover(this._mouseOverHandler);
  };
  if(!this._clickHandler){
    this._clickHandler = function(event){
      var stack = window.CURRENT_CTLS, ctls;
      if ((ctls=stack[stack.length-1])){
	if(ctls.clickHandler) return ctls.clickHandler(event);
      }
      return true;
    };
    $(window).click( this._clickHandler );
    // $('.cell', this.this.game.UI.board.dom).click( this._clickHandler );
  }
};

Controls.prototype.unbind=function(){
  var stack = window.CURRENT_KEY_PRESS, fn;
  window.CURRENT_KEY_PRESS.push(this);
  if((fn=stack[stack.length-1]) && fn == this.unbind)
    stack.pop();
};

Controls.prototype.setCursor = function(loc){
  if(this.cursor)
    this.cursor.dom.removeClass('cursor');
  this.cursor = this.game.getCell(loc);
  this.cursor.dom.addClass('cursor');
};

Controls.prototype.findTargetCell = function(t){
  if(t.cell)return t;
  if(t.parentNode) return this.findTargetCell(t.parentNode);
  return null;
};

Controls.prototype.clickHandler = function(event){
  var targetcell = this.findTargetCell(event.target);
  console.log('Handling Click', event, event.which, targetcell);
  if(targetcell){
    this.setCursor(targetcell.cell);
    if(event.which==1) this.confirm();
    else if(event.which==3) this.cancel();
    event.stopPropagation();
    return false;
  }
  return true;
};
Controls.prototype.mouseOverHandler = function(event){
  // console.log(event, event.target, event.target.cell);
  var target = this.findTargetCell(event.target);
  if(target) this.setCursor(target.cell);
};

Controls.prototype.moveCursor = function(dir){
  var row = this.cursor.row;
  var col = this.cursor.col;
  if (dir == UP) row--;
  else if (dir == DOWN) row++;
  else if (dir == LEFT) col--;
  else if (dir == RIGHT) col++;
  if(row<0) row = this.maxRow;
  if(row>this.maxRow) row = 0;
  if(col<0) col = this.maxCol;
  if(col>this.maxCol) col = 0;
  this.setCursor({row:row,col:col});
};

var MoveControls = function(game){
  this.game = game;
  if(this.game) this.setCursor({row:0,col:0});
};

MoveControls.prototype = new Controls();

MoveControls.prototype.keyPressHandler = function(event){
  var cancel = true;
  var key = event.keyCode;
  this.maxRow = this.game.UI.board.nRows-1;
  this.maxCol = this.game.UI.board.nCols-1;

  if(key == 0) key = event.charCode;
  if(key == UP ||
     key == DOWN ||
     key == LEFT ||
     key == RIGHT) this.moveCursor(key);
  else if(key == SPACE || key == ENTER){
    //if (this.selected == this.cursor) this.cancel();
    if (this.selected) this.confirm();
    else this.setSelected(this.cursor);
  }
  else if(key == ESC)this.cancel();
  else cancel = false;
  if(cancel) event.preventDefault();
  else return false; // we didnt handle the event
  return true; // we handled the event
};

MoveControls.prototype.cancel=function(){
  this.game.UI.board.unhighlight('move');
  this.setSelected(null);
};

MoveControls.prototype.confirm = function(){
  var idx = new Index(this.cursor.row,this.cursor.col);
  // console.log(this.selected.unit, this.moveRadius.inSet(idx), this.moveRadius);
  if(this.selected.unit && this.moveRadius.inSet(idx)){
    this.selected.unit.move(idx);
    this.setSelected(null);
    this.game.UI.board.unhighlight('move');
    this.moveComplete();
  }
};

MoveControls.prototype.moveComplete = function(){

};

MoveControls.prototype.setSelected = function(loc){
  if(this.selected){
    this.selected.dom.removeClass('selected');
    this.selected = null;
  }
  if( loc ){
    var cell = this.game.getCell(loc);
    if(cell.unit){
      this.selected = cell;
      this.selected.dom.addClass('selected');
      this.moveRadius = cell.unit.movementRadius();
      this.game.UI.board.highlight('move', this.moveRadius );
    }
  }
};

var ForcedMoveControls = function(game){
  this.game = game;
};
ForcedMoveControls.prototype = new MoveControls();
ForcedMoveControls.prototype.cancel=function(){ };
ForcedMoveControls.prototype.moveComplete=function(){
  this.game.scheduleNextTurn();
};
