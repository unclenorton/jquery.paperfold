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
 * @version 0.5
 * @date 2012-11-12
 * @requires jQuery 1.7.2
 * @requires prefixfree.js
 * @requires modernizr.js (http://www.modernizr.com/download/#-csstransforms3d-csstransitions-shiv-cssclasses-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes-load)
 *
 * A jquery plugin for paperfold effect (as seen at https://developer.mozilla.org/en-US/demos/detail/paperfold-css/launch)
 *
 * Usage: 
 * 
 * $('.pf').paperfold(options);
 * 
 * For HTML structure, please refer to readme.md
 *
 * Options:
 *
 * duration - Transition duration in milliseconds. Only relates to JS transition. Default is `500`.
 * foldHeight - One fold element height, in pixels. Default is `150`.
 * items - CSS selector for the folding element. Default is `.pf__item`.
 * foldable - Selector for the inner element containing the full text. Default is `.pf__full`.
 * trigger - Selector for the trigger element. Default is `.pf__trigger`.
 * CSSAnimation - Uses CSS animation if true, JS otherwise. Default is `true`.
 * useOriginal - Determines whether to overlay the original content of the element on top of the folds
 * when the folding animation is complete. If set to false, the selection will be broken by fold elements. Default is `true`.
 *
 * TODO: update the folds height on page/font resize.
 * 
 */

(function($) {
	"use strict";

	$.paperfold = $.paperfold || {
		version: '0.5'
	};

	//Default parameters
	$.paperfold.conf = {
		duration: 500,
		foldHeight: 150,
		items: '.pf__item',
		foldable: '.pf__full',
		trigger: '.pf__trigger',
		CSSAnimation : true,
		useOriginal : true,

		// Classes
		
		initedClass: 'pf__item_inited',
		foldClass: 'pf__fold',
		foldBClass: 'pf__bottom',
		foldTClass: 'pf__top',
		originalClass: 'pf__original',
		readyClass: 'pf__item_ready',
		visibleClass: 'pf__item_visible',
		wrapperClass: 'pf__wrapper',
		innerClass: 'pf__inner',

		triggerExpandedClass: 'pf__trigger_expanded',
		triggerCollapsedClass: 'pf__trigger_collapsed'
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
		locked: false,

		/**
		 * Breaks the target element into a number of folds and sets some internal variables.
		 * @param  {jQuery collection} element        Target element.
		 * @param  {int} maxHeight      Maximum height of the fold.
		 * @param  {int} duration       Transition duration, in milliseconds.
		 * @param  {function} toggleCallback Callback function.
		 */
		init: function(element, maxHeight, duration, toggleCallback) {

			// Assign the parameters to object properties.
			this.element = $(element);
			this.maxHeight = maxHeight;
			this.duration = duration;
			this.toggleCallback = toggleCallback;

			/**
			 * Courtesy of mrflix@gmail.com
			 */
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
			this.folds = this.element.find('> .' + $.paperfold.workingConf.foldClass);
			this.bottoms = this.folds.find('> .' + $.paperfold.workingConf.foldBClass);
			this.tops = this.folds.find('> .' + $.paperfold.workingConf.foldTClass);

			// Append the original text block to fix selection issues
			$('<div>').append(this.content).addClass($.paperfold.workingConf.originalClass).appendTo(this.element);
			this.original = this.element.find('.' + $.paperfold.workingConf.originalClass);

			/**
			 * mrflix's code ends here
			 */
			
			// Bind buttons
			this.trigger = this.element.prev($.paperfold.workingConf.trigger);

			if ($.paperfold.workingConf.CSSAnimation) {
				this.trigger.click($.proxy(this, 'toggle'));
			} else {
				this.trigger.click($.proxy(this, 'toggleJS'));
			}
			
			this.element.parent().addClass($.paperfold.workingConf.readyClass);
		},

		/**
		 * Create the HTML for the fold element.
		 * TODO: replace by innerhtml (?)
		 * @param  {int} j            Element order
		 * @param  {int} topHeight    Top subelement height
		 * @param  {int} bottomHeight Bottom subelement height
		 * @return {jQuery collection}              jQuery collection containing the complete fold element
		 */
		createFold: function(j, topHeight, bottomHeight) {
			var offsetTop = -j * topHeight;
			var offsetBottom = -this.height + j * topHeight + this.foldHeight;

			return $('<div>').addClass($.paperfold.workingConf.foldClass).append(
				$('<div>').addClass($.paperfold.workingConf.foldTClass).css('height', topHeight).append(
					$('<div>').addClass($.paperfold.workingConf.wrapperClass).append(
						$('<div>').addClass($.paperfold.workingConf.innerClass)
						.css('top', offsetTop)
						.append(this.content.clone())))
						.add($('<div>').addClass($.paperfold.workingConf.foldBClass).css('height', bottomHeight).append(
							$('<div>').addClass($.paperfold.workingConf.wrapperClass).append(
								$('<div>').addClass($.paperfold.workingConf.innerClass)
								.css('bottom', offsetBottom).append(this.content.clone()))))
			);
		},

		/**
		 * Set the angles and height according to the specified percentage
		 * @param  {float} percentage 
		 */
		open: function(percentage){
			// cache percentage
			this.percentage = percentage;
		  
			// change angle of tops and bottoms
			var c = this.foldHeight * percentage
			,   a = this.foldHeight/2
			,	b = a
			,   part = 2*b*c
			,   bottomAngle = part <= 0 ? 90 : Math.acos( (b*b+c*c-a*a) / part )*180/Math.PI
			,   topAngle = 360-bottomAngle;
		  
			this.tops.css(transformString, 'rotateX(' + topAngle + 'deg)');
			this.bottoms.css(transformString, 'rotateX(' + bottomAngle + 'deg)');
		  
			// change folds height
			var foldHeight = Math.floor(this.height/this.foldCount * percentage);
			this.folds.height(foldHeight);
		  
			// change the background color
			// from dark hsl(192,6,33) at 0
			// to light hsl(192,0,100) at 100
			var saturation = Math.round(6 - 6 * percentage)
			,   lightness = 33 + Math.round(67 * percentage)
			,   backgroundColor = 'hsl(192,'+saturation+'%,'+lightness+'%)';
		  
			this.tops.add(this.bottoms).css('background-color', backgroundColor);
		},

		/**
		 * CSS-based animation toggle
		 */
		toggle: function() {
			
			var that = this;

			if (!this.locked) {

				// Check for and set lock if necessary
				this.locked = true;
				$.paperfold.lockTimeout = window.setTimeout(function () {
					that.unlock();
				}, this.duration);

				// It is essential to set the 'visible' class before setting the folds height
				// And remove it only after it has been set back to 0
				if(!this.element.parent().hasClass($.paperfold.workingConf.visibleClass)) {
					// Open
					// Animate folds height (css transition)
					that.element.parent().addClass($.paperfold.workingConf.visibleClass);
					this.folds.height(this.foldHeight);

					var folds = this.folds;
					if($.paperfold.workingConf.useOriginal) {
						this.original.delay(this.duration).fadeIn(500, function () {
							// folds.hide();
						});
					}

					this.trigger.removeClass($.paperfold.workingConf.triggerCollapsedClass)
								.addClass($.paperfold.workingConf.triggerExpandedClass);
				} else {
					// close
					// animate folds height (css transition)
					this.original.hide();
					this.folds.show().height(0);
					that.element.parent().removeClass($.paperfold.workingConf.visibleClass);
					this.trigger.removeClass($.paperfold.workingConf.triggerExpandedClass)
								.addClass($.paperfold.workingConf.triggerCollapsedClass);
				}
				
				this.tops.add(this.bottoms).css('background-color', '').css(transformString, '');
			}
		},

		/**
		 * JS-based animation toggle
		 */
		toggleJS : function () {
			var that = this;
			if (!$(this).is(':animated')) {
				if(!this.element.parent().hasClass($.paperfold.workingConf.visibleClass)) {
					// Open
					// Animate folds height
					that.element.parent().addClass('pf_no-transition ' + $.paperfold.workingConf.visibleClass);
					$(that).animate({
							percentage : 100
						}, {
							duration : $.paperfold.workingConf.duration,
							// Update the rotation along with the height
							step : function (value) {
								that.open(value / 100);

								// On 95% completion, start showing the overlay with the full text
								if (value > 95 && !that.original.is(':animated')) {
									that.original.fadeIn(Math.floor(that.duration / 3.3));
								}
							},
							complete : function () {
								that.trigger.removeClass($.paperfold.workingConf.triggerCollapsedClass)
								.addClass($.paperfold.workingConf.triggerExpandedClass);
							}
						}
					);
				} else {
					// Close
					// Animate folds height
					this.original.hide();
					$(that).animate({
							percentage : 0
						}, {
							duration : $.paperfold.workingConf.duration,
							step : function (value) {
								that.open(value / 100);
							},
							complete : function () {
								that.element.parent().removeClass($.paperfold.workingConf.visibleClass);
								that.trigger.removeClass($.paperfold.workingConf.triggerExpandedClass)
											.addClass($.paperfold.workingConf.triggerCollapsedClass);
							}
						}
					);
					
				}
			
				this.tops.add(this.bottoms).css('background-color', '').css(transformString, '');
			}
		},

		/**
		 * An artificial lock function required to detect whether the CSS animation is still running
		 */
		unlock: function () {
			window.clearTimeout($.paperfold.lockTimeout);
			this.locked = false;
		}
	};

	/**
	 * Slide up/down fallback for older browsers
	 * @param {Object} options - Object containing the selector classes
	 */
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
			
			if (!jFull.is(':animated')) { // Prevent jitter
				if (expander) { // expand
					jCurrent.removeClass(_self.collapsedTrigger).addClass(_self.expandedTrigger);
					jFull.slideDown($.paperfold.workingConf.duration);
				} else { // collapse
					jCurrent.removeClass(_self.expandedTrigger).addClass(_self.collapsedTrigger);
					jFull.slideUp($.paperfold.workingConf.duration);
				}
			}
			
		});
	};

	$.fn.paperfold = function(conf) {

		//Extend defaults
		conf = $.extend($.paperfold.conf, conf);
		$.paperfold.workingConf = conf;

		this.each(function(i) {

			var jItems = $(this).find(conf.items),
				jFoldable = $(this).find(conf.foldable),
				paperfolds = [];

			// Check for feature support
			// Do not show on mobile devices regardless of support
			if(Modernizr.csstransforms3d && !$.paperfold.isMobileBrowser) {
				jFoldable.each(function(i, el) {
						$(el).parent().addClass($.paperfold.workingConf.initedClass);
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