
var Unit = function(game, opts){
  this.init(game, opts);
};
var HUMAN='HUMAN', CPU='CPU';
Unit.prototype = {
  dom: $('<div class="unit"></div>'),
  initiative: 10,
  moveRate: 4,
  facing: UP,
  controller: HUMAN
};
Unit.prototype.init=function(game, opts){
  $.extend(this,{facing:DOWN,row:0,col:0},opts);
  if(game)this.game = game;
  this.dom = this.dom.clone();
  this.setFacing(this.facing);
  if(this.name) this.dom.attr('title', opts.name);
  if(this.team) this.dom.addClass(this.team);
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
  };
};

Unit.prototype.isAlly = function(other){
  return (this.team && other.team && this.team == other.team);
};

Unit.prototype.siteRadius = function(){
  var locs = new IndexSet(), i,j,
    maxR = this.game.board.nRows-1,
    maxC = this.game.board.nCols-1,
    thisidx = new Index(this.row, this.col),
    me = this;

  function rec(idx, move){
    var newMove=move-1;
    var cell = this.game.getCell(idx);
    if(!cell.treadable) return; // cell is impassible
    locs.add(idx);

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

Unit.prototype.movementRadius = function(){
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

Unit.prototype.aiTurn = function(){ console.log('No AI'); };


var PoliceUnit = function(game, opts){
  opts = $.extend({moveRate:5, team:'blueteam'}, opts);
  this.init(game, opts);
};
PoliceUnit.prototype = new Unit();


var FraidyCatUnit = function(game, opts){
  opts = $.extend({moveRate:5, team:'blueteam'}, opts);
  this.init(game, opts);
};
FraidyCatUnit.prototype = new Unit();
FraidyCatUnit.prototype.aiTurn = function(){
  var i,idx,cell,me=this,idxs = this.siteRadius().indexes;
  var dist = function(i1,i2){
    return Math.pow((i2.col-i1.col),2) + Math.pow((i2.row-i1.row),2);
  };
  var bad=null, furthest=null, mdist=0;
  for(i=0;idx=idxs[i];i++){
    cell = this.game.getCell(idx);
    //if(cell.unit) console.log(cell,  cell.unit.name, !cell.unit.isAlly(me));
    if(cell.unit && !cell.unit.isAlly(me)){
      bad = (idx);
      break;
    }
  }
  if(bad){
    console.log('fraidy is scared');
    idxs = this.movementRadius().indexes;
    for(i=0;idx=idxs[i];i++){
      if(dist(bad, idx) > mdist){
	mdist = dist(bad, idx);
	furthest = idx;
      }
    }
    //console.log(this.row, this.col, furthest.row, furthest.col);
    this.move(furthest);
  }
  else console.log('fraidy is relaxing');
};
