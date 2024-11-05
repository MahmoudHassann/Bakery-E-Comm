import { UserId } from "./user-id"

export interface SubCategory {
    _id: string
    userID: UserId
    name: string
    categoryID: string
    createdAt: string
    updatedAt: string
    __v: number
    image: string
    imagePublicId: string
    updatedBy: string
}
