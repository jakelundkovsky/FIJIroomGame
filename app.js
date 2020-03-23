const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const logic = require(__dirname + '/logic.js');
// console.log(logic);
// mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true});

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//name, prevRoom, currRoom, inked
let players = {
  0: new Player("Trimpe", "King Ranch", null, false),
  1: new Player("Lusk", "Overlook", null, false),
  2: new Player("Collins", "The Cove", null, false),
  3: new Player("Baselj", "All In", null, false),
  4: new Player("French", "Silicon Valley", null, false),
  5: new Player("McEvoy", "The Cove", null, false),
  6: new Player("Schenken", "Kings Landing", null, false),
  7: new Player("Garcia", "Treehouse", null, false),
  8: new Player("Sullivan", "King Ranch", null, false),
  9: new Player("Lundkovsky", "Camp David", null, false),
  10: new Player("Jaberi", "Silicon Valley", null, false),
  11: new Player("Christensen", "Crooked Creek", null, false),
  12: new Player("Ryan", "Greenbow", null, false),
  13: new Player("Bruneau", null, null, false),
  14: new Player("Somers", "Friend Zone", null, false),
  15: new Player("Jones", "Crooked Creek", null, false),
  16: new Player("Hanes", null, null, false),
  17: new Player("Karle", "Hooverville", null, false),
  18: new Player("OReilly", "Meatlocker", null, false),
  19: new Player("Hearnes", "Blue Baboon Farm", null, false),
  20: new Player("Kruszeski", "Spilled Not Stirred", null, false),
  21: new Player("Ellis", "Meatlocker", null, false),
  22: new Player("Hancharik", "Wall Street", null, false),
  23: new Player("Nayebi", "Section 80", null, false),
  24: new Player("Pless", "Wall Street", null, false),
  25: new Player("Sehgal", "Endless Summer", null, false),
  26: new Player("Taylor", "Section 80", null, false),
  27: new Player("Hessler", "Wall Street", null, false),
  28: new Player("Phillips", null, null, false),
  29: new Player("DiPrete", null, null, false),
  30: new Player("Matinfar", null, null, false),
  31: new Player("Gillespie", null, null, false),
  32: new Player("Johnson", null, null, false),
  33: new Player("Lopez", null, null, false),
  34: new Player("Popik", null, null, false),
  35: new Player("Haskell", null, null, false),
  36: new Player("Eriksson", null, null, false),
  37: new Player("McCarthy", null, null, false),
  38: new Player("Cho", null, null, false),
  39: new Player("Dunlap", null, null, false),
  40: new Player("Melies", null, null, false),
  41: new Player("Rostick", null, null, false),
  42: new Player("Lavu", null, null, false),
  43: new Player("Hinckley", null, null, false),
  44: new Player("McLean", null, null, false),
  45: new Player("Howe", null, null, false),
  46: new Player("Balaga", null, null, false),
  47: new Player("Cooper", null, null, false),
  48: new Player("Lott", null, null, false),
  49: new Player("Conerly", null, null, false),
  50: new Player("Greene", null, null, false),
  51: new Player("Burgett", null, null, false)
}; // convert to api+DB after testing

let numPlayers = Object.keys(players).length;

let rooms = {
  "Short Bus": new Room(2, []),
  "Wall Street": new Room(2, []),
  "Section 80": new Room(2, []),

  "Blue Baboon Farm": new Room(2, []),
  "Hotel California": new Room(2, []),
  "Meat Locker": new Room(2, []),

  "Beltline": new Room(2, []),
  "Kings Landing": new Room(2, []),
  "Amen Corner": new Room(2, []),
  "Albuquerque": new Room(2, []),

  "Greenbow": new Room(2, []),
  "King Ranch": new Room(2, []),
  "Overlook": new Room(2, []),

  "All In": new Room(2, []),
  "Endless Summer": new Room(2, []),
  "Crooked Creek": new Room(2, []),

  "Bayou": new Room(3, []),
  "Hooverville": new Room(4, []),
  "Camp David": new Room(1, []),

  "The Cove": new Room(2, []),
  "Silicon Valley": new Room(2, []),

  "Spilled Not Stirred": new Room(2, []),
  "Mason Dixon Line": new Room(2, []),
  "Friend Zone": new Room(2, []),
  "Treehouse": new Room(2, [])

}; // convert to DB after testing

let roundsRemaining = 10;

let i = 0; //iteration

// let gameStarted = false;

//GET METHODS
app.get('/', function(req, res) {
    res.render("settings", {});
});

app.get('/roomGame', function(req, res) {
    res.render("home", getTurn(i % numPlayers));
});

app.get('/about', function(req, res) {
    res.render("about", {});
});

app.get('/contact', function(req, res) {
    res.render("contact", {});
});

app.get('/finalResults', function(req, res) {
    res.render('finalResults', {
      rooms: rooms,
      players: players
    });
});

app.get('/resetGame', function(req, res) {
    res.render('resetGame', {});
});


//POST METHODS
app.post('/', function(req, res) {
    roundsRemaining = parseInt(req.body.rounds) - 1;
    res.redirect('/roomGame');
});

app.post('/roomGame', function(req, res) {
    let choice = req.body.choice;
    let playerId = i % numPlayers;
    if (choice === "Ink") {
      //ink the player
      ink(playerId);
    } else if (choice !== "Pass" && (typeof choice !== 'undefined')) {
      console.log(choice);
      //move the player to given room
      switchToRoom(playerId, choice);
    }


    //need to have a check if all players inked to redirect to results
    do {
      i++;
      if ((i % numPlayers) === 0) {
        roundsRemaining--;
      }

      let gameOver = true;
      Object.entries(players).forEach(function(player) {
        if (!player[1].inked) {
          gameOver = false;
        }
      });

      //if out of rounds or everyone's inked
      if (roundsRemaining === -1 || gameOver) {
        res.redirect('/finalResults');
      }

    } while (players[i % numPlayers].inked);

    res.redirect('/roomGame');
});

app.post('/finalResults', function(req, res) {
    res.redirect('/resetGame');
});

app.post('/resetGame', function(req, res) {
    resetGame();
    res.redirect('/');
});

app.listen(3000, function() {
  console.log("Running on port 3000.");
});






//========================= METHODS =============================

//////////// Constructors //////////
function Player(name, prevRoom, currRoom, inked) {
  //this.seniority = seniority; // Number: 0 is best, 50 is worst -- also functions as an id
  this.name = name; // String
  this.prevRoom = prevRoom; // String
  this.currRoom = currRoom; // String
  this.inked = inked;
  //maybe go back and add roomsOnTheBoard, switchToRoom, ink, getTurn as methods for player object
}

function Room(capacity, occupants) {
  //this.name = name; //String
  this.capacity = capacity; //number
  this.occupants = occupants; // array of player ids/seniorities (Numbers)
}


//Gets available rooms that players CAN switch to
//input: id: (Number)
//output: array of available rooms ([Strings])
function roomsOnTheBoard(id) {
  let availableRooms = [];

  //check for inks
  Object.entries(rooms).forEach(function(room) {
    //make sure player is not currently in that room
    if (!(players[id].currRoom === room[0])) {
      if (room[1].occupants.length < room[1].capacity) {
        //open spot in room
        availableRooms.push(room[0]);
      } else {
        //finds if player in room w/ lower seniority & !inked & not their room
        let isAvailable = false;
        for (var i = 0; i < room[1].occupants.length; i++) {
          if (id < room[1].occupants[i] && !room[1].occupants[i].inked && !(players[room[1].occupants[i]].prevRoom === room[0])) {
            isAvailable = true;
          }
        }

        if (isAvailable) {
          availableRooms.push(room[0]);
        }
      }
    }
  });

  return availableRooms; //returns array of room names (Strings)
}


//switches given player to given room
function switchToRoom(id, room) {
  let player = players[id];
  let destRoom = rooms[room]; //destination Room Object

  //remove player from his room before moving him to new room
  if (player.currRoom !== null) {
    let oldRoom = rooms[player.currRoom];
    let indexToSplice = 0;
    for (var i = 0; i < oldRoom.occupants.length; i++) {
      if (oldRoom.occupants[i] === id) {
        indexToSplice = i;
      }
    }
    oldRoom.occupants.splice(indexToSplice, 1);
  }

  //open space in rooms
  if (destRoom.occupants.length < destRoom.capacity) {
    destRoom.occupants.push(id);
    player.currRoom = room;
  } else { //find & kick out lowest seniority without the inkies

    //get the worst seniority/index that isn't inked
    let worstSeniorityInRoom = 0;
    let indexToReplace = 0;
    for (var i = 0; i < destRoom.occupants.length; i++) {
      if (destRoom.occupants[i] > worstSeniorityInRoom && !destRoom.occupants[i].inked) {
        worstSeniorityInRoom = destRoom.occupants[i];
        indexToReplace = i;
      }
    }

    destRoom.occupants[indexToReplace] = id; // replace kicked out noob in room array
    players[worstSeniorityInRoom].currRoom = null; //kicked out player to the VOID
    players[id].currRoom = room; // players currRoom = room

  }

}


//Inks  a player
//input: id (Number)
//output: void
function ink(id) {
  let player = players[id];

  //already in correct room, just ink and return
  if (player.prevRoom === player.currRoom) {
    player.inked = true;
    return;
  }

  let destRoom = rooms[player.prevRoom];

  //remove player from his room before moving him to new room
  if (player.currRoom !== null) {
    let oldRoom = rooms[player.currRoom];
    let indexToSplice = 0;
    for (var i = 0; i < oldRoom.occupants.length; i++) {
      if (oldRoom.occupants[i] === id) {
        indexToSplice = i;
      }
    }
    oldRoom.occupants.splice(indexToSplice, 1);
  }

  if (destRoom.occupants.length < destRoom.capacity) {
    destRoom.occupants.push(id);
    player.currRoom = player.prevRoom;
  } else { //find & kick out lowest seniority without the inkies

    //get the worst seniority/index that isn't inked
    let worstSeniorityInRoom = 0;
    let indexToReplace = 0;
    for (var i = 0; i < destRoom.occupants.length; i++) {
      if (destRoom.occupants[i] > worstSeniorityInRoom && !destRoom.occupants[i].inked) {
        worstSeniorityInRoom = destRoom.occupants[i];
        indexToReplace = i;
      }
    }

    destRoom.occupants[indexToReplace] = id; // replace kicked out noob in room array
    players[worstSeniorityInRoom].currRoom = null; //kicked out player to the VOID
    players[id].currRoom = players[id].prevRoom; // players currRoom = room

  }

  player.inked = true;
}


//Sets up a turn for a player
function getTurn(id) {
  let availRooms = roomsOnTheBoard(id);
  let options = [];

  if (players[id].currRoom !== null) {
    options.push("Pass");
  }

  if (availRooms.length !== 0) {
    options.push("Change Rooms");
  }

  if (players[id].prevRoom !== null) {
    options.push("Ink");
  }

  //["Pass", "Change Rooms", "Ink"]

  return {
    id: id,
    name: players[id].name,
    currRoom: players[id].currRoom,
    availRooms: availRooms,
    options: options,
    roundsRemaining: roundsRemaining,
    rooms: rooms,
    players: players
  };
}


function resetGame() {
  i = 0;
  roundsRemaining = 10;

  //reset players
  Object.entries(players).forEach(function(player) {
    player[1].inked = false;
    player[1].currRoom = null;
  });

  //reset rooms
  Object.entries(rooms).forEach(function(room) {
    room[1].occupants = [];
  });
}
