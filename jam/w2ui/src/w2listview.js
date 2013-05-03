/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2ui.w2listview 	- form widget
*		- $.w2listview		- jQuery wrapper
*   - Dependencies: jQuery, w2utils, w2fields, w2tabs, w2popup
*
* 	
*
************************************************************************/


(function () {
	var w2listview = function(options) {
		// public properties
		this.name  	  		= null;
		this.box			= null; 	// HTML element that hold this element
		this.style 			= '';
		this.total 			= 0;
		this.renderItem 	= function(obj) {
			return $("<div>" + obj + "</div>");
		};

		this.renderHeader = function($table) {
			//$table.prepend("<colgroup><col width='50px'/><col width='50px' /><col width='150px' /><col width='400px' /></colgroup>")			
		};

		// events
		this.onRender 		= null;
		this.onRefresh		= null;
		this.onResize 		= null;
		this.onDestroy		= null;

		$.extend(true, this, options);
	};
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2listview = function(method) {
		if (typeof method === 'object' || !method ) {
			var obj = this;
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				console.log('ERROR: The parameter "name" is required but not supplied in $().w2listview().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				console.log('ERROR: The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			if (!w2utils.isAlphaNumeric(method.name)) {
				console.log('ERROR: The parameter "name" has to be alpha-numeric (a-z, 0-9, dash and underscore). ');
				return;			
			}
			
			// extend items
			var object = new w2listview(method);
			$.extend(object, { handlers: [] });
			// render if necessary
			if ($(this).length != 0) {
				object.render($(this)[0]);
			}
			
			// register new object
			w2ui[object.name] = object;
			return object;
		
		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			console.log('ERROR: Method ' +  method + ' does not exist on jQuery.w2listview');
		}    
	}		

	// ====================================================
	// -- Implementation of core functionality
	
	w2listview.prototype = {

		add : function(obj) {
			this.total++;
			$(this.box).find("> .w2ui-grid-body > .w2ui-grid-records > table > tbody").append(this.renderItem(obj));			
		},
		clear: function () {
			$(this.box).find("> .w2ui-grid-body > .w2ui-grid-records > table > tbody").empty();
		},
		
		scroll : function() {
			var $el = $(this.box).find(".logger_item:last .log");
			var offset = $el.offset();
			if (offset) {
				$(this.box).find("> .w2ui-grid-body > .w2ui-grid-records").scrollTop(1000000);	
			}

		},


		resize: function () {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'resize' });
			if (eventData.stop === true) return false;
			// default behaviour

			// event after
			obj.trigger($.extend(eventData, { phase: 'after' }));

		},

		refresh: function () {
			var obj = this;
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'refresh', page: this.page })
			if (eventData.stop === true) return false;
			// default action

			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.resize();
		},

		render: function (box) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection			
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'render', box: (typeof box != 'undefined' ? box : this.box) });	
			if (eventData.stop === true) return false;
			// default actions
			
			var old_box = $(this.box);

			if (typeof box != 'undefined' && box != null) {
				this.box = box;
			}			

			if (old_box.find("table").length) {
				$(this.box).html(old_box.html());
				$(this.box)
					.add('w2name', this.name)
					.addClass('w2ui-grid')
					.css('padding', '2px')					
				this.scroll();			
			} else {
				$(this.box)
					.add('w2name', this.name)
					.addClass('w2ui-grid')
					.css('padding', '2px')
					.html('<div class="w2ui-grid-body"><div class="w2ui-grid-records"><table cellpadding="0" cellspacing="0"><tbody></tbody></table></div></div>');
					
				var $table = $(this.box).find("> .w2ui-grid-body > .w2ui-grid-records > table");
				
				this.renderHeader($table);
					
				$(this.box).find("> .w2ui-grid-body").css({
					left : '0px',
					top : '0px',
					right : '0px',
					bottom : '0px'
				})
					
				$(this.box).find("> .w2ui-grid-body > .w2ui-grid-records").css({
					overflow: 'auto'
				})
			}

				
			if ($(this.box).length > 0) $(this.box)[0].style.cssText += this.style;			


			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));

		},

		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', target: this.name, type: 'destroy' });	
			if (eventData.stop === true) return false;
			
			delete w2ui[this.name];
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
	}
	
	$.extend(w2listview.prototype, $.w2event);
	w2obj.listview = w2listview;
})();
