var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'

var $checks = $('#checks')
var $fen = $('#fen')
var $pgn = $('#pgn')

function removeGreySquares () {
  $('#myBoard .square-55d63').css('background', '')
}

function greySquare (square) {
  var $square = $('#myBoard .square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}
function drawArrow (move) {
  var from = ''
  const moveArr = move.split('').filter(el => (['+','x','#'].includes(el)?'':el))
  const to = moveArr.slice(-2).join('')
  var piece = moveArr[0]
  if (!game.fen().includes('w')){
    piece=piece.toLowerCase()
  }
  const fromPlaces= getPiecesPositions(piece)
  if (moveArr.length <4){ // if not like rhc4
    let move = {
      from: fromPlaces[0],
      to: to,
      promotion: 'q' 
    }
    from = game.move(move) ? fromPlaces[0] : fromPlaces[1]
    game.undo()
  } else{
     from = fromPlaces[0].includes(moveArr[1])?fromPlaces[0]:fromPlaces[1]
  }
  const toPos = (getSquarePixelPosition(to))
  const fromPos =  (getSquarePixelPosition(from))
  const x = (toPos[0]-fromPos[0])/50
  const y = (toPos[1] - fromPos[1])/50
  const dist = Math.sqrt(x*x + y*y)
  const angle = -Math.atan2(x,y)
  const arrowContainer = document.getElementById('arrowContainer')
  const arrow = document.getElementById('arrow')

  arrowContainer.style.left = `${fromPos[0]+17.5}px`;
  arrowContainer.style.top = `${fromPos[1]+10}px`;
  arrow.style.transform = `scale(3.5,${3*(dist+1)})`;
  arrowContainer.style.transform = `rotate(${angle}rad)`;
}

function updateChecks() {
  var checks = [];
  const possibleMoves = game.moves();
  checks = possibleMoves.filter(move => {
    game.move(move);
    const isInCheck = game.isInCheck();
    game.undo();
    return isInCheck;
  });
  if (checks.length > 0){
    for (let item of checks){
      // drawArrow(item)
    }
  }
 
  $checks.html(checks);
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })
  // illegal move
  if (move === null) {
    return 'snapback'
  } else {
    removeGreySquares()
    updateStatus()
    updateChecks()
  }
  
}

function onMouseoverSquare (square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  })

  // exit if there are no moves available for this square
  if (moves.length === 0) return

  // highlight the square they moused over
  greySquare(square)

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}

function onMouseoutSquare (square, piece) {
  removeGreySquares()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}




var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd
}

board = Chessboard('myBoard', config)

updateStatus()

// var move = game.move({
//   from: 'e2',
//   to: 'e4',
//   promotion: 'q' // NOTE: always promote to a queen for example simplicity
// })

// console.log(move)
// updateStatus()

// console.log(drawArrow('rh4+'))

// // Register an event listener for mouse clicks on the chessboard
// chessboard.addEventListener("click", function(event) {
//   console.log('found')
//   // Get the coordinates of the click relative to the chessboard
//   const rect = chessboard.getBoundingClientRect();
//   const x = event.clientX - rect.left;
//   const y = event.clientY - rect.top;

//   // Position the arrow at the clicked coordinates
//   arrow.style.left = x + "px";
//   arrow.style.top = y + "px";
// });
// drawArrow('q','h4')

