'use strict';

require('dotenv').config();
var express     = require('express');
var helmet      = require('helmet');
var bodyParser  = require('body-parser');
var expect      = require('chai').expect;
var cors        = require('cors');
var mongoose    = require('mongoose');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');

var app = express();

app.use(helmet());

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true });
var Schema = mongoose.Schema;
var issueSchema = new Schema({
  project: String,
  issue_title: String,
  issue_text: String,
  created_by: String,
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
app.route('/api/issues/:project')
  .post(function(req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }

    var now = Date.now();
    var issue = new Issue({
      project: req.params.project,
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

    if (Object.keys(update).length === 0) {
      return res.send('no updated field sent');
    }

    if (!req.body._id) {
      return res.send('_id error');
    }

    update.update_on = Date.now();
    Issue.findByIdAndUpdate(req.body._id, update, function(err, issue) {
      if (err) {
        return res.send('could not update ' + req.body._id);
      }

      res.send('successfully updated');
    });
  })
  .delete(function(req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }

    if (!req.body._id) {
      return res.send('_id error');
    }

    Issue.findByIdAndDelete(req.body._id, function(err, issue) {
      if (err) {
        return res.send('could not delete ' + req.body._id);
      }

      res.send('deleted ' + req.body._id);
    });
  })
  .get(function(req, res) {
    var conditions = {
      project: req.params.project,
    };

    for (var key in req.query) {
      if (schemaKeys.indexOf(key) > -1) {
        conditions[key] = req.query[key];
      }
    }

    Issue.find(conditions, function(err, issues) {
      if (err) {
        return res.send('error retrieving issues');
      }

      res.json(issues);
    });
  });

//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + (process.env.PORT || 3000));
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
