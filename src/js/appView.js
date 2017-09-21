import Backbone from 'backbone';
import HeaderView from './views/headerView';
import SidebarView from './views/sidebarView';
import EventHub from '~/eventHub';

// dependencies for theme
import ProgressService from "~/services/progressService";
import "gentelella-helper"; // smartresize
import "bootstrap";

/**
 * App view (render de diferent sections of the website)
 * @constructor
 */
var AppView = Backbone.View.extend({

    // all supported regions
    /** Posible paths of the webSite
     * @namespace AppView.Regions
     */
    regions: {
        header: null, //e.g. for user details
        filter: null, // filter with statuses
        content: null,
        'content-row': null,
        footer: null
    },

    $containers: {},

    initialize: function () {
        // run NProgress widget
        ProgressService.initialize();
        // find containers
        for (var regionName in this.regions) {
            this.$containers[regionName] = this.$(`.region-${regionName}`);
            var $inner = this.$containers[regionName].find('.region-inner');
            if ($inner.length) {
                this.$containers[regionName] = $inner;
            }
        }
        // create header (we created here as it pretty static)
        this.headerView = new HeaderView({ el: this.$('.top_nav') });
        this.sidebarView = new SidebarView({ el: this.$('.sidebar') });
        this.attachEvents();
    },

    attachEvents: function () {
        this.listenTo(EventHub, 'app:refreshContentHeight', this.refreshContentHeight);
    },

    render: function () {
        // render header and sidebar
        this.headerView.render();
        this.sidebarView.render();
        // static elements
        this.$body = $('body');
        this.$footer = this.$('footer');
        this.$sidebarFooter = this.$('.sidebar-footer');
        this.$leftCol = this.$('.left_col');
        this.$rightCol = this.$('.right_col');
        this.$navMenu = this.$('.nav_menu');
        // recompute content when resizing
        $(window).smartresize(() => {
            this.refreshContentHeight();
        });
        this.refreshContentHeight();
    },

    // switch between different layout types
    // a. default (sidebar, header, footer, main content)
    // b. full-width layout type with grey background (used on login page)
    updateLayoutType: function (layoutType) {
        if (layoutType !== this.layoutType) {
            this.layoutType = layoutType;
            switch (layoutType) {
                case 'default':
                    this.$body.removeClass('login nav-sm').addClass('nav-md');
                    this.headerView.$el.removeClass('hidden');
                    this.sidebarView.$el.removeClass('hidden');
                    this.$footer.removeClass('hidden');
                    break;
                case 'fullwidth-light':
                    this.$body.removeClass('nav-sm nav-md').addClass('login');
                    this.headerView.$el.addClass('hidden');
                    this.sidebarView.$el.addClass('hidden');
                    this.$footer.addClass('hidden');
                    break;
            }
        }
    },

    // refresh content height to not leave blank space at the bottom of the page
    refreshContentHeight: function () {
        // reset height
        this.$rightCol.css('min-height', $(window).height());

        var bodyHeight = this.$body.outerHeight(),
            footerHeight = this.$body.hasClass('footer_fixed') ? 0 : this.$footer.height(),
            leftColHeight = this.$leftCol.eq(1).height() + this.$sidebarFooter.height(),
            contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;
        // normalize content
        contentHeight -= this.$navMenu.height() + footerHeight;
        this.$rightCol.css('min-height', contentHeight);
    },

    // { <region name>: <view> }
    renderLayout: function (regions, layoutType) {
        // this logic is pretty simple and currently doesn't show/hide regions or add/delete class names (this can be necessary and can be easily added)'
        // firstly remove all old views
        for (var regionName in this.regions) {
            var views = this.regions[regionName];

            if (views) {
                if (_.isArray(views)) {
                    _.each(views, (view) => {
                        view.remove();
                    });
                } else {
                    views.remove();
                }
                this.regions[regionName] = null;
            }
        }
        this.updateLayoutType(layoutType || 'default');
        // and then render new views
        for (var regionName in this.regions) {
            if (regions[regionName]) {
                this.regions[regionName] = regions[regionName];
                this.$containers[regionName].removeClass('hidden');
                if (_.isArray(regions[regionName])) {
                    _.each(regions[regionName], (view) => {
                        this.$containers[regionName].append(view.render().$el);
                    });
                } else {
                    this.$containers[regionName].append(regions[regionName].render().$el);
                }
            } else {
                this.$containers[regionName].addClass('hidden');
            }
        }
    },
});
export default AppView;
