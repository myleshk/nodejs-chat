function getName() {
    var name = prompt("Please enter your name", "Harry Potter");
    name = name ? name.trim() : false;
    if (!name) {
        return getName();
    }
    return name;
}

function escaped(s) {
    return $('<div></div>').html(s).html();
}

function init() {
    name = getName();
    // call the server-side function 'adduser' and send one parameter (value of prompt)
    socket.emit('adduser', name);
}

var socket = io.connect('/'),
    name = false;

init();

// if username invalid, redo init()
socket.on('invalidname', function () {
    alert("Name Exists/Invalid! Please choose another name.");
    init();
});

// listener, whenever the server emits 'updatechat', this updates the chat body
socket.on('updatechat', function (username, data) {
    $('#conversation').append('<strong>' + escaped(username) + ':</strong> ' + escaped(data) + '<br/>');
});

// listener, whenever the server emits 'updateusers', this updates the username list
socket.on('updateusers', function (data) {
    $('#users').empty();
    $.each(data, function (safe_name, username) {
        $('#users').append('<strong>' + username + '</strong><br>');
    });
});

socket.on('servernotification', function (data) {
    if (data.connected) {
        // update input placeholder
        $('#data').attr('placeholder', 'send message as ' + name);

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
