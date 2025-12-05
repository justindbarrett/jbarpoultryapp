export type ScheduledLot = {
    id: string;
    customerId: string;
    lotId: string;
    allDay: boolean;
    endTime: Date;
    startTime: Date;
    title: string;
    category?: string;
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