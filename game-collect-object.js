var obj_canvas,
obj_c,
cp_canvas = null;

var canvas
var video_canvas,
vid_c;

var brown_const=0;

var vid_width = 640;
var vid_height = 480;

paper.install(window);
    
window.onload = function() {
	paper.setup('myCanvas');
	getPNG();
}
/*function getPNG(){
	project.activeLayer.removeChildren();
	var origin = new Point(vid_width/2,vid_height/2);
    var raster = new Raster({
        name: 'videoframe',
		source: "http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime(),
		position: origin
	});
}*/

function getPNG(){
	var img = new Image();
    img.onload = function() {		
		project.activeLayer.removeChildren();
		var origin = new Point(vid_width/2,vid_height/2);
        var raster = new Raster({
        	name: 'videoframe',
			source: img.src,
			position: origin
		});
		raster.onLoad = function()
		{	
        	compareFrame(img);
        	window.requestAnimFrame(getPNG);
    	}
	}
    img.src = "http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime();
}

function setupVidCanvas() {
    video_canvas = document.getElementById('videoCanvas');
    vid_c = video_canvas.getContext('2d');
        
    video_canvas.width = vid_width;
    video_canvas.height = vid_height;
        
    getFrame();
}

function getFrame(){
    var img = new Image();
    img.onload = function() {
        vid_c.clearRect(0, 0, vid_width, vid_height);
        vid_c.drawImage(img, 0, 0, vid_width, vid_height);
        // motion detection
        compareFrame(img);
        // draw virtual graphics
        //game();
        window.requestAnimFrame(getFrame);
    };
    img.src = "http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime();
}

function game(){
	switch(gamephase)
	{
		case 'pre-game':
			// draw intro
		break;
		case 'game-rest':
    		vid_c.fillStyle = "#fff"; 
    		vid_c.font="14px sans-serif";
    		vid_c.fillText('New target ...',200,20);
    		vid_c.fillText('player : ' + username + '  score : ' +score_val ,20,20);
		break;
		case 'game-action':
    		vid_c.fillStyle = "#fff"; 
    		vid_c.font="14px sans-serif";
    		vid_c.fillText('Run! Run! Run!',200,20);
    		vid_c.fillText('player : ' + username + '  score : ' +score_val ,20,20);
		break;
		case 'gameover':		
    		vid_c.fillStyle = "#fff"; 
    		vid_c.font="14px sans-serif";
    		vid_c.textAlign="start"; 
    		vid_c.fillText('player : ' + username + '  score : ' +score_val ,20,20);
    		vid_c.fillStyle = "rgba(253,172,13,1)"; 
    		vid_c.font="40pt sans-serif";
    		vid_c.textAlign="center"; 
    		vid_c.fillText('GAME OVER',vid_width/2,vid_height/2-100);
    		vid_c.fillStyle = "#fff"; 
    		vid_c.font="20pt sans-serif";
    		vid_c.fillText(username+' scored '+score_val,vid_width/2,vid_height/2);
		break;
		default:
			vid_c.fillStyle = "#fff";
			vid_c.font="14px sans-serif";
    		vid_c.fillText('player : ' + username + '  score : ' +score_val ,20,20);
	}
}

function drawObject(){
}

function drawShip(box_X,box_Y,box_rad){
	box_rad=Math.PI/2+box_rad;
	switch(gamephase)
	{
		case 'gameover':
			// gameover graphics
		break;
		case 'engine':
			// begin transformation
    		vid_c.translate(box_X, box_Y); 
			vid_c.rotate(box_rad);
    		// draw ship body
    		vid_c.beginPath();
    		vid_c.strokeStyle=(hit > 0) ? "rgba(253,172,13,1)" : "rgba(255,255,255,1)";
			vid_c.moveTo(0,-5);
			vid_c.lineTo(0-4,-5+10);
			vid_c.lineTo(0+4,-5+10);
			vid_c.closePath();
    		vid_c.stroke();
    		vid_c.fillStyle=(hit > 0) ? "rgba(253,172,13,1)" : "rgba(255,255,255,1)";
			vid_c.fill();
    		// draw ship fins
    		vid_c.beginPath();
    		vid_c.moveTo(0-4,-5+10);
			vid_c.lineTo(0-4,-5+22);
    		vid_c.stroke();
    		vid_c.beginPath();
    		vid_c.moveTo(0+4,-5+10);
			vid_c.lineTo(0+4,-5+22);
    		vid_c.stroke();
    		// exit transformation
    		vid_c.rotate(-box_rad);
			vid_c.translate(-box_X, -box_Y);    
		break;
		case 'rest':
			// begin transformation
    		vid_c.translate(box_X, box_Y); 
			vid_c.rotate(box_rad);
			// draw ship body
    		vid_c.beginPath();
    		vid_c.strokeStyle=(hit > 0) ? "rgba(253,172,13,1)" : "rgba(255,255,255,1)";
			vid_c.moveTo(0,-3);
			vid_c.lineTo(0-5,-3+7);
			vid_c.lineTo(0+5,-3+7);
			vid_c.closePath();
    		vid_c.stroke();
    		// draw ship fins
    		vid_c.beginPath();
    		vid_c.moveTo(0-5,-3+7);
			vid_c.lineTo(0-12,-3+12);
    		vid_c.stroke();
    		vid_c.beginPath();
    		vid_c.moveTo(0+5,-3+7);
			vid_c.lineTo(0+12,-3+12);
    		vid_c.stroke();
    		// exit transformation
    		vid_c.rotate(-box_rad);
    		vid_c.translate(-box_X, -box_Y);  
    	break;
		default:
			vid_c.beginPath();
    		vid_c.fillStyle = "#fff"; 
    		vid_c.fillText('READY TO START',vid_width/2,vid_height/2);
	}
}

function drawStar(aX,aY,bX,bY,step){
	var arrStar = 
		[
			[0+2*Math.random(),-10+2*Math.random()],
			[8+2*Math.random(),-4+2*Math.random()],
			[8+2*Math.random(),2+2*Math.random()],
			[0+2*Math.random(),8+2*Math.random()],
			[-8+2*Math.random(),2+2*Math.random()],
			[-8+2*Math.random(),-4+2*Math.random()]
		];
		
	// draw star body
	switch(gamephase)
	{
		case 'gameover':
			// gameover
			DrawStar(bX,bY);
		break;
		case 'engine':
    		// no path to draw
    		DrawStar(bX,bY);
		break;
		case 'rest':
			DrawStar(bX,bY);
			DrawStar(aX,aY);
			step = (step > gamelevel) ? gamelevel : step;
			var dX=(bX-aX)*step/gamelevel;
			var dY=(bY-aY)*step/gamelevel;
			DrawDottedLine(aX,aY,aX+dX,aY+dY,1,step+1,"rgba(253,172,13,1)");
		default:
			//
			DrawStar(bX,bY);
	}
	
	function DrawStar(X,Y){
		vid_c.strokeStyle="rgba(255,255,255,0.4)";
		for(var i=0;i<5;i++)
		{
			for(var j=0;j<(5-i);j++){
				vid_c.beginPath();
				vid_c.moveTo(X+2*arrStar[i][0],Y+2*arrStar[i][1]);
				vid_c.lineTo(X+2*arrStar[i+j+1][0],Y+2*arrStar[i+j+1][1]);
    			vid_c.stroke();
    		}
		}
	}

    function DrawDottedLine(x1,y1,x2,y2,dotRadius,dotCount,dotColor){
        var dx=x2-x1;
        var dy=y2-y1;
        var spaceX=dx/(dotCount-1);
        var spaceY=dy/(dotCount-1);
        var newX=x1;
        var newY=y1;
        for (var i=0;i<dotCount;i++){
        	drawDot(newX,newY,dotRadius,dotColor);
        	newX+=spaceX;
            newY+=spaceY; 
        }
        drawDot(x1,y1,1,"rgba(253,172,13,1)");
        drawDot(x2,y2,1,"rgba(253,172,13,1)");
    }
    
    function drawDot(x,y,dotRadius,dotColor){
        vid_c.beginPath();
        vid_c.arc(x,y, dotRadius, 0, 2 * Math.PI, false);
        vid_c.fillStyle = dotColor;
        vid_c.fill();              
    }
}
var shipX=vid_width/2,
	shipY=vid_height/2,
	shipRad,
	shipL=20,
	starX=40,
	starY=20;
var gamelevel;
var int_star=-1;
var int_engine=-1;
var engine = false;
var rest = false;
var starTimer;
var enginerTimer;
var gamephase;
var score_val = 0;
var actionTimer;
var hit=0;
var unit=30;

function setGameAction(){
	actionTimer = window.requestAnimationFrame(actionLoop);
}

function setbackPreGame(){
    score_val = 0;
    hit = 0;
    gamelevel=1;
    
	shipX = vid_width/2;
    shipY = vid_height/2;
    
    gamephase='pre-game';
}

function setGameOver(){
  	window.cancelAnimationFrame(actionTimer);
    actionTimer = undefined;
}


function actionLoop(){
	switch(gamephase)
	{
		case 'rest':
  			if(rest==false)
			{
				rest=true;
				int_star=gamelevel+6;
				getStarLocation(); // get new starX, starY, shipRad
				starTimer=window.setInterval(showStar,500);
			}
			drawStar(shipX,shipY,starX,starY,gamelevel-(int_star-6));
			drawShip(shipX,shipY,shipRad);
			actionTimer = window.requestAnimationFrame(gameLoop);
  		break;
		case 'engine':
			console.log(hit);
  			if(hit>0)
			{
				window.clearInterval(engineTimer);
				engine=false;
				rest=false;
				int_star=-1;
				int_engine=-1;
				gamephase='gameover';
				gamelevel=-1;
			}
			else
			{
				score_val=score_val+10;
				if(engine==false)
				{
					engine=true;
					int_engine=gamelevel+4;
					engineTimer=window.setInterval(runEngine,500);
				}
			}
			drawStar(shipX,shipY,starX,starY,gamelevel-(int_star-6));
			drawShip(shipX,shipY,shipRad);
			
  		break;
	}
}

function getStarLocation(){
	shipRad=Math.random()*Math.PI*2;
	starX=shipX+unit*(Math.cos(shipRad))*gamelevel;
	starY=shipY+unit*(Math.sin(shipRad))*gamelevel;
}

function getShipLocation(){
	var step = gamelevel-(int_engine-4);
	var u = (step > gamelevel - 1) ? 0 : 1;
	shipX=shipX+unit*(Math.cos(shipRad))*u;
	shipY=shipY+unit*(Math.sin(shipRad))*u;
}

function showStar(){
	if(int_star>0)
	{
		int_star=int_star-1;
	}
	else
	{
		window.clearInterval(starTimer);
		rest=false;
		gamephase='engine';
	}
}
	
function runEngine(){
	if(int_engine>0)
	{
		getShipLocation();
		int_engine=int_engine-1;
	}
	else
	{
		window.clearInterval(engineTimer);
		engine=false;
		gamephase='rest';
		if(gamelevel<10)
		{
			gamelevel=gamelevel+1;
		}
	}
}

function gameOver(){
    var msg = {type:'sendscore', user:username, score:score_val};
    socket.json.send(msg);
}




/*******************************************************************************
  Copyright (C) 2009 Tom Stoeveken
  This program is free software;
  you can redistribute it and/or modify it under the terms of the
  GNU General Public License, version 2.
  See the file COPYING for details.
*******************************************************************************/

var img1 = null;
var img2 = null;
var md_canvas = null;

/*
  compare two images and count the differences

  input.: image1 and image2 are Image() objects
  input.: threshold specifies by how much the color value of a pixel
          must differ before they are regarded to be different

  return: number of different pixels
*/

function compare(image1, image2, ptX, ptY, threshold, ObjR) {
  var movement = new Array(0,0,0,0);
  var md_ctx = md_canvas.getContext("2d");
  var width = md_canvas.width/2, height = md_canvas.height/2;

  // copy images into canvas element
  // these steps scale the images and decodes the image data
  md_ctx.drawImage(image1, 0, 0, width, height);
  md_ctx.drawImage(image2, width, 0, width, height);

  // this makes r,g,b,alpha data of images available
  var pixels1 = md_ctx.getImageData(0, 0, width, height);
  var pixels2 = md_ctx.getImageData(width, 0, width, height);
  
  // substract picture1 from picture2
  // if they differ set color value to max,
  // if the difference is below threshold set difference to 0.
  for (var x = Math.round((ptX-ObjR)/2); x < Math.round((ptX+ObjR)/2); x++) {
    for (var y = Math.round((ptY-ObjR)/2); y < Math.round((ptY+ObjR)/2); y++) {

      // each pixel has a red, green, blue and alpha value
      // all values are stored in a linear array
      var i = x*4 + y*4*pixels1.width;

      var ch0 = ((pixels1.data[i] - pixels2.data[i])>threshold)?255:0;
      var ch1 = ((pixels1.data[i] - pixels2.data[i])>threshold)?255:0;
      var ch2 = ((pixels1.data[i] - pixels2.data[i])>threshold)?255:0;

      // count differing pixels
      var n = (x<Math.round(ptX/2))?0:1;
      var m = (y<Math.round(ptY/2))?0:2;
      movement[n+m] += Math.min(1, ch0 + ch1 + ch2);
    }
  }
  return movement;
}

/*
  Callback function for completed picture downloads

  With every new picture a compare() is performed.
  The new picture is 'img1', the previous picture is stored in 'img2'.
*/
function compareFrame(img1) {
  // just compare if there are two pictures
  if ( img2 != null ) {
    var res=[0,0,0,0];
    var ObjR=10;

    try {
    		// compare the two pictures, the given threshold helps to ignore noise
    		res = compare(img1, img2, shipX, shipY, 10, ObjR); 
    	}
    catch(e) {
    		// errors can happen if the pictures were corrupted during transfer
    		// instead of giving up, just proceed
    	}
    
    var md_ctx = md_canvas.getContext("2d");
    if ((res[0]>400)||(res[1]>400)||(res[2]>400)||(res[3]>400)){
            res[0]=0;res[1]=0;res[2]=0;res[3]=0;
    	}
  
	hit=res[0]+res[1]+res[2]+res[3];
  
	}
	// copy reference of img1 to img2
	img2 = img1;
}



/*
  Initialize the elements

  * Create a Canvas() object and insert it into the page
  * Download the first image
  * Pause the Livestream again if we were paused previously
    This way we will not pause, but we will lower the refresh rate
    For a proper pause, the page can not be reloaded
*/
function setupMotionDetection() {
  md_canvas = document.getElementById('mdCanvas');
  test_canvas = document.getElementById('testCanvas');
  md_canvas.width = vid_width;
  md_canvas.height = vid_height;
}
