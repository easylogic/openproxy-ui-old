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
						content : this.getListView() 
					}, 
					{
						type : 'right',
						size : '400px',
						resizable : true,
						hidden : true,
						style : 'border-left: 1px solid #cecece',
						content : InfoView.content
					}
				]
			})
			
		},
		
		getListView : function() {
			var self = this;
			return $().w2listview({
					name : 'logger_listview',
					style : 'overflow:auto;',
					renderItem : function(session) {
						var box = this.box;
						var $dom = $("<tr class='logger_item' ></tr>");
						
						$dom.css('border-bottom', '1px solid black');
						
						var $tpl = $("<td class='header'></td><td class='protocol'></td><td class='host'></td><td><div class='log'></div></td>");
						
						$dom.append($tpl);
						
						$dom.find('.header').html(this.total);
						$dom.find('.protocol').html(session.$('protocol').replace(":", ""));
						$dom.find('.host').html(session.$('host'));
						$dom.find('.log').html(session.$('pathname'));
						
						$dom.data('session', session);
						
						$dom.on('click', function(e) {
							self.currentSession = $(this).data('session');
							self.infoview.refresh();
							
							if (self.content.get('right').hidden) {
								self.content.toggle('right');
							}
							
							$(box).find(".active").removeClass("active").css('background-image', '');
							$(this).addClass("active").css('background-image', 'linear-gradient(#69b1e0, #3787cc)');
							
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
