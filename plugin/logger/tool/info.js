define("plugin/logger/tool/info", [
	'jquery', 'w2ui' 
], function($, w2ui){
	
	var cookie = requireNode("cookie");
	
	return {
		
		refresh : function() {
			var session = this.logger.currentSession;
			var target = this.content.get('main').tabs.active;
			
			this.content.content('main', this.getView(target, session));			
			
		},
		
		getView : function(target, session) {
			session = session || {}; 
			if (target == 'info') {

				// message 
				var data = session.$req('method') + " " + session.$('path') + " HTTP/" + session.$req('httpVersion');
				this.info.content('top', data);
				
				
				// headers 
				this.form_info.records = this.getRecords(session.req.headers);
				this.form_info.refresh();
				
				// get values 
				var gets = requireNode('querystring').parse(session.$('query') || "");
				
				this.form_get.records = this.getRecords(gets);
				this.form_get.refresh();			


				// cookie 
				var cookies = cookie.parse(session.req.headers['cookie'] || "");
				
				this.form_cookie.records = this.getRecords(cookies);
				this.form_cookie.refresh();				
								
				
				return this.info;
			}
		},
		
		getRecords : function(arr) {
				
			var records = [];
			
			var i = 1;
			for(var k in arr) {
				if (arr[k]) {
					records.push({ recid : i++, header : k , content : arr[k] });
				}
			}							
			
			return records;
		},
		
		initialize : function(logger) {
			var self = this;
			this.logger = logger;
			
			this.form_info = $().w2grid({
					name : 'logger_info_grid',
					show : {
						toolbar : false
					},
					columns : [
						{ field : 'header', size : "100px", caption : 'Key'},
						{ field : 'content', size : '100%', caption : 'Value', editable : {type : 'text'}}
					]
			})
			
			
			this.info = $().w2layout({
				name : 'logger_info_layout_info',
				panels : [
					{ type : 'top', minSize : '50px', resizable : true, content : ''},
					{ 
						type : 'main', 
						size : '300px', 
						content : this.form_info, 
						resizable : true,
						tabs : {
							active : 'info',
							tabs : [
								{ id : 'info', text : 'Headers'},
								{ id : 'get', text : 'GET' },
								{ id : 'post', text : 'POST' },
								{ id : 'cookie', text : 'COOKIE' }
							],
							onClick : function(target, data) {

								if (self['form_'+target]) {
									this.owner.content('main', self['form_' + target]);
								}

							}
						}
					}
				]
			})
			
			this.form_get = $().w2grid({
				name : 'logger_form_grid_get',
				show : {
					toolbar : false
				},
				columns : [
					{ field : 'header', size : "100px", caption : 'Key'},
					{ field : 'content', size : '100%', caption : 'Value', editable : {type : 'text'}}
				]				
			})
			
			this.form_post = $().w2grid({
				name : 'logger_form_grid_post',
				show : {
					toolbar : false
				},
				columns : [
					{ field : 'header', size : "100px", caption : 'Key'},
					{ field : 'content', size : '100%', caption : 'Value', editable : {type : 'text'}}
				]				
			})			
			
			this.form_cookie = $().w2grid({
				name : 'logger_form_grid_cookie',
				show : {
					toolbar : false
				},
				columns : [
					{ field : 'header', size : "100px", caption : 'Key'},
					{ field : 'content', size : '100%', caption : 'Value', editable : {type : 'text'}}
				]				
			})			
			
			this.content = $().w2layout({
				name :'logger_info_layout',
				panels : [
					{
						type : 'main',
						tabs : {
							active : 'info',
							tabs : [
								{ id : 'info', text : 'Request' },
								{ id : 'form', text : 'Form' }
							],
							onClick : function(target, data) {
								data.onComplete = function() {
									self.refresh();
								}
							}
						}
					}
				]
			}) 
		}
	}
});