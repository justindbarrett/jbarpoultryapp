import { Customer } from "./customer.model";

export type Lot = {
    id: string,
    customer: Customer,
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

export type Lots = {
    lots: Lot[],
};

export type AddLotResponse = {
    status: string,
    message: string,
    data: Lot
};

export type DeleteLotResponse = {
    status: string,
    message: string
};