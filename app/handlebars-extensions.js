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

Handlebars.registerHelper('ifGreater', function(v1, v2, options) {
    if (parseFloat(v1, 10) > parseFloat(v2, 10)) return options.fn(this, options);
    return options.inverse(this, options);
});