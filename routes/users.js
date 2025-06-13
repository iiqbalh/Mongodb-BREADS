var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();

module.exports = function (db) {
  const User = db.collection('users');

  router.get('/', async function (req, res, next) {
    try {
      let { page = 1, query = '', sortBy = '_id', sortMode = 'desc', limit = 5 } = req.query;

      const params = {};

      if(query){
      params['$or'] = [{ "name": new RegExp(query, 'i') }, { "phone": new RegExp(query, "i") }]
      }

      // pagination
      limit = Number(limit)
      const offset = (page - 1) * limit;

      const count = await User.countDocuments(params);

      const pages = Math.ceil(count / limit);

      // sorting
      const sortParams = {};
      sortParams[sortBy] = sortMode === 'asc' ? 1 : -1;
      console.log(params)

      const users = await User.find(params).sort(sortParams).limit(limit).skip(offset).toArray();
      res.status(200).json({
        data: users,
        page: Number(page),
        pages: Number(pages),
        limit: limit,
        offset: offset,
        count: count
    })
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  router.post('/', async function (req, res, next) {
    try {
      const { name, phone } = req.body;
      const data = await User.insertOne({ name, phone })
      const user = await User.findOne({ _id: data.insertedId })
      res.status(201).json(user)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  router.get('/:id', async function (req, res, next) {
    try {
      const id = req.params.id
      const user = await User.findOne({ _id: new ObjectId(id) });
      res.status(201).json(user)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  router.put('/:id', async function (req, res, next) {
    try {
      const id = req.params.id
      const { name, phone } = req.body;
      const user = await User.updateOne({ _id: new ObjectId(id) }, { $set: { name: name, phone: phone } });
      res.status(201).json(user)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  router.delete('/:id', async function (req, res, next) {
    try {
      const id = req.params.id
      const user = await User.deleteOne({ _id: new ObjectId(id) });
      if (!user) throw new Error("User not exist")
      res.status(201).json(user)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  });

  return router;
}
