define("plugin/router/tool/grid", [
	'jquery', 'w2ui' 
], function($, w2ui){
	return {
		
		getGrid : function() {
			var self = this; 
			return $().w2grid({
				name : 'router_grid',
				show: {
						toolbar : true,
						lineNumbers : true,
						toolbarColumns	: false,						
						toolbarAdd : true,
						toolbarDelete : true,
						toolbarSave : true
				},
				
				onSave : function(target, data) {
					
					var tree = self.router.sidebar.localTree;
					
					var obj = tree.get(tree.selected);
					obj.records = this.records;
					
					tree.set(obj.id, obj);

				},
				
				onDblClick : function(target, data) {
					this.onAdd(target, this.get(data.recid));
				},
				
				openPopup : function(target_data) {
						var self = this; 
						$().w2popup('load', { 
							url : './plugin/router/tpl/add_new.html',
							onOpen : function(target, data) {
								
								if (!target_data.recid) 
									target_data = { enabled : true, type : 'domain', recid : -1 };
								
								$("#add_new_form").w2form({
									name : 'add_new_form',
									record: target_data,
									fields : [
										{ name: 'enabled', type : 'checkbox', },									
										{ name: 'type', type : 'list', required : true, options : { items : ["domain","pattern"] } },
										{ name: 'source', type: 'text', required: true },
										{ name: 'target',  type: 'text', required: true },
										{ name: 'keep', type : 'checkbox'},
										{ name: 'description',   type: 'text'}
										
									],
									actions : {
										file : function() {
											$(this.box).find("#fileDialog").click();
										},
										
										dir : function() {
											$(this.box).find("#dirDialog").click();
										},
										reset : function() {
											this.clear();
										},
										save : function() {
											var errors = this.validate(true);
											if (errors.length !== 0) {
												this.goto(errors[0].field.page);
												return; 
											}

											if (self.get(this.record.recid)) {		// update record 
												var obj = self.find({source : this.record.source});

											 	if (obj.length) {
											 		alert('Already source!');
											 		return;
											 	} 
												
												self.set(this.record.recid, this.record);												
											} else {								// add record
												
												var obj = self.find({source : this.record.source});

											 	if (obj.length) {
											 		alert('Already source!');
											 		return;
											 	} 
											 	
												this.record.recid = self.total  + 1; 
												self.add(this.record);											 		

											}
											
											//self.select(this.record.recid);
											
											$().w2popup('close');
										}
									}
								})
								
								$("#add_new_form").show();
							},
							onBeforeClose : function() {
								$("#add_new_form").w2destroy();
							}
						});				
				},
					
				onAdd : function(target, target_data) {
					this.openPopup(target_data);
				
				},
				columns : [
					{ field : 'enabled', caption : '', size:'18px',render : function(val) {
						return '<input type="checkbox" '+ (val.enabled ?  "checked" : "") + ' onclick="w2ui[\'router_grid\'].set('+val.recid+', { enabled : this.checked});" />';
						//return val.enabled; 
					}},
					{ field : 'type', caption : 'Type', size:'50px', render : function(val) {
						return val.type == 'domain' ? 'Domain' : 'Pattern';
					}},					
					{ field : 'source', caption : 'Source', size:'30%', resizable: true },
					{ field : 'target', caption : 'Target', size: '30%', resizable: true, render : function(obj) {
						return obj.keep ? '* ' + obj.target : obj.target;
					}},
					{ field : 'description', caption : 'Description', size:'30%', resizable: true}
				]
			})
		},

		initialize : function(router) {
			
			this.router = router;


			this.content = this.getGrid();
		}
	}
});