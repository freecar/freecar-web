FreeCar
=======

FreeCar - Carpooling in Armenia

Description
-----------

FreeCar is a simple web application that allows users (drivers) to add routes so others (potential passengers) can carpool.

The backend runs on [Parse](http://parse.com/), a backend-as-a-service that simplifies app development by providing database, user management, push notifications and other typical functionality and SDK for Web, iOS, Android and other platforms. With Parse we can quickly prototype the app and start developing iOS/Android versions.

The Javascript API of Parse is based on [Backbone.js](http://backbonejs.org/), slick Javacsript framework for structuring web apps.


The Freecar web application is deployed on [Heroku](http://www.heroku.com/), a platform-as-a-service as a Ruby application. The config.ru is the body of the app, which basically serves the files as an HTTP server.

The latest version of deployment app can be found at: http://freecar.herokuapp.com.


Requirements
------------

The Freecar is created as an Heroku app and in order to run it locally you need to install Ruby and the Heroku Toolbelt.

However you can run it also off the desktop by simply opening the public/index.html in the browser.

The free plan of the Parse does not allow collaboration and only one developer can access the backend. In order to use it locally you need to create an app in Parse and replace the Application and Client API keys in the public/js/freecar.js.


Support
-------
I'll be happy to answer all of your questions. Please write me at yeghiazaryan@gmail.com.

Happy Coding!
