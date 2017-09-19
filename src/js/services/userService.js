import ParseService from '~/services/parseService';
import Backbone from 'backbone';
import EventHub from '~/eventHub';
import Model from '~/models/parseModel';
import Collection from '~/collections/parseCollection';

// model
var UserModel = Model.extend({
  className: "_User",
});

// collection
var UserCollection = Collection.extend({
  model: UserModel,
});

var UserService = ParseService.extend({
  sortBy: 'createdAt',
  itemsOnPage: 100,
  model: UserModel,
  collection: UserCollection,
  role_buffer: [],


  isAuthorized: function() {
    return Parse.User.current();
  },
  authorize: function(login, pwd) {
    return Parse.User.logIn(login, pwd).then(() => {
      EventHub.trigger('login');
    });
  },
  logOut: function() {
    Parse.User.logOut().then(() => {
      EventHub.trigger('logout');
      Backbone.history.loadUrl(Backbone.history.fragment);
    });
  },
})

var userService;
export default function() {
  return userService || (userService = new UserService());
};
// only created once for application
