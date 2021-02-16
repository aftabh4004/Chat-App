const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const {generateMessage, generateLocation} = require('./utils/message');
const {addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = 3000;
const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));


io.on('connection', (socket) => {
    console.log("New WebSocket Connection");

    socket.on('join', ({username, room}, callback) => {
        const {user, error} = addUser({id: socket.id, username: username, room: room});

        if(error){
            return callback({error: error})
        }
        socket.join(user.room);

        socket.emit('NewMessage', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('NewMessage', generateMessage('Admin', `${user.username} has joined.`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room),
        });
        callback({ user });
    });


    socket.on('sent', (msg, callback) => {
        const user = getUser(socket.id);
        const username = user.username[0].toUpperCase() + user.username.slice(1);

        io.to(user.room).emit('NewMessage', generateMessage(username, msg));
        callback();

    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('NewMessage', generateMessage('Admin', `${user.username} has leave the room`));
            
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room),
            });
        }
        
    });

    socket.on('sendLocation', (coords, acknowledge) => {
        const user = getUser(socket.id);
        const username = user.username[0].toUpperCase() + user.username.slice(1);
        io.to(user.room).emit('displayLocation', generateLocation(username, coords.latitude, coords.longitude));
        acknowledge();
    })

});


server.listen(port, () => {
    console.log();
    console.log(`Listening on port ${port}!`);
});
