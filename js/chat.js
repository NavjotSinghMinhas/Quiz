"use strict";

var connection = new signalR.HubConnectionBuilder()
    .withUrl("https://api.navjotsinghminhas.com/quizchat")
    .withAutomaticReconnect([0, 2000, 4000, 8000])
    .build();

function connect() {
    connection.start()
        .then(function () {
            joinChat();
        })
        .catch(function (err) {
            return console.error(err.toString());
        });
}

function join(id, user) {
    connection.invoke("Join", id, user).catch(function (err) {
        return console.error(err.toString());
    });

    return true;
}

function answered(groupId, userName, optionIndex) {
    connection.invoke("Answered", groupId, userName, optionIndex).catch(function (err) {
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

connection.on("ReceiveMessage", function (user, message) {
    receiveMessageUI(user, message);
});

connection.onreconnecting(error => {
    console.log("Reconnecting because of " + error);
    receiveMessageUI("<!AutomatedUser/>" + $username, "Reconnecting...");
});

connection.onreconnected(connectionId => {
    console.log("Reconnected with connection id: " + connectionId);
    receiveMessageUI("<!AutomatedUser/>" + $username, "Reconnected.");
    join($groupId, $username);

    sendMessage($groupId, $username, $username + " reconnected.");
});

connection.onclose(async () => {
    console.log("Connection closed, restarting.");
    receiveMessageUI("<!AutomatedUser/>" + $username, "Internet disconnected, retrying connection.");
    await connect();
});