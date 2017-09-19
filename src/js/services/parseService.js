import Settings from '~/settings.js';
import Parse from 'parse';
import Backbone from 'backbone';
import ProgressService from "~/services/progressService";
import HashService from '~/services/hashService';

// this is base service for all Parse operations
function ParseService() {
    this.initialize();
}
ParseService.extend = Backbone.Model.extend; // extend helper from Backbone

var isInitialized = false; // shared between all Parse services (used to initialize Parse settings one time only)
ParseService.prototype = {
    cache: {}, // used for caching collection
    itemsOnPage: 1000, // max number of items in response
    cacheMinutes: 120, // default cache for collections, can be overriden in service class
    initialize: function () {
        if (!isInitialized) {
            isInitialized = true;
            Parse.serverURL = Settings.parseUrl;
            Parse.initialize(Settings.parseAppId, Settings.parseKey);
        }
    },

    // create Parse query
    _getQuery: function (pageNumber = 0, settings) {
        var query;
        if (settings.rules && settings.rules.or) {
            query = settings.rules.toParseQuery(this.model);
        } else {
            query = new Parse.Query(this.model);
        }
        query.limit(this.itemsOnPage);
        query.ascending(this.sortBy);
        query.skip(this.itemsOnPage * pageNumber);
        query = this._processRules(query,settings.rules);
        return query;
    },

    _getFullQuery: function(settings){
      var query;
      if (settings.rules && settings.rules.or) {
          query = settings.rules.toParseQuery(this.model);
      } else {
          query = new Parse.Query(this.model);
      }
      query.limit(this.itemsOnPage);
      query.ascending(this.sortBy);
      query = this._processRules(query,settings.rules);
      return query;
    },

    _processRules:function(query,rules){
      if(rules){
        for (var key in rules.includes) {
            if (rules.includes.hasOwnProperty(key)) {
                query.include(key);
            }
        }
        for(var i=0; rules.equals && i<rules.equals.length; ++i)
        {
          query.equalTo(rules.equals[i].key, rules.equals[i].val);
        }
        for (var key in rules.greaterThanOrEqualTo) {
            if (rules.greaterThanOrEqualTo.hasOwnProperty(key)) {
                query.greaterThanOrEqualTo(key, rules.greaterThanOrEqualTo[key]);
            }
        }
        for (var key in rules.lessThanOrEqualTo) {
            if (rules.lessThanOrEqualTo.hasOwnProperty(key)) {
                query.lessThanOrEqualTo(key, rules.lessThanOrEqualTo[key]);
            }
        }
        for (var key in rules.contains) {
            if (rules.contains.hasOwnProperty(key)) {
                query.contains(key, rules.contains[key]);
            }
        }
        for (var key in rules.matchesQuery) {
            if (rules.matchesQuery.hasOwnProperty(key)) {
                query.matchesQuery(key, rules.matchesQuery[key].toParseQuery());
            }
        }
      }
      return query;
    },

    // fetch Parse data for one page only
    _fetchPage: function (collection, pageNumber = 0, settings) {
        var query = this._getQuery(pageNumber, settings);
        if (query) {
            ProgressService.increment();
            return query.find().then(models => {
                ProgressService.decrement();
                try {
                    collection.add(models);
                }
                catch (e) {
                    console.error(e);
                }
                return [collection, models];
            });
        } else {
            return Parse.Promise.error("No query");
        }

    },

    // recursive fetch to load all pages of Parse data
    _fetchRecursive: function (collection, page, settings) {
        return new Parse.Promise((resolve, reject) => {
            //console.log(`Loading ${this.model.prototype.className}: page ${page}...`);
            this._fetchPage(collection, page,settings).then(([collection, models]) => {
                if (settings && settings.all && models.length && models.length == this.itemsOnPage) {
                    // load next page of data
                    this._fetchRecursive(collection, ++page, settings).then(args => {
                        // resolve promise if 'waitAll' is set to 'true' (promise will be resolved when all data will be loaded)
                        if (settings && settings.all && settings.waitAll) {
                            resolve(args);
                        }
                    }, err => {
                        reject(err);
                    });
                } else {
                    // resolve if this is last page of data (e.g. number of models is less than 'itemsOnPage')
                    collection.trigger('isLoading', false); // is loading data
                    resolve([collection, models]);
                    return;
                }

                // resolve promise if 'waitAll' is not set to 'true' (promise will be resolved when first page will be loaded)
                if (!settings || !settings.all || !settings.waitAll) {
                    resolve([collection, models]);
                }
            });
        }, err => {
            reject(err);
        });
    },

    /**
     * generate cache key
     * @todo improve key generation so it's generated from the query
     */
    generateCacheKey: function (settings) {
        // here is the most simple cache were we always returns the same collection (sure for specific service only)
        // for some services we can implement complex logic (for example with some merge logic or by userid)
        return HashService.value(this._getFullQuery(settings));
    },

    // search result in cache
    getCachedValue: function (settings) {
        var key = this.generateCacheKey(settings);
        var cachedRecord = this.cache[key];
        if (cachedRecord) {
            if (cachedRecord.expData >= new Date()) {
                return cachedRecord.collection; // item is not expired, so we return it
            } else {
                delete this.cache[key]; // item is expired, so we remove it from cache
            }
        }
    },

    // save result to cache
    addCachedValue: function (collection, settings) {
        var expDate = new Date();
        expDate.setMinutes(expDate.getMinutes() + this.cacheMinutes); // cache data for 10 minutes (can be overriden globally in this file or specifically for some service)

        this.cache[this.generateCacheKey(settings)] = {
            collection: collection,
            expData: expDate
        }
    },

    // fetch items from Parse
    // settings:
    // {
    //   page: numeric (default is 0)
    //   all: boolean (default is false) - load all items. promise will be resolved right after returning items for the first page
    //   waitAll: boolean(default is false) - resolves promise only when all pages will be received
    //   cache: boolean(default is false) - caches collection
    // }
    fetch: function (settings) {

        // check cache for cached value
        if (settings && settings.cache) {
            var cachedValue = this.getCachedValue(settings);
            if (cachedValue) {
                return new Parse.Promise((resolve, reject)=> {
                   resolve(cachedValue);
                 }, (err) => reject(err));
            }
        }

        return new Parse.Promise((resolve, reject) => {
            var collection = new this.collection(); // create collection
            collection.trigger('isLoading', true); // is loading data
            var page = (settings && settings.page) || 0; // set page
            this._fetchRecursive(collection, page, settings).then(([collection, models]) => {
                if (settings && settings.cache) {
                    this.addCachedValue(collection, settings); // cache value
                }
                resolve(collection); // resolve promise
            }, (err) => reject(err));
        });
    },

    fetchById: function(id, settings) {
        var query = new Parse.Query(this.model);
        return query.get(id);
    },

    save: function(model){
      model.save(null, {
        success:function(){
          console.log('save');
        },
        error: function(e){
          console.log('error: ' + e);
        }
      });

    }

}

export default ParseService;
