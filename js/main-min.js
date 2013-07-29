(function(){window.App={Models:{},Collections:{},Views:{}};window.template=function(e){return _.template($("#"+e).html())};window.vent=_.extend({},Backbone.Events);window.$.fn._show=function(){this.show()};window.$.fn._hide=function(){this.hide()};App.Models.Browser=Backbone.Model.extend({defaults:{hackTypes:[]}});App.Models.Author=Backbone.Model.extend({defaults:{position:0}});App.Collections.Browser=Backbone.Collection.extend({model:App.Models.Browser});App.Collections.Quote=Backbone.Collection.extend({model:App.Models.Author,url:"code/quotes.php",initialize:function(){}});App.Views.Master=Backbone.View.extend({initialize:function(){this.collection.each(function(e){new App.Views.Browser({model:e})},this)}});App.Views.Browser=Backbone.View.extend({hackChilds:null,initialize:function(){this.$el=$("#"+this.model.get("browser"));var g="",f,e=[];f=this.$el.find('[data-type*="-parent"]');_.each(f,function(i,h){e.push($(i).attr("data-type").split("-")[0])},this);this.model.set("hackTypes",e);this.hackChilds=this.$el.find(".hack-wrapper");vent.bind("search",this.handleSearch,this);vent.bind("searchCancelled",this.searchCancelled,this);vent.bind("searchNumber",this.searchNumber,this)},handleSearch:function(f){var g=this.model.get("names"),e=false;_.each(g,function(h){if(h.indexOf(f.browser)==0&&!e){this.show(f);e=true}},this);if(!e){this.hide(f)}},show:function(f){this.$el.show();this.$el.addClass("active");if(f.version!=null){this.hackChilds.hide();var e=this.$el.find('.hack-wrapper[data-version*="'+f.version+'"], .hack-wrapper[data-version="*"]');_.each(e,function(g){_item=$(g);versions=_item.attr("data-version").split("|");_.each(versions,function(h){if(h.indexOf(f.version)==0){_item.show()}if(h=="*"){_item.show()}},this)},this);_.each(this.$el.find('.hack-wrapper[data-version*="+"]'),function(g){_item=$(g);version_plus=_item.attr("data-version").split("+");if(version_plus.length==2){version_plus=parseFloat(version_plus[0]);if(version_plus<=f.version){_item.show()}}},this);_.each(this.$el.find('.hack-wrapper[data-version*="-"]'),function(g){_item=$(g);version_minus=_item.attr("data-version").split("-");if(version_minus.length==2){version_minus=parseFloat(version_minus[0]);if(version_minus>=f.version){_item.show()}}},this);this.$el.addClass("filtered");_.each(this.model.get("hackTypes"),function(g){count=this.$el.find('[data-type="'+g+'-childs"] .hack-wrapper:visible').length;if(count==0){this.$el.find('[data-type="'+g+'-parent"] h3').hide()}},this)}else{this.hackChilds.show();this.$el.removeClass("filtered");this.$el.find('[data-type*="-parent"] h3').show()}},hide:function(e){this.$el.hide();this.$el.removeClass("active")},searchCancelled:function(){this.$el.show();this.$el.removeClass("filtered");this.$el.removeClass("active");this.hackChilds.show();this.$el.find('[data-type*="-parent"] h3').show()},searchNumber:function(e){this.hide()}});App.Views.Search=Backbone.View.extend({el:"input#search",el_parent:null,el_description:null,events:{keyup:"keyup",focus:"focus",blur:"blur"},isSearching:false,regex_split:null,value:null,split:null,browser:null,version:null,timeoutId:null,initialize:function(){this.regex_split=new RegExp("([a-z\\s]+)","gm");this.el_parent=$();this.el_description=$('article[data-type="description"]')},keyup:function(f){this.value=this.$el.val().toLowerCase().trim();if(this.value!=""){this.isSearching=true;this.split=this.value.split(this.regex_split);if(this.split.length>1){this.browser=this.split[1].trim();if(this.split[2]!=""){this.version=this.split[2].trim()}else{this.version=null}vent.trigger("search",{browser:this.browser,version:this.version})}else{this.version=this.split;vent.trigger("searchNumber",{version:this.version})}this.el_description.hide()}else{this.isSearching=false;vent.trigger("searchCancelled");this.el_description.show()}},focus:function(f){clearTimeout(this.timeoutId);this.el_description.hide();$('div[data-type="search"]').addClass("active")},blur:function(f){$('div[data-type="search"]').removeClass("active");this.timeoutId=setTimeout(_.bind(function(){if(!this.isSearching){this.el_description.show()}},this),175)}});App.Views.Quote=Backbone.View.extend({el:$(".quotes"),el_authors:null,el_quote:null,template:template("template_quote"),current:-1,authors:[],authors_size:0,interval_move:null,initialize:function(){this.el_authors=this.$el.find(".quote-authors");this.el_quote=this.$el.find(".quote");this.collection.each(function(f,e){f.set("position",e)},this);vent.bind("click_author",this.handleClick,this);this.el_authors.mousewheel(function(f,g){this.el_authors.scrollLeft(this.el_authors.scrollLeft()-(g*80));f.preventDefault()}.bind(this));this.interval_move=setInterval(function(){this.moveActive()}.bind(this),this.options.speed)},render:function(){this.collection.each(this.addOne,this);this.authors_size=this.authors.length;this.updateText();return this},addOne:function(e){var f=new App.Views.Author({model:e});this.el_authors.append(f.render().el);this.authors.push(f)},handleClick:function(e){if(this.interval_move!=null){clearInterval(this.interval_move);this.interval_move=null}this.updateText(e)},updateText:function(f){var f=typeof f!="undefined"?f:0;if(this.current!=-1){this.authors[this.current].setActive(false);this.authors[f].setActive(true);this.current=f}else{this.authors[this.authors.length-1].setActive(false);this.current=f;this.authors[this.current].setActive(true)}var e=this.template(this.collection.toJSON()[this.current]);this.el_quote.html(e)},moveActive:function(){var e=this.el_quote.width();if((this.current+1)%this.authors_size===0){this.current=-1;this.el_authors.scrollLeft(0)}this.updateText(this.current+1);var f=this.authors[this.current].$el.width(),g=this.authors[this.current].$el.position().left;if((g+f)>=e){this.el_authors.scrollLeft(f*this.current)}}});App.Views.Author=Backbone.View.extend({tagName:"li",template:template("template_author"),events:{click:"clicked"},clicked:function(f){f.preventDefault();vent.trigger("click_author",this.model.get("position"))},render:function(){var e=this.template(this.model.toJSON());this.$el.attr("data-quote",this.model.get("quote"));this.$el.attr("data-author",this.model.get("author"));this.$el.attr("data-link",this.model.get("from"));this.$el.html(e);return this},setActive:function(e){if(e){this.$el.addClass("active")}else{this.$el.removeClass("active")}}});var c=new App.Collections.Browser([{browser:"ch",names:["chrome","ch"]},{browser:"fx",names:["firefox","mozilla firefox","ff"]},{browser:"ie",names:["internet explorer","ie"]},{browser:"sa",names:["safari","apple safari"]},{browser:"op",names:["opera","op"]}]);var b=new App.Views.Master({collection:c});var a=new App.Views.Search();var d=new App.Collections.Quote();d.fetch().then(function(){var e=new App.Views.Quote({collection:d,speed:4000});e.render()});$(document).on("keydown",function(h){var f,g=h.metaKey||h.ctrlKey;if(h.which==65&&!g){f=document.getElementById("an")}if(h.which==67&&!g){f=document.getElementById("ch")}if(h.which==83&&!g){f=document.getElementById("sa")}if(h.which==79&&!g){f=document.getElementById("op")}if(h.which==70&&!g){f=document.getElementById("fx")}if(h.which==73&&!g){f=document.getElementById("ie")}if(typeof f!=="undefined"){f.scrollIntoView(true)}})})();