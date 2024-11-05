import { Image } from "./image"

export interface ItemId {
    _id: string
    name: string
    images: Image[]
    stock: number
}
