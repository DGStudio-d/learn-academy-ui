import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Download, 
  Upload, 
  Database, 
  FileText, 
  Settings, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  X,
  RefreshCw
} from 'lucide-react';
import { useDataExportImport } from '@/hooks/useDataExportImport';
import { ExportManager } from './export/ExportManager';
import { ImportManager } from './import/ImportManager';
import { BackupManager } from './backup/BackupManager';
import { ReportManager } from './report/ReportManager';

export const DataExportImport: React.FC = () => {
  const [activeTab, setActiveTab] = useState('export');
  const {
    activeJobs,
    exportHistory,
    importHistory,
    backups,
    reportHistory,
    isLoadingExportHistory,
    isLoadingImportHistory,
    isLoadingBackups,
    isLoadingReportHistory,
    cancelExport,
    cancelImport
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
          <p className="text-muted-foreground">
            Export, import, backup, and generate reports for your system data
          </p>
        </div>
      </div>

      {/* Active Jobs Overview */}
      {activeJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Active Jobs
            </CardTitle>
            <CardDescription>
              Currently running export, import, and report generation jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium">
                        {job.type?.replace('_', ' ').toUpperCase()} Job
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {job.id}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      {job.progress !== undefined && (
                        <div className="mt-2 w-32">
                          <Progress value={job.progress} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {job.processed_records || 0} / {job.total_records || 0}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {(job.status === 'pending' || job.status === 'processing') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (job.type?.includes('export')) {
                            cancelExport(job.id);
                          } else if (job.type?.includes('import')) {
                            cancelImport(job.id);
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup & Restore
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-6">
          <ExportManager />
        </TabsContent>

        <TabsContent value="import" className="space-y-6">
          <ImportManager />
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <BackupManager />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};