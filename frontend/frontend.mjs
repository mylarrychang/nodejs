import mongodb from 'mongodb'
// Using express for rest API
import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Worker } from 'snowflake-uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const mongo_server = typeof process.env.mongo_server == 'undefined' ? "localhost" : process.env.mongo_server
const ID = process.env.ID

const generator = new Worker(0, 1, {
    workerIdBits: 5,
    datacenterIdBits: 5,
    sequenceBits: 12,
});
const app = express()
const port = 8080
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var counter = 0

async function main() {
    const uri = "mongodb://" + mongo_server + ":27017"
    const client = new mongodb.MongoClient(uri)
    client.connect()
    console.log("in db connection..." + uri)
    const message_collection = client.db('chat').collection('messages');
    const follow_collection = client.db('news').collection('follow');

    async function get_followers() {
        var follows = []
        const search_query = {}
        const array = follow_collection.find(search_query)
        for await (const follow of array) {
            // list of follows
            follows.push({
                follower: follow.follower,
                followee: follow.followee
            })
        }

        const encoded_messages = Buffer.from(JSON.stringify(follows), 'utf8')

        return encoded_messages
    }

    app.set('view engine', 'ejs');
    app.set('views', __dirname);
    app.use(express.static(__dirname + "/html"))

    // TODO: update the api
    app.get('/chat/:user_id', async function (req, res) {
        console.log("in get ... ID: " + ID)
        var user_id = req.params.user_id

        var messages = []
        const query = {}
        const array = message_collection.find(query)
            .sort({ snowflake_id: -1 }).limit(20)
        for await (const doc of array) {
            // list of documents
            messages.push({
                channel_id: doc.channel_id,
                snowflake_id: doc.snowflake_id,
                author_id: doc.author_id,
                message: doc.message
            })
        }

        // encode messages into JSON to avoid token injection.
        const encoded_messages = Buffer.from(JSON.stringify(messages), 'utf8').toString('base64')
        res.render(path.resolve("html/chat"), {
            messages: encoded_messages,
            user_id: user_id
        })
    })

    app.post('/v1/news', async function (req, res) {
        const currentDate = new Date()
        const timestamp = currentDate.getTime()
        const { author_id, message } = req.body

        res.send(`author_id: ${author_id}, message: ${message}`); //response to the API request
    })

    app.post('/v1/follow', async function (req, res) {
        // follower follows followee.
        const { follower, followee } = req.body
        const insert_query = { follower: follower, followee: followee }
        await follow_collection.insertOne(insert_query)
        console.log(`${follower} follows ${followee}`)

        res.render(path.resolve("html/follow"), {
            follows: await get_followers()
        })
    })

    app.post('/v1/unfollow', async function (req, res) {
        // follower unfollows followee.
        const { follower, followee } = req.body
        const query = { follower: follower, followee: followee }
        await follow_collection.deleteMany(query)

        res.send(`${follower} unfollows ${followee}`); //response to the API request
    })


    // GET Methods.

    app.get('/v1/news/:user_id', async function (req, res) {
        var user_id = req.params.user_id
        res.render(path.resolve("html/news"), {
            user_id: user_id
        })
    })

    app.get('/v1/feeds/:user_id', async function (req, res) {
        res.send("Message Sent"); //response to the API request
    })

    app.get('/v1/follow', async function (req, res) {
        var follows = []
        const query = {}
        const array = follow_collection.find(query)
        for await (const follow of array) {
            // list of follows
            follows.push({
                follower: follow.follower,
                followee: follow.followee
            })
        }

        // encode messages into JSON to avoid token injection.
        const encoded_messages = Buffer.from(JSON.stringify(follows), 'utf8')
        res.render(path.resolve("html/follow"), {
            follows: encoded_messages
        })
    })

    // The list of followees of the user_id
    app.get('/v1/follow/:user_id', async function (req, res) {
        var user_id = req.params.user_id

        var follows = []
        const query = { follower: user_id }
        const array = follow_collection.find(query)
        for await (const follow of array) {
            // list of follows
            follows.push({
                follower: follow.follower,
                followee: follow.followee
            })
        }

        // encode messages into JSON to avoid token injection.
        const encoded_messages = Buffer.from(JSON.stringify(follows), 'utf8')
        res.render(path.resolve("html/follow"), {
            follows: encoded_messages
        })
    })

    app.listen(port, () => console.log(`starting to listen at ${port}...`))
}

main()