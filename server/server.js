// --- Meta -----------------------------------------------------------------------

Meta = new Mongo.Collection('meta');
Meta.allow({
	insert: function(userId) {
		return userId && Meteor.users.findOne(userId).admin;
	},
	update: function(userId) {
		return userId && Meteor.users.findOne(userId).admin;
	},
	remove: function(userId) {
		return userId && Meteor.users.findOne(userId).admin;
	}
})
Meteor.publish("meta", function () {
	return Meta.find({meta:true},{limit:1});
});
Meteor.startup(function(){
	if (!Meta.findOne({meta:true})) {
		Meta.insert({meta:true,home_image:''});
		console.log('Meta created.');
	}
});


// --- Posts -----------------------------------------------------------------------

Posts = new Mongo.Collection('posts');
Posts.allow({
	insert: function(userId, doc) {
		if (userId) doc.owner = userId;
		return userId || Meteor.users.findOne(userId).admin;
	},
	update: function(userId, doc) {
		return doc.owner === userId || Meteor.users.findOne(userId).admin;
	},
	remove: function(userId, doc) {
		return doc.owner === userId || Meteor.users.findOne(userId).admin;
	}
})
Meteor.publish("posts", function () {
	if (Meteor.users.findOne(this.userId) && Meteor.users.findOne(this.userId).admin) {
		return Posts.find({});
	} else {
		if (Meteor.users.findOne(this.userId)) {
			return Posts.find({$or:[{privacy:'open'},{owner:this.userId}]});
		}
		return Posts.find({privacy:'open'});
	}
});



// --- Startup -----------------------------------------------------------------------

Meteor.startup(function(){
	var adminEmail = "nooitaf@gmail.com";
	var adminUser = Meteor.users.findOne({'emails.0.address':adminEmail});
	//console.log(adminUser);
	if (adminUser) {
		if (adminUser.admin) {
			console.log(adminUser.username + ' is admin.');
			// --remove admin 
		  // Meteor.users.update(adminUser._id, {$set:{admin:false}});
		  // console.log('admin revoced');
 		} else {
		  Meteor.users.update(adminUser._id, {$set:{admin:true}});
			console.log('admin set');		  
		}
	} else {
		console.log('Admin with ' + adminEmail + ' does not exist.');
	}
  
});


// --- User Publications --------------------------------------------------------------

Meteor.methods({
	'updateUser': function(options) {
		console.log(this.userId, options);
		Meteor.users.update({_id:this.userId},
													{$set:{
														username:options.username,
														phone:options.phone
													}
												});
		if (!Meteor.users.findOne({email:options.email})){
			Meteor.users.update({_id:this.userId},
														{$set:{
															'emails':[{address:options.email}]
														}
													});
		}
	},
	'nameOfUserWithId':function(userId){
		return Meteor.users.findOne({_id:userId});;
	}
})

Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'admin': 1}});
  } else {
    this.ready();
  }
});


// --- Images Collection ---------------------------------------------------------

//FS.debug = true;

var ImagesStore = new FS.Store.FileSystem('images-original', {
  path: '~/uploads/'
});

Images = new FS.Collection('images', {
  stores: [ImagesStore],
  filter: {
    maxSize: 1048576 * 4, //in bytes
    allow: {
      contentTypes: ['image/jpeg'],
      extensions: ['jpg']
    }
  }
});


Images.allow({
  insert: function(userId, fileObj) {
  	console.log('========== INSERT ==========='.red);
  	if (userId){
	  	fileObj.owner = userId;
	 		console.log(fileObj.owner);
	    return true;
  	} else {
  		console.log('no userId'.yellow);
  		return false;
  	}
  },
  update: function(userId, fileObj) {
  	console.log('========== UPDATE ============'.red);
  	if (userId) {
	 		console.log(fileObj.owner, userId);
	  	if (fileObj.owner === userId) {
	  		console.log('is owner'.green);
	  		return true;
	  	} else {
	  		console.log('not owner'.red);
	  		if (Meteor.users.findOne(userId).admin) {
	  			console.log('is admin'.green);
	  			return true;
	  		} else {
	  			console.log('not admin'.red);
		  		return false;
	  		}
	  	}
  	} else {
  		return false;
  	}
  },
  remove: function(userId, fileObj) {
  	console.log('>>> '.red + fileObj._id);
  	if (userId) {
	 		console.log('user:' + userId);
	 		console.log('owner:' + fileObj.owner);

	  	if (fileObj.owner === userId) {
	  		console.log('is owner'.green);
	  		return true;
	  	} else {
	  		console.log('not owner'.red);
	  		if (Meteor.users.findOne(userId).admin) {
	  			console.log('is admin'.green);
	  			return true;
	  		} else {
	  			console.log('not admin'.red);
		  		return false;
	  		}
	  	}
  	} else {
  		console.log('no userId'.red);
  		return false;
  	}
  },
  download: function(userId, fileObj /*, shareId*/) {
  	console.log('<<< '.green + fileObj._id.green);
  	if (userId) {
  		console.log('is user')
  		return true;
  	} else {
  		console.log('no user')
  		return false;
  	}
  },
  fetch: []
});



Meteor.publish('images', function() {
  return Images.find({}, { limit: 0 });
});






