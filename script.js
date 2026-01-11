const X_CLASS = 'x'
const CIRCLE_CLASS = 'circle'
const WINNING_COMBINATIONS = [
    [0 , 1 , 2],
    [3 , 4 , 5],
    [6 , 7 , 8],
    [0 , 3 , 6],
    [1 , 4 , 7],
    [2 , 5 , 8],
    [0 , 4 , 8],
    [2 , 4 , 6]
]
const coverPage = document.getElementById('coverPage')
const gameContainer = document.getElementById('gameContainer')
const multiplayerBtn = document.getElementById('multiplayerBtn')
const aiBtn = document.getElementById('aiBtn')
const cellElements = document.querySelectorAll('[data-cell]')
const turnX = document.getElementById('turnX')
const turnO = document.getElementById('turnO')
const board = document.getElementById('board')
const winningMessageElement = document.getElementById('winningMessage')
const restartButton = document.getElementById('restartButton')
const winningMessageTextElement = document.querySelector('[data-winning-message-text]')


let circleTurn
let gameMode = null
let difficulty = 'easy'


multiplayerBtn.addEventListener('click', () => {
    gameMode = 'multiplayer'
    coverPage.style.display = 'none';
    gameContainer.style.display = 'flex';
    startGame();
})

aiBtn.addEventListener('click', () => {
    gameMode = 'ai'
    difficulty = 'easy'
    coverPage.style.display = 'none';
    gameContainer.style.display = 'flex';
    startGame()
})


startGame()

restartButton.addEventListener('click', startGame)

function startGame() {
    circleTurn = false

    cellElements.forEach(cell => {
     cell.classList.remove(X_CLASS)   
     cell.classList.remove(CIRCLE_CLASS)
     cell.removeEventListener('click', handleClick)
     cell.addEventListener('click', handleClick, {once: true})
})
    winningMessageElement.classList.remove('show')

    setBoardHoverClass()
    updateTurnIndicator()
    
}

function handleClick(e){
    const cell = e.target
    const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS
    placeMark(cell, currentClass)
    if (checkWin(currentClass)) {
        endGame(false)
    } else if (isDraw()) {
        endGame(true)
    } else {
        swapTurns()
        
    }
    if (gameMode === 'ai' && circleTurn) {
        setTimeout(aiMove, 400)
    }
}

function endGame(draw) {
    if (draw) {
        winningMessageTextElement.innerText = 'Draw!'
    } else {
        winningMessageTextElement.innerText = `${circleTurn ? "O's" : "X's"} Wins! `
    }
    winningMessageElement.classList.add('show')
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || 
        cell.classList.contains(CIRCLE_CLASS)
    })
}

function placeMark(cell, currentClass) {
    cell.classList.add(currentClass)
}

function swapTurns() {
    circleTurn = !circleTurn
    updateTurnIndicator()
    setBoardHoverClass()
}

function setBoardHoverClass() {
    board.classList.remove(X_CLASS)
    board.classList.remove(CIRCLE_CLASS)
    if (circleTurn) {
        board.classList.add(CIRCLE_CLASS)
    } else {
        board.classList.add(X_CLASS)
    }
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass)
        })
    })
}

function updateTurnIndicator() {
    turnX.classList.remove('active')
    turnO.classList.remove('active')

    if (circleTurn) {
        turnO.classList.add('active')
    } else {
        turnX.classList.add('active')
    }
}

function aiMove() {
    let cell
    
    if (difficulty === 'easy') {
        cell = getRandomCell()
    } else if (difficulty === 'medium') {
        cell = getMediumMove()
    } else {
        cell = getBestMove()
    }

    placeMark(cell, CIRCLE_CLASS)

    if (checkWin(CIRCLE_CLASS)) {
        endGame(false)
        return
    }

    if (isDraw()) {
        endGame(true)
        return
    }

    swapTurns()
}

function getRandomCell() {
    const availableCells = [...cellElements].filter(cell =>
        !cell.classList.contains(X_CLASS) &&
        !cell.classList.contains(CIRCLE_CLASS)
    )
    return availableCells[Math.floor(Math.random() * availableCells.length)]
}

function getMediumMove() {
    return (
        findWinningMove(CIRCLE_CLASS) || 
        findWinningMove(X_CLASS) ||
        getRandomCell()
    )
}

function findWinningMove(playerClass) {
    for (let combination of WINNING_COMBINATIONS) {
        const cells = combination.map(index => cellElements[index])
        const marks = cells.map(cell =>
            cell.classList.contains(playerClass)
        )

        if(marks.filter(Boolean).length ===2) {
            const emptyCell = cells.find(cell =>
                !cell.classList.contains(X_CLASS) &&
                !cell.classList.contains(CIRCLE_CLASS)
            )
            if(emptyCell) return emptyCell
        }
    }
    return null
}