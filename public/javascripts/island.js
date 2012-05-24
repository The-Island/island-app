/*!
 * Island.IO
 * v 0.1
 * Copyright(c) 2012 Sander Pick <sanderpick@gmail.com>
 */

Island = (function ($) {

  /**
   * island color scheme
   */

  var colors = {
    green: '#b1dc36',
    orange: '#d04c38',
    blue: '#4bb8d7',
    pink: '#d12b83',

    lightgreen: '#eff8d7',
    lightorange: '#f6dbd7',

    black: '#1a1a1a',
    darkgray: '#404040',
    gray: '#808080',
    lightgray: '#b3b3b3',

    bordergray: '#cdcdcd',
    backgray: '#fcfcfb',
    mattegray: '#f2f2f2',
  };

  var man;
  var packer;
  var manX = 0;
  var packman = {
    start: function () {
      packer = setInterval(this.go, 250);
      this.go();
    },
    stop: function () { clearInterval(packer); },
    go: function () {
      if (manX > 350) manX = 0;
      else manX += 20;
      man.css({ left: manX });
    },
  };

  var spinOpts = {
    lines: 17, // The number of lines to draw
    length: 0, // The length of each line
    width: 3, // The line thickness
    radius: 40, // The radius of the inner circle
    rotate: 0, // The rotation offset
    color: '#000', // #rgb or #rrggbb
    speed: 2.2, // Rounds per second
    trail: 100, // Afterglow percentage
    shadow: false, // Whether to render a shadow
    hwaccel: true, // Whether to use hardware acceleration
    className: 'spinner', // The CSS class to assign to the spinner
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    top: 'auto', // Top position relative to parent in px
    left: 'auto' // Left position relative to parent in px
  };

  var Spin = function () {
    var spinTarget = $('.signin-spinner').get(0);
    var spinner = new Spinner(spinOpts).spin(spinTarget);
    return {
      start: function () { spinner.spin(spinTarget); },
      stop: function () { spinner.stop(); }
    };
  }

  /**
   * logo pulse
   */

  var pulseCnt = 0;

  function pulse (a, b) {
    if (pulseCnt % 2 == 0)
      $(b).fadeTo(500, 0.75);
    else 
      $(b).fadeTo(500, 1);
    pulseCnt += 1;
  }

  function cancelPulse() {
    clearInterval(pulseTimer);
    clearTimeout(pulseCancel);
    $("#logo-a").show();
    $("#logo-b").hide();
  }

  /**
   * tweets
   */

  var twitters = [];
  var tweets = [];
  var twot = 0;
  var twut = 0;
  var twap;
    
  function twit() {
    twap.hide().html(tweets[twut]);
    twap.fadeIn('fast');
    twut++;
    if (twut == tweets.length) 
      twut = 0;
  }

  function twat(t) {
    tweets = tweets.concat(t);
    twot++;
    if (twot == twitters.length) {
      $.fisherYates(tweets);
      var tweeter = $.setIntervalObj(this, 5000, twit);
      twit();
    }
  };

  function updateTimes() {
    $('.comment-added').each(function (i) {
      var time = $(this);
      if (!time.data('ts'))
        time.data('ts', time.text());
      time.text(Util.getRelativeTime(time.data('ts')));
    });
  }


  /**
   * select hearts for rating
   */

  var selectHearts = function (hearts, x, h) {
    if (!h && h !== 0) {
      if (x < 10) h = 0;
      else if (x < 30) h = 1;
      else if (x < 55) h = 2;
      else if (x < 80) h = 3;
      else if (x < 105) h = 4;
      else h = 5;
    }
    $(hearts.children()).hide();
    for (var i=0; i < h; i++)
      $(hearts.children()[i]).show();
    return h;
  }

  /**
   * search media
   */

  function search(query, fn) {
    jrid.empty();
    $.get('/search/' + query, fn);
  }

  /**
   * simulate gifs for videos in grid
   */

  function initVideoSlides() {
    $('.is-video').each(function (v) {
      if ($(this).data().timer) return;
      var thumbs = $('img', this);
      var num = thumbs.length, i = 1;
      var timer = setInterval(function () {
        var h = i === 0 ? num - 1 : i - 1;
        $(thumbs[h]).hide();
        $(thumbs[i]).show();
        i += i == num - 1 ? 1 - num : 1;
      }, 2000);
      $(this).data({ timer: timer });
    });
  }

  /**
   * trending media
   */

  var trending;
  function Trending(el) {
    var scroller;
    var holder;
    var holderHeight;
    var kids;
    var top = 0;
    var newKids = [];

    return {
      init: function() {
        holder = $(el);
        this.start();
      },
      start: function() {
        holderHeight = holder.height();
        kids = holder.children();
        $(kids[0]).clone().appendTo(holder);
        scroller = $.setIntervalObj(this, 40, this.scroll);
      },
      update: function () {
        clearInterval(scroller);
        this.start();
      },
      scroll: function () {
        top -= 4;
        if (-top >= holderHeight) {
          top = 0;
          if (newKids.length != 0) {
            holder.empty();
            for (var i=0; i < newKids.length; i++)
              newKids[i].appendTo(holder);
            this.update();
          }
        }
        holder.css({ marginTop: top });
      },
      receive: function (trends) {
        newKids = [];
        for (var i=0; i < trends.length; i++)
          newKids.push($(trends[i]));
      },
    };
  }

  /**
   * media grid
   */

  var grid;
  var jrid;
  var gridHeight;
  var gridWrap;
  function Grid(el) {
    // grid vars
    var wrap = $(el);
    var NUM_GRID = 50;
    var NUM_FLOW = 25;
    var GRID_OBJ_FREQ = { '482px': 1, '231px': '*' };
    var COL_WIDTH = 231;
    var COL_GAP_X = 20;
    var COL_GAP_Y = 20;
    var MIN_COLS = 2;
    var MAX_COLS = 4;
    var SIN_COLS = 2;
    var x_off = 0;
    var y_off = 0;
    var col_heights = [];

    // determine the number of columns
    function num_cols() {
      return Math.min(Math.max(MIN_COLS, (parseInt(wrap.innerWidth())
                      + COL_GAP_X) / (COL_WIDTH + COL_GAP_X)), MAX_COLS);
    }

    return {
      collage: function (single, extra) {

        // hide hovers
        $('.grid-obj-hover').hide();

        // calc num cols once
        var nc = num_cols();

        // clear column height array
        for (var x = 0; x < nc; x++) 
          col_heights[x] = 0;

        if (single && comsOffset() > jrid.offset().top) {
          extra = extra || 0;
          col_heights[2] = col_heights[3] = comsOffset() - wrap.offset().top + 10 + extra;
        }

        // loop over each object in grid
        $('.each-grid-obj').each(function (i) {

          var self = $(this);
          var obj_col = 0;
          var obj_y = 0;
            
          // determine how many columns the object will span
          var obj_span = Math.max(Math.round(self.outerWidth() / COL_WIDTH), 1);

          // determine which column to place the object in
          for (var x = 0; x < nc - (obj_span - 1); x++)
            obj_col = col_heights[x] < col_heights[obj_col] ? x : obj_col;

          // determine the object's y position
          for (x = 0; x < obj_span; x++) 
            obj_y = Math.max(obj_y, col_heights[obj_col + x]);

          // determine the new height for the effected columns
          for (x = 0; x < obj_span; x++) 
            col_heights[obj_col + x] = parseInt(self.outerHeight()) + COL_GAP_Y + obj_y;

          // set the object's css position
          self.css('left', obj_col * (COL_WIDTH + COL_GAP_X) + x_off).css('top', obj_y + y_off);
        });

        // get max column height
        gridHeight = Math.max.apply(null, col_heights);
      }
    }
  }

  /**
   * adjust grid wrapper window stays put
   */

  function adjustGridHeight() {
    gridWrap.css({ height: $('#search').height() + gridHeight });
  }

  /**
   * determine comments vertical space
   */

  function comsOffset() {
    var coms = $('#recent-comments').length > 0 ?
              $('#recent-comments') : $('.obj-comments');
    return coms.length > 0 ? coms.offset().top + coms.height() + 20 : 0;
  }

  /**
   * re-collage if overlapping
   */

  var comsSpace;
  function checkComsSpace() {
    if (comsOffset() != comsSpace)
      grid.collage(true);
  }

  /**
   * utils
   */

  function hideFlashMessages () {
    $(this).fadeOut();
  };


  return {
    
    /**
     * setup doc
     */

    go: function () {


      /////////////////////////// UTILS

      // extras
      String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,""); };
      String.prototype.ltrim = function() { return this.replace(/^\s+/,""); };
      String.prototype.rtrim = function() { return this.replace(/\s+$/,""); };

      // scope aware timeouts
      // TODO: replace with native
      $.setTimeoutObj = function (o, t, f, a) {
        return setTimeout(function () { f.apply(o, a); }, t);
      };
      $.setIntervalObj = function (o, t, f, a) {
        return setInterval(function () { f.apply(o, a); }, t); 
      };

      // random generation
      $.fisherYates = function (a) {
        var i = a.length;
        if (i==0 ) return false;
        while (--i) {
          var j = Math.floor(Math.random() * (i + 1));
          var tempi = a[i];
          var tempj = a[j];
          a[i] = tempj;
          a[j] = tempi;
        }
      };

      // determine of object is empty (non-enumerable)
      $.isEmpty = function (o) {
        for (var p in o)
          if (o.hasOwnProperty(p))
            return false;
        return true;
      };

      // server PUT
      $.put = function (url, data, cb) {
        if ('function' === typeof data) {
          cb = data;
          data = {};
        }
        data._method = 'PUT';
        $.post(url, data, cb, 'json');
      };

      // map form data to JSON
      $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
          if (o[this.name]) {
            if (!o[this.name].push)
              o[this.name] = [o[this.name]];
            o[this.name].push(this.value.trim() || '');
          } else
            o[this.name] = this.value.trim() || '';
        });
        return o;
      };

      // get database ID
      $.fn.itemID = function () {
        try {
          var items = $(this).attr('id').split('-');
          return items[items.length - 1];
        } catch (exception) {
          return null;
        }
      };

      // custom fade in for flashes
      // $.fn.dropIn = function () {
      //   $(this).css({ bottom: 40 }).animate({ bottom: '-=20' }, 2000, 'easeOutExpo');
      // };


      /////////////////////////// SETUP

      // flash messages
      // $('.flash').hide().fadeIn(1000).bind('click', hideFlashMessages);
      // $('.is-highlight, .is-error').dropIn();
      // setTimeout(function () {
      //   $('.flash').each(hideFlashMessages);
      // }, 10000);

      // init trending
      trending = new Trending('#trend');
      trending.init();

      // get relative comment times
      $.setIntervalObj(this, 5000, updateTimes); updateTimes();

      // init media grid
      grid = new Grid('#grid');
      jrid = $('#grid');
      gridWrap = $('.grid-wrap');
      if (jrid.hasClass('adjustable-grid')) {
        comsSpace = comsOffset();
        var upper = $('.trending-media-wrap').length > 0 ? $('.trending-media-wrap') : $('.single-left');
        gridWrap.css({ top: upper.offset().top + upper.height() + 40 });
        grid.collage(true);
      } else grid.collage();

      // TODO: better way to do this?
      // mobile checks
      if (navigator.userAgent.match(/Android/i) ||
       navigator.userAgent.match(/webOS/i) ||
       navigator.userAgent.match(/iPhone/i) ||
       navigator.userAgent.match(/iPod/i)
      ) {

        // hide footer
        $('#footer').hide();

      }

      // Clear the shit that come back from Facebook
      if (window.location.hash !== '') {
        try {
          window.history.replaceState('', '', window.location.pathname + window.location.search);
        } catch(err) {}
      }

      $('.jp-jplayer').each(function (i) {
        $('#' + $(this).attr('id')).jPlayer({
          ready: function (event) {
            $(this).jPlayer('setMedia', {
              mp3: $(this).data('src'),
            });
          },
          play: function () {
            $(this).jPlayer('pauseOthers');
          },
          swfPath: 'https://d271mvlc6gc7bl.cloudfront.net/main/jplayer/js',
          wmode: 'window',
          cssSelectorAncestor: '#jp_container_' + (i + 1),
        });
      });

      $('video').each(function () {
        jwplayer($(this).attr('id')).setup({
          flashplayer: 'https://d271mvlc6gc7bl.cloudfront.net/main/jwplayer/player.swf',
          skin: 'https://d271mvlc6gc7bl.cloudfront.net/main/jwplayer/skins/bekle.zip',
        });
      });

      // start all video thumb timers
      initVideoSlides();      

      // packman loader
      man = $('#landing-loader');
      if (man.length === 0)
        packman.start = function () {};

      // tweets
      twitterNames = $('#twitter-names').text().split(',');
      for (var i=0; i < twitterNames.length; i++)
        if (twitterNames[i] != 'undefined' && twitterNames[i] != '')
          twitters.push(twitterNames[i]);
      twap = $('#twitter');
      for (var tt in twitters)
        $.tweet({
          username: twitters[tt],
          callback: twat,
        });

      $(window).resize(fitSignInBG);

      function fitSignInBG () {
        var bg = $('.signin-bg > img');
        if (bg.length === 0) return;
        var win = $(this);
        var aspect = bg.width() / bg.height();
        bg.width(win.width());
        bg.height(win.width() / aspect);
      }
      fitSignInBG();

      var spin = new Spin();

      /////////////////////////// ACTIONS

      // forms
      $('form input[type="text"], form input[type="password"], form textarea')
          .bind('focus', function () {
        if ($(this).hasClass('is-input-alert'))
          $(this).removeClass('is-input-alert');
      });

      // landing page login - register
      var loginForm = $('#login-form');
      var registerForm = $('#register-form');
      var gotoLoginButton = $('#goto-login-form');
      var gotoRegisterButton = $('#goto-register-form');

      // login member
      var loginButton = $('#login');
      var loginEmail = $('input[name="username"]');
      var loginPassword = $('input[name="password"]');

      // register member
      var registerButton = $('#add-member');
      var registerName = $('input[name="newname"]');
      var registerEmail = $('input[name="newusername"]');
      var registerPassword = $('input[name="newpassword"]');

      // switch between forms
      function gotoLogin() {
        registerForm.animate({
          opacity: [0, 'easeOutExpo'],
          left: ['+=300', 'linear']
        }, 200, 'easeOutExpo', function () {
          registerForm.hide();
          registerForm.css({ opacity: 1, left: 0 });
          loginForm.fadeIn('fast');
          loginEmail.focus();
        });
        gotoLoginButton.hide();
        gotoRegisterButton.show();
      }
      function gotoRegister() {
        loginForm.animate({
          opacity: [0, 'easeOutExpo'],
          left: ['-=300', 'linear']
        }, 200, function () {
          loginForm.hide();
          loginForm.css({ opacity: 1, left: 0 });
          registerForm.fadeIn('fast');
          registerName.focus();
        });
        gotoRegisterButton.hide();
        gotoLoginButton.show();
      }

      // form control
      function exitLoginButton() {
        loginButton.removeClass('is-button-alert');
        resetLoginStyles();
      }
      function resetLoginStyles() {
        loginEmail.removeClass('is-input-alert');
        loginPassword.removeClass('is-input-alert');
      }
      function exitRegisterButton() {
        registerButton.removeClass('is-button-alert');
        resetRegisterStyles();
      }
      function resetRegisterStyles() {
        registerName.removeClass('is-input-alert');
        registerEmail.removeClass('is-input-alert');
        registerPassword.removeClass('is-input-alert');
      }

      function showSpinner() {
        $('.signin-strategies').hide();
        $('.signin-controls').hide();
        $('.signin-forms').hide();
        $('.signin-almost-there').hide();
        $('.signin-spinner').show();
      }
      function hideSpinner() {
        $('.signin-strategies').show();
        $('.signin-controls').show();
        $('.signin-forms').show();
        $('.signin-almost-there').show();
        $('.signin-spinner').hide();
      }

      $('a', gotoRegisterButton).bind('click',
          function () { gotoRegister(); });
      $('a', gotoLoginButton).bind('click',
          function () { gotoLogin(); });
      loginEmail.focus();

      loginButton.bind('mouseenter', function () {
        var email = loginEmail.val().trim();
        var password = loginPassword.val().trim();
        if (email !== '' && password !== '') {
          resetLoginStyles();
        } else {
          loginButton.addClass('is-button-alert');
          if (email == '') 
            loginEmail.addClass('is-input-alert');
          if (password == '') 
            loginPassword.addClass('is-input-alert');
        }
      }).bind('mouseleave', exitLoginButton);

      loginButton.bind('click', function (e) {
        e.preventDefault();
        spin.start();
        showSpinner();
        var data = loginForm.serializeObject();
        $.post('/login', data, function (serv) {
          if ('success' === serv.status) {
            window.location = serv.data.path;
          } else if ('fail' === serv.status) {
            hideSpinner();
            spin.stop();
            ui.error(serv.data.message).closable().hide(8000).effect('fade');
            switch (serv.data.code) {
              case 'MISSING_FIELD':
                var missing = serv.data.missing;
                for (var i=0; i < missing.length; ++i)
                  $('input[name="' + missing[i] + '"]').addClass('is-input-alert');
                break;
              case 'BAD_AUTH':
                loginPassword.val('').focus();
                break;
              case 'NOT_CONFIRMED':
                break;
            }
          }
        }, 'json');
      });

      registerButton.bind('mouseenter', function () {
        var name = registerName.val().trim();
        var email = registerEmail.val().trim();
        var password = registerPassword.val().trim();
        if (name != '' && email != '' && password != '') {
          resetRegisterStyles();
        } else {
          registerButton.addClass('is-button-alert');
          if (name == '')
            registerName.addClass('is-input-alert');
          if (email == '')
            registerEmail.addClass('is-input-alert');
          if (password == '')
            registerPassword.addClass('is-input-alert');
        }
      }).bind('mouseleave', exitRegisterButton);

      registerButton.bind('click', function (e) {
        e.preventDefault();
        spin.start();
        showSpinner();
        var data = registerForm.serializeObject();
        data.id = registerButton.data('id');
        $.put('/signup', data, function (serv) {
          if ('success' === serv.status) {
            // ui.notify(serv.data.message).sticky().effect('fade');
            // registerName.val('');
            // registerEmail.val('');
            // registerPassword.val('');
            // resetRegisterStyles();
            // gotoLogin();
            window.location = serv.data.path;
          } else if ('fail' === serv.status) {
            hideSpinner();
            spin.stop();
            ui.error(serv.data.message).closable().hide(8000).effect('fade');
            switch (serv.data.code) {
              case 'MISSING_FIELD':
                var missing = serv.data.missing;
                for (var i=0; i < missing.length; ++i)
                  $('input[name="' + missing[i] + '"]').addClass('is-input-alert');
                break;
              case 'INVALID_EMAIL':
              case 'DUPLICATE_EMAIL':
                registerEmail.val('').addClass('is-input-alert');
                registerEmail.focus();
                break;
            }
          }
        });
      });
      
      // Hide everything when a strategy is clicked
      $('.signin-strategy-btn').click(function (e) { showSpinner(); });

      // resend confirmation email
      $('.resend-conf').live('click', function (e) {
        packman.start();
        var id = $(this).itemID()
        $.post('/resendconf/' + id, { id: id }, function (serv) {
          packman.stop();
          if ('success' === serv.status)
            ui.notify(serv.data.message).closable().hide(8000).effect('fade');
          else if ('error' === serv.status)
            ui.error(serv.data.message).closable().hide(8000).effect('fade');
        }, 'json');
      });


      // pulse logo on mouseover
      var logoA = $('#logo-a');
      var logoB = $('#logo-b');
      var logos = [logoA, logoB];
      
      $('#header-left').bind('mouseover', function () {
        logoA.hide();
        logoB.show();
        pulse(logos[0], logos[1]);
        pulseTimer = $.setIntervalObj(this, 500, pulse, logos);
        pulseCancel = $.setTimeoutObj(this, 5000, cancelPulse);
      }).bind('mouseout', function () {
        cancelPulse();
      });


      // init autogrow text
      $('textarea').autogrow();

      // rollover each object
      $('.grid-obj-img').live('mouseenter', function () {
        $('.grid-obj-hover', this.parentNode).show();
      });
      $('.grid-obj-hover').live('mouseleave', function () {
        $(this).fadeOut(100);
      });


      // search box
      var searchBox = $('#search-box');

      // HACK
      if (navigator.userAgent.indexOf('Firefox') !== -1)
        searchBox.css({ padding: '5px 10px' });

      searchBox.bind('keyup search', function (e) {
        var txt = $(this).val().trim();
        jrid.empty();
        if ('' === txt)
          txt = '__clear__';
        search(txt, function (res) {
          if ('success' === res.status) {
            for (var i=0; i < res.data.results.length; i++)
              $(res.data.results[i]).appendTo(jrid);
            if (jrid.hasClass('adjustable-grid'))
              grid.collage(true);
            else grid.collage();
          } else console.log(res.message);
          initVideoSlides();
        });
      }).bind('focus', adjustGridHeight);

      if (searchBox.val() !== '')
        searchBox.trigger('keyup');

      $('.grid-obj, .trending').live('click', function (e) {
        e.preventDefault();
        var data = $(this).data();
        $.put('/hit/' + data.id, function (res) {
          if ('error' === res.status)
            return console.log(res.message);
          window.location = '/' + data.key;
        });
      });

      // comment input behavior
      $('.commentor-input-dummy').bind('focus', function () {
        $(this).hide();
        $(this.nextElementSibling).show();
        $(this.nextElementSibling.firstElementChild).focus();
        checkComsSpace();
      });
      $('.commentor-input').bind('blur', function () {
        if (this.value.trim() == '') {
          $(this.parentNode).hide();
          $(this).val('').css({ height: 32 });
          $(this.parentNode.previousElementSibling).show();
          checkComsSpace();
        }
      }).bind('keyup', checkComsSpace);


      // add comment on media
      $('.add-comment').bind('click', function () {
        var str = $(this.previousElementSibling).val();
        str = $('<div>').html(str).text().trim();
        if (str === '') return false;
        $(this.previousElementSibling).val('').css({ height: 32 });
        $(this.parentNode).hide();
        $(this.parentNode.previousElementSibling).show();
        var mediaId = $(this).itemID();
        $.put('/comment/' + mediaId,
              { body: str }, function (res) {
          if ('error' === res.status)
            return console.log(res.message);
        });
      });


      // show like heart
      $('.obj-holder').bind('mouseenter', function () {
        $('.hearts', this).show();
      }).bind('mouseleave', function () {
        $('.hearts', this).hide();
      });


      // no dragging hearts
      $('.hearts-wrap img, .hearts-back img').bind('mousedown', function (e) {
        e.preventDefault();
      });


      // rate media with hearts
      $('.hearts').each(function () {
        var _this = $(this);
        var currentHearts = parseInt(_this.data('num'));
        var x = 0;
        var h = 0;
        var rater = $('.hearts-back', this);
        var hearts = $('.hearts-wrap', this);
        if (currentHearts > 0)
          selectHearts(hearts, null, currentHearts);
        rater.bind('mouseleave', function (e) {
          selectHearts(hearts, null, currentHearts);
        }).bind('mousemove', function (e) {
          x = e.pageX - rater.offset().left;
          h = selectHearts(hearts, x);
        }).bind('click', function (e) {
          currentHearts = h;
          var id = rater.itemID();
          $.put('/rate/' + id, { val: h }, function (res) {
            if ('error' === res.status)
              return console.log(res.message);
          });
        });
      });

      $('.obj-details[data-date]').each(function () {
        var _this = $(this);
        var date = new Date(_this.data('date'));
        var txt;
        switch (_this.data('type')) {
          case 'media':
            txt = 'Added ' + Util.toLocaleString(date, 'mmm d, yyyy');
            break;
          case 'profile':
            txt = 'Contributor since ' + Util.toLocaleString(date,'m/d/yy');
            break;
        }
        _this.text(txt);
      });

      $('.birthday').each(function () {
        var _this = $(this);
        _this.text(Util.getAge(_this.text()));
      });

      // new media
      var mediaForm = $('#media-form');
      var mediaButton = $('#add-media');
      var mediaButtonMask = $('#add-media-mask');
      var mediaTitle = $('input[name="post[title]"]');
      var mediaBody = $('textarea[name="post[body]"]');
      var mediaTags = $('input[name="post[meta.tags]"]');
      var mediaFile = $('input[name="my_file"]');
      var mediaTitleLabel = $('label[for="post[title]"]');
      var mediaBodyLabel = $('label[for="post[body]"]');
      var mediaTagsLabel = $('label[for="post[meta.tags]"]');
      var mediaFileLabel = $('label[for="my_file"]');

      function exitMediaButton() {
        mediaButtonMask.show();
        mediaButton.removeClass('is-button-alert');
        resetMediaStyles();
      }
      function resetMediaStyles() {
        mediaTitleLabel.css('color', 'gray');
        mediaBodyLabel.css('color', 'gray');
        mediaFileLabel.css('color', 'gray');
      }

      mediaButtonMask.each(function (i) {
        var w = mediaButton.outerWidth();
        var h = mediaButton.outerHeight();
        mediaButtonMask.css({ width: w, height: h });
      });

      mediaButtonMask.bind('mouseenter', function () {
        var title = mediaTitle.val().trim();
        var body = mediaBody.val().trim();
        var file = mediaFile.val();
        if (title != '' && body != '' && file != '') {
          mediaButtonMask.css('bottom', 10000).hide();
          resetMediaStyles();
        } else {
          mediaButton.addClass('is-button-alert');
          if (title == '') 
            mediaTitleLabel.css('color', colors.orange);
          if (body == '')
            mediaBodyLabel.css('color', colors.orange);
          if (file == '') 
            mediaFileLabel.css('color', colors.orange);
        }
      }).bind('mouseleave', exitMediaButton);

      mediaButton.bind('mouseleave', function () {
        mediaButtonMask.css('bottom', 0);
        exitMediaButton();
      });

      mediaForm.transloadit({
        wait: true,
        autoSubmit: false,
        onSuccess: function (assembly) {
          if (assembly.ok != 'ASSEMBLY_COMPLETED') {
            alert('Upload failed. Please try again.');
            return;
          }
          if ($.isEmpty(assembly.results)) {
            alert('You must choose a file to contribute.');
            return;
          }
          var data = mediaForm.serializeObject();
          data.params = JSON.parse(data.params);
          data.assembly = assembly;
          $.put('/insert', data, function (res) {
            if ('error' === res.status)
              return console.log(res.message);
            mediaTitle.val('');
            mediaBody.val('');
            mediaTags.val('');
            mediaFile = $('input[name="my_file"]');
          });
        },
      });

    },

    /**
     * Push a media object to all clients.
     */

    receiveMedia: function (str) {
      var html = $(str);
      html.prependTo(jrid).css({ opacity: 0 });
      if (jrid.hasClass('adjustable-grid'))
        grid.collage(true);
      else grid.collage();
      html.animate({ opacity: 1 }, 500);
    },

    /**
     * Push a comment to all clients.
     */

    receiveComment: function (str, mediaId) {
      var com = $(str);
      var comHolder = $('#coms-' + mediaId);
      var recHolder = $('#recent-comments');
      if (recHolder.length > 0) {
        $(recHolder.children()[recHolder.children().length - 1]).remove();
        if (recHolder.hasClass('no-member'))
          $('.comment-title-name', com).remove();
        com.hide().css({ opacity: 0 }).appendTo(recHolder);
        grid.collage(true, com.height());
        var time = $('.comment-added', com);
        time.data('ts', time.text());
        time.text(Util.getRelativeTime(time.data('ts')));
        setTimeout(function () {
          com.prependTo(recHolder).show(250).animate({ opacity: 1 }, 500);
        }, 100);
      } else if (comHolder.length > 0) {
        com.hide().css({ opacity: 0 }).prependTo(comHolder);
        $('a.comment-title-parent', com).remove();
        grid.collage(true, com.height());
        setTimeout(function () {
          com.show(250).animate({ opacity: 1 }, 500);
          var time = $('.comment-added', com);
          time.data('ts', time.text());
          time.text(Util.getRelativeTime(time.data('ts')));
        }, 100);
      }
    },

    /**
     * Push new trends to all clients.
     */

    receiveTrends: function (err, media) {
      if (err) return console.log(err);
      trending.receive(media);
    },

  };

})(jQuery);


/**
 * Now.JS handlers
 */

now.receiveMedia = Island.receiveMedia;
now.receiveComment = Island.receiveComment;
now.receiveTrends = Island.receiveTrends;
