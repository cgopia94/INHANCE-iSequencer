// JQuery plugin for image sequence animation 
// version: 0.0.7
// date: 08/24/2016
// Author: Myeong Kim
// Example:
// $('.img-container').iSequencer({direction: -1});
// callbacks: {f20: function () {...}, f137: function () {...}, ...}

(function($) {
	$.fn.INHANCE_iSequencer = function(options) {
		var settings;

		var doCleanup = function() {
			// console.log($(this).data('info').animId);
			$('img', this).removeAttr('style');
			$(this).off().empty();
			cancelAnimationFrame($(this).data('info').animId);
		};

		var doPlay = function() {
			if ($('>img', this).length <= $(this).data('info').curIdx + 1) {
				$(this).data('info').curIdx = 0;
				$('>img.active', this).css({'-webkit-transform': 'translate3d(0,' + settings.viewHeight + ',0)', '-ms-transform': 'translate3d(0,' + settings.viewHeight + ',0)', 'transform': 'translate3d(0,' + settings.viewHeight + ',0)'}).removeClass();
			}
			doRotate(this, settings.direction * -1, this.children.length - $(this).data('info').curIdx, settings.speed, settings.completed || settings.loop);
		};

		var doPause = function() {
			cancelAnimationFrame($(this).data('info').animId);
		}

		var defaults = {
			viewHeight: this.height() + 'px',
			firstFrame: 0,
			direction: 1,
			speed: 0.5,
			callbacks: null,
			completed: null,
			initialAnimation: true,
			swipe: true,
			loop: false	// initialAnimation loop
		};

		settings = $.extend(defaults, options);

		function doRotate(c, dr, dt, sp, cb) {
			var $rotatePan = $(c);
			var imgSeqLength = $rotatePan.data('info').length;
			var cnt = 0;
		  var stime = null;
		  var speed = 0;
	    var speedOffset = sp;
			var anim = function(ts) {
				var panInfo = $rotatePan.data('info');
				if (!panInfo) return;
				speed += speedOffset;
				panInfo.animId = requestAnimationFrame(anim);
				if(speed >= 1) {
					speed = 0;

					stime = stime || ts;
			    var dtime = ts - stime;

			    if(dtime > 1) {
			      if(dr == 1) {
			        panInfo.curIdx = ((panInfo.curIdx - 1) + imgSeqLength) % imgSeqLength;
			      }
			      else {
			        panInfo.curIdx = (panInfo.curIdx + 1) % imgSeqLength; 
			      }
			      var transStr = 'translate3d(0,' + settings.viewHeight + ',0)';
			      $($('img', $rotatePan)[(panInfo.curIdx + dr + imgSeqLength) % imgSeqLength]).css({'-webkit-transform': transStr, '-ms-transform': transStr, 'transform': transStr}).removeClass();
			      $($('img', $rotatePan)[panInfo.curIdx]).css({'-webkit-transform': 'translate3d(0,0,0)', '-ms-transform': 'translate3d(0,0,0)', 'transform': 'translate3d(0,0,0)'}).addClass('active');

			      var curCallback = settings.callbacks && settings.callbacks['f' + panInfo.curIdx] || null;
			      if(curCallback) {
			      	curCallback();
			      }

			      if(++cnt >= dt - 1) {
			        cancelAnimationFrame(panInfo.animId);
			        if(typeof cb == 'function') {
			          cb();
			        }
			        else if(cb) {	// loop is true
			        	doRotate(c, dr, dt, sp, cb);
			        }
			      }  
			      stime = null;
			    }

				}
		  };
		  anim();
		}

		function attachRotationHandler(c) {
			var $rotatePan = $(c);
	    var previousX;
	    var isMousedown = false;

	    function doDir(dr, dt) {
				var d = dr ? -1 : 1;
				d = d * settings.direction;
      	doRotate(c, d, dt, settings.speed);
			}
	    
	    $rotatePan.off('mousedown touchstart').on('mousedown touchstart', function(event) {
	      event.preventDefault();
	      isMousedown = true;
	      previousX = event.clientX || event.originalEvent.touches[0].clientX;
	    });

	    $rotatePan.off('mouseup touchend').on('mouseup touchend', function(event) {
	      event.preventDefault();
	      isMousedown = false;
	    });

	    $rotatePan.off('mousemove touchmove').on('mousemove touchmove', function(event) {
	      event.preventDefault();
	      var cX = event.clientX || event.originalEvent.touches[0].clientX;
		    
		    if(isMousedown) {
		    	if(Math.abs(previousX - cX) > 1.5) doDir(previousX - cX > 0, Math.abs(previousX - cX) * 0.25);

		    	$(this).on('mouseleave.iSequencer', function (evt) {
		    		evt.stopPropagation();
	        	console.log('out!!');
	        	$(this).off('mouseleave.iSequencer').trigger('mouseup');
	        });
		    }

		    previousX = cX;
	    });
	  }

	  return this.each(function(i, e) {
			$('img', this).removeClass();
			this.cleanup = doCleanup.bind(this);
			this.play = doPlay.bind(this);
			this.pause = doPause.bind(this);
			
			var transStr = 'translate3d(0,' + settings.viewHeight + ',0)';
			$('img:not(:nth-child(' + (settings.firstFrame + 1) + '))', this).css({position: 'absolute', '-webkit-transform': transStr, '-ms-transform': transStr, 'transform': transStr});
			$('img:nth-child(' + (settings.firstFrame + 1) + ')', this).addClass('active').css({position: 'absolute'});
			var imgSeqLength = $('img', this).length;
			$(e).data('info', {length: $('img', this).length, curIdx: settings.firstFrame, animId: 0});
			if(settings.swipe) attachRotationHandler(e, imgSeqLength);
			var cbOrloop = settings.completed ? settings.completed : settings.loop;
			if(settings.initialAnimation) doRotate(e, settings.direction * -1, imgSeqLength, settings.speed, cbOrloop);
		});

	};
}(jQuery));