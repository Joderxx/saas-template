"use client"
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

interface Role {
  id: string
  name: string
}

export default function RoleSelect({ value, onValueChange, ...props }: { value: string, onValueChange: (value: string) => void, [key: string]: any }) {
  const t = useTranslations("General")
  const [roles, setRoles] = useState<Role[]>([])
  function getRoles() {
    fetch("/api/user/roles")
      .then((res) => res.json())
      .then(res => res.data)
      .then((data) => {
        setRoles(data.map((role: Role) => ({
          id: role.id,
          name: role.name
        })))
      })
  }

  useEffect(() => {
    getRoles()
  }, [])

  return <>
    <Select value={value} onValueChange={onValueChange} {...props}>
      <SelectTrigger>
        <SelectValue placeholder={t("SelectRole")} />
      </SelectTrigger>
      <SelectContent>
        {roles.map((role) => (
          <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </>
}