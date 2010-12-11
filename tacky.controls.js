var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var SPACE = 32;
var ENTER = 13;
var ESC = 27;

var Controls = function(game){
  var controls = this;
  this.getCell = function(x){return game.getCell(x);};
  this.maxRow = game.board.nRows-1;
  this.maxCol = game.board.nCols-1;

  this.keyPressHandler = function(event){
    var cancel = true;
    var key = event.keyCode;
    if(key == 0) key = event.charCode;
    if(key == UP ||
       key == DOWN ||
       key == LEFT ||
       key == RIGHT) controls.moveCursor(key);
    else if(key == SPACE || key == ENTER){
      if (controls.selected == controls.cursor) controls.setSelected(null);
      else if (controls.selected) controls.notify('confirm');
      else controls.setSelected(controls.cursor);
    }
    else if(key == ESC){
      controls.setSelected(null);
      controls.notify('cancel');
    }
    else {
      //console.log('letting through:',event, key);
      cancel = false;
    }
    if(cancel) event.preventDefault();
  };
  this.setCursor({row:0,col:0});
  $(window).keypress(controls.keyPressHandler);

};
Controls.prototype = {actions:{},selected:null,cursor:null};

Controls.prototype.setCursor = function(loc){
  if(this.cursor)
    this.cursor.dom.removeClass('cursor');
  this.cursor = this.getCell(loc);
  this.cursor.dom.addClass('cursor');
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

Controls.prototype.setSelected = function(loc){
  if(this.selected){
    this.selected.dom.removeClass('selected');
    this.selected = null;
  }
  if(loc){
    this.selected = game.getCell(loc);
    this.selected.dom.addClass('selected');
  }
  controls.notify('selectionChanged');
};

Controls.prototype.toggleSelected = function(){
  this.setSelected(
    this.selected ? null : this.cursor);
};

Controls.prototype.confirm = function(){
  if(this.selected.unit){
    this.selected.unit.move(c.cursor);
    this.setSelected(null);
  }
};

Controls.prototype.register = function(name, fn){
  if(!this.actions[name])this.actions[name]=[];
    this.actions[name].push(fn);
};

Controls.prototype.notify = function(action){
  var fn,i;
  if(this.actions[action]){
    console.log('Firing ',action, this.actions[action]);
    for(i=0;fn=this.actions[action][i];i++)fn();
  }
};
