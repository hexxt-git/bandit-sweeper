// global constants
const res = 9 // 9 x 9 grid
const bandit_density = 0.2 // 20% chance for a cell to be a bandit
const EMPTY = 0
const BANDIT = 1
const EXPLORED = 2
document.documentElement.style.setProperty("--res", res);

// keeping track of leaderboard
if(localStorage.getItem("leaderboard") == null){
    localStorage.setItem("leaderboard", '[]')
}
let leaderboard = JSON.parse(localStorage.getItem("leaderboard"))
let leaderboard_div = document.getElementById("leaderboard")
for(let i = 0 ; i < leaderboard.length ; i++){
    let new_element = document.createElement("div")
    new_element.innerText = `${i+1}. ${leaderboard[i].name}: ${leaderboard[i].score}`
    leaderboard_div.appendChild(new_element)
}

// updating timer
let timer = 0
let timer_div = document.getElementById("timer-val")
setInterval(()=>{
    timer += 0.1
    let m = Math.floor(timer/60)
    m = m < 10 ? "0" + m : m
    let s = Math.floor(timer)%60
    s = s < 10 ? "0" + s : s
    let ms = Math.floor((timer%1)*100)
    ms = ms < 10 ? "0" + ms : ms
    timer_div.innerText = `${m}:${s}:${ms}`
    
}, 100)
let revealed = 0

// set up grid 2D array
let grid = new Array(res).fill(new Array(res).fill(0))
grid = grid.map((c)=>{
    return c.map(()=>{
        return Math.random() < bandit_density ? BANDIT : EMPTY
    })
})

function id_index(i, j){
    return `(${i}, ${j})`
}

function neighbor_counter(i, j, x){
    let count = 0
    for(let di = -1 ; di <= 1 ; di++){
        if(i+di == -1 || i+di == res) continue
        for(let dj = -1 ; dj <= 1 ; dj++){
            if(di == 0 && dj == 0) continue
            if(grid[i+di][j+dj] == x) count += 1
        }
    }
    return count
}

function update_html_element(i, j){
    element = document.getElementById(id_index(i, j))
    element.dataset.explored = (grid[i][j] == EXPLORED)
    element.dataset.explorable = (neighbor_counter(i, j, EXPLORED) != 0 && grid[i][j] != EXPLORED)
    if(grid[i][j] == EXPLORED && neighbor_counter(i, j, BANDIT) != 0){
        element.innerText = neighbor_counter(i, j, BANDIT)
    }
}

function revealCell(i, j) { //ricurson 
    if (i == -1 || i == res || j == -1 || j == res || grid[i][j] == EXPLORED) return; // exit if clear or out of bounds 
    grid[i][j] = EXPLORED;
    revealed += 1
    if (neighbor_counter(i, j, BANDIT) == 0) { // if no neighbors are bandits, explore neighbors
        for(let di = -1 ; di <= 1 ; di++){
            if(i+di == -1 || i+di == res) continue
            for(let dj = -1 ; dj <= 1 ; dj++){
                if(di == 0 && dj == 0) continue // avoid infinite loop
                revealCell(i + di, j + dj); // explore neighbors
            }
        }
    }
}

function win(){
    grid[0][~~(res/2)] = EXPLORED
    update_html()
}

function check_win(){
    if(grid[0][~~(res/2)] == EXPLORED){
        let score = Math.floor(timer*100)/100;
        alert("You won! \nand revealed a total of: " + revealed + " tiles\nIn a record time of: " + Math.floor(timer) + " seconds")
        let name = prompt("Enter your name for the leaderboard")
        name = name == null || name == '' ? 'null' : name;
        leaderboard.push({'name':name, 'score':score})
        leaderboard = leaderboard.sort((a, b)=>{return a.score - b.score})
        localStorage.setItem("leaderboard", JSON.stringify(leaderboard))
        console.log('a')
        location.reload()
    }
}

function update_html_element_events(i, j){
    element = document.getElementById(id_index(i, j))
    if(element.dataset.explorable == "false") return 0
    element.addEventListener('click', ()=>{
        if(grid[i][j] == BANDIT){
            alert("You lost! \nand revealed a total of: " + revealed + " tiles")
            
            location.reload()
        }
        revealCell(i, j);
        update_html()
    })
}

function update_html(){
    for(let i = 0 ; i < res ; i++){
        for(let j = 0 ; j < res ; j++){
            update_html_element(i, j)
            update_html_element_events(i, j)
        }
    }
    check_win()
}

// set up html grid
const grid_div = document.getElementById("grid")
for(let i = 0 ; i < res ; i++){
    for(let j = 0 ; j < res ; j++){
        new_cell = document.createElement('div')
        new_cell.id = id_index(i, j)
        new_cell.className = 'cell'
        grid_div.appendChild(new_cell)
    }
}
// starting up game
grid[res-1][~~(res/2)] = EMPTY
revealCell(res-1, ~~(res/2))
grid[0][~~(res/2)] = EMPTY

document.getElementById(id_index(0, ~~(res/2))).style.backgroundColor = "green"

update_html()