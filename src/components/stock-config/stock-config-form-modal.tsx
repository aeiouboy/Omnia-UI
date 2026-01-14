"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Channel, StockConfigItem } from "@/types/stock-config"

const formSchema = z.object({
    locationId: z.string().min(1, "Location ID is required"),
    itemId: z.string().min(1, "Item ID is required"),
    quantity: z.coerce.number().min(0, "Quantity must be positive"),
    supplyTypeId: z.enum(["PreOrder", "On Hand Available"] as const),
    frequency: z.enum(["One-time", "Daily"] as const),
    channels: z.array(z.enum(["TOL", "MKP", "QC"] as const)).min(1, "Select at least one channel"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
})

type StockConfigFormData = z.infer<typeof formSchema>

interface StockConfigFormModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: StockConfigFormData) => void
    initialData?: StockConfigItem | null
    loading?: boolean
}

export function StockConfigFormModal({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    loading = false,
}: StockConfigFormModalProps) {
    const form = useForm<StockConfigFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            locationId: "",
            itemId: "",
            quantity: 0,
            supplyTypeId: "PreOrder",
            frequency: "One-time",
            channels: ["TOL"],
            startDate: "",
            endDate: "",
        },
    })

    // Reset form when opening or initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    locationId: initialData.locationId,
                    itemId: initialData.itemId,
                    quantity: initialData.quantity,
                    supplyTypeId: initialData.supplyTypeId === "Preorder" ? "PreOrder" :
                        initialData.supplyTypeId === "OnHand" ? "On Hand Available" :
                            initialData.supplyTypeId,
                    frequency: initialData.frequency === "Onetime" ? "One-time" : initialData.frequency,
                    channels: initialData.channel ? [initialData.channel] : ["TOL"],
                    startDate: initialData.startDate?.split("T")[0] || "",
                    endDate: initialData.endDate?.split("T")[0] || "",
                })
            } else {
                form.reset({
                    locationId: "",
                    itemId: "",
                    quantity: 0,
                    supplyTypeId: "PreOrder",
                    frequency: "One-time",
                    channels: ["TOL"],
                    startDate: "",
                    endDate: "",
                })
            }
        }
    }, [open, initialData, form])

    const handleSubmit = (data: StockConfigFormData) => {
        onSubmit(data)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Configuration" : "Create Configuration"}</DialogTitle>
                    <DialogDescription>
                        {initialData
                            ? "Update stock configuration details."
                            : "Add new stock configuration. Multiple channels will create multiple records."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="locationId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. WH001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="itemId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Item ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. ITEM123" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="supplyTypeId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supply Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PreOrder">PreOrder</SelectItem>
                                                <SelectItem value="On Hand Available">On Hand Available</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="frequency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frequency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select frequency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="One-time">One-time</SelectItem>
                                                <SelectItem value="Daily">Daily</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="channels"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Channels</FormLabel>
                                    <FormControl>
                                        <ToggleGroup
                                            type="multiple"
                                            variant="outline"
                                            value={field.value}
                                            onValueChange={field.onChange}
                                            className="justify-start"
                                        >
                                            <ToggleGroupItem value="TOL" aria-label="Toggle TOL">TOL</ToggleGroupItem>
                                            <ToggleGroupItem value="MKP" aria-label="Toggle MKP">MKP</ToggleGroupItem>
                                            <ToggleGroupItem value="QC" aria-label="Toggle QC">QC</ToggleGroupItem>
                                        </ToggleGroup>
                                    </FormControl>
                                    <FormDescription>Select all active channels</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading && "Saving..."}
                                {!loading && (initialData ? "Update" : "Create")}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
