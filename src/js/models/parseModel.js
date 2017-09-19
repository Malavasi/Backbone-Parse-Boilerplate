import ParseService from '~/services/parseService';
import Backbone from 'backbone';

var Model = {
    extend: function (options) {

        // native Parse model
        var ParseModel = Parse.Object.extend({
            className: options.className
        });

        // backbone model which wraps Parse object
        return Backbone.Model
            .extend(options)
            .extend({
                initialize: function (options) {
                    if (options instanceof ParseModel) {
                        Backbone.Model.prototype.set.apply(this, [options.attributes]); // copy properties from Parse.Object to Backbone.Model
                        this.set(options.attributes);
                        this.parseObject = options;
                    } else {
                        this.parseObject = new ParseModel();
                    }
                },
                set: function () {
                    Backbone.Model.prototype.set.apply(this, arguments); // update Backbone model
                    if (this.parseObject) {
                        this.parseObject.set.apply(this.parseObject, arguments); // update Parse model
                    }
                },
                save: function () {
                    return this.parseObject.save.apply(this.parseObject, arguments); // save parse model to server
                }
            });
    }
};

export default Model;