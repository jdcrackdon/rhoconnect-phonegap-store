onLoad = (function($) {

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

    function loadPages() {
            loginRhoConnect('username', 'password').done(function(){
				sync();
            }).fail(function(errCode){
                alert("can't login to server: " +errCode);
			})
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

	function sync(){
		RhoConnect.syncAllSources().done(function(){
			//alert('sync successful');
            dump_data('Product');
		}).fail(function(errCode, err){
			alert('Data sync error: ' +errCode);
	    });
	}

	function dump_data(model) {
		var mod = RhoConnect.dataAccessObjects()[model];
		persistence.loadFromRhoConnect(function() {
            storeLoaded();
        });

	    function storeLoaded() {

			mod.all().each(null /*means no transaction*/, function(obj){
                append_object(obj);
            });
		}
	}
	
	function append_object(obj){

        var objElm = $('<li></li>');
        objElm.append($('<span>' +obj.brand +' ' +obj.name +'</span>'));
        objElm.append(fields_list(obj));

        $('#theList').append(objElm);
        $('ul').listview('refresh');
    }

    function fields_list(obj){
        var fieldsElm = $('<ul data-role="listview"></ul>');
        fieldsElm.append(
                '<li>Name: ' +obj.name +'</li>',
                '<li>Brand: ' +obj.brand +'</li>',
                '<li>Price: ' +obj.price +'</li>',
                '<li>Quantity: ' +obj.quantity +'</li>',
                '<li>SKU: ' +obj.sku +'</li>'
                );
        return fieldsElm;
    }

    return loadPages;
})(jQuery);
