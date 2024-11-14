"use server"

export const getEnv = async () => {
    return {
        dev: process.env.IS_PRODUCTION !== "1" && process.env.NEXT_PUBLIC_IS_PRODUCTION !== "1"
    }
}
