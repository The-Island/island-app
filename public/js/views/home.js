/*
 * Page view for home.
 */

define([
  'jQuery',
  'Underscore',
  'Backbone',
  'mps',
  'rpc',
  'util',
  'text!../../templates/home.html',
  'views/lists/posts',
  'views/lists/events'
], function ($, _, Backbone, mps, rpc, util, template, Posts, Events) {

  return Backbone.View.extend({

    // The DOM target element for this page:
    el: '.main',

    // Module entry point:
    initialize: function (app) {

      // Save app reference.
      this.app = app;

      // Shell events:
      this.on('rendered', this.setup, this);

      // Client-wide subscriptions
      this.subscriptions = [];
    },

    // Draw our template from the profile JSON.
    render: function () {

      // Set page title
      this.app.title('Climb');

      // UnderscoreJS rendering.
      this.template = _.template(template);
      this.$el.html(this.template.call(this));

      // Done rendering ... trigger setup.
      this.trigger('rendered');

      return this;
    },

    // Bind mouse events.
    events: {
      'click .session-button': 'session',
    },

    // Misc. setup.
    setup: function () {

      // Render lists.
      this.posts = new Posts(this.app, {parentView: this,
            reverse: true, input: true});
      this.events = new Events(this.app, {parentView: this, reverse: true});

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
      this.posts.destroy();
      this.events.destroy();
      this.undelegateEvents();
      this.stopListening();
      this.empty();
    },

    session: function (e) {
      e.preventDefault();

      // Render the session view.
      mps.publish('member/session/open');
    },

  });
});
