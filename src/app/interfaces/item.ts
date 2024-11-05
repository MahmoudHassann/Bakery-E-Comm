import { ItemId } from "./item-id"

export interface Item {
    itemId: ItemId
    name: string
    quantity: number
    price: number
    _id: string
}
