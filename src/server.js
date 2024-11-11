
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const https = require('https');
const path = require('path'); 
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
// serve static files like index.html to localhos
app.use(express.static(path.join(__dirname, '../src/public')));
// send to server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Define a route to get air quality data to show at the top of the page
app.get('/weather', (req, res) => {
	const https = require('https');
  
	const options = {
	  method: 'GET',
	  hostname: 'weatherapi-com.p.rapidapi.com',
	  port: null,
	  path: '/current.json?q=53.1%2C-0.13',
	  headers: {
		//'x-rapidapi-key': '4ac38c9824mshee82220f019df95p17748fjsnbd9456480bc1',
		'x-rapidapi-host': 'weatherapi-com.p.rapidapi.com'
	  }
	};
  
	const apiReq = https.request(options, function (apiRes) {
	  const chunks = [];
  
	  apiRes.on('data', function (chunk) {
		chunks.push(chunk);
	  });
  
	  apiRes.on('end', function () {
		const body = Buffer.concat(chunks);
		try {
		  const json = JSON.parse(body.toString());
		  res.json(json);
		} catch (error) {
		  res.status(500).send('Error parsing JSON');
		}
	  });
	});
  
	apiReq.on('error', (e) => {
	  res.status(500).send(`Error with request: ${e.message}`);
	});
  
	apiReq.end();
  });

// Serve index.html at /M00982633
app.get('/M00982633', (req, res) => {
	res.sendFile(path.join(__dirname, '../src/public/index.html'));
  });


// MongoDB connection
const mongoUrl = 'mongodb://127.0.0.1:27017?retryWrites=true&w=majority';
const dbName = 'Social-Media';

const client = new MongoClient(mongoUrl,{
	serverApi: {
		version: ServerApiVersion.v1,
		strict: false,
		depricationErrors: true,
	},
})

// database name
const db = client.db(dbName);
// collection name
const collection = db.collection('users');

// function to register users
async function registerUser(usersCollection, username, password) {
    const newUser = { username: username, password: password };
    const result = await usersCollection.insertOne(newUser);
    console.log(result);
}

// POST endpoint to register user
app.post('/M00982633/register', (req, res) => {
	const { username, password} = req.body;
	console.log('Received request at /M00982633/register:', username);
	// register user
	registerUser(collection, username, password)
		.then(() => {
			res.status(201).json({ message: 'User registered successfully' });
		})
		.catch(error => {
			console.error('Error registering user:', error);
			res.status(500).json({ error: 'Failed to register user' });
		});
});

// POST endpoint to login user
app.post('/M00982633/login', (req, res) => {
	const { username, password } = req.body;
	console.log('Received request at /M00982633/login:', username);
	// find user in database
	collection.findOne({ username: username, password: password })
		.then(user => {
			if (user) {
				res.status(200).json({username: username});
			} else {
				res.status(401).json({ error: 'Invalid username or password' });
			}
		})
		.catch(error => {
			res.status(500).json({ error: 'Failed to login user' });
		});
	}
);


// Start the server
app.listen(PORT, () => {;
    console.log(`Server running at http://127.0.0.1:${PORT}/M00982633`);
});