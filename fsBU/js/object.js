var obj_canvas,
obj_c,
ObjX,
ObjY,
ObjL=80,
cp_canvas = null;

var video_canvas,
vid_c;

var brown_const=0;
var int_timer=0;
var max_timer=30;

var scoreX = 0;
var scoreY = 0;
var score_val = 0;
var gametimer;

var vid_width = 640;
var vid_height = 480;

function setupVidCanvas() {
	video_canvas = document.getElementById('videoCanvas');
	vid_c = video_canvas.getContext('2d');
	
	video_canvas.width = vid_width;
	video_canvas.height = vid_height;
	
	//ObjX = vid_width/2;
	//ObjY = vid_height/2;
	
	getMjpeg();
}

function getMjpeg(){
    var img = new Image();
	img.onload = function() {
		vid_c.clearRect(0, 0, vid_width, vid_height);
    	vid_c.drawImage(img, 0, 0, vid_width, vid_height);
    	// motion detection
    	//compareFrame(img);
    	var msg = {type:'updateGame'};
		socket.json.send(msg);
    	// load frame
    	//requestAnimFrame(getMjpeg);
	};
	img.src = "http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime();
}

function drawBox(box_X,box_Y,box_L){
	vid_c.strokeStyle = ( totalRes > 0 ) ? "rgba(253,172,13,1)" : "rgba(250,102,0,1)";
    vid_c.lineWidth = 2;
	
	vid_c.beginPath();
	vid_c.rect(box_X - box_L/2, box_Y - box_L/2, box_L, box_L);
    vid_c.stroke();	
    
    vid_c.fillStyle = "#f00";
	vid_c.beginPath();
	vid_c.moveTo(box_X,box_Y);
	var enda = (2*Math.PI)*(int_timer/max_timer);
	vid_c.arc(box_X,box_Y,box_L/4, 0, enda);
	vid_c.fill();
	
	/*if (score_val>0){
		vid_c.beginPath();
    	vid_c.fillStyle = "#fff"; 
    	vid_c.fillText('score: +'+score_val,box_X - box_L/2, box_Y - box_L/2-10);
    	
    	vid_c.moveTo(scoreX, scoreY);
    	vid_c.strokeStyle = "#fff";
    	vid_c.lineWidth = 1;
		vid_c.lineTo(ObjX, ObjY);
    	vid_c.stroke();	
    }*/
}

/*function resetGame(){
	window.clearTimeout(gametimer);
	
	ObjX = vid_width/2;
	ObjY = vid_height/2;
	
	score_val = 0;
	scoreX = ObjX;
	scoreY = ObjY;
	
	int_timer = max_timer;
	
	gametimer=requestAnimFrame(countDown);
}

function countDown(){
	int_timer = int_timer - 0.1;
	if (int_timer > 0){
		score_val = (Math.pow(scoreX-ObjX,2) + Math.pow(scoreY-ObjY,2))*10;
		gametimer=requestAnimFrame(countDown);
	}else{
		window.clearTimeout(gametimer);
		
		var msg = {type:'sendscore', user:username, score:score_val};
		socket.json.send(msg);
		
		int_timer=0;
		score_val = 0;
		ObjX = vid_width/2;
		ObjY = vid_height/2;
	}
}*/

/*
  Initialize the elements

  * Create a Canvas() object and insert it into the page
  * Download the first image
  * Pause the Livestream again if we were paused previously
    This way we will not pause, but we will lower the refresh rate
    For a proper pause, the page can not be reloaded
*/
/*function setupMotionDetection() {
  md_canvas = document.getElementById('mdCanvas');
  test_canvas = document.getElementById('testCanvas');
  md_canvas.width = vid_width;
  md_canvas.height = vid_height;
}*/