import { SubCategory } from "./sub-category"
import { UserId } from "./user-id"

export interface Category {
    _id: string
    userID: UserId
    name: string
    subcategoriesList: SubCategory []
    createdAt: string
    updatedAt: string
    __v: number
    image: string
    imagePublicId: string
}
