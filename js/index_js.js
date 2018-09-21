// JavaScript Document

// Variables //
// mouse
var lastMouseX=-1; 
var lastMouseY=-1;
var mouseTravel = 0;
var xDiff = 0;
var yDiff = 0;
// card dimensions
var cardPlayW = 150;
var cardPlayH = 209.5;
var cardExamineW = 592;
var cardExamineH = 827;
// card
var cards = [];
var images = ["card-flipped1.png", "card-flipped2.png", 
"card-flipped3.png", "card-flipped4.png", "card-flipped5.png"]; // playing card flipped sides

// PlayingCard prototype
function PlayingCard(cardBoxId, cardId, cardFlippedId, flippedImage) {
  // id
  this.cardBoxId = cardBoxId;
  this.cardId = cardId;
  this.cardFlippedId = cardFlippedId;
  // image
  this.flippedImage = flippedImage;
  // vars
  this.cardPreX;
  this.cardPreY;
  this.canDrag = true;
  this.beingDragged = false;
  this.beingExamined = false;
  this.cardScaling = false;
  this.cardMoving = false;
  this.cardZIndex;
  // iteration/animation
  this.frontFlipDeg;
  this.backflipDeg;
  this.tick_FlipCard;
  this.status_FlipCard = false;
}

// Setup //
$(document).ready(function(){

  images = randomiseCardFronts();
  createCards();
  $("#card-hit")[0].volume = 0.5;
  mouseMovement();

});

// MISC. FUNCTIONS //

// playSound plays the sound on the element of the given id
function playSound(id) {
  var sound = $(id)[0];
  if(sound.currentTime != 0) {
     consolePrint("resetting! - "+sound.currentTime);
     sound.pause();
     sound.currentTime = 0;
   }
  sound.play();
}

// returns the given string with the "px" at the end removed
function removePx(str) {
  return str.split("p")[0];
}

// DEBUG FUNCTIONS //

// consolePrint checks to see if console is available and then prints to it
function consolePrint(toPrint) {
  if(window.console && window.console.log) {
    console.log(toPrint);
  }
}

// MOUSE FUNCTIONS //

// changes the cursor of a jQuery element
function changeCursor(jQueryElement, cursorString) {
  jQueryElement.css("cursor", cursorString);
  jQueryElement.css("cursor", "-webkit-"+cursorString);
  jQueryElement.css("cursor", "-moz-"+cursorString);
}

// mouseMovement tracks mouse speed and controls f-indicator offset
function mouseMovement() {
  $('html').mousemove(function(e) {
    // getting mouse speed //
    // adapted from:
    // jQuery Sparklines <https://gist.github.com/ripper234/5757309>. 30/8/17
    mouseTravel = 0;
    var mouseX = e.pageX;
    var mouseY = e.pageY;
    // getting x and y differences
    xDiff = mouseX - lastMouseX;
    yDiff = mouseY - lastMouseY;
    // mouse speed
    if (lastMouseX > -1)
       mouseTravel = Math.max( Math.abs(mouseX-lastMouseX), Math.abs(mouseY-lastMouseY) );
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    // f-indicator offset //
    var fIndicator = $("#f-indicator");
    var documentW = $(document).width();
    var newLeft = e.pageX + 10;
    if((newLeft + 42) > documentW) {
      newLeft = documentW - 42;
    }
    fIndicator.css({"top": e.pageY - 45, "left": newLeft});
  });
}

// CARD FUNCTIONS //

// randomiseCardFronts randomises the fronts of the cards
// used at opening of webpage
function randomiseCardFronts() {
  var newImages = images;
  newImages.sort(function(a, b){return 0.5 - Math.random();});
  return newImages;
}

// changes property of #playing-card, #playing-card-flipped and #playing-card-box
// 'styles' is an object
function alterCardStyles(styles, card) {
  $(card.cardId).css(styles);
  $(card.cardFlippedId).css(styles);
  $(card.cardBoxId).css(styles);    
}                                                                                                                         

// createCards initialises the cards and then sets their location
function createCards() {
  initialiseCards();
  setCardLocations();
}

// initialiseCards spawns the cards and sets up their various features
function initialiseCards() {
  for(var i = 0;i < images.length;i++) {
    // Initialising Card Objects //
    // id
    var cardBoxId = "#playing-card-box"+i;
    var cardId = "#playing-card"+i;
    var cardFlippedId = "#playing-card-flipped"+i;
    // image
    var flippedImage = images[i];
    // initialisation
    var card = new PlayingCard(cardBoxId, cardId, cardFlippedId, flippedImage);
    cards.push(card);
    
    // Creating Cards //
    var element, id, img;
    // playing card box
    id = cardBoxId.split("#")[1];
    element = '<div class="playing-card-box" id="'+id+'"/>';
    $(element).appendTo("#board-surface");
    // card image
    id = cardId.split("#")[1];
    element = '<img class="playing-card no-select" id="'+id+'" src="img/card-front.png" alt="Card front">';
    $(element).appendTo(cardBoxId);
    // card flipped image
    img = images[i];
    id = cardFlippedId.split("#")[1];
    element = '<img class="playing-card-flipped no-select" id="'+id+'" src="img/'+img+'" alt="Card flipped">';
    $(element).appendTo(cardBoxId);
    
    // Styling //
    var boxStyles = {"cursor": "-webkit-grab", "cursor": "-moz-grab", "z-index": i};
    $(card.cardBoxId).css(boxStyles);
    
    var cardStyles = {"-webkit-transform": "rotateY(0deg)", 
                      "-moz-transform": "rotateY(0deg)", 
                      "transform": "rotateY(0deg)",
                      "z-index": i};
    $(card.cardId).css(cardStyles);
    
    var flippedStyles = {"-webkit-transform": "rotateY(90deg)", 
                         "-moz-transform": "rotateY(90deg)", 
                         "transform": "rotateY(90deg)",
                         "z-index": i};
    $(card.cardFlippedId).css(flippedStyles);
    card.cardZIndex = i;
    
    setCardBoxSize(card);
    
    // Initialising different aspects of card //
    setDraggable(card);
    setBinding(card);
    setHover(card);
    
  }
}

// setCardLocations spreads the cards out horizontally
function setCardLocations() {
  var bW = removePx($("#board-surface").css("width"));
  var wPadding = 100;
  var w = cardPlayW + wPadding;
  // finding preX
  var remainder = bW % w;
  var fittingCards = parseInt(bW / w);
  var preX = (remainder / fittingCards) + wPadding;
  // starting coords
  var x = preX / 2; var y = preX / 2;
  // setting card locations
  var horizNumber = 0;
  for(var i = 0;i < cards.length;i++) {
    horizNumber++;
    if(horizNumber > fittingCards) {
      y += cardPlayH + (preX / 2);
      x = preX / 2;
      horizNumber = 0;
    }
    var cardBox = $(cards[i].cardBoxId);
    cardBox.css({"left": x, "top": y});
    x += cardPlayW + preX;    
  }    
}

// setDraggable initialises draggable ui for card, changes cursor, leads to cardSliding
function setDraggable(card) {
  var id = card.cardBoxId;
  $(id).draggable({
    containment:"parent",
    start: function(event, ui) {
      card.beingDragged = true;
      //changing cursor
      changeCursor($(id), "grabbing");
    },
    stop: function(event, ui) {
      card.beingDragged = false;
      var cardBox = $(id);
      // changing cursor
      changeCursor(cardBox, "grab");
      cardSliding(cardBox); 
    }
  });
}

// cardThrowing gets the angle of the card as its thrown and the x and y values
// corresponding to that angle to slide the card
function cardSliding(cardBox) {
  // angle code adapted from: StackExchange: 'Find the bearing angle between two 
  // points in a 2D space.' <https://math.stackexchange.com/questions/1596513/find-the-bearing-angle-between-two-points-in-a-2d-space>. 
  // 30/8/17. & StackOverflow: 'How to calculate an angle from points?' 
  // <https://stackoverflow.com/questions/9614109/how-to-calculate-an-angle-from-points>.
  // 30/8/17.
  var cardThrowSpeed = mouseTravel;
  if(cardThrowSpeed > 1) {
    // finding angle (in radians)
    var angle = Math.atan2(yDiff, xDiff);
    // getting difference in x and y
    var deltaX = Math.round(Math.cos(angle) * cardThrowSpeed); // reason:
    var deltaY = Math.round(Math.sin(angle) * cardThrowSpeed); // refer to general unit circle
    var percentage = 0.9;
    // slide interval //
    var tick_SlideCard = setInterval(function() {
      // abs because deltas can be negative
      if(Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        // multiply deltaX and deltaY by percentage
        deltaX = deltaX * percentage;
        deltaY = deltaY * percentage;
        // increment
        var incrementX = "+="+deltaX+"px";
        var incrementY = "+="+deltaY+"px";
        cardBox.css({"left": incrementX, "top": incrementY});
        var cardX = removePx(cardBox.css("left"));
        var cardY = removePx(cardBox.css("top"));
        // collision with board boundaries
        if(deltaX != 0) {
          if (cardX < 0) {
            cardCollision(cardBox, "left", "0px");
            deltaX = 0;
          } else if(cardX > 1200) {
            cardCollision(cardBox, "left", "1200px");
            deltaX = 0;
          }
        }
        if(deltaY != 0) {
          if (cardY < 0) {
            cardCollision(cardBox, "top", "0px");
            deltaY = 0;
          } else if(cardY > 390) {
            cardCollision(cardBox, "top", "390px");
            deltaY = 0;
          }
        }
      } else {
        clearInterval(tick_SlideCard);
      }   
    }, 5);
  }  
}

// cardCollision sets the card back to the css value given and plays the card hit sound
function cardCollision(cardBox, property, value) {
  cardBox.css(property, value);
  playSound("#card-hit");
}

// setBinding controls card flipping and examining
function setBinding(card) {
  var cardBoxId = card.cardBoxId;
  var cardId = card.cardId;
  var cardFlippedId = card.cardFlippedId;
  $(document).bind("keyup", function(e){
    // if card is being hovered over
    if($(cardBoxId+":hover").length != 0) {
      
      // f - flip //
      if(e.which==70){
		    // flipping to front side
        if(!card.status_FlipCard) {
          setupFlip(card, cardId, cardFlippedId, true);
		    // flipping to back side
        }  else {
          setupFlip(card, cardFlippedId, cardId, false);
		    }
        
      // spacebar - examine // 
      } else if(e.which == 69) {
        var cardsExamined = anyCardExamined(card);
        if(!card.cardScaling && !card.cardMoving && !card.beingDragged && !cardsExamined) {
          card.cardScaling = true;
          card.cardMoving = true;
          
          playSound("#card-woosh");
          
          // scaling variables
          var cardBox = $(cardBoxId);
          card.canDrag = false;
          var deltaW = 50;
          var scalePercentage = 0.9;
          card.beingExamined = !card.beingExamined;
          var sign, endW, endH;
          // since scale animation is used for both enlarging and reducing, we need the variables to change for either state
          if(card.beingExamined) {
            sign = "+";
            endW = cardExamineW;
            endH = cardExamineH;
            cardBox.draggable("disable");
            // put card on top of everything
            var cardZIndex = 900 + card.cardZIndex;
            alterCardStyles({"z-index": cardZIndex}, card);
          } else {
            sign = "-";
            endW = cardPlayW;
            endH = cardPlayH;
          }
          var animationSpeed = 5;
          // scale animation - used for both enlarging and reducing
          var tick_ScaleCard = setInterval(function() {
            if(deltaW > 1) {
              // delta
              deltaW *= scalePercentage;
              var ratio = (cardPlayH / cardPlayW);
              var deltaH = deltaW * ratio;
              // scale
              var scaleW = sign+"="+deltaW+"px";
              var scaleH = sign+"="+deltaH+"px";
              alterCardStyles({"width": scaleW, "height": scaleH}, card);
            } else {
              alterCardStyles({"width": endW, "height": endH}, card); // to ensure card is at the right dimensions
              card.cardScaling = false;
              resetCard(card.cardMoving, card);
              clearInterval(tick_ScaleCard);
            }    
          }, animationSpeed);
          
          // moving variables
          var movePercentage = 0.1;
          var finalX, finalY;
          if(card.beingExamined) {
            // getting location before examination
            card.cardPreX = removePx(cardBox.css("left"));
            card.cardPreY = removePx(cardBox.css("top")); 
          }
          if(!card.beingExamined) {
            // coords alter slightly with each move (possibly due to float inaccuracy), so
            // we round it to get something more consistent 
            finalX = Math.round(card.cardPreX);
            finalY = Math.round(card.cardPreY);
          }
          // move card animation - used for both centring and returning
          var tick_MoveCard = setInterval(function() {
            // centres to middle of board surface
            var xDiff, yDiff;
            // move to centre
            if(card.beingExamined) {
              var board = $("#board-surface");
              finalX = (removePx(board.css("width")) / 2) - (cardExamineW / 2);
              finalY = (removePx(board.css("height")) / 2) - (cardExamineH / 2);
            // return to previous location
            }
            xDiff = finalX - removePx(cardBox.css("left"));
            yDiff = finalY - removePx(cardBox.css("top"));
            if(Math.abs(xDiff) > 1 || Math.abs(yDiff) > 1) {
              xDiff *= movePercentage; yDiff *= movePercentage;
              var moveX = "+="+xDiff+"px";
              var moveY = "+="+yDiff+"px";
              cardBox.css({"left": moveX, "top": moveY});
            } else {
              cardBox.css({"left": finalX, "top": finalY});
              card.cardMoving = false;
              resetCard(card.cardScaling, card);
              clearInterval(tick_MoveCard);
            }     
          }, animationSpeed);
        }
      }
    }
  });
}

// resetCard attempts to make the card draggable again. 
// if it succeeds, the z-index is reset.
function resetCard(bool, card) {
  if(tryMakeDraggable(bool, card)) {
    alterCardStyles({"z-index": card.cardZIndex}, card);  
  }
}

// setupFlip sets up the flip and triggers the animation
function setupFlip(card, side1, side2, status) {
  playSound("#card-flip");
  clearInterval(card.tick_FlipCard);
	card.frontFlipDeg = findYRotation(side1); card.backFlipDeg = findYRotation(side2);
	card.tick_FlipCard = setInterval(anim_FlipCard, 1, side1, side2, card);
	card.status_FlipCard = status;
}

// anyCardExamined checks to see if there are any cards being examined, returning
// false if the fed card is the one being examined
function anyCardExamined(card) {
  for(var i = 0;i < cards.length;i++) {
    if(cards[i].beingExamined) {
      if(cards[i] == card) {
        return false;
      }
      return true;
    }
  }
  return false;  
}

// setHover controls f-indicator visibility for the specified card
function setHover(card) {
  // HoverIn //
	$(card.cardBoxId).hover(function() {
    // f-indicator
		$("#f-indicator").css("visibility", "visible");
    
  // HoverOut //
  }, function() {
    // f-indicator
		$("#f-indicator").css("visibility", "hidden");
  });
}

// findYRotation finds Y rotation of element from 'transform' property matrix
// adapted from: CSS-Tricks
// <https://css-tricks.com/get-value-of-css-rotation-through-javascript/>. 30/8/17
function findYRotation(id) {
  var cardEl = $(id);
  var tr = cardEl.css("transform") ||
           cardEl.css("-webkit-transform") ||
           cardEl.css("-moz-transform") ||
           null;
  if(tr != null) {
    // 'tr' e.g. matrix(a, b, c, d)
  	var trValues = tr.split( "(" )[1]; // '(' onwards
  		trValues = trValues.split( ")" )[0]; // everything before ')'
  		trValues = trValues.split( "," ); // splits up individual values
  	var yRotation = trValues[0];
  	yRotation = Math.round( Math.acos(yRotation) * (180 / Math.PI));
  	return yRotation;
  } else {
    consolePrint("transform property of id '" + id + "' could not be found.");  
  }
}

// setCardBoxSize sets the width and height for the playing card boundary box
function setCardBoxSize(card) {
  var w = $(card.cardId).css("width");
  var h = $(card.cardId).css("height");
  $(card.cardBoxId).css({"width": w, "height": h});
}

// anim_FlipCard controls card flip animation - set to an interval
function anim_FlipCard(side1, side2, card) {
  if(card.frontFlipDeg==90) {
    if(card.backFlipDeg==0) {
      clearInterval(card.tick_FlipCard);
    }
    else {
      card.backFlipDeg--;
      setNewRotation(card.backFlipDeg, side2);
    }   
  } else {
    card.frontFlipDeg++;
    setNewRotation(card.frontFlipDeg, side1);
  }
}

// setNewRotation sets the transform properties of 'sideId' to 'flipDegree'
function setNewRotation(flipDegree, sideId) {
  var rotateY = "rotateY(" + flipDegree + "deg)";
  $(sideId).css({"-webkit-transform": rotateY, "-moz-transform": rotateY, "transform": rotateY});
}

// tryMakeDraggable - general check and set for use in scaling and moving intervals
// so card becomes draggable only when both animations are finished
function tryMakeDraggable(bool, card) {
  var cardBox = $(card.cardBoxId);
  if(!card.beingExamined && !bool) {
    cardBox.draggable("enable");
    return true;  
  }
  return false;
}