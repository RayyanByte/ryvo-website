const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDatabase = require("./config/database");
const menuRoutes = require("./routes/menuRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/menu", menuRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RYVO Backend is running 🚀"
  });
});

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`RYVO Backend running on port ${PORT}`);
  });
};

startServer();
