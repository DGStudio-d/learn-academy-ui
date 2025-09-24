import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  History,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useDataExportImport } from "@/hooks/useDataExportImport";
import { formatDistanceToNow } from "date-fns";

export const ImportHistory: React.FC = () => {
  const { importHistory, isLoadingImportHistory, cancelImport } =
    useDataExportImport();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (isLoadingImportHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Import History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Import History
        </CardTitle>
        <CardDescription>
          View status and results of previous import jobs
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!importHistory || importHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No import history found</p>
            <p className="text-sm">Start your first import to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {importHistory.map((job) => (
              <div
                key={job.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {getStatusIcon(job.status)}
                    <div className="flex-1">
                      <div className="font-medium">
                        {job.type?.replace("_", " ").toUpperCase()} Import
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {job.id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(job.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>

                      {job.status === "processing" && (
                        <div className="mt-2 w-32">
                          <Progress value={job.progress} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {job.processed_records} / {job.total_records}
                          </div>
                        </div>
                      )}
                    </div>

                    {(job.status === "pending" ||
                      job.status === "processing") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelImport(job.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Results Summary */}
                {job.status === "completed" && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Success: {job.success_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span>Errors: {job.error_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Warnings: {job.warnings?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-blue-500" />
                      <span>Total: {job.total_records}</span>
                    </div>
                  </div>
                )}

                {/* Error Details */}
                {job.errors && job.errors.length > 0 && (
                  <div className="mt-4">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700">
                        View Errors ({job.errors.length})
                      </summary>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        {job.errors.slice(0, 10).map((error, index) => (
                          <div
                            key={index}
                            className="text-xs p-2 bg-red-50 border border-red-200 rounded"
                          >
                            <div className="font-medium">
                              Row {error.row}: {error.field}
                            </div>
                            <div className="text-red-600">{error.message}</div>
                          </div>
                        ))}
                        {job.errors.length > 10 && (
                          <div className="text-xs text-muted-foreground">
                            ... and {job.errors.length - 10} more errors
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}

                {/* Warning Details */}
                {job.warnings && job.warnings.length > 0 && (
                  <div className="mt-4">
                    <details className="group">
                      <summary className="cursor-pointer text-sm font-medium text-yellow-600 hover:text-yellow-700">
                        View Warnings ({job.warnings.length})
                      </summary>
                      <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                        {job.warnings.slice(0, 10).map((warning, index) => (
                          <div
                            key={index}
                            className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded"
                          >
                            <div className="font-medium">Row {warning.row}</div>
                            <div className="text-yellow-600">
                              {warning.message}
                            </div>
                          </div>
                        ))}
                        {job.warnings.length > 10 && (
                          <div className="text-xs text-muted-foreground">
                            ... and {job.warnings.length - 10} more warnings
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
