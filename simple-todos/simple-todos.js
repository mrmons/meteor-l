
Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client
 Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Template.body.helpers({
    tasks: function(){

      if(Session.get("hideCompleted")){
        return Tasks.find({checked: {$ne:true}}, {sort: {createdAt: -1}})
      }else{
         return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },//tasks

    hideCompleted: function(){
      return Session.get("hideCompleted");
    },

    incompleteCount: function () {
      return Tasks.find({checked: {$ne: true}}).count();
    }
  });//templates body helpers

  Template.body.events({

    "change .hide-completed input": function (event) {
      Session.set("hideCompleted", event.target.checked);
    },

    "submit .new-task": function (event) {
      // This function is called when the new task form is submitted
      var contentText = event.target.text.value;
      Tasks.insert({
        text: contentText,
        createdAt: new Date(), // current time
        owner: Meteor.userId(),  // _id of logged in user
        username: Meteor.user().username // username of logged in user
      });

      // Clear form
      event.target.text.value = "";

      // Prevent default form submit
      return false;
    }

  });

  Template.task.events({
    "click .toggle-checked": function(){
      Tasks.update(this._id, {$set: {checked: ! this.checked}});
    },
    "click .delete":function(){
      Tasks.remove(this._id);
    }
  });

 
}//if


Meteor.methods({
  addTask: function (text) {
    // Make sure the user is logged in before inserting a task
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    Tasks.update(taskId, { $set: { checked: setChecked} });
  }
});
