{ // a dummy block, so I can collapse all the meta stuff in the editor

/*
 * Shorten, a jQuery plugin to automatically shorten text to fit in a block or a pre-set width and configure how the text ends.
 * Copyright (C) 2009-2010  Marc Diethelm
 * License: (GPL 3, http://www.gnu.org/licenses/gpl-3.0.txt) see license.txt
 */


/****************************************************************************
This jQuery plugin automatically shortens text to fit in a block or pre-set width while you can configure how the text ends. The default is an ellipsis  ("…", &hellip;, Unicode: 2026) but you can use anything you want, including markup.

This is achieved using either of two methods: First the the text width of the 'selected' element (eg. span or div) is measured using Canvas or by placing it inside a temporary table cell. If it's too big to big to fit in the element's parent block it is shortened and measured again until it (and the appended ellipsis or text) fits inside the block. A tooltip on the 'selected' element displays the full original text.

If the browser supports truncating text with CSS ('text-overflow:ellipsis') then that is used (but only if the text to append is the default ellipsis).

If the text is truncated by the plugin any markup in the text will be stripped (eg: "<a" starts stripping, "< a" does not). This behaviour is dictated by the jQuery .text(val) method. The appended text may contain HTML however (a link or span for example).


Usage Example ('selecting' a div with an id of "element"):

<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
<script type="text/javascript" src="jquery.shorten.js"></script>
<script type="text/javascript">
    $(function() {
        $("#element").shorten();
    });
</script>


By default the plugin will use the parent block's width as the maximum width and an ellipsis as appended text when the text is truncated.

There are three ways of configuring the plugin:

1) Passing a configuration hash as the plugin's argument, eg:

.shorten({
    width: 300,
    tail: ' <a href="#">more</a>',
    tooltip: false
});

2) Using two optional arguments (deprecated!):
width = the desired pixel width, integer
tail = text/html to append when truncating

3) By changing the plugin defaults, eg:


$.fn.shorten.defaults.tail = ' <a href="#">more</a>';


Notes:

There is no default width (unless you create one).

You may want to set the element's CSS to {visibility:hidden;} so it won't
initially flash at full width in slow browsers.

Only supports ltr text for now.

Tested with jQuery 1.3+


Based on a creation by M. David Green (www.mdavidgreen.com) in 2009.

Heavily modified/simplified/improved by Marc Diethelm (http://web5.me/).

****************************************************************************/
}


(function ($) {

	//var $c = console;

	$.fn.shorten = function() {

		var userOptions = {},
			args = arguments, // for better minification
			func = args.callee // dito; and shorter than $.fn.shorten

		if ( args.length ) {

			if ( args[0].constructor == Object ) {
				userOptions = args[0];
			} else if ( args[0] == "options" ) {
				return $(this).eq(0).data("options-truncate");
			} else {
				userOptions = {
					width: parseInt(args[0]),
					tail: args[1]
				}
			}
		}

		this.css("visibility","hidden"); // Hide the element(s) while manipulating them

		// apply options vs. defaults
		var options = $.extend({}, func.defaults, userOptions);


		/**
		 * HERE WE GO!
		 **/
		return this.each(function () {

			var $this = $(this);
			$this.data("options-truncate", options),
			text = $this.text();


			var targetWidth = options.width || $this.parent().width(),

				numChars = text.length,
				measureContext, // canvas context or table cell
				measureText, // function that measures text width
				tailText = $("<span/>").html(options.tail).text(), // convert html to text
				tailWidth;


			// decide on a method for measuring text width
			if ( func._supportsCanvas ) {
				//$c.log("canvas");
				measureContext = func.measureText_initCanvas.call( this );
				measureText = func.measureText_canvas;

			} else {
				//$c.log("table")
				measureContext = func.measureText_initTable.call( this );
				measureText = func.measureText_table;
			}

			var origLength = measureText.call( this, text, measureContext );

			if ( origLength < targetWidth ) {
				$this.text( text );
				this.style.visibility = "visible";
				return true;
			}

			if ( options.tooltip ) {
				this.setAttribute("title", text);
			}

			/**
			 * If browser implements text-overflow:ellipsis in CSS and tail is &hellip;/Unicode 8230/(…), use it!
			 * In this case we're doing the measurement above to determine if we need the tooltip.
			 **/
			if ( func._native ) {

				var rendered_tail = $("<span>"+options.tail+"</span>").text(); // render tail to find out if it's the ellipsis character.

				if ( rendered_tail.length == 1 && rendered_tail.charCodeAt(0) == 8230 ) {

					$this.text( text );

					this.style[func._native] = "ellipsis";
					this.style.visibility = "visible";

					return true;
				}
			}

			tailWidth = measureText.call( this, tailText, measureContext ); // convert html to text and measure it
			targetWidth = targetWidth - tailWidth;

				//$c.log(text +" + "+ tailText);

			/**
			 * Before we start removing character one by one, let's try to be more intelligent about this:
			 * If the original string is longer than targetWidth by at least xy percent, then shorten it by yz percent (and re-measure for safety),
			 * if we're still too long use it, else skip this step. This saves a lot of time for long strings.
			 */
			var safeGuess = targetWidth * 1.15; // add 15% to targetWidth for safety before making the cut.

			if ( origLength - safeGuess > 0 ) { // if it's safe to cut, do it.

				var cut_ratio = safeGuess / origLength,
					num_guessText_chars = Math.ceil( numChars * cut_ratio ),
					// looking good: shorten and measure
					guessText = text.substring(0, num_guessText_chars),
					guessTextLength = measureText.call( this, guessText, measureContext );

					//$c.info("safe guess: remove " + (numChars - num_guessText_chars) +" chars");

				if ( guessTextLength > targetWidth ) { // make sure it's not too short!
					text = guessText;
					numChars = text.length;
				}
			}

				//var count = 0;
			// this simply removes characters one by one until the text is shorter than targetWidth
			do {
				numChars--;
				text = text.substring(0, numChars);
					//count++;

			} while ( measureText.call( this, text, measureContext ) >= targetWidth );

			$this.html( $.trim( $("<span/>").text(text).html() ) + options.tail );
			this.style.visibility = "visible";
				//$c.info(count + " normal truncating cycles...")
				//$c.log("----------------------------------------------------------------------");
			return true;
		});

		return true;

	};



	var css = document.documentElement.style;
	var _native = false;

	if ( "textOverflow" in css ) {
		_native = "textOverflow";
	} else if ( "OTextOverflow" in css ) {
		_native = "OTextOverflow";
	} else {
		// test for canvas support
		var canvas = document.createElement("canvas"),
			ctx = canvas.getContext("2d");

		$.fn.shorten._supportsCanvas =  (ctx && (typeof ctx.measureText != 'undefined') ? true : false);
		delete canvas;
	}

	$.fn.shorten._native = _native;



	$.fn.shorten.measureText_initCanvas = function initCanvas()
	{
		var $this = $(this);
		var canvas = document.createElement("canvas");
			//scanvas.setAttribute("width", 500); canvas.setAttribute("height", 40);
		ctx = canvas.getContext("2d");
		$this.html( canvas );

		/* the rounding is experimental. it fixes a problem with a font size specified as 0.7em which resulted in a computed size of 11.2px.
		  without rounding the measured font was too small. even with rounding the result differs slightly from the table method's results. */
		ctx.font = Math.ceil(parseFloat($this.css("font-size"))) +"px "+ $this.css("font-family") +" "+ $this.css("font-weight") +" "+ $this.css("font-style");

		return ctx;
	}

	// measurement using canvas
	$.fn.shorten.measureText_canvas = function measureText_canvas( text, ctx )
	{
			//ctx.fillStyle = "red"; ctx.fillRect (0, 0, 500, 40);
			//ctx.fillStyle = "black"; ctx.fillText(text, 0, 20);

		return ctx.measureText(text).width; // crucial, fast but called too often
	};

	$.fn.shorten.measureText_initTable = function() {
		var css = "padding:0; margin:0; border:none; font:inherit;";
		var $table = $('<table style="'+ css +'width:auto;zoom:1;position:absolute;"><tr style="'+ css +'"><td style="'+ css +'white-space:nowrap;"></td></tr></table>');
		$td = $("td", $table);

		$(this).html( $table );

		return $td;
	};

	// measurement using table
	$.fn.shorten.measureText_table = function measureText_table( text, $td )
	{
		$td.text( text );

		return $td.width(); // crucial but expensive
	};


	$.fn.shorten.defaults = {
		tail: "&hellip;",
		tooltip: true
	};

})(jQuery);
