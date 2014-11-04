/*
 * Handle URL paths and changes.
 */

define([
  'jQuery',
  'Underscore',
  'Backbone',
  'Spin',
  'mps',
  'rest',
  'util',
  'views/error',
  'views/header',
  'views/tabs',
  'views/footer',
  'views/signin',
  'views/signup',
  'views/forgot',
  'views/lists/notifications',
  'views/map',
  'views/profile',
  'views/rows/post',
  'views/rows/session',
  'views/rows/tick',
  'views/crag',
  'views/ascent',
  'views/settings',
  'views/reset',
  'views/films',
  'views/about',
  'views/privacy',
  'views/crags',
  'views/dashboard',
  'views/splash',
  'views/sessions',
  'views/ticks'
], function ($, _, Backbone, Spin, mps, rest, util, Error, Header, Tabs, Footer,
    Signin, Signup, Forgot, Notifications, Map, Profile, Post, Session, Tick, Crag, Ascent,
    Settings, Reset, Films, About, Privacy, Crags, Dashboard, Splash, Sessions,
    Ticks) {

  // Our application URL router.
  var Router = Backbone.Router.extend({

    initialize: function (app) {

      // Save app reference.
      this.app = app;
      
      // Clear the hashtag that comes back from facebook.
      if (window.location.hash !== '') {
        try {
          window.history.replaceState('', '', window.location.pathname
              + window.location.search);
        } catch (err) {}
      }

      // Page routes.
      this.route(':un', 'profile', this.profile);
      this.route(':un/:k', 'post', this.post);
      this.route('sessions/:k', 'session', this.session);
      this.route('ticks/:k', 'tick', this.tick);
      this.route('crags/:y', 'crag', this.crags);
      this.route('crags/:y/:g', 'crag', this.crag);
      this.route('crags/:y/:g/:t/:a', 'ascent', this.ascent);
      this.route('reset', 'reset', this.reset);
      this.route('settings', 'settings', this.settings);
      this.route('privacy', 'privacy', this.privacy);
      this.route('about', 'about', this.about);
      this.route('films', 'films', this.films);
      this.route('crags', 'crags', this.crags);
      this.route('ticks', 'ticks', this.ticks);
      this.route('sessions', 'sessions', this.sessions);
      this.route('signin', 'signin', this.signin);
      this.route('signup', 'signup', this.signup);
      this.route('', 'dashboard', this.dashboard);
      this.route('_blank', 'blank', function(){});

      // Save dom refs.
      this.folder = $('.folder');

      // Fullfill navigation request from mps.
      mps.subscribe('navigate', _.bind(function (path) {
        this.navigate(path, {trigger: true});
      }, this));

      // Show the forgot modal.
      mps.subscribe('modal/forgot/open', _.bind(function () {
        this.modal = new Forgot(this.app).render();
      }, this));

      // Init page spinner.
      this.spin = new Spin($('.page-spin'), {color: '#808080'});
    },

    routes: {

      // Catch all.
      '*actions': 'default'
    },

    render: function (service, data, secure, cb) {

      function _render(err, login) {

        // Render page elements.
        if (!this.header) {
          this.header = new Header(this.app).render();
        } else if (login) {
          this.header.render(true);
        }
        if (!this.map) {
          this.map = new Map(this.app).render();
        }
        if (!this.notifications && this.app.profile && this.app.profile.member) {
          this.notifications = new Notifications(this.app, {reverse: true});
        }

        // Callback to route.
        cb(err);
      }

      // Kill the page view if it exists.
      if (this.page) {
        this.page.destroy();
      }

      if (typeof service === 'function') {
        cb = service;
        return _render.call(this);
      }
      if (typeof data === 'function') {
        cb = data;
        data = {};
      }
      if (typeof secure === 'function') {
        cb = secure;
        secure = false;
      }

      // Check if a profile exists already.
      var query = this.app.profile
          && this.app.profile.notes ? {n: 0}: {};
      _.extend(query, data);

      // Get a profile, if needed.
      rest.get(service, query, _.bind(function (err, pro) {
        if (err) {
          this.page = new Error(this.app).render(err);
          this.stop();
        }
        if (secure && !pro.member) {
          return this.navigate('/', true);
        }

        // Set the profile.
        var login = this.app.update(pro || err);
        _render.call(this, err, login);

      }, this));
    },

    renderTabs: function (params) {
      if (this.tabs) {
        this.tabs.params = params || {};
        this.tabs.render();
      } else {
        this.tabs = new Tabs(this.app, params).render();
      }
    },

    start: function () {
      $(window).scrollTop(0);
      this.spin.target.show();
      this.spin.start();
    },

    stop: function () {
      this.spin.target.hide();
      this.spin.stop();
      $(window).scrollTop(0);
    },

    getEventActions: function () {
      var feed = store.get('feed') || {};
      return feed.actions || 'all';
    },

    // Routes //

    dashboard: function () {
      this.start();
      var query = {actions: this.getEventActions()};
      this.render('/service/dashboard.profile', query, _.bind(function (err) {
        if (err) return;
        if (this.app.profile.content.events) {
          this.page = new Dashboard(this.app).render();
          this.renderTabs({tabs: [
            {title: 'Activity', href: '/', active: true},
            {title: 'My Sessions', href: '/sessions'},
            {title: 'My Ticks', href: '/ticks'}
          ]});
        } else {
          this.page = new Splash(this.app).render();
          this.folder.addClass('landing');
        }
        this.stop();
        this.folder.removeClass('initial');
      }, this));
    },

    sessions: function () {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.render('/service/sessions.profile', _.bind(function (err) {
        if (err) return;
        this.page = new Sessions(this.app).render();
        this.stop();
      }, this));
      this.renderTabs({tabs: [
        {title: 'Activity', href: '/'},
        {title: 'My Sessions', href: '/sessions', active: true},
        {title: 'My Ticks', href: '/ticks'}
      ]});
    },

    ticks: function () {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.render('/service/ticks.profile', _.bind(function (err) {
        if (err) return;
        this.page = new Ticks(this.app).render();
        this.stop();
      }, this));
      this.renderTabs({tabs: [
        {title: 'Activity', href: '/'},
        {title: 'My Sessions', href: '/sessions'},
        {title: 'My Ticks', href: '/ticks', active: true}
      ]});
    },

    crags: function (country) {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      var query = {};
      if (country) query.country = country;
      var q = util.getParameterByName('q');
      if (q) query.query = q;
      this.render('/service/crags.profile', query, _.bind(function (err) {
        if (err) return;
        this.page = new Crags(this.app).render();
        this.stop();
      }, this));
      this.renderTabs({title: 'Crags'});
    },

    films: function () {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.render('/service/films.profile', _.bind(function (err) {
        if (err) return;
        this.page = new Films(this.app).render();
        this.stop();
      }, this));
      this.renderTabs({title: 'Films', subtitle: 'Original content by Island'});
    },

    about: function () {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.render('/service/static.profile', _.bind(function (err) {
        if (err) return;
        this.page = new About(this.app).render();
        this.stop();
      }, this));
      this.renderTabs({title: 'About', subtitle: 'What\'s going on here?'});
    },

    privacy: function () {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.render('/service/static.profile', _.bind(function (err) {
        if (err) return;
        this.page = new Privacy(this.app).render();
        this.stop();
      }, this));
      this.renderTabs({title: 'Privacy Policy', subtitle: 'Last updated 7.27.2013'});
    },

    settings: function () {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.render('/service/settings.profile', {}, true, _.bind(function (err) {
        if (err) return;
        this.page = new Settings(this.app).render();
        this.stop();
      }, this));
      this.renderTabs({title: 'Account Settings'});
    },

    reset: function () {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.render('/service/static.profile', _.bind(function (err) {
        if (err) return;
        this.page = new Reset(this.app).render();
        this.stop();
      }, this));
      this.renderTabs({title: 'Password reset'});
    },

    ascent: function (country, crag, type, ascent) {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.renderTabs();
      var key = [country, crag, type, ascent].join('/');
      var query = {actions: this.getEventActions()};
      this.render('/service/ascent.profile/' + key, query, _.bind(function (err) {
        if (err) return;
        this.page = new Ascent(this.app).render();
        this.renderTabs({html: this.page.title});
        this.stop();
      }, this));
    },

    crag: function (country, crag) {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.renderTabs();
      var key = [country, crag].join('/');
      var query = {actions: this.getEventActions()};
      this.render('/service/crag.profile/' + key, query, _.bind(function (err) {
        if (err) return;
        this.page = new Crag(this.app).render();
        this.renderTabs({html: this.page.title});
        this.stop();
      }, this));
    },

    session: function (key) {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.renderTabs();
      this.render('/service/session.profile/' + key, _.bind(function (err) {
        if (err) return;
        this.page = new Session({wrap: '.main'}, this.app).render(true);
        this.renderTabs({html: this.page.title});
        this.stop();
      }, this));
    },

    tick: function (key) {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.renderTabs();
      this.render('/service/tick.profile/' + key, _.bind(function (err) {
        if (err) return;
        this.page = new Tick({wrap: '.main'}, this.app).render(true);
        this.renderTabs({html: this.page.title});
        this.stop();
      }, this));
    },

    post: function (username, key) {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      var key = [username, key].join('/');
      this.renderTabs();
      this.render('/service/post.profile/' + key, _.bind(function (err) {
        if (err) return;
        this.page = new Post({wrap: '.main'}, this.app).render(true);
        this.renderTabs({html: this.page.title});
        this.stop();
      }, this));
    },

    profile: function (username) {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.renderTabs();
      var query = {actions: this.getEventActions()};
      this.render('/service/profile.profile/' + username, query,
          _.bind(function (err) {
        if (err) return;
        this.page = new Profile({wrap: '.main'}, this.app).render(true);
        this.renderTabs({html: this.page.title});
        this.stop();
      }, this));
    },

    signin: function () {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.render(_.bind(function (err) {
        if (err) return;
        this.page = new Signin(this.app).render();
        this.stop();
      }, this));
      this.renderTabs({title: 'Log In', subtitle: 'Welcome back'});
    },

    signup: function () {
      this.start();
      this.folder.removeClass('landing').removeClass('initial');
      this.render(_.bind(function (err) {
        if (err) return;
        this.page = new Signup(this.app).render();
        this.stop();
      }, this));
      this.renderTabs({title: 'Sign Up', subtitle: 'It\'s free'});
    },

    default: function () {
      this.folder.removeClass('landing').removeClass('initial');
      this.render(_.bind(function (err) {
        if (err) return;
        this.page = new Error(this.app).render({
          code: 404,
          message: 'Sorry, this page isn\'t available'
        });
      }, this));
      this.renderTabs();
    }
  
  });
  
  return Router;

});
