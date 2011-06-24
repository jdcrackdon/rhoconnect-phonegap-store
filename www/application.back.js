var username = null;
var password = null;

onLoad = (function($) {

    var fields = [ 'name','brand','price','quantity','sku' ]
	
    var modelDefinitions = [
	   {
            name: 'Product',
            fields: [
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

    function loginRhoConnect(username, password) {
		persistence.store.rhoconnect.config(persistence);

        return $.Deferred(function(dfr){
            RhoConnect.login(username, password,
                    new RhoConnect.SyncNotification()).done(function(){
                // Init DB for the user on success
                RhoConnect.init(modelDefinitions, 'persistencejs').done(function(){
                    dfr.resolve();
                }).fail(function(errCode, err){
                    dfr.reject(errCode, err);
                });
            }).fail(function(errCode, err){
                dfr.reject(errCode, err);
            });
        }).promise();
    }

    return loadPages;
})(jQuery);
