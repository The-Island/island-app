/*
 * D3 scatter chart of ticks vs time
 */

define([
  'jQuery',
  'Underscore',
  'Backbone',
  'mps',
  'rest',
  'util',
  'd3',
  'd3Tip'
], function ($, _, Backbone, mps, rest, util, d3, d3Tip) {

  var fadeTime = 150;
  var legend_dy = 40;

  var colors = {
    flash: '#b1ec36',
    redpoint: '#009cde',
    onsite: '#e8837b'
  };

  // Helper functions
  var getColor = function(tick) {
    if (tick.tries <= 1) { return colors.onsite; }
    else if (tick.tries > 1 && tick.tries <=2) { return colors.flash; }
    else { return colors.redpoint; }
  };


  return Backbone.View.extend({

    el: '.main',

    initialize: function (app, options) {

      this.app = app;
      this.prefs =  this.app.profile.member ? this.app.profile.member.prefs: this.app.prefs;
      this.options = options || {};
      this.$el = options.$el;
      this.subscriptions = [];
      this.on('rendered', this.setup, this);
    },

    setup: function () {
      return this;
    },

    render: function (width, height) {
      this.renderGraph();
      this.trigger('rendered');
      return this;
    },

    events: {

    },

    update: function(data, type) {
      var d = this._transposeData(data, type);
      this._updateGraph(d.ticks, d.gradeDomain);
    },

    renderGraph: function() {

      var self = this;

      // Static graph setup
      this.margin = {top: 60, right: 20, bottom: 80, left: 60};
      this.width = this.$el.width() - this.margin.left - this.margin.right;
      this.height = this.$el.height() - this.margin.top - this.margin.bottom;

      this.x = d3.time.scale()
          .range([0, this.width]);

      this.y = d3.scale.ordinal()
          .rangePoints([this.height, 0]);

      this.xAxis = d3.svg.axis()
          .scale(this.x)
          .orient('bottom');

      this.yAxis = d3.svg.axis()
          .scale(this.y)
          .orient('left')
          .tickSize(-this.width);

      // Create the baseline SVG
      this.svg = d3.select(this.$el.get(0)).append('svg')
          .attr('width', this.width + this.margin.left + this.margin.right)
          .attr('height', this.height + this.margin.top + this.margin.bottom)
          .append('g')
          .attr('transform', 'translate(' + this.margin.left
              + ',' + this.margin.top + ')');

      // Create the X axis
      this.svg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + this.height + ')')
          .call(this.xAxis);

      // Create the Y axis
      this.svg.append('g')
          .attr('class', 'y axis')
          .call(this.yAxis);

      this.svg.append('g')
          .attr('class', 'scatterGroup');

        // Create the legend
      var legendEntries = this.svg.append('g')
          .attr('class', 'legend')
          .selectAll('legendEntries')
          .data(d3.entries(colors))
          .enter()
          .append('g')
          .attr('class', 'legend-entry');

      legendEntries.append('rect')
          .attr('width', 10)
          .attr('height', 10)
          .attr('y', -10)
          .style('fill', function(d) { return d.value; })
          .style('opacity', 1);

      legendEntries.append('text')
          .text(function(d) { return d.key; })
          .attr('font-size', 12)
          .attr('x', 15);

      // Once legend is rendered move it to right spot
      legendEntries
          .attr('transform', function(d, idx) {
            var bboxw = this.getBBox().width;
            var entries = legendEntries[0].length;
            var locIdx = Math.ceil(idx - entries/2);
            var locX = (self.width/2) - (bboxw/2) + (locIdx*80);
            return 'translate(' + locX + ',' + (self.height + legend_dy) + ')';
          });

      // Create the tooltip
      this.tip = d3Tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            // Make a line that says '- redpoint

            var style;
            if (d.tries <= 1) { style = 'ONSITE'; }
            else if (d.tries > 1 && d.tries <=2) { style = 'FLASHED'; }
            else { style = 'REDPOINT'; }

            var html = '<strong style="font-size:1.4em">' 
                + d.ascent.name + ', ' + d.crag.name + '</strong></br>'
                + '<strong>a ' + d.grade + ' in ' + d.cragCountry + '</strong></br>'
                + '<strong style="color:' + getColor(d) + '">' + style + ' on '
                + new Date(d.date).format('longDate') + '</strong>';

            return html;
          });

      this.svg.call(this.tip);

    },

    _updateGraph: function(data, gradeDomain, immediate) {

      var self = this;

      // Handle x-axis
      this.x.domain(d3.extent(data, function(d) {
        return new Date(d.date)
      }).map(function(d, idx) {
        var months = 12;
        var blah = d.setDate(d.getDate() + months * 30 * ((idx % 2) === 0 ? -1 : 1));
        return blah;
      }));
      this.svg.selectAll('.x')
          .transition().duration(immediate ? 0 : fadeTime*2).ease("sin-in-out")
          .call(this.xAxis);

      // Handle y-axis
      this.y.domain(gradeDomain);
      this.svg.selectAll('.y')
          .call(this.yAxis);

      this.svg.selectAll('.y .tick')
          .style('opacity', 0.2);

      // Data join

      var scatterGraph = this.svg.selectAll('.circle')
          .data(data, function(d) { return d.id; });

      // Enter
      scatterGraph.enter()
          .append('circle')
          .attr('class', 'circle')

      // Update + Enter
      scatterGraph
          .on('mouseenter', this.tip.show)
          .on('mouseleave', this.tip.hide)
          .on('click', function(d) {
            var path = '/efforts/' + d.key;
            self.app.router.navigate(path, {trigger: true});
          });

      scatterGraph
          .attr('cx', function(d) { return self.x(new Date(d.date)); })
          .attr('cy', function(d) { return self.y(d.grade); })
          .attr('r', 8)
          .attr('fill', function(d) { return getColor(d); })
          .style('opacity', 0)
          .transition()
          .delay(immediate ? 0 : fadeTime)
          .duration(immediate ? 0 : fadeTime)
          .style('opacity', .4);

      // Exit
      scatterGraph
          .exit()
          .transition()
          .duration(fadeTime)
          .style('opacity', 0)
          .remove();

    },

    _transposeData: function(ticks, type) {

      var gradeConverter = this.app.gradeConverter[type];
      var system = type === 'r' ? this.prefs.grades.route : this.prefs.grades.boulder;

      var ticksFiltered = _.filter(ticks, function(t) { return t && t.grade; });

      // Get range of grades
      var gradeExtent = d3.extent(ticksFiltered, function(t) { return t.grade; });

      // Get grade of each array entry
      var ticksMapped = _.map(ticksFiltered, function(t, idx) {
        t =  _.clone(t);
        t.grade = gradeConverter.indexes(t.grade, null, system);
        return t;
      });

      // We show lower grades than the climber has completed to give
      // a sense of accomplishment. However, don't go too low or the xaxis
      // gets crowded
      var lowerGrade = Math.max(0, gradeExtent[0] - 4);

      // Get grade domain for this graph
      var gradeDomain = _.chain(d3.range(lowerGrade, gradeExtent[1] + 1))
          .map(function(g) {
            return gradeConverter.indexes(g, null, system);
           })
          .unique()
          .value();

      return {ticks: ticksMapped, gradeDomain: gradeDomain };

    },

    empty: function () {
      this.$el.empty();
      return this;
    },

    destroy: function () {
      _.each(this.subscriptions, function (s) {
        mps.unsubscribe(s);
      });

      this.watchers.destroy();
      this.undelegateEvents();
      this.stopListening();
      this.empty();
    },

  });
});
