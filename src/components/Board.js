import { useEffect, useState,useRef } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

import { Configuration, OpenAIApi } from "openai";
import pgn from "../gamesPgn/game1";

export default function Board() {// eslint-disable-next-line 
  const [game, setGame] = useState(new Chess('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'));
  const [turnColor,setTurnColor] = useState('White')
  const [status,setStatus] = useState('')
  const [checks,setChecks] = useState([])
  const [captures,setCaptures] = useState([])
  const [attacks,setAttacks] = useState([])
  const [bestMove,setBestMove] = useState('')
  const [fen,setFen] = useState('')
  const [history,setHistory] = useState([])
  const [arrows,setArrows] = useState([])
  const [undoneMoves,setUndoneMoves] = useState([])
  const [gptRes,setGtpRes] = useState('')
  const allPieces = {'R':'Rook','N':'Knight','B':'Bishop','Q':'Queen','K':'King','P':'Pawn'}

  const scrollContainerRef = useRef(null);

  useEffect( ()=>{
    game.loadPgn(pgn)
    updateAll()
    const scrollContainer = scrollContainerRef.current;
    scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
  },[])

  useEffect( ()=>{
    const scrollContainer = scrollContainerRef.current;
    scrollContainer.scrollTo(0, scrollContainer.scrollHeight);
  },[undoneMoves])

  function getSquarePosition(square) {
    const boardElement = document.getElementById('myBoard');
    const boardSize = boardElement.offsetWidth;
    const squareSize = boardSize / 8;
    const file = square.charCodeAt(0)-96;
    const rank = parseInt(square.charAt(1));
    const x = file * squareSize;
    const y = (7 - rank) * squareSize;
    
    return { x, y };
  }
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
    // const arrows = document.querySelectorAll('marker+line');
    // arrows.forEach(item=>console.log(item))
    // console.log('Square position:', getSquarePosition('e4'));
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
  function updateHistory(){
    const curHistory = game.history()
    setHistory(curHistory)
  }
  function updateAll(){
    updateStatus()
    updateAttacks()
    updateFen()
    updateHistory()
  }
  function addArrows(moves){// [moveObj,moveObj,...]
    const curArrow = [...arrows]
    const newArrows = moves.map(moveObj=>{
      const moveArr = [moveObj.from,moveObj.to]
      if (!curArrow.some(subArray => (subArray === moveArr))){
        return moveArr
      } else {
        return false
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
  function moveBack(num){
    const curUndoneMoves = [...undoneMoves]
    for (let i=0;i<num;i++){
      const undoneMove = game.undo()
      curUndoneMoves.push(undoneMove)
    }
    setUndoneMoves(curUndoneMoves)
    updateAll()
  }
  function moveForward(num){
    const curUndoneMoves = [...undoneMoves]
    for (let i=0;i<num;i++){
      if (undoneMoves.length>0){
        try{
        game.move(curUndoneMoves.slice(-1)[0])
        curUndoneMoves.pop()
        } catch(e){
          console.log('move=>'+curUndoneMoves.slice(-1)[0])
          console.log('e=>'+e)
        }
      } else{
        break
      }
    }
    setUndoneMoves(curUndoneMoves)
    updateAll()
  }
  function prettyHistory(){
    const curHistory = history
    const historyArr = []
    for (let i=0; i<curHistory.length;i+=2){
      let prettyStr = `${i/2+1}.\t${curHistory[i]}`
      if (curHistory[i+1]!=null){
        prettyStr+=`\t${curHistory[i+1]}`
      }
      historyArr.push(prettyStr)
    }
    return(historyArr)
  }
  async function callApi(query){
    const configuration = new Configuration({
      organization: "org-8wXVmH2gY4olHQquatfoTSKI",
      apiKey: "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",
  });
    const openai = new OpenAIApi(configuration);
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "system", content: query}],
    });
    return completion.data.choices[0].message;
  }
  async function getChatGPTresponce(){
    const currentPieces = getPieces()
    let query = "respond with an explanation of the dynamics of this chess position in less than 100 words. Given that the only pieces on the board are."
    for (let item of currentPieces.pieces){
      query+=`a ${item.color} ${item.piece} on ${item.location}`
    }
    const data  = await callApi(query)
    setGtpRes(data.content)
  }
  function getPieces(){
    const currentPieces = []
    let notOnBoard = Object.values(allPieces)
    const curRows = game.fen().split(' ')[0].split('/')
    for (let i=0;i<curRows.length;i++){
      if (curRows[i] !== '8'){
        const curRow = curRows[i].split('')
        let pos = 0
        for (let item of curRow){
          if (isNaN(item)){
            const posNum = 8-i
            const posLetter = String.fromCharCode(97+pos)
            const posCoor = posLetter+posNum
            const color = item===item.toUpperCase()?'White':'Black'
            const piece = allPieces[item.toUpperCase()]
            const pieceObj = {'piece':piece,'location':posCoor,'color':color}
            currentPieces.push(pieceObj)
            pos++
            if (notOnBoard.includes(piece)){
              notOnBoard=notOnBoard.filter((item) => item!==piece)
            }
          } else{
            pos+=parseInt(item)
          }
        }
      }
    }
    return {'pieces':currentPieces,'notOnBoard':notOnBoard}
  }
  return(
     <section>
        <article>
          <Chessboard position={game.fen()}
          onPieceDrop={onDrop} 
          onMouseOverSquare={onMouseOverSquare}
          onMouseOutSquare={onMouseOutSquare}
          customArrows={arrows}
          customArrowColor={'rgb(255,0,0)'}
          onArrowsChange={onArrowsChange}/>
          <button id='firstMove' onClick={()=>moveBack((game.moveNumber()-1)*2)}>Start</button>
          <button id='prevMove' onClick={()=>moveBack(1)}>Undo</button>
          <button id='nextMove' onClick={()=>moveForward(1)}>Redo</button>
          <button id='nextMove' onClick={()=>moveForward(undoneMoves.length)}>End</button>
          <button id='getChat' onClick={()=>getChatGPTresponce()}>Get Explanation</button>
          <br/>
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
          <p>{gptRes}</p>
        </article>
        <aside ref={scrollContainerRef}>
          {/* <label>Status:</label>
          <div id="status">{status}</div> */}
          
          {
            prettyHistory().map(item=>{
              return (
                <p key={item}>{item}</p>
                )
            })
          }
          {/* <label>FEN:</label>
          <div id="fen">{fen}</div> */}
        </aside>
     </section>
  )
}