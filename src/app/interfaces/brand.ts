import { UserId } from "./user-id"

export interface Brand {
    _id: string
    userID: UserId
    name: string
    createdAt: string
    updatedAt: string
    __v: number
    image: string
    imagePublicId: string
    updatedBy: string
}
