var TrapItGame = function (opts){
  opts=opts || {rows:15,cols:15};
  this.init(opts);
  this.controls = new ForcedMoveControls(this);
  this.controls.bind();
  this.addUnit(new Unit(this,{row:0,col:0,team:"redteam", name:'Beggs'}));
  this.addUnit(new Unit(this,{row:1,col:0,team:"redteam", name:'Widge'}));
  this.addUnit(new Unit(this,{row:2,col:0,team:"redteam", name:'Londa'}));

  this.IT = new FraidyCatUnit(this,{ row:6,col:5,
    team:"blueteam",name:'Drupy', moveRate:5, controller:CPU});
  this.addUnit(IT);
  this.generateTerrain();
  this.controls.setCursor({row:0,col:0});
  this.scheduleNextTurn();
};

TrapItGame.prototype = new Game();
TrapItGame.prototype.init = function(opts){
  this.prototype.init(opts);

};
TrapItGame.prototype.generateTerrain = function(){
  var idxs = new IndexSet();
  for(var i=3; i<=12; i++){
    idxs.add(new Index(3,i));
    idxs.add(new Index(10,i));
  }
  idxs.add(new Index(4,5));
  idxs.add(new Index(5,5));
  idxs.add(new Index(7,5));
  idxs.add(new Index(8,5));
  idxs.add(new Index(9,5));
  this.board.doCells(function(c){
    c.dom.removeClass('grass');
    c.treadable=false;
    c.dom.addClass('rock');
  }, idxs);
};

TrapItGame.prototype.victoryCondition = function(){
  return IT.movementRadius.indexes.lenth == 0;
};

TrapItGame.prototype.failCondition = function(){
  return false;
};