"use server"

import { set, get } from "./redis"
import { sendEmail } from "./email"

import RegisterValid from "@/components/email/register-valid"
import ForgetPasswordValid from "@/components/email/forget-valid"
import { signIn } from "./auth"
import DeleteAccountValid from "@/components/email/delete-account-valid"
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function generateValidateCode() {
  return Math.floor(Math.random() * 1000000).toString().padStart(6, "0")
}

export async function sendValidateCode(email: string, type: "register" | "resetPassword" | "deleteAccount") {
  if (!validateEmail(email)) {
    return
  }
  if (await get(`send_mail:cooldown:${email}`)) {
    return
  }
  const code = generateValidateCode()
  await set(`validate_code:${email}:${type}`, code, 300)
  await set(`send_mail:cooldown:${email}`, "1", 60)
  await sendEmail(email, "Validate Code", type === "register" ? <RegisterValid code={code} /> : type === "resetPassword" ? <ForgetPasswordValid code={code} /> : <DeleteAccountValid code={code} />)
  return
}

export async function validateCode(email: string, type: "register" | "resetPassword" | "deleteAccount", code: string) {
  if (!validateEmail(email)) {
    return false
  } 
  const storedCode = await get(`validate_code:${email}:${type}`)
  return storedCode &&storedCode === code
}

