var transformString = Modernizr.prefixed('transform');

var transEndEventNames = {
	'WebkitTransition': 'webkitTransitionEnd',
	'MozTransition': 'transitionend',
	'OTransition': 'oTransitionEnd',
	'msTransition': 'MSTransitionEnd',
	'transition': 'transitionend'
}, transEndEventName = transEndEventNames[Modernizr.prefixed('transition')];

/**
 * @author Dmitry Kharchenko (dmitry@upfrontmedia.asia)
 * @version 0.1
 * @date 2012-11-12
 * @requires jQuery 1.7.2
 * @requires prefixfree.js
 * @requires modernizr.js (http://www.modernizr.com/download/#-csstransforms3d-csstransitions-shiv-cssclasses-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes-load)
 *
 * A jquery plugin for paperfold effect (as seen at https://developer.mozilla.org/en-US/demos/detail/paperfold-css/launch)
 *
 */

(function($) {
	"use strict";

	$.paperfold = $.paperfold || {
		version: '1.0'
	};

	//Default parameters
	$.paperfold.conf = {
		duration: 500,
		foldHeight: 150,
		items: '.pf__item',
		foldable: '.pf__full'
	};

	$.paperfold.isMobileBrowser = (navigator.userAgent.match(/Android/i) ||
			 navigator.userAgent.match(/webOS/i) ||
			 navigator.userAgent.match(/iPhone/i) ||
			 navigator.userAgent.match(/iPod/i) ||
			 navigator.userAgent.match(/iPad/i) ||
			 navigator.userAgent.match(/BlackBerry/)
			 );

	var Paperfold = {
		percentage: 0,

		init: function(element, maxHeight, duration, toggleCallback) {

			this.element = $(element);
			this.maxHeight = maxHeight;
			this.duration = duration;
			this.toggleCallback = toggleCallback;

			// get real element height
			this.height = this.element.css('height', 'auto').outerHeight();
			this.element.css('height', '');

			// calculate amount and height of the folds
			this.foldCount = Math.ceil(this.height / this.maxHeight);
			this.foldHeight = Math.floor(this.height / this.foldCount);

			// detach the elements children from the dom and cache them 
			this.content = this.element.children().detach();

			// add folds containing the previously cached children elements
			// to the element
			for(var i = 0, j = 0; i < this.foldCount; i++, j += 2) {
				var bottomHeight = Math.ceil(this.foldHeight / 2),
				topHeight = bottomHeight;

				if((i + 1) === this.foldCount && this.foldHeight / 2 % 2) bottomHeight = this.height - (j + 1) * topHeight + 2;

				this.element.append(this.createFold(j, topHeight, bottomHeight));
			}

			// cache the folds -> can i do this while creating them?
			// i mean i can of course cache them but then the dom connection is not there
			// i'd love to get a hint: @mrflix or mrflix@gmail.com
			this.folds = this.element.find('> .pf__fold');
			this.bottoms = this.folds.find('> .pf__bottom');
			this.tops = this.folds.find('> .pf__top');

			$('<div>').append(this.content).addClass('pf__original').appendTo(this.element);
			this.original = this.element.find('.pf__original');

			// bind buttons
			
			this.trigger = this.element.prev('.pf__trigger');
			this.trigger.click($.proxy(this, 'toggle'));

			this.element.parent().addClass('pf__item_ready');
		},
		update: function(maxHeight) {
			this.element.children().detach();
			this.element.html(this.content);
			this.init(this.element, maxHeight);
			if(this.percentage !== 0) {
				this.open(this.percentage);
			}
		},
		createFold: function(j, topHeight, bottomHeight) {
			var offsetTop = -j * topHeight;
			var offsetBottom = -this.height + j * topHeight + this.foldHeight;
			return $('<div>').addClass('pf__fold').append(
			$('<div>').addClass('pf__top').css('height', topHeight).append(
			$('<div>').addClass('pf__wrapper').append(
			$('<div>').addClass('pf__inner').css('top', offsetTop).append(this.content.clone()))).add($('<div>').addClass('pf__bottom').css('height', bottomHeight).append(
			$('<div>').addClass('pf__wrapper').append(
			$('<div>').addClass('pf__inner').css('bottom', offsetBottom).append(this.content.clone())))));
		},
		toggle: function() {
			
			var that = this;

			if (!this.locked) {

				this.locked = true;
				$.paperfold.lockTimeout = window.setTimeout(function () {
					that.unlock();
				}, this.duration);

				if(!this.element.parent().hasClass('pf__item_visible')) {
					// open
					// animate folds height (css transition)
					
					that.element.parent().addClass('pf__item_visible');
					this.folds.height(this.foldHeight);

					var folds = this.folds;
					this.original.delay(this.duration).show(0, function () {
						folds.hide();
					});

					this.trigger.removeClass('pf__trigger_collapsed').addClass('pf__trigger_expanded');
				} else {
					// close
					// animate folds height (css transition)
					
					this.original.hide();
					this.folds.show().height(0);
					that.element.parent().removeClass('pf__item_visible');
					this.trigger.removeClass('pf__trigger_expanded').addClass('pf__trigger_collapsed');
				}
				
				this.tops.add(this.bottoms).css('background-color', '').css(transformString, '');
			}
		},
		unlock: function () {
			window.clearTimeout($.paperfold.lockTimeout);
			this.locked = false;
		}
	};

	//Expander object. Example usage: 'read more' in front page sections
	var Expander = function (options) {
		var defaults = {
			expandable : '.pf__item',
			expanded : '.pf__full',
			trigger : '.pf__trigger',
			pseudo : '.pf__trigger-text',
			
			expandedClass : 'pf__trigger_expanded',
			collapsedClass : 'pf__trigger_collapsed'
		};

		this.options = $.extend({}, defaults, options ? options : {});

		this.jExpandable = $(this.options.expandable);
		
		this.expandedClass = this.options.expanded;
		
		this.collapsedTrigger = this.options.collapsedClass;
		this.expandedTrigger = this.options.expandedClass;
		
		this.trigger = this.options.trigger;
		
		this.jTriggers = $(this.trigger, this.jExpandable);
		var _self = this;

		this.jTriggers.live('click', function (e) {
			var jCurrent = $(this),
				expander = true;
			
			// Check current status
			expander = (jCurrent.hasClass(_self.collapsedTrigger));
			var jFull = jCurrent.siblings(_self.expandedClass);
			
			if (!jFull.is(':animated')) {	
				if (expander) { // expand
					jCurrent.removeClass(_self.collapsedTrigger).addClass(_self.expandedTrigger);
					jFull.slideDown(300);
				} else { // collapse
					jCurrent.removeClass(_self.expandedTrigger).addClass(_self.collapsedTrigger);
					jFull.slideUp(300);
				}
			}
			
		});
	};

	$.fn.paperfold = function(conf) {

		//Extend defaults
		conf = $.extend($.paperfold.conf, conf);

		this.each(function(i) {

			var jItems = $(this).find(conf.items),
				jFoldable = $(this).find(conf.foldable),
				paperfolds = [];

			if(Modernizr.csstransforms3d && !$.paperfold.isMobileBrowser) {
				jFoldable.each(function(i, el) {
						$(el).parent().addClass('pf__item_inited');
						paperfolds[i] = Object.create(Paperfold);
						paperfolds[i].init(el, conf.foldHeight, conf.duration);
				});
			} else {
				var oExpander = new Expander();
			}
		});

		return this;
	};

})(jQuery);