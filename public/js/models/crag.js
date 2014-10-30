/*
 * Crag model
 */

define([
  'Backbone',
  'util'
], function (Backbone, util) {
  return Backbone.Model.extend({

    grades: ['9c+', '9c', '9b+', '9b', '9a+', '9a', '8c+', '8c',
        '8b+', '8b', '8a+', '8a', '7c+', '7c', '7b+', '7b', '7a+', '7a',
        '6c+', '6c', '6b+', '6b', '6a+', '6a', '5c', '5b', '5a', '4', '3'],

    count: function (n) {
      return n !== 0 ? '~' + util.addCommas(n): 0;
    },

    tempFtoC: function(n) { return Math.floor((n - 32) * 5/9); },

    formatDescription: function () {
      var t = this.attributes;
      var str = '<span class="crag-verb">added the crag</span> *';
      var name = '<a href="/crags/' + t.key + '" class="title navigate">';
      name += '<i class="icon-location"></i> ' + t.name + '</a>';
      name += ' in <a href="/crags/' + t.key.substr(0,3) + '" class="title navigate">';
      name += t.country + '</a>';
      str = str.replace('*', name);
      return str;
    },

  });
});
