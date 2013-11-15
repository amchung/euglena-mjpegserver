var obj_canvas,
obj_c,
cp_canvas = null;

var canvas
var video_canvas,
vid_c;

var brown_const=0;

var vid_width = 640;
var vid_height = 480;

var canvas;
var context;

var vid_width = 640;
var vid_height = 480;

var l = 80,
	n = 4,
	v = 1/4;
	
var n_max = 20;

function setupD3() {
    canvas = d3.select("#canvasArea").append("canvas")
        .attr("width", vid_width)
        .attr("height", vid_height);
    
    context = canvas.node().getContext("2d");  

	var w = 640,
    	h = 480,
    	m = 20,
    	radius = l/2+10,
    	degrees = 180 / Math.PI;
    
	var objects = d3.range(n_max).map(function() {
  		var x = 40 + Math.random() * (w-40), y = 40 + Math.random() * (h-40);
  		return {
    		vx: 0,
    		vy: 0,
    		path: d3.range(m).map(function() { return [x, y]; }),
    		count: 0,
    		active: 0,
    		size: l,
    		color: "#FA6600"
  		};
	});

	var svg = d3.select("#canvasArea").append("svg:svg")
    	.attr("width", vid_width)
    	.attr("height", vid_height);
    		
	var g = svg.selectAll("g")
    	.data(objects)
		.enter().append("svg:g");

	var box = g.append("svg:rect");
	
	function drawObjects(){
		for (var i = -1; ++i < n;) {
    		var object = objects[i],
        		x = object.path[0][0],
        		y = object.path[0][1];

    		object.size = l;
    		object.active = (i<n)?1:0;
    	}
    	box.attr("opacity", function(d,i){
    		return d.active;
    	});
		box.attr("width", function(d,i){
			return d.size;
		});
		box.attr("height", function(d,i){
			return d.size;
		});
		box.attr("stroke", function(d,i){
			return d.color;
		});
  		box.attr("transform", function(d) {
    		return "translate(" + d.path[0] + ")";
  		});
  	}


	d3.timer(function() {
  		drawObjects();
	});

	window.setInterval(getVideo, 1000/20);
		
	function getVideo(){
        getVidFrame("http://171.65.102.132:8080/?action=snapshot?t=" + new Date().getTime(), function(image) {
            context.clearRect(0, 0, vid_width, vid_height);
            context.drawImage(image, 0, 0, vid_width, vid_height);
        });
        
    	function getVidFrame(path, callback) {
            var image = new Image;
            image.onload = function() {
                callback(image);
                compareFrame(image);
            };
            image.src = path;
        }
    }
    
    
    function compareFrame(img1) {
		// just compare if there are two pictures
  		if ( img2 != null ) {
    		var res=[0,0,0,0];
    		try {
    			for (var i = -1; ++i < n;){
    				res = compare(img1, img2, objects[i].path[0][0], objects[i].path[0][1], 14, l/2+10); 
    			    	if ((res[0]>400)||(res[1]>400)||(res[2]>400)||(res[3]>400)){
            				res[0]=0;res[1]=0;res[2]=0;res[3]=0;
    					}
    				objects[i].path[0][0]+=(res[0]+res[2]-res[1]-res[3])*v+(Math.random()-0.5)*20*brown_const
    				objects[i].path[0][1]+=(res[0]+res[1]-res[2]-res[3])*v+(Math.random()-0.5)*20*brown_const
					objects[i].color = ((res[0]+res[1]+res[2]+res[3])>0)?"#FDAC0D":"#FA6600";
    			}
    		}
    	catch(e) {
    			// errors
    		}
		}
		img2 = img1;
	}

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

function setupMotionDetection() {
  md_canvas = document.getElementById('mdCanvas');
  test_canvas = document.getElementById('testCanvas');
  md_canvas.width = vid_width;
  md_canvas.height = vid_height;
}

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