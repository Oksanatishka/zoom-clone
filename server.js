const express = require('express');
// To initialize our express application:
const app = express();
// To create our server that's actually going to run
// we don't need to install 'http', it's built-in
const server = require('http').Server(app);
// specific version of uuid
const io = require('socket.io')(server);
const { v4: uuidv4 } = require('uuid');
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, { debug: true });

app.set('view engine', 'ejs');

// To set the public url for our script file:
app.use(express.static('public'));

app.use('/peerjs', peerServer);

// To create our first kind of url that we're going to hit (router)
app.get('/', (req, res) => {
    // res.status(200).send('Hello World!');
    // res.render('room');
    res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
    socket.on('join-room', (roomId, userId) => {
        // console.log('joined room');
        socket.join(roomId);
        // e.g. somebody joined my room and now i'm telling everybody else inside the room that this user has connected so they can add that user to their own stream
        socket.to(roomId).broadcast.emit('user-connected', userId);

        socket.on('message', (message) => {
            io.to(roomId).emit('createMessage', message);
        });
    });
});
// To listen on that server and actually run it:
// The server is localhost and port is 3030
server.listen(process.env.PORT || 3030);
