import Backbone from 'backbone';
import _ from 'underscore';

/**
 * event hub (all comunications between widgets should be done through events)
 * @constructor
 */
var EventHub = _.extend({}, Backbone.Events);
/**
 * Glossary of all events on EventHub
 * @namespace
 */
EventHub.events = {
  /** Event related to URL changing
   * Fired by @see {@link FilterView#applyFilter}
   */
  'navigate': { id:'navigate' },
  /** Events related to filtering
   * @namespace */
  'filter': {
    /**
     * Fired by @see {@link FilterView#onChangingFilter}
     * Listened by @see {@link FilterView#render}
     */
    'setState': { id:'filter:setState'}
  },
  /** Events related to ranking
   * @namespace */
  'ranking':{
    /**
     * Fired by @see {@link appRouter#rankingViewer}
     * Listened by @see {@link RankingView#render}
     */
    'setItems': { id:'ranking:setItems'},
  },
};

export default EventHub;
