import { Response } from "express";
import { db } from "./config/firebase";

type ScheduleLotDataType = {
    customerId: string,
    lotId: string,
    allDay: boolean;
    endTime: Date;
    startTime: Date;
    title: string;
    category?: string;
};

type ScheduleLotType = {
    id: string,
    customerId: string,
    lotId: string,
    allDay: boolean;
    endTime: Date;
    startTime: Date;
    title: string;
    category?: string;
};

type Request = {
    body: ScheduleLotDataType,
    params: { id: string }
};

const scheduleCollectionPath = "schedule";

const scheduleLot = async (req: Request, res: Response) => {
    const { customerId, lotId, allDay, endTime, startTime, title } = req.body;
    try {
        const scheduleDocument = await db.collection(
            scheduleCollectionPath
        ).doc();
        const lot: ScheduleLotType = {
            id: scheduleDocument.id,
            customerId: customerId,
            lotId: lotId,
            allDay: allDay,
            endTime: endTime,
            startTime: startTime,
            title: title,
        };
        await scheduleDocument.set(lot);

        res.status(200).json({
            status: "success",
            message: "lot scheduled successfully",
            data: lot,
        });
    } catch (error) {
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
    const { customerId, lotId, allDay, endTime, startTime, title } = req.body;
    const { id } = req.params;
    try {
        const lot = await db.collection(scheduleCollectionPath).doc(id);
        const currentData = (await lot.get()).data() || {};

        const newData: ScheduleLotType = {
            id: id,
            customerId: customerId || currentData.customerId,
            lotId: lotId || currentData.lotId,
            allDay: allDay || currentData.allDay,
            endTime: endTime || currentData.endTime,
            startTime: startTime || currentData.startTime,
            title: title || currentData.title,
        };
        await lot.update(newData);

        res.status(200).json({
            status: "success",
            message: "scheduled lot updated successfully",
            data: newData,
        });
    } catch (error) {
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
