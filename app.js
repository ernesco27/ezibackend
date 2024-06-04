import { sendSMS } from "./smsService.js";
import { sendEmail } from "./emailService.js";

import express from "express";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import cors from "cors";
import passport from "passport";
import LocalStrategy from "passport-local";
import session from "express-session";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const PORT = process.env.PORT;
const SECRET_KEY = process.env.SESSION_SECRET;
const uri = process.env.URI;

const app = express();

// Use the cors middleware
//app.use(cors());
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your client app's URL
    credentials: true, // Enable credentials (cookies) in CORS
  })
);
// Middleware to parse JSON request bodies
app.use(express.json());

app.use(
  session({
    secret: SECRET_KEY, // Use the secret key from environment variables
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport.js Local Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const client = new MongoClient(uri, {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        // useNewUrlParser: true,
        // useUnifiedTopology: true,
      });
      await client.connect();
      const db = client.db("EziData");
      const user = await db.collection("Users").findOne({ username });

      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    await client.connect();
    const db = client.db("EziData");
    const user = await db.collection("Users").findOne({ _id: ObjectId(id) });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // Start the Express server and handle routes
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

    // Handle database operations within routes

    // User registration
    app.post("/register", async (req, res) => {
      try {
        const { username, password } = req.body;

        const db = client.db("EziData");
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db
          .collection("Users")
          .insertOne({ username, password: hashedPassword });

        res.json({ message: "User registered successfully" });
      } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // User login
    app.post("/login", passport.authenticate("local"), (req, res) => {
      res.json({ message: "Logged in successfully" });
    });

    // Logout
    app.post("/logout", (req, res) => {
      req.logout((err) => {
        if (err) {
          return next(err);
        }
        res.json({ message: "Logged out successfully" });
      });
    });

    // Middleware to check if user is authenticated
    // function isAuthenticated(req, res, next) {
    //   console.log("isAuthenticated:", req.isAuthenticated());
    //   if (req.isAuthenticated()) {
    //     return next();
    //   }
    //   res.status(401).json({ error: "Unauthorized" });
    // }

    //Get all orders from database
    app.get("/api/orders", async (req, res) => {
      try {
        const db = client.db("EziData");
        const orders = await db.collection("Orders").find().toArray();
        res.json(orders);
      } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    //Get all networks from the database
    app.get("/api/networks", async (req, res) => {
      try {
        const db = client.db("EziData");
        const networks = await db.collection("networks").find().toArray();
        res.json(networks);
      } catch (err) {
        console.error("Error fetching networks:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    //Get all packages
    app.get("/api/packages", async (req, res) => {
      try {
        const db = client.db("EziData");
        const packages = await db.collection("packages").find().toArray();
        res.json(packages);
      } catch (err) {
        console.error("Error fetching packages:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });

    // Get a specific order by ID
    app.get("/api/orders/:id", async (req, res) => {
      try {
        const db = client.db("EziData");
        const order = await db
          .collection("Orders")
          .findOne({ _id: ObjectId(req.params.id) });
        if (!order) {
          return res.status(404).json({ error: "Order not found" });
        }
        res.json(order);
      } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }

  //Create a new network
  app.post("/api/networks", async (req, res) => {
    try {
      const db = client.db("EziData");
      const result = await db.collection("networks").insertOne(req.body);
      res.json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Error creating network:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  //Create a new package
  app.post("/api/packages", async (req, res) => {
    try {
      const db = client.db("EziData");
      const result = await db.collection("packages").insertOne(req.body);
      res.json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Error creating package:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Create a new order
  app.post("/api/orders", async (req, res) => {
    try {
      const db = client.db("EziData");
      const result = await db.collection("Orders").insertOne(req.body);

      const { phoneNumber, reference, volume, unit } = req.body;
      const toEmail = "ernesco28@gmail.com";
      const toName = "Ezidata";
      const templateId = 1; // Replace with your actual template ID
      const params = {
        name: "John",
        surname: "Doe",
      };

      if (result.insertedId) {
        const smsContent = `Your purchase of ${volume}${unit} data with reference number ${reference} is received and being processed. Your data will be received shortly. Email customer support at support@ezidata.com`;
        //await sendSMS(phoneNumber, smsContent); // Send SMS after order is created

        await sendEmail(volume, unit, phoneNumber, reference); //send Email to admin when order is received
      }

      res.json({ insertedId: result.insertedId });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Update an existing order
  app.put("/api/orders/:id", async (req, res) => {
    try {
      const db = client.db("EziData");

      const id = req.params.id;

      console.log("ID:", id);

      const filter = { _id: `${id}` };
      const update = { $set: req.body };

      const result = await db.collection("Orders").updateOne(filter, update);

      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json({ message: "Order updated successfully" });
    } catch (error) {
      console.error("Error updating order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Delete an order
  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const db = client.db("EziData");
      const result = await db
        .collection("Orders")
        .deleteOne({ _id: ObjectId(req.params.id) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
}

run().catch(console.dir);
