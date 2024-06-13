export type Customer = {
    id: string,
    number: string,
    name: string,
    address: string,
    phone: string
};

export type Customers = {
    customers: Customer[],
};

export type AddCustomerResponse = {
    status: string,
    message: string,
    data: Customer
};

export type DeleteCustomerResponse = {
    status: string,
    message: string
};