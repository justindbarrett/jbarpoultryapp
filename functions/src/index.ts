import { onRequest } from "firebase-functions/v2/https";
import * as express from "express";
import * as cors from "cors";
import { addCustomer,
    deleteCustomer,
    getCustomers,
    updateCustomer } from "./customerController";
import { deleteScheduledLot, getScheduledLots, scheduleLot, updateScheduledLot } from "./scheduleController";
import { createLots, getLots, updateLot, updateLots, deleteLot, createLot } from "./lotController";
import { addUser, getUsers, getUser, getUserByUserId, updateUser, deleteUser } from "./userController";
import { verifyToken } from "./middleware/authenticator";

const app = express();
app.use(cors());
app.use(verifyToken);

app.get("/", (req, res) => res.status(200).send("Healthy"));
app.post("/customers", addCustomer);
app.get("/customers", getCustomers);
app.patch("/customers/:id", updateCustomer);
app.delete("/customers/:id", deleteCustomer);
app.post("/schedule", scheduleLot);
app.get("/schedule", getScheduledLots);
app.patch("/schedule/:id", updateScheduledLot);
app.delete("/schedule/:id", deleteScheduledLot);
app.post("/lot", createLot);
app.patch("/lot/:id", updateLot);
app.delete("/lot/:id", deleteLot);
app.post("/lots", createLots);
app.get("/lots", getLots);
app.patch("/lots", updateLots);
app.post("/users", addUser);
app.get("/users", getUsers);
app.get("/users/:id", getUser);
app.get("/users/auth/:userId", getUserByUserId);
app.patch("/users/:id", updateUser);
app.delete("/users/:id", deleteUser);

exports.app = onRequest(app);
