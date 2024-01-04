const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cirzz5b.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const coffeeCollection = client.db('coffeeDB').collection('coffee')
        const userCollection = client.db('coffeeDB').collection('user');
        
        // adding coffee
        app.post('/coffeelist', async (req, res) => {
            const newCoffee = req.body;
            console.log(newCoffee)
            const result = await coffeeCollection.insertOne(newCoffee);
            res.send(result)
        })


        // read coffee
        app.get('/coffeelist', async (req, res) => {
            const cursor = coffeeCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        // delete a coffee
        app.delete('/coffeelist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await coffeeCollection.deleteOne(query);
            res.send(result)
        })


        // Update info (need get operation to load exact data). This portion is for showing the data of which info will we update
        app.get('/coffeelist/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })


        // update (actually here we are updating). This will accept the id of which info we should update and then we send it to our database.
        app.put('/coffeelist/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };

            const options = { upsert: true };

            const updatedCoffee = req.body;


            const coffee = {
                $set: {
                    name: updatedCoffee.name,
                    supplier: updatedCoffee.supplier,
                    category: updatedCoffee.category,
                    chef: updatedCoffee.chef,
                    taste: updatedCoffee.taste,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo,
                }
            }

            const result = await coffeeCollection.updateOne(filter, coffee, options)

            res.send(result);
        })


        // user information apis
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.send(result);
        })
        
        // show user in ui
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const users = await cursor.toArray();
            res.send(users);
        })

        // delete a User
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userCollection.deleteOne(query);
            res.send(result);
        })

        // update user lastLogInTime while log in using patch:
        app.patch('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = {
                $set: {
                    lastLoggedAt: user.lastLoggedAt
                }
            }

            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send("COFFEE server is running")
})

app.listen(port, () => {
    console.log('server is running on', port)
})