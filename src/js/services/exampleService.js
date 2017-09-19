import Backbone from 'backbone';

import ParseService from '~/services/parseService';
import Model from '~/models/parseModel';
import Collection from '~/collections/parseCollection';

var exampleService;
export default function () {

    // model
    var ExampleModel = Model.extend({
        className: "Example", //Name of parse class
        defaults: {
            'manualTitle': false,
        }
    });

    // collection
    var ExampleCollection = Collection.extend({
        model: ExampleModel
    });

    // service (extends ParseService)
    var ExampleService = ParseService.extend({
        sortBy: 'createdAt',
        model: ReportAssigneeModel,
        collection: ReportAssigneeCollection,
        // you can also extend any method from ParseService here
    });

    return exampleService || (exampleService = new ExampleService());
};
// only created once for application
