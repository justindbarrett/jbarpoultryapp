import { Response } from "express";
import { db } from "./config/firebase";

type CustomerDataType = {
    name: string,
    address: string,
    phone: string,
};

export type CustomerType = {
    id: string,
    number: string,
    name: string,
    address: string,
    phone: string,
}

type Request = {
    body: CustomerDataType,
    params: { id: string }
};

const customerCollectionPath = "customers";
const customerConfigCollectionPath = "customerConfig";
const customerNumberDocumentPath = "customerNumber";

const addCustomer = async (req: Request, res: Response) => {
    const { name, address, phone } = req.body;
    try {
        const customerDocument = await db.collection(
            customerCollectionPath
        ).doc();
        const customerNumber = await getNewCustomerNumber();
        const customer: CustomerType = {
            id: customerDocument.id,
            number: customerNumber,
            name: name,
            address: address,
            phone: phone,
        };
        await customerDocument.set(customer);

        res.status(200).json({
            status: "success",
            message: "customer added successfully",
            data: customer,
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const getNewCustomerNumber = async () => {
    const customerNumberDocument = await db.collection(customerConfigCollectionPath).doc(customerNumberDocumentPath);
    const prevCustomerNumber = (await customerNumberDocument.get()).data()?.prevCustomerNumber;
    if (prevCustomerNumber !== null && prevCustomerNumber !== undefined) {
        const newCustomerNumber = prevCustomerNumber + 1;
        customerNumberDocument.set({prevCustomerNumber: newCustomerNumber});
        return newCustomerNumber as string;
    }
    return "-1";
};

const getCustomers = async (req: Request, res: Response) => {
    try {
        const customers: CustomerType[] = [];
        const querySnapshot = await db.collection(customerCollectionPath).get();
        querySnapshot.forEach((doc: any) => {
            customers.push(doc.data());
        });
        customers.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

        res.status(200).json({
            customers: customers,
        });
    } catch (error) {
        console.log(`ERROR: ${error}`);
        res.status(500).json(error);
    }
};

const updateCustomer = async (req: Request, res: Response) => {
    const { name, address, phone } = req.body;
    const { id } = req.params;
    try {
        const customer = await db.collection(customerCollectionPath).doc(id);
        const currentData = (await customer.get()).data() || {};

        const newData: CustomerType = {
            id: id,
            number: currentData.number,
            name: name || currentData.data.name,
            address: address || currentData.data.address,
            phone: phone || currentData.data.phone,
        };
        await customer.update(newData);

        res.status(200).json({
            status: "success",
            message: "customer updated successfully",
            data: newData,
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const customer = await db.collection(customerCollectionPath).doc(id);
        await customer.delete();

        res.status(200).json({
            status: "success",
            message: "customer deleted successfully",
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

export { addCustomer, getCustomers, updateCustomer, deleteCustomer };
