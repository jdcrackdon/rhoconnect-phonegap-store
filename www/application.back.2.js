var map = null;
var username = null;
var password = null;
var syncInterval = null;
var current_model = null;

onLoad = (function($) {

    var fields = [ 'name','brand','price','quantity','sku' ]
	
    var modelDefinitions = [
	   {
            name: 'Product',
            fields: [
                {name: persistence.store.rhoconnect.RHO_ID, type: 'string'}, // id of the object in RhoConnect db
				{name: 'name',    	type: 'string'},
                {name: 'brand',		type: 'string'},
                {name: 'price',		type: 'string'},
                {name: 'quantity',  type: 'string'},
                {name: 'sku',   	type: 'string'},
            ]
        }
		
    ];

    // let's start here
    function loadPages() {
		$('a#login').live('tap',function(event){
			setNames();
			initDeviceId();
            loginRhoConnect(username, password).done(function(){
				sync();
				$.mobile.changePage("home", "slideup");
			$('.greeting').replaceWith("<h1 style='text-align:center'>Welcome " + username + '</h1>');
            }).fail(function(errCode){
				$('.login-error').replaceWith("<div class='login-error'>Error logging in" + errCode + "</div>");
				$('.login-error').fadeOut(3000);
			})
		})
		
		$('a#products').live('tap',function(event){
			pull_data('Product');
		})
		$('a#sync').live('tap',function(event){
			sync();
		})
		$('a#logout').live('tap',function(event){
			logout();
		})
		$('#create').live('tap',function(event){
			create_obj();
		})
		$('a#new_form').live('tap',function(event){
			html = "<form action='#' id='form-create'>" + get_form_html + "</form>";
			$('#form-create').replaceWith(html);
			$.mobile.changePage("form-new", "slideup");
		})
    }
	
	function get_current_model(){
		return current_model;
	}
	
	function create_obj(){
		var record = null;
		
		var store = RhoConnect.dataAccessObjects()[current_model];
		var f = $('#form-create').serializeArray()
		record = store.add({
			name: 		f[0].value,
			brand:  	f[1].value,
			price: 		f[2].value,
			quantity: 	f[3].value,
			sku:        f[4].value
		})[0];
		record.save();
		store.sync();
		$.mobile.changePage("home", "slideup");
	}
	
	function logout(){
		RhoConnect.logout().done(function(){
			$.mobile.changePage("form", "slideup");
		}).fail(function(errCode){
			alert('Logout error: ' +errCode);
		})
	}
	
	function sync(){
		RhoConnect.syncAllSources().done(function(){
			alert('sync successful');
		}).fail(function(errCode, err){
			alert('Data sync error: ' +errCode);
	    });
	}

	function pull_data(model) {
		var mod = RhoConnect.dataAccessObjects()[model];
		current_model = model;
		persistence.loadFromRhoConnect(function() {
            storeLoaded();
        });
		
	    function storeLoaded() {
			var html = "<div id='list-data'>";
			
			mod.all().each(null, function(obj){
                //dump_object(obj);
				html += "<div class='ui-grid-b'><div class='ui-bar ui-bar-b' style='height:50px;text-align:center'>"+ obj.name + "</div></div>";
				// html += "<fieldset class='ui-grid-a'>";
				// for( var j=0; j<fields.length; j++ ){
				//   if( obj[fields[j]] != undefined ) {
				//   	html += "<div class='ui-block-a'><div class='ui-bar ui-bar-c' style='height:40px;text-align:center'>"+ 
				// 	fields[j] +"</div></div><div class='ui-block-b'><div class='ui-bar ui-bar-c' style='height:40px;text-align:center'>" + 
				// 	obj[fields[j]] + "</div></div>"; 
				//   }
				// }
				// html += "</fieldset>";
			});
			html += "</div>";
			$('#list-data').replaceWith(html);
			$.mobile.changePage("list", "slideup");
        }	
	}
	
	function dump_object(obj){
        var str = "";
        str += ('------\n');
        str += ('Name: ' +obj.name +'\n');
        str += ('Brand: ' +obj.brand +'\n');
        str += ('Price: ' +obj.price +'\n');
        str += ('Quantity: ' +obj.quantity +'\n');
        str += ('SKU: ' +obj.sku +'\n');
        console.log(str);
    }

	function setNames(){
        username = $('input#username')[0].value;
        password = $('input#password')[0].value;    
    }

	function get_form_name(){
		var html = ""
		if(current_model == 'Product'){
			html += "<div data-role='fieldcontain'> \
	            <label for='name'>name:</label> \
	            <input type='text' name='name' id='name' value=''/> \
	            <label for='brand'>brand:</label> \
	            <input type='text' name='brand' id='brand' value=''/> \
				<label for='price'>price:</label> \
				<input type='text' name='price' id='price' value=''/> \
				<label for='quantity'>quantity:</label> \
				<input type='text' name='quantity' id='quantity' value=''/> \
				<label for='sku'>sku:</label> \
				<input type='text' name='sku' id='sku' value=''/> \
	            <a id='create' href='#' data-role='button'>create</a> \
	        </div>"
		}
		return html;
	}

    var myUuid = null;
    var myName = null;

    function initDeviceId() {
	//phonegap emulator issue will always cause device to be undefined, uncomment lines 10, 20 for real phone
        if ("undefined" != typeof device && (!myUuid || !myName)) {
            myUuid = device['uuid'];
            myName = device['name'];

            //alert('Device uuid: ' + myUuid);
            //alert('Device name: ' + myName);
        } else {
            myUuid = 'UNDEFINED';
            myName = 'UNDEFINED';
        }
    }

    function loginRhoConnect(username, password) {
		persistence.store.rhoconnect.config(persistence);

        return $.Deferred(function(dfr){
            RhoConnect.login(username, password,
                    new RhoConnect.SyncNotification(), true /*do db init*/).done(function(){
                // Init DB for the user on success
                initRhoconnect(username, false).done(function(){
                    dfr.resolve();
                }).fail(function(errCode, err){
                    alert('DB init error: ' +errCode);
                    dfr.reject(errCode, err);
                });
            }).fail(function(errCode, err){
                //alert('RhoConnect login error: ' +errCode);
                dfr.reject(errCode, err);
            });
        }).promise();
    }

    // RhoConnect.js initialization
    function initRhoconnect(username, doReset) {
        return RhoConnect.init(modelDefinitions, 'persistencejs', null, doReset);
    }
	

    return loadPages;
})(jQuery);
