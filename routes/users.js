'use strict';

var express = require('express');
var router = express.Router();

var User = require('../models/user');

router.route('/')
  .get((req, res) => {
    User
      .find({})
      .exec((err, users) => {
        res.status(err ? 400 : 200).send(err || users);
      });
  })
  .post((req, res) => {
    User.create(req.body, (err, user) => {
      res.status(err ? 400 : 200).send(err || user);
    });
  });

router.route('/:id')
  .get((req, res) => {
    User
      .findById(req.params.id)
      .populate('books friends')
      .exec(res.handle)
  });



router.get('/:id/potential', (req, res) => {

  // get all users that i'm not friends with, and aren't me

  User
    .findById(req.params.id)
    .exec((err, user) => {
      if(err) return res.handle(err);

      User.find({
        _id: {
          $nin: user.friends,
          $ne: user._id
        }
      }, res.handle);

    });
})





router.put('/:user1/addFriend/:user2', (req, res) => {
  User.friendify(req.params.user1, req.params.user2, res.handle);
});

router.put('/:user1/removeFriend/:user2', (req, res) => {
  User.unfriendify(req.params.user1, req.params.user2, res.handle);
});

router.put('/:userId/read/:bookId', (req, res) => {
  var userId = req.params.userId;
  var bookId = req.params.bookId;
  
  User.readBook(userId, bookId, res.handle);
});


router.put('/:userId/books/:bookId', (req, res) => {

  var userId = req.params.userId;
  var bookId = req.params.bookId;

  User.findById(userId, (err, user) => {
    if(err) return res.status(400).send(err);

    user.books.push(bookId);

    user.save((err, savedUser) => {
      res.status(err ? 400 : 200).send(err || savedUser);
    });
  });
});

module.exports = router;
