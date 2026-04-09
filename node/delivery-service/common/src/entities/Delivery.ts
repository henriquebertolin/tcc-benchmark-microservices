export interface Notification {
    id : string,
    user_id : string,
    order_id : string,
    message : string,
    status : string,
    created_at : Date,
    sent_at : Date
}

export interface SendNotification {
    notification_id : string,
    user_id : string,
    message : string,
}