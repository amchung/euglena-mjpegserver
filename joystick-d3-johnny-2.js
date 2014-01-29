// main requestAnimFrame for all the animation
﻿window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 30);
    };
})();

//// for drawing the joystick
var control_canvas,
c, // context 2D
halfWidth,
halfHeight,
leftPointerID = -1,	// variable for mouse left button cursor interactions
leftPointerPos = new Vector2(0, 0),
leftPointerStartPos = new Vector2(0, 0),
leftVector = new Vector2(0, 0);
arrow = new VectorLED(0, 0, 0, 0);	// vector for LED direction
joy_arrow = new VectorLED(0, 0, 0, 0);	// vector used for direction calculations

var touches; // collections of pointers

/////////////////////////////// ARDUINO SETUP 

// LED setup
//var led1; //-90 D
//var led2; //0 R
//var led3; //90 U
//var led4; //180=-180 L
var max_val; // threshold radius of the joystick
var LEDloopON = false;

///////////////////////////// ARDUINO SETUP END

var username = "noname";	// for socket.io
var socket;					// for socket.io

document.addEventListener("DOMContentLoaded", init);
        
window.onorientationchange = resetCanvas;	// resize when you resize the browser
window.onresize = resetCanvas;

function init() {
    setupCanvas();
    setupD3();
    setupMotionDetection();
    
    touches = new Collection();
    
    onReady();
}

function onReady() {
////// jQuery for the sliders
   // number of the virtual objects
    $("#n_slider").slider({
        step: 1,
        min : 1,
        max : 20,
        value: 4
    });

    $('#n_value').text("Value: 4");
    
    $( "#n_slider" ).bind( "slide", function(event, ui) {
        var value = ui.value;
        $('#n_value').text("Value: " + value);
        n = value;
    });    
    
   // size of the virtual objects
    $("#size_slider").slider({
        step: 10,
        min : 20,
        max : 200,
        value : 80
    });

    $('#size_value').text("Value: 80");
    
    $( "#size_slider" ).bind( "slide", function(event, ui) {
        var value = ui.value;
        $('#size_value').text("Value: " + value);
        console.log(value);
        l = value;
    });
    // speed of the virtual objects       
    $("#v_slider").slider({
        step: 0.05,
        min : 0.0,
        max : 1.0,
        value : 0.4
    });

    $('#v_value').text("Value: 0.40");
    
    $( "#v_slider" ).bind( "slide", function(event, ui) {
        var value = ui.value;
        $('#v_value').text("Value: " + value);
        console.log(value);
        v = value;
    });

    // brownian motion setting of the virtual objects
    $("#br_slider").slider({
        step: 0.05,
        min : 0.0,
        max : 1.0,
        value: 0
    });

    $('#br_value').text("Value: 0.00");
    
    $( "#br_slider" ).bind( "slide", function(event, ui) {
        var value = ui.value;
        $('#br_value').text("Value: " + value.toFixed(2));
        brown_const = value;
    });
    
////// jQuery for the socket.io
    // username input
        $('input[name=setUsername]').click(function(){
        	if($('input[name=usernameTxt]').val() != ""){
                username = $('input[name=usernameTxt]').val();
                    var msg = {type:'setUsername', user:username};
                    socket.json.send(msg);
                }
            $('#username').slideUp("slow",function(){
                $('#entergame').slideDown("slow");
            });
        });
        
        $("input[name=gamestartBtn]").click(function(){
            resetGame();
        });
    // chats and score postings        
        socket = new io.connect('http://171.65.102.132:3002');
        var chat = $('#chat');
        var board = $('#board');

        socket.on('connect', function() {
            console.log("Connected!");
            socket.emit('message', {channel:'realtime'});
        });
        
        socket.on('message', function(message){
		var str = message.split("&&");
		if (Number(str[0]))
		{
			chat.append(str[1] + '<br />');
		}else{
			var ledArray = str[1].split("^");
			arrow.int1 = ledArray[0];
			arrow.int2 = ledArray[1];
			arrow.int3 = ledArray[2];
			arrow.int4 = ledArray[3];
		}
        });
                
        socket.on('postscore', function(score){
                board.empty();
                for (var i=0;i<score.length;i++){
                        if(i==0){
                                board.append('<span style="color: #FA6600">'+ score[i][0]+'  :  '+score[i][1]+'</span> <br />');
                        }else{
                                board.append(score[i][0]+'  :  '+score[i][1]+ '<br />');
                        }
                }
                board.fadeOut('fast');
                board.fadeIn('fast');
                board.fadeOut('fast');
                board.fadeIn('fast');
        });

        socket.on('disconnect', function() {
                console.log('disconnected');
                chat.html("<b>Disconnected!</b>");
        });

        $("input[name=sendBtn]").click(function(){
                var msg = {type:'chat',message:username + " : " + $("input[name=chatTxt]").val()}
                socket.json.send(msg);
                $("input[name=chatTxt]").val("");
        });

////// EventListeners for joystick canvas
    control_canvas.addEventListener('pointerdown', onPointerDown, false);
    control_canvas.addEventListener('pointermove', onPointerMove, false);
    control_canvas.addEventListener('pointerup', onPointerUp, false);
    control_canvas.addEventListener('pointerout', onPointerUp, false);
    // start drawing joystick loop
    requestAnimFrame(joystick_draw);
}

function joystick_draw() {
    c.clearRect(0, 0, control_canvas.width, control_canvas.height);
        
    c.beginPath();
    c.moveTo(halfWidth, halfHeight-4);
    c.strokeStyle = "rgba(250, 102, 0, 1)";
    c.lineWidth = 2;
    c.lineTo(halfWidth, halfHeight+4);
    c.stroke();
            
    c.beginPath();
    c.moveTo(halfWidth+4, halfHeight);
    c.strokeStyle = "rgba(250, 102, 0, 1)";
    c.lineWidth = 2;
    c.lineTo(halfWidth-4, halfHeight);
    c.stroke();
    
    drawCircles(halfWidth, halfHeight);
    
        //// mouse event loop
    touches.forEach(function (touch) {
        if (touch.identifier == leftPointerID) {
	// draw the joystick in the control canvas
            var alpha = arrow.trimArrow(leftVector, max_val);
            
            c.beginPath();
            c.fillStyle = "rgba(250, 102, 0, 1)";
            c.arc(leftPointerPos.x, leftPointerPos.y, 16, 0, Math.PI * 2, true);
            c.fill();
            
            c.beginPath();
            c.moveTo(leftPointerStartPos.x,leftPointerStartPos.y);
            c.strokeStyle = "rgba(250, 102, 0, 1)";
            c.lineTo(leftPointerStartPos.x+max_val*(arrow.int2-arrow.int4),leftPointerStartPos.y+max_val*(arrow.int1-arrow.int3));
            c.lineWidth = 3;
            c.stroke();
                        
            c.beginPath();
            c.fillStyle = "rgba(255, 255, 255, "+alpha+")";
            c.arc(halfWidth, halfHeight, 16, 0, Math.PI * 2, true);
            c.fill();
                        
            c.beginPath();
            c.fillStyle = "#fff"; 
            c.fillText(alpha,halfWidth-10, halfHeight-25);
                
            c.beginPath();
            c.fillStyle = "#dd6600";
            var theta = leftVector.angle();
            c.fillText(theta.toFixed(0),leftPointerPos.x+10, leftPointerPos.y-20);
            // send the input to johnny five
            	
        }
    });

    requestAnimFrame(joystick_draw);
    if(LEDloopON) 
    {
        changeLED(1);
    }
}

function givePointerType(event) {
    switch (event.pointerType) {
        case event.POINTER_TYPE_MOUSE:
            return "MOUSE";
            break;
        case event.POINTER_TYPE_PEN:
            return "PEN";
            break;
        case event.POINTER_TYPE_TOUCH:
            return "TOUCH";
            break;
    }
}

function onPointerDown(e) {
    var newPointer = { identifier: e.pointerId, x: e.clientX, y: e.clientY, type: givePointerType(e) };
    leftPointerID = e.pointerId;
    leftPointerStartPos.reset(halfWidth, halfHeight);
    leftPointerPos.copyFrom(leftPointerStartPos);
    leftVector.reset(0, 0);
    joy_arrow.reset(0, 0, 0, 0);
    touches.add(e.pointerId, newPointer);
}

function onPointerMove(e) {
    if (leftPointerID == e.pointerId) {
        leftPointerPos.reset(e.offsetX, e.offsetY);
        leftVector.copyFrom(leftPointerPos);
        leftVector.minusEq(leftPointerStartPos);
        joy_arrow.setArrow(leftVector, max_val);
        LEDloopON = true;
    }
    else {
        if (touches.item(e.pointerId)) {
            touches.item(e.pointerId).x = e.clientX;
            touches.item(e.pointerId).y = e.clientY;
        }
    }
}

function onPointerUp(e) {
    if (leftPointerID == e.pointerId) {
        leftPointerID = -1;
        leftVector.reset(0, 0);
    }
    leftVector.reset(0, 0);
    joy_arrow.reset(0, 0, 0, 0);
    touches.remove(e.pointerId);
    LEDloopON = false; // we are no longer monitoring the mouse input
    changeLED(0); // turn off all LEDs
}

function setupCanvas() {
    control_canvas = document.getElementById('controlCanvas');
    c = control_canvas.getContext('2d');
    resetCanvas();
    c.strokeStyle = "#ffffff";
    c.lineWidth = 2;
}

// Arduino control functions
function changeLED(LEDon) {
    if(LEDon)
    {
	var msg = 
	{type:'sendarrow', user:username, led1:joy_arrow.int1, led2:joy_arrow.int2, led3:joy_arrow.int3, led4:joy_arrow.int4};
    	socket.json.send(msg);
    }
    else
    {
	var msg = 
	{type:'sendarrow', user:username, led1:0, led2:0, led3:0, led4:0};
    	socket.json.send(msg);
    }
}


function resetCanvas(e) {
    max_val = (document.getElementById("controlArea").offsetWidth-100)/2;
    
    // resize the canvas - but remember - this clears the canvas too.
    
    control_canvas.width = document.getElementById("controlArea").offsetWidth-20;
    control_canvas.height = control_canvas.width-20;

    halfWidth = (control_canvas.width)/2;
    halfHeight = (control_canvas.height)/2;

    // make sure we scroll to the top left. 
    window.scrollTo(0, 0);
}
