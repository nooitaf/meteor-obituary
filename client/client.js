// ------------- Meta
Meta = new Mongo.Collection('meta');
Meteor.subscribe('meta');


// ------------- Posts
Posts = new Mongo.Collection('posts');
Meteor.subscribe('posts');


// ------------- Images
var ImagesStore = new FS.Store.FileSystem('images-original');

Images = new FS.Collection('images', {
  stores: [ImagesStore],
  filter: {
    allow: {
      contentTypes: ['image/jpeg']
    }
  }
});

Meteor.subscribe('images');


// user profile

Template.profile.events({
  'click .submit': function(e,t){
    e.preventDefault();
    var username = t.find('.username').value;
    var email = t.find('.email').value;
    var phone = t.find('.phone').value;
    Meteor.call('updateUser',{
      username:username,
      phone:phone,
      email:email
    });
  }
})
Template.profile.helpers({
  'firstEmail': function(emails){
    return emails[0].address;
  }
})

// Posts
Template.addPost.events({
  'click .add-post-plus': function(e,t){
    Session.set('addingPostOpen',true);
  },
  'click .submit' : function(e,t){
    e.preventDefault();
    var privacy = t.find('.post-privacy').value;
    var text = t.find('.post-text').value;
    var name = t.find('.post-name').value;
    var font = t.find('.post-font').value;
    var postId = Posts.insert({
      privacy:privacy,
      text:text,
      name:name,
      font:font,
      time:moment().valueOf()
    });

    var images = t.find('.post-images').files;
    _.each(images,function(file){
      var fileObj = new FS.File(file);
      fileObj.privacy = privacy;
      fileObj.postId = postId;
      Images.insert(fileObj);
    })

    Session.set('addingPostOpen',false);

    // reset inputs
    t.find('.post-privacy').value = 'private';
    t.find('.post-text').value = '';
    t.find('.post-name').value = '';
    t.find('.post-font').value = 'Halant';
    t.find('.post-images').value = '';

  }
})
Template.addPost.helpers({
  'addingPostOpen':function(){
    return Session.get('addingPostOpen');
  }
})



Template.posts.helpers({
  'posts':function(){
    return Posts.find({},{sort:{time:-1}});
  },
  'images':function(){
    return Images.find({postId:this._id});
  },
  'isPrivate':function(){
    return this.privacy === 'private';
  },
  'isAdmin':function(){
    return Meteor.user() && Meteor.user().admin;
  },
  'textWithBrakes':function(text){
    return text.replace(/(?:\r\n|\r|\n)/g, '<br />');
  },
  'niceDate':function(){
    return moment(this.time).format("DD|MM|YYYY")
  },
  'nameOfUserWithId': function(userId){
    var username = Meteor.call('nameOfUserWithId',userId);
    console.log(username)
    return username;
  }
})



// home
Template.homeImage.helpers({
  'homeImageFileSelected':function(){
    if (Meta.findOne({meta:true})) {
      var homeImageId = Meta.findOne({meta:true}).home_image;
      return Images.findOne({_id:homeImageId});
    } else {
      return false;
    }
  }
});



// admin
Template.adminDropZone.events({
  'change .fileUploader': function(event, temp) {
    FS.Utility.eachFile(event, function(file) {
      var fileObj = new FS.File(file);
      Images.insert(fileObj);
    });
  }
});

Template.adminFileTable.helpers({
  'files': function() {
    return Images.find({},{ sort: { uploadedAt:-1 } });
  },
  'isSelected': function(fileObj) {
    console.log(fileObj._id);
    console.log(Meta.findOne({meta:true},{limit:1}).home_image === fileObj._id);
    return Meta.findOne({meta:true},{limit:1}).home_image === fileObj._id;
  }
});

Template.adminFileTable.events({
  'click .remove': function(e,t){
    if (confirm('Really Remove?')) {
      Images.remove(this._id);
    }
  },
  'click .select': function(e,t){
    var meta = Meta.findOne({meta:true});
    Meta.update(meta._id,{$set:{home_image:this._id}});
  },
  'click .deselect': function(e,t){
    var meta = Meta.findOne({meta:true});
    Meta.update(meta._id,{$set:{home_image:''}});
  }
})


