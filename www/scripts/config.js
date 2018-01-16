'use strict';

angular
  .module('dawasco')
  .constant('ENV', {
    name: 'development',
    owner: 'DAWASCO',
    title: 'SmartDawasco',
    version: 'v0.1.0',
    description: 'Citizen Feedback System Management Application',
    apiEndPoint: {
      web: 'http://dawasco.herokuapp.com',
      mobile: 'http://dawasco.herokuapp.com'
      // web: 'http://127.0.0.1:3000',
      // mobile: 'http://127.0.0.1:3000'
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
