import { Customer } from "./customer.model";

export type ProcessingInstructions = {
    wholeBirds: number;
    cutUpBirds: number;
    halves: number;
    sixPiece: number;
    eightPiece: number;
    extrasToSave?: string[];
    notes?: string;
    isEditable?: boolean;
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
    customerInitial: string,
    fsisInitial: string,
    finalCount: number,
    processingStarted: boolean,
    processingFinished: boolean,
    scheduleLotId?: string,
    checkInDetailsEditable?: boolean
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