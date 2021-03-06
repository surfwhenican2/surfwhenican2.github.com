$(document).ready(function() {

  Parse.$ = jQuery;
  Parse.initialize("DtUZe2joxXeGAKifpAS2MI2Nu2uOanF9IJAyosBy", "N5gB3KKFd3Ii0M6cBxIUvCIXLbM93fDtOE65jtc0");

  var AppView = Parse.View.extend({
  
    el: $(".navbar"),

    events: {
    	'click #signInSubmitButton':'signIn',
    	'click #signInButton':'showSignInModal',
    	'click #signOutButton': 'signOut',
    	'click #usernameLink': 'signUpModal',
    	'click #signupbutton': 'signUp',
    	'click #latestProjects': 'latestProjects',
    	'click #startProject':'createProject',
    	'click #forgotPassword':'forgotPassword',
    	'click #sendResetPasswordButton':'resetPassword'
    },
    
    initialize: function() {
    	_.bindAll(this, 'render', 'signIn', 'showSignInModal', 'signOut', 'signUpModal', 'signUp', 'latestProjects', 'createProject');
      	this.render();
    },
    render: function() {
    	if (Parse.User.current()){
    		$('#signInButton').hide();
    		$('#loggedText').html('<a href="#profile" id="loggedInUser" class="navbar-link">'+Parse.User.current().get("fullName")+'</a>');
    	} else {
    		$('#signOutButton').hide();
    		$('#loggedText').html('<a id="usernameLink" class="navbar-link">Sign Up</a>');
    	}
    	return this;
    },
    signIn: function () {
    	  if (document.getElementById("signInButton").innerHTML == "Sign Out") Parse.User.signOut();
		  var username = $("#username").val();
		  var password = $("#password").val();
		  Parse.User.logIn(username, password, {
			  success: function(user) {
			  	$('#loggedText').html('<a href="#profile" id="loggedInUser" class="navbar-link">'+user.get("fullName")+'</a>');
			    $('#signInButton').hide();
			    $('#signOutButton').show();
			  },
			  error: function(user, error) {
			  	$("#signInAlert").append('<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert">×</button>'+error.message+'</div>');
			  }
			});
		  $('#signInModal').modal('hide');
    },
    showSignInModal: function () {
    	$('#signInModal').modal();
    },
    signOut: function (){
    	Parse.User.logOut();
		$('#loggedText').html('<a href="#" id="usernameLink" class="navbar-link">Sign Up</a>');
		$('#signOutButton').hide();
		$('#signInButton').show();
    },
    signUpModal: function () {
    	$('#signUpModal').modal();
    },
    signUp: function (){
	  	  var username = $("#signupusername").val();
		  var pass = $("#signuppassword").val();
		  var fullName = $('#signupfullname').val();
		  var age = $('#signupAge').val();
			Parse.User.signUp(username, pass, {"age":age, "email": username, "fullName":fullName, "personalBio":"You have not submitted a bio yet.", "profilePhotoUrl":"./surf.jpg","currentCity":"Add your current city.", "affiliations":"You aren't affiliated with any organizations yet."}, {
			  success: function(user) {
			  	Parse.Cloud.run("sendSignUpEmail", {"email": username, "fullName":fullName} , {
			  		success: function (){
			  			console.log("Sent Sign Up Email to new User.");
			  		},
			  		error: function (){
			  			console.log("Failure sending email.");
			  		}
			  	});
			    $('#signUpAlert').append('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">x</button>Welcome to the Christian Fund '+fullName+'. Were so glad to have you.</div>');
			    $('#signInButton').hide();
			    $('#signOutButton').show();
			    $('#signupbutton').hide();
			    $('#cancelsignupbuttton').html('Close');
			    $('#loggedText').html('<a href="#profile" class="navbar-link">Welcome '+fullName+'.</a>');

			  },
			  error: function(user, error) {
			  	$("#signUpAlert").append('<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert">×</button>'+error.message+'</div>');
			  }
			});
		$('#signInModal').modal('hide');
	  
    },
    latestProjects: function (){
    	console.log("Latest Projects");
    },
    profileView: function() {
    	new ProfileView();
    },
    createProject: function() {
    	new CreateNewItem();
    },
    forgotPassword: function (){
    	$('#signInModal').hide();
    	$('#forgotPasswordModal').modal();
    },
    resetPassword: function(){
    	var email = $('#resetPasswordEmail').val();
    	Parse.User.requestPasswordReset(email, {
		  success: function() {
		    alert("Password is being reset.");
		    $('#passwordResetAlert').append('<div class="alert alert-success"><button type="button" class="close" data-dismiss="modal">x</button>Check your email to reset your password.</div>');
		  },
		  error: function(error) {
		    alert("Error: " + error.code + " " + error.message);
		  }
		});
    }
  });

  var ProfileView = Parse.View.extend({

  	el: $('#mainapp'),

  	events: {
  		'click #password':'changePassword',
  		'click #bioUpdate':'addBio',
  		'click #bioSubmitButton':'submitBio',
  		'click #locSubmitButton':'submitLoc',
  		'click #changePasswordSubmit':'verifyPassword',
  		'click #currentLocation':'addLocation',
  		'click #profilePageImage':'showPhotoUploadModal',
  		'click #submitPhotoButton':'uploadProfilePhoto',
  		'click #addAffiliationsButton':'addAffiliations',
  		'click #affiliationSpans':'removeAffiliation'
  	},

  	template: _.template($('#profile-template').html()),

  	initialize: function () {
  		_.bindAll(this, 'render', 'addBio', 'changePassword', 'submitBio', 'submitLoc', 'verifyPassword','addAffiliations','uploadProfilePhoto');
  		var user = Parse.User.current();
  		console.log(user);
  		if (user){
  			this.model = user;
  			this.render();
  		} else {
  			console.log("no user logged in.");
  		}
  	},
  	render: function () {
		$(this.el).html(this.template(this.model.toJSON()));
		$.each(this.model.get("affiliations"), function(key, value){
			$('#affiliations').append('<button type="button" itemid="'+value+'" class="btn btn-primary btn-sm">'+value+'</button><span id="affiliationSpans" itemid="'+value+'"class="glyphicon glyphicon-remove"></span>');
		})
		return this;
  	},
  	changePassword: function () {
  		$('#changePasswordModal').modal('show');
  	},
  	verifyPassword: function (){
  		console.log("verify password");
  	},
  	addBio: function (){
  		$('#bioInputItems').show();
  	},
  	submitBio: function (){
  		var bio = $('#bioText').val();
  		var user = Parse.User.current();
  		user.set("personalBio", bio);
  		user.save(null, {
			  success: function(user) {
			  	$('#personalBio').html('<p>'+bio+'</p>');
			  	$("#personalBio").append('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">x</button>You successfully updated your personal bio.</div>');
			  },
			  error: function () {
			  	alert("Error saving your bio. Try again.");
			  }
		});
		$('#bioInputItems').hide();
	},
	addLocation: function () {
		$('#currLoc').show();
		var input = document.getElementById('locCity');
		var autocomplete = new google.maps.places.Autocomplete(input);
	},
	submitLoc: function (){
		var loc = $('#locCity').val();
  		var user = Parse.User.current();
  		user.set("currentCity", loc);
  		user.save(null, {
			  success: function(user) {
			  	$('#currentCity').html('<p>'+loc+'</p>');
			  	$('#currentCity').append('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert">x</button>You successfully updated your current city.</div>');
			  },
			  error: function (error) {
			  	alert("Error saving your Location." + error.message);
			  }
		});
		$('#currLoc').hide();
	},
	showPhotoUploadModal: function (){
		$('#changeProfilePhotoModal').modal();
	},
	uploadProfilePhoto: function (){
		var fileUploadControl = $("#profilePhotoFileUpload")[0];
		if (fileUploadControl.files.length > 0) {
		  	var file = fileUploadControl.files[0];
		  	var name = "profilephoto.jpg";
		  	var parseFile = new Parse.File(name, file);
		  	parseFile.save().then(function() {
			  	alert("Profile photo saved successfully. Now setting it for the user.");
			  	$('#changeProfilePhotoModal').modal('hide');
			  	var user = Parse.User.current();
				user.set("profilePhoto", parseFile);
				user.set("profilePhotoUrl", parseFile.url());
				user.save().then(function(){
					console.log("Saved the photo and url.");
					$('#profilePageImage')[0].src = parseFile.url();
				});
			}, function(error) {
			  	alert("Error: "+error.message);
			});
		}
	},
	addAffiliations: function(){
		var org = $('#additionalAffiliations').val();
		console.log(org);
		var user = Parse.User.current();
		user.addUnique("affiliations", org);
		user.save();
		$('#affiliations').append('<button type="button" class="btn btn-primary btn-sm">'+org+'</button><span id="affiliationSpans" itemid="'+org+'"class="glyphicon glyphicon-remove"></span>');
	},
	removeAffiliation: function(ev){
		var aff = $(ev.currentTarget).attr('itemid');
		$(ev.currentTarget).remove();
		$('button').filter(":contains('"+aff+"')").remove();
		this.model.remove("affiliations", aff);
		this.model.save();
	}
  });

  
var Item = Parse.Object.extend("Item", {
	 defaults:{
		title: "NULL",
		description: "NULL",
		sponsor: "NULL",
		shortDescription: "NULL",
		imgUrl: "img.jpg",
		city: "NULL",
		open: false
	 }, 
	 initialize: function() {
		if(!this.get("title")) this.set({"title": this.defaults.title});
		if(!this.get("description")) this.set({"description": this.defaults.description});
		if(!this.get("sponsor")) this.set({"sponsor": this.defaults.sponsor});
		if(!this.get("shortDescription")) this.set({"shortDescription": this.defaults.shortDescription});
		if(!this.get("imgUrl")) this.set({"imgUrl": this.defaults.imageUrl});
		if(!this.get("open")) this.set({"open": this.defaults.sponsor});
	}
});

  //Item Collection
  // --------------
  var ItemCollection = Parse.Collection.extend({
  
  	model:Item,
  	
  	getOpen: function (){
	  	return this.where({open:true});
  	}
  });

  var ListItemView = Parse.View.extend({
  
	 tagName: "ul",

	 template: _.template($('#item-template').html()),

	 events: {
	 },
	 
	 initialize: function() {
		 _.bindAll(this, 'render');
		 this.model.on('change', this.render, this);
	 },
	 render: function() {
		 var $el = $(this.el);
		 $el.html(this.template(this.model.toJSON()));
		 return this;
	 }
  });

  var ItemDetailView = Parse.View.extend({
  
  	 el: "#mainapp",

  	 template: _.template($("#item-detail-view").html()),
  	 
  	 events: {	 
  	 },
  	 
	 initialize: function(options){
	 	console.log(options.itemid);
	 	var self = this;
	 	_.bindAll(this, 'render');
	 	var Item = Parse.Object.extend("Item");
	 	var query = new Parse.Query(Item);
	 	if (options.itemid){
	 		query.get(options.itemid, {
			  success: function(item) {
			  	console.log(item);
			  	self.render(item);
			  },
			  error: function(object, error) {
			  	$('#itemdetailalertdiv').append('<div class="alert alert-danger"><button type="button" class="close" data-dismiss="alert">x</button>Item could not be found.</div>');
			  	console.log(error.message);
			  }
			});
	 	} else {
			query.first({
			  success: function(item) {
			  	self.render(item);
			  },
			  error: function(object, error) {
			  	console.log(error.message);
			  }
			});
		}

	 },
	  render:function (item){
		  $(this.el).html(this.template(item.toJSON()));
		  this.delegateEvents();
		  return this;
	  }
  });
  
  var CreateNewItem = Parse.View.extend({
  
	  events:{  
	  	"click #textFormSubmit":"submitText",
	  	"click #projectPhotoUploadButton":"submitMedia",
	  },
	  
	  el: $("#mainapp"),
	  
	  initialize: function() {
		  var self = this;
		  _.bindAll(this, 'render', 'submitText', 'submitMedia');
		  this.$el.html(_.template($('#create-new-item').html()));
		  this.render();
	  },
	  render: function() {
		  $('#newitemdescription').ckeditor();
		  $('#newitem-endDate').datepicker();
		  return this;
	  },
	  submitText: function() {
		  var title1 = this.$("#newitem-title").val();
		  var sponsor1 = this.$("#newitem-sponsor").val();
		  var shortdesc1 = this.$("#newitem-shortDescription").val();
		  var projectCityLocation = this.$("#projectCityLocation").val();
		  var endProjectDate = new Date();
		  endProjectDate = $('#newitem-endDate').datepicker('getDate');
		  var access = new Parse.ACL(Parse.User.current());
		  access.setPublicReadAccess(true);
		  var fullname = Parse.User.current().get("fullName");
		  var Item = Parse.Object.extend("Item");
		  var item = new Item();
		  item.save({
			title: title1,
			description: "test",
			shortDescription: shortdesc1,
			sponsor: sponsor1,
			imgUrl: "img.jpg",
			open: true,
			endDate: endProjectDate,
			percentFunded: 0,
			city: projectCityLocation,
			host: fullname, 
			ACL: access }, {
				success: function(item) {
					alert("Success saving " + item.id);
					$('#postAlert').append('<div class="alert alert-success"><button type="button" class="close" data-dismiss="alert" onclick="$("#collapseOne").collapse("hide");">x</button>Your service project was created successfully. You can view it by navigating to your profile.</div>');
					$('#collapseTwo').collapse('show');
					$('#renderedTitle').html(title1);
					$('#renderedShortDesc').html(shortdesc1);
					$('#renderedLocation').html(projectCityLocation);
				},
				error: function (item, error){
					console.log(item);
					console.log(error);
					alert("error saving.");
				}
				  
		  });  
	  },
	  submitMedia: function (){
	  	var fileUploadControl = $("#projectPhotoFileUpload")[0];
		if (fileUploadControl.files.length > 0) {
		  	var file = fileUploadControl.files[0];
		  	var name = "photo.jpg";
		  	var parseFile = new Parse.File(name, file);
		  	parseFile.save().then(function() {
			  	alert("photo saved to cloud.");
			  	$('#renderedProfilePhoto').attr("src", parseFile.url());
			}, function(error) {
			  	console.log("Error: "+error.message);
			});
		}
		var user = Parse.User.current();
		user.set("profilePhoto", parseFile);
		profilePhoto.save();
	  }
  });


  var AllItemsView = Parse.View.extend({
	 
	 el: $('.lowerSection'),
	 
	 initialize: function() {
		 var self = this;
		 _.bindAll(this, 'render', 'addOne', 'addAll');
		 this.$el.html(_.template($("#all-items-template").html()));
		 this.items = new ItemCollection;
		 this.items.on('add', this.render, this);
		 this.items.query = new Parse.Query(Item);
		 this.items.query.equalTo("open", true);
		 this.items.fetch({
			 success: function(collection){
			 	self.render();
			 },
			 error: function(error) {
				 console.log(error);
			 }
		 });
	 },
	 addOne: function(item) {
     	var view = new ListItemView({model:item});
     	this.$("#item-list").append(view.render().$el);
     },
	 render: function() {
	 	this.delegateEvents();
	 	this.addAll();
	 	return this;
	 },
     addAll: function(collection) {
     	this.$("#item-list").html("");
     	this.items.each(this.addOne);
     }
  });

  var LocalItems = Parse.View.extend({

  	el: $('.localSection'),

  	events:  {
  		'click #changeCity':'changeCity'
  	},

  	initialize: function() {
  		var self = this;
		 _.bindAll(this, 'render');
		 this.items = new ItemCollection;
		 this.items.on('add', this.render, this);
		 this.items.query = new Parse.Query(Item);
		 this.items.query.equalTo("open", true);
		 var city = $('#currentCityCarouselCity').text();
		 this.items.query.equalTo("city", city);
		 this.items.fetch({
			 success: function(collection){
			 	self.render();
			 },
			 error: function(error) {
				 console.log(error);
			 }
		 });
  	},
  	render: function(){
  		this.delegateEvents();
  		var size = this.items.length;
  		var i = 1;
  		var j = 1;
  		$('#localCarouselInner').append('<div class="item active"><div class="ui-grid-b" id="item'+(j-1)+'">');
  		if (size == 0) {
  			$('#localCarouselInner').html('<div class="item active"><h4>There are no projects in this city currently.</h4></div>');
  			return this;
  		}

  		for (i; i <= size; i++)
		{
			if ((i-1) % 3 == 0 ) {
				var item = "#item"+(j-1);
				$(item).append('<div class="ui-block-a" id="element'+(i-1)+'">');
			} else if ((i-1) % 3 == 1 ) {
				var item = "#item"+(j-1);
				$(item).append('<div class="ui-block-b" id="element'+(i-1)+'">');
			} else {
				var item = "#item"+(j-1);
				$(item).append('<div class="ui-block-c" id="element'+(i-1)+'">');
			}
			var view = new ListItemView({model:this.items.at(i-1)});
			$('#element'+(i-1)).append(view.render().$el);
			$(item).append('</div>');
			if ( i % 3 == 0) {
				j++;
				$('#localCarouselInner').append('</div>');
				$('#localCarouselInner').append('<div class="item"><div class="ui-grid-b" id="item'+(j-1).toString()+'">');
			}
		}
		$('#localCarouselInner').append('</div>');
		$('#localCarousel').carousel('pause');
  		return this;
  	},
  	changeCity: function(){
  		$('#currentCityCarouselCity').html('<select id="dropdown_selector"><option value="" disabled="disabled" selected="selected">Select a City</option><option value="San Diego">San Diego</option><option value="San Francisco">San Francisco</option></select>')
  		$('#dropdown_selector').change(function() {
  			var option = $(':selected').text();
  			$('#currentCityCarouselCity').html(option);
  			$('#localCarouselInner').html('');
  			new LocalItems({city:option});
		});
  	}
  })

 var ListItemView = Parse.View.extend({

 	tagName: "div",

	 template: _.template($('#item-template').html()),
	 
	 initialize: function() {
		 _.bindAll(this, 'render');
	 },
	 render: function() {
		 var $el = $(this.el);
		 $el.html(this.template(this.model.toJSON()));
		 return this;
	 }
  });

  var FeatItemView = Parse.View.extend({
  
	 className: "item",

	 template: _.template($('#featured-items-template').html()),
	 
	 initialize: function() {
	 	console.log("Initializing ListItemView...");
		 _.bindAll(this, 'render');
		 this.model.on('change', this.render, this);
	 },
	 render: function() {
		 $(this.el).html(this.template(this.model.toJSON()));
		 return this;
	 }
  });


var ChangePasswordView = Parse.View.extend({

    events: {
      "submit form.change-password-form": "changePassword"
    },

    el:".main",

    initialize: function() {
      _.bindAll(this, "changePassword");
      this.render();
    },

    changePassword: function(e) {
      var self = this;
      var newPassword = this.$("#new-password").val();
      var user = Parse.User.current();
      user.setPassword(newPassword);
      user.save(null, {
        success: function(user) {
          console.log(user);
          alert("Your password has been successfully changed. You may now log in with your new password.");
        },
        error: function(error){
          console.log(error);
        }
      });
      this.$(".change-password-form button").attr("disabled", "disabled");
      return false;
    },
    render: function() {
      this.$el.html(_.template($("#changePasswordModal").html()));
      this.delegateEvents();
    }
   });

   var AppState = Parse.Object.extend("AppState", {
   });
  
   var AppRouter = Parse.Router.extend({
	  routes:{
		  "":"home",
		  "items/:id":"itemDetail",
		  "createProject":"createProject",
		  "items":"allItems",
		  "profile":"profile",
		  "startProject":"createProject"
	  },
	  initialize: function(options){
		  
	  },
	  home: function (){
    	//new AllItemsView({});
    	console.log("Home called.");
    	new LocalItems({});
		  
	  },
	  itemDetail: function(id){
	  	new ItemDetailView({itemid:id});
	  },
	  createProject: function () {
	  	new CreateNewItem();
	  },
	  allItems: function () {
	  	new AllItemsView();
	  },
	  profile: function () {
	  	new ProfileView();
	  }
   });

  var state = new AppState;
  var app_router = new AppRouter;
  new AppView();
  Parse.history.start();
});

