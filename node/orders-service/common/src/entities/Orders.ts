export interface Order {
    id : string,
    user_id : string,
    amount : number,
    description : string,
    status : string,
    created_at : Date
}

export interface CreateOrderRequest {
    userEmail : string,
    amount : number,
    description : string
}