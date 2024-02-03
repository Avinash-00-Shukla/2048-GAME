import Grid from "./Grid.js"
import Tile from "./Tile.js" 
 
var score = 0;

const gameBoard = document.getElementById("game-board")
const grid = new Grid(gameBoard)
 
grid.randomEmptyCell().tile = new Tile(gameBoard) 

setupInput()

function setupInput(){
    window.addEventListener("keydown", handleInput, {once : true})
    document.getElementById('up').addEventListener('click', arrow_up, {once : true})
    document.getElementById('down').addEventListener('click', arrow_down, {once : true})
    document.getElementById('left').addEventListener('click', arrow_left, {once : true})
    document.getElementById('right').addEventListener('click', arrow_right, {once : true})
}

function change_score(){
    document.querySelector('#score-board').innerHTML = score;
    var sb = document.getElementById('score-board'); 
    if (score < 100) sb.style.setProperty('font-size', '20vmin');
    else if (score < 1000) sb.style.setProperty('font-size', '17.5vmin');
    else if (score < 10000) sb.style.setProperty('font-size', '15vmin'); 
    else if (score < 100000) sb.style.setProperty('font-size', '12.5vmin'); 
    else sb.style.setProperty('font-size', '10vmin');
}

async function arrow_down(){
    if(!canMoveDown()){
        setupInput();
        return;
    }
    await moveDown()
    other_fn()
}

async function arrow_left(){
    if(!canMoveLeft()){
        setupInput();
        return;
    }
    await moveLeft()
    other_fn()
}

async function arrow_right(){
    if(!canMoveRight()){
        setupInput();
        return;
    }
    await moveRight()
    other_fn()
}

async function arrow_up(){
    if(!canMoveUp()){
        setupInput();
        return;
    }
    await moveUp()
    other_fn()
}

function other_fn(){
    grid.cells.forEach(cell => (score += cell.mergeTiles()))
    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile
    change_score()
    if(!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()){
        newTile.waitForTransition(true).then(() => {
            alert("Your Score => " + score)
            location.reload();
        }) 
        return
    } 
    setupInput()
}

async function handleInput(e){ 
    switch(e.key){
        case "ArrowUp" :
            if(!canMoveUp()){
                setupInput();
                return;
            }
            await moveUp() 
            break
        case "ArrowDown" :
            if(!canMoveDown()){
                setupInput();
                return;
            }
            await moveDown() 
            break
        case "ArrowLeft" :
            if(!canMoveLeft()){
                setupInput();
                return;
            }
            await moveLeft() 
            break
        case "ArrowRight" :
            if(!canMoveRight()){
                setupInput();
                return;
            }
            await moveRight() 
            break
        default:
            setupInput()
            return
    }

    other_fn()
}

function moveUp(){
    return slideTiles(grid.cellsByColumn)
}

function moveDown(){
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}

function moveLeft(){
    return slideTiles(grid.cellsByRow)
}

function moveRight(){
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function slideTiles(cells){
    return Promise.all(
    cells.flatMap(group => {
        const promises = []
        for(let i = 1; i < group.length; i++){
            const cell = group[i];
            if(cell.tile == null) continue;
            let lastValidCell;
            for(let j = i-1; j > -1; j--){
                const moveToCell = group[j];
                if(!moveToCell.canAccept(cell.tile)) break;
                lastValidCell = moveToCell
            }
            if(lastValidCell != null){
                promises.push(cell.tile.waitForTransition());
                if(lastValidCell.tile != null) {
                    lastValidCell.mergeTile = cell.tile;
                }
                else {
                    lastValidCell.tile = cell.tile;
                }
                cell.tile = null;
            }
        }
        return promises;
    }));
}

function canMoveUp(){
    return canMove(grid.cellsByColumn)
}

function canMoveDown(){
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMoveLeft(){
    return canMove(grid.cellsByRow)
}

function canMoveRight(){
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}

function canMove(cells){
    return cells.some(group => {
        return group.some((cell, index) => {
            if(index === 0) return false;
            if(cell.tile == null) return false;
            const moveToCell = group[index - 1]
            return moveToCell.canAccept(cell.tile);
        })
    })
}
