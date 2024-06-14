import { IEvent } from "ionic7-calendar/calendar.interface";

export type ScheduledLot = {
    id: string,
    customerId: string,
    lotId: string,
    eventData: IEvent
};

export type ScheduledLots = {
    lots: ScheduledLot[],
}

export type ScheduleLotResponse = {
    status: string,
    message: string,
    data: ScheduledLot
};

export type DeleteScheduleLotResponse = {
    status: string,
    message: string
};