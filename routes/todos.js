var express = require('express');
const { ObjectId } = require('mongodb');
var router = express.Router();

module.exports = function (db) {
    const Todo = db.collection('todos');
    const User = db.collection('users');

    router.get('/', async function (req, res, next) {
        try {
            const {executor} = req.query
            const params = {}

            if (executor) params['executor'] = new ObjectId(executor)

            const todos = await Todo.find(params).toArray();
            res.status(200).json({
                data: todos
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