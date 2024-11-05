import { Item } from "./item"
import { UserId } from "./user-id"

export interface Cart {
    _id: string
    userID: UserId
    items: Item[]
    bill: number
    createdAt: string
    updatedAt: string
    __v: number
}
