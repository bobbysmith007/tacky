var TerrainGenerator = function(board){
  this.board = board;
};
TerrainGenerator.prototype={};
TerrainGenerator.prototype.indexRectangle = function(opts){
  opts = $.extend({top:0, left:0, height:2, width:2},opts);
  var idxs = new IndexSet ();
  for(var i=0; i<opts.width;i++)
    for(var j=0; j<opts.height;j++)
      idxs.add(new Index(j+opts.top, i+opts.left));
  return idxs.indexes;
};


TerrainGenerator.prototype.randomRectangeTerrain=function(){
  var rows = randomInRange((this.board.nRows/2)-1)+1,
      cols = randomInRange((this.board.nCols/2)-1)+1,
      top = randomInRange(this.board.nRows/2),
      left = randomInRange(this.board.nCols/2),
      types= ["water", "woods", "swamp"],
      type = types[randomInRange(types.length)],
      idxs = this.indexRectangle({top:top,left:left,
	       height:rows,width:cols});
  console.log(type);
  this.setType(idxs , type);
  return idxs;
};


TerrainGenerator.prototype.randomLineTerrain=function(){
  var types= ["road", "rock", "grass"],
      type = types[randomInRange(types.length)],
      rows = this.board.nRows,
      cols = this.board.nCols,
      rowsOrCols = randomInRange(1)==0,
      fixed = rowsOrCols?randomInRange(cols):randomInRange(rows),
      count = rowsOrCols?rows:cols,
      start=randomInRange(count/2)+1,
      end=count/2+randomInRange(count/2)-1,
      idxs = new IndexSet();

  for(var i=start;i<=end;i++)
    if (rowsOrCols) idxs.add(new Index(i, fixed));
    else idxs.add(new Index(fixed,i));

  this.setType(idxs, type);
};

TerrainGenerator.prototype.setType=function(idxs, type){
  var them = idxs;
  if(idxs.indexes)them = idxs.indexes;
  this.board.doCells( function(c){ c.setType(type); }, idxs);
  return idxs;
};

