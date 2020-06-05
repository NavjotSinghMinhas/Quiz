"use strict";

var connection = new signalR.HubConnectionBuilder().withUrl("https://api.navjotsinghminhas.com/quizchat").build();

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