/*--[ Application ]--*/
var App = {
    activities   : new ActivityCollection(),
    people       : new PersonCollection(),
    transactions : new TransactionCollection(),
    templates    : { debug: function(context, options) { return JSON.stringify(context); } },
    router       : null
};


/*--[ Initialization ]--*/
function init() {
    App.router = new Router;

    $('body script[type="text/x-handlebars-template"]').each(function() {
        App.templates[$(this).attr('class')] = Handlebars.compile($(this).html());
    }).remove();
    
    Backbone.history.start();
}

/*--[ Run app ]--*/
$(init);