/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  var idPromise = new Promise(function(resolve, reject) { 
  suite('POST /api/issues/{project} => object with issue data', function() {  
    test('Every field filled in', function(done) {
      chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res) {
          assert.equal(res.status, 200);          
          //fill me in too!
          assert.isObject(res.body, 'response is an object');
          assert.property(res.body, '_id', 'issue object has _id');
          assert.property(res.body, 'issue_title', 'issue object has issue_title');
          assert.equal(res.body.issue_title, 'Title');
          assert.property(res.body, 'issue_text', 'issue object has issue_text');
          assert.equal(res.body.issue_text, 'text');
          assert.property(res.body, 'created_by', 'issue object has created_by');
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in');
          assert.property(res.body, 'assigned_to', 'issue object has assigned_to');
          assert.equal(res.body.assigned_to, 'Chai and Mocha');
          assert.property(res.body, 'status_text', 'issue object has status_text');
          assert.equal(res.body.status_text, 'In QA');
          assert.property(res.body, 'created_on', 'issue object has created_on');
          assert.isString(res.body.created_on);
          assert.property(res.body, 'updated_on', 'issue object has updated_on');
          assert.isString(res.body.updated_on);
          assert.property(res.body, 'open', 'issue object has open');
          assert.equal(res.body.open, true);
          resolve(res.body._id);
          done();
        });
    });
      
    test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title 2',
            issue_text: 'text 2',
            created_by: 'Functional Test - Required fields filled in',
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response is an object');
            assert.property(res.body, '_id', 'issue object has _id');
            assert.property(res.body, 'issue_title', 'issue object has issue_title');
            assert.equal(res.body.issue_title, 'Title 2');
            assert.property(res.body, 'issue_text', 'issue object has issue_text');
            assert.equal(res.body.issue_text, 'text 2');
            assert.property(res.body, 'created_by', 'issue object has created_by');
            assert.equal(res.body.created_by, 'Functional Test - Required fields filled in');
            assert.property(res.body, 'created_on', 'issue object has created_on');
            assert.isString(res.body.created_on);
            assert.property(res.body, 'updated_on', 'issue object has updated_on');
            assert.isString(res.body.updated_on);
            assert.property(res.body, 'open', 'issue object has open');
            assert.equal(res.body.open, true);
            done();
          });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            assigned_to: 'Functional Test - Missing required fields',
            status_text: 'Test status',
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.deepEqual(res.body, {});
            done();
          });
      });
    });
  });

  idPromise.then(function(_id) {
    suite('PUT /api/issues/{project} => text', function() {
      
      test('No body', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.deepEqual(res.body, {});
            done();
          });
      });

        test('One field to update', function(done) {
          chai.request(server)
            .put('/api/issues/test')
            .send({
               _id: _id,
               issue_title: 'Updated Title',
             })
             .end(function(err, res) {
               assert.equal(res.status, 200);
               assert.deepEqual(res.body, {});
               //assert.equal(res.body, 'successfully updated');
               done();
             });
        });
      
        test('Multiple fields to update', function(done) {
          chai.request(server)
            .put('/api/issues/test')
            .send({
              _id: _id,
              issue_title: 'Updated Title 2',
              issue_text: 'Updated text 2',
            })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              assert.deepEqual(res.body, {});
              done();
            });
        });
      });
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            issue_title: 'Title',
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.equal(res.body[0].issue_title, 'Title');
            done();
          });        
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({
            issue_title: 'Title 2',
            issue_text: 'text 2',
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'issue_title');
            assert.equal(res.body[0].issue_title, 'Title 2');
            assert.property(res.body[0], 'issue_text');
            assert.equal(res.body[0].issue_text, 'text 2');
            done();
          });  
      });
    });
    
  idPromise.then(function(_id) {
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {});
            //assert.equal(res.body, '_id error');
            done();
          });
      });
      
      test('Valid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({
            _id: _id,
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);        
            assert.deepEqual(res.body, {});
            done();
          });
      });
    });
  });
});
