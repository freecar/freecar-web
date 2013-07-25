$(function() {

    Parse.initialize("EIeotpfwEbYb60BJSXW6r8EPFF625L8vK9qgOA7R", "LKcBN7ZqSwwQX7OmY9Tv9xal2UhPh1RlpiaVGPzC");

    var Route = Parse.Object.extend("Routes", {
        defaults: {
            name: '',
            from: '',
            to: '',
            time: '',
            phone: '',
            comment: '',
            fbid: 0
        }
    });

    var Routes = Parse.Collection.extend({
        model: Route
    });

    var RouteList = Parse.View.extend({
        el: '.content',
        render: function() {
            var user = Parse.User.current();
            
            if( user ){
                
                $('#login-button').hide();
            }
            
            var that = this;
            var routes = new Routes;
            var template = _.template($('#add-route-template').html());
            that.$el.html(template);
            routes.query = new Parse.Query(Route);
            if (user.get('username') === 'admin') {
                routes.query.limit(500);
            } else {
                routes.query.equalTo('user', user);
            }
            routes.fetch({
                success: function(routes) {
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
            
            $('#login-button').show();
            
            Parse.User.logOut();
            new LogInView();
            this.undelegateEvents();
            delete this;
        },
    });

    var EditRoute = Parse.View.extend({
        el: '#editModal',
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
                        that.$el.modal("show");
                        router.navigate('', {trigger: true});
                    }
                })
            } else {
                var template = _.template($('#edit-route-template').html(), {route: null});
                this.$el.html(template);
                this.$el.modal("show");
                router.navigate('', {trigger: true});
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
            var user = Parse.User.current();
            route.set('name', this.$('.name').val());
            route.set('from', this.$('.from ').val());
            route.set('to', this.$('.to').val());
            route.set('time', this.$('.time').val());
            route.set('phone', this.$('.phone').val());
            route.set('comment', this.$('.comment').val());
            route.set('user', user);
            route.set('fbid', user.get('fbid'));
            route.set('id', this.$('.id').val());
            route.save(null, {
                success: function(route) {
                    router.navigate('', {trigger: false});
                    routeList.render();
                },
                error: function(route, error) {
                    console.log('error: ' + error.code + ' ' + error.message);
                }
            });
            $(".modal:visible").modal("hide");
            return false;
        },
        deleteRoute: function(ev) {
            this.route.destroy({
                success: function() {
                    router.navigate('', {trigger: true});
                    routeList.render();
                    $(".modal:visible").modal("hide");
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
            "submit form.signup-form": "signUp",
            "click .fb-login": "facebookLogin"
        },
        el: ".content",
        initialize: function() {
            _.bindAll(this, "logIn", "signUp", "facebookLogin");
            this.render();
        },
        facebookLogin: function(e) {
            var self = this;
            Parse.FacebookUtils.logIn('email', {
                success: function(user) {
                    
                    $('#login-button').hide();
                    
                    routeList.render();
                    self.undelegateEvents();

                    delete self;
                    if (!user.existed()) {
                        // User signed up and logged in through Facebook
                    } else {
                        // User logged in through Facebook
                    }

                    FB.api('/me', function(response) {
                      user.set('fbid', parseInt(response.id));
                      user.set('email', response.email);
                      user.save();
                    });                    
                },
                error: function(user, error) {
                    // User cancelled the Facebook login or did not fully authorize
                }
            });
            $(".modal:visible").modal("hide");
        },
        logIn: function(e) {
            var self = this;
            var username = this.$("#login-username").val();
            var password = this.$("#login-password").val();

            Parse.User.logIn(username, password, {
                success: function(user) {
                    
                    $('#login-button').hide();
                    $(".modal:visible").modal("hide");
                    
                    routeList.render();
                    self.undelegateEvents();
                    delete self;
                },
                error: function(user, error) {
                    self.$(".login-form .error").show();
                }
            });

            return false;
        },
        signUp: function(e) {
            var self = this;
            var username = this.$("#signup-username").val();
            var password = this.$("#signup-password").val();

            Parse.User.signUp(username, password, {ACL: new Parse.ACL()}, {
                success: function(user) {
                    
                    $('#login-button').hide();
                    $(".modal:visible").modal("hide");
                    
                    routeList.render()
                    self.undelegateEvents();
                    delete self;
                },
                error: function(user, error) {
                    self.$(".signup-form .error").html(error.message).show();
                }
            });

            return false;
        },
        render: function() {
            var that = this;
            var routes = new Routes;
            routes.query = new Parse.Query(Route);
            routes.query.limit(500);
            routes.fetch({
                success: function(routes) {
                    var template = _.template($('#public-view-template').html(),
                            {routes: routes.models});
                    that.$el.html(template);

                    //updateTables();
                    //init dataTable


                    var oTable = $('#routestable').dataTable({
                        "bPaginate": false,
                        "bLengthChange": false,
                        "oLanguage": {"sSearch": "Փնտրել"}
                    });


                    $("body").delegate("a.use-this-filter", "click", function(ev) {
                        ev.preventDefault();
                        oTable.fnFilter($(this).text());
                        $(".back-to-routes span").html($(this).text());
                        $(".back-to-routes-container").show();
                        $(".dataTables_filter").hide();
                    });

                    // $("a.use-this-filter").click(function(ev){

                    // });
                    $(".back-to-routes").click(function() {
                        oTable.fnFilter("");
                        $(".back-to-routes-container").hide();
                        $(".dataTables_filter").show();
                    });
                    //  setTimeout(function(){
                    //    updateTables();
                    // },300);
                }
            })
            this.delegateEvents();

        }
    });

    var ReviewView = Parse.View.extend({
        el: '.content',
        initialize: function(id) {
            this.render(id);
        },
        // @todo: Ideally the permalink method should resist in Route class
        permalink: function(id) {
            return window.location.hostname + '/route/' + id;
        },
        render: function(id) {
            var that = this;
            var template = _.template($('#reviews-route-template').html());
            that.$el.html(template);
            that.$('div.fb-comments').data('href', this.permalink(id));
            // FB SDK is doing one-time parse at the end of page load
            // We will need to do re-parse on other cases.
            if (!_.isUndefined(FB)) {
                FB.XFBML.parse();
            }
        }
    })

    var routeList = new RouteList;
    var editRoute = new EditRoute;

    var Router = Parse.Router.extend({
        routes: {
            '': 'home',
            'new': 'new',
            'edit/:id': 'edit',
            'reviews/:id': 'reviews'
        },
        home: function() {
            if (Parse.User.current()) {
                routeList.render();
            } else {
                new LogInView();
            }
        },
        new : function() {
            editRoute.render({});
        },
        edit: function(id) {
            editRoute.render({id: id});
        },
        reviews: function(id) {
            new ReviewView(id);
        }
    });

    var router = new Router;

    Parse.history.start();

});
