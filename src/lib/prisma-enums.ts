import { ProductType, TimeCycle } from "@prisma/client";

export function parseProductType(productType: string) {
    switch(productType) {
        case "FREE": return ProductType.FREE
        case "PRO_MONTHLY": return ProductType.PRO_MONTHLY
        case "PRO_YEARLY": return ProductType.PRO_YEARLY
        case "PRO_FIXED": return ProductType.PRO_FIXED
    }
}

export function parseTimeCycle(timeCycle: string) {
    switch(timeCycle) {
        case "NONE": return TimeCycle.NONE
        case "WEEKLY": return TimeCycle.WEEKLY
        case "MONTHLY": return TimeCycle.MONTHLY
        case "YEARLY": return TimeCycle.YEARLY
        case "PERMANENT": return TimeCycle.PERMANENT
    }
}
