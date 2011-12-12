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
    },
    getByFromId: function(id, own) {
        own = !!own;
        return new TransactionCollection(
            this.filter(function(t) { return t.get('fromId') == id && (own? t.get('fromId') == t.get('toId') : true); })
        );
    },
    getByToId: function(id, own) {
        own = !!own;
        return new TransactionCollection(
            this.filter(function(t) { return t.get('toId') == id && (own? t.get('fromId') == t.get('toId') : true); })
        );
    },
    sum: function() {
        return this.reduce(function(u, v) { return u + v.get('amount'); }, 0);
    }
});

var TotalCollection = BaseCollection.extend({
    model: Total
});