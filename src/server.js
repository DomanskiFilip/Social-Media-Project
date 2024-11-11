
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const https = require('https');
const path = require('path'); 
const mongodb = require('mongodb').MongoClient;

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
// serve static files like index.html to localhos
app.use(express.static(path.join(__dirname, '../src/public')));
// send to server
app.use(bodyParser.json());


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

// post to server
const mongoUrl = 'mongodb://127.0.0.1:27017';
const dbName = 'Social-Media';


mongodb.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err, client) => {
    if (err) {
        console.error('Failed to connect to the database. Error:', err);
        process.exit(1);
    }
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    app.post('/M00982633/users', (req, res) => {
        const { username, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        usersCollection.insertOne({ username, password }, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to register user' });
            }
            return res.status(201).json({ message: 'User registered successfully', userId: result.insertedId });
        });
    });
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/M00982633`);
	console.log(`Server running at http://127.0.0.1:${PORT}/M00982633`);
  });