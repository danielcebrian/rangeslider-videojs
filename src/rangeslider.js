//----------------Load Plugin----------------//
(function (){
//-- Load RangeSlider plugin in videojs
function RangeSlider_(options){
	var player = this;
	
	player.rangeslider=new RangeSlider(player, options);
	
	
	//When the DOM and the video media is loaded
	function initialVideoFinished(event) {
		var plugin = player.rangeslider;
		//All components will be initialize after they have been loaded by videojs
		plugin.rstb.init_();
		plugin.box.init_();
		plugin.bar.init_();
		plugin.left.init_();
		plugin.right.init_();
		plugin.tp.init_();
		plugin.tpl.init_();
		plugin.tpr.init_();
		
		if (plugin.options.hidden)
			plugin.hide(); //Hide the Range Slider
			
		if(plugin.options.locked) 
			plugin.lock(); //Lock the Range Slider
			
		if(plugin.options.panel==false) 
			plugin.hidePanel(); //Hide the second Panel

		plugin._reset();
	}
	this.on('durationchange', initialVideoFinished);
	
	
	console.log("Loaded Plugin RangeSlider");
}
videojs.plugin('rangeslider', RangeSlider_);



//-- Plugin
function RangeSlider(player,options){
	var player = player || this;
	
	this.player = player;
	
	this.components = {}; // holds any custom components we add to the player

	options = options || {}; // plugin options
	
	if(!options.hasOwnProperty('locked')) 
		options.locked = false; // lock slider handles
		
	if(!options.hasOwnProperty('hidden')) 
		options.hidden = true; // hide slider handles
		
	if(!options.hasOwnProperty('panel')) 
		options.panel = true; // Show Second Panel
	
	this.options = options;
	
	this.init();
}

//-- Methods
RangeSlider.prototype = {
	/*Constructor*/
	init:function(){
		var player = this.player || {};
		
		this.updatePrecision = 3;
		
		//position in second of the arrows
		this.start = 0;
		this.end = 0;
		
		//components of the plugin
		var seekBar = player.controlBar.progressControl.seekBar;
		this.components.RSTimeBar = seekBar.RSTimeBar;
		
		//Save local component 
		this.rstb = this.components.RSTimeBar;
		this.box = this.rstb.SeekRSBar;
		this.bar = this.box.SelectionBar;
		this.left = this.box.SelectionBarLeft;
		this.right = this.box.SelectionBarRight;
		this.tp = this.box.TimePanel;
		this.tpl = this.tp.TimePanelLeft;
		this.tpr = this.tp.TimePanelRight;
		
	},
	lock: function() {
		this.options.locked = true;
		if (typeof this.box != 'undefined')
			videojs.addClass(this.box.el_, 'locked');
	},
	unlock: function() {
		this.options.locked = false;
		if (typeof this.box !='undefined')
			videojs.removeClass(this.box.el_, 'locked');
	},
	show:function(){
		this.options.hidden = false;
		if (typeof this.rstb !='undefined')
			this.rstb.show();
	},
	hide:function(){
		this.options.hidden = true;
		if (typeof this.rstb !='undefined')
			this.rstb.hide();
	},
	showPanel:function(){
		this.options.panel = true;
		if (typeof this.tp !='undefined')
			this.tp.show();
	},
	hidePanel:function(){
		this.options.panel = false;
		if (typeof this.tp !='undefined')
			this.tp.hide();
	},
	setValue: function(index, seconds) {
		//index = 0 for the left Arrow and 1 for the right Arrow. Value in seconds
		var percent = this._percent(seconds);
		var isValidIndex = (index === 0 || index === 1);
		var isChangeable = !this.locked;

		if(isChangeable && isValidIndex)
			this.box.setPosition(index,percent);
	},
	getValues: function() { //get values in seconds
		var values = {}, start, end;
		start = this.start || this._getArrowValue(0);
		end = this.end || this._getArrowValue(1);
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
		
		var percentage = this[index === 0? "left" : "right"].el_.style.left.replace("%","");
		if (percentage == "")
			percentage = index === 0? 0 : 100;
			
		return videojs.round(this._seconds(percentage / 100),this.updatePrecision-1);
	},
	_percent: function(seconds) {
		var duration = this.player.duration();
		if(isNaN(duration)) {
			return 0;
		}
		return Math.min(1, Math.max(0, seconds / duration));
	},
	_seconds: function(percent) { 
		var duration = this.player.duration();
		if(isNaN(duration)) {
			return 0;
		}
		return Math.min(duration, Math.max(0, percent * duration));
	},
	_reset: function() {
		var duration = this.player.duration();
		this.setValue(0,0);
		this.setValue(1,duration);
	},
	_formatTime: function(percentage) {
		var duration = this.player.duration();
		var second = Math.min(duration, Math.max(0, duration * percentage / 100));
		return videojs.formatTime(second);
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

//Show the Panel with the seconds of the selection
videojs.Player.prototype.showSliderPanel = function(){
	return this.rangeslider.showPanel();
};

//Hide the Panel with the seconds of the selection
videojs.Player.prototype.hideSliderPanel = function(){
	return this.rangeslider.hidePanel();
};

//Set a Value in second for the arrows
videojs.Player.prototype.setValueSlider = function(index, seconds){
	return this.rangeslider.setValue(index, seconds);
};

//The video will be played in a selected section
videojs.Player.prototype.playBetween = function(start, end){
	return this.rangeslider.playBetween(start, end);
};

//Set a Value in second for the arrows
videojs.Player.prototype.getValueSlider = function(){
	return this.rangeslider.getValues();
};



//----------------Create new Components----------------//

//--Charge the new Component into videojs
videojs.SeekBar.prototype.options_.children.RSTimeBar={}; //Range Slider Time Bar



//-- Design the new components

/**
 * Range Slider Time Bar
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
videojs.RSTimeBar = videojs.Component.extend({
  /** @constructor */
	init: function(player, options){
	console.log(player);
		videojs.Component.call(this, player, options);
	}
});

videojs.RSTimeBar.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

videojs.RSTimeBar.prototype.options_ = {
	children: {
		'SeekRSBar': {}
	}
};

videojs.RSTimeBar.prototype.createEl = function(){
	return videojs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-timebar-RS',
		innerHTML: ''
	});
};



/**
 * Seek Range Slider Bar and holder for the selection bars
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
videojs.SeekRSBar = videojs.Component.extend({
  /** @constructor */
	init: function(player, options){
		videojs.Component.call(this, player, options);
		this.on('mousedown', this.onMouseDown);
		this.handleValue = null; // position of handle on bar, number between 0 and 1
	}
});

videojs.SeekRSBar.prototype.init_ =function(){
    	this.rs = this.player_.rangeslider;
};

videojs.SeekRSBar.prototype.options_ = {
	children: {
		'SelectionBar': {},
		'SelectionBarLeft': {},
		'SelectionBarRight': {},
		'TimePanel': {}
	}
};

videojs.SeekRSBar.prototype.createEl = function(){
	return videojs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-rangeslider-holder'
	});
};


videojs.SeekRSBar.prototype.onMouseDown = function(event) {
	event.preventDefault();
	videojs.blockTextSelection();
	
	if(!this.rs.options.locked) {
		videojs.on(document, "mousemove", videojs.bind(this,this.onMouseMove));
		videojs.on(document, "mouseup", videojs.bind(this,this.onMouseUp));
	}
};

videojs.SeekRSBar.prototype.onMouseUp = function(event) {
	videojs.off(document, "mousemove", this.onMouseMove, false);
	videojs.off(document, "mouseup", this.onMouseUp, false);
};

videojs.SeekRSBar.prototype.onMouseMove = function(event) {
	var left = this.calculateDistance(event);
	
	if (this.rs.left.pressed)
		this.setPosition(0,left);
	else if (this.rs.right.pressed)
		this.setPosition(1,left);
};

videojs.SeekRSBar.prototype.setPosition = function(index,left) {
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
		tpr = this.rs.tpr.el_,
		tpl = this.rs.tpl.el_,
		bar = this.rs.bar;
	
	// Move the handle and bar from the left based on the current distance
	this.handleValue = left;
	
	//Check if left arrow is passing the right arrow
	if ((index === 0 ?bar.updateLeft(left):bar.updateRight(left))){
		Obj.style.left = videojs.round(this.handleValue * 100, 2) + '%';
		index === 0 ?bar.updateLeft(left):bar.updateRight(left);
		
		this.rs[index === 0 ? 'start' : 'end'] = this.rs._seconds(left);
	
		//Fix the problem  when you press the button and the two arrow are underhand
		//left.zIndex = 10 and right.zIndex=20. This is always less in this case:
		if (index === 0 && videojs.round(this.handleValue * 100, 2) >= 90)
				ObjLeft.style.zIndex = 25;
		else
				ObjLeft.style.zIndex = 10;
		
		var MaxP,MinP,MaxDisP;
		MaxP = this.player_.isFullScreen?96:92;
		MinP = this.player_.isFullScreen?0.1:0.5;
		MaxDisP = this.player_.isFullScreen?3.75:7.5;
		if (index===0){
			tpl.style.left = Math.max(MinP,Math.min(MaxP,videojs.round(this.handleValue * 100 - MaxDisP/2, 2))) + '%';
			
			if ((tpr.style.left.replace("%","") - tpl.style.left.replace("%",""))<=MaxDisP)
				tpl.style.left = Math.max(MinP,Math.min(MaxP,tpr.style.left.replace("%","")-MaxDisP)) + '%';
				
			tpl.children[0].innerText = this.rs._formatTime(ObjLeft.style.left.replace("%",""));
		}else{
			tpr.style.left = Math.max(MinP,Math.min(MaxP,videojs.round(this.handleValue * 100 - MaxDisP/2, 2))) + '%';
			
			if (((tpr.style.left.replace("%","")||100) - tpl.style.left.replace("%",""))<=MaxDisP)
				tpr.style.left = Math.max(MinP,Math.min(MaxP,tpl.style.left.replace("%","")-0+MaxDisP)) + '%';
				
			tpr.children[0].innerText = this.rs._formatTime(ObjRight.style.left.replace("%",""));
		}
			
	}
	return true;
};

videojs.SeekRSBar.prototype.calculateDistance = function(event){
	var rstbX = this.getRSTBX();
	var rstbW = this.getRSTBWidth();
	var handleW = this.getWidth();

	// Adjusted X and Width, so handle doesn't go outside the bar
	rstbX = rstbX + (handleW / 2);
	rstbW = rstbW - handleW;

	// Percent that the click is through the adjusted area
	return Math.max(0, Math.min(1, (event.pageX - rstbX) / rstbW));
};

videojs.SeekRSBar.prototype.getRSTBWidth = function() {
	return this.rs.rstb.el_.offsetWidth;
};
videojs.SeekRSBar.prototype.getRSTBX = function() {
	return videojs.findPosition(this.rs.rstb.el_).left;
};
videojs.SeekRSBar.prototype.getWidth = function() {
	return this.rs.left.el_.offsetWidth;//does not matter left or right
};

videojs.SeekRSBar.prototype.getOffsetLeftPercent = function(offsetleft) {
	return offsetleft / this.getRSTBWidth();
};
videojs.SeekRSBar.prototype.getRawValue = function() {
	return this.handleValue;
};
videojs.SeekRSBar.prototype.getValue = function() {
	if(this.handleValue !== null) {
		return videojs.round(this.handleValue * this.player.duration(), 2);
	}
	return null;
};
videojs.SeekRSBar.prototype.setRawValue = function(rawValue) {
	this.handleValue = rawValue;
};
videojs.SeekRSBar.prototype.setBarUpdateHandler = function(fn) {
	this.updateBar = fn;
};



/**
 * This is the bar with the selection of the RangeSlider
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
videojs.SelectionBar = videojs.Component.extend({
  /** @constructor */
	init: function(player, options){
		videojs.Component.call(this, player, options);
		this.on('mouseup', this.onMouseUp);
		this.fired = false;
	}
});

videojs.SelectionBar.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

videojs.SelectionBar.prototype.createEl = function(){
	return videojs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-selectionbar-RS'
	});
};

videojs.SelectionBar.prototype.onMouseUp = function(){
	var start = this.rs.left.el_.style.left.replace("%",""),
		end = this.rs.right.el_.style.left.replace("%",""),
		duration = this.player_.duration(),
		precision = this.rs.updatePrecision,
		segStart = videojs.round(start * duration/100, precision),
		segEnd = videojs.round(end * duration/100, precision);
	this.player_.currentTime(segStart);
	this.player_.play();
	this.rs.bar.activatePlay(segStart,segEnd);
};

videojs.SelectionBar.prototype.updateLeft = function(left) {
	var offsetleft = this.rs.right.el_.offsetLeft;
	var max = this.rs.box.getOffsetLeftPercent(offsetleft);
	var width = this.rs.box.getOffsetLeftPercent(offsetleft) - left;
	var precision = this.rs.updatePrecision;
	if(videojs.round(left, precision) <= videojs.round(max, precision)) {
			this.rs.bar.el_.style.left = videojs.round(left * 100, precision) + '%';
			this.rs.bar.el_.style.width = videojs.round(width * 100, precision) + '%';
			return true;
	}
	return false;
};
		
videojs.SelectionBar.prototype.updateRight = function(left) {
	var offsetleft = this.rs.left.el_.offsetLeft;
	var min = this.rs.box.getOffsetLeftPercent(offsetleft);
	
	var width = left - this.rs.box.getOffsetLeftPercent(offsetleft);
	var precision = this.rs.updatePrecision;
	
	if(videojs.round(left, precision) >= videojs.round(min, precision)) {
		var w = videojs.round(width * 100, precision);
		this.rs.bar.el_.style.width = w + '%';
		this.rs.bar.el_.style.left = videojs.round(left * 100 - w, precision) + '%';
		return true;
	}
	return false;
};
videojs.SelectionBar.prototype.activatePlay = function(start,end){
	this.timeStart = start;
	this.timeEnd = end;
	this.player_.on("timeupdate", function(){
		this.rangeslider.bar._processPlay();
	});
};
videojs.SelectionBar.prototype.suspendPlay = function(){
	this.fired = false;
	this.player_.off("timeupdate", function(){
		this.rangeslider.bar._processPlay();
	});
};
videojs.SelectionBar.prototype._processPlay = function (start,end){
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
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
videojs.SelectionBarLeft = videojs.Component.extend({
  /** @constructor */
	init: function(player, options){
		videojs.Component.call(this, player, options);
		this.on('mousedown', this.onMouseDown);
		this.pressed = false;
	}
});

videojs.SelectionBarLeft.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

videojs.SelectionBarLeft.prototype.createEl = function(){
  return videojs.Component.prototype.createEl.call(this, 'div', {
    className: 'vjs-rangeslider-handle vjs-selectionbar-left-RS',
    innerHTML: '<div class="vjs-selectionbar-arrow-RS"></div><div class="vjs-selectionbar-line-RS"></div>'
  });
};

videojs.SelectionBarLeft.prototype.onMouseDown = function(event) {
	event.preventDefault();
	videojs.blockTextSelection();
	if(!this.rs.options.locked) {
		this.pressed = true;
		videojs.on(document, "mouseup", videojs.bind(this,this.onMouseUp));
		videojs.addClass(this.el_, 'active');
	}
};

videojs.SelectionBarLeft.prototype.onMouseUp = function(event) {
	videojs.off(document, "mouseup", this.onMouseUp, false);
	videojs.removeClass(this.el_, 'active');
	if(!this.rs.options.locked) {
		this.pressed = false;
	}
};



/**
 * This is the right arrow to select the RangeSlider
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
videojs.SelectionBarRight = videojs.Component.extend({
  /** @constructor */
	init: function(player, options){
		videojs.Component.call(this, player, options);
		this.on('mousedown', this.onMouseDown);
		this.pressed = false;
	}
});

videojs.SelectionBarRight.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

videojs.SelectionBarRight.prototype.createEl = function(){
	return videojs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-rangeslider-handle vjs-selectionbar-right-RS',
		innerHTML: '<div class="vjs-selectionbar-arrow-RS"></div><div class="vjs-selectionbar-line-RS"></div>'
	});
};


videojs.SelectionBarRight.prototype.onMouseDown = function(event) {
	event.preventDefault();
	videojs.blockTextSelection();
	if(!this.rs.options.locked) {
		this.pressed = true;
		videojs.on(document, "mouseup", videojs.bind(this,this.onMouseUp));
		videojs.addClass(this.el_, 'active');
	}
};

videojs.SelectionBarRight.prototype.onMouseUp = function(event) {
	videojs.off(document, "mouseup", this.onMouseUp, false);
	videojs.removeClass(this.el_, 'active');
	if(!this.rs.options.locked) {
		this.pressed = false;
	}
};


/**
 * This is the time panel
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
videojs.TimePanel = videojs.Component.extend({
  /** @constructor */
	init: function(player, options){
		videojs.Component.call(this, player, options);
	}
});

videojs.TimePanel.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

videojs.TimePanel.prototype.options_ = {
	children: {
		'TimePanelLeft': {},
		'TimePanelRight': {},
	}
};

videojs.TimePanel.prototype.createEl = function(){
	return videojs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-timepanel-RS'
	});
};


/**
 * This is the left time panel 
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
videojs.TimePanelLeft = videojs.Component.extend({
  /** @constructor */
	init: function(player, options){
		videojs.Component.call(this, player, options);
	}
});

videojs.TimePanelLeft.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

videojs.TimePanelLeft.prototype.createEl = function(){
	return videojs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-timepanel-left-RS',
		innerHTML: '<span class="vjs-time-text">00:00</span>'
	});
};


/**
 * This is the right time panel 
 * @param {videojs.Player|Object} player
 * @param {Object=} options
 * @constructor
 */
videojs.TimePanelRight = videojs.Component.extend({
  /** @constructor */
	init: function(player, options){
		videojs.Component.call(this, player, options);
	}
});

videojs.TimePanelRight.prototype.init_ = function(){
    	this.rs = this.player_.rangeslider;
};

videojs.TimePanelRight.prototype.createEl = function(){
	return videojs.Component.prototype.createEl.call(this, 'div', {
		className: 'vjs-timepanel-right-RS',
		innerHTML: '<span class="vjs-time-text">00:00</span>'
	});
};
})();
