'use client'

import { useState } from 'react'
import { TimeSlot } from '@/types/atc-config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2 } from 'lucide-react'

interface TimeSlotPickerProps {
  value: TimeSlot[]
  onChange: (slots: TimeSlot[]) => void
  title?: string
  description?: string
}

const DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

const HOURS = Array.from({ length: 24 }, (_, i) => i)

/**
 * TimeSlotPicker Component
 *
 * Reusable component for selecting time slots with day and hour range selection.
 * Displays visual representation of selected time slots and allows adding/removing slots.
 */
export function TimeSlotPicker({ value, onChange, title, description }: TimeSlotPickerProps) {
  const [selectedDay, setSelectedDay] = useState<TimeSlot['day']>('monday')
  const [startHour, setStartHour] = useState(9)
  const [endHour, setEndHour] = useState(17)

  const handleAddSlot = () => {
    if (startHour >= endHour) {
      return // Invalid time range
    }

    const newSlot: TimeSlot = {
      day: selectedDay,
      start_hour: startHour,
      end_hour: endHour,
    }

    onChange([...value, newSlot])
  }

  const handleRemoveSlot = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${ampm}`
  }

  const capitalizeDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Time Slot Configuration'}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Time Slot Form */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Day</Label>
            <Select value={selectedDay} onValueChange={(v) => setSelectedDay(v as TimeSlot['day'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day) => (
                  <SelectItem key={day} value={day}>
                    {capitalizeDay(day)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Hour</Label>
            <Select value={startHour.toString()} onValueChange={(v) => setStartHour(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {formatHour(hour)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>End Hour</Label>
            <Select value={endHour.toString()} onValueChange={(v) => setEndHour(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOURS.map((hour) => (
                  <SelectItem key={hour} value={hour.toString()}>
                    {formatHour(hour)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              type="button"
              onClick={handleAddSlot}
              disabled={startHour >= endHour}
              className="w-full"
            >
              Add Slot
            </Button>
          </div>
        </div>

        {/* Selected Time Slots Display */}
        {value.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Time Slots ({value.length})</Label>
            <div className="space-y-2">
              {value.map((slot, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                >
                  <div className="text-sm">
                    <span className="font-medium">{capitalizeDay(slot.day)}</span>
                    <span className="text-muted-foreground ml-2">
                      {formatHour(slot.start_hour)} - {formatHour(slot.end_hour)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSlot(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Weekly Grid (Mobile-first responsive) */}
        {value.length > 0 && (
          <div className="space-y-2">
            <Label>Visual Schedule</Label>
            <div className="overflow-x-auto">
              <div className="min-w-[600px] space-y-1">
                {DAYS.map((day) => {
                  const daySlots = value.filter((s) => s.day === day)
                  return (
                    <div key={day} className="flex items-center gap-2">
                      <div className="w-20 text-xs font-medium text-muted-foreground">
                        {capitalizeDay(day).slice(0, 3)}
                      </div>
                      <div className="flex-1 h-8 bg-muted/30 rounded relative">
                        {daySlots.map((slot, idx) => {
                          const left = (slot.start_hour / 24) * 100
                          const width = ((slot.end_hour - slot.start_hour) / 24) * 100
                          return (
                            <div
                              key={idx}
                              className="absolute h-full bg-primary/70 rounded"
                              style={{
                                left: `${left}%`,
                                width: `${width}%`,
                              }}
                              title={`${formatHour(slot.start_hour)} - ${formatHour(slot.end_hour)}`}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                <div className="flex items-center gap-2 pt-1">
                  <div className="w-20" />
                  <div className="flex-1 flex justify-between text-xs text-muted-foreground">
                    <span>12AM</span>
                    <span>6AM</span>
                    <span>12PM</span>
                    <span>6PM</span>
                    <span>11PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
