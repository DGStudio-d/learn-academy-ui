import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Download, 
  Upload, 
  Trash2,
  AlertTriangle,
  Shield,
  HardDrive,
  Settings,
  RefreshCw,
  Calendar,
  FileArchive
} from 'lucide-react';
import { useDataExportImport } from '@/hooks/useDataExportImport';
import { BackupOptions, RestoreOptions } from '@/services/dataExportImportService';
import { formatDistanceToNow } from 'date-fns';

export const BackupManager: React.FC = () => {
  const [backupOptions, setBackupOptions] = useState<BackupOptions>({
    includeFiles: true,
    includeDatabase: true,
    includeSettings: true,
    compression: 'gzip'
  });
  
  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    restoreFiles: true,
    restoreDatabase: true,
    restoreSettings: true,
    createBackupBeforeRestore: true
  });

  const [selectedBackupId, setSelectedBackupId] = useState<string>('');
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const {
    createBackup,
    downloadBackup,
    restoreBackup,
    deleteBackup,
    backups,
    isLoadingBackups,
    isCreatingBackup
  } = useDataExportImport();

  const handleCreateBackup = () => {
    createBackup(backupOptions);
  };

  const handleRestoreBackup = () => {
    if (selectedBackupId) {
      restoreBackup({ backupId: selectedBackupId, options: restoreOptions });
      setShowRestoreConfirm(false);
      setSelectedBackupId('');
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Create Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Create System Backup
          </CardTitle>
          <CardDescription>
            Create a complete backup of your system data, files, and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Backup Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Backup Contents</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDatabase"
                    checked={backupOptions.includeDatabase}
                    onCheckedChange={(checked) =>
                      setBackupOptions(prev => ({ ...prev, includeDatabase: !!checked }))
                    }
                  />
                  <Label htmlFor="includeDatabase" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database (Users, Programs, Quizzes, etc.)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeFiles"
                    checked={backupOptions.includeFiles}
                    onCheckedChange={(checked) =>
                      setBackupOptions(prev => ({ ...prev, includeFiles: !!checked }))
                    }
                  />
                  <Label htmlFor="includeFiles" className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Files (Uploads, Media, Documents)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSettings"
                    checked={backupOptions.includeSettings}
                    onCheckedChange={(checked) =>
                      setBackupOptions(prev => ({ ...prev, includeSettings: !!checked }))
                    }
                  />
                  <Label htmlFor="includeSettings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    System Settings & Configuration
                  </Label>
                </div>
              </div>
            </div>

            {/* Compression Options */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Compression</Label>
              <Select
                value={backupOptions.compression}
                onValueChange={(value: 'none' | 'gzip' | 'zip') =>
                  setBackupOptions(prev => ({ ...prev, compression: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Compression</SelectItem>
                  <SelectItem value="gzip">GZIP (Recommended)</SelectItem>
                  <SelectItem value="zip">ZIP</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                GZIP compression provides the best balance of speed and file size reduction.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup || (!backupOptions.includeDatabase && !backupOptions.includeFiles && !backupOptions.includeSettings)}
              className="min-w-32"
            >
              {isCreatingBackup ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Create Backup
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            Available Backups
          </CardTitle>
          <CardDescription>
            Manage your system backups - download, restore, or delete
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBackups ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !backups || backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No backups found</p>
              <p className="text-sm">Create your first backup to see it here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div
                  key={backup.backup_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <FileArchive className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        Backup {backup.backup_id}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Created {formatDistanceToNow(new Date(backup.backup_id), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBackup(backup.backup_id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedBackupId(backup.backup_id);
                        setShowRestoreConfirm(true);
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteBackup(backup.backup_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation */}
      {showRestoreConfirm && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Confirm System Restore
            </CardTitle>
            <CardDescription className="text-orange-700">
              This action will restore your system from backup {selectedBackupId}. 
              This operation cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Warning:</strong> Restoring from backup will overwrite current system data. 
                Make sure you have a recent backup before proceeding.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Label className="text-base font-medium">Restore Options</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="restoreDatabase"
                    checked={restoreOptions.restoreDatabase}
                    onCheckedChange={(checked) =>
                      setRestoreOptions(prev => ({ ...prev, restoreDatabase: !!checked }))
                    }
                  />
                  <Label htmlFor="restoreDatabase" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Restore Database
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="restoreFiles"
                    checked={restoreOptions.restoreFiles}
                    onCheckedChange={(checked) =>
                      setRestoreOptions(prev => ({ ...prev, restoreFiles: !!checked }))
                    }
                  />
                  <Label htmlFor="restoreFiles" className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    Restore Files
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="restoreSettings"
                    checked={restoreOptions.restoreSettings}
                    onCheckedChange={(checked) =>
                      setRestoreOptions(prev => ({ ...prev, restoreSettings: !!checked }))
                    }
                  />
                  <Label htmlFor="restoreSettings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Restore Settings
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createBackupBeforeRestore"
                    checked={restoreOptions.createBackupBeforeRestore}
                    onCheckedChange={(checked) =>
                      setRestoreOptions(prev => ({ ...prev, createBackupBeforeRestore: !!checked }))
                    }
                  />
                  <Label htmlFor="createBackupBeforeRestore" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Create backup before restore (Recommended)
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRestoreConfirm(false);
                  setSelectedBackupId('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRestoreBackup}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Confirm Restore
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};