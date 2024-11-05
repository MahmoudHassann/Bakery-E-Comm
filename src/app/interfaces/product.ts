import { Brand } from "./brand"
import { Category } from "./category"
import { Image } from "./image"
import { SubCategory } from "./sub-category"
import { UserId } from "./user-id"

export interface Product {
    _id: string
    userID: UserId
    name: string
    images: Image[]
    imagePublicIds: string[]
    description: string
    category: Category
    subCategory: SubCategory
    price: number
    stock: number
    soldItems: number
    totalAmount: number
    discount: number
    finalPrice: number
    colors: string[]
    sizes: string[]
    brand: Brand
    createdAt: string
    updatedAt: string
    __v: number
}
