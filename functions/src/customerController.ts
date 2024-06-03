import { Response } from "express";
import { db } from "./config/firebase";

type CustomerDataType = {
    name: string,
    address: string,
    phone: string,
};

type CustomerType = {
    id: string,
    number: string,
    data: CustomerDataType
}

type Request = {
    body: CustomerDataType,
    params: { id: string }
};

const customerCollectionPath = "customers";
const customerNumberCollectionPath = "customerNumber";
const prevCustomerNumberDocumentPath = "prevCustomerNumber";

const addCustomer = async (req: Request, res: Response) => {
    const { name, address, phone } = req.body;
    try {
        const customerDocument = await db.collection(customerCollectionPath).doc();
        const customerNumber = await getNewCustomerNumber();
        const customer: CustomerType = {
            id: customerDocument.id,
            number: customerNumber,
            data: {
                name: name,
                address: address,
                phone: phone,
            }
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
    const prevCustomerNumberDocument = await db.collection(customerNumberCollectionPath).doc(prevCustomerNumberDocumentPath);
    const prevCustomerNumber = (await prevCustomerNumberDocument.get()).data();
    if (prevCustomerNumber) {
        const newCustomerNumber = prevCustomerNumber as any + 1;
        prevCustomerNumberDocument.set(newCustomerNumber);
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

        res.status(200).json({
            customers: customers
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const updateCustomer = async (req: Request, res: Response) => {
    const { name, address, phone } = req.body;
    const { id } = req.params;
    try {
        const customer = await db.collection(customerCollectionPath).doc(id);
        const currentData = (await customer.get()).data() || {};
        
        const newData = {
            id: id,
            number: currentData.number,
            name: name || currentData.name,
            address: address || currentData.address,
            phone: phone || currentData.phone
        };
        await customer.set(newData);

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
