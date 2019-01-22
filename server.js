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
  title: String,
  text: String,
  createdBy: String,
  statusText: String,
  createdOn: {
    type: Date,
    default: Date.now,
  },
  updatedOn: Date,
  open: Boolean,
});

var Issue = mongoose.model('Issue', issueSchema);
app.route('/api/issues/:project')
  .post(function(req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }

    var now = Date.now();
    var issue = new Issue({
      project: req.params.project,
      title: req.body.issue_title,
      text: req.body.issue_text,
      createdBy: req.body.created_by,
      statusText: req.body.status_text,
      createdOn: now,
      updatedOn: now,
      open: true,
    });

    issue.save(function(err, issue) {
      if (err) {
        res.status(500).send(err);
      }

      res.json(issue);
    });
  })
  .put(function(req, res) {
    if (!req.body) {
      return res.sendStatus(400);
    }

    if (!req.body._id) {
      return res.sendStatus(400);
    }

    var update = {};
    if (req.body.issue_title) {
      update.title = req.body.issue_title;
    }

    if (req.body.issue_text) {
      update.text = req.body.issue_text;
    }

    if (req.body.created_by) {
      update.createdBy = req.body.created_by;
    }

    if (req.body.status_text) {
      update.statusText = req.body.status_text;
    }

    if (req.body.open) {
      update.open = req.body.open;
    }

    if (Object.keys(update).length > 0) {
      update.updatedOn = Date.now();
    }

    Issue.findByIdAndUpdate(req.body._id, update, {new: true}, function(err, issue) {
      if (err) {
        return res.status(500).send(err);
      }

      res.json(issue);
    });
  })
  .get(function(req, res) {
    var conditions = {
      project: req.params.project,
    };

    if (req.query._id) {
      conditions._id = req.query._id;
    }

    if (req.query.issue_title) {
      conditions.title = req.query.issue_title;
    }

    if (req.query.issue_text) {
      conditions.text = req.query.issue_text;
    }

    if (req.query.created_by) {
      conditions.createdBy = req.query.created_by;
    }

    if (req.query.status_text) {
      conditions.statusText = req.query.status_text;
    }

    if (req.query.created_on) {
      conditions.createdOn = req.query.created_on;
    }

    if (req.query.updated_on) {
      conditions.updatedOn = req.query.updated_on;
    }

    if (req.query.open) {
      conditions.open = req.query.open;
    }

    Issue.find(conditions, function(err, issues) {
      if (err) {
        return res.status(500).send(err);
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
