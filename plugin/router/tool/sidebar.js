define("plugin/router/tool/sidebar", [
	'jquery', 'w2ui'
], function($, w2ui){
	return {
		
		getTableMax : function() {
			var max  = this.router.get('tableMax') || 0;
			
			max++;
			
			this.router.update({tableMax : max });
			
			return max;
		},
		
		loadSelectedData : function() {

			if (this.localTree.selected) {
				this.reloadRecords(this.localTree.get(this.localTree.selected).records)
			}

		},
		
				
		initRemoteTree : function() {
			var nodes = this.router.get('repository') || [];
			var self = this;
			this.remoteTree = $().w2sidebar({
				name : 'router_remote_tree',
				nodes : nodes,
				onClick: function(target, data) {
					self.reloadRecords(this.get(target).records)
				},
				onDblClick:function(target, data) {
					w2ui['router-remote-toolbar'].doClick('remote-repo-edit')
				},
				onExpand : function(target, data) {
					var self = this; 
					
					var node = this.get(target);
						
					if (!node.nodes.length) {
						$.getJSON(node.repository, function(resp) {
							node.nodes = resp;
							//TODO: implements to get remote file  
							self.refresh(node.id);
						})							
					}
				}
			})
		},
		
		reloadRecords : function(records) {
			records = records || [];
			
			var start = "temp"; 
			for(var i = 0, len = records.length; i < len; i++ ) {
				if(!records[i].recid) {
					records[i].recid = start + i; 
				}
			}
			
			this.router.grid.content.records = records;
			this.router.grid.content.refresh();
			
			this.router.setTable(records);
		},
		
		initLocalTree : function() {
			var self = this;
			var nodes = this.router.get('table') || [];	
			
			this.localTree = $().w2sidebar({
				name : 'router_tree',
				nodes : nodes,
				
				after : function(id, obj) {
					var nodes = this.get(id).parent.nodes;
					
					// find obj's next node
					var next_id = "";
					for(var i = 0, len = nodes.length; i < len; i++) {
	
						if (nodes[i].id == id) {
	
							var next_node = nodes[i+1];
							if (next_node) {
								next_id = next_node.id;
							}
							break;
						} 
					}
					
					if (next_id == "") {
						this.add(this.get(id).parent, obj);
					} else {
						this.insert(next_id, obj);
					}
				},
				
				onRefresh : function(target, data) {
					var tree = this;
					data.onComplete = function(eventData) {

						if ($(tree.box).find(".w2ui-node:not([draggable])").attr('draggable')) return;
						
						$(tree.box).find(".w2ui-node:not([draggable])").off('dragstart', 'dragend', 'drop', 'dragover', 'dragleave', 'dragenter');
						$(tree.box).find(".w2ui-node:not([draggable])").attr({ draggable: true, droppable : true}).on("dragstart", function(e){
							$(this).css({opacity : 0.4 })
							
						 	tree.$hint = $("<div></div>").css({
						 		'height' : '2px',
						 		'background' : 'red'
						 	}).data({
						 		'start_id' :  $(this).attr('id').replace("node_", ""),
						 		'count' : 0	
						 	})
						 	
						 	$(tree.box).prepend(tree.$hint);
  							 
						}).on('dragend', function(e) {
  							 tree.$hint.remove();
						}).on('drop', function(e) {
							 e.stopPropagation()
							 
							 var id = tree.$hint.data('start_id');
							 var after_id = $(this).attr('id').replace("node_", "");
							 
							 var direction = tree.$hint.data('direction');							 
							 var before = tree.get(id);
							 var after = tree.get(after_id);

							 if (before.parent.nodes.length == 1) {
							 	before.parent.img = 'icon-page';
							 	tree.refresh(before.parent.id);
							 }							 
							 
							 tree.remove(before.id);
							 
							 if(direction == 'top') {
							 	tree.insert(after.parent, after.id, before);
							 } else if (direction == 'bottom') {
							 	tree.after(after.id, before);
							 } else if (direction == 'center') {
							 	tree.add(after, before);
							 	tree.expand(after.id);
							 	
							 	if (after.img != 'icon-folder') {
							 		after.img = 'icon-folder';
							 		tree.refresh(after.id);
							 	}
							 }
							 
							 tree.select(before.id);
							 
							 // remove hint layer
							 tree.$hint.remove();
							
						}).on('dragover', function(e) {
							
							e.preventDefault();
							e.originalEvent.dataTransfer.dropEffect = 'move'
														
							var offset = $(this).offset();
							var height = $(this).height()
							var start = offset.top;
							var end = offset.top + $(this).height();
							
							if (start + 8 > e.originalEvent.y ) {		// top
								tree.$hint.data('direction', 'top').data('target', $(this));
								$(this).before(tree.$hint);
								tree.$hint.show();
							} else if (end - 8  < e.originalEvent.y ) {		// bottom
								tree.$hint.data('direction', 'bottom').data('target', $(this));
								$(this).after(tree.$hint);
								tree.$hint.show();
							} else {									// center 
								tree.$hint.data('direction', 'center').data('target', $(this))
								$(this).css({background:"gray"})
								tree.$hint.hide();								
							}
							
						}).on('dragleave', function(e) {
							 e.preventDefault();							
							 tree.$hint.data('count', tree.$hint.data('count') - 1)
							$(this).css({background:""})
						}).on('dragenter', function(e){
							 e.preventDefault();			
							 tree.$hint.data('count', tree.$hint.data('count') + 1)				
						})
						
					}
				},
				
				onClick : function(target, data) {
					self.reloadRecords(this.get(target).records)
				},
				
				onDblClick : function(target, data) {
					var self = this; 
					data.stop = true;

					var $dom = $(this.box).find("#node_" + target + " .w2ui-node-caption");
					var text = $dom.html();
					
					function convert(e) {
						
						if (e.type == 'keyup') {
							if (e.keyCode != 13) return; 
						}
						
						var current_text = $(this).val();
						
						$input.remove();
						
						var data = self.get(target);
						data.text = current_text;
						
						self.set(target, data);	
						// file update?						
					}
					
					var $input = $("<input type='text' />")
									.css('width', '100%')
									.on('dblclick', function(e) { e.stopPropagation(); return false; })
									.on("keyup", convert)
									.on('blur', convert)									
					
					$input.val(text);
					
					$dom.html($input).css('padding', '0px');
					
					$input.select().focus();

				}
			})
		},

		initRemoteToolbar: function() {
			var self = this; 
			this.remoteToolbar = $().w2toolbar({
				name : 'router-remote-toolbar',
				items : [
					{ type : 'html', html : 'Remote', id : 'remote-text-html'},
					{ type : "button", hint : 'Add', img : "icon-add", id : 'remote-repo-plus', caption : 'Add'},
					{ type : "button", hint : 'Edit', img : "icon-edit", id : 'remote-repo-edit', caption : 'Edit', hidden : true},
					{ type : "button", hint : 'Delete', img : "icon-delete", id : 'remote-repo-delete', caption : 'Delete'}
				],
				onClick: function(target) {
					
					if (target == 'remote-repo-copy') {
					
					} else if (target == 'remote-repo-plus') {
						self.openPopup();
					} else if (target == 'remote-repo-edit') {
						
						var node = self.remoteTree.get(self.remoteTree.selected);
						
						if (node.parent && !node.parent.parent) {
							var record = {
								id : node.id,
								name : node.text,
								repository : node.repository
							}
							self.openPopup(record);	
						}

					}
				}
			});
		},
		
		openPopup : function(target_data) {
				var self = this; 

				$().w2popup('load', { 
					url : './plugin/router/tpl/add_new_repository.html',
					onOpen : function(target, data) {
						
						$("#add_new_form").w2form({
							name : 'add_new_form',
							record: target_data || {},
							fields : [
								{ name: 'name', type: 'text', required: true },
								{ name: 'repository',  type: 'text', required: true }
							],
							actions : {
								reset : function() {
									this.clear();
								},
								save : function() {
									var errors = this.validate(true);
									if (errors.length !== 0) {
										this.goto(errors[0].field.page);
										return; 
									}

									var node = self.remoteTree.get(this.record.id)

									if (node) {		// update record 
										node.text = this.record.name;
										node.repository = this.record.repository;

										self.remoteTree.set(this.record.id, node);
									} else {								// add record
										self.remoteTree.add({
											id : 'router-remote-repo-' + self.getTableMax(),
											text : this.record.name,
											repository : this.record.repository,
											img : 'icon-folder'
										});
									}
									
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
		
		initNodes : function() {
			
			var nodes = this.localTree.nodes;
			
			function traverse(nodes) {
				
				var list = [];
				for(var i in nodes) {
					var obj = nodes[i];
					
					var temp = {
						expanded: obj.expanded,
						group: obj.group,
						icon: obj.icon,
						id: obj.id,
						img: obj.img,
						nodes: traverse(obj.nodes),
						selected: obj.selected,
						text: obj.text,
						records : obj.records 
					}
					
					list.push(temp);
				}
				
				return list;
			}
			
			var remote_nodes = this.remoteTree.nodes;
			
			for(var i = 0; i < remote_nodes.length; i++) {
				remote_nodes.nodes = [];
			}
			
			this.router.update({ table : traverse(nodes), repository : remote_nodes });
			
			
			
		},		
		
		unload : function() {
			this.initNodes();
		},
		
		initLocalToolbar: function() {
			var self = this; 
			this.localToolbar = $().w2toolbar({
				name : 'router-local-toolbar',
				items : [
					{ type : 'html', html : '<strong>Local</strong>', id : 'text-html'},
					{ type : "button", hint : 'Add', img : "icon-add", id : 'resp-plus', caption : 'Add'},
					{ type : 'button', hint : 'Copy', img : 'icon-reload', id : 'resp-copy', caption : 'Copy'},
					{ type : "button", hint : 'Delete', img : "icon-delete", id : 'resp-delete', caption : 'Delete'}											
				],
				onClick : function(target, data) {
					var tree = w2ui['router_tree'];
					
					if (target == 'resp-copy') {
						var selected = tree.selected;
						
						if (!selected) {
							w2alert('Please select a node');
							return;
						}
						
						var obj = tree.get(selected);
						
						// 객체 생성
						var max = self.getTableMax();
						
						do {
							var temp_max = tree.get("router-tree-" + max);
							 
							if (temp_max) {
								max = self.getTableMax();													
							} else {
								break;
							}													
						}while(true);												
						
						var temp = {};
						$.extend(temp, obj, { id : "router-tree-" + max, selected : false, text : "Copy of " + obj.text})
						
						// find obj's next node
						var next_id = "";
						for(var i = 0, len = obj.parent.nodes.length; i < len; i++) {

							if (obj.parent.nodes[i].id == obj.id) {

								var next_node = obj.parent.nodes[i+1];
								if (next_node) {
									next_id = next_node.id;
								}
								break;
							} 
						}
						
						if (next_id == "") {
							tree.add(obj.parent, temp);
						} else {
							tree.insert(obj.parent, next_id, temp);	
						}
						
					} else if (target == 'resp-delete') {
						var selected = tree.selected;
						
						if (!selected) {
							w2alert('Please select a node');
							return;
						}
						
						w2confirm("Really delete node?", function() {
							var parent = tree.get(selected).parent;
							
							if (parent && parent.nodes.length == 1) {
								 parent.img = 'icon-page';
								 tree.set(parent.id, parent);
							}
							
							tree.remove(selected);
							tree.selected = null;															
						});

						// change parent icon img												
						
					} else if (target == 'resp-plus') {
						// 객체 생성
						var max = self.getTableMax();
						
						do {
							var obj = tree.get("router-tree-" + max);
							 
							if (obj) {
								max = self.getTableMax();													
							} else {
								break;
							}													
						}while(true);

						var obj = { id : 'router-tree-' + max, text : 'New Item', img : 'icon-page' };
						
						if (!tree.selected) {
							tree.add(tree, obj);	
						} else {
							var parent = tree.get(tree.selected);
							
							if (parent.img != 'icon-folder') {
								parent.img = 'icon-folder';
								tree.set(tree.selected, parent);
							}
							
							tree.add(tree.selected, obj);
							tree.expand(tree.selected);		
							
						}
						
					}
				}
			})
		},
		
		initialize : function(router) {
			
			this.router = router;
			
			this.initLocalTree();
			this.initLocalToolbar();
			this.initRemoteTree();
			this.initRemoteToolbar();

			this.content = $().w2layout({
				'name' : 'sidebar-layout',
				panels : [
					{ type : 'main', content : this.localTree, toolbar : this.localToolbar, style : 'border-bottom: 1px solid #c0c0c0;'  },
					{ type : 'bottom', content : this.remoteTree, toolbar : this.remoteToolbar, size : '30%', resizable : true, style : 'border-top: 1px solid #c0c0c0;' }
				]
			})
		}
	}
});