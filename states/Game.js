
function Game(engine) {
	// Shortcuts
	this.engine = engine;
	this.model = engine.model;
	this.config = engine.config;
}

/* Game loop

Everything that happens each frame in the game is done here.

*/
Game.prototype.update = function() {
	this.model.draw("all");
};