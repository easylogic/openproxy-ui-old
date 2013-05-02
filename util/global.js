/**
 * Native Proxy Util
 *  
 */


var exec = requireNode('child_process').exec;
var OpenProxy = requireNode('openproxy');
var os = requireNode('os');

if (process.platform == 'win32') {
	var setting = requireNode('./binding/openproxy_setting');	
}

global.openproxy = new OpenProxy();

global.setProxy = function setProxy(port, done) {
	
	if (process.platform == 'win32') {
		var proxy = ["http=127.0.0.1:"+port, "https=127.0.0.1:"+port].join(";");
	
		exec('reg.exe add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v MigrateProxy /t REG_DWORD /d 0 /f', function(error){
			exec('reg.exe add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f', function(error){
				exec('reg.exe add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyHttp1.1 /t REG_DWORD /d 0 /f', function(error){
					exec('reg.exe add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d ' + proxy + ' /f', function(error){
						setting.RefreshProxy();
						if (typeof done == 'function') done();
					});
				});		
			});		
		});
	} else if (process.platform == 'mac') {
		var proxy = 'networksetup -setwebproxy WI-FI localhost ' + port;
		var sproxy = 'networksetup -setsecurewebproxy WI-FI localhost ' + port;
		
		var proxy_state = 'networksetup -setwebproxystate WI-FI on';
		var sproxy_state = 'networksetup -setsecurewebproxystate WI-FI on';

		exec(proxy, function(error){
			if (error) throw error;
			exec(sproxy, function(error){
				if (error) throw error;
				exec(proxy_state, function(error){
					if (error) throw error;
					exec(sproxy_state, function(error){
						if (error) throw error;
						if (typeof done == 'function') done();						
					})
				})
			})
		})		 
		
	} else if (process.platform == 'linux') {
		var proxy = 'export HTTP_PROXY=http://127.0.0.1:' + port;
		
		exec(proxy, function(error){
			if (error) throw error;
			
			if (typeof done == 'function') done();
		})
	}
}

global.initProxy = function initProxy(done) {
	
	if (process.platform == 'win32') {
		
		exec('reg.exe add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f', function(error){
			exec('reg.exe delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /f', function(error){
				setting.RefreshProxy();			
				if (typeof done == 'function') done();
			});
		});	
	
	} else if (process.platform == 'mac') {
		
		var proxy_state = 'networksetup -setwebproxystate WI-FI off';
		var sproxy_state = 'networksetup -setsecurewebproxystate WI-FI off';

		exec(proxy_state, function(error){
			if (error) throw error;
			exec(sproxy_state, function(error){
				if (error) throw error;
				if (typeof done == 'function') done();						
			})
		})
	} else if (process.platform == 'linux') {
		var proxy = 'export HTTP_PROXY=""';
		
		exec(proxy, function(error){
			if (error) throw error;
			
			if (typeof done == 'function') done();
		})
	}	
	
}


/**
 * Menu System 
 *  
 */
var win = window.gui.Window.get(); 


var menu1 = new gui.Menu({type : 'menubar'});
var submenu = new gui.Menu();
menu1.append(new gui.MenuItem({label : 'File', submenu : submenu}))

var item1 = new gui.MenuItem({type: 'checkbox', label : 'Attach Proxy', checked : window.localStorage.attachProxy, click : function() {
	
	if (this.checked) {
		global.setProxy(8888, function(){
			window.localStorage.attachProxy = true;
		});
	} else {
		global.initProxy(function(){
			window.localStorage.attachProxy = false;
		});
	}
}})

submenu.append(item1)
submenu.append(new gui.MenuItem({type : 'separator'}));

var item2 = new gui.MenuItem({label : 'Close', click : function() {
	global.initProxy();
	
	// close
	gui.App.quit();
}})

submenu.append(item2)

win.menu = menu1;

if (window.localStorage.attachProxy) {
	global.setProxy(8888)
}

/**
 * Native Event System 
 *  
 */
var tray;

win.on('close', function() {
	global.openproxy.trigger('unload');
	
	this.hide();

	var self = this; 	
	global.initProxy(function(){
		self.close(true);	
	});

})

win.on("closed", function(){
	win = null;
})

win.on('minimize', function(){
	this.hide();
	
	tray = new gui.Tray({icon : 'icon.png'})
	
	tray.on('click', function(e){
		win.show();
		this.remove();
		tray = null;
	})
})