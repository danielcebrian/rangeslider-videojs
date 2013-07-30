//----------------Load Plugin----------------//

//-- Load RangeSlider plugin in videojs
function RangeSlider_(options){
	var player = this;
	
	player.rangeslider=new RangeSlider(player, options);
	
	//All components will be initialize after they have been loaded by videojs
	player.rangeslider.rstb.init_();
	player.rangeslider.box.init_();
	player.rangeslider.bar.init_();
	player.rangeslider.left.init_();
	player.rangeslider.right.init_();
	
	console.log("Loaded Plugin RangeSlider");
}
videojs.plugin('rangeslider', RangeSlider_);



//-- Plugin
function RangeSlider(player,options){
	var player = player || this;
	
	this.player = player;
	
	this.components = {}; // holds any custom components we add to the player

	options = options || {}; // plugin options
	if(!options.hasOwnProperty('locked')) {
		options.locked = false; // lock slider handles
	}
	this.options = options;
	
	this.init();
}

//-- Methods
RangeSlider.prototype = {
	/*Constructor*/
	init:function(){
		var player = this.player || {};
		
		this.updatePrecision = 3;
		
		var seekBar = player.controlBar.progressControl.seekBar;
		this.components.RSTimeBar = seekBar.RSTimeBar;
		
		this.hide(); //Hide the Range Slider
		
		if(this.options.locked) {
			this.lock();
		}
		
		//Save local variables
		this.rstb = this.components.RSTimeBar;
		this.box = this.rstb.SeekRSBar;
		this.bar = this.box.SelectionBar;
		this.left = this.box.SelectionBarLeft;
		this.right = this.box.SelectionBarRight;
	},
	lock: function() {
		this.options.locked = true;
		vjs.addClass(this.box.el_, 'locked');
	},
	unlock: function() {
		this.options.locked = false;
		vjs.removeClass(this.box.el_, 'locked');
	},
	show:function(){
		this.components['RSTimeBar'].show();
	},
	hide:function(){
		this.components.RSTimeBar.hide();
	},
	setValue: function(index, value) {
		//index = 0 for the left Arrow and 1 for the right Arrow
		var val = this._percent(value);
		var isValidIndex = (index === 0 || index === 1);
		var isChangeable = !this.locked;

		if(isChangeable && isValidIndex)
			this.box.setPosition(index,val);
	},
	getValues: function() {
		var values = {}, start, end;
		start = this._getArrowValue(0);
		end = this._getArrowValue(1);
		return {start:start, end:end};
	},
	playBetween: function(start, end) {
		this.player.currentTime(start);
		this.player.play();
		this.show();
		
		if(this.options.locked) {
			this.unlock();//It is unlocked to change the bar position. In the end it will return the value.
			this.setValue(0,start);
			this.setValue(1,end);
			this.lock();
		}else{
			this.setValue(0,start);
			this.setValue(1,end);
		}
		
		this.bar.activatePlay(start,end);
	},
	_getArrowValue: function(index) {
		var index = index || 0;
		var duration = this.player.duration();
		
		duration = typeof duration == 'undefined'? 0 : duration;
		
		var percent = this[index === 0? "left" : "right"].el_.style.left.replace("%","");
		if (percent == "")
			percent = index === 0? 0 : 100;
			
		return vjs.round(Math.min(duration, Math.max(0, duration * percent / 100)),this.updatePrecision-1);
	},
	_percent: function(value) {
		var duration = this.player.duration();
		if(isNaN(duration)) {
			return 0;
		}
		return Math.min(1, Math.max(0, value / duration));
	},
};


//----------------Public Functions----------------//

//-- Public Functions added to video-js

//Lock the Slider bar and it will not be possible to change the arrow positions
videojs.Player.prototype.lockSlider = function(){
	return this.rangeslider.lock();
};

//Unlock the Slider bar and it will be possible to change the arrow positions
videojs.Player.prototype.unlockSlider = function(){
	return this.rangeslider.unlock();
};

//Show the Slider Bar Component
videojs.Player.prototype.showSlider = function(){
	return this.rangeslider.show();
};

//Hide the Slider Bar Component
videojs.Player.prototype.hideSlider = function(){
	return this.rangeslider.hide();
};

//Set a Value in second for the arrows
videojs.Player.prototype.setValue = function(index, value){
	return this.rangeslider.setValue(options);
};

//The video will be played in a selected section
videojs.Player.prototype.playBetween = function(start, end){
	return this.rangeslider.playBetween(start, end);
};

//Set a Value in second for the arrows
videojs.Player.prototype.getValues = function(){
	return this.rangeslider.getValues();
};



//----------------Create new Components----------------//

//--Charge the new Component into videojs
vjs.SeekBar.prototype.options_.children.RSTimeBar={}; //Range Slider Time Bar



//-- Design the new components

/**
 * Range Slider Time Bar
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.RSTimeBar = vjs.Component.extend({
  /** @constructor */
	init: function(player, options){
		vjs.Component.call(this, player, options);
	}
});

vjs.RSTimeBar.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

vjs.RSTimeBar.prototype.options_ = {
	children: {
		'SeekRSBar': {}
	}
};

vjs.RSTimeBar.prototype.createEl = function(){
	return vjs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-timebar-RS',
		innerHTML: ''
	});
};



/**
 * Seek Range Slider Bar and holder for the selection bars
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.SeekRSBar = vjs.Component.extend({
  /** @constructor */
	init: function(player, options){
		vjs.Component.call(this, player, options);
		this.on('mousedown', this.onMouseDown);
		this.handleValue = null; // position of handle on bar, number between 0 and 1
	}
});

vjs.SeekRSBar.prototype.init_ =function(){
    	this.rs = this.player_.rangeslider;
};

vjs.SeekRSBar.prototype.options_ = {
	children: {
		'SelectionBar': {},
		'SelectionBarLeft': {},
		'SelectionBarRight': {}
	}
};

vjs.SeekRSBar.prototype.createEl = function(){
	return vjs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-rangeslider-holder'
	});
};


vjs.SeekRSBar.prototype.onMouseDown = function(event) {
	event.preventDefault();
	vjs.blockTextSelection();
	
	if(!this.rs.options.locked) {
		vjs.on(document, "mousemove", vjs.bind(this,this.onMouseMove));
		vjs.on(document, "mouseup", vjs.bind(this,this.onMouseUp));
	}
};

vjs.SeekRSBar.prototype.onMouseUp = function(event) {
	vjs.off(document, "mousemove", this.onMouseMove, false);
	vjs.off(document, "mouseup", this.onMouseUp, false);
};

vjs.SeekRSBar.prototype.onMouseMove = function(event) {
	var left = this.calculateDistance(event);
	
	if (this.rs.left.pressed)
		this.setPosition(0,left);
	else if (this.rs.right.pressed)
		this.setPosition(1,left);
};

vjs.SeekRSBar.prototype.setPosition = function(index,left) {
	//index = 0 for left side, index = 1 for right side
	var handle = this;

	// Position shouldn't change when handle is locked
	if(this.rs.options.locked)
		return false;

	// Check for invalid position
	if(isNaN(left)) 
		return false;
	
	// Check index between 0 and 1
	if(!(index === 0 || index === 1))
		return false;
	
	// Alias
	var ObjLeft = this.rs.left.el_,
		ObjRight = this.rs.right.el_,
		Obj = this.rs[index === 0 ? 'left' : 'right'].el_,
		bar = this.rs.bar;
	
	// Move the handle and bar from the left based on the current distance
	this.handleValue = left;
	
	//Check if left arrow is passing the right arrow
	if ((index === 0 ?bar.updateLeft(left):bar.updateRight(left))){
		Obj.style.left = vjs.round(this.handleValue * 100, 2) + '%';
		index === 0 ?bar.updateLeft(left):bar.updateRight(left);
	
		//Fix the problem  when you press the button and the two arrow are underhand
		//left.zIndex = 10 and right.zIndex=20. This is always less in this case:
		if (index === 0 && vjs.round(this.handleValue * 100, 2) >= 90)
				ObjLeft.style.zIndex = 25;
		else
				ObjLeft.style.zIndex = 10;
	}
	return true;
};

vjs.SeekRSBar.prototype.calculateDistance = function(event){
	var rstbX = this.getRSTBX();
	var rstbW = this.getRSTBWidth();
	var handleW = this.getWidth();

	// Adjusted X and Width, so handle doesn't go outside the bar
	rstbX = rstbX + (handleW / 2);
	rstbW = rstbW - handleW;

	// Percent that the click is through the adjusted area
	return Math.max(0, Math.min(1, (event.pageX - rstbX) / rstbW));
};

vjs.SeekRSBar.prototype.getRSTBWidth = function() {
	return this.rs.rstb.el_.offsetWidth;
};
vjs.SeekRSBar.prototype.getRSTBX = function() {
	return vjs.findPosition(this.rs.rstb.el_).left;
};
vjs.SeekRSBar.prototype.getWidth = function() {
	return this.rs.left.el_.offsetWidth;//does not matter left or right
};

vjs.SeekRSBar.prototype.getOffsetLeftPercent = function(offsetleft) {
	return offsetleft / this.getRSTBWidth();
};
vjs.SeekRSBar.prototype.getRawValue = function() {
	return this.handleValue;
};
vjs.SeekRSBar.prototype.getValue = function() {
	if(this.handleValue !== null) {
		return vjs.round(this.handleValue * this.player.duration(), 2);
	}
	return null;
};
vjs.SeekRSBar.prototype.setRawValue = function(rawValue) {
	this.handleValue = rawValue;
};
vjs.SeekRSBar.prototype.setBarUpdateHandler = function(fn) {
	this.updateBar = fn;
};



/**
 * This is the bar with the selection of the RangeSlider
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.SelectionBar = vjs.Component.extend({
  /** @constructor */
	init: function(player, options){
		vjs.Component.call(this, player, options);
		this.on('mouseup', this.onMouseUp);
		this.fired = false;
	}
});

vjs.SelectionBar.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

vjs.SelectionBar.prototype.createEl = function(){
	return vjs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-selectionbar-RS'
	});
};

vjs.SelectionBar.prototype.onMouseUp = function(){
	var start = this.rs.left.el_.style.left.replace("%",""),
		end = this.rs.right.el_.style.left.replace("%",""),
		duration = this.player_.duration(),
		precision = this.rs.updatePrecision,
		segStart = vjs.round(start * duration/100, precision),
		segEnd = vjs.round(end * duration/100, precision);
	this.player_.currentTime(segStart);
	this.player_.play();
	this.rs.bar.activatePlay(segStart,segEnd);
};

vjs.SelectionBar.prototype.updateLeft = function(left) {
	var offsetleft = this.rs.right.el_.offsetLeft;
	var max = this.rs.box.getOffsetLeftPercent(offsetleft);
	var width = this.rs.box.getOffsetLeftPercent(offsetleft) - left;
	var precision = this.rs.updatePrecision;
	if(vjs.round(left, precision) <= vjs.round(max, precision)) {
			this.rs.bar.el_.style.left = vjs.round(left * 100, precision) + '%';
			this.rs.bar.el_.style.width = vjs.round(width * 100, precision) + '%';
			return true;
	}
	return false;
};
		
vjs.SelectionBar.prototype.updateRight = function(left) {
	var offsetleft = this.rs.left.el_.offsetLeft;
	var min = this.rs.box.getOffsetLeftPercent(offsetleft);
	
	var width = left - this.rs.box.getOffsetLeftPercent(offsetleft);
	var precision = this.rs.updatePrecision;
	
	if(vjs.round(left, precision) >= vjs.round(min, precision)) {
		var w = vjs.round(width * 100, precision);
		this.rs.bar.el_.style.width = w + '%';
		this.rs.bar.el_.style.left = vjs.round(left * 100 - w, precision) + '%';
		return true;
	}
	return false;
};
vjs.SelectionBar.prototype.activatePlay = function(start,end){
	this.timeStart = start;
	this.timeEnd = end;
	this.player_.on("timeupdate", function(){
		this.rangeslider.bar._processPlay();
	});
};
vjs.SelectionBar.prototype.suspendPlay = function(){
	this.fired = false;
	this.player_.off("timeupdate", function(){
		this.rangeslider.bar._processPlay();
	});
};
vjs.SelectionBar.prototype._processPlay = function (start,end){
	//Check if current time is between start and end
    if(this.player_.currentTime() >= this.timeStart && (this.timeEnd < 0 || this.player_.currentTime() < this.timeEnd)){
        if(this.fired){ //Do nothing if start has already been called
            return;
        }
        this.fired = true; //Set fired flag to true
    }else{
        if(!this.fired){ //Do nothing if end has already been called
            return;
        }
        this.fired = false; //Set fired flat to false
        this.player_.currentTime(this.timeEnd);
        this.player_.pause(); //Call end function
        this.suspendPlay();
    }
};

/**
 * This is the left arrow to select the RangeSlider
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.SelectionBarLeft = vjs.Component.extend({
  /** @constructor */
	init: function(player, options){
		vjs.Component.call(this, player, options);
		this.on('mousedown', this.onMouseDown);
		this.pressed = false;
	}
});

vjs.SelectionBarLeft.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

vjs.SelectionBarLeft.prototype.createEl = function(){
  return vjs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-rangeslider-handle vjs-selectionbar-left-RS',
    innerHTML: '<div class="vjs-selectionbar-arrow-RS"></div><div class="vjs-selectionbar-line-RS"></div>'
  });
};

vjs.SelectionBarLeft.prototype.onMouseDown = function(event) {
	event.preventDefault();
	vjs.blockTextSelection();
	if(!this.rs.options.locked) {
		this.pressed = true;
		vjs.on(document, "mouseup", vjs.bind(this,this.onMouseUp));
		vjs.addClass(this.el_, 'active');
	}
};

vjs.SelectionBarLeft.prototype.onMouseUp = function(event) {
	vjs.off(document, "mouseup", this.onMouseUp, false);
	vjs.removeClass(this.el_, 'active');
	if(!this.rs.options.locked) {
		this.pressed = false;
	}
};



/**
 * This is the right arrow to select the RangeSlider
 * @param {vjs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
vjs.SelectionBarRight = vjs.Component.extend({
  /** @constructor */
	init: function(player, options){
		vjs.Component.call(this, player, options);
		this.on('mousedown', this.onMouseDown);
		this.pressed = false;
	}
});

vjs.SelectionBarRight.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

vjs.SelectionBarRight.prototype.createEl = function(){
	return vjs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-rangeslider-handle vjs-selectionbar-right-RS',
		innerHTML: '<div class="vjs-selectionbar-arrow-RS"></div><div class="vjs-selectionbar-line-RS"></div>'
	});
};


vjs.SelectionBarRight.prototype.onMouseDown = function(event) {
	event.preventDefault();
	vjs.blockTextSelection();
	if(!this.rs.options.locked) {
		this.pressed = true;
		vjs.on(document, "mouseup", vjs.bind(this,this.onMouseUp));
		vjs.addClass(this.el_, 'active');
	}
};

vjs.SelectionBarRight.prototype.onMouseUp = function(event) {
	vjs.off(document, "mouseup", this.onMouseUp, false);
	vjs.removeClass(this.el_, 'active');
	if(!this.rs.options.locked) {
		this.pressed = false;
	}
};
