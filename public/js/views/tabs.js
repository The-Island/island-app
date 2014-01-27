/*
 * Page view for the about page.
 */

define([
  'jQuery',
  'Underscore',
  'Backbone',
  'util',
  'mps',
  'text!../../templates/tabs.html'
], function ($, _, Backbone, mps, util, template) {

  return Backbone.View.extend({

    // The DOM target element for this page.
    el: '.tabs',

    // Module entry point.
    initialize: function (app, params) {
      this.app = app;
      this.params = params || {};

      // Shell events.
      this.on('rendered', this.setup, this);

      // Client-wide subscriptions.
      this.subscriptions = [];
    },

    // Draw our template from the profile JSON.
    render: function () {
      if (!this.params.tabs) this.params.tabs = [];

      // Render or activate tabs.
      if (!this.params.tabs || this.params.tabs.length === 0)
        this.empty();
      var tabs = this.$('.tab');
      if (tabs.length === 0) {
        this.template = _.template(template);
        this.$el.html(this.template.call(this));
      } else {
        var i = -1;
        _.find(this.params.tabs, function (t) {
          ++i;
          return t.active;
        });
        tabs.removeClass('active');
        this.$('.tab:eq(' + i + ')').addClass('active');
      }

      // Done rendering ... trigger setup.
      this.trigger('rendered');

      return this;
    },

    // Bind mouse events.
    events: {
      'click .navigate': 'navigate',
    },

    // Misc. setup.
    setup: function () {
      return this;
    },

    // Similar to Backbone's remove method, but empties
    // instead of removes the view's DOM element.
    empty: function () {
      this.$el.empty();
      return this;
    },

    // Kill this view.
    destroy: function () {
      _.each(this.subscriptions, function (s) {
        mps.unsubscribe(s);
      });
      this.undelegateEvents();
      this.stopListening();
      this.empty();
    },

    navigate: function (e) {
      e.preventDefault();

      // Route to wherever.
      var path = $(e.target).closest('a').attr('href');
      if (path)
        this.app.router.navigate(path, {trigger: true});
    },

  });
});
