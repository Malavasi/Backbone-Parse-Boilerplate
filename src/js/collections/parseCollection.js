import Backbone from 'backbone';

var ParseCollection = Backbone.Collection.extend({
    isLoading: false,
    initialize: function () {
        this.on('isLoading', isLoading => {
            this.isLoading = isLoading;
        })
    }
});


export default ParseCollection;