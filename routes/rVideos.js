var express = require('express');
var router = express.Router();

var monk = require('monk');
var db = monk('localhost:27017/blockbuster');

//get all videos
router.get('/', function(req, res) {
	var collection = db.get('videos');
	collection.find({}, function(err, videos) {
		if (err) throw err;

		res.json(videos.reverse());
	});
}); 

//get a video 
router.get('/:id', function(req, res) {
	var collection = db.get('videos');
	collection.findOne({ _id: req.params.id }, function(err, video) {
		if (err) throw err;

		res.json(video);
	});
});

//Add a new video
router.post('/', function(req, res) {
	var collection = db.get('videos');
	collection.insert( {
		title: req.body.title,
		plot: req.body.plot
	}, function(err, video) {
		if (err) throw err;

		res.json(video);
	});
});

//this is cool. i can use functions 
function getJson(req) {
	return { title: req.body.title, plot: req.body.plot };
}

//update a video
router.put('/:id', function(req, res) {
	
	var collection = db.get('videos');
	
	collection.update( {
		_id: req.params.id
	},
	{
		title: req.body.title,
		plot: req.body.plot	
	}, function(err, video) {
		if (err) throw err;

		res.json(video);
	});
});

//delete a video
router.delete('/:id', function(req, res) {
	var collection = db.get('videos');
	collection.remove( { _id : req.params.id }, function(err, video) {
		if (err) throw err;

		res.json(video);
	});
});

module.exports = router;


