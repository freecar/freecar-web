$(function() {

  Parse.initialize("EIeotpfwEbYb60BJSXW6r8EPFF625L8vK9qgOA7R", 
                   "LKcBN7ZqSwwQX7OmY9Tv9xal2UhPh1RlpiaVGPzC");

  var Route = Parse.Object.extend("Routes", {
    defaults: {
      name: '',
      from: '',
      to: '',
      time: '',
      phone: '',
      comment: ''
    }
  });

  var Routes = Parse.Collection.extend({
    model: Route
  });

  var RouteList = Parse.View.extend({
    el: '.content',
    render: function() {
      var that = this;
      var routes = new Routes;
      var template = _.template($('#add-route-template').html());
      that.$el.html(template);
      routes.query = new Parse.Query(Route);
      //routes.query.equalTo("user", Parse.User.current());
      routes.fetch({
        success: function (routes) {
          var template = _.template($('#route-list-template').html(), 
            {routes: routes.models});
          that.$el.html(template);
        }
      })
    },
    events: {
      'click .logout': 'logOut'
    },
    logOut: function(e) {
      Parse.User.logOut();
      new LogInView();
      this.undelegateEvents();
      delete this;
    },
  });

  var EditRoute = Parse.View.extend({
    el: '.content',
    initialize: function() {
      this.routes = new Routes;
    },
    render: function(options) {
      if (options.id) {
        var that = this;
        that.route = new Route({id: options.id});
        that.route.fetch({
          success: function(route) {
            var template = _.template($('#edit-route-template').html(), {route: route});
            that.$el.html(template);
          }
        })
      } else {
        var template = _.template($('#edit-route-template').html(), {route: null});
        this.$el.html(template);
      }
    },
    events: {
      'submit .edit-route-form': 'saveRoute',
      'click .delete': 'deleteRoute',
      'click .cancel': 'cancel'
    },    
    saveRoute: function(ev) {
      var that = this;
      var route = new Route;
      route.set('name',    this.$('.name').val());
      route.set('from',    this.$('.from ').val());
      route.set('to',      this.$('.to').val());
      route.set('time',    this.$('.time').val());
      route.set('phone',   this.$('.phone').val());
      route.set('comment', this.$('.comment').val());
      var user = Parse.User.current();
      //route.set('user', user);
      route.set('id', this.$('.id').val());
      route.save(null, {
        success: function(route) {
          router.navigate('', {trigger: true});
        },
        error: function(route) {
          console.log('error creating new route');
        }
      });
      return false;
    },
    deleteRoute: function(ev) {
      this.route.destroy({
        success: function() {
          router.navigate('', {trigger: true});
        }
      })
      return false;
    },
    cancel: function(ev) {
      router.navigate('', {trigger: true});
    }
  });

  var LogInView = Parse.View.extend({
    events: {
      "submit form.login-form": "logIn",
      "submit form.signup-form": "signUp"
    },

    el: ".content",

    initialize: function() {
      _.bindAll(this, "logIn", "signUp");
      this.render();
    },

    logIn: function(e) {
      var self = this;
      var username = this.$("#login-username").val();
      var password = this.$("#login-password").val();

      Parse.User.logIn(username, password, {
        success: function(user) {
          routeList.render()
          self.undelegateEvents();
          delete self;
        },

        error: function(user, error) {
          self.$(".login-form .error").html("<button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>Invalid username or password. Please try again.").show();
          this.$(".login-form button").removeAttr("disabled");
        }
      });

      this.$(".login-form button").attr("disabled", "disabled");

      return false;
    },

    signUp: function(e) {
      var self = this;
      var username = this.$("#signup-username").val();
      var password = this.$("#signup-password").val();

      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
        success: function(user) {
          routeList.render()
          self.undelegateEvents();
          delete self;
        },

        error: function(user, error) {
          self.$(".signup-form .error").html(error.message).show();
          this.$(".signup-form button").removeAttr("disabled");
        }
      });

      this.$(".signup-form button").attr("disabled", "disabled");

      return false;
    },

    render: function() {
      this.$el.html(_.template($("#login-template").html()));
      this.delegateEvents();
    }
  });


  var routeList = new RouteList;
  var editRoute = new EditRoute;

  var Router = Parse.Router.extend({
    routes: {
      '': 'home',
      'new': 'new',
      'edit/:id': 'edit'
    },
    home: function() {
      if (Parse.User.current()) {
        routeList.render();
      } else {
        new LogInView();
      }
    },
    new: function() {
      editRoute.render({});
    },
    edit: function(id) {
      editRoute.render({id: id});
    }
  });

  var router = new Router;

  Parse.history.start();

});
