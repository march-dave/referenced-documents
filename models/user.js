'use strict';

var mongoose = require('mongoose');

var ObjectId = mongoose.Schema.Types.ObjectId;

var userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

userSchema.statics.friendify = function(user1Id, user2Id, cb) {
  if(user1Id === user2Id) {
    return cb({error: "You can't be your own friend!"})
  }
  User.findById(user1Id, (err1, user1) => {
    User.findById(user2Id, (err2, user2) => {
      if(err1 || err2) return cb(err1 || err2);
      
      var user1HasFriend = user1.friends.indexOf(user2._id) !== -1;
      var user2HasFriend = user2.friends.indexOf(user1._id) !== -1;

      if(user1HasFriend || user2HasFriend) {
        return cb({error: "They're already friends!"});
      }

      user1.friends.push(user2._id);
      user2.friends.push(user1._id);

      user1.save((err1) => {
        user2.save((err2) => {
          cb(err1 || err2);
        });
      });
    });
  });
};

userSchema.statics.unfriendify = function(user1Id, user2Id, cb) {
  User.findById(user1Id, (err1, user1) => {
    User.findById(user2Id, (err2, user2) => {
      if(err1 || err2) return cb(err1 || err2);

      user1.friends = user1.friends.filter(friendId => {
        return friendId.toString() !== user2._id.toString();
      });

      user2.friends = user2.friends.filter(friendId => {
        return friendId.toString() !== user1._id.toString();
      });

      user1.save((err1) => {
        user2.save((err2) => {
          cb(err1 || err2);
        });
      });

    });
  });  
};

userSchema.statics.readBook = function(userId, bookId, cb) {
  User.findById(userId, (err, user) => {
    if(err) return cb(err);
    
    var book = user.books.filter(book => book._id.toString() === bookId)[0];
  
    if(!book) {
      return cb({error: 'Book not found'});
    }

    book.read(cb);
  }).populate('books');
};

var User = mongoose.model('User', userSchema);

module.exports = User;
