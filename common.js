T9n.setLanguage('de');

AccountsTemplates.configure({
  // Behaviour
  confirmPassword: true,
  enablePasswordChange: true,
  forbidClientAccountCreation: false,
  overrideLoginErrors: true,
  sendVerificationEmail: false,

  // Appearance
  showAddRemoveServices: false,
  showForgotPasswordLink: true,
  showLabels: true,
  showPlaceholders: true,

  // Client-side Validation
  continuousValidation: false,
  negativeFeedback: false,
  negativeValidation: true,
  positiveValidation: true,
  positiveFeedback: true,

  // Privacy Policy and Terms of Use
  privacyUrl: 'privacy',
  termsUrl: 'terms-of-use',

  // Redirects
  homeRoutePath: '/',
  redirectTimeout: 4000,

  // Texts
  // buttonText: {
  //   signUp: "Anmeldung versenden"
  // },
  // title: {
  //   forgotPwd: "Passw"
  // },
});

AccountsTemplates.addFields([
  {
    _id: 'username',
    type: 'text',
    displayName: "Name",
    required: true,
    minLength: 3
  },
  {
    _id: 'phone',
    type: 'tel',
    displayName: "Telefoonnummer",
  }
]);

AccountsTemplates.configureRoute('forgotPwd', {
    name: 'forgot',
    path: '/forgot',
    layoutTemplate: 'formLayout',
    redirect: '/'
});

AccountsTemplates.configureRoute('enrollAccount', {
    name: 'enroll',
    path: '/enroll',
    layoutTemplate: 'formLayout',
    redirect: '/'
});

AccountsTemplates.configureRoute('signUp', {
    name: 'signup',
    path: '/signup',
    layoutTemplate: 'formLayout',
    redirect: '/'
});

AccountsTemplates.configureRoute('signIn', {
    name: 'signin',
    path: '/signin',
    layoutTemplate: 'formLayout',
    redirect: '/'
});


Meteor.startup(function(){
  AccountsTemplates.init();
});


Router.map(function(){
  
  this.route('home',{
    path:'/',
    template: 'home',
    layoutTemplate: 'mainLayout',
    onBeforeAction: function(pause){
      this.subscribe('userData').wait();
      this.subscribe('meta').wait();
      if (this.ready()) {
        this.render();
      } else {
        this.render('loading');
      }
    },
    yieldTemplates: {
      'userTop' : {to: 'top'},
      'footer'  : {to: 'footer'}
    }
  });

  this.route('profile', {
    path: '/profile',
    template: 'profile',
    layoutTemplate: 'mainLayout',
    onBeforeAction: function(pause){
      AccountsTemplates.ensureSignedIn.call(this, pause);
      
      this.subscribe('userData').wait();
      if (this.ready()) {
        this.render();
      } else {
        this.render('loading');
      }
    },
    yieldTemplates: {
      'userTop' : {to: 'top'},
      'footer'  : {to: 'footer'}
    }
  });

  this.route('logout', {
    path: '/logout',
    template: 'logout',
    layoutTemplate: 'mainLayout',
    onBeforeAction: function(){
      this.subscribe('userData').wait();
      if (this.ready()) {
        Meteor.logout();
        this.redirect('home');
      } else {
        this.render('loading');
      }
    },
    yieldTemplates: {
      'userTop' : {to: 'top'},
      'footer'  : {to: 'footer'}
    }
  });


  this.route('list', {
    path: '/list',
    template: 'list',
    layoutTemplate: 'mainLayout',
    onBeforeAction: AccountsTemplates.ensureSignedIn
  });

  this.route('admin',{
    path: '/admin',
    template: 'admin',
    onBeforeAction: function(pause){
      AccountsTemplates.ensureSignedIn.call(this, pause);
      
      this.subscribe('userData').wait();
      if (this.ready()) {
        if (!Meteor.user().admin) {
          this.redirect('home');
        } else {
          this.render();
        }
      } else {
        this.render('loading');
      }
    }
  })

});