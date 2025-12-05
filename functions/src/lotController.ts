import { Response } from "express";
import { db } from "./config/firebase";

type LotDataType = {
    processDate: string,
    customerId: string,
    timeIn: string,
    withdrawalMet: boolean,
    isOrganic: boolean,
    lotNumber: string,
    species: string,
    customerCount: number,
    specialInstructions: string,
    anteMortemTime: string,
    fsisInitial: string,
    finalCount: number
};

type LotsDataType = {
    lots: LotDataType[]
};

type LotType = {
    id: string,
    processDate: string,
    customerId: string,
    timeIn: string,
    withdrawalMet: boolean,
    isOrganic: boolean,
    lotNumber: string,
    species: string,
    customerCount: number,
    specialInstructions: string,
    anteMortemTime: string,
    fsisInitial: string,
    finalCount: number
};

type CreateLotRequest = {
    body: LotDataType,
    params: { id: string }
};

type CreateLotsRequest = {
    body: LotsDataType,
    params: { id: string }
};

type UpdateLotRequest = {
    body: Partial<LotDataType>,
    params: { id: string }
};

type UpdateLotsRequest = {
    body: { lots: Array<{ id: string } & Partial<LotDataType>> },
    params: { id: string }
};

const lotCollectionPath = "lots";

const createLotDocument = async (lotData: LotDataType): Promise<LotType> => {
    const { processDate, customerId, timeIn, withdrawalMet, isOrganic, lotNumber, species, customerCount, specialInstructions, anteMortemTime, fsisInitial, finalCount } = lotData;
    
    const lotDocument = await db.collection(lotCollectionPath).doc();
    const lot: LotType = {
        id: lotDocument.id,
        processDate: processDate,
        customerId: customerId,
        timeIn: timeIn,
        withdrawalMet: withdrawalMet || false,
        isOrganic: isOrganic || false,
        lotNumber: lotNumber || "",
        species: species || "",
        customerCount: customerCount || 0,
        specialInstructions: specialInstructions || "",
        anteMortemTime: anteMortemTime || "",
        fsisInitial: fsisInitial || "",
        finalCount: finalCount || 0
    };
    
    await lotDocument.set(lot);
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
    const { lots: lotsData } = req.body;
    
    try {
        const createdLots: LotType[] = [];
        
        for (const lotData of lotsData) {
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
        const lots: LotType[] = [];
        const querySnapshot = await db.collection(lotCollectionPath).get();
        querySnapshot.forEach((doc: any) => {
            lots.push(doc.data());
        });

        res.status(200).json({
            lots: lots,
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

const updateLotDocument = async (id: string, lotData: Partial<LotDataType>): Promise<LotType> => {
    const { processDate, customerId, timeIn, withdrawalMet, isOrganic, lotNumber, species, customerCount, specialInstructions, anteMortemTime, fsisInitial, finalCount } = lotData;
    
    const lot = await db.collection(lotCollectionPath).doc(id);
    const currentData = (await lot.get()).data() || {};

    const newData: LotType = {
        id: id,
        processDate: processDate || currentData.processDate,
        customerId: customerId || currentData.customerId,
        timeIn: timeIn || currentData.timeIn,
        withdrawalMet: withdrawalMet !== undefined ? withdrawalMet : currentData.withdrawalMet,
        isOrganic: isOrganic !== undefined ? isOrganic : currentData.isOrganic,
        lotNumber: lotNumber || currentData.lotNumber,
        species: species || currentData.species,
        customerCount: customerCount || currentData.customerCount,
        specialInstructions: specialInstructions || currentData.specialInstructions,
        anteMortemTime: anteMortemTime || currentData.anteMortemTime,
        fsisInitial: fsisInitial || currentData.fsisInitial,
        finalCount: finalCount || currentData.finalCount
    };
    
    await lot.update(newData);
    return newData;
};

const updateLot = async (req: UpdateLotRequest, res: Response) => {
    const { id } = req.params;
    
    try {
        const updatedLot = await updateLotDocument(id, req.body);

        res.status(200).json({
            status: "success",
            message: "lot updated successfully",
            data: updatedLot,
        });
    } catch (error) {
        res.status(500).json(error);
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
