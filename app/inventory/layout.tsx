import { InventoryViewProvider } from "@/contexts/inventory-view-context"

export default function InventoryLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <InventoryViewProvider>
            {children}
        </InventoryViewProvider>
    )
}
