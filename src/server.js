const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const https = require('https');
const path = require('path'); 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const expressSession = require('express-session');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
// serve static files like index.html to localhos
app.use(express.static(path.join(__dirname, '../src/public')));
// send to server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(expressSession({
    secret: "cst 2120 secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: true
}));

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
const userCollection = db.collection('users');
const postCollection = db.collection('posts');

// POST endpoint to register user
app.post('/M00982633/register', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received request at /M00982633/register:', username);

    try {
        await client.connect();
        
         // Check if the username already exists
        const existingUser = await userCollection.findOne({ username: username });
        if (existingUser) {
            res.status(409).json({ message: 'Username already taken' });
            return;
        }
        // register user
        const newUser = { username: username, password: password };
        const result = await userCollection.insertOne(newUser);
        console.log(result);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    } finally {
        await client.close();
    }
});

// POST endpoint to login user
app.post('/M00982633/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Received request at /M00982633/login:', username);

    try {
        await client.connect();

        // find user in database
        const user = await userCollection.findOne({ username: username, password: password });
        if (user) {
            req.session.username = username;
            res.status(200).json({ username: username });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to login user' });
    } finally {
        await client.close();
    }
});

app.get('/M00982633/check-login', (req, res) => {
    if (req.session.username) {
		console.log('User is logged in:', req.session.username);
        res.status(200).json({ username: req.session.username });
    } else {
        res.status(401).json({ error: 'Not logged in' });
    }
});

app.post('/M00982633/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

// POST endpoint to post a message
app.post('/M00982633/posts', async (req, res) => {
    if(!req.session.username) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { content, date } = req.body;
    const postId = new ObjectId();
    try {
        await client.connect();

        // insert post into database
        const result = await postCollection.insertOne({ content: content, date: date, user: req.session.username, postId: postId });
        res.status(201).json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ error: 'Failed to post message' });
    } finally {
        await client.close();
    }
});

// GET endpoint to get all posts
app.get('/M00982633/posts', async (req, res) => {
    console.log('Received request at /M00982633/posts');
    try {
        await client.connect();

        // get all posts from database
        const posts = await postCollection.find().toArray();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({ error: 'Failed to get posts' });
    } finally {
        await client.close();
    }
});

// GET endpoint to get a specific post by postId
app.get('/M00982633/posts/:postId', async (req, res) => {
    const { postId } = req.params;
    console.log(`Received request at /M00982633/posts/${postId}`);
    try {
		await client.connect();
        // find the post in the database
        const post = await postCollection.findOne({ postId: new ObjectId(postId) });
        if (post) {
            res.status(200).json(post);
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.error('Error getting post details:', error);
        res.status(500).json({ error: 'Failed to get post details' });
    }
	finally {
		await client.close();
	}
});

// Start the server
app.listen(PORT, () => {;
    console.log(`Server running at http://127.0.0.1:${PORT}/M00982633`);
});