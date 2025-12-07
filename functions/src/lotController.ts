import { Response } from "express";
import { db } from "./config/firebase";

type Customer = {
    id: string,
    number: string,
    name: string,
    address: string,
    phone: string
};

type ProcessingInstructions = {
    wholeBirds: number,
    cutUpBirds: number,
    halves: number,
    sixPiece: number,
    eightPiece: number,
    extrasToSave?: string[],
    notes?: string
};

type LotInputType = {
    processDate: string,
    customer: Customer,
    timeIn: string,
    withdrawalMet: boolean,
    isOrganic: boolean,
    lotNumber: string,
    species: string,
    customerCount: number,
    processingInstructions: ProcessingInstructions,
    anteMortemTime: string,
    fsisInitial: string,
    finalCount: number,
    processingStarted: boolean,
    processingFinished: boolean
};

type LotDataType = {
    processDate: string,
    customerId: string,
    timeIn: string,
    withdrawalMet: boolean,
    isOrganic: boolean,
    lotNumber: string,
    species: string,
    customerCount: number,
    processingInstructions: ProcessingInstructions,
    anteMortemTime: string,
    fsisInitial: string,
    finalCount: number,
    processingStarted: boolean,
    processingFinished: boolean
};

type LotsInputType = {
    lots: LotInputType[]
};

type LotType = {
    id: string,
    processDate: string,
    customer: Customer,
    timeIn: string,
    withdrawalMet: boolean,
    isOrganic: boolean,
    lotNumber: string,
    species: string,
    customerCount: number,
    processingInstructions: ProcessingInstructions,
    anteMortemTime: string,
    fsisInitial: string,
    finalCount: number,
    processingStarted: boolean,
    processingFinished: boolean
};

type CreateLotRequest = {
    body: LotInputType,
    params: { id: string }
};

type CreateLotsRequest = {
    body: LotsInputType,
    params: { id: string }
};

type UpdateLotRequest = {
    body: Partial<LotInputType>,
    params: { id: string }
};

type UpdateLotsRequest = {
    body: { lots: Array<{ id: string } & Partial<LotInputType>> },
    params: { id: string }
};

const lotCollectionPath = "lots";

const createLotDocument = async (lotData: LotInputType): Promise<LotType> => {
    const { processDate, customer, timeIn, withdrawalMet, isOrganic, lotNumber, species, customerCount, processingInstructions, anteMortemTime, fsisInitial, finalCount, processingStarted, processingFinished } = lotData;
    console.log("Creating lot document with data:", lotData);

    const lotDocument = await db.collection(lotCollectionPath).doc();
    
    // Save to database with customerId only
    const lotDataToSave: LotDataType = {
        processDate: processDate,
        customerId: customer.id,
        timeIn: timeIn,
        withdrawalMet: withdrawalMet || false,
        isOrganic: isOrganic || false,
        lotNumber: lotNumber || "",
        species: species || "",
        customerCount: customerCount || 0,
        processingInstructions: processingInstructions || {
            wholeBirds: 0,
            cutUpBirds: 0,
            halves: 0,
            sixPiece: 0,
            eightPiece: 0,
            extrasToSave: [],
            notes: "",
        },
        anteMortemTime: anteMortemTime || "",
        fsisInitial: fsisInitial || "",
        finalCount: finalCount || 0,
        processingStarted: processingStarted || false,
        processingFinished: processingFinished || false,
    };
    
    await lotDocument.set(lotDataToSave);
    
    // Return lot with customer object (not customerId)
    const lot: LotType = {
        id: lotDocument.id,
        processDate: lotDataToSave.processDate,
        customer: customer,
        timeIn: lotDataToSave.timeIn,
        withdrawalMet: lotDataToSave.withdrawalMet,
        isOrganic: lotDataToSave.isOrganic,
        lotNumber: lotDataToSave.lotNumber,
        species: lotDataToSave.species,
        customerCount: lotDataToSave.customerCount,
        processingInstructions: lotDataToSave.processingInstructions,
        anteMortemTime: lotDataToSave.anteMortemTime,
        fsisInitial: lotDataToSave.fsisInitial,
        finalCount: lotDataToSave.finalCount,
        processingStarted: lotDataToSave.processingStarted,
        processingFinished: lotDataToSave.processingFinished,
    };
    
    return lot;
};

const createLot = async (req: CreateLotRequest, res: Response) => {
    try {
        const lot = await createLotDocument(req.body);

        res.status(200).json({
            status: "success",
            message: "lot created successfully",
            data: lot,
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const createLots = async (req: CreateLotsRequest, res: Response) => {
    console.log("Creating lots...");
    const { lots: lotsData } = req.body;
    console.log("Lots data received:", lotsData);

    try {
        const createdLots: LotType[] = [];
        
        for (const lotData of lotsData) {
            console.log("Creating lot:", lotData);
            const lot = await createLotDocument(lotData);
            createdLots.push(lot);
        }

        res.status(200).json({
            status: "success",
            message: `${createdLots.length} lot(s) created successfully`,
            data: createdLots,
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const getLots = async (req: CreateLotRequest, res: Response) => {
    try {
        const lots: any[] = [];
        const querySnapshot = await db.collection(lotCollectionPath).get();
        
        // Fetch all lots and populate customer data
        for (const doc of querySnapshot.docs) {
            const lotData = doc.data();
            
            // Add document ID to the lot data
            lotData.id = doc.id;
            
            // Fetch customer data if customerId exists
            if (lotData.customerId) {
                const customerDoc = await db.collection("customers").doc(lotData.customerId).get();
                if (customerDoc.exists) {
                    lotData.customer = customerDoc.data();
                }
            }
            
            lots.push(lotData);
        }

        res.status(200).json({
            lots: lots,
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const updateLotDocument = async (id: string, lotData: Partial<LotInputType>): Promise<LotType> => {
    console.log("updateLotDocument called with ID:", id);
    console.log("updateLotDocument lotData:", JSON.stringify(lotData, null, 2));
    
    const { processDate, customer, timeIn, withdrawalMet, isOrganic, lotNumber, species, customerCount, processingInstructions, anteMortemTime, fsisInitial, finalCount, processingStarted, processingFinished } = lotData;
    
    const lot = await db.collection(lotCollectionPath).doc(id);
    const currentData = (await lot.get()).data() || {};
    
    console.log("Current lot data from DB:", JSON.stringify(currentData, null, 2));

    // Prepare data to save (with customerId)
    const dataToSave: Partial<LotDataType> = {
        processDate: processDate || currentData.processDate,
        customerId: customer?.id || currentData.customerId,
        timeIn: timeIn || currentData.timeIn,
        withdrawalMet: withdrawalMet !== undefined ? withdrawalMet : currentData.withdrawalMet,
        isOrganic: isOrganic !== undefined ? isOrganic : currentData.isOrganic,
        lotNumber: lotNumber || currentData.lotNumber,
        species: species || currentData.species,
        customerCount: customerCount || currentData.customerCount,
        processingInstructions: processingInstructions || currentData.processingInstructions,
        anteMortemTime: anteMortemTime || currentData.anteMortemTime,
        fsisInitial: fsisInitial || currentData.fsisInitial,
        finalCount: finalCount || currentData.finalCount,
        processingStarted: processingStarted !== undefined ? processingStarted : currentData.processingStarted,
        processingFinished: processingFinished !== undefined ? processingFinished : currentData.processingFinished,
    };
    
    console.log("Data to save to DB:", JSON.stringify(dataToSave, null, 2));
    
    await lot.update(dataToSave);
    
    console.log("Lot updated successfully in DB");
    
    // Fetch customer data to return with lot
    let customerData = customer;
    if (!customerData && dataToSave.customerId) {
        const customerDoc = await db.collection("customers").doc(dataToSave.customerId).get();
        if (customerDoc.exists) {
            customerData = customerDoc.data() as Customer;
        }
    }
    
    // Return lot with customer object (not customerId)
    const newData: LotType = {
        id: id,
        processDate: dataToSave.processDate!,
        customer: customerData!,
        timeIn: dataToSave.timeIn!,
        withdrawalMet: dataToSave.withdrawalMet!,
        isOrganic: dataToSave.isOrganic!,
        lotNumber: dataToSave.lotNumber!,
        species: dataToSave.species!,
        customerCount: dataToSave.customerCount!,
        processingInstructions: dataToSave.processingInstructions!,
        anteMortemTime: dataToSave.anteMortemTime!,
        fsisInitial: dataToSave.fsisInitial!,
        finalCount: dataToSave.finalCount!,
        processingStarted: dataToSave.processingStarted!,
        processingFinished: dataToSave.processingFinished!,
    };
    
    console.log("Returning lot data:", JSON.stringify(newData, null, 2));
    
    return newData;
};

const updateLot = async (req: UpdateLotRequest, res: Response) => {
    const { id } = req.params;

    console.log("=== updateLot endpoint called ===");
    console.log("Updating lot with ID:", id);
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    try {
        const updatedLot = await updateLotDocument(id, req.body);

        console.log("Update successful, sending response");
        res.status(200).json({
            status: "success",
            message: "lot updated successfully",
            data: updatedLot,
        });
    } catch (error) {
        console.error("Error updating lot:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        res.status(500).json({ 
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
            error: error,
        });
    }
};

const updateLots = async (req: UpdateLotsRequest, res: Response) => {
    const { lots: lotsData } = req.body;
    
    try {
        const updatedLots: LotType[] = [];
        
        for (const lotData of lotsData) {
            const { id, ...updateData } = lotData;
            const updatedLot = await updateLotDocument(id, updateData);
            updatedLots.push(updatedLot);
        }

        res.status(200).json({
            status: "success",
            message: `${updatedLots.length} lot(s) updated successfully`,
            data: updatedLots,
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const deleteLot = async (req: CreateLotRequest, res: Response) => {
    const { id } = req.params;
    
    try {
        const lot = await db.collection(lotCollectionPath).doc(id);
        await lot.delete();

        res.status(200).json({
            status: "success",
            message: "lot deleted successfully",
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

export { createLot, createLots, getLots, updateLot, updateLots, deleteLot };
