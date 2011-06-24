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
                dump_object(obj);
            });
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

    return loadPages;
})(jQuery);
