define("plugin/router/index", [
	"jquery", 
	"w2ui", 
	"plugin/router/tool/sidebar",
	"plugin/router/tool/grid"
], function($, w2ui, Sidebar, Grid){
	return {
		
		id : "router",
		
		title : 'Router', 
		
		config_path : "./plugin/router/config/",
		
		data : {},
		
		start : function(isStart) {
			this.data.isStart = isStart;
			
			// TODO: save localStorage 
			this.update({ isStart : this.data.isStart });
		},
		
		update : function(obj) {
			this.data = $.extend(this.data, obj);
			//this.save();
		},
		
		get : function(key) {
			return this.data[key];
		},
		
		save : function() {
			window.localStorage.router = JSON.stringify(this.data);
		},
		
		load : function() {
			this.data =JSON.parse(window.localStorage.router || "{}");
		},

		
		initialize : function() {
			var self = this; 			

			this.initTable();

			// localStorage data load 
			this.load();
			
			this.sidebar = Sidebar;
			this.sidebar.initialize(this);
			
			this.grid = Grid;
			this.grid.initialize(this);
			
			// create content area			
			this.content = $().w2layout({
				name : this.id,
				panels : [
					{ 
						type : 'main', 
						toolbar : {
							onClick: function(id, data) {
								if (id == 'router-start') {
									if (!this.get(id).checked) {
										self.start(true);
									} else {
										self.start(false);									
									}
								}
									
							},
							items : [ { type: 'check',  id: 'router-start',  caption: 'Start', img: 'icon-page', hint: 'Hint for item 1', checked : this.data.isStart } ]						
						},
									
					  	content : $().w2layout({
					  		name : 'router_sub_layout',
					  		panels : [
					  			{ type : 'left', content : this.sidebar.content, resizable : true, size : 250, style : 'border-right: 1px solid #c0c0c0;' },
					  			{ type : 'main', content : this.grid.content }
					  		]
					  	})
					}
				]
			})
			
			this.sidebar.loadSelectedData()
			
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
			
			this.sidebar.unload();
			
			// when window close, 
			this.save(); 
		},
		
		//////////////////////////////////
		//
		//	Open Proxy Event 
		//
		//////////////////////////////////
		
		initTable : function() {
			this.domains = {};
			this.patterns = [];
		},

		setTable : function(table) {
			if (table.length) {
				for(var i = 0, len = table.length; i < len; i++) {
					var obj = table[i];
					
					if (obj.type == 'domain') {
						this.domains[obj.source] = obj;
					} else if (obj.type == 'pattern') {
						this.patterns.push(obj);
					}
				}
				
				// sort pattern 
				if (this.patterns) {
					this.patterns.sort(function(a, b){
						return a < b;
					})					
				}

			}
		},
		
		runRouting : function(session) {
			if (session.hasResponse) return;
						
			// check pattern 
			if (this.patterns && this.patterns.length) {
				var self_url = session.url();
				for(var i = 0, len = this.patterns.length; i < len; i++) {
					var pattern = this.patterns[i];
					
					if ( self_url.indexOf(pattern.source) > -1 ) { 
						session.change(pattern);
					}
				}
			}
			
			// check domain
			if (this.domains) {
				var domain = this.domains[session.$("hostname")];
				
				if (domain) {
					session.change(domain);
				}		
			}
		},	
		
		beforeRequest : function(session) {
			if (this.data.isStart) {			
				this.runRouting(session);				
			}
		}
	}
})
