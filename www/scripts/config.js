'use strict';

angular
    .module('dawasco')
    .constant('ENV', {
        name: 'development',
        owner: 'DAWASCO',
        title: 'SmartDawasco',
        version: 'v0.1.0',
        description: 'Citizen Feedback System',
        apiEndPoint: {
            web: 'http://dawasco.herokuapp.com',
            mobile: 'http://dawasco.herokuapp.com'
        },
        settings: {
            name: 'open311',
            email: 'example@example.com',
            phone: '(000) 000 000 000',
            currency: 'USD',
            dateFormat: 'dd/MM/yyyy',
            timeFormat: 'hh:mm:ss',
            defaultPassword: 'guest'
        }
    });
