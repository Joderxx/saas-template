"use client"
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MultiSelect from "./multi-select";

interface Role {
    label: string
    value: string
}

export default function MultiRoleSelect({value, onValueChange, ...props}: {value: string[], onValueChange: (value: string[]) => void, [key: string]: any}) {
    const [roles, setRoles] = useState<Role[]>([])
    function getRoles() {
        fetch("/api/user/roles")
            .then((res) => res.json())
            .then(res => res.data)
            .then((data) => {
                setRoles(data.map((role: any) => ({
                    value: role.id,
                    label: role.name
                })))
            })
    }

    useEffect(() => {
        getRoles()
    }, [])

    return <>
        <MultiSelect value={value} onValueChange={onValueChange} items={roles} {...props} />
    </>
}