//get reference to the button for drawing rectangles
var drawBtn = document.getElementById('btn-draw');

//get reference to the button for clearing rectangles
var resetBtn = document.getElementById('btn-reset');

//get reference to the area where rectangles are drawn
var rectangleArea = document.getElementById('rectangle-area');

//get reference to output area
var rectangleCompareResults = document.getElementById('rectangle-compare-results');

//keep rectangle count
var numRectangles = 0;

//Rectangles array
var Rectangles = [];

//For comparisons between two rectangles
var selected = false;

//Rectangles for comparison
var firstSelectionID = null;
var secondSelectionID = null;

//Temporary intersection rectangle 
var intersectionRectangle = null;

//Selector for contained rectangle
var containedRectangle = null;

//add event listener to draw rectangle button
drawBtn.addEventListener('click', function(event) {
	//get random x, y, width, height attributes

	//random x generates a random number from 0 to 17
	randomX = Math.floor(Math.random() * (17 - 0)) + 0;

	//based on a grid of 20 rows and 20 columns, max width is set as 20 - X
	maxWidth = 20 - randomX;

	//find random width based on max width
	randomWidth = (Math.floor(Math.random() * (maxWidth - 3)) + 3) * 25;

	//adjust x value for the 500px container
	randomX *= 25;


	//random Y generates a random number from 0 to 17
	randomY = Math.floor(Math.random() * (17 - 0)) + 0;

	//based on a grid of 20 rows and 20 columns, max height is set as 20 - Y
	maxHeight = 20 - randomY;

	//find random Height based on max Height
	randomHeight = (Math.floor(Math.random() * (maxHeight - 3)) + 3) * 25;

	//adjust y value for the 500px container
	randomY *= 25;

	//new rectangle object
	var newRectangle = new Rectangle(randomX, randomY, randomWidth, randomHeight, numRectangles);
	Rectangles.push(newRectangle);

	//num rectangles keeps the rectangle count and acts as an ID
	numRectangles++;

	//draw new rectangle object, parameter of true to get a new ID and add click event
	newRectangle.drawRectangle(true);
});

//add event listener to reset rectangles button
resetBtn.addEventListener('click', function(event) {
	//keep rectangle count
	numRectangles = 0;

	//Rectangles array
	Rectangles = [];

	//For comparisons between two rectangles
	selected = false;

	//Rectangles for comparison
	firstSelectionID = null;
	secondSelectionID = null;

	//Temporary intersection rectangle 
	intersectionRectangle = null;

	//Selector for contained rectangle
	containedRectangle = null;

	//reset message to user
	rectangleCompareResults.innerHTML = "";

	//remove all rectangle representations
	rectangleArea.innerHTML = "";
});

//Rectangle object constructor
function Rectangle(x_coord, y_coord, width, height, id) {
	//set properties based on parmeter inputs
	this.left = x_coord;
	this.top = y_coord;
	this.width = width;
	this.height = height;
	this.right = this.left + this.width;
	this.bottom = this.top + this.height;
	this.id = id;

}

//Create new rectangle as a div in the rectangle area
//Attach click event to the div representing the rectangle
//@param added - boolean that is true if the rectangle was added with the draw rectangle button
Rectangle.prototype.drawRectangle = function(added) {
	//Create new div
	newRectangle = document.createElement("div");

	//Rectangle styling based on properties
	newRectangle.style.position = 'absolute';
	newRectangle.style.width = this.width + 'px';
	newRectangle.style.height = this.height + 'px';
	newRectangle.style.top = this.top + 'px';
	newRectangle.style.left = this.left + 'px';
	newRectangle.id = "JDR" + this.id;	

	//based on creating a new rectangle with the draw rectangle button or a temporary intersection rectangle
	if (added) {
		newRectangle.style.zIndex = numRectangles;
		newRectangle.className = "JDRectangle";
	} else {
		newRectangle.className = "JDRectangle highlight-background";
		newRectangle.style.zIndex = 9999;
	}

	//Add rectangle to DOM
	rectangleArea.appendChild(newRectangle);
	
	//Click event for rectangle
	if (added) {
		newRectangle.onclick = newRectangle.addEventListener('click', this.rectangleClick, false);
	}
}

//Click event function 
//Adds a selected class to show the selected rectangles, and logs the ids of rectangles. 
//Resets previous selected and intersecting classes / colors
Rectangle.prototype.rectangleClick = function() {
	if (!selected) {

		//if this is not the first comparison
		if ( firstSelectionID ) {
			//temporary variable for storing a reference
			var temp = null

			//remove the selected class from the previously compared rectangles
			firstSelection = document.getElementById('JDR' + firstSelectionID);
			firstSelection.classList.remove("selected");
			secondSelection = document.getElementById('JDR' + secondSelectionID);
			secondSelection.classList.remove("selected");

			//remove temporary intersection rectangle from DOM
			if ( intersectionRectangle ) {
				//if pervious comparison returned intersection
				temp = document.getElementById('JDR9999');

				//remove temporary rectangle illustrating the intersection
				rectangleArea.removeChild(temp);

				//reset intersection reference
				intersectionRectangle = null;	
			}
		
			//remove highlight from contained div
			if ( containedRectangle ) {
				//if previous comparison returned containment
				containedRectangle.classList.remove("highlight-background");
				
				//reset contained reference
				containedRectangle = null;
			}
		}

		//add selected class
		this.classList.add("selected");
		this.style.zIndex = 0;

		//log the first selected ID
		firstSelectionID = this.getAttribute('id').substring(3,6);

		//set the selected trigger
		selected = true;	
		rectangleCompareResults.innerHTML = "";
	} else {
		//get the second selected ID
		secondSelectionID = this.getAttribute('id').substring(3,6);
		
		//if it is the same as the first
		if ( firstSelectionID === secondSelectionID ) {
			//output error message to user
			rectangleCompareResults.innerHTML = "Please select two different rectangles for comparison.";
			
		} else {
			//add selected class
			this.classList.add("selected");

			//reset the selected trigger
			selected = false;

			//initiate spatial comparison
			Rectangles[firstSelectionID].spatialComparison( Rectangles[secondSelectionID] );
		}
	}
}

//Spatial comparison function
//Starts with testing for adjacency, then for overlapping, ending if not overlapping
//If overlap is found then a test for containment, if not then they are intersecting
//@param rectangleToCompare - second selected rectangle object
Rectangle.prototype.spatialComparison = function(rectangleToCompare) {
	//save this rectangle object
	thisRectangle = this;

	//containment variables for spatial comparison
	var containX = null;
	var containY = null;
	var contain = false;

	//check for the possibility of adjacency, intersection or containment
	if ( !thisRectangle.isNear(rectangleToCompare) ) {
		//false - no possibility of adjacency, intersection or containment

		//rectangles not adjacent or overlapping
		rectangleCompareResults.innerHTML = "Not adjacent, containing or intersecting";

	} else {
		//true - definite overlap or adjacency
		
		//test for adjacency
		if ( thisRectangle.isAdjacent(rectangleToCompare) ) {
			//true - rectangles are adjacent
			rectangleCompareResults.innerHTML = "Adjacent";
		
		} else {
			//false - rectangles are not adjacent - either containing or intersecting

			//check for containment

			//containment in x --> find rectangle with higher left value
			if ( thisRectangle.left >= rectangleToCompare.left ) {
				
				if ( thisRectangle.right <= rectangleToCompare.right ) {
					//containment in x dirction, thisRectangle is being contained in RTC
					containX = thisRectangle;
					interWidth = thisRectangle.width;

				} else {
					//no containment in x direction --> no overall containment, just intersection
					containX = false;
					interWidth = rectangleToCompare.right - thisRectangle.left;

				}

				//containment or intersection left edge
				interLeft = thisRectangle.left;
			} else {

				if ( rectangleToCompare.right <= thisRectangle.right ) {
					//containment in x dirction, RTC is being contained in thisRectangle
					containX = rectangleToCompare;
					interWidth = rectangleToCompare.width;

				} else {
					//no containment in x direction --> no overall containment, just intersection
					containX = false;
					interWidth = thisRectangle.right - rectangleToCompare.left;
				}

				//containment or intersection left edge
				interLeft = rectangleToCompare.left;
			}


			//containment in y --> find rectangle with higher top value
			if ( thisRectangle.top >= rectangleToCompare.top ) {
				
				if ( thisRectangle.bottom <= rectangleToCompare.bottom ) {
					//containment in y dirction, thisRectangle is being contained in RTC
					containY = thisRectangle;
					interHeight = thisRectangle.height;

				} else {
					//no containment in y direction --> no overall containment, just intersection
					containY = false;
					interHeight = rectangleToCompare.bottom - thisRectangle.top;

				}

				//containment or intersection top edge
				interTop = thisRectangle.top;
			} else {

				if ( rectangleToCompare.bottom <= thisRectangle.bottom ) {
					//containment in y dirction, RTC is being contained in thisRectangle
					containY = rectangleToCompare;
					interHeight = rectangleToCompare.height;

				} else {
					//no containment in y direction --> no overall containment, just intersection
					containY = false;
					interHeight = thisRectangle.bottom - rectangleToCompare.top;
				}

				//containment or intersection top edge
				interTop = rectangleToCompare.top;
			}


			//utilize containX === containY to determine overall containment
			if ( containX && containX === containY && containY) {
				//true --> containment
				containedRectangle = document.getElementById("JDR" + containX.id);
				containedRectangle.classList.add("highlight-background");
				containedRectangle.style.zIndex = 9999;

				//display comparison results for user
				rectangleCompareResults.innerHTML = "Containment";

			} else {
				//false --> intersection

				//create new rectangle object, use impossible ID to avoid conflict
				intersectionRectangle = new Rectangle(interLeft, interTop, interWidth, interHeight, 9999);

				//draw the new rectangle
				intersectionRectangle.drawRectangle(false);

				//display comparison results for user
				rectangleCompareResults.innerHTML = "Intersection";
			}
		}
	}
}

//Adjacency test function
//Searching for opposing sides with similar values
//@param rectangleToCompare - second selected rectangle object
Rectangle.prototype.isAdjacent = function(rectangleToCompare) {
	//save this rectangle object
	thisRectangle = this;

	//return true if any opposing sides (i.e. top of one and bottom of the other) are equal
	return (thisRectangle.bottom === rectangleToCompare.top || thisRectangle.top === rectangleToCompare.bottom || thisRectangle.left === rectangleToCompare.right || thisRectangle.right === rectangleToCompare.left);
}

//Overlap test function
//Testing 4 certain failure conditions to determine if any adjacency or overlap exists
//Condition A: First rectangle selection is below second rectangle selection
//Condition B: First rectangle selection is above second rectangle selection
//Condition C: First rectangle selection is left of second rectangle selection
//Condition D: First rectangle selection is right of second rectangle selection
//@param rectangleToCompare - second selected rectangle object
//@return overlapResults - booleans, true for definite adjacency or overlap
Rectangle.prototype.isNear = function(rectangleToCompare) {
	//save this rectangle object
	thisRectangle = this;

	//for returning the results of the comparison
	var near = null;

	//boolean conditions as described above
	var conditionA = thisRectangle.top    > rectangleToCompare.bottom;
	var conditionB = thisRectangle.bottom < rectangleToCompare.top;
	var conditionC = thisRectangle.right  < rectangleToCompare.left;
	var conditionD = thisRectangle.left   > rectangleToCompare.right;
	
	//if any condition is true then there is no possibility of adjacency, intersection or containment.
	if (conditionA || conditionB || conditionC || conditionD) {
		near = false;
	} else {
		//otherwise will need further checks to determine realtionship
		near = true;
	}

	//return result
	return near;
}
