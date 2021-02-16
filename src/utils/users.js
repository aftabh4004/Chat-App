const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if(!username || !room){
        return {
            error: "Username and room can't be empty"
        };
    }

    const existingUser = users.find((user) =>{
        return user.username === username || user.username === username;
    });

    if(existingUser){
        return {
            error: "Username alreay taken in the room"
        };
    }

    const user = { id: id, username: username, room: room }
    users.push(user);
    return { user };
}


const removeUser = (id) => {
    const index = users.findIndex(user => user.id === id);

    if(index !== -1){
        return users.splice(index, 1)[0];
    }
}

const getUser = (id) => {
    return  users.find( user => user.id === id );
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room);
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
}