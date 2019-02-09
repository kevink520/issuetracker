/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
//var MongoClient = require('mongodb');
//var ObjectId = require('mongodb').ObjectID;

//const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

var mongoose = require('mongoose');
mongoose.connect(process.env.DB, { useNewUrlParser: true });
var Schema = mongoose.Schema;
var issueSchema = new Schema({
  project: String,
  issue_title: {
    type: String,
    required: true,
  },
  issue_text: {
    type: String,
    required: true,
  },
  created_by: {
    type: String,
    required: true,
  },
  assigned_to: String,
  status_text: String,
  created_on: {
    type: Date,
    default: Date.now,
  },
  updated_on: Date,
  open: Boolean,
});

var schemaKeys = Object.keys(issueSchema.paths);
var Issue = mongoose.model('Issue', issueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function(req, res) {
      var project = req.params.project;
      var conditions = {
        project: project,
      };

      for (var key in req.query) {
        if (schemaKeys.indexOf(key) > -1) {
          conditions[key] = req.query[key];
        }
      }

      Issue.find(conditions, function(err, issues) {
        if (err) {
          res.type('text/plain');
          return res.send('error retrieving issues');
        }

        res.json(issues);
      });
    })
    
    .post(function(req, res) {
      var project = req.params.project;
      if (!req.body) {
        return res.sendStatus(400);
      }

      var now = Date.now();
      var issue = new Issue({
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        created_on: now,
        updated_on: now,
        open: true,
      });

      issue.save(function(err, issue) {
        if (err) {
          res.type('text/plain');
          res.send('could not save issue');
        }

        res.json(issue);
      });
    })
    
    .put(function(req, res) {
      var update = {};
      if (!req.body) {
        return res.sendStatus(400);
      }

      for (var key in req.body) {
        if (schemaKeys.indexOf(key) > -1 && req.body[key]) {
          update[key] = req.body[key];
        }
      }

      res.set('Content-Type', 'text/plain');
      if (Object.keys(update).length === 0) {
        return res.send('no updated field sent');
      }

      if (!req.body._id) {
        return res.send('_id error');
      }

      update.updated_on = Date.now();
      Issue.findByIdAndUpdate(req.body._id, update, function(err, issue) {
        if (err) {
          return res.send('could not update ' + req.body._id);
        }

        res.send('successfully updated');
      })
    })

    .delete(function(req, res) {
      if (!req.body) {
        return res.sendStatus(400);
      }

      res.type('text/plain');
      if (!req.body._id) {
        return res.send('_id error');
      }

      Issue.findByIdAndDelete(req.body._id, function(err, issue) {
        if (err) {
          return res.send('could not delete ' + req.body._id);
        }

        res.send('deleted ' + req.body._id);
      });
    });  
};

