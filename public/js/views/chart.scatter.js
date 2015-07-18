/*
 * D3 scatter chart of ticks vs time
 * SVG is organized into 4 quadrants.
 * There is no padding between the left and right quadrants
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

  return Backbone.View.extend({

    el: '.main',

    fadeTime: 300,
    legend_dy: 40,
    leftWidthFrac: 0.15,
    vertInnerPad: 20,
    scatterOpacity: .4,
    colors: {
      flash: '#b1ec36',
      redpoint: '#009cde',
      onsite: '#e8837b',
      average: '#333'
    },

    initialize: function (app, options) {

      this.app = app;
      this.prefs =  this.app.profile.member
          ? this.app.profile.member.prefs: this.app.prefs;
      this.options = options || {};
      this.$el = options.$el;
      this.subscriptions = [];

      this.mouse = { which: 'right'};

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

    // call with tick data and type ('r' or 'b') for routes or boulders
    update: function(data, type, options) {
      options = options || { immediate: false };
      this.d = this._transposeData(data, type);
      this._resetSliders();
      this._updateGraph(this.d.ticks, this.d.gradeDomain, this.d.timeDomain,
          options.immediate);
    },

    // Create the static graph elements
    renderGraph: function() {

      var self = this;

      // Static graph setup
      this.margin = {top: 60, right: 0, bottom: 20, left: 0};
      this.width = this.$el.width() - this.margin.left - this.margin.right;
      this.height = this.$el.height() - this.margin.top - this.margin.bottom;

      // Create the baseline SVG
      var svg = d3.select(this.$el.get(0)).append('svg')
          .attr('width', this.$el.width())
          .attr('height', this.$el.height())

      // Generate widths and heights for the container classes
      this.lwidth = (this.$el.width() - this.margin.left - this.margin.right)
          * this.leftWidthFrac;
      this.rwidth = this.lwidth;
      this.mwidth = (this.$el.width() - this.margin.left - this.margin.right)
          * (1 - this.leftWidthFrac) - this.rwidth;
      this.bheight = 40
      this.theight = this.$el.height() - this.margin.top - this.margin.bottom
          - this.vertInnerPad - this.bheight;

      // Generate the 4 quadrant container classes
      this.ltSvg = svg.append('g')
          .attr('transform', 'translate(' + this.margin.left + ','
              + this.margin.top + ')');

      this.mtSvg = svg.append('g')
          .attr('transform', 'translate(' + (this.margin.left + this.lwidth) + ','
              + this.margin.top + ')');

      this.rtSvg = svg.append('g')
          .attr('transform', 'translate(' + (this.margin.left + this.lwidth
              + this.mwidth) + ',' + this.margin.top + ')');

      var btop = this.margin.top + this.theight + this.vertInnerPad;
      /*
      this.lbSvg = svg.append('g')
          .attr('transform', 'translate(' + this.margin.left + ','
              + btop + ')');

      this.rbSvg = svg.append('g')
          .attr('transform', 'translate(' + (this.margin.left + this.lwidth) + ','
              + btop + ')');
      */
      this.rbSvg = svg.append('g')
          .attr('transform', 'translate(' + (this.margin.left + this.lwidth) + ','
              + btop + ')');

      // Scales

      this.x = d3.time.scale()
          .range([0, this.mwidth]);

      // for bar count
      this.x2 = d3.scale.linear()
          .range([0, this.lwidth]);

      this.y = d3.scale.ordinal()
          .rangeRoundBands([this.theight, 0], 0.25);

      this.xAxis = d3.svg.axis()
          .scale(this.x)
          .orient('bottom')
          .ticks(6, '')
          .tickSize(-this.theight);

      this.yAxis = d3.svg.axis()
          .scale(this.y)
          .orient('right')
          //.tickSize(0);
          //.tickSize(-this.mwidth);

      this.ltSvg.append('text')
          .attr('x', this.lwidth/2)
          .attr('y', -10)
          .text('ascents')
          .style('text-anchor', 'middle')
          .style('font-size', 14)

      this.mtSvg.append('text')
          .attr('x', this.mwidth/2)
          .attr('y', -10)
          .text('ascents by time')
          .style('text-anchor', 'middle')
          .style('font-size', 14)


      this.mtSvg.append('clipPath')
          .attr('id', 'clip')
          .append('rect')
          .attr('x', 10)
          .attr('y', -10)
          .attr('width', this.mwidth - 10)
          .attr('height', this.theight + 10)
          .attr('fill', 'blue');

      // Create the X axis
      this.mtSvg.append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + this.theight + ')')
          .style('stroke-dasharray', ('4, 4'))
          .style('stroke-opacity', .2)
          //.call(this.xAxis);

/*
      this.mtSvg.append('line')
          .attr('x1', this.mwidth)
          .attr('x2', this.mwidth)
          .attr('y1', 0)
          .attr('y2', this.theight)
          .style('stroke-width', '1px')
          .style('stroke', '#333')
*/

      this.mtSvg.append('line')
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', 0)
          .attr('y2', this.theight)
          .style('stroke-width', '1px')
          .style('stroke', '#333')

/*
      this.ltSvg.append('line')
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', 0)
          .attr('y2', this.theight)
          .style('stroke-width', 1)
          .style('stroke', '#333')
          .style('stroke-dasharray', ('4, 4'))
          */

      var barGroup = this.ltSvg.append('g')
          .attr('class', 'barGroup')

      // Create the Y axis
      this.mtSvg.append('g')
          .attr('class', 'y axis')
          .call(this.yAxis);

      this.mtSvg.append('g')
          .attr('class', 'scatterGroup')
          .attr('clip-path', 'url(#clip)');

      this.mtSvg.append('g')
          .attr('class', 'lineGroup')
          .attr('clip-path', 'url(#clip)');

      this.mtSvg.append('g')
          .attr('class', 'hoverGroup')


      // Slider

      this.slider = this.rbSvg.append('g')
          .attr('class', 'slider')

      this.slider.on('mousedown', function() {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        var pos = d3.mouse(this);
        var sl = Number(self.sliderLeft.attr('x'));
        var sr = Number(self.sliderRight.attr('x'));
        if (pos[0] > (sr + sl) / 2) {
          var newPos = sr + (self.mwidth/12 * (pos[0] > sr ? 1 : -1));
          self.updateRightSlider(newPos, false);
        } else {
          var newPos = sl + (self.mwidth/12 * (pos[0] > sl ? 1 : -1));
          self.updateLeftSlider(newPos, false);
        }
      });

      this.sliderBar = this.slider.append('rect')
          .attr('class', 'slider-bar')
          .attr('rx', 6)
          .attr('width', this.mwidth)
          .attr('height', 10)
          .style('fill', 'grey')

      this.sliderHighlight = this.slider.append('rect')
          .attr('class', 'slider-highlight')
          .attr('width', this.mwidth)
          .attr('height', this.sliderBar.attr('height'))
          .style('fill', this.colors.redpoint)

      this.sliderLeft = this.slider.append('rect')
          .attr('class', 'slider-left')
          .attr('y', -this.sliderBar.attr('height')/2)
          .attr('width', 10)
          .attr('height', this.sliderBar.attr('height')*2)
          .attr('rx', 2)
          .attr('ry', 2)
          .style('fill', '#333')
          .style('cursor', 'pointer')
          .on('mousedown', function(d) {
            self.startMove('left')
          })

      this.sliderRight = this.slider.append('rect')
          .attr('class', 'slider-right')
          .attr('x', this.mwidth-10)
          .attr('y', -this.sliderBar.attr('height')/2)
          .attr('width', 10)
          .attr('height', this.sliderBar.attr('height')*2)
          .attr('rx', 2)
          .attr('ry', 2)
          .style('fill', '#333')
          .style('cursor', 'pointer')
          .on('mousedown', function(d) {
            self.startMove('right')
          })

      d3.select('body')
          .on('mousemove', function() {
            d3.event.preventDefault();
            d3.event.stopPropagation();
            if (self.mouse.moving) {
              if (self.mouse.which === 'right') {
                self.updateRightSlider(d3.mouse(self.sliderRight.node())[0], true);
              } else {
                self.updateLeftSlider(d3.mouse(self.sliderLeft.node())[0], true);
              }
            }
          })
          .on('mouseup', _.bind(self.endMove, self));



      // Create a line generator function
      this.line = d3.svg.line()
          .x(function(d) { return self.x(new Date((+d.key + 1).toString())); })
          .y(function(d) { return self.y(d.value.avg) + self.y.rangeBand()/2; })
          .interpolate('linear')

      // Create the legend
      var legendEntries = this.rtSvg.append('g')
          .attr('class', 'legend')
          .attr('transform', 'translate(30, 50)')
          .selectAll('legendEntries')
          .data(d3.entries(this.colors))
          .enter()
          .append('g')
          .attr('class', 'legend-entry')
          .attr('transform', function(d, idx) {
            return 'translate(' + 0 + ',' + (idx*30) + ')';
          });

      legendEntries.append('circle')
          .attr('r', 8)
          .style('fill', function(d) { return d.value; })
          .style('opacity', 1)
          .on('mouseenter', function(d) {
            d3.selectAll('.fadeable:not(.' + d.key +')')
                .transition().duration(300)
                .style('opacity', .1)
            d3.selectAll('.tickCircle.' + d.key)
                .transition().duration(300)
                .style('opacity', .8)
          })
          .on('mouseleave', function(d) {
            d3.selectAll('.fadeable')
                .transition().duration(300)
                .style('opacity', 1)
            d3.selectAll('.tickCircle')
                .transition().duration(300)
                .style('opacity', self.scatterOpacity)
          })

      legendEntries.append('text')
          .text(function(d) { return d.key; })
          .attr('font-size', 12)
          .attr('x', 15)
          .attr('y', 4)

      // Create the tooltip
      this.scatterTip = d3Tip()
          .attr('class', 'd3-tip')
          .offset([-20, 0])
          .html(function(d) {
            // Make a line that says '- redpoint

            var style;
            if (d.tries <= 1) { style = 'ONSITE'; }
            else if (d.tries > 1 && d.tries <=2) { style = 'FLASHED'; }
            else { style = 'REDPOINT'; }

            var html = '<strong style="font-size:1.4em">' 
                + d.ascent.name + ', ' + d.crag.name + '</strong></br>'
                + '<strong>a ' + d.grade + ' in ' + d.crag.country+ '</strong></br>'
                + '<strong style="color:' + self.colors[self._getStyle(d)]
                + '">' + style + ' on ' + new Date(d.date).format('longDate')
                + '</strong>';

            return html;
          })

      var makeLine = function(count, style) {
        if (count === 0) return '';
        var noun = style;
        if (count !== 1) {
          switch (style) {
            case 'redpoint': { noun = 'redpoints'; break; }
            case 'flash': { noun = 'flashes'; break; }
            case 'onsite': {  noun = 'onsites'; break; }
          }
        }
        var html =
        '<div style="position:relative;top:1px;width:10px;'
            + 'height:10px;display:inline-block;'
            + 'background-color:' + self.colors[style] + '"></div>'
        + '<span style=color:' + self.colors[style] + '>&nbsp&nbsp'
            + count  + ' ' + noun + '</span>'
        + '</br>';
        return html;
      };

      this.barTip = d3Tip()
          .attr('class', 'd3-tip')
          .offset([-20, 0])
          .html(function(d) {
            var sends = d.value.total > 1 ? ' SENDS' : ' SEND';
            var html = '<strong style="font-size:1.4em">' + d.key + '</strong></br>'
                + '<strong>' + d.value.total + sends + '</strong>'
                + '</br>'
                + makeLine(d.value.onsite, 'onsite')
                + makeLine(d.value.flash, 'flash')
                + makeLine(d.value.redpoint, 'redpoint')

            return html;
          });

      this.avgTickCircleTip = d3Tip()
          .attr('class', 'd3-tip')
          .offset([-20, 0])
          .html(function(d) {
            // Sort by date
            var sends = d.value.total > 1 ? ' SENDS' : ' SEND';
            var html = '<strong style="font-size:1.4em">' + d.key + '</strong></br>'
                + 'averaging <strong>' + d.value.avg + '</strong>'
                + '</br>'
                + makeLine(d.value.onsite, 'onsite')
                + makeLine(d.value.flash, 'flash')
                + makeLine(d.value.redpoint, 'redpoint')
            return html;
          });

      this.ltSvg.call(this.barTip);
      this.mtSvg.call(this.avgTickCircleTip);
      this.mtSvg.call(this.scatterTip);

    },

    startMove: function(which) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
      this.mouse.moving = true;
      this.mouse.which = which;
      return false;
    },

    endMove: function() {
      d3.event.preventDefault();
      d3.event.stopPropagation();
      this.mouse.moving = false;

      return false;
    },

    recalculateTimeDomain: function(immediate) {
      var extent = this.d.timeDomain[1] - this.d.timeDomain[0]
      var l = Number(this.sliderLeft.attr('x')) / this.mwidth;
      var r = Number(this.sliderRight.attr('x')) / this.mwidth;

      var newDomain = [this.d.timeDomain[0] + extent * l,
          this.d.timeDomain[1] - extent * (1-r)];

      this._updateXDomain(newDomain, null, immediate);
    },

    updateSliderHighlight: function() {
      this.sliderHighlight.attr('x', this.sliderLeft.attr('x'));
      this.sliderHighlight.attr('width', this.sliderRight.attr('x')
          - this.sliderLeft.attr('x'))
    },

    updateRightSlider: _.debounce(function(newPos, immediate) {
      var xMax = this.mwidth;
      var xMin = Number(this.sliderLeft.attr('x'))
          + Number(this.sliderLeft.attr('width'));
      var x = Math.min(newPos, xMax);
      x = Math.max(x, xMin);
      this.sliderRight.attr('x', x);
      this.updateSliderHighlight();
      this.recalculateTimeDomain(immediate);
    }, 2),

    updateLeftSlider: _.debounce(function(newPos, immediate) {
      var xMin = 0;
      var xMax = Number(this.sliderRight.attr('x'))
          - Number(this.sliderLeft.attr('width'));
      var x = Math.max(newPos, xMin);
      x = Math.min(x, xMax);
      this.sliderLeft.attr('x', x);
      this.updateSliderHighlight();
      this.recalculateTimeDomain(immediate);
    }, 2),

    _resetSliders: function() {
      this.sliderLeft.transition().duration(500).attr('x', 0);
      this.sliderRight.transition().duration(500).attr('x', this.mwidth);
      this.sliderHighlight.transition().duration(500)
          .attr('x', 0).attr('width', this.mwidth);

    },

    _updateAvgTickData: function(data, domain) {
      dataByYear = {};
      _.each(data, function(t) {
        var year = new Date(t.date).getFullYear();
        if (!dataByYear[year]) dataByYear[year] = [];
        dataByYear[year].push(t);
      });

      _.each(dataByYear, function(val, key) {
        var sums = _.reduce(val, function(m, v) {
          var next = {}
          next.avg = m.avg + domain.indexOf(v.grade);
          next.redpoint = m.redpoint
              + (_.isUndefined(v.tries) || v.tries >= 3);
          next.flash = m.flash +(v.tries > 1 && v.tries < 3);
          next.onsite = m.onsite +(v.tries <= 1)
          return next;
        }, {avg: 0, redpoint: 0, flash: 0, onsite: 0});
        var avg = Math.floor(sums.avg / val.length);
        avg = domain[avg];
        sums.avg = avg;
        dataByYear[key] = sums;
        sums.total = sums.redpoint + sums.flash + sums.onsite;
      });

      var atd = d3.entries(dataByYear);
      return _.initial(_.sortBy(atd, 'key'))
    },

    _updateBarGraphData: function(data, filter) {

      var bgd = _.chain(data)
          .filter(filter ? filter : function() { return true; })
          .groupBy('grade')
          .value();

      _.each(bgd, function(v, k) {
        bgd[k] = {
          flash: _.reduce(v, function(m, val) {
            return +(val.tries > 1 && val.tries < 3) + m;
          }, 0),
          redpoint: _.reduce(v, function(m, val) {
            return +(_.isUndefined(val.tries) || val.tries >= 3) + m;
          }, 0),
          onsite: _.reduce(v, function(m, val) {
            return +(val.tries <= 1) + m;
          }, 0),
          total: v.length
        }
      });
      bgd = d3.entries(bgd);

      return bgd;

    },

    // pass data or the function will grab it from the scatter plot
    _updateXDomain: function(xDomain, data, immediate) {
      var self = this;

      this.x.domain(xDomain)
      this.mtSvg.selectAll('.x')
          //.call(this.xAxis);

      var lineGroup = this.mtSvg.select('.lineGroup');
      var avgTickLine = lineGroup.selectAll('.avgGradeLine');
      var avgTickCircle = lineGroup.selectAll('.avgGradeCircle');
      var scatterGraph = this.mtSvg.select('.scatterGroup').selectAll('.tickCircle');

      scatterGraph
          .transition().duration(immediate ? 0 : 200)
          .attr('cx', function(d) { return self.x(new Date(d.date)); })
      avgTickCircle
          .transition().duration(immediate ? 0 : 200)
          .attr('cx', function(d) { return self.x(new Date((+d.key + 1).toString())); })
      avgTickLine
          .transition().duration(immediate ? 0 : 200)
          .attr('d', this.line)

      // use data from scatter graph for bar graph
      var filt = function(d) {
        var d = new Date(d.date).valueOf();
        return (d >= xDomain[0] && d <= xDomain[1]);
      }
      var bgd = this._updateBarGraphData(data || scatterGraph.data(), filt);

      //this.x2.domain([0, d3.max(bgd, function(d) { return d.value.total })]);
      var barGraph = this.ltSvg.select('.barGroup').selectAll('.bars')
          .data(bgd, function(d) { return d.key; })

      var barGroupEnter = barGraph
          .enter()
          .append('g')
          .attr('class', 'bars');

      barGroupEnter.append('rect').attr('class', 'bar-onsite onsite fadeable');
      barGroupEnter.append('rect').attr('class', 'bar-flash flash fadeable');
      barGroupEnter.append('rect').attr('class', 'bar-redpoint redpoint fadeable');

      barGraph
          .attr('transform', function(d) {
            return 'translate(0,' + self.y(d.key) + ')'
          })
          // Note: D3 children do not inherit their parents data without
          // an explicit select. This code below achieves this for each group.
          .each(function(d) {
            var d3this = d3.select(this);
            d3this.select('.bar-onsite');
            d3this.select('.bar-redpoint');
            d3this.select('.bar-flash');
          });

      barGraph.selectAll('.bar-onsite')
          .attr('height', this.y.rangeBand())
          .attr('x', function(d) {
            return self.lwidth - self.x2(d.value.onsite)
          })
          .attr('width', function(d) {
            return self.x2(d.value.onsite)
          })
          .style('fill', this.colors.onsite)

      barGraph.selectAll('.bar-flash')
          .attr('height', this.y.rangeBand())
          .attr('x', function(d) {
              return self.lwidth - self.x2(d.value.onsite + d.value.flash)
           })
          .attr('width', function(d) {
              return self.x2(d.value.flash)
           })
          .style('fill', this.colors.flash)

      barGraph.selectAll('.bar-redpoint')
          .attr('height', this.y.rangeBand())
          .attr('x', function(d) {
              return self.lwidth - self.x2(d.value.redpoint
                  + d.value.flash + d.value.onsite)
           })
          .attr('width', function(d) {
              return self.x2(d.value.redpoint)
           })
          .style('fill', this.colors.redpoint)

      barGraph
          .exit()
          .remove();

      barGraph
          .on('mouseenter', this.barTip.show)
          .on('mouseleave', this.barTip.hide)
    },

    _updateGraph: function(data, yDomain, xDomain, immediate) {

      var self = this;

      // Set axis domains
      this.y.domain(yDomain);
      this.x.domain(xDomain);

      // Create some data for graphing
      var bgd = this._updateBarGraphData(data)
      var atd = this._updateAvgTickData(data, yDomain)

      this.x2.domain([0, d3.max(bgd, function(d) { return d.value.total })]);

      // Create y-axis

      this.mtSvg.selectAll('.y')
          .call(this.yAxis);

      this.mtSvg.selectAll('.x')
          .transition().duration(immediate ? 0 : this.fadeTime*2).ease('sin-in-out')
          //.call(this.xAxis);

      // Update slider

      // Slider ticks
      var years = d3.time.year.range(new Date(xDomain[0]), new Date(xDomain[1] + 1));
      this.slider.select('.sliderTicks').remove();
      var sliderTicks = this.slider.append('g').attr('class', 'sliderTicks');
      var sbh = Number(this.sliderBar.attr('height'));
      _.each(years, function (y, idx) {
        //if (idx != 0 && idx != years.length-1) {
          sliderTicks.append('line')
              .attr('x1', self.x(y))
              .attr('x2', self.x(y))
              .attr('y1', sbh/2)
              .attr('y2', sbh*1.5)
              .style('stroke', '#333')
        //}
        sliderTicks.append('text')
            .text(new Date(y).format('yyyy'))
            .attr('x', self.x(y))
            .attr('y', sbh+15)
            .style('text-anchor', 'middle')
            .style('fill', '#999')
            .style('font-size', 10)
      });


      // Build bar graph
      this._updateXDomain(xDomain, data, immediate)

      // Data joins

      var scatterGraph = this.mtSvg.select('.scatterGroup').selectAll('.tickCircle')
          .data(data, function(d) { return d.id; });

      var lineGroup = this.mtSvg.select('.lineGroup')
          .style('opacity', '.8');

      // Showing one point on a line graph is sort of pointless
      if (atd.length <= 1) atd = [];

      var avgTickLine = lineGroup
          .selectAll('.avgGradeLine')
          .data([atd]); // note single array makes only one line element

      var avgTickCircle = lineGroup
          .selectAll('.avgGradeCircle')
          .data(atd);

      // Enter

      scatterGraph.enter()
          .append('circle')

      avgTickLine.enter()
          .append('path')
          .attr('class', 'avgGradeLine average fadeable')

      avgTickCircle.enter()
          .append('circle')
          .attr('class', 'avgGradeCircle average fadeable')

      // Update + Enter



      scatterGraph
          .attr('cx', function(d) { return self.x(new Date(d.date)); })
          .attr('cy', function(d) { return self.y(d.grade) + self.y.rangeBand()/2; })
          .attr('r', 8)
          .attr('class', function(d) { return 'tickCircle fadeable ' + self._getStyle(d)} )
          .attr('fill', function(d) { return self.colors[self._getStyle(d)]; })
          .style('opacity', 0)
          .transition()
          .delay(immediate ? 0 : this.fadeTime)
          .duration(immediate ? 0 : this.fadeTime)
          .style('opacity', self.scatterOpacity)
          .style('cursor', 'pointer')

      avgTickLine.attr('d', this.line)
          .style('fill', 'none')
          .style('stroke', this.colors.average)
          .style('stroke-width', '2px')
          .style('stroke-opacity', 0)
          .transition()
          .delay(immediate ? 0 : this.fadeTime)
          .duration(immediate ? 0 : this.fadeTime)
          .style('stroke-opacity', 1);

      avgTickCircle
          .attr('cx', function(d) { return self.x(new Date((+d.key + 1).toString())); })
          .attr('cy', function(d) { return self.y(d.value.avg) + self.y.rangeBand()/2; })
          .attr('r', 6)
          .style('fill', this.colors.average)
          .style('opacity', 0)
          .transition()
          .delay(immediate ? 0 : this.fadeTime)
          .duration(immediate ? 0 : this.fadeTime)
          .style('opacity', 1);
/*
        setInterval(_.bind(function() {
          this.mtSvg.select('.scatterGroup').selectAll('.tickCircle')
              .transition().duration(1500).ease('linear')
              .attr('cx', function(d) { return self.x(new Date(d.date)) + (Math.random() - .5) * 5; })
              .attr('cy', function(d) { return self.y(d.grade) + (Math.random() - .5) * 5; })
        }, this), 1500)
*/

      // Exit



      scatterGraph
          .exit()
          .transition()
          .duration(this.fadeTime)
          .style('opacity', 0)
          .remove();

      avgTickCircle
          .exit()
          .transition()
          .duration(this.fadeTime)
          .style('opacity', 0)
          .remove();

      avgTickLine
          .exit()
          .transition()
          .duration(this.fadeTime)
          .style('stroke-opacity', 0)
          .remove();


      // Events

      scatterGraph
          .on('mouseenter', function(d) {
            d3.select(this)
                .attr('r', 12)
                .style('opacity', 1);
            self.scatterTip.show(d);
          })
          .on('mouseleave', function(d) {
            d3.select(this)
                .attr('r', 8)
                .style('opacity', .4);
            self.scatterTip.hide(d);
          })
          .on('click', function(d) {
            var path = '/efforts/' + d.key;
            self.app.router.navigate(path, {trigger: true});
          });

      avgTickCircle
          .on('mouseenter', function(d) {
            d3.select(this).attr('r', 9)
            self.avgTickCircleTip.show(d);
          })
          .on('mouseleave', function(d) {
            d3.select(this).attr('r', 6)
            self.avgTickCircleTip.hide(d);
          })


    },

    // Convert incoming tick data to D3 suitable data
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
      var lowerGrade = gradeConverter.indexes(gradeExtent[0], null, system);
      var higherGrade = gradeConverter.indexes(gradeExtent[1], null, system);

      lowerGrade = gradeConverter.offset(lowerGrade, -3, system);
      higherGrade = gradeConverter.offset(higherGrade, 1, system);

      gradeDomain = gradeConverter.range(lowerGrade, higherGrade, system);

      // Group ticks by year
      dataByYear = [];
      _.each(ticksFiltered, function(t) {
        var year = new Date(t.date).getFullYear();
        if (!dataByYear[year]) dataByYear[year] = [];
        dataByYear[year].push(t);
      });

      var timeDomain = d3.extent(ticksMapped, function(d) { return d.date; });
      timeDomain[0] = d3.time.year.floor(new Date(timeDomain[0]));
      timeDomain[0] = d3.time.month.offset(timeDomain[0], -6).valueOf();
      timeDomain[1] = d3.time.year.ceil(new Date(timeDomain[1]));
      timeDomain[1] = d3.time.month.offset(timeDomain[1], 6).valueOf();

      return {
        ticks: ticksMapped,
        gradeDomain: gradeDomain,
        timeDomain: timeDomain
      };
    },

    _getStyle: function(tick) {
      if (tick.tries <= 1) { return 'onsite'; }
      else if (tick.tries > 1 && tick.tries <=2) { return 'flash'; }
      else { return 'redpoint'; }
    },

    empty: function () {
      this.$el.empty();
      return this;
    },

    destroy: function () {
      _.each(this.subscriptions, function (s) {
        mps.unsubscribe(s);
      });

      d3.select('body')
          .on('mousemove', null)
          .on('mouseup', null);

      this.undelegateEvents();
      this.stopListening();
      this.empty();
    },

  });
});
