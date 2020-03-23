//Gets available rooms that players CAN switch to
//input: id: (Number)
//output: array of available rooms ([Strings])
module.exports.roomsOnTheBoard = roomsOnTheBoard;
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
        //finds if player in room w/ lower seniority & !inked
        let isAvailable = false;
        for (var i = 0; i < room[1].occupants.length; i++) {
          if (id < room[1].occupants[i] && !room[1].occupants[i].inked) {
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
module.exports.switchToRoom = switchToRoom;
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
module.exports.ink = ink;
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
module.exports.getTurn = getTurn;
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

module.exports.resetGame = resetGame;
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
