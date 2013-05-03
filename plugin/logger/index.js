define("plugin/logger/index", [
	"jquery", 
	"w2ui",
	"w2ui/src/w2listview",
	"plugin/logger/tool/info"	
], function($, w2ui, listview, InfoView){
	return {
		
		id : "logger",
		
		title : 'Simple Log', 
		
		initialize : function() {
			var self = this; 			

			this.infoview = InfoView;
			this.infoview.initialize(this);
			
			this.listview = this.getListView();
		
			// create content area			
			this.content = $().w2layout({
				name : 'logger_layout',
				panels : [
					{ 
						type : 'main', 
						size : '100%',
						style : 'border-right: 1px solid #cecece',						 
						toolbar : {
							style : 'border-right: 1px solid #cecece',
							items : [
								{ id : 'logger_clear', text : 'Clear'},
								{ id : 'logger_info', text : 'Info'}
							],
							
							onClick: function(target, data) {
								if (target == 'logger_clear') {
									w2ui['logger_listview'].clear();
								} else if (target == 'logger_info') {
									w2ui['logger_layout'].toggle('right');
								}
							}
						},
						content : this.listview 
					}, 
					{
						type : 'right',
						size : '400px',
						resizable : true,
						hidden : true,
						style : 'border-left: 1px solid #cecece',
						content : this.infoview.content
					}
				]
			})
			
		},
		
		getListView : function() {
			var self = this;
			return $().w2listview({
					name : 'logger_listview',
					style : 'overflow:auto;',
					
					renderHeader : function($table) {
						var $thead = $("<thead />");
						
						var $tr = $("<tr />");
						
						$thead.append($tr)
						
						$tr.append($("<td  class='w2ui-head' />").html($("<div />").html('No.').width(50)));
						$tr.append($("<td  class='w2ui-head' />").html($("<div />").html('P').width(50)));
						$tr.append($("<td  class='w2ui-head' />").html($("<div />").html('Host').width(200)));
						$tr.append($("<td  class='w2ui-head' />").html($("<div />").html('Path').width(400)));
						
						$table.prepend($thead)
					},
					renderItem : function(session) {
						var box = this.box;
						
						if (!box) return;
						
						var $dom = $("<tr class='logger_item' ></tr>");
						
						$dom.css('border-bottom', '1px solid black');
						
						$dom.addClass(this.total % 2 == 0 ? "w2ui-even" : "w2ui-odd");
						
						var $tpl = $("<td class='header'></td><td class='protocol'></td><td class='host'></td><td><div class='log'></div></td>");
						
						$dom.append($tpl);
						
						$dom.find('.header').html($("<div></div>").html(this.total).width(50).css('padding', '2px'));
						$dom.find('.protocol').html($("<div></div>").html(session.$('protocol').replace(":", "")).width(50).css('padding', '2px'));
						$dom.find('.host').html($("<div></div>").html(session.$('host')).width(200).css('padding', '2px'));
						$dom.find('.log').html($("<div></div>").html(session.$('pathname')).width(400).css('padding', '2px').css({
							'text-overflow' : 'ellipsis',
							'white-space' : 'nowrap',
							'overflow' :' hidden'
						}));
						
						$dom.data('session', session);
						
						$dom.on('click', function(e) {
							self.currentSession = $(this).data('session');
							self.infoview.refresh();
							
							if (self.content.get('right').hidden) {
								self.content.toggle('right');
							}
							
							$(box).find("> .w2ui-grid-body > .w2ui-grid-records > table tr.w2ui-selected").removeClass("w2ui-selected");
							$(this).addClass("w2ui-selected");
							
						})

						return $dom;
					},
					onResize : function (target, data) {
						
					}
				})
		},
		
		getContent : function() {
			return this.content;
		},
		
		//////////////////////////////////
		//
		//	Core Event
		//
		//////////////////////////////////
		
		unload : function() {
			
		},
		
		//////////////////////////////////
		//
		//	Open Proxy Event 
		//
		//////////////////////////////////
		beforeRequest : function(session) {
			w2ui['logger_listview'].add(session);
			w2ui['logger_listview'].scroll();
		}
	}
})
