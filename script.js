const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let directionChanged = false; 
let cellSize = 50; 
let apple = {x:0, y:0}; 
let direction = "UP";
let snakeArray = []; 
let gameInterval;
let currentScore = 5; 
let revealed = [];
let time = 0;
let frameCount = 0; 
const videos = document.getElementsByClassName("video");
let video = "";
let currentMode = "";
let lastSnakeUpdate = 0;
let isGameOver = false;
let waveOffset = 0;
let lastWaveUpdate = Date.now();

let updateWave = [];
let waveShift = 0; 
for (let x = 0; x < 10; x++) {
    let yCord = Math.floor(2* Math.sin(x));
    updateWave.push(yCord);
} 
document.getElementById("start-screen").style.display = "flex";

document.getElementById("startButton").addEventListener("click", () => {
    document.getElementById("start-screen").style.display = "none";
   document.getElementById("mode-screen").style.display = "flex";
});

document.querySelectorAll(".modeBtn").forEach(btn => {
    btn.addEventListener("click", () => {
        currentMode = btn.dataset.mode;
        if(currentMode=="wave") {
        showMessage(2000);

        } 
        else{
        startGame()
        }
    });
});

function showMessage(duration) {
    const box = document.getElementById("warning-screen");
       document.getElementById("mode-screen").style.display = "none";

    box.style.display = "flex";

    setTimeout(() => {
    box.style.display = "none";
    startGame();
    }, duration);  // duration in ms
}
document.addEventListener("keydown",changeDirection);
document.getElementById("replayButton").addEventListener("click", () => {
    document.getElementById("gameover-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "none";
   document.getElementById("mode-screen").style.display = "flex";
}); 

function randomizerVideo() {
video = videos[Math.floor(Math.random() * videos.length)]; 
}

function initializeSnake() {
    for(let i = 0; i< 5; i++) {
    snakeArray[i] = {x:5-i, y:5};    
    }
}



function drawFrame() {
    // Always draw video at full FPS
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (currentMode === "puzzle") {
       reveal(); 
    }
    if (currentMode === "wave") {
        drawWave();
    }

    drawGrid();
    drawSnake();
    drawApple();
}
function reveal() {
for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
            if(currentMode==="wave") 
             if (!revealed[x][y]) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);          
            }
            if(currentMode==="puzzle")
            if (!revealed[x][y]) {
                ctx.fillStyle = "black";
                ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }
    }    
}

function drawWave() {
ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
reveal();
drawGrid();
drawSnake();
drawApple();
}

function updateWaveFunction() {
 for (let x = 0; x < 10; x++) {
        revealed[x].fill(false);
    } // we set the previous values to be false, and create new wave
    // premise of this function is to increment all the values of basewave by 1. Then we create the new basewave.
    minResetWave(); 
    for(let x = 0; x<10; x++) {
    let yCord = updateWave[x]++;  
    revealed[x][yCord] = true; 
    if(yCord+1<=9)
    revealed[x][yCord+1] = true;
    if(yCord+2<=9)
    revealed[x][yCord+2] = true;
    if(yCord+3<=9)
    revealed[x][yCord+3] = true;
    }

}

function minResetWave() {
let min =updateWave[0];
for(let y = 0; y< 10; y++ ) {
    if(min > updateWave[y]) {
    min = updateWave[y];
    }    

}
if(min >=9) {
for (let x = 0; x < 10; x++) {
    let yCord = Math.floor(2* Math.sin(x));
    updateWave[x] = (yCord);
}  
}
}



function drawGrid() {
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1;

    for (let i = 0; i < canvas.width; i += cellSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    
    for (let j = 0; j < canvas.height; j += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
    }
}
function drawApple() {
    ctx.fillStyle = "red";
    ctx.fillRect(
        apple.x * cellSize,
        apple.y * cellSize,
        cellSize,
        cellSize
    );
}
function drawSnake() {
    ctx.fillStyle = "lime";

    for (let i = 0; i < snakeArray.length; i++) {
    ctx.fillRect(snakeArray[i].x * cellSize, snakeArray[i].y * cellSize,cellSize,cellSize)
    }
}


function changeDirection(event) {
  if (event.key === "ArrowUp" && direction !== "DOWN") {
        direction = "UP";
    }
    else if (event.key === "ArrowDown" && direction !== "UP") {
        direction = "DOWN";
    }
    else if (event.key === "ArrowLeft" && direction !== "RIGHT") {
        direction = "LEFT";
    }
    else if (event.key === "ArrowRight" && direction !== "LEFT") {
        direction = "RIGHT";
    }  
}
function moveSnake() {
    let head = snakeArray[0];
    let newHead = {x: head.x, y: head.y}; 
if(direction == "UP") newHead.y--;
if(direction == "DOWN") newHead.y++;
if(direction == "RIGHT") newHead.x++;
if(direction == "LEFT") newHead.x--;
snakeArray.unshift(newHead);
snakeArray.pop();
}


function startGame(event) {
document.getElementById("mode-screen").style.display = "none";
document.getElementById("start-screen").style.display = "none";
document.getElementById("gameover-screen").style.display = "none";
document.getElementById("win-screen").style.display = "none";
document.getElementById("score-label").style.display= "flex";
 lastSnakeUpdate = 0;
lastWaveUpdate = 0;
isGameOver = false;
currentScore = 0;
randomizerVideo();
video.loop = true;
resetRevealGrid();
video.play(); 
direction = "UP"

initializeSnake();
spawnApple(); 
lastSnakeUpdate = 0;
requestAnimationFrame(gameLoop);
}
let waveTimer = 1; 

function gameLoop(timestamp) {
    if (isGameOver) return; // stop animation loop

    // --- 1. Update Snake (every 150ms) ---
    let snakeDelay = 150;
    if (timestamp - lastSnakeUpdate > snakeDelay) {

        directionChanged = false;
        moveSnake();

        // win check
        if (win()) {
            isGameOver = true;
            document.getElementById("win-screen").style.display = "flex";
            return;
        }

        // apple check
        if (eatApple()) {
            growSnake();
            spawnApple();
        }

        // death check
        if (death()) {
            video.pause();
            resetRevealGrid();
            isGameOver = true;
            clearSnake();
            document.getElementById("gameover-screen").style.display = "flex";
            return;
        }

        lastSnakeUpdate = timestamp; // reset snake timer
    }

    if  (currentMode === "wave") {
        if (timestamp - lastWaveUpdate >= 75) {
            updateWaveFunction();
            lastWaveUpdate = timestamp; // Use timestamp, not Date.now()
        }
        drawWave();
    } else
    drawFrame();
    

    requestAnimationFrame(gameLoop);
}


function clearSnake() {
snakeArray = [];     
}
function resetRevealGrid() {
    revealed = [];
revealed = Array.from({ length: 10 }, () => Array(10).fill(false));  
  }

function spawnApple() {
 let valid = false;

    while (!valid) {
        apple.x = Math.floor(Math.random() * 10);
        apple.y = Math.floor(Math.random() * 10);

        valid = true;

        // check if apple is inside snake
        for (let i = 0; i < snakeArray.length; i++) {
            if (snakeArray[i].x === apple.x && snakeArray[i].y === apple.y) {
                valid = false; // apple is on the snake → retry
                break;
            }
        }
    }
}
function eatApple() {
let head = snakeArray[0];
    if (head.x === apple.x && head.y === apple.y) {
        if(currentMode == "puzzle"){
        revealed[apple.x][apple.y] = true;
        }
        updateScore();
        return true;
    }
    return false;
}

function death() {
    let borders = {x:9, y:9};
    let head = snakeArray[0];
    if(head.x> borders.x || head.y > borders.y || head.x < 0 || head.y < 0) {
        return true; 
    }

    for(let i = 1; i<snakeArray.length; i++) {
        if(head.x == snakeArray[i].x && head.y == snakeArray[i].y) {
        return true; 
        }
    }
    return false; 
}
function growSnake() {
    const t1 = snakeArray[snakeArray.length-1];
    const t2 = snakeArray[snakeArray.length -2];
    const dx = t1.x- t2.x;
    const dy = t1.y - t2.y; 
    const newTail = {x: t1.x + dx, y: t1.y +dy};
    snakeArray.push(newTail);
}
function updateScore() {
currentScore++;
document.getElementById("scoreValue").innerText =currentScore; 
}
function win() {
if(currentScore == 100) {
return true;
}
return false; 
}