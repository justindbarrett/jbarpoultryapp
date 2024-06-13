export type ScheduledLot = {
    id: string,
    title: string,
    day: string,
    customerId: string
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