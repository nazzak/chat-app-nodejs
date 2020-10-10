const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate data
  if (!username || !room) {
    return {
      error: "Username and room are required!",
    };
  }

  //Check if name is unique in the room
  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: "Username is in use!",
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const idx = users.findIndex((user) => user.id === id);

  if (idx !== -1) {
    // return the user removed from the array
    return users.splice(idx, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);

  return user;
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  const list = users.filter((user) => {
    return user.room === room;
  });

  return list;
};

// addUser({
//   id: 22,
//   username: "nazim",
//   room: "Bordeaux",
// });

// addUser({
//   id: 33,
//   username: "zak",
//   room: "NYC",
// });

// addUser({
//   id: 44,
//   username: "nazzak",
//   room: "    NYC",
// });

// // const removedUser = removeUser(22);

// // console.log(removedUser);
// console.log(users);

// console.log(getUsersInRoom("nyc"));

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
