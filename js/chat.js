"use strict";
var connectionId;

var connection = new signalR.HubConnectionBuilder()
    .withUrl($apiUrl + "/quizchat")
    .withAutomaticReconnect([0, 3000, 10000, 20000])
    .build();

function connect() {
    connection.start()
        .then(function () {
            connectionId = connection.connectionId;
            joinChat();
            return true;
        })
        .catch(function (err) {
            console.error(err.toString());
            return false;
        });
}

function join(id, user) {
    connection.invoke("Join", id, user).catch(function (err) {
        return console.error(err.toString());
    });

    return true;
}

function answered(groupId, optionIndex) {
    connection.invoke("Answered", groupId, optionIndex).catch(function (err) {
        return console.error(err.toString());
    });

    return true;
}

function startGame(id) {
    connection.invoke("startGame", id).catch(function (err) {
        return console.error(err.toString());
    });

    return true;
}

function sendMessage(id, user, message) {
    connection.invoke("SendMessage", id, user, message).catch(function (err) {
        return console.error(err.toString());
    });

    return true;
}

function reconnected(id, user) {
    connection.invoke("Reconnected", id, user).catch(function (err) {
        return console.error(err.toString());
    });
}

connection.on("ReceiveMessage", function (user, message) {
    receiveMessageUI(user, message);
});

connection.onreconnecting(error => {
    console.log("Reconnecting because of " + error);
    receiveMessageUI("<!AutomatedUser/>" + $username, "Reconnecting...");
});

connection.onreconnected(_connectionId => {
    console.log("Reconnected with connection id: " + _connectionId);
    sendMessageUI("Reconnected!");
    join($groupId, $username);

    reconnected($groupId, $username, connectionId);
    connectionId = _connectionId;
});

connection.onclose(async () => {
    console.log("Connection closed, restarting.");
    receiveMessageUI("<!AutomatedUser/>" + $username, "Internet disconnected, retrying connection.");
    while (!await connect()) { }
});