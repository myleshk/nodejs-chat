import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const usernames = {};

app.set('view engine', 'ejs');
app.set('view options', {layout: false});
app.use('/public', express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', (req, res) => res.render('index'));

io.sockets.on('connection', (socket) => {
    socket.on('sendchat', (data) => {
        io.sockets.emit('updatechat', socket.username, data);
    });

    socket.on('adduser', (username) => {
        var safe_name = username.toLowerCase();

        if (usernames[safe_name]) {
            socket.emit('invalidname');
            return;
        }

        socket.username = username;
        socket.safe_name = safe_name;

        usernames[socket.safe_name] = username;

        socket.emit(
            'servernotification', {
                connected: true,
                toSelf: true,
                username: username
            });

        socket.broadcast.emit('servernotification', {connected: true, username: username});

        io.sockets.emit('updateusers', usernames);
    });

    socket.on('disconnect', () => {
        delete usernames[socket.safe_name];

        io.sockets.emit('updateusers', usernames);

        socket.broadcast.emit('servernotification', {username: socket.username});
    });
});

server.listen(process.env.PORT || 3000);