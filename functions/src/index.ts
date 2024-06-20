import { onRequest } from "firebase-functions/v2/https";
import * as express from "express";
import * as cors from "cors";
import { addCustomer,
    deleteCustomer,
    getCustomers,
    updateCustomer } from "./customerController";
import { deleteScheduledLot, getScheduledLots, scheduleLot, updateScheduledLot } from "./scheduleController";
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

exports.app = onRequest(app);
