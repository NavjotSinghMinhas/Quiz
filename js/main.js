$home = "https://quiz.navjotsinghminhas.com"
$apiUrl = "https://api.navjotsinghminhas.com";

$(function () {

    $("label.btn").on('click', function () {
        $('#waiting').css('display', 'block');

        var choice = $(this).find('input:radio').val();
        var isCorrect = $(this).checking(choice);
        if (isCorrect == "CORRECT")
            $(this).addClass("correct");
        else {
            $(this).addClass("wrong");
            $("#optionLabel" + $ans).addClass("correct");
        }

        $("#quiz").find("label.btn").css("pointer-events", "none");

        answered($groupId, choice);

        $('#quizDiv').focus();
    });

    $.fn.checking = function (ck) {
        if (ck != $ans)
            return 'INCORRECT';
        else
            return 'CORRECT';
    };

    $('#userName').keypress(function (e) {
        var key = e.which;
        if (key == 13)  // the enter key code
            checkUserName();
    });

    $("#button-addon2").click(function () {
        _sendMessage()
    });
});

function getCategories() {
    getData($apiUrl + "/quiz/categories")
        .then(response => {
            if (response != "") {
                addCategories(response);
                $('#overlay').fadeOut();
            }
            else
                window.location.replace("Error.html?error=Internal Server Error");
        });
}

function addCategories(json) {
    for (var i = 0; i < json.length; i++) {
        var html = "<div class='grid-item'><div><span>" + json[i].Title + "</span><ul class='children'>";

        for (var j = 0; j < json[i].Topics.length; j++) {
            html += "<li><a href=" + $home + "/quiz.html?topic=" + json[i].Topics[j].Slug + "><img src=" + json[i].Topics[j].Icon + "/>" + json[i].Topics[j].Name + "</a></li>";
        }

        html += "</ul><div></div>";

        $('#categories').append(html);
    }

    $('.grid').masonry({
        itemSelector: '.grid-item'
    });
}

function initialize() {
    $groupId = getUrlParameter("id");

    if (typeof $groupId == "undefined" || isEmptyOrSpaces($groupId)) {
        $topic = getUrlParameter("topic");

        if (typeof $topic == "undefined" || isEmptyOrSpaces($topic))
            window.location.replace("Error.html?error=Page not found!");
    }

    $('#userNameModal').modal('show');
}

function joinChat() {
    if (typeof $groupId != "undefined" && !isEmptyOrSpaces($groupId))
        join($groupId, $username);
    else {
        $groupId = makeId(8);
        join($groupId, $username);

        $("#quizUrl").val("https://" + $(location).attr("hostname") + "/quiz.html?id=" + $groupId);
        $('#quizModal').modal('show');
    }
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

function clearAnswers() {
    $("#quiz").children("label").each(function () {
        if ($(this).hasClass('wrong'))
            $(this).removeClass("wrong");
        else
            $(this).removeClass("correct");

        if ($(this).hasClass('active'))
            $(this).removeClass("active");
    });
}

function sendMessageUI(message) {
    var element1 = "<div class=\"media ml-auto mb-3\"><div class=\"media-body right\"><div class=\"bg-primary rounded py-2 px-3 mb-2 inline\">";
    var element2 = $("<p class=\"text-small mb-0 text-white\"></p>").append(message);
    var element3 = "</div></div></div>";
    $("#chat").append(element1 + element2[0].outerHTML + element3);

    scrollToEnd();
}

function receiveMessageUI(user, message) {
    if (user == "<!AutomatedAll/>") {
        if (message == "GameStarted") {
            var element1 = "<div class=\"media mb-3\"><div class=\"media-body ml-3 center\"><div class=\"bg-automated rounded py-2 px-3 mb-2 inline\">";
            var element2 = $("<p class=\"mb-0 automated\">Game Started.</p>")
            var element3 = "</div></div></div>";
            $("#chat").append(element1 + element2[0].outerHTML + element3);

            startQuiz();
        }
        else {
            if (message.startsWith("<span>")) {
                $("#score").html(message);
                $("<br class=\"breakline\" /><span class=\"tab\"></span>").insertAfter("#score>span").not(":last");

                $('#waiting').css('display', 'none');

                setTimeout(function () {
                    getNextQuestion();
                }, 2000);
            }
            else if (message.includes("won!") || message.includes("lost")) {
                $("#winners").text(message);
                $('#winnerModal').modal('show');
            }
            else {
                var element1 = "<div class=\"media mb-3\"><div class=\"media-body ml-3 center\"><div class=\"bg-automated rounded py-2 px-3 mb-2 inline\">";
                var element2 = $("<p class=\"mb-0 automated\"></p>").append(message);
                var element3 = "</div></div></div>";
                $("#chat").append(element1 + element2[0].outerHTML + element3);
            }
        }
    }
    else if (user.startsWith("<!AutomatedUser/>")) {
        if (user == "<!AutomatedUser/>" + $username) {
            if (message == "GameAlreadyStarted!") {
                var element1 = "<div class=\"media mb-3\"><div class=\"media-body ml-3 center\"><div class=\"bg-automated rounded py-2 px-3 mb-2 inline\">";
                var element2 = $("<p class=\"mb-0 automated\">You are late to the party, but you can still win!</p>")
                var element3 = "</div></div></div>";
                $("#chat").append(element1 + element2[0].outerHTML + element3);

                startQuiz();
            }
            else {
                var element1 = "<div class=\"media mb-3\"><div class=\"media-body ml-3 center\"><div class=\"bg-automated rounded py-2 px-3 mb-2 inline\">";
                var element2 = $("<p class=\"mb-0 automated\"></p>").append(message);
                var element3 = "</div></div></div>";
                $("#chat").append(element1 + element2[0].outerHTML + element3);
            }
        }
    }
    else {
        var element1 = "<div class=\"media mb-3\"><div class=\"media-body ml-3\"><div class=\"bg-light rounded py-2 px-3 mb-2 inline\">";
        var element2 = $("<p class=\"small text-muted user\"></p>").append(user);
        var element3 = $("<p class=\"text-small mb-0 text-muted\"></p>").append(message);
        var element4 = "</div></div></div>";
        $("#chat").append(element1 + element2[0].outerHTML + element3[0].outerHTML + element4);
    }

    scrollToEnd();
}

function isEmptyOrSpaces(str) {
    return str === null || str.match(/^ *$/) !== null;
}

function _sendMessage() {
    if (!isEmptyOrSpaces($("#chatMessageContainer")[0].innerText)) {
        if (sendMessage($groupId, $username, $("#chatMessageContainer")[0].innerText)) {
            sendMessageUI($("#chatMessageContainer")[0].innerText);
            $("#chatMessageContainer")[0].innerText = "";
        }
    }
}

function makeId(length) {
    var result = '';
    var characters = '0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function checkUserName() {
    if (!isEmptyOrSpaces($("#userName").val())) {
        connect();

        $username = $("#userName").val();
        $('#userNameModal').modal('hide');
    }
}

function copyQuizUrl() {
    document.getElementById("quizUrl").select();
    document.execCommand("copy");
}

function hideQuizModal() {
    $('#startGameButtonDiv').css('display', 'flex');
    $('#quizModal').modal('hide');
    $('#quizContainer').css('display', 'block');
}

function initializeQuiz() {
    getData($apiUrl + "/quiz/Start?groupId=" + $groupId + "&topic=" + $topic)
        .then(response => {
            if (response) {
                if (startGame($groupId)) {
                    startQuiz();
                }
            }
        });
}

function startQuiz() {
    $('#startGameButtonDiv').css('display', 'none');

    getNextQuestion();

    $('#scoreContainer').css('display', 'block');
    $('#quizDiv').css('display', 'block');
    $('#quizContainer').css('display', 'block');
    $('#scrollButton').css('display', 'block');

    scrollToTop();
}

function getNextQuestion() {
    getData($apiUrl + "/quiz/Question?groupId=" + $groupId)
        .then(response => {
            if (response != "")
                setQuestion(response);
            else
                getNextQuestion();
        });
}

function setQuestion(json) {
    clearAnswers();
    $("#questionImage").css('display', 'none');
    $("#questionImage").attr("src", json.ImageURL);

    $("#question").text(json.Text);
    $("#option0").text(json.options[0].Text);
    $("#option1").text(json.options[1].Text);
    $("#option2").text(json.options[2].Text);
    $("#option3").text(json.options[3].Text);

    for (var i = 0; i < json.options.length; i++)
        if (json.options[i].IsCorrect)
            $ans = i;

    if (json.ImageURL != null) {
        $("#questionImage").attr("src", json.ImageURL);
        $("#questionImage").css('display', 'block');
    }

    $("#quiz").find("label.btn").css("pointer-events", "auto");
}

function scrollToTop() {
    $('html, body').animate({ scrollTop: $('#scoreContainer').offset().top }, 'slow');
    $('#quizDiv').focus();
}

function scrollToEnd() {
    $("#chat").animate({ scrollTop: $('#chat').prop("scrollHeight") }, 1000);
}

function navigateToHome() {
    window.location.href = $home;
}