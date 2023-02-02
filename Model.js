
function Model(canvas, context, config) {
	this.canvas = canvas;
	this.ctx = context;
	this.config = config;
}

Model.prototype.drawAll = function() {
};

Model.prototype.draw = function(layer) {
	switch(layer) {
		case "all":
			this.drawAll();
			break;
	}
};