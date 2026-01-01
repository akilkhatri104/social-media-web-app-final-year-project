import express from "express";
import "dotenv/config";
import cors from "cors";

const app = express();

app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const port = process.env.PORT || 8000;
app.listen(port, (err) => {
    if (err) {
        console.error(`ERROR :: ${err}`);
        return;
    }

    console.log(`Server running on port ${port}`);
});
