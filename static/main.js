var syncClient;
var syncStream;
var message = $('#message');
var username = document.getElementById("username")

var colorBtn = $('#color-btn');
var clearBtn = $('#clear-btn');
var logoutBtn = $('#logout');

var requestBtn = $('#request-btn');
var releaseBtn = $('#release-btn');
var accessBtn = $('#access-btn');

var canvas = $('.whiteboard')[0];
var context = canvas.getContext('2d');
var current = {
    color: 'black'
};
var drawing = false;


$(function() {

    loadCanvas();

    var identity = ""
    var users = {}

    $.getJSON('/token', function(tokenResponse) {
        syncClient = new Twilio.Sync.Client(tokenResponse.token, { logLevel: 'info' });
        syncClient.on('connectionStateChanged', function(state) {
            if (state != 'connected') {
                message.html('Sync is not live (websocket connection <span style="color: red">' + state + '</span>)…');
            } else {

                if (!localStorage.getItem("identity")) {
                    localStorage.setItem("identity", tokenResponse.identity);
                    identity = tokenResponse.identity
                } else if (localStorage.getItem("identity") != tokenResponse.identity) {
                    identity = localStorage.getItem("identity")
                } else {
                    identity = tokenResponse.identity
                }

                username.innerHTML = "Logged in as: " + localStorage.getItem('identity')
                users = tokenResponse.userList
                console.log(identity)
                message.html('Sync is live');
            }
        });

        // create the stream object
        syncClient.stream('drawingData').then(function(stream) {
            syncStream = stream;
            // listen update and sync drawing data
            syncStream.on('messagePublished', function(event) {
                syncDrawingData(event.message.value);
            });
        });
    });

    function syncDrawingData(data) {
        var w = canvas.width;
        var h = canvas.height;
        drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
    }

    function drawLine(x0, y0, x1, y1, color, syncStream) {
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();

        if (!syncStream) { return; }
        var w = canvas.width;
        var h = canvas.height;

        // publish the drawing data to Twilio Sync server
        syncStream.publishMessage({
            x0: x0 / w,
            y0: y0 / h,
            x1: x1 / w,
            y1: y1 / h,
            color: color
        });

        saveCanvas();
    }

    function saveCanvas() {
        localStorage.setItem("myCanvas", canvas.toDataURL());
    }

    function loadCanvas() {
        const dataURL = localStorage.getItem("myCanvas");
        const img = new Image();

        img.src = dataURL;
        img.onload = function() {
            context.drawImage(img, 0, 0);
        };
    }

    function onMouseDown(e) {

        console.log(users)

        if (!users[identity]) {
            alert("You cannot draw. You dont have access")
            return
        }

        drawing = true;
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }

    function onMouseUp(e) {
        if (!drawing) { return; }
        drawing = false;
        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, syncStream);
    }

    function onMouseMove(e) {
        if (!drawing) { return; }
        drawLine(current.x, current.y, e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY, current.color, syncStream);
        current.x = e.clientX || e.touches[0].clientX;
        current.y = e.clientY || e.touches[0].clientY;
    }


    //limit the events number per second
    function throttle(callback, delay) {
        var previousCall = new Date().getTime();
        return function() {
            var time = new Date().getTime();

            if ((time - previousCall) >= delay) {
                previousCall = time;
                callback.apply(null, arguments);
            }
        };
    }


    document.getElementById("cPick").onchange = function() {
        var backRGB = this.value;
        changeColor(backRGB)
    }

    function changeColor(color) {
        // current.color = '#' + Math.floor(Math.random() * 16777215).toString(16); //change line color
        current.color = color; //change line color
        colorBtn.css('border', '5px solid ' + current.color);
    };

    function clearBoard() {

        if (!users[identity]) {
            alert("You dont have access")
            return
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        localStorage.removeItem('myCanvas')
        saveCanvas();
    };

    function onResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    async function handleRequest() {
        var dict = { 'id': identity };
        $.ajax({
            type: "POST",
            url: "/token/request", //localhost Flask
            data: JSON.stringify(dict),
            contentType: "application/json",
        });

        $.getJSON('/token/request/list', function(response) {
            users = response.users
            console.log(users)
        })

    }


    function handleRelease() {
        var dict = { 'id': identity };
        $.ajax({
            type: "POST",
            url: "/token/release", //localhost Flask
            data: JSON.stringify(dict),
            contentType: "application/json",
        });

        $.getJSON('/token/request/list', function(response) {
            users = response.users
        })

        alert("Control has been released")
    }

    function handleAccess() {
        console.log(identity)
        $.getJSON('/token/request/list', function(response) {
            users = response.users
        })

        if (users[identity]) {
            alert("You have access")
        } else {
            alert("You dont have access")
        }

    }

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseout', onMouseUp);
    canvas.addEventListener('mousemove', throttle(onMouseMove, 10));

    // mobile touch support
    canvas.addEventListener('touchstart', onMouseDown);
    canvas.addEventListener('touchend', onMouseUp);
    canvas.addEventListener('touchcancel', onMouseUp);
    canvas.addEventListener('touchmove', throttle(onMouseMove, 10));

    colorBtn.on('click', changeColor);
    clearBtn.on('click', clearBoard);

    requestBtn.on('click', handleRequest);
    releaseBtn.on('click', handleRelease);
    accessBtn.on('click', handleAccess);
    logoutBtn.on('click', handleLogout);

    onResize();


    window.onbeforeunload = function() {
        saveCanvas()
    }

    function handleLogout() {
        removeUser(localStorage.getItem('identity'))
        localStorage.removeItem('identity')
    }

    function removeUser(user) {
        var dict = { 'id': user };

        console.log(dict)
        $.ajax({
            type: "POST",
            url: "/token/delete", //localhost Flask
            data: JSON.stringify(dict),
            contentType: "application/json",
        });

        window.location.replace("/");

    }
});