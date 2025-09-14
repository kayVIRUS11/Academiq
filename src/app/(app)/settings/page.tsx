import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
                <Settings className="w-8 h-8"/>
                Settings
            </h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export your data for backup or import it to another device.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <Button disabled>
                <Download className="mr-2"/>
                Export Data
            </Button>
            <Button variant="secondary" disabled>
                <Upload className="mr-2" />
                Import Data
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
