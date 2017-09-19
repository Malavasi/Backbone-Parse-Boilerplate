// wrapper for NProgress widget (loading line at the top of the page which shows progress)
function ProgressService() { }
ProgressService.prototype = {
    counter: 0,
    initialize: function () {
        // NProgress
        this.increment();

        $(window).load(() => {
            this.decrement();
        });
    },
    increment: function () {
        this.counter++;
        if (this.counter === 1) {
            NProgress.start();
            NProgress.set(0.4);
            this.intervalHandler = setInterval(() => {
                NProgress.inc();
            }, 400);
        }
    },
    decrement: function () {
        setTimeout(() => {
            this.counter--;
            if (this.counter === 0) {
                clearInterval(this.intervalHandler);
                NProgress.done();
            }
        }, 50);
    }
}

export default new ProgressService();