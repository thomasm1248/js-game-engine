

function Object(pos) {
	this.pos = pos;
	this.rad = 0;
	this.box = new V(this.rad, this.rad);

	this.remove = false;
}

Object.prototype.draw = function(ctx) {
	ctx.save();
	translate(ctx, this.pos);

	ctx.restore();
};