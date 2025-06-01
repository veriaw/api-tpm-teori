import express from "express";
import cors from "cors";
import router from "./routes/Route.js";
import "./models/RelationModel.js"; 
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // Menggunakan opsi CORS

// Menambahkan penanganan preflight request (OPTIONS)
app.options("\\*", cors()); // Menanggapi preflight requests

app.use(express.json());
app.use(router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
