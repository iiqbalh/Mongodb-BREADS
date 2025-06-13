var express = require('express');
const moment = require('moment');
const { ObjectId } = require('mongodb');
var router = express.Router();

module.exports = function (db) {
    const Todo = db.collection('todos');
    const User = db.collection('users');

    router.get('/', async function (req, res, next) {
        try {
            const { page = 1, executor, query = '', sortBy = '_id', sortMode = 'desc', limit = 10 } = req.query
            console.log(sortBy)

            const params = {}

            if (query.title) params['title'] = new RegExp(query.title, 'i')

            if (query.stardate && query.enddate) {
                params['deadline'] = {
                    $gte: new Date(query.stardate),
                    $lte: new Date(query.enddate)
                }
            } else if (query.stardate) {
                params['deadline'] = {$gte: new Date(query.stardate)}
            } else if (query.enddate) {
                params['deadline'] = {$lte: new Date(query.enddate)}
            }

            if (query.complete) params['complete'] = JSON.parse(query.complete);

            if (executor) params['executor'] = new ObjectId(executor)

            // sorting
            const sortParams = {};
            sortParams[sortBy] = sortMode === 'asc' ? 1 : -1;

            const offset = (page - 1) * limit;
            const count = await Todo.countDocuments(params);
            const pages = Math.ceil(count / limit);

            const todos = await Todo.find(params).sort(sortParams).limit(limit).skip(offset).toArray();
            res.status(200).json({
                data: todos,
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
            const { title, executor } = req.body;
            const day = 24 * 60 * 60 * 1000;
            const user = await User.findOne({ _id: new ObjectId(executor) })
            const data = await Todo.insertOne({ title: title, complete: false, deadline: new Date(Date.now() + day), executor: user._id })
            const todo = await Todo.findOne({ _id: data.insertedId })
            res.status(201).json(todo)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    });

    router.get('/:id', async function (req, res, next) {
        try {
            const id = req.params.id
            const todo = await Todo.findOne({ _id: new ObjectId(id) });
            res.status(201).json(todo)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    });

    router.put('/:id', async function (req, res, next) {
        try {
            const id = req.params.id
            const { title, complete, deadline } = req.body;
            const todo = await Todo.updateOne({ _id: new ObjectId(id) }, { $set: { title: title, complete: complete, deadline: new Date(deadline) } });
            res.status(201).json(todo)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    });

    router.delete('/:id', async function (req, res, next) {
        try {
            const id = req.params.id
            const todo = await Todo.deleteOne({ _id: new ObjectId(id) });
            if (!todo) throw new Error("User not exist")
            res.status(201).json(todo)
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    });

    return router;
}