import { Button } from "@/components/ui/button";

export default function ReportsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center justify-between">
                <h1>Reports</h1>
                <Button>Create Report</Button>
            </div>
            {children}
        </div>
    );
}