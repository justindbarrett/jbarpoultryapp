import { Response } from "express";
import { db } from "./config/firebase";

type ScheduleLotDataType = {
    customerId: string,
    allDay: boolean;
    endTime: Date;
    startTime: Date;
    title: string;
    species?: string;
    count?: number;
    processingStarted?: boolean;
};

type ScheduleLotType = {
    id: string,
    customerId: string,
    allDay: boolean;
    endTime: Date;
    startTime: Date;
    title: string;
    species?: string;
    count?: number;
    processingStarted?: boolean;
};

type Request = {
    body: ScheduleLotDataType,
    params: { id: string }
};

const scheduleCollectionPath = "schedule";

const scheduleLot = async (req: Request, res: Response) => {
    console.log("scheduleLot called with body:", JSON.stringify(req.body, null, 2));
    const { customerId, allDay, endTime, startTime, title, species, count, processingStarted } = req.body;
    
    try {
        console.log("Creating schedule document...");
        const scheduleDocument = await db.collection(
            scheduleCollectionPath
        ).doc();
        
        console.log("Schedule document ID:", scheduleDocument.id);
        
        const lot: ScheduleLotType = {
            id: scheduleDocument.id,
            customerId: customerId,
            allDay: allDay,
            endTime: endTime,
            startTime: startTime,
            title: title,
            species: species || "",
            count: count || 0,
            processingStarted: processingStarted || false,
        };
        
        console.log("Saving lot:", JSON.stringify(lot, null, 2));
        await scheduleDocument.set(lot);
        
        console.log("Lot scheduled successfully");
        res.status(200).json({
            status: "success",
            message: "lot scheduled successfully",
            data: lot,
        });
    } catch (error) {
        console.error("Error scheduling lot:", error);
        res.status(500).json(error);
    }
};

const getScheduledLots = async (req: Request, res: Response) => {
    try {
        const lots: ScheduleLotType[] = [];
        const querySnapshot = await db.collection(scheduleCollectionPath).get();
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

const updateScheduledLot = async (req: Request, res: Response) => {
    console.log("updateScheduledLot called with body:", JSON.stringify(req.body, null, 2));
    const { customerId, allDay, endTime, startTime, title, species, count, processingStarted } = req.body;
    const { id } = req.params;
    
    console.log("Updating scheduled lot with ID:", id);
    
    try {
        const lot = await db.collection(scheduleCollectionPath).doc(id);
        const currentData = (await lot.get()).data() || {};
        
        console.log("Current data:", JSON.stringify(currentData, null, 2));

        const newData: ScheduleLotType = {
            id: id,
            customerId: customerId || currentData.customerId,
            allDay: allDay || currentData.allDay,
            endTime: endTime || currentData.endTime,
            startTime: startTime || currentData.startTime,
            title: title || currentData.title,
            species: species || currentData.species || "",
            count: count !== undefined ? count : currentData.count || 0,
            processingStarted: processingStarted !== undefined ? processingStarted : currentData.processingStarted || false,
        };
        
        console.log("Updating with new data:", JSON.stringify(newData, null, 2));
        await lot.update(newData);
        
        console.log("Scheduled lot updated successfully");
        res.status(200).json({
            status: "success",
            message: "scheduled lot updated successfully",
            data: newData,
        });
    } catch (error) {
        console.error("Error updating scheduled lot:", error);
        res.status(500).json(error);
    }
};

const deleteScheduledLot = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const customer = await db.collection(scheduleCollectionPath).doc(id);
        await customer.delete();

        res.status(200).json({
            status: "success",
            message: "scheduled lot deleted successfully",
        });
    } catch (error) {
        res.status(500).json(error);
    }
};

export { scheduleLot, getScheduledLots, updateScheduledLot, deleteScheduledLot };
