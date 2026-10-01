const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDatabase = require("./config/database");

const authRoutes = require("./routes/auth.routes");
const addressRoutes = require("./routes/address.routes");
const foodRoutes = require("./routes/food.routes");
const categoryRoutes = require("./routes/category.routes");
const shopRoutes = require("./routes/shop.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const deliveryRoutes = require("./routes/delivery.routes");


dotenv.config();


const app = express();


const PORT =
    process.env.PORT || 5000;


app.use(cors());

app.use(express.json());


app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "RYVO Backend is running"
    });
});


app.use(
    "/api/auth",
    authRoutes
);


app.use(
    "/api/addresses",
    addressRoutes
);


app.use(
    "/api/foods",
    foodRoutes
);


app.use(
    "/api/categories",
    categoryRoutes
);


app.use(
    "/api/shop",
    shopRoutes
);


app.use(
    "/api/orders",
    orderRoutes
);


app.use(
    "/api/payments",
    paymentRoutes
);


app.use(
    "/api/delivery",
    deliveryRoutes
);


const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(
            PORT,
            () => {
                console.log(
                    `RYVO Backend running on port ${PORT}`
                );
            }
        );

    } catch (error) {
        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};


startServer();
