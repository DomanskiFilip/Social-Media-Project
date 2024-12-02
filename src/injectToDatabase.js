const { MongoClient, ObjectId} = require ('mongodb');

 

//MongoDB connection URL and database name

const MONGO_URL = 'mongodb://localhost:27017'; //Update this if using MongoDB Atlas

const DB_NAME = 'Social-Media'; //Database name

const USERS_COLLECTION = 'users'; //Collection name

const POSTS_COLLECTION = 'posts'; //Collection name

 

//Sample user data to insert

/*const users = [

    { username: 'admin', password: 'password' },

    { username: 'user1', password: 'pass1'}

];*/

const users = [{
    username: "Filip",
    password: "alamakota1",
    following: [
      "Filipd"
    ]
  },
  {
    username: "Filipd",
    password: "alamakota1",
    following: [
      "Filip"
    ]
  },
  {
    username: "ala",
    password: "alamakota1"
  },
  {
    username: "ala2",
    password: "alamakota1"
  },
  {
    username: "ala3",
    password: "alamakota1",
    following: [
      "Filipd"
    ]
  },
  {
    username: "ala4",
    password: "alamakota1",
    following: [
      "Filipd"
    ]
  },
  {
    username: "Tom",
    password: "alamakota1",
    following: [
      "Filipd"
    ]
  }];


  const posts = [{
    content: "aaaaaaaaaaaa",
    date: "2024-11-26T11:18:17.474Z",
    user: "Filip",
    postId: new ObjectId("6745ae9b5c125ac84519ce5d"),
    image: "uploads\\7494c92ac4f2c8acb24a9d2d3ef89594"
  },
  {
    content: "safsfa",
    date: "2024-11-26T11:18:51.873Z",
    user: "Filip",
    postId: new ObjectId('6745ae9b5c125ac84519ce5d'),
    image: "uploads\\fd83ad7b4e7ba732f0f596fdf00e43e5"
  },
  {
    content: "papug",
    date: "2024-11-26T11:32:02.127Z",
    user: "Filip",
    postId: new ObjectId('6745b1b2a1171e7e7425356e'),
    image: "uploads\\75c69eb90c808f6851dcc55a4684009d"
  },
  {
    content: "dsds",
    date: "2024-11-26T11:37:59.166Z",
    user: "Filip",
    postId: new ObjectId('6745b317e091d61342dae958'),
    image: null
  },
  {
    content: "test1\r\n",
    date: "2024-11-26T11:38:03.365Z",
    user: "Filip",
    postId: new ObjectId('6745b31be091d61342dae95a'),
    image: null
  },
  {
    content: "sffs",
    date: "2024-12-02T10:30:48.983Z",
    user: "Tom",
    postId: new ObjectId('674d8c58d11c650bd7bd6a7d'),
    image: null
  },
  {
    content: "ddd",
    date: "2024-12-02T10:47:46.764Z",
    user: "Tom",
    postId: new ObjectId('674d9052d11c650bd7bd6a83'),
    image: "uploads\\1d6f4ab26443d03214a1b7431a484188"
  }];
 

(async () => {

    let client;

    try {

        console.log("Connecting to MongoDB...");

        client = await MongoClient.connect(MONGO_URL); //useNewUrlParser and useUnifiedTopology options are no longer needed in this version

 

        const db = client.db(DB_NAME);

        console.log(`Connected to database: ${DB_NAME}`);

 

        //Drop the collection if it already exists (for reinitialization)

        const collections = await db.listCollections({ name: USERS_COLLECTION}).toArray();

        if (collections.length > 0) {

            console.log(`Dropping existing collection: ${USERS_COLLECTION}`);

            await db.collection(USERS_COLLECTION).drop();

        }

        //Drop the collection if it already exists (for reinitialization)

        const collections_posts = await db.listCollections({ name: POSTS_COLLECTION}).toArray();

        if (collections_posts.length > 0) {

            console.log(`Dropping existing collection: ${POSTS_COLLECTION}`);

            await db.collection(POSTS_COLLECTION).drop();

        }

 

        //Create the collection and insert data

        console.log(`Creating collection: ${USERS_COLLECTION}`);

        const result = await db.collection(USERS_COLLECTION).insertMany(users);

 

        console.log(`${result.insertedCount} users have been added successfully:`);

        const displayUsers = users.map(({ username, password }) => ({ username, password })); //Had to remove _id field

        console.table(displayUsers); //result.ops is no longer needed

        //Create the collection and insert data

        console.log(`Creating collection: ${POSTS_COLLECTION}`);

        const result_posts = await db.collection(POSTS_COLLECTION).insertMany(posts);

 

        console.log(`${result_posts.insertedCount} posts have been added successfully:`);

        const displayposts =  posts.map(({ content, date, user, postId, image }) => ({ content, date, user, postId, image  }));//Had to remove _id field

        console.table(displayposts); //result.ops is no longer needed

    } catch (error) {

        console.error('Error initializing the database:', error);

    } finally {

        if (client) {

            console.log('Closing MongoDB connection...');

            await client.close();

        }

    }

})();