// JQuery plugin for image sequence animation 
// version: 0.0.5
// date: 08/22/2016
// Author: Myeong Kim
// Example:
// $('.img-container').iSequencer({direction: -1});

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
			doRotate(this, settings.direction * -1, this.children.length - $(this).data('info').curIdx, settings.speed, settings.callback || settings.loop);
		};

		var doPause = function() {
			cancelAnimationFrame($(this).data('info').animId);
		}

		var defaults = {
			viewHeight: this.height() + 'px',
			direction: 1,
			speed: 0.5,
			callback: null,
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
				if (!$rotatePan.data('info')) return;
				speed += speedOffset;
				$rotatePan.data('info').animId = requestAnimationFrame(anim);
				if(speed >= 1) {
					speed = 0;

					stime = stime || ts;
			    var dtime = ts - stime;

			    if(dtime > 1) {
			      if(dr == 1) {
			        $rotatePan.data('info').curIdx = (($rotatePan.data('info').curIdx - 1) + imgSeqLength) % imgSeqLength;
			      }
			      else {
			        $rotatePan.data('info').curIdx = ($rotatePan.data('info').curIdx + 1) % imgSeqLength; 
			      }
			      var transStr = 'translate3d(0,' + settings.viewHeight + ',0)';
			      $($('img', $rotatePan)[($rotatePan.data('info').curIdx + dr + imgSeqLength) % imgSeqLength]).css({'-webkit-transform': transStr, '-ms-transform': transStr, 'transform': transStr});
			      $($('img', $rotatePan)[$rotatePan.data('info').curIdx]).css({'-webkit-transform': 'translate3d(0,0,0)', '-ms-transform': 'translate3d(0,0,0)', 'transform': 'translate3d(0,0,0)'});

			      if(++cnt >= dt) {
			        cancelAnimationFrame($rotatePan.data('info').animId);
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

	    function doDir(dr) {
				var d = dr ? -1 : 1;
				d = d * settings.direction;
      	doRotate(c, d, 1, settings.speed);
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
		    	doDir(previousX - cX > 0);
		    }
		    
	      previousX = cX;
	    });
	  }
		
		return this.each(function(i, e) {
			this.cleanup = doCleanup.bind(this);
			this.play = doPlay.bind(this);
			this.pause = doPause.bind(this);
			$('img', this).css({position: 'absolute'});
			var transStr = 'translate3d(0,' + settings.viewHeight + ',0)';
			$('img:not(:first-child)', this).css({'-webkit-transform': transStr, '-ms-transform': transStr, 'transform': transStr});
			var imgSeqLength = $('img', this).length;
			$(e).data('info', {length: $('img', this).length, curIdx: 0, animId: 0});
			if(settings.swipe) attachRotationHandler(e, imgSeqLength);
			var cbOrloop = settings.callback ? settings.callback : settings.loop;
			if(settings.initialAnimation) doRotate(e, settings.direction * -1, imgSeqLength, settings.speed, cbOrloop);
		});

	};
}(jQuery));