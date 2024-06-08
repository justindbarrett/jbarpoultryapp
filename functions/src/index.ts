import { onRequest } from "firebase-functions/v2/https";
import * as express from "express";
import { addCustomer,
    deleteCustomer,
    getCustomers,
    updateCustomer } from "./customerController";

const app = express();
app.get("/", (req, res) => res.status(200).send("HeyHeyHey"));
app.post("/customers", addCustomer);
app.get("/customers", getCustomers);
app.patch("/customers/:id", updateCustomer);
app.delete("/customers/:id", deleteCustomer);

exports.app = onRequest(app);
