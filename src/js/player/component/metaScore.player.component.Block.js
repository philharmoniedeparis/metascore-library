/**
 * Player Block
 *
 * @requires metaScore.player.pager.js
 * @requires metaScore.player.page.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */

metaScore.namespace('player.component').Block = (function () {

  function Block(configs) {
    // call parent constructor
    Block.parent.call(this, configs);
  }

  metaScore.player.Component.extend(Block);

  Block.defaults = {
    'container': null,
    'properties': {
      'name': {
        'type': 'Text',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.name', 'Name')
        },
        'getter': function(skipDefault){
          return this.data('name');
        },
        'setter': function(value){
          this.data('name', value);
        }
      },
      'x': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.x', 'X')
        },
        'getter': function(skipDefault){
          return parseInt(this.css('left'), 10);
        },
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.y', 'Y')
        },
        'getter': function(skipDefault){
          return parseInt(this.css('top'), 10);
        },
        'setter': function(value){
          this.css('top', value +'px');
        },
      },
      'width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.width', 'Width')
        },
        'getter': function(skipDefault){
          return parseInt(this.css('width'), 10);
        },
        'setter': function(value){
          this.css('width', value +'px');
        }
      },
      'height': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.height', 'Height')
        },
        'getter': function(skipDefault){
          return parseInt(this.css('height'), 10);
        },
        'setter': function(value){
          this.css('height', value +'px');
        }
      },
      'background-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.background-color', 'Background color')
        },
        'getter': function(skipDefault){
          return this.css('background-color', undefined, skipDefault);
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'background-image': {
        'type':'Image',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.background-image', 'Background image')
        },
        'getter': function(skipDefault){
          var value = this.css('background-image', undefined, skipDefault);

          if(value === 'none' || !metaScore.Var.is(value, "string")){
            return null;
          }

          return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        'setter': function(value){
          value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
          this.css('background-image', value);
        }
      },
      'border-width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.border-width', 'Border width')
        },
        'getter': function(skipDefault){
          var value = this.css('border-width', undefined, skipDefault);
          return value !== null ? parseInt(value, 10) : null;
        },
        'setter': function(value){
          this.css('border-width', value +'px');
        }
      },
      'border-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.border-color', 'Border color')
        },
        'getter': function(skipDefault){
          return this.css('border-color', undefined, skipDefault);
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'border-radius': {
        'type': 'BorderRadius',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.border-radius', 'Border radius')
        },
        'getter': function(skipDefault){
          return this.css('border-radius', undefined, skipDefault);
        },
        'setter': function(value){
          this.css('border-radius', value);
        }
      },
      'synched': {
        'type': 'Boolean',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.synched', 'Synchronized pages ?')
        },
        'getter': function(skipDefault){
          return this.data('synched') === "true";
        },
        'setter': function(value){
          this.data('synched', value);
        }
      },
      'pages': {
        'editable':false,
        'getter': function(skipDefault){
          var pages = [];

          this.getPages().each(function(index, page){
            pages.push(page._metaScore.getProperties(skipDefault));
          }, this);

          return pages;
        },
        'setter': function(value){
          this.getPages().remove();

          metaScore.Array.each(value, function(index, configs){
            this.addPage(configs);
          }, this);

          this.setActivePage(0);
        }
      }
    }
  };

  Block.prototype.setupDOM = function(){
    // call parent function
    Block.parent.prototype.setupDOM.call(this);

    this.addClass('block');

    this.page_wrapper = new metaScore.Dom('<div/>', {'class': 'pages'})
      .addDelegate('.page', 'cuepointstart', metaScore.Function.proxy(this.onPageCuePointStart, this))
      .addDelegate('.element', 'page', metaScore.Function.proxy(this.onElementPage, this))
      .appendTo(this);

    this.pager = new metaScore.player.Pager()
      .addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this))
      .appendTo(this);

    this.addPage();
  };

  Block.prototype.onPageCuePointStart = function(evt){
    this.setActivePage(evt.target._metaScore, true);
  };

  Block.prototype.onElementPage = function(evt){
    this.setActivePage(evt.detail.value);
  };

  Block.prototype.onPagerClick = function(evt){
    var active = !metaScore.Dom.hasClass(evt.target, 'inactive'),
      action;

    if(active){
      action = metaScore.Dom.data(evt.target, 'action');

      switch(action){
        case 'first':
          this.setActivePage(0);
          break;
        case 'previous':
          this.setActivePage(this.getActivePageIndex() - 1);
          break;
        case 'next':
          this.setActivePage(this.getActivePageIndex() + 1);
          break;
      }
    }

    evt.stopPropagation();
  };

  Block.prototype.getPages = function(){
    return this.page_wrapper.children('.page');
  };

  Block.prototype.addPage = function(configs){
    var page;

    if(configs instanceof metaScore.player.component.Page){
      page = configs;
      page.appendTo(this.page_wrapper);
    }
    else{
      page = new metaScore.player.component.Page(metaScore.Object.extend({}, configs, {
        'container': this.page_wrapper
      }));
    }

    this.setActivePage(page);

    return page;
  };

  Block.prototype.removePage = function(page){
    var index;

    page.remove();

    if(this.getPageCount() <= 0){
      this.addPage();
    }
    else if(page.hasClass('active')){
      index = Math.max(0, this.getActivePageIndex() - 1);
      this.setActivePage(index);
    }

    return page;
  };

  Block.prototype.getPage = function(index){
    var pages = this.getPages(),
      page = pages.get(index);

    return page ? page._metaScore : null;
  };

  Block.prototype.getActivePage = function(){
    return this.getPage(this.getActivePageIndex());
  };

  Block.prototype.getActivePageIndex = function(){
    var pages = this.getPages(),
      index = pages.index('.active');

    return index;
  };

  Block.prototype.getPageCount = function(){
    return this.getPages().count();
  };

  Block.prototype.setActivePage = function(page, supressEvent){
    var pages = this.getPages();

    if(!(page instanceof metaScore.player.component.Page)){
      page = pages.get(parseInt(page, 10))._metaScore;
    }

    if(page){
      pages.removeClass('active');
      page.addClass('active');
      this.updatePager();

      if(supressEvent !== true){
        this.triggerEvent('pageactivate', {'page': page});
      }
    }
  };

  Block.prototype.updatePager = function(){
    var index = this.getActivePageIndex();
    var count = this.getPageCount();

    this.pager.updateCount(index, count);

    this.data('page-count', count);
  };

  return Block;

})();