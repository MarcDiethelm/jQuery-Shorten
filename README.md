# jQuery Shorten

### [Demo](http://web5.me/jquery/plugins/shorten/shorten.doc.html)

This jQuery plugin automatically shortens single-line text to fit in a block or pre-set width while you can configure how the text ends. The default is an ellipsis  ("…", &amp;hellip;, Unicode: 2026) but you can use anything you want, including markup.

This is achieved using either of two methods: First the the text width of the 'selected' element (eg. span or div) is measured using Canvas or by placing it inside a temporary table cell. If it's too big to big to fit in the element's parent block it is shortened and measured again until it (and the appended ellipsis or text) fits inside the block. A tooltip on the 'selected' element displays the full original text.

If the browser supports truncating text with CSS `text-overflow: ellipsis` then that is used (but only if the text to append is the default ellipsis). [W3C Spec](http://www.w3.org/TR/2003/CR-css3-text-20030514/#text-overflow-props)

If the text is truncated by the plugin any markup in the text will be stripped (eg: "<a" starts stripping, "< a" does not). This behaviour is dictated by the jQuery .text(val) method. The appended text may contain HTML however (a link or span for example).

**Note:** This is not a polyfill for text-overflow: ellipsis. But the plugin uses it if possible.


## Usage Example

('selecting' a div with an id of "element"):

```HTML
<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"></script>
<script type="text/javascript" src="jquery.shorten.js"></script>
<script type="text/javascript">
	$(function() {
		$("#element").shorten();
	});
</script>
```

By default the plugin will use the parent block's width as the maximum width and an ellipsis as appended text when the text is truncated.

### Configuration

There are three ways of configuring the plugin:

1) Passing a configuration hash as the plugin's argument, eg:

```JavaScript
.shorten({
	width: 300,
	tail: ' <a href="#">more</a>',
	tooltip: false
});
```

2) Using two optional arguments (deprecated!):
width = the desired pixel width, integer
tail = text/html to append when truncating

3) By changing the plugin defaults, eg:

```JavaScript
$.fn.shorten.defaults.tail = ' <a href="#">more</a>';
```

## Notes

- There is no default width (unless you set one).

- You may want to set the element's CSS to `{visibility: hidden;}` so it won't initially flash at full width in slow browsers.

```HTML
.shortenText {
	overflow: hidden; /* Recommended: if not hiding the text before it's shortened. */
	visibility: hidden; /* Optional: hide the element before shortening its content. */
}
```

- The [CSS3 spec](http://www.w3.org/TR/2003/CR-css3-text-20030514/#text-overflow-props) requires the element to be a block for text-overflow.
And Chrome additionally requires `white-space: nowrap` and `overflow: hidden`.
Shorten sets all selected elements to `display:block` and `white-space: nowrap`.
When using text-overflow it's also setting the element to `overflow: hidden`.

- jQuery < 1.4.4: Shorten doesn't work for elements who's parents have display:none, because .width() is broken. (Returns negative values)  
[jQuery bug](http://bugs.jquery.com/ticket/7225)

	Workarounds:

	- Use jQuery 1.4.4+
	- Supply a target width in options.
	- Use better timing: Don't use display:none when shortening (maybe you can use visibility:hidden). Or shorten after changing display.

- Text in floated elements gets its target width from the element itself, not from the parent container. 

- Only supports ltr text for now.

---

Tested with jQuery 1.3+

Based on a creation by M. David Green (www.mdavidgreen.com) in 2009.  
Heavily modified/simplified/improved by [Marc Diethelm](https://github.com/MarcDiethelm).