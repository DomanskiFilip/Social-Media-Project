const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const https = require('https');
const path = require('path'); 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const expressSession = require('express-session');
const multer = require('multer'); // multer for uploading images
const upload = multer({ dest: 'uploads/' }); // Configure the upload destination


const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());
// serve static files like index.html to localhos
app.use(express.static(path.join(__dirname, '../src/public')));
// upload path for uploading images
app.use('/uploads', express.static(path.join(__dirname, '../src/uploads')));
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
app.get('/M00982633/weather', (req, res) => {
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
app.post('/M00982633/users', async (req, res) => {
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
        res.status(201).json({ message: 'User registered successfully' }); // Change status code to 201
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

// GET endpoint to check if user is logged in
app.get('/M00982633/login', (req, res) => {
    if (req.session.username) {
		console.log('User is logged in:', req.session.username);
        res.status(200).json({ username: req.session.username });
    } else {
        res.status(400).json({ error: 'Not logged in' });
    }
});

// DELETE endpoint to logout user
app.delete('/M00982633/login', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to log out' });
        }
        res.status(200).json({ message: 'Logged out successfully' });
    });
});

// POST endpoint to post a message
app.post('/M00982633/contents', upload.single('image'), async (req, res) => {
    if (!req.session.username) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { content, date } = req.body;
    const postId = new ObjectId();
    const imagePath = req.file ? req.file.path : null; // Save the image path if an image was uploaded

    try {
        await client.connect();

        // insert post into database
        const result = await postCollection.insertOne({ content: content, date: date, user: req.session.username, postId: postId, image: imagePath });
        res.status(200).json({ message: 'Post created successfully' });
    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ error: 'Failed to post message' });
    } finally {
        await client.close();
    }
});

app.get('/M00982633/contents', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    console.log(`Received request at /M00982633/contents?page=${page}&limit=${limit}`);
    try {
        await client.connect();
        const posts = await postCollection.find().skip(skip).limit(limit).toArray();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({ error: 'Failed to get posts' });
    } finally {
        await client.close();
    }
});

// GET endpoint to get a specific post by postId
app.get('/M00982633/contents/:postId', async (req, res) => {
    const { postId } = req.params;
    console.log(`Received request at /M00982633/contents/${postId}`);

    // Validate postId
    if (!ObjectId.isValid(postId)) {
        return res.status(400).json({ error: 'Invalid postId format' });
    }

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
    } finally {
        await client.close();
    }
});

app.get('/M00982633/contents/user/:username', async (req, res) => {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    console.log(`Received request at /M00982633/contents/user/${username}?page=${page}&limit=${limit}`);
    try {
        await client.connect();
        const posts = await postCollection.find({ user: username }).skip(skip).limit(limit).toArray();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({ error: 'Failed to get posts' });
    } finally {
        await client.close();
    }
});

// DELETE endpoint to delete a specific post by postId and username
app.delete('/M00982633/contents/:postId', async (req, res) => {
    const { postId } = req.params;
    const username = req.session.username;
    console.log(`Received request at /M00982633/contents/${postId} by user ${username}`);
    try {
        await client.connect();
        // delete the post from the database
        const result = await postCollection.deleteOne({ postId: new ObjectId(postId), user: username });
        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Post deleted' });
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    } finally {
        await client.close();
    }
});

// get post comapreing content used in search bar
app.get('/M00982633/search', async (req, res) => {
    const { searchValue } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    if (!searchValue) {
        return res.status(300).json({ error: 'searchValue is required' });
    }

    console.log(`Received request at /M00982633/contents/search?searchValue=${encodeURIComponent(searchValue)}&page=${page}&limit=${limit}`);
    try {
        await client.connect();
        // search by content and/or username case insensitive
        const posts = await postCollection.find({
            $or: [
                { content: { $regex: searchValue, $options: 'i' } },
                { user: { $regex: searchValue, $options: 'i' } }
            ]
        }).skip(skip).limit(limit).toArray();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error getting posts:', error);
        res.status(500).json({ error: 'Failed to get posts' });
    } finally {
        await client.close();
    }
});

// get post form specific user comapreing content used in search bar
app.get('/M00982633/users/search/:username', async (req, res) => {
    const { username } = req.params;
    const { searchValue } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    console.log(`Received request at /M00982633/users/search/${username}?searchValue=${searchValue}&page=${page}&limit=${limit}`);
    try {
        await client.connect();
        // search by content case insensitive and filter by username
        const posts = await postCollection.find({
            user: username,
            content: { $regex: searchValue, $options: 'i' }}).skip(skip).limit(limit).toArray();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({ error: 'Failed to search posts' });
    } finally {
        await client.close();
    }
});

// POST endpoint to follow a user
app.post('/M00982633/follow', async (req, res) => {
    const { follower, followed } = req.body;
    console.log(`Received request to follow user: ${followed} by ${follower}`);

    // Check if the follower is trying to follow themselves
    if (follower === followed) {
        return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    try {
        await client.connect();
        // Follow the user
        const result = await userCollection.updateOne(
            { username: follower },
            { $addToSet: { following: followed } } // Add to set to avoid duplicates
        );
        if (result.modifiedCount === 1) {
            res.status(200).json({ message: 'User followed successfully' });
        } else {
            res.status(404).json({ error: 'Follower not found' });
        }
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ error: 'Failed to follow user' });
    } finally {
        await client.close();
    }
});

// DELETE endpoint to unfollow a user
app.delete('/M00982633/follow', async (req, res) => {
    const { follower, followed } = req.body;
    console.log(`Received request to unfollow user: ${followed} by ${follower}`);

    try {
        await client.connect();
        // Unfollow the user
        const result = await userCollection.updateOne(
            { username: follower },
            { $pull: { following: followed } }
        );
        if (result.modifiedCount === 1) {
            res.status(200).json({ message: 'User unfollowed successfully' });
        } else {
            res.status(404).json({ error: 'Follower not found' });
        }
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ error: 'Failed to unfollow user' });
    } finally {
        await client.close();
    }
});

// Endpoint to check if the current user follows a specific user
app.get('/M00982633/follow/:username', async (req, res) => {
    const currentUser = req.session.username;
    const { username } = req.params;

    if (!currentUser) {
        return res.status(401).json({ error: 'Not logged in' });
    }

    try {
        await client.connect();
        const user = await userCollection.findOne({ username: currentUser, following: username });
        if (user) {
            res.status(200).json({ follows: true });
        } else {
            res.status(200).json({ follows: false });
        }
    } catch (error) {
        console.error('Error checking if user follows:', error);
        res.status(500).json({ error: 'Failed to check if user follows' });
    } finally {
        await client.close();
    }
});

// GET endpoint to get the posts of users that the current user is following
app.get('/M00982633/follows/posts', async (req, res) => {
    const username = req.session.username;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;

    console.log(`Received request at /M00982633/follow/posts?page=${page}&limit=${limit}`);
    try {
        await client.connect();
        const user = await userCollection.findOne({ username: username });
        if (!user || !Array.isArray(user.following)) {
            return res.status(404).json({ error: 'User not found or following list is empty' });
        }
        // get posts from users that the current user is following, excluding the logged-in user's posts
        const posts = await postCollection.find({ user: { $in: user.following } }).skip(skip).limit(limit).toArray();
        console.log(posts);
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error getting posts from following users:', error);
        res.status(500).json({ error: 'Failed to get posts from following users' });
    } finally {
        await client.close();
    }
});

// Start the server
app.listen(PORT, () => {;
    console.log(`Server running at http://127.0.0.1:${PORT}/M00982633`);
});