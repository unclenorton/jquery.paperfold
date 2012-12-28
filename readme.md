# jQuery Paperfold
A jQuery wrapper for the paperfold effect featured on MDN demo page: https://developer.mozilla.org/en-US/demos/detail/paperfold-css/launch

Allows proper selection and copying/pasting.

Uses slideDown fallback for browsers that don't support csstransforms3d.

# Version 
0.5

# Usage

To initialize the plugin, following code can be used:
	$('.pf').paperfold(options);

Additionally, your HTML has to follow the structure (this may be changed in the upcoming versions):

	<div class="pf">
		<div class="pf__item pf__item_collapsed">
			<div class="pf__short">
				<div class="pf__reducer">
					<!-- Short content -->
				</div>
			</div>

			<div class="pf__trigger pf__trigger_collapsed">
				<span class="pf__trigger-text pf__trigger-text_collapsed">Expand &rarr;</span>
				<span class="pf__trigger-text pf__trigger-text_expanded">&larr; Collapse</span>
			</div>

			<div class="pf__full">
				<div class="pf__reducer">
					<!-- Long/expandable content -->
				</div>
			</div>
		</div>
	</div>

# Demo

View the demo here: [http://unclenorton.github.com/jquery.paperfold/](http://unclenorton.github.com/jquery.paperfold/).

# Options

**duration:** Transition duration in milliseconds. Only relates to JS transition. Default is `500`.

**foldHeight:** One fold element height, in pixels. Default is `150`.

**items:** CSS selector for the folding element. Default is `.pf__item`.

**foldable:** Selector for the inner element containing the full text. Default is `.pf__full`.

**trigger:** Selector for the trigger element. Default is `.pf__trigger`.

**CSSAnimation:** Uses CSS animation if true, JS otherwise. Default is `true`.

**useOriginal:** Determines whether to overlay the original content of the element on top of the folds when the folding animation is complete. If set to false, the selection will be broken by fold elements. Default is `true`.

# Compatibility
Works on any browser supporting `csstransforms3d`. Other get simplified sliding animation instead.


# License

This plugin is released under MIT license and distributed *'as is'*, without any warranty, explicit or implied.