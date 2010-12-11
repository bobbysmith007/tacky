var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;
var SPACE = 32;
var ENTER = 13;
var ESC = 27;

var Controls = function(game){
  var controls = this;
  var maxRow = game.board.nRows-1;
  var maxCol = game.board.nCols-1;
  this.setCursor = function(loc){
    if(controls.cursor)
      controls.cursor.dom.removeClass('cursor');
    controls.cursor = game.getCell(loc);
    controls.cursor.dom.addClass('cursor');
  };

  this.setSelected = function(loc){
    if(controls.selected){
      controls.selected.dom.removeClass('selected');
      controls.selected = null;
    }
    if(loc){
      controls.selected = game.getCell(loc);
      controls.selected.dom.addClass('selected');
    }
    controls.notify('selectionChanged');
  };

  this.moveCursor = function(dir){
    var row = controls.cursor.row;
    var col = controls.cursor.col;
    if (dir == UP) row--;
    else if (dir == DOWN) row++;
    else if (dir == LEFT) col--;
    else if (dir == RIGHT) col++;
    if(row<0) row = maxRow;
    if(row>maxRow) row = 0;
    if(col<0) col = maxCol;
    if(col>maxCol) col = 0;
    controls.setCursor({row:row,col:col});
  };

  this.toggleSelected = function(){
    controls.setSelected(
      controls.selected ? null : controls.cursor);
  };

  this.actions = {};
  this.registerAction = function(name, fn){
    if(!controls.actions[name])controls.actions[name]=[];
    controls.actions[name].push(fn);
  };
  this.notify = function(action){
    var fn,i;
    console.log('Firing ',action);
    for(i=0;fn=controls.actions[action];i++)fn();
  };

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
      controls.notify('canceled');
    }
    else {
      console.log('letting through:',event, key);
      cancel = false;
    }
    if(cancel) event.preventDefault();
  };

  this.setCursor({row:0,col:0});
  $(window).keypress(controls.keyPressHandler);

};