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



# Compatibility
Works on any browser supporting `csstransforms3d`. Other get simplified sliding animation instead.


# License

This plugin is released under MIT license and distributed *'as is'*, without any warranty, explicit or implied.