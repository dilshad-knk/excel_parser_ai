// components/EditableGrid.tsx
"use client"

import React, { useState } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditableGridProps {
  entity: "clients" | "workers" | "tasks"
  data: any[]
  onUpdate: (updated: any[]) => void
}

export default function EditableGrid({ entity, data, onUpdate }: EditableGridProps) {
  const [rows, setRows] = useState(data)

  const handleChange = (rowIdx: number, key: string, value: string) => {
    const updatedRows = [...rows]
    updatedRows[rowIdx][key] = value
    setRows(updatedRows)
    onUpdate(updatedRows)
  }

  if (!rows.length) return null

  const headers = Object.keys(rows[0])

  return (
    <Card className="mt-6 overflow-x-auto">
      <CardHeader>
        <h3 className="text-lg font-semibold capitalize">{entity} Data</h3>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-muted">
              <thead>
                <tr className="bg-muted text-left">
                  {headers.map((h) => (
                    <th key={h} className="border px-3 py-2 min-w-[150px] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="even:bg-muted/30">
                    {headers.map((h) => (
                      <td key={h} className="border px-2 py-1 min-w-[150px]">
                        <Input
                          value={row[h]}
                          onChange={(e) => handleChange(rowIdx, h, e.target.value)}
                          className="h-8 text-sm w-full"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
