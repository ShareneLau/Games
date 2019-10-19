/*
The extensions I chose to implement are adding sound effects and platform.

For the sound effects, I have added some somes based on game character's action. To use this, we have to utilize p5.sound library which provide a web api to play audio files. I learnt that sounds have to be preloaded first so before setup function was called, the sound file can be loading asynchronously. To play the songs and adust volume, we can just call play and setVolume method on the sound objects. I spent quite long to figure out how to play sound in Chrome until I find Web Server on Chrome would help.

For platform, I learnt how to construct object using factory pattern to create multiple objects that have same properties and methods. I have created a few platforms in game.This is the first time I apply factory pattern so it takes time to understand how everything works.


*/

var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var clouds;
var mountains;
var trees_x;

var canyons;
var collectables;

var game_score;

var flagpole;

var lives;
var hearts;

var jumpSound;
var fallSound;
var cheerSound;
var dingSound;

var platforms;

function preload()
{
	
	soundFormats('mp3','wav');
    
    //load your sounds here
	
    jumpSound = loadSound('assets/jump.wav');
    jumpSound.setVolume(0.1);
	
	fallSound = loadSound('assets/fall.wav');
	fallSound.setVolume(0.1);
	
	dingSound = loadSound('assets/ding.wav');
	dingSound.setVolume(0.1);
	
	cheerSound = loadSound('assets/cheer.wav');
	cheerSound.setVolume(0.1);
	
	
	
}

function setup()
{
	createCanvas(1024, 576);
	floorPos_y = height * 3/4;
	lives=3;
	
	startGame();
	
}

function startGame()
{
	
	
	
	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
    trees_x=[100,500,700,1000,1500,1800,2300];
    
    clouds=[
        {x_pos:100,y_pos:100},
        {x_pos:600,y_pos:50},
        {x_pos:800,y_pos:100},
        {x_pos:1400,y_pos:70},
        {x_pos:1800,y_pos:100},
		{x_pos:2500,y_pos:100},
		{x_pos:2900,y_pos:100},
    ];
    
    mountains=[
        {x_pos:200,y_pos:height/2},
        {x_pos:400,y_pos:height/2},
        {x_pos:700,y_pos:height/2},
        {x_pos:1600,y_pos:height/2},
		{x_pos:2000,y_pos:height/2},
		{x_pos:2800,y_pos:height/2},
        {x_pos:-300,y_pos:height/2}
    ];
    
    canyons=[
        {x_pos:300,width:100},
        {x_pos:700,width:100},
        {x_pos:1200,width:100},
        {x_pos:1900,width:100},
		{x_pos:2300,width:100}
    ];
	
	platforms=[];
	
	platforms.push(createPlatforms(190,floorPos_y-100,100));
	platforms.push(createPlatforms(600,floorPos_y-100,100));
	platforms.push(createPlatforms(700,floorPos_y-150,100));
	platforms.push(createPlatforms(1200,floorPos_y-100,100));
	platforms.push(createPlatforms(1700,floorPos_y-100,100));
	platforms.push(createPlatforms(1900,floorPos_y-200,100));
    
    collectables=[
        { x_pos:180,y_pos:floorPos_y-100,size:50,isFound:false},
        { x_pos:800,y_pos:floorPos_y-25,size:50,isFound:false},
        { x_pos:1300,y_pos:floorPos_y-25,size:50,isFound:false},
        { x_pos:1700,y_pos:floorPos_y-25,size:50,isFound:false},
		{ x_pos:2000,y_pos:floorPos_y-25,size:50,isFound:false}
    
    ];
	
	hearts=[
		{x_pos:20,y_pos:60},
		{x_pos:60,y_pos:60},
		{x_pos:100,y_pos:60},
	]
	
	game_score=0;
	
	flagpole={isReached:false,x_pos:3000};
	
}

function draw()
{
	background(100, 155, 255); // fill the sky blue

	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4); // draw some green ground
    
    push();
    translate(scrollPos,0);

	// Draw clouds.
    drawClouds();

	// Draw mountains.
    drawMountains();
	// Draw trees.
    drawTrees();

	// Draw canyons.
    for(var i=0;i<canyons.length;i++){
       drawCanyon(canyons[i]);
       checkCanyon(canyons[i]);
       
    }
    
	// Draw platforms
	for(var i=0;i<platforms.length;i++){
		platforms[i].draw();
	}
	// Draw collectable items.
    for(var i=0;i<collectables.length;i++){
        if(collectables[i].isFound==false){
             drawCollectable(collectables[i]);
             checkCollectable(collectables[i]);
        }
       
       
    }
	
	// Render flag pole
	
	renderFlagPole();
    
    pop();

	// Draw game character.
	
	
	drawGameChar();
	
	// Draw game score object
	fill(255);
	noStroke();
	textSize(30);
	text("score: "+game_score,20,20);
	
	// Draw remaning lives
	drawHearts();
	
	// Game over
	if(lives <1 ){
		
		fill(0);
		noStroke();
		textSize(50);
		text("Game over. Press F5 to continue.",100,200);
		return;
	}
	
	// Level completed
	if(flagpole.isReached){
		fill(0);
		noStroke();
		textSize(50);
		text("Level complete. Press Space to continue.",100,200);
		return;
	}

	// Logic to make the game character move or the background scroll.
	if(isLeft)
	{
		if(gameChar_x > width * 0.2)
		{
			gameChar_x -= 5;
		}
		else
		{
			scrollPos += 5;
		}
	}

	if(isRight)
	{
		if(gameChar_x < width * 0.8)
		{
			gameChar_x  += 5;
		}
		else
		{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.
    if(gameChar_y<floorPos_y)
	{
		
		var isContact = false;
		
		for(var i=0;i<platforms.length;i++){
			if(platforms[i].checkContact(gameChar_world_x,gameChar_y)){
				isContact = true;
				break;
			}
		}
		
		if(isContact==false){
			gameChar_y+=2;
        	isFalling=true;
		}
        
    }
    else{
        isFalling=false;
    }
	
	// Check position of gameChar and flagpole
	
	if(!flagpole.isReached){
		checkFlagPole();
	}
	

	// Check if character fall from canyon
	checkPlayerDie();

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}


// ---------------------
// Key control functions
// ---------------------

function keyPressed()
{

    if(keyCode==37){
        isLeft=true;
    }
    if(keyCode==39){
        isRight=true;
    }
    
	//jumping
    if((keyCode==32) && (gameChar_y==floorPos_y)){
        gameChar_y-=100;
		jumpSound.play();
    }
	
}

function keyReleased()
{
    if(keyCode==37){
        isLeft=false;
       
    }
    if(keyCode==39){
        isRight=false;
    }
	

}


// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.

function drawGameChar()
{
	// draw game character
    if(isLeft && isFalling)
	{
		// add your jumping-left code
        fill(200,100,10);
        ellipse(gameChar_x,gameChar_y-65,20,30);
        fill(255,0,0);
        rect(gameChar_x-10,gameChar_y-52,20,35);
        fill(0);
        triangle(gameChar_x+5,gameChar_y-20,gameChar_x+10,gameChar_y+2,gameChar_x+15,gameChar_y-2);
        rect(gameChar_x-15,gameChar_y-40,20,5);
        triangle(gameChar_x-5,gameChar_y-20,gameChar_x-25,gameChar_y,gameChar_x-7,gameChar_y-5);

	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
        fill(200,100,10);
        ellipse(gameChar_x,gameChar_y-65,20,30);
        fill(255,0,0);
        rect(gameChar_x-10,gameChar_y-52,20,35);
        fill(0);
        triangle(gameChar_x-5,gameChar_y-20,gameChar_x-10,gameChar_y+2,gameChar_x-15,gameChar_y-2);
        rect(gameChar_x-5,gameChar_y-40,20,5);
        triangle(gameChar_x+5,gameChar_y-20,gameChar_x+25,gameChar_y,gameChar_x+7,gameChar_y-5);

	}
	else if(isLeft)
	{
		// add your walking left code
        fill(200,100,10);
        ellipse(gameChar_x,gameChar_y-55,20,30);
        fill(255,0,0);
        rect(gameChar_x-10,gameChar_y-42,20,35);
        fill(0);
        rect(gameChar_x,gameChar_y-35,5,15);
        rect(gameChar_x+5,gameChar_y-10,5,10);
        triangle(gameChar_x,gameChar_y-10,gameChar_x+2,gameChar_y+2,gameChar_x-15,gameChar_y);

	}
	else if(isRight)
	{
		// add your walking right code
        fill(200,100,10);
        ellipse(gameChar_x,gameChar_y-55,20,30);
        fill(255,0,0);
        rect(gameChar_x-10,gameChar_y-42,20,35);
        fill(0);
        rect(gameChar_x-5,gameChar_y-35,5,15);
        rect(gameChar_x-10,gameChar_y-10,5,10);
        triangle(gameChar_x+5,gameChar_y-10,gameChar_x+15,gameChar_y+2,gameChar_x-3,gameChar_y);


	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
        
        fill(200,100,10);
        ellipse(gameChar_x,gameChar_y-65,30,30);
        fill(255,0,0);
        rect(gameChar_x-15,gameChar_y-52,30,40);
        fill(0);
        rect(gameChar_x-30,gameChar_y-40,15,5);
        rect(gameChar_x+15,gameChar_y-40,15,5);
        rect(gameChar_x-10,gameChar_y-15,8,15);
        rect(gameChar_x+2,gameChar_y-15,8,15);

	}
	else
	{
		// add your standing front facing code
        fill(200,100,10);
        ellipse(gameChar_x,gameChar_y-55,30,30);
        fill(255,0,0);
        rect(gameChar_x-15,gameChar_y-42,30,40);
        fill(0);
        rect(gameChar_x-20,gameChar_y-5,10,10);
        rect(gameChar_x+10,gameChar_y-5,10,10);


	}
}




// ---------------------------
// Background render functions
// ---------------------------

// Function to draw cloud objects.
function drawClouds(){
    for(var i=0;i<clouds.length;i++){
        fill(255);
        ellipse(clouds[i].x_pos,clouds[i].y_pos,80,50);
        ellipse(clouds[i].x_pos-50,clouds[i].y_pos+40,80,80);
        ellipse(clouds[i].x_pos,clouds[i].y_pos+60,80,80);
        ellipse(clouds[i].x_pos+50,clouds[i].y_pos+40,80,80);
    }
}

// Function to draw mountains objects.
function drawMountains(){
    for(var i=0;i<mountains.length;i++){
        fill(255,204,0);
        triangle(mountains[i].x_pos-80,mountains[i].y_pos-195,mountains[i].x_pos-250,mountains[i].y_pos+145,mountains[i].x_pos+60,mountains[i].y_pos+145);
        fill(153,102,51);;
        triangle(mountains[i].x_pos-80,mountains[i].y_pos-195,mountains[i].x_pos-80,mountains[i].y_pos-145,mountains[i].x_pos-100,mountains[i].y_pos-165);
         
     }
}

// Function to draw trees objects.
function drawTrees(){
    for(var i=0;i<trees_x.length;i++){
        fill(153,102,51);
        rect(trees_x[i],floorPos_y-110,50,110);
        fill(0,153,51);
        triangle(trees_x[i]+20,floorPos_y-190,trees_x[i]-100,floorPos_y-90,trees_x[i]+140,floorPos_y-90);
        triangle(trees_x[i]+20,floorPos_y-240,trees_x[i]-80,floorPos_y-140,trees_x[i]+100,floorPos_y-140);
        triangle(trees_x[i]+20,floorPos_y-290,trees_x[i]-50,floorPos_y-190,trees_x[i]+80,floorPos_y-190);
        
    }
}


// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.

function drawCanyon(t_canyon)
{
    fill(204,102,0);
    rect(t_canyon.x_pos+30,435,t_canyon.width,150);
    fill(102,51,0);
    rect(t_canyon.x_pos+60,435,t_canyon.width-60,150);
}

// Function to check character is over a canyon.

function checkCanyon(t_canyon)
{
    if(gameChar_world_x>t_canyon.x_pos && gameChar_world_x<t_canyon.x_pos+t_canyon.width && gameChar_y>=floorPos_y){
        isPlummeting=true;
    }
    
    if(isPlummeting==true){
        gameChar_y+=2;
    }
}

// ----------------------------------
// Collectable items render and check functions
// ----------------------------------

// Function to draw collectable objects.

function drawCollectable(t_collectable)
{
     fill(200,200,0);
     ellipse(t_collectable.x_pos,t_collectable.y_pos,t_collectable.size,t_collectable.size);
     fill(0);
     textSize(t_collectable.size);
     text("$",t_collectable.x_pos-10,t_collectable.y_pos+10);
}

// Function to check character has collected an item.

function checkCollectable(t_collectable)
{
     if(dist(gameChar_world_x,gameChar_y,t_collectable.x_pos,t_collectable.y_pos)<=t_collectable.size){
            t_collectable.isFound=true;
		 	game_score+=1;
		 	dingSound.play();
    }   
}

// Function to render flagpole

function renderFlagPole(){
	
	push();
	strokeWeight(5);
	stroke(100);
	line(flagpole.x_pos,floorPos_y,flagpole.x_pos,floorPos_y-250);
	fill(255,0,255);
	noStroke();
	
	// when finish this level
	if(flagpole.isReached){
		rect(flagpole.x_pos,floorPos_y-250,50,50);
	}
	else{
		rect(flagpole.x_pos,floorPos_y-50,50,50);
	}
	
	pop();
}

// Function to check if character near the flagpole

function checkFlagPole(){
	
	var distance = abs(gameChar_world_x - flagpole.x_pos);
	if(distance<15){
		flagpole.isReached=true;
		cheerSound.play();
	}
	
}

// Function to check if character falls from canyon

function checkPlayerDie(){
	if(isPlummeting && gameChar_y>height){
		lives-=1;
		fallSound.play();
		if (lives>0){
			startGame();
		}
	}
	
}

// Function to draw remaining lives
function drawHearts(){
	for(let i=0;i<lives;i++){
		fill(255,0,0);
		ellipse(hearts[i].x_pos,hearts[i].y_pos,20,20);
		ellipse(hearts[i].x_pos+15,hearts[i].y_pos,20,20);
		ellipse(hearts[i].x_pos+7,hearts[i].y_pos+10,15,15);
	}
}

// draw platform

function createPlatforms(x,y,length){
	var platform={
		x:x,
		y:y,
		length:length,
		draw: function(){
			fill(0,255,0);
			rect(this.x,this.y,this.length,10);
			fill(100);
			triangle(this.x,this.y+10,this.x+30,this.y+50,this.x+length,this.y+10);
			
		},
		checkContact: function(gc_x,gc_y){
			if(gc_x > this.x && gc_x<this.x+this.length){
				var distance = this.y-gc_y;
				if(distance >=0 && distance <5){
					return true;
				}
			}
			return false;
		}
	}
	return platform;
}

