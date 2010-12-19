var HUMAN='HUMAN', CPU='CPU';

var Unit = function(game, opts){
  this.typeName='Unit';
  if(game) this.init(game, opts);
};

Unit.prototype = $.extend(new UIElement(), {
  dom: $('<div class="unit"></div>'),
  initiative: 10,
  moveRate: 4,
  facing: UP,
  controller: HUMAN
});

Unit.prototype.init=function(game, opts){
  $.extend(this,{facing:DOWN,row:0,col:0},opts);
  UIElement.prototype.init.call(this);
  if(game)this.game = game;
  this.setFacing(this.facing);
  if(this.name) this.dom.attr('title', opts.name);
  if(this.team) this.dom.addClass(this.team);
};

Unit.prototype.buildHeading = function(){
  var ctl= $('<h3></h3>')
    .append($('<span class="name"></span>').html(this.name));
  if(this.team)
    ctl.append($('<span class="team"></span>')
	       .html(this.team))
    .addClass(this.team);
  return ctl;
};
Unit.prototype.buildStats = function(){
  var ctl = $('<div class="unit"></div>')
    .append(this.buildHeading())
    .append($('<div class="movement">Movement:'+this.moveRate+'</div>'));
  return ctl;
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

Unit.prototype.sightRadius = function(){
  var locs = new IndexSet(), i,j,
    maxR = this.game.UI.board.nRows-1,
    maxC = this.game.UI.board.nCols-1,
    thisidx = new Index(this.row, this.col),
    me = this;

  function rec(idx, move){
    var cell = this.game.getCell(idx);
    var moveRate = cell.moveRate();
    var newMove=move-(1/moveRate);

    if(moveRate==0 || move<0) return;    // cell is impassible, or we couldnt get here
    if(cell.unit && !cell.unit.isAlly(me)) return; //cant move through enemies

    locs.add(idx);
    if(newMove<0) return;
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
    maxR = this.game.UI.board.nRows-1,
    maxC = this.game.UI.board.nCols-1,
    thisidx = new Index(this.row, this.col),
    me = this;

  function rec(idx, move){
    var cell = this.game.getCell(idx);
    var moveRate = cell.moveRate();
    var newMove=move-(1/moveRate);

    if(moveRate==0 || move<0) return;    // cell is impassible, or we couldnt get here
    if(cell.unit && !cell.unit.isAlly(me)) return; //cant move through enemies

    locs.add(idx);
    if(newMove<0) return;
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
  this.typeName='PoliceUnit';
  opts = $.extend({moveRate:5, team:'blueteam'}, opts);
  if(game)this.init(game, opts);
};
PoliceUnit.prototype = $.extend(new Unit());


var FraidyCatUnit = function(game, opts){
  this.typeName='FraidyCatUnit';
  opts = $.extend({moveRate:5, team:'blueteam'}, opts);
  if(game)this.init(game, opts);
};
FraidyCatUnit.prototype = $.extend({typeName:'FraidyCatUnit'}, new Unit());
FraidyCatUnit.prototype.aiTurn = function(){
  var i,idx,cell,me=this,idxs = this.sightRadius().indexes;
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
