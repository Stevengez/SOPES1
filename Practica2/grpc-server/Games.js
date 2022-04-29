/** ##### ROCK PAPER SCISSORS ###### */
const PAPER = 1; 
const ROCK = 2;
const SCISSORS = 3;

function randomSel(player, max){
  let result = {
    player: player,
    selection: Math.round(
        (Math.random()*(max-1)+1),0
    )
  }
  return result;
}

function getPairWinnerRPS(pair){
    if(
        pair.p1.selection == PAPER && pair.p2.selection == ROCK
    ){
        //console.log(`${pair.p1.player} (Papel) vs ${pair.p2.player}(Roca)`); 
        return pair.p1.player;
    }else if(
        pair.p1.selection == PAPER && pair.p2.selection == SCISSORS
    ){
        //console.log(`${pair.p1.player} (Papel) vs ${pair.p2.player}(Tijeras)`);
        return pair.p2.player;
    }else if(
        pair.p1.selection == PAPER && pair.p2.selection == PAPER
    ){
        //console.log(`${pair.p1.player} (Papel) vs ${pair.p2.player}(Papel)`);
        return pair.p1.player > pair.p2.player ? (pair.p1.player):(pair.p2.player);
    }else if(
        pair.p1.selection == ROCK && pair.p2.selection == ROCK
    ){
        //console.log(`${pair.p1.player} (Roca) vs ${pair.p2.player}(Roca)`);
        return pair.p1.player > pair.p2.player ? (pair.p1.player):(pair.p2.player);
    }else if(
        pair.p1.selection == ROCK && pair.p2.selection == SCISSORS
    ){
        //console.log(`${pair.p1.player} (Roca) vs ${pair.p2.player}(Tijeras)`);
        return pair.p1.player;
    }else if(
        pair.p1.selection == ROCK && pair.p2.selection == PAPER
    ){
        //console.log(`${pair.p1.player} (Roca) vs ${pair.p2.player}(Papel)`);
        return pair.p2.player;
    }else if(
        pair.p1.selection == SCISSORS && pair.p2.selection == ROCK
    ){
        //console.log(`${pair.p1.player} (Tijeras) vs ${pair.p2.player}(Roca)`);
        return pair.p2.player
    }else if(
        pair.p1.selection == SCISSORS && pair.p2.selection == SCISSORS
    ){
        //console.log(`${pair.p1.player} (Tijeras) vs ${pair.p2.player}(Tijeras)`);
        return pair.p1.player > pair.p2.player ? (pair.p1.player):(pair.p2.player);
    }else if(
        pair.p1.selection == SCISSORS && pair.p2.selection == PAPER
    ){
        //console.log(`${pair.p1.player} (Tijeras) vs ${pair.p2.player}(Papel)`);
        return pair.p2.player;
    }
    return -1;
}

function processPairsRPS(pairArray) {
  let winners = [];
  pairArray.forEach((pair) => {
      let winner = getPairWinnerRPS(pair);
      winners.push(winner);
  });
  if(winners.length == 1) return winners[0];
  return processPairsRPS(pairPlayers(winners, 3));
}

function pairPlayers(players, max){
  let pairlist = [];
  for(let i=0;i<players.length;i=i+2){
    if(i+1 < players.length){
      let pair = {
        p1: randomSel(players[i], max),
        p2: randomSel(players[i+1], max)
      }
      pairlist.push(pair);
    }else{
      let pair = {
        p1: randomSel(i+1, max),
        p2: randomSel(i+1, max)
      }
      pairlist.push(pair);
    }
  }
  return pairlist;
}

const rps = (players) => {
    console.log("Starting RPS for ",players, " players");
    let playerList = [];
    for(let i=1;i<=players;i++){
        playerList.push(i);
    }
    let list = pairPlayers(playerList, 3);
    let winner = processPairsRPS(list);
    console.log("Final Winner: ",winner);
    return winner;
}
/** ############################## */

/** ######## Flip the Coin ######### */
const CARA = 1;
const ESCUDO = 2;

function getPairWinnerFlipit(pair){
    let flipResult = Math.round(Math.random()*1+1);
    if(pair.p1.selection == flipResult){
        return pair.p1.player
    }
    return pair.p2.player;
}

function processPairsFlipit(pairArray){
    let winners = [];
    pairArray.forEach((pair) => {
        let winner = getPairWinnerFlipit(pair);
        winners.push(winner);
    });
    if(winners.length == 1) return winners[0];
    return processPairsFlipit(pairPlayers(winners, 2));
}

const flipit = (players) => {
    console.log("Starting Toss for ",players, " players");
    let playerList = [];
    for(let i=1;i<=players;i++){
        playerList.push(i);
    }
    let list = pairPlayers(playerList, 2);
    let winner = processPairsFlipit(list);
    console.log("Final Winner: ",winner);
    return winner;
}
/** ################################ */

/** ######## Biggest Number ######### */
const min = 1;
const max = 100;

const bigBrother = (players) => {
    console.log("Starting RumbleBiggest for ",players, " players");
    let playerList = [];
    for(let i=1;i<=players;i++){
        playerList.push(i);
    }
    let list = pairPlayers(playerList, max);

    let maximum = {
        player: 0,
        selection: 0
    };
    list.forEach((pair) => {
        if(pair.p1.selection > maximum.selection){
            maximum = pair.p1;
        }

        if(pair.p2.selection > maximum.selection){
            maximum = pair.p2;
        }
    });

    console.log(`Final Winner: ${maximum.player}, (${maximum.selection})`)
    return maximum.player;
}

/** ################################# */

/** ######## Biggest Number ######### */

const smallBrother = (players) => {
    console.log("Starting RumbleSmallets for ",players, " players");
    let playerList = [];
    for(let i=1;i<=players;i++){
        playerList.push(i);
    }
    let list = pairPlayers(playerList, max);

    let minimum = {
        player: 0,
        selection: 101
    };
    
    list.forEach((pair) => {
        if(pair.p1.selection < minimum.selection){
            minimum = pair.p1;
        }

        if(pair.p2.selection < minimum.selection){
            minimum = pair.p2;
        }
    });

    console.log(`Final Winner: ${minimum.player}, (${minimum.selection})`)
    return minimum.player;
}

/** ################################# */

/** ########### Roulette ############ */

const roulette = (players) => {
    console.log("Starting Roulette for ",players, " players");
    let playerList = [];
    for(let i=1;i<=players;i++){
        playerList.push(i);
    }

    while(playerList.length > 1){
        let randomIndex = Math.round(Math.random()*(playerList.length-1));
        playerList.splice(randomIndex, 1);
    }

    console.log(`Just (${playerList.length}) player remaining: ${playerList[0]}`);
    return playerList[0];
}

/** ################################# */


module.exports = {
    rps,
    flipit,
    bigBrother,
    smallBrother,
    roulette
}