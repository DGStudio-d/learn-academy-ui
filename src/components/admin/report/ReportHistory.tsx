import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  FileText, 
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { useDataExportImport } from '@/hooks/useDataExportImport';
import { formatDistanceToNow } from 'date-fns';

export const ReportHistory: React.FC = () => {
  const {
    reportHistory,
    isLoadingReportHistory,
    downloadReport
  } = useDataExportImport();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoadingReportHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Report History
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
          Report History
        </CardTitle>
        <CardDescription>
          View and download previously generated reports
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!reportHistory || reportHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No report history found</p>
            <p className="text-sm">Generate your first report to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reportHistory.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(report.status)}
                  <div>
                    <div className="font-medium">
                      {report.type?.replace('_', ' ').toUpperCase()} Report
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {report.id}
                    </div>
                    {report.filename && (
                      <div className="text-sm text-muted-foreground">
                        File: {report.filename}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge className={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                    </div>
                    {report.file_size && (
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(report.file_size)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {report.status === 'completed' && report.download_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadReport(report.id)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    
                    {report.expires_at && new Date(report.expires_at) > new Date() && (
                      <div className="text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        Expires {formatDistanceToNow(new Date(report.expires_at), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {report.status === 'failed' && report.error_message && (
                  <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    Error: {report.error_message}
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