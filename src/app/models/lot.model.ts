import { Customer } from "./customer.model";

export type ProcessingInstructions = {
    wholeBirds: number;
    cutUpBirds: number;
    halves: number;
    sixPiece: number;
    eightPiece: number;
    extrasToSave?: string[];
    notes?: string;
};

export type Lot = {
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