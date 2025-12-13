export type ScheduledLot = {
    id: string;
    customerId: string;
    allDay: boolean;
    endTime: Date;
    startTime: Date;
    title: string;
    species?: string;
    count?: number;
    processingStarted?: boolean;
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