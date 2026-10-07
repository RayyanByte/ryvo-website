const dns = require("dns");

dns.setDefaultResultOrder(
    "ipv4first"
);

const express = require("express");
const cookieParser = require("cookie-parser");
const userAdminRoutes = require("./routes/user.admin.routes");

const cors = require("cors");
const dotenv = require("dotenv");

const connectDatabase =
    require("./config/database");

const authRoutes =
    require("./routes/auth.routes");

const addressRoutes =
    require("./routes/address.routes");

const foodRoutes =
    require("./routes/food.routes");

const categoryRoutes =
    require("./routes/category.routes");

const shopRoutes =
    require("./routes/shop.routes");

const orderRoutes =
    require("./routes/order.routes");

const paymentRoutes =
    require("./routes/payment.routes");

const paymentAdminRoutes =
    require("./routes/payment.admin.routes");

const paymentWebhookRoutes =
    require(
        "./routes/payment.webhook.routes"
    );

const deliveryRoutes =
    require("./routes/delivery.routes");

const deliveryAdminRoutes =
    require("./routes/delivery.admin.routes");


dotenv.config();


const app =
    express();


const PORT =
    process.env.PORT || 5000;


app.use(
    cors({
        origin: "http://localhost:8080",
        credentials: true
    })
);


/*
 * Razorpay webhook MUST receive
 * the raw request body before
 * express.json() parses it.
 */
app.use(
    "/api/payments/webhook",
    paymentWebhookRoutes
);


app.use(
    express.json()
);

app.use(cookieParser());


app.get(
    "/",
    (req, res) => {
        res.json({
            success: true,
            message:
                "RYVO Backend is running"
        });
    }
);


app.use("/api/users/admin", userAdminRoutes);

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
    "/api/payments/admin",
    paymentAdminRoutes
);

app.use(
    "/api/payments",
    paymentRoutes
);


app.use(
    "/api/delivery/admin",
    deliveryAdminRoutes
);

app.use(
    "/api/delivery",
    deliveryRoutes
);


app.use(
    (req, res) => {
        res.status(404).json({
            success: false,
            message:
                "API route not found."
        });
    }
);


app.use(
    (error, req, res, next) => {
        console.error(
            "Unhandled server error:",
            error
        );

        if (
            res.headersSent
        ) {
            return next(error);
        }

        return res.status(500).json({
            success: false,
            message:
                "Internal server error."
        });
    }
);


const startServer =
    async () => {
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
