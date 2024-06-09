export type Customer = {
    id: string,
    number: string,
    data: {
        name: string,
        address: string,
        phone: string
    },
};

export type Customers = {
    customers: Customer[],
};