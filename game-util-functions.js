
/* Game Util Functions

This script requires the 2D Vectors script to work.

*/

// Arrays

function filter(array, selector) {
	var newArray = [];
	for(var i = 0; i < array.length; i++) {
		if(selector(array[i])) {
			newArray.push(array[i]);
		}
	}
	return newArray;
}

function selectGreatest(array, ranker) {
	if(array.length === 0) {
		console.log("Couldn't find the greatest of none.");
		console.trace();
		return null;
	}
	var greatest = array[0];
	var rank = ranker(greatest);
	for(var i = 1; i < array.length; i++) {
		var newRank = ranker(array[i]);
		if(newRank > rank) {
			greatest = array[i];
			rank = newRank;
		}
	}
	return greatest;
}

function sort(array, greaterThan) {
	if(array.length <= 10) {
		for(var i = 1; i < array.length; i++) {
			for(var j = i - 1; j >= 0; j--) {
				if(greaterThan(array[j], array[j + 1])) {
					var tmp = array[j];
					array[j] = array[j + 1];
					array[j + 1] = tmp;
				}
			}
		}
		return array;
	}
	var pivot = array[Math.floor(array.length / 2)];
	var less = [];
	var more = [];
	for(var i = 0; i < array.length; i++) {
		if(greaterThan(array[i], pivot)) {
			more.push(array[i]);
		} else {
			less.push(array[i]);
		}
	}
	return sort(less, greaterThan).concat(sort(more, greaterThan));
}

function doBoxesIntersect(objA, objB) {
	// Too far to the left
	if(objA.pos.x + objA.box.x < objB.pos.x - objB.box.x) return false;
	// Too far to the right
	if(objA.pos.x - objA.box.x > objB.pos.x + objB.box.x) return false;
	// Too far above
	if(objA.pos.y + objA.box.y < objB.pos.y - objB.box.y) return false;
	// Too far below
	if(objA.pos.y - objA.box.y > objB.pos.y + objB.box.y) return false;
	// Object A overlaps object B in some way
	return true;
}

function forEachIntersectingBox(object, array, action) {
	for(var i = 0; i < array.length; i++) {
		if(doBoxesIntersect(object, array[i])) action(object, array[i]);
	}
}

// Canvas

var ctx;

function initCanvas(canvas, width, height) {
	canvas.width = width;
	canvas.height = height;
	ctx = canvas.getContext("2d");
}

function initCanvasFullscreen(canvas) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	ctx = canvas.getContext("2d");
}

function translate(ctx, vector) {
	ctx.translate(vector.x, vector.y);
}

// Vectors

function bindObjectToCanvas(object, canvas) {
	if(object.pos.x < object.box.x) object.pos.x = object.box.x;
	if(object.pos.x > canvas.width - object.box.x) object.pos.x = canvas.width - object.box.x;
	if(object.pos.y < object.box.y) object.pos.y = object.box.y;
	if(object.pos.y > canvas.height - object.box.y) object.pos.y = canvas.height - object.box.y;
}



// Physics

/*
This method assumes that each input object is round, and has pos,
vel, and mass attributes.
*/
function calculateElasticCollision(ball1, ball2) {
    // Get normal that collision will happen on
    normal = ball2.pos.subtract(ball1.pos).normalize();

    // Project velocities of both balls onto normal
    var v1 = ball1.vel.dot(normal);
    var v2 = ball2.vel.dot(normal);

    // Use formula to calculate final velocities
    var v1f = (v1 * (ball1.mass - ball2.mass) + 2 * ball2.mass * v2) / (ball1.mass + ball2.mass);
    var v2f = (v2 * (ball2.mass - ball1.mass) + 2 * ball1.mass * v1) / (ball2.mass + ball1.mass);

    // Apply changes to the velocities of each ball
    ball1.vel.accum(normal.scale(v1f - v1));
    ball2.vel.accum(normal.scale(v2f - v2));

    // Figure out how much they overlap
    var overlap = ball1.rad + ball2.rad - ball1.pos.dist(ball2.pos);

    // Calculate how much to shift each ball based on the overlap and their masses
    var totalMass = ball1.mass + ball2.mass;
    var ball1Shift = ball2.mass / totalMass * overlap;
    var ball2Shift = ball1.mass / totalMass * overlap;

    // Apply the calculated shift
    ball1.pos.accum(normal.scale(-ball1Shift));
    ball2.pos.accum(normal.scale(ball2Shift));
}

function elasticCollisions(balls) {
    for(var i = 0; i < balls.length; i++) {
        var b1 = balls[i];
        for(var j = i + 1; j < balls.length; j++) {
            var b2 = balls[j];

            if(b1.pos.dist(b2.pos) <= b1.rad + b2.rad) {
                calculateElasticCollision(b1, b2);
            }
        }
    }
}

function applyFriction(objects, friAmount) {
	for(var i = 0; i < objects.length; i++) {
        var norm = objects[i].vel.norm();
        objects[i].vel = objects[i].vel.scale(norm <= friAmount ? 0 : (norm - friAmount) / norm);
	}
}

function applyVelocity(objects) {
	for(var i = 0; i < objects.length; i++) {
		objects[i].pos.accum(objects[i].vel);
	}
}

// Each object needs a box
function bounceWithinCanvas(objects, canvas) {
	if(objects[i].pos.x < objects[i].box.x) objects[i].vel.x *= -1;
	if(objects[i].pos.y < objects[i].box.y) objects[i].vel.y *= -1;
	if(objects[i].pos.x > canvas.width - objects[i].box.x) objects[i].vel.x *= -1;
	if(objects[i].pos.y > canvas.height - objects[i].box.y) objects[i].vel.y *= -1;
	bindObjectToCanvas(objects[i], canvas);
}



// Game Management

function simpleObjectUpdateManager(objects, model) {
	for(var i = 0; i < objects.length; i++) {
		if(objects[i].update(model)) {
			objects.splice(i--, 1);
		}
	}
}