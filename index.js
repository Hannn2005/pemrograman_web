import express from "express"
import { pool } from "./db.config.js"

const app = express()

const PORT = 3000

app.use(express.json())

// data movie dummy
let movie = [{
    id: 1,
    title: "Harry Potter",
    author: "andi",
    genre: ["Adventure", "Action"]
},
{
    id: 2,
    title: "John Wick",
    author: "budi",
    genre: ["Action", "Thriller"]
}
]

app.get("/api/movie", async (req, res) => {
    try {

        const data = await pool.query(`SELECT * FROM movies`)

        return res.status(200).json({
            success: true,
            data: data.rows
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

app.get("/api/movie/:id", async (req, res) => {
    try {
        const id = req.params.id

        const selectedMovie = await pool.query(`
            SELECT * FROM movies
            WHERE movie_id = $1
        `,[id])

        if (!selectedMovie) {
            return res.status(404).json({
                success: false,
                message: "movie not found"
            })
        }

        return res.status(200).json({
            success: true,
            data: selectedMovie.rows
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

app.post("/api/movie", async (req, res) => {
    try {
        const data = req.body

        const newMovie = await pool.query(`
            INSERT INTO movies(movie_title,movie_author,movie_genre)
            VALUES($1,$2,$3)
            RETURNING * ;
        `,[data.movie_title,data.movie_author,data.movie_genre])
        
        return res.status(201).json({
            success: true,
            data: newMovie.rows[0]
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

app.delete("/api/movie/:id", async (req, res) => {
    try {
        const id = req.params.id

        const deletedMovie = await pool.query(`
            DELETE FROM movies
            WHERE movie_id = $1
            
        `,[id])

        movie = deletedMovie

        return res.status(200).json({
            success : true,
            data : deletedMovie.rows
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

app.put("/api/movie/:id",async(req,res)=>{
    try {
        const id = req.params.id

        const {movie_title,movie_author,movie_genre} = req.body

        const updatedMovie = await pool.query(`
            UPDATE movies
            SET movie_title = $1 , movie_author = $2 , movie_genre = $3
            WHERE movie_id = $4
            RETURNING *
        `,[movie_title,movie_author,movie_genre,id])
        
        return res.status(200).json({
            success : true,
            message : updatedMovie.rows[0]
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            success : false,
            message : "Internal server error"
        })
    }
})

app.listen(PORT, () => {
    console.log("Server is running on PORT :" + PORT)
})