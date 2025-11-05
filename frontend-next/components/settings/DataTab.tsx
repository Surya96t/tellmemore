"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Download, Trash2, FileDown, Database } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export function DataTab() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement export functionality
      // This should call a backend endpoint to generate a JSON/CSV export
      toast.success("Export Started", {
        description: "Your data export is being prepared. This may take a few moments.",
      });

      // Simulate export (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Export Complete", {
        description: "Your data has been downloaded successfully.",
      });
    } catch {
      toast.error("Export Failed", {
        description: "Failed to export your data. Please try again.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement account deletion
      // This should call a backend endpoint to mark account for deletion
      toast.success("Account Deletion Requested", {
        description: "Your account will be deleted within 30 days. You can cancel this request by logging in during this period.",
      });
    } catch {
      toast.error("Deletion Failed", {
        description: "Failed to delete your account. Please contact support.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Data */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Download a copy of your chat history, prompts, and account information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Full Data Export</p>
              <p className="text-sm text-muted-foreground">
                Includes all your chat sessions, messages, prompts, and quota usage history.
                Data will be exported in JSON format.
              </p>
            </div>
          </div>

          <Separator />

          <Button 
            onClick={handleExportData} 
            disabled={isExporting}
            className="w-full sm:w-auto"
          >
            {isExporting ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Export My Data
              </>
            )}
          </Button>

          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">What&apos;s Included?</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>All chat sessions and messages</li>
              <li>User prompts and system prompts used</li>
              <li>Quota usage history</li>
              <li>Account metadata (email, creation date)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-destructive/50 p-4">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that will affect your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-destructive/10 p-3">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
          </div>

          <Separator />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers, including:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>All chat sessions and messages</li>
                    <li>User prompts and preferences</li>
                    <li>Quota history</li>
                    <li>Account information</li>
                  </ul>
                  <p className="mt-4 font-semibold">
                    You will have 30 days to cancel this request before permanent deletion.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
            <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500 mb-2">
              ⚠️ Before You Delete
            </p>
            <p className="text-sm text-muted-foreground">
              Consider exporting your data first. Once your account is deleted, you won&apos;t be able to
              recover any of your chat history or prompts.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
