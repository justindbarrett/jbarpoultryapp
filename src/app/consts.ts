import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class Consts {
    public USERDETAILS = {
        USER_ID: 'userId'
    }
    
    public static readonly SPECIES_TYPES: string[] = [
        'Broilers',
        'Stew-bird',
        'Turkey',
        'Duck',
        'Goose',
        'Squab'
    ];
}