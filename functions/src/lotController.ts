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
    notes?: string,
    isEditable?: boolean
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
    customerInitial: string,
    fsisInitial: string,
    finalCount: number,
    processingStarted: boolean,
    processingFinished: boolean,
    scheduleLotId?: string,
    checkInDetailsEditable?: boolean
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
    customerInitial: string,
    fsisInitial: string,
    finalCount: number,
    processingStarted: boolean,
    processingFinished: boolean,
    scheduleLotId?: string,
    checkInDetailsEditable?: boolean
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
    customerInitial: string,
    fsisInitial: string,
    finalCount: number,
    processingStarted: boolean,
    processingFinished: boolean,
    scheduleLotId?: string,
    checkInDetailsEditable?: boolean
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

const generateLotNumber = async (processDate: string): Promise<string> => {
    const datePrefix = processDate.replace(/-/g, "");
    
    // Query existing lots for this date to find the highest sequence number
    const existingLotsSnapshot = await db.collection(lotCollectionPath)
        .where("processDate", "==", processDate)
        .get();
    
    let maxSequence = 0;
    existingLotsSnapshot.docs.forEach((doc) => {
        const lotData = doc.data();
        if (lotData.lotNumber && lotData.lotNumber.startsWith(datePrefix)) {
            const sequence = parseInt(lotData.lotNumber.slice(-2), 10);
            if (sequence > maxSequence) {
                maxSequence = sequence;
            }
        }
    });
    
    return `${datePrefix}${String(maxSequence + 1).padStart(2, "0")}`;
};

const createLotDocument = async (lotData: LotInputType): Promise<LotType> => {
    try {
        const { processDate, customer, timeIn, withdrawalMet, isOrganic, lotNumber, species, customerCount, processingInstructions, anteMortemTime, customerInitial, fsisInitial, finalCount, processingStarted, processingFinished, scheduleLotId, checkInDetailsEditable } = lotData;
        console.log("Creating lot document with data:", JSON.stringify(lotData, null, 2));

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
        customerInitial: customerInitial || "",
        fsisInitial: fsisInitial || "",
        finalCount: finalCount || 0,
        processingStarted: processingStarted || false,
        processingFinished: processingFinished || false,
        scheduleLotId: scheduleLotId || "",
        checkInDetailsEditable: checkInDetailsEditable !== undefined ? checkInDetailsEditable : true,
    };
    
    console.log("Saving lot data to database:", JSON.stringify(lotDataToSave, null, 2));
    await lotDocument.set(lotDataToSave);
    console.log("Lot saved successfully with ID:", lotDocument.id);
    
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
        customerInitial: lotDataToSave.customerInitial,
        fsisInitial: lotDataToSave.fsisInitial,
        finalCount: lotDataToSave.finalCount,
        processingStarted: lotDataToSave.processingStarted,
        processingFinished: lotDataToSave.processingFinished,
        scheduleLotId: lotDataToSave.scheduleLotId,
        checkInDetailsEditable: lotDataToSave.checkInDetailsEditable,
    };
    
    console.log("Returning lot:", JSON.stringify(lot, null, 2));
    return lot;
    } catch (error) {
        console.error("Error in createLotDocument:", error);
        throw error;
    }
};

const createLot = async (req: CreateLotRequest, res: Response) => {
    try {
        const lotData = req.body;
        
        // Generate lot number if not provided or empty
        if (!lotData.lotNumber || lotData.lotNumber === "") {
            lotData.lotNumber = await generateLotNumber(lotData.processDate);
        }
        
        const lot = await createLotDocument(lotData);

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
    console.log("=== createLots called ===");
    const { lots: lotsData } = req.body;
    console.log("Lots data received:", JSON.stringify(lotsData, null, 2));

    try {
        if (!lotsData || lotsData.length === 0) {
            console.log("Error: No lots provided");
            res.status(400).json({
                status: "error",
                message: "No lots provided",
            });
            return;
        }

        // Get processDate from the first lot (assuming all lots are for the same date)
        const processDate = lotsData[0].processDate;
        console.log("Process date:", processDate);
        const datePrefix = processDate.replace(/-/g, "");
        console.log("Date prefix:", datePrefix);
        
        // Get the initial sequence number once for efficiency
        let currentSequence = await generateLotNumber(processDate).then((lotNumber) => {
            console.log("Generated starting lot number:", lotNumber);
            return parseInt(lotNumber.slice(-2), 10);
        });
        console.log("Starting sequence:", currentSequence);

        const createdLots: LotType[] = [];
        
        for (const lotData of lotsData) {
            console.log("Processing lot data:", JSON.stringify(lotData, null, 2));
            
            // Generate lot number if not provided or empty
            if (!lotData.lotNumber || lotData.lotNumber === "") {
                lotData.lotNumber = `${datePrefix}${String(currentSequence).padStart(2, "0")}`;
                console.log("Assigned lot number:", lotData.lotNumber);
                currentSequence++;
            }
            
            console.log("Calling createLotDocument...");
            const lot = await createLotDocument(lotData);
            console.log("Lot created successfully");
            createdLots.push(lot);
        }

        console.log("All lots created successfully. Total:", createdLots.length);
        res.status(200).json({
            status: "success",
            message: `${createdLots.length} lot(s) created successfully`,
            data: createdLots,
        });
    } catch (error) {
        console.error("Error in createLots:", error);
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        res.status(500).json({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error",
            error: error,
        });
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
    
    const { processDate, customer, timeIn, withdrawalMet, isOrganic, lotNumber, species, customerCount, processingInstructions, anteMortemTime, customerInitial, fsisInitial, finalCount, processingStarted, processingFinished, checkInDetailsEditable } = lotData;
    
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
        customerInitial: customerInitial || currentData.customerInitial,
        fsisInitial: fsisInitial || currentData.fsisInitial,
        finalCount: finalCount || currentData.finalCount,
        processingStarted: processingStarted !== undefined ? processingStarted : currentData.processingStarted,
        processingFinished: processingFinished !== undefined ? processingFinished : currentData.processingFinished,
        checkInDetailsEditable: checkInDetailsEditable !== undefined ? checkInDetailsEditable : currentData.checkInDetailsEditable,
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
        customerInitial: dataToSave.customerInitial!,
        fsisInitial: dataToSave.fsisInitial!,
        finalCount: dataToSave.finalCount!,
        processingStarted: dataToSave.processingStarted!,
        processingFinished: dataToSave.processingFinished!,
        checkInDetailsEditable: dataToSave.checkInDetailsEditable,
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

const getLot = async (req: CreateLotRequest, res: Response) => {
    const { id } = req.params;
    
    try {
        const lotDoc = await db.collection(lotCollectionPath).doc(id).get();
        
        if (!lotDoc.exists) {
            return res.status(404).json({
                status: "error",
                message: "Lot not found",
            });
        }
        
        const lotData: any = lotDoc.data();
        lotData.id = lotDoc.id;
        
        // Fetch customer data if customerId exists
        if (lotData.customerId) {
            const customerDoc = await db.collection("customers").doc(lotData.customerId).get();
            if (customerDoc.exists) {
                lotData.customer = customerDoc.data();
            }
        }
        
        return res.status(200).json(lotData);
    } catch (error) {
        return res.status(500).json(error);
    }
};

const deleteLot = async (req: CreateLotRequest, res: Response) => {
    const { id } = req.params;
    
    try {
        const lotRef = db.collection(lotCollectionPath).doc(id);
        const lotDoc = await lotRef.get();
        
        if (!lotDoc.exists) {
            res.status(404).json({
                status: "error",
                message: "Lot not found",
            });
            return;
        }
        
        const lotData = lotDoc.data();
        const scheduleLotId = lotData?.scheduleLotId;
        
        // Delete the lot
        await lotRef.delete();
        
        // If the lot has a scheduleLotId, update the schedule to set processingStarted to false
        if (scheduleLotId) {
            try {
                const scheduleRef = db.collection("schedule").doc(scheduleLotId);
                await scheduleRef.update({
                    processingStarted: false,
                });
                console.log(`Updated schedule ${scheduleLotId} - set processingStarted to false`);
            } catch (scheduleError) {
                console.error(`Error updating schedule ${scheduleLotId}:`, scheduleError);
                // Don't fail the delete if schedule update fails
            }
        }

        res.status(200).json({
            status: "success",
            message: "lot deleted successfully",
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

export { createLot, createLots, getLot, getLots, updateLot, updateLots, deleteLot };
