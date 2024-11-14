import { User } from "@prisma/client"
import { EventEmitter } from "events"

export const serverEvent = new EventEmitter()

export type UserChargeEvent = {
    user: User
    price: number
}

