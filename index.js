const pg = require('pg')
const client = new pg.Client('postgres://localhost/food_db')
const express = require('express')
const app = express()
const cors =require('cors')

app.use(cors())
app.get('/', (req, res, next) => {
    res.send("Hello world")
})

//GET all food
app.get('/api/food', async (req,res,next) => {
    try {
        const SQL = `
        SELECT * FROM food;
        `
        console.log("in db")
    
        const response = await client.query(SQL)
        //res.status(202)
        res.send(response.rows)
    } catch (error) {
        next(error)
    }
})

//GET one food
app.get('/api/food/:id' , async (req,res,next) => {
    try {
        console.log(req.params.id)

        const SQL = `
        SELECT * from food WHERE id=$1
        `
        const response = await client.query(SQL, [req.params.id])
        
        if(!response.rows.length){
            next({
                name: "id error",
                message: `food with ${req.params.id} not found`
            })
        }else{

            res.send(response.rows[0])
        }

    } catch (error) {
        next(error)
    }

})

//DELETE a food
app.delete('/api/food/:id', async (req,res, next) => {
    try {
        const SQL = `
        DELETE FROM food WHERE id=$1
        `
        const response = await client.query(SQL, [req.params.id])
        console.log(response)
        res.sendStatus(204)
        
    } catch (error) {
        next(error)
    }
})

//Error handler
app.use((error,req,res,next) => {
    res.status(500)
    res.send(error)
})


app.use('*', (req,res,next) => {
    res.send("No such route exists")
})

 


const start = async () => {
    await client.connect()
    console.log("connected to db!")

    const SQL = `
    DROP TABLE IF EXISTS food;
    CREATE TABLE food(
        id SERIAL PRIMARY KEY,
        name VARCHAR(25)
    );

    INSERT INTO food(name) VALUES ('pizza');
    INSERT INTO food(name) VALUES ('taco');
    INSERT INTO food(name) VALUES ('ramen');
    INSERT INTO food(name) VALUES ('sushi');
    INSERT INTO food(name) VALUES ('ice cream');
    `
    await client.query(SQL)
    console.log("table created and seeded")

    const port = process.env.PORT || 3000
    

    app.listen(port, () => {
        console.log(`Server listening on port ${port}`)
    })


}

start()