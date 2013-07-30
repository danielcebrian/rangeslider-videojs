Rangeslider-videojs
==================
##Ranger Slider Plugin for Video JS Player

rangeslider.js is a plugin for Video JS player. The aim of this plugin is to create range slider to select a region of a video in video-js.

##Live-Demo

There is a demo of the range slider plugin in the next webpage:

http://danielcebrian.com/rangeslider/demo.html

##Installation

Add rangeslider.min.js and rangeslider.min.css CDN distributed file to your head tag, just after
videojs:

```html
<html>
	<head>
		<!--Latest VideoJS-->
		<link href="http://vjs.zencdn.net/4.1/video-js.css" rel="stylesheet">
		<script src="lib/video.min.js"></script>
		<!--RangeSlider Pluging-->
		<script src="src/rangeslider.js"></script>
		<link href="src/rangeslider.css" rel="stylesheet">
	</head>
	<body>
		...
```

##Usage

Load a video in video-js, as you can see in the [tutorial of video-js player](https://github.com/videojs/video.js/blob/master/docs/setup.md) 

```html
<video id="vid1" class="video-js vjs-default-skin" controls preload="none" width="640" height="264"
poster="http://video-js.zencoder.com/oceans-clip.png"
data-setup=''>
	<source src="http://video-js.zencoder.com/oceans-clip.mp4" type='video/mp4' />
	<source src="http://video-js.zencoder.com/oceans-clip.webm" type='video/webm' />
	<source src="http://video-js.zencoder.com/oceans-clip.ogv" type='video/ogg' />
</video>
```
	
In addition, to load and control the plugin from Javascript must add a few lines of javascript like:

```js
var mplayer=videojs("vid1", {plugins: {rangeslider: {}}}); //To load the video player with the plugin

function playBetween(){
	var start,end;
	start = document.getElementById('Start').value;
	end = document.getElementById('End').value;
	mplayer.playBetween(start,end); //Function to play a region of the video
}
function getValues(){
	var values = {};
	values = mplayer.getValues(); //Function to get the value of the selected region of the video
	document.getElementById('Start').value=values.start;
	document.getElementById('End').value=values.end;
}
```
	
#API Methods

Once the plugin is started, we can control the range slider with the following functions:

### showSlider() ###

Show the Slider Bar Component

```js
	mplayer.showSlider();
```

### hideSlider() ###

Hide the Slider Bar Component

```js
	mplayer.hideSlider();
```

### lockSlider() ###

Lock the Slider bar and it will not be possible to change the arrow positions

```js
	mplayer.lockSlider();
```

### unlockSlider() ###

Unlock the Slider bar and it will be possible to change the arrow positions

```js
	mplayer.unlockSlider();
```

### setValue() ###

Set a Value in second for the arrows. It is necessary to enter for the left arrow the `index = 0` or the right arrow the `index = 1` and the seconds.

```js
	mplayer.setValue(index,seconds);
```

### playBetween() ###

The video will be played in a selected section. It is necessary to enter the start and end second.

```js
	mplayer.playBetween(start, end);
```

### getValues() ###

Get the Values of the arrows in second.

```js
	mplayer.getValues(start, end);
```



