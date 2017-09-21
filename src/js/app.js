import Backbone from 'backbone';
import AppRouter from '~/appRouter';
import EventHub from '~/eventHub';

var appRouter = new AppRouter();
window.appRouter = appRouter;
Backbone.history.start()

EventHub.on('navigate', (fragment, options) => {
    appRouter.navigate(fragment, options);
});
