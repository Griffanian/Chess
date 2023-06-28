import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function Board() {// eslint-disable-next-line 
  const [game, setGame] = useState(new Chess('rnbqkbnr/ppp2ppp/8/1N1pp3/8/8/PPPPPPPP/R1BQKBNR w KQkq - 0 3'));
  const [turnColor,setTurnColor] = useState('White')
  const [status,setStatus] = useState('')
  const [checks,setChecks] = useState([])
  const [captures,setCaptures] = useState([])
  const [attacks,setAttacks] = useState([])
  const [fen,setFen] = useState('')
  const [arrows,setArrows] = useState([])
  // const allPieces = ['R','N','B','Q','K','P']

  const makeMove = (move) => {
    const move1 = game.move(move)
    if (move1 === null) return
  }

  function onDrop(sourceSquare, targetSquare) {
    try{
      makeMove({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q", // always promote to a queen for example simplicity
      });
    }
    catch{
      return false
    }
  updateStatus()
  updateAttacks()
  updateFen()
  return true;
  }

  function mainHighlight(square){
    document.querySelector(`div[data-square="${square}"]`).classList.add('main-highlight')

  }

  function greyHighlight(square) {
    const squareElement =document.querySelector(`div[data-square="${square}"]`)
    if (squareElement) {
      squareElement.classList.add('grey-highlight');
    }
  }

  function removeHighlight() {
    const mainSquares = document.getElementsByClassName('main-highlight')
    for (let item of mainSquares) {
      item.classList.remove('main-highlight')
    }
    const squares = document.getElementsByClassName('grey-highlight');
    for (let item of squares) {
      item.classList.remove('grey-highlight')
    }
  }

  function onMouseOverSquare (square) {
    removeHighlight()
    const moves = game.moves({
      square: square,
      verbose: true
    })
    
    if (moves.length === 0) mainHighlight(square)
  
    mainHighlight(square)

    for (let i = 0; i < moves.length; i++) {
      greyHighlight(moves[i].to)
    }
  }

  function onMouseOutSquare () {
    removeHighlight()
  }
  function onArrowsChange () {
    console.log(document.querySelectorAll('marker+line')[0]);
  }
  function updateStatus () {
    if (game.turn() === 'b') {
      setTurnColor('White')
    }else{
      setTurnColor('Black')
    }
  
    if (game.isCheckmate()) {
      setStatus('Game over, ' + turnColor + ' is in checkmate.')
    }
  
    else if (game.isDraw()) {
      setStatus('Game over, drawn position')
    }

    else {
      setStatus(turnColor + ' to move')

      if (game.isCheck()) {
        setStatus(status+', ' + turnColor + ' is in check')
      }
    }
  }

  function updateAttacks() {
    const possibleMoves = game.moves();
    const checksArr = []
    const capturesArr = []
    const attacksArr = []
    for (let move of possibleMoves){
      const moveObj = game.move(move);
      if (game.isCheck()){
        checksArr.push(moveObj)
      }else if(move.includes('x')){
        capturesArr.push(moveObj)

      }else {
        if (true){
          const tempFen = game.fen().split(' ')
          tempFen[1] = tempFen[1]==='b'?'w':'b'
          const newGame = new Chess(tempFen.join(' '))
          const attackMoves = newGame.moves({ square: moveObj.to, verbose: true })
       
          for (let item of attackMoves){
            if (item.from === moveObj.to){
              const newMove = newGame.move(item)
              if(newMove.san.includes('x')){
                attacksArr.push(moveObj)
                break
              }
              newGame.undo()
            }
        }
          // const newMoveObj = newGame.move(item)
          // if (newMoveObj.san.includes('x')){
          //   attacksArr.push(moveObj)
          //   break
          // }
        }
      }
      game.undo();
    };
    setChecks(checksArr)
    setCaptures(capturesArr)
    setAttacks(attacksArr)
  }
  
  function updateFen(){
    const curFen = game.fen()
    setFen(curFen)
  }
  function updateAll(){
    updateStatus()
    updateAttacks()
    updateFen()
  }
  function addArrows(moves){// [moveObj,moveObj,...]
    const curArrow = [...arrows]
    const newArrows = moves.map(moveObj=>{
      const moveArr = [moveObj.from,moveObj.to]
      if (!curArrow.some(subArray => (subArray === moveArr))){
        return moveArr
      }
    })
    setArrows([...arrows, ...newArrows])
  }
  function removeArrows(moves){// [moveObj,moveObj,...]
    const curArrow = [...arrows]
    const removalArrows = moves.map(moveObj=> [moveObj.from,moveObj.to])
    const newArrow = curArrow.filter(item => !removalArrows.some(arr => arr[0] === item[0] && arr[1] === item[1]));
    setArrows(newArrow)
  }
  function toggleArrows(moves){// [moveObj,moveObj,...]
    const movesArr = moves.map(moveObj=> [moveObj.from,moveObj.to])
 
    if (!movesArr.every(item=> JSON.stringify(arrows).includes(JSON.stringify(item)))){
      addArrows(moves)
    } else{
      removeArrows(moves)
    }
  }
  
  useEffect(()=>{
    updateAll()// eslint-disable-next-line
  },[])

  // function convertMoveNotatation(move){
  //   const moveArr = move.split('')
  //   if (!moveArr.includes('-')){//not e2-e4 therefore is ''
  //     moveArr = moveArr.filter(el => (['+','x','#'].includes(el)?'':el))

  //   }
  // }

  // function getSquarePixelPosition(square) {
  //   const row = 8 - parseInt(square.charAt(1));
  //   const col = square.charCodeAt(0) - 97;
  //   const x = col * 50;
  //   const y = row * 50;
  //   return [x, y];
  // }

  // function getPiecesPositions(piece) {
  //   const places = []
  //   const curFen = game.fen()
  //   const numOfPieces = curFen.split(piece).length-1
  //   if (numOfPieces <= 0){
  //     throw new Error('piece is not on board')
  //   } 
  //   const curFenArr = curFen.split('/')
  
  //   for (let i=0; i < curFenArr.length; i++){
  
  //     let curRow = curFenArr[i]
  //     const currentRowArr = curRow.split('')
  //     const colPos = currentRowArr.map((element, index) => element === piece ? index : -1).filter(index => index !== -1);
  //     for (let item of colPos){
  //       if (0 <= item && item <= 7){
  //         let dist = 0
          
  //         for (let x=0; x < currentRowArr.length; x++){
  //           if (x<item){
  //             if (!isNaN(currentRowArr[x])){
  //               dist+=parseInt(currentRowArr[x])
  //             } else {
  //             dist++
  //             }
  //           } 
  //         }
  //         const letter = String.fromCharCode(97+dist)
  //         const num = 8-i
  //         places.push(letter+num)
  //       }
  //     }
  //   }
  //   return places
  // }  
  return(
     <div className="container">
        <Chessboard position={game.fen()}
        onPieceDrop={onDrop} 
        onMouseOverSquare={onMouseOverSquare}
        onMouseOutSquare={onMouseOutSquare}
        customArrows={arrows}
        customArrowColor={'rgb(255,0,0)'}
        onArrowsChange={onArrowsChange}
        />
        {/* <p>{JSON.stringify(arrows)}</p> */}
        <label>Checks:</label>
        <div id="checks">
        {
          checks.map(item=>{
            return(
              item.san
            )
          })
        }
        <button onClick={()=>toggleArrows(checks)}>toggle checks</button>
        </div>
        <label>Captures:</label>
        <div id="captures">
        {
          captures.map(item=>{
            return(
              item.san
            )
          })
        }
        <button onClick={()=>toggleArrows(captures)}>toggle captures</button>
        </div>
        <label>Attacks:</label>
        <div id="attacks">
        {
          attacks.map(item=>{
            return(
              item.san+', '
            )
          })
        }
        <button onClick={()=>toggleArrows(attacks)}>toggle attacks</button>
        </div>
        <label>Status:</label>
        <div id="status">{status}</div>
        <label>FEN:</label>
        <div id="fen">{fen}</div>
     </div>
  )
}