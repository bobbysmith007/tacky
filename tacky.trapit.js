var TrapItGame = function (opts){
  opts=opts || {rows:15,cols:15};
  this.init(opts);
  this.controls = new ForcedMoveControls(this);
  this.controls.bind();
  this.addUnit(new PoliceUnit(this,{row:0, col:0, name:'Beggs'}));
  this.addUnit(new PoliceUnit(this,{row:0, col:14, name:'Widge'}));
  this.addUnit(new PoliceUnit(this,{row:14, col:0, name:'Londa'}));

  this.IT = new FraidyCatUnit(this,{ row:6,col:5,
    team:"redteam",name:'Drupy', moveRate:4, controller:CPU});

  this.addUnit(this.IT);
  this.generateTerrain();
  this.controls.setCursor({row:0,col:0});
  this.scheduleNextTurn();
};

TrapItGame.prototype = new Game();

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
  console.log('Victory?', this.IT.movementRadius().indexes.length==1);
  return this.IT.movementRadius().indexes.length == 1;
};

TrapItGame.prototype.failCondition = function(){
  return false;
};