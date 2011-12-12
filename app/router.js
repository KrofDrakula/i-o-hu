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
        'totals'                  : 'totals',
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
    },
    totals: function() {
        var totals = new TotalCollection();
        totals.comparator = function(t) { return t.get('gave') - t.get('received'); };
        App.people.each(function(p) {
            var gave = App.transactions.getByFromId(p.id).sum();
            var received = App.transactions.getByToId(p.id).sum();
            totals.add({
                person   : p.toJSON(),
                gave     : gave,
                received : received,
                owes     : gave < received,
                net      : Math.abs(gave - received)
            });
        });
        new TotalsView({
            collection : totals,
            el         : this._getViewContainer()
        }).render();
    }
});