import mongodb from 'mongodb'
// Using express for rest API
import express from 'express'
import bodyParser from 'body-parser'
import path from 'path'

const app = express()
const port = 8080
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var counter = 0

/**
 * This function does the follwing things:
 * 1. Connect to mongodb.
 * 2. For insert/ API, insert into movies.
 * 2. For list/ API, list all of the movies under a author.
 */
async function main() {
    const uri = "mongodb://mongo:27017"
    const client = new mongodb.MongoClient(uri)
    client.connect()
    console.log("in db connection...")
    const collection = client.db('mydatabase').collection('movies');
    app.set('view engine', 'ejs');

    app.get('/list/:author', async function (req, res) {
        console.log("in list request..." + req.params.author)
        var movies = []
        const query = { author: req.params.author }
        const array = collection.find(query)
        for await (const doc of array) {
            // list of documents
            console.log(doc)
            movies.push({ time: doc.time, name: doc.name, author: doc.author })
        }
        res.render(path.resolve("html/list"), { movies: JSON.stringify(movies) })
    })

    // This is anti-pattern....
    app.get('/insert', async function (req, res) {
        console.log("in insert get request...")
        res.render(path.resolve("html/insert"), { result: "" })
    })

    app.post('/insert', async function (req, res) {
        console.log("in insert post request...")
        let date = new Date().toJSON();
        const { name, author } = req.body
        const query = { time: date, name: name, author: author }
        await collection.insertOne(query)
        res.render(path.resolve("html/insert"), { result: JSON.stringify(query) })
    })

    app.listen(port, () => console.log(`starting to listen at ${port}...`))
}

main()