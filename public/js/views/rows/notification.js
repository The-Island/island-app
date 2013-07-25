/*
 * Notification Row view
 */

define([
  'jQuery',
  'Underscore',
  'views/boiler/row',
  'mps',
  'rpc',
  'text!../../../templates/rows/notification.html'
], function ($, _, Row, mps, rpc, template) {
  return Row.extend({

    attributes: function () {
      return _.defaults({class: this.model.get('read') ?
          'notification': 'notification unread'},
          Row.prototype.attributes.call(this));
    },

    initialize: function (options, app) {
      this.app = app;
      this.template = _.template(template);
      Row.prototype.initialize.call(this, options);
    },

    events: {
      'hover': 'read',
      'click': 'navigate',
      'click .info-delete': 'delete',
    },

    read: function (e) {
      e.preventDefault();
      if (!this.$el.hasClass('unread')) return;
      rpc.put('/api/notifications/read/' + this.model.id, {});
      this.update();
    },

    update: function () {
      this.$el.removeClass('unread');
      this.model.set('read', true);
    },

    delete: function (e) {
      e.preventDefault();
      rpc.delete('/api/notifications/' + this.model.id, {});
      this.parentView._remove({id: this.model.id});
    },

    navigate: function (e) {
      e.preventDefault();
      if ($(e.target).hasClass('info-delete')) return;
      var path = this.model.get('event').data.target.s;
      if (path) mps.publish('navigate', [path]);
      return false;
    },

    _remove: function (cb) {
      this.$el.slideUp('fast', _.bind(function () {
        clearInterval(this.timer);
        this.destroy();
        cb();
      }, this));
    },

  });
});
