var TrapItGame = function (){
  $.extend(this,{nRows:15,nCols:45});

};

TrapItGame.prototype = new Game();
TrapItGame.prototype.init = function(){
  Game.prototype.init.call(this);
  console.log('trapit game init');
  this.controls = new ForcedMoveControls(this);
  this.controls.bind();
  console.log('adding units');
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
  this.UI.board.doCells(
    function(c){ c.setType('rock'); },
    idxs);

  idxs = new IndexSet();
  for(i=0; i<45; i++){
    idxs.add(new Index(1,i));
    if(i<15) idxs.add(new Index(i,1));
  }
  this.UI.board.doCells(
    function(c){ c.setType('road'); },
    idxs);

  idxs = new IndexSet();
  for(i=0;i<4;i++)
    for(var j=0;j<4;j++)
      idxs.add(new Index(5+i,7+j));
  this.UI.board.doCells(
    function(c){ c.setType('woods'); },
    idxs);


};

TrapItGame.prototype.victoryCondition = function(){
  // console.log('Victory?', this.IT.movementRadius().indexes.length==1);
  return this.IT.movementRadius().indexes.length == 1;
};

TrapItGame.prototype.failCondition = function(){
  return false;
};