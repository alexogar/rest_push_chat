$(function () {
    "use strict";

    var username = null;

    var socket = $.atmosphere;
    var channel = null;

    var initChat = function() {
        $("#pleaseWaitDialog").modal();
        var request = new $.atmosphere.AtmosphereRequest();
        request.url = document.location.toString() + 'api/chat';
        request.contentType = "application/json";
        request.logLevel = 'debug';
        request.transport = 'websocket';
        //request.trackMessageLength = true;
        request.fallbackTransport= 'long-polling';


        request.onOpen = function(response) {
            $("#pleaseWaitDialog").modal("hide");
        };

        request.onMessage = function (response) {

            var message = response.responseBody;
            try {
                var json = jQuery.parseJSON(message);
                addAndParseMessage(json,true)
            } catch (e) {
                console.log('This doesn\'t look like a valid JSON: ', message);
                return;
            }



//
//            if (!logged) {
//                logged = true;
//                status.text(myName + ': ').css('color', 'blue');
//            } else {
//                var me = json.author == author;
//                var date =  typeof(json.time) == 'string' ? parseInt(json.time) : json.time;
//                addMessage(json.author, json.text, me ? 'blue' : 'black', new Date(date));
//            }
        };

        request.onClose = function(response) {
            console.log(response)
        };

        request.onError = function(response) {
            console.log(response)
//            content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
//                + 'socket or the server is down' }));
        };

        channel = socket.subscribe(request);
    };

    var addAndParseMessage = function(json,animate) {
        var author = json.author;
        var message = json.message;
        var timestamp = moment(json.timestamp).fromNow();

        if (author === username) {
            addMyMessage(author,message,timestamp,animate);
        } else {
            addOthersMessage(author,message,timestamp,animate);
        }
    }

    var addMessage = function(html,animate) {
        $("#chat").append(html);
        if (animate) {
            $("#scroll").animate({ scrollTop: $("#scroll")[0].scrollHeight }, "slow");
        } else {
            $("#scroll")[0].scrollTop = $("#scroll")[0].scrollHeight;
        }
    };

    var addOthersMessage = function(author,message,time,animate) {
        var html = "<li class=\"left clearfix\">"+
            "	<span class=\"chat-img pull-left\">"+
            "     <img src=\"http://placehold.it/50/55C1E7/fff&text=U\" alt=\"User Avatar\" class=\"img-circle\" />"+
            " </span>"+
            "     <div class=\"chat-body clearfix\">"+
            "         <div class=\"header\">"+
            "             <strong class=\"primary-font\">"+author+"</strong> <small class=\"pull-right text-muted\">"+
            "             <span class=\"glyphicon glyphicon-time\"></span>"+time+"</small>"+
            "         </div>"+
            "         <p>"+ message +
            "         </p>"+
            "     </div>"+
            " </li>"
        addMessage(html,animate);
    };

    var addMyMessage = function(author,message,time,animate) {
        var html = "<li class=\"right clearfix\">"+
            "		<span class=\"chat-img pull-right\">"+
            "    	<img src=\"http://placehold.it/50/FA6F57/fff&text=ME\" alt=\"User Avatar\" class=\"img-circle\" />"+
            "		</span>"+
            "    <div class=\"chat-body clearfix\">"+
            "        <div class=\"header\">"+
            "            <small class=\" text-muted\"><span class=\"glyphicon glyphicon-time\"></span>"+time+"</small>"+
            "            <strong class=\"pull-right primary-font\">"+author+"</strong>"+
            "        </div>"+
            "        <p>"+ message +
            "        </p>"+
            "    </div>"+
            "</li>";
        addMessage(html,animate);
    };

    var fillMessages = function() {
        $.get("/api/chat/messages", function(data) {
            if (!data) {
                data = {};
                data.list = [];
            }

            if (data.list["@type"])
                data.list = [data.list];

            for(var m in data.list) {
                addAndParseMessage(data.list[m],false);
            }

            initChat();
        })
    };

    var enterChatRoom = function() {
        username = $("#login_form_name").val()
        if (username === null || username === '') {
            $("#login_form_name_container").addClass("has-error");
            return;
        }

        console.log("Username: " + username);
        $("#login_form").modal('hide');

        fillMessages();
    };

    $("#login_form").modal();
    $("#login_form_enter").click(function() {
        enterChatRoom();
    });

    $("#login_form_name").keydown(function(e) {
        if (e.keyCode === 13) {
            enterChatRoom();
        }
    });

    var sendMessage = function(message) {
        if (message === null || message === '') {
            $("#btn-input").addClass("has-error");
            return;
        }

        channel.push(jQuery.stringifyJSON({ author: username, message: message, timestamp : new Date() }));

        $("#btn-input").val('')
        $("#btn-input").removeClass("has-error");
    };


    $("#btn-chat").click(function() {
        sendMessage($("#btn-input").val())
    });

    $("#btn-input").keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            sendMessage(msg)
        }
    });







//    var subSocket = socket.subscribe(request);
//
//    input.keydown(function(e) {
//
//
//            // First message is always the author's name
//            if (author == null) {
//                author = msg;
//            }
//
//            subSocket.push(jQuery.stringifyJSON({ author: author, message: msg }));
//            $(this).val('');
//
//            input.attr('disabled', 'disabled');
//            if (myName === false) {
//                myName = msg;
//            }
//        }
//    });
//
//    function addMessage(author, message, color, datetime) {
//        content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' +
//            + (datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours()) + ':'
//            + (datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() : datetime.getMinutes())
//            + ': ' + message + '</p>');
//    }
});

