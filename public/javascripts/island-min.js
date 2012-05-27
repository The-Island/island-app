/*!
 * Island.IO
 * v 0.1
 * Copyright(c) 2012 Sander Pick <sanderpick@gmail.com>
 */// Polyfills
(function(){var a=0,b=["ms","moz","webkit","o"];for(var c=0;c<b.length&&!window.requestAnimationFrame;++c)window.requestAnimationFrame=window[b[c]+"RequestAnimationFrame"],window.cancelAnimationFrame=window[b[c]+"CancelAnimationFrame"]||window[b[c]+"CancelRequestAnimationFrame"];window.requestAnimationFrame||(window.requestAnimationFrame=function(b,c){var d=(new Date).getTime(),e=Math.max(0,16-(d-a)),f=window.setTimeout(function(){b(d+e)},e);return a=d+e,f}),window.cancelAnimationFrame||(window.cancelAnimationFrame=function(a){clearTimeout(a)})})(),Island=function(a){function g(b,c){f%2==0?a(c).fadeTo(500,.75):a(c).fadeTo(500,1),f+=1}function h(){clearInterval(pulseTimer),clearTimeout(pulseCancel),a("#logo-a").show(),a("#logo-b").hide()}function n(){m.hide().html(j[l]),m.fadeIn("fast"),l++,l==j.length&&(l=0)}function o(b){j=j.concat(b),k++;if(k==i.length){a.fisherYates(j);var c=a.setIntervalObj(this,5e3,n);n()}}function p(){a(".comment-added, .object-added").each(function(b){var c=a(this);c.data("ts")||c.data("ts",c.text()),c.text(Util.getRelativeTime(c.data("ts")))})}function r(b,c){w.empty(),a.get("/search/"+b,c)}function s(){a(".is-video").each(function(b){if(a(this).data().timer)return;var c=a(".thumb",this),d=c.length,e=1,f=setInterval(function(){var b=e===0?d-1:e-1;a(c[b]).hide(),a(c[e]).show(),e+=e==d-1?1-d:1},2e3);a(this).data({timer:f})})}function u(b){var c,d,e=20,f=1,g,h,i,j=0,k=[],l=[],m=!0,n=null;return{init:function(){g=a(b);if(g.length===0)return;h=g.offset().top,this.start()},start:function(){i=g.height(),a(g.children()[0]).clone().appendTo(g),l=_.map(g.children(),function(b){return a("img",b).offset().top-h}),c=requestAnimationFrame(_.bind(this.scroll,this))},update:function(){cancelAnimationFrame(c),this.start()},scroll:function(a){var b=this;if(!d||a-d>e){d=Date.now(),j-=f;if(-j>=i){j=0,g.css({marginTop:j});if(k.length!==0){g.empty();for(var h=0;h<k.length;++h)k[h].appendTo(g);this.update()}}else g.css({marginTop:j});var o=n,p=_.find(l,function(a,b){return o=b,-j-a<0});o!==n&&(n=o,m=!0),m&&n!==null&&n!==0&&l[n-1]+(p-l[n-1])/2<-j?(m=!1,cancelAnimationFrame(c),g.animate({marginTop:-p+"px"},200,"easeOutExpo",function(){j=-p,c=requestAnimationFrame(_.bind(b.scroll,b))})):c=requestAnimationFrame(_.bind(b.scroll,b))}else c=requestAnimationFrame(_.bind(b.scroll,b))},receive:function(b){k=[];for(var c=0;c<b.length;c++)k.push(a(b[c]))}}}function z(b){function p(){return Math.min(Math.max(j,(parseInt(c.innerWidth())+h)/(g+h)),k)}var c=a(b),d=50,e=25,f={"482px":1,"231px":"*"},g=231,h=20,i=40,j=2,k=4,l=2,m=0,n=0,o=[];return{collage:function(b,d){var e=p();for(var f=0;f<e;f++)o[f]=0;b&&B()>w.offset().top&&(d=d||0,o[2]=o[3]=B()-c.offset().top+10+d),a(".each-grid-obj").each(function(b){var c=a(this),d=0,f=0,j=Math.max(Math.round(c.outerWidth()/g),1);for(var k=0;k<e-(j-1);k++)d=o[k]<o[d]?k:d;for(k=0;k<j;k++)f=Math.max(f,o[d+k]);for(k=0;k<j;k++)o[d+k]=parseInt(c.outerHeight())+i+f;c.css("left",d*(g+h)+m).css("top",f+n).show()}),x=Math.max.apply(null,o),c.height(x+100)}}}function A(){y.css({height:a("#search").height()+x})}function B(){var b=a("#recent-comments").length>0?a("#recent-comments"):a(".obj-comments");return b.length>0?b.offset().top+b.height()+20:0}function D(){B()!=C&&v.collage(!0)}function E(){a(this).fadeOut()}var b={green:"#b1dc36",orange:"#d04c38",blue:"#4bb8d7",pink:"#d12b83",lightgreen:"#eff8d7",lightorange:"#f6dbd7",black:"#1a1a1a",darkgray:"#404040",gray:"#808080",lightgray:"#b3b3b3",bordergray:"#cdcdcd",backgray:"#fcfcfb",mattegray:"#f2f2f2"},c={lines:17,length:0,width:3,radius:40,rotate:0,color:"#000",speed:2.2,trail:100,shadow:!1,hwaccel:!1,className:"spinner",zIndex:2e9,top:"auto",left:"auto"},d={lines:13,length:0,width:2,radius:10,rotate:0,color:"#000",speed:2.2,trail:60,shadow:!1,hwaccel:!1,className:"spinner",zIndex:2e9,top:"auto",left:"auto"},e=function(a){if(a.length===0)return;var b=a.get(0),e=a.hasClass("search-spinner")?d:c,f=(new Spinner(e)).spin(b).stop();return{start:function(){f.spin(b)},stop:function(){f.stop()}}},f=0,i=[],j=[],k=0,l=0,m,q=function(b,c,d){!d&&d!==0&&(c<10?d=0:c<30?d=1:c<55?d=2:c<80?d=3:c<105?d=4:d=5),a(b.children()).hide();for(var e=0;e<d;e++)a(b.children()[e]).show();return d},t,v,w,x,y,C;return{go:function(){function l(){if(k.length===0)return;var b=a(this),c=k.width()/k.height();k.width(b.width()),k.height(b.width()/c)}function W(){M.animate({opacity:[0,"easeOutExpo"],left:["+=300","linear"]},200,"easeOutExpo",function(){M.hide(),M.css({opacity:1,left:0}),L.fadeIn("fast"),Q.focus()}),N.hide(),O.show()}function X(){L.animate({opacity:[0,"easeOutExpo"],left:["-=300","linear"]},200,function(){L.hide(),L.css({opacity:1,left:0}),M.fadeIn("fast"),T.focus()}),O.hide(),N.show()}function Y(){P.removeClass("is-button-alert"),Z()}function Z(){Q.removeClass("is-input-alert"),R.removeClass("is-input-alert")}function ab(){S.removeClass("is-button-alert"),bb()}function bb(){T.removeClass("is-input-alert"),U.removeClass("is-input-alert"),V.removeClass("is-input-alert")}function cb(){a(".signin-strategies").hide(),a(".signin-controls").hide(),a(".signin-forms").hide(),a(".signin-almost-there").hide(),a(".signin-spinner").show()}function db(){a(".signin-strategies").show(),a(".signin-controls").show(),a(".signin-forms").show(),a(".signin-almost-there").show(),a(".signin-spinner").hide()}function tb(){kb.show(),jb.removeClass("is-button-alert"),ub()}function ub(){pb.css("color","gray"),qb.css("color","gray"),sb.css("color","gray")}String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")},String.prototype.ltrim=function(){return this.replace(/^\s+/,"")},String.prototype.rtrim=function(){return this.replace(/\s+$/,"")},a.setTimeoutObj=function(a,b,c,d){return setTimeout(function(){c.apply(a,d)},b)},a.setIntervalObj=function(a,b,c,d){return setInterval(function(){c.apply(a,d)},b)},a.fisherYates=function(a){var b=a.length;if(b==0)return!1;while(--b){var c=Math.floor(Math.random()*(b+1)),d=a[b],e=a[c];a[b]=e,a[c]=d}},a.isEmpty=function(a){for(var b in a)if(a.hasOwnProperty(b))return!1;return!0},a.put=function(b,c,d){"function"==typeof c&&(d=c,c={}),c._method="PUT",a.post(b,c,d,"json")},a.fn.serializeObject=function(){var b={},c=this.serializeArray();return a.each(c,function(){b[this.name]?(b[this.name].push||(b[this.name]=[b[this.name]]),b[this.name].push(this.value.trim()||"")):b[this.name]=this.value.trim()||""}),b},a.fn.itemID=function(){try{var b=a(this).attr("id").split("-");return b[b.length-1]}catch(c){return null}},t=new u("#trend"),t.init(),a.setIntervalObj(this,5e3,p),p(),v=new z("#grid"),w=a("#grid"),y=a(".grid-wrap");if(w.hasClass("adjustable-grid")){C=B();var c=a(".trending-media-wrap").length>0?a(".trending-media-wrap"):a(".single-left");y.css({top:c.offset().top+c.height()+40}),v.collage(!0)}else v.collage();(navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPod/i))&&a("#footer").hide();if(window.location.hash!=="")try{window.history.replaceState("","",window.location.pathname+window.location.search)}catch(d){}a(".jp-jplayer").each(function(b){a("#"+a(this).attr("id")).jPlayer({ready:function(b){a(this).jPlayer("setMedia",{mp3:a(this).data("src")})},play:function(){a(this).jPlayer("pauseOthers")},swfPath:"https://d271mvlc6gc7bl.cloudfront.net/main/jplayer/js",wmode:"window",cssSelectorAncestor:"#jp_container_"+(b+1)})}),a("video").each(function(){jwplayer(a(this).attr("id")).setup({flashplayer:"https://d271mvlc6gc7bl.cloudfront.net/main/jwplayer/player.swf",skin:"https://d271mvlc6gc7bl.cloudfront.net/main/jwplayer/skins/bekle.zip"})}),s(),twitterNames=a("#twitter-names").text().split(",");for(var f=0;f<twitterNames.length;f++)twitterNames[f]!="undefined"&&twitterNames[f]!=""&&i.push(twitterNames[f]);m=a("#twitter");for(var j in i)a.tweet({username:i[j],callback:o});var k=a(".signin-bg > img");k.length>0&&(a(window).resize(l),l());var n=new e(a(".signin-spinner")),x=new e(a(".search-spinner")),E=Util.getQueryVariable("p"),F=E&&E!==""?Number(E):1;if(a("#grid").length!==0){var G=a(document),H=a(window),I=!1,J=!1,K=_.throttle(function(b){var c=G.height()-H.height()-G.scrollTop();!I&&!J&&c<100&&!w.hasClass("search-results")&&(I=!0,a.post("/page/"+(F+1),function(b){if("success"===b.status){if(b.data.results.length===0){J=!0;return}++F;for(var c=0;c<b.data.results.length;++c)a(b.data.results[c]).appendTo(w);w.hasClass("adjustable-grid")?v.collage(!0):v.collage(),p(),s()}else console.log(b.message);I=!1},"json"))},100);H.scroll(K).resize(K)}a('form input[type="text"], form input[type="password"], form textarea').bind("focus",function(){a(this).hasClass("is-input-alert")&&a(this).removeClass("is-input-alert")});var L=a("#login-form"),M=a("#register-form"),N=a("#goto-login-form"),O=a("#goto-register-form"),P=a("#login"),Q=a('input[name="username"]'),R=a('input[name="password"]'),S=a("#add-member"),T=a('input[name="newname"]'),U=a('input[name="newusername"]'),V=a('input[name="newpassword"]');a("a",O).bind("click",function(){X()}),a("a",N).bind("click",function(){W()}),Q.focus(),P.bind("mouseenter",function(){var a=Q.val().trim(),b=R.val().trim();a!==""&&b!==""?Z():(P.addClass("is-button-alert"),a==""&&Q.addClass("is-input-alert"),b==""&&R.addClass("is-input-alert"))}).bind("mouseleave",Y),P.bind("click",function(b){b.preventDefault(),n.start(),cb();var c=L.serializeObject();a.post("/login",c,function(b){if("success"===b.status)window.location=b.data.path;else if("fail"===b.status){db(),n.stop(),ui.error(b.data.message).closable().hide(8e3).effect("fade");switch(b.data.code){case"MISSING_FIELD":var c=b.data.missing;for(var d=0;d<c.length;++d)a('input[name="'+c[d]+'"]').addClass("is-input-alert");break;case"BAD_AUTH":R.val("").focus();break;case"NOT_CONFIRMED":}}},"json")}),S.bind("mouseenter",function(){var a=T.val().trim(),b=U.val().trim(),c=V.val().trim();a!=""&&b!=""&&c!=""?bb():(S.addClass("is-button-alert"),a==""&&T.addClass("is-input-alert"),b==""&&U.addClass("is-input-alert"),c==""&&V.addClass("is-input-alert"))}).bind("mouseleave",ab),S.bind("click",function(b){b.preventDefault(),n.start(),cb();var c=M.serializeObject();c.id=S.data("id"),a.put("/signup",c,function(b){if("success"===b.status)window.location=b.data.path;else if("fail"===b.status){db(),n.stop(),ui.error(b.data.message).closable().hide(8e3).effect("fade");switch(b.data.code){case"MISSING_FIELD":var c=b.data.missing;for(var d=0;d<c.length;++d)a('input[name="'+c[d]+'"]').addClass("is-input-alert");break;case"INVALID_EMAIL":case"DUPLICATE_EMAIL":U.val("").addClass("is-input-alert"),U.focus()}}})}),a(".signin-strategy-btn").click(function(a){n.start(),cb()}),a(".resend-conf").live("click",function(b){var c=a(this).itemID();a.post("/resendconf/"+c,{id:c},function(a){if("success"===a.status)return ui.notify(a.data.message).closable().hide(8e3).effect("fade");"error"===a.status&&ui.error(a.data.message).closable().hide(8e3).effect("fade")},"json")});var eb=a("#logo-a"),fb=a("#logo-b"),gb=[eb,fb];a("#header-left").bind("mouseover",function(){eb.hide(),fb.show(),g(gb[0],gb[1]),pulseTimer=a.setIntervalObj(this,500,g,gb),pulseCancel=a.setTimeoutObj(this,5e3,h)}).bind("mouseout",function(){h()}),a("textarea").autogrow();var hb=a("#search-box");navigator.userAgent.indexOf("Firefox")!==-1&&hb.css({padding:"5px 10px"}),hb.bind("keyup search",function(b){x.start();var c=a(this).val().trim().toLowerCase();w.empty(),""===c&&(c="__clear__"),r(c,function(b){if("success"===b.status){for(var d=0;d<b.data.results.length;d++)a(b.data.results[d]).appendTo(w);w.hasClass("adjustable-grid")?v.collage(!0):v.collage(),p(),s(),"__clear__"===c?(w.removeClass("search-results"),F=1):w.addClass("search-results")}else console.log(b.message);x.stop()})}).bind("focus",A),hb.val()!==""&&(w.addClass("search-results"),hb.trigger("keyup")),a(".grid-obj, .trending, .object-title-parent").live("click",function(b){b.preventDefault();var c=a(this).data();a.put("/hit/"+c.id,function(a){if("error"===a.status)return console.log(a.message);window.location="/"+c.key})}),a(".commentor-input-dummy").bind("focus",function(){a(this).hide(),a(this.nextElementSibling).show(),a(this.nextElementSibling.firstElementChild).focus(),D()}),a(".commentor-input").bind("blur",function(){this.value.trim()==""&&(a(this.parentNode).hide(),a(this).val("").css({height:32}),a(this.parentNode.previousElementSibling).show(),D())}).bind("keyup",D),a(".add-comment").bind("click",function(){var b=a(this.previousElementSibling).val();b=a("<div>").html(b).text().trim();if(b==="")return!1;a(this.previousElementSibling).val("").css({height:32}),a(this.parentNode).hide(),a(this.parentNode.previousElementSibling).show();var c=a(this).itemID();a.put("/comment/"+c,{body:b},function(a){if("error"===a.status)return console.log(a.message);"fail"===a.status&&ui.error(a.data.message).closable().hide(12e3).effect("fade")})}),a(".obj-holder").bind("mouseenter",function(){a(".hearts",this).show()}).bind("mouseleave",function(){a(".hearts",this).hide()}),a(".hearts-wrap img, .hearts-back img").bind("mousedown",function(a){a.preventDefault()}),a(".hearts").each(function(){var b=a(this),c=parseInt(b.data("num")),d=0,e=0,f=a(".hearts-back",this),g=a(".hearts-wrap",this);c>0&&q(g,null,c),f.bind("mouseleave",function(a){q(g,null,c)}).bind("mousemove",function(a){d=a.pageX-f.offset().left,e=q(g,d)}).bind("click",function(b){c=e;var d=f.itemID();a.put("/rate/"+d,{val:e},function(a){if("error"===a.status)return console.log(a.message)})})}),a(".obj-details[data-date]").each(function(){var b=a(this),c=new Date(b.data("date")),d;switch(b.data("type")){case"media":d="Added "+Util.toLocaleString(c,"mmm d, yyyy");break;case"profile":d="Contributor since "+Util.toLocaleString(c,"m/d/yy")}b.text(d)}),a(".birthday").each(function(){var b=a(this);b.text(Util.getAge(b.text()))});var ib=a("#media-form"),jb=a("#add-media"),kb=a("#add-media-mask"),lb=a('input[name="post[title]"]'),mb=a('textarea[name="post[body]"]'),nb=a('input[name="post[meta.tags]"]'),ob=a('input[name="my_file"]'),pb=a('label[for="post[title]"]'),qb=a('label[for="post[body]"]'),rb=a('label[for="post[meta.tags]"]'),sb=a('label[for="my_file"]');kb.each(function(a){var b=jb.outerWidth(),c=jb.outerHeight();kb.css({width:b,height:c})}),kb.bind("mouseenter",function(){var a=lb.val().trim(),c=mb.val().trim(),d=ob.val();a!=""&&c!=""&&d!=""?(kb.css("bottom",1e4).hide(),ub()):(jb.addClass("is-button-alert"),a==""&&pb.css("color",b.orange),c==""&&qb.css("color",b.orange),d==""&&sb.css("color",b.orange))}).bind("mouseleave",tb),jb.bind("mouseleave",function(){kb.css("bottom",0),tb()}),ib.transloadit({wait:!0,autoSubmit:!1,onSuccess:function(b){if(b.ok!="ASSEMBLY_COMPLETED"){alert("Upload failed. Please try again.");return}if(a.isEmpty(b.results)){alert("You must choose a file to contribute.");return}var c=ib.serializeObject();c.params=JSON.parse(c.params),c.assembly=b,a.put("/insert",c,function(b){if("error"===b.status)return console.log(b.message);lb.val(""),mb.val(""),nb.val(""),ob=a('input[name="my_file"]')})}})},receiveMedia:function(b){var c=a(b);c.prependTo(w).css({opacity:0}),w.hasClass("adjustable-grid")?v.collage(!0):v.collage(),c.animate({opacity:1},500),p(),s()},receiveComment:function(b,c){var d=a(b),e=a("#coms-"+c),f=a("#recent-comments");f.length>0?(a(f.children()[f.children().length-1]).remove(),f.hasClass("no-member")&&a(".comment-title-name",d).remove(),d.hide().css({opacity:0}).appendTo(f),v.collage(!0,d.height()),p(),setTimeout(function(){d.prependTo(f).show(250).animate({opacity:1},500)},100)):e.length>0&&(d.hide().css({opacity:0}).prependTo(e),a("a.comment-title-parent",d).remove(),v.collage(!0,d.height()),p(),setTimeout(function(){d.show(250).animate({opacity:1},500)},100))},receiveTrends:function(a,b){if(a)return console.log(a);t.receive(b)}}}(jQuery),now.receiveMedia=Island.receiveMedia,now.receiveComment=Island.receiveComment,now.receiveTrends=Island.receiveTrends;