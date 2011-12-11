/*--[ Models ]--*/
var Activity = Backbone.Model.extend({
    defaults: {
        name         : null,
        createdAt    : null
    },
    addPayment: function(from, to, amount) {
        var transaction = new Transaction({
            id         : this.collection.getMaxId() + 1,
            activityId : this.id,
            fromId     : from.id,
            toId       : to.id,
            amount     : amount,
        });
        App.transactions.add(transaction);
    }
});

var Person = Backbone.Model.extend({
    defaults: {
        name: null,
        avatar: 'img/person.png'
    }
});

var Transaction = Backbone.Model.extend({
    defaults: {
        fromId : null,
        toId   : null,
        amount : 0
    }
});

/*--[ Collections ]--*/
var BaseCollection = Backbone.Collection.extend({
    getMaxId: function() {
        if (this.length > 0)
            return Math.max.apply(this, this.pluck('id'));
        return 0;
    }
});

var ActivityCollection = BaseCollection.extend({
    model: Activity
});

var PersonCollection = BaseCollection.extend({
    model: Person
});

var TransactionCollection = BaseCollection.extend({
    model: Transaction,
    getByActivityId: function(id) {
        return new TransactionCollection(
            this.filter(function(t) { return t.get('activityId') == id; })
        );
    }
});

/*--[ Views ]--*/
var BaseView = Backbone.View.extend({
    templateName: 'debug',

    __parent: function(context, args) {
        this.constructor.__super__.constructor.apply(context, args);
    },

    constructor: function() {
        BaseView.__super__.constructor.apply(this, arguments);
        if (this.model)
            this.model.bind('all', this.render, this);
        if (this.collection)
            this.collection.bind('all', this.render, this);
        this.template = App.templates[this.templateName];
    },

    getViewModel: function() {
        return (this.model)? this.model.toJSON() : this.collection.toJSON();
    },

    render: function() {
        var json = this.getViewModel();
        $(this.el).html(this.template(json));
    }
});

var ActivityListView = BaseView.extend({
    templateName: 'activity-list',

    constructor: function(options) {
        this.__parent(this, arguments);
        this.filter = options.filter;
    },

    events: {
        'change input[type=search]': 'updateFilter'
    },

    getViewModel: function() {
        return { activities: this.collection.toJSON(), filter: this.filter }
    },

    updateFilter: function(ev) {
        ev.preventDefault();
        App.router.navigate('activity?filter=' + encodeURIComponent(this.$('input[type=search]').val()), true);
    }
});

var ActivityEditView = BaseView.extend({
    templateName: 'activity-edit',

    constructor: function() {
        this.__parent(this, arguments);
        _.bind(this.save, this);
    },

    events: {
        'click input[type=submit]': 'save'
    },

    getViewModel: function() {
        var transactions = App.transactions.getByActivityId(this.model.id).toJSON();
        transactions.forEach(function(t) {
            t.from = App.people.get(t.fromId).toJSON();
            t.to = App.people.get(t.toId).toJSON();
        });
        return {
            activity: this.model.toJSON(),
            transactions: transactions
        };
    },

    save: function(ev) {
        ev.preventDefault();
        this.model.set({ name: this.$('[name=name]').val() });
        this.trigger('update');
    }
});

var PersonListView = BaseView.extend({
    templateName: 'person-list'
});

var PersonEditView = BaseView.extend({
    templateName: 'person-edit',

    constructor: function() {
        this.__parent(this, arguments);
        _.bind(this.save, this);
    },

    events: {
        'click input[type=submit]': 'save'
    },

    save: function(ev) {
        ev.preventDefault();
        this.model.set({ name: this.$('[name=name]').val(), avatar: this.$('[name=avatar]').val() });
        this.trigger('update');
    }
});

/*--[ Router ]--*/
var Router = Backbone.Router.extend({
    routes: {
        'activity'                : 'activityList',
        'activity?filter=:filter' : 'activityList',
        'activity/edit'           : 'activityEdit',
        'activity/edit/:id'       : 'activityEdit',
        'person'                  : 'personList',
        'person?filter=:filter'   : 'personList',
        'person/edit'             : 'personEdit',
        'person/edit/:id'         : 'personEdit',
        ''                        : 'index'
    },
    _updateNav: function() {
        
    },
    _getViewContainer: function() {
        $('#content').empty();
        return $('<div/>').appendTo('#content');
    },
    index: function() {
        this.navigate('activity', true);
    },
    activityList: function(filter) {
        var activities = App.activities;
        if (filter) {
            activities = new ActivityCollection(activities.filter(function(item) {
                return item.get('name').toLowerCase().indexOf(filter.toLowerCase()) > -1;
            }));
        } else {
            this.navigate('activity', true);
        }
        new ActivityListView({
            collection : activities,
            el         : this._getViewContainer(),
            filter     : filter
        }).render();
    },
    activityEdit: function(id) {
        var activity = (typeof id == 'undefined')? new Activity() : App.activities.get(id);
        var view = new ActivityEditView({
            model : activity,
            el    : this._getViewContainer()
        });
        var self = this;
        view.bind('update', function() { self.navigate('activity', true); });
        view.render();
    },
    personList: function(filter) {
        var people = App.people;
        if (filter) {
            people = new ActivityCollection(people.filter(function(item) {
                return item.get('name').toLowerCase().indexOf(filter.toLowerCase()) > -1;
            }));
        }
        new PersonListView({
            collection : people,
            el         : this._getViewContainer()
        }).render();
    },
    personEdit: function(id) {
        var person = (typeof id == 'undefined')? new Person() : App.people.get(id);
        var view = new PersonEditView({
            model : person,
            el    : this._getViewContainer()
        });
        var self = this;
        view.bind('update', function() { self.navigate('person', true); });
        view.render();
    }
});


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

    $('script[type="text/x-handlebars-template"]').each(function() {
        App.templates[$(this).attr('class')] = Handlebars.compile($(this).html());
    });
    
    Backbone.history.start();
}


/*--[ Handlebars extensions ]--*/
Handlebars.registerHelper('debug', function(obj) {
    console.debug(obj);
    return '';
});

Handlebars.registerHelper('formatNumber', function(v) {
    return v.toFixed(2);
});

Handlebars.registerHelper('formatDate', function(date) {
    if (date == null) return '';
    return new Handlebars.SafeString(moment(date).format('M/D/YYYY'));
});

Handlebars.registerHelper('ifEquals', function(v1, v2, options) {
    if (v1 == v2) return options.fn(this, options);
    return options.inverse(this, options);
});

/*--[ Run app ]--*/
$(init);