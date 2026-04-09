export interface User {
    id : string,
    name : string,
    email : string,
    created_at : Date
}

export interface CreateUsuarioRequest {
    name : string,
    email : string,
}

export interface CreateUsuarioResponse {
    id : string
}