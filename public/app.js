function getName() {
    console.log($('#users'));
    var name = prompt("Please enter your name", "Harry Potter");
    if (!name) {
        return getName();
    }
    var tokens = name.split(',');

    if (tokens.length > 1) {
        return $.trim(tokens[1]) + ' ' + $.trim(tokens[0]);
    }

    return name;
}

function escaped(s) {
    return $('<div></div>').html(s).html();
}

function init() {
    var name = getName();

    $('#data').attr('placeholder', 'send message as ' + name);
}

var socket = io.connect('/');

window.initiated = false;

// on connection to server, ask for user's name with an anonymous callback
socket.on('connect', function () {
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    socket.emit('adduser', name);
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username, data) {
    $('#conversation').append('<strong>' + escaped(username) + ':</strong> ' + escaped(data) + '<br/>');
});

// listener, whenever the server emits 'updateusers', this updates the username list
socket.on('updateusers', function (data) {
    $('#users').empty();
    $.each(data, function (key, value) {
        $('#users').append('<strong>' + key + '</strong>');
    });
});

socket.on('servernotification', function (data) {
    if (data.connected) {
        if (data.toSelf) data.username = 'you';
        $('#conversation').append('connected: <strong>' + escaped(data.username) + '</strong><br/>');
    } else {
        $('#conversation').append('disconnected: <strong>' + escaped(data.username) + '</strong><br/>');
    }
});

// on load of page
$(function () {
    // when the client hits ENTER on their keyboard
    $('#data').keypress(function (e) {
        if (e.which == 13) {
            var message = $('#data').val();
            $('#data').val('');
            // tell server to execute 'sendchat' and send along one parameter
            socket.emit('sendchat', message);
        }
    });
});
