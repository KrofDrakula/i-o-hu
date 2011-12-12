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
    },

    cancelEvent: function(ev) { return false; }
});

var ActivityListView = BaseView.extend({
    templateName: 'activity-list',

    constructor: function(options) {
        this.__parent(this, arguments);
        this.filter = options.filter;
    },

    events: {
        'change input[type=search]' : 'updateFilter'
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
        'submit form': 'save'
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
        'submit form': 'save'
    },

    save: function(ev) {
        ev.preventDefault();
        this.model.set({ name: this.$('[name=name]').val(), avatar: this.$('[name=avatar]').val() });
        this.trigger('update');
    }
});

var TotalsView = BaseView.extend({
    templateName: 'totals'
});
