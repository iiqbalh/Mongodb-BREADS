var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();

module.exports = function (db) {
  const User = db.collection('users');

  router.get('/', async function (req, res, next) {
    try {
      const users = await User.find({}).toArray();
      res.status(200).json(users)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  router.post('/', async function (req, res, next) {
    try {
      const {name, phone} = req.body;
      const data = await User.insertOne({name, phone})
      const user = await User.findOne({_id: data.insertedId})
      res.status(201).json(user)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  router.get('/:id', async function (req, res, next) {
    try {
      const id = req.params.id
      const user = await User.findOne({_id: new ObjectId(id)});
      res.status(201).json(user)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  router.put('/:id', async function (req, res, next) {
    try {
      const id = req.params.id
      const {name, phone} = req.body;
      const user = await User.updateMany({_id: new ObjectId(id)}, {$set: {name: name, phone: phone}});
      res.status(201).json(user)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  router.delete('/:id', async function (req, res, next) {
    try {
      const id = req.params.id
      const user = await User.deleteMany({_id: new ObjectId(id)});
      res.status(201).json(user)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  return router;
}
