import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw,
  Save,
  X,
  FileText,
  Globe,
  AlertCircle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '../../contexts/LanguageContext';
import {
  useAllTranslations,
  useUpdateTranslations,
  useAddTranslationKey,
  useDeleteTranslationKey,
  useImportTranslations,
  useExportTranslations,
  useSyncTranslations,
} from '../../hooks/useTranslations';
import type { TranslationGroup } from '../../services/translationService';

interface TranslationEntry {
  key: string;
  value: string;
  path: string[];
}

export const TranslationManager: React.FC = () => {
  const { t } = useTranslation();
  const { supportedLanguages, refreshTranslations } = useLanguage();
  const [selectedLocale, setSelectedLocale] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  // Queries and mutations
  const { data: allTranslations, isLoading, refetch } = useAllTranslations();
  const updateTranslations = useUpdateTranslations();
  const addTranslationKey = useAddTranslationKey();
  const deleteTranslationKey = useDeleteTranslationKey();
  const importTranslations = useImportTranslations();
  const exportTranslations = useExportTranslations();
  const syncTranslations = useSyncTranslations();

  // Flatten translations for easier editing
  const flattenTranslations = (obj: TranslationGroup, prefix = ''): TranslationEntry[] => {
    const result: TranslationEntry[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        result.push({
          key: fullKey,
          value,
          path: fullKey.split('.'),
        });
      } else if (typeof value === 'object' && value !== null) {
        result.push(...flattenTranslations(value as TranslationGroup, fullKey));
      }
    }
    
    return result;
  };

  // Get translations for selected locale
  const currentTranslations = allTranslations?.[selectedLocale] || {};
  const flatTranslations = useMemo(() => 
    flattenTranslations(currentTranslations), 
    [currentTranslations]
  );

  // Filter translations based on search term
  const filteredTranslations = useMemo(() => 
    flatTranslations.filter(entry => 
      entry.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.value.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [flatTranslations, searchTerm]
  );

  // Rebuild nested object from flat entries
  const rebuildTranslations = (entries: TranslationEntry[]): TranslationGroup => {
    const result: TranslationGroup = {};
    
    entries.forEach(entry => {
      let current = result;
      const pathParts = entry.path;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (!(part in current)) {
          current[part] = {};
        }
        current = current[part] as TranslationGroup;
      }
      
      current[pathParts[pathParts.length - 1]] = entry.value;
    });
    
    return result;
  };

  const handleSaveEdit = async () => {
    if (!editingKey) return;
    
    const updatedEntries = flatTranslations.map(entry => 
      entry.key === editingKey 
        ? { ...entry, value: editingValue }
        : entry
    );
    
    const updatedTranslations = rebuildTranslations(updatedEntries);
    
    await updateTranslations.mutateAsync({
      locale: selectedLocale,
      translations: updatedTranslations,
    });
    
    setEditingKey(null);
    setEditingValue('');
    refreshTranslations();
  };

  const handleAddKey = async () => {
    if (!newKey || !newValue) return;
    
    await addTranslationKey.mutateAsync({
      locale: selectedLocale,
      key: newKey,
      value: newValue,
    });
    
    setShowAddDialog(false);
    setNewKey('');
    setNewValue('');
    refetch();
  };

  const handleDeleteKey = async (key: string) => {
    await deleteTranslationKey.mutateAsync({
      locale: selectedLocale,
      key,
    });
    
    setShowDeleteDialog(null);
    refetch();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await importTranslations.mutateAsync({
      locale: selectedLocale,
      file,
    });
    
    refetch();
    event.target.value = '';
  };

  const handleExport = async (format: 'json' | 'csv') => {
    await exportTranslations.mutateAsync({
      locale: selectedLocale,
      format,
    });
  };

  const handleSync = async () => {
    await syncTranslations.mutateAsync();
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>{t('common.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('admin.translations.title', 'Translation Management')}
          </CardTitle>
          <CardDescription>
            {t('admin.translations.description', 'Manage translations for all supported languages')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin.translations.search', 'Search translations...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowAddDialog(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('admin.translations.addKey', 'Add Key')}
              </Button>
              <Button
                onClick={handleSync}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={syncTranslations.isPending}
              >
                <RefreshCw className={`h-4 w-4 ${syncTranslations.isPending ? 'animate-spin' : ''}`} />
                {t('admin.translations.sync', 'Sync')}
              </Button>
            </div>
          </div>

          <Tabs value={selectedLocale} onValueChange={setSelectedLocale}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <TabsList>
                {supportedLanguages
                  .filter(lang => lang.is_active)
                  .map((language) => (
                    <TabsTrigger key={language.code} value={language.code}>
                      <span className="mr-2">{language.flag}</span>
                      {language.name}
                    </TabsTrigger>
                  ))}
              </TabsList>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleExport('json')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={exportTranslations.isPending}
                >
                  <Download className="h-4 w-4" />
                  JSON
                </Button>
                <Button
                  onClick={() => handleExport('csv')}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={exportTranslations.isPending}
                >
                  <Download className="h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => document.getElementById('import-file')?.click()}
                  disabled={importTranslations.isPending}
                >
                  <Upload className="h-4 w-4" />
                  {t('admin.translations.import', 'Import')}
                </Button>
                <input
                  id="import-file"
                  type="file"
                  accept=".json,.csv"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
            </div>

            {supportedLanguages
              .filter(lang => lang.is_active)
              .map((language) => (
                <TabsContent key={language.code} value={language.code}>
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {language.flag} {language.name}
                          </CardTitle>
                          <CardDescription>
                            {filteredTranslations.length} {t('admin.translations.keys', 'keys')}
                            {language.direction === 'rtl' && (
                              <Badge variant="secondary" className="ml-2">RTL</Badge>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {filteredTranslations.length === 0 ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {searchTerm 
                              ? t('admin.translations.noResults', 'No translations match your search')
                              : t('admin.translations.noTranslations', 'No translations found for this language')
                            }
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{t('admin.translations.key', 'Key')}</TableHead>
                              <TableHead>{t('admin.translations.value', 'Value')}</TableHead>
                              <TableHead className="w-24">{t('common.actions', 'Actions')}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredTranslations.map((entry) => (
                              <TableRow key={entry.key}>
                                <TableCell className="font-mono text-sm">
                                  {entry.key}
                                </TableCell>
                                <TableCell>
                                  {editingKey === entry.key ? (
                                    <div className="flex gap-2">
                                      <Textarea
                                        value={editingValue}
                                        onChange={(e) => setEditingValue(e.target.value)}
                                        className="min-h-[60px]"
                                        dir={language.direction}
                                      />
                                      <div className="flex flex-col gap-1">
                                        <Button
                                          size="sm"
                                          onClick={handleSaveEdit}
                                          disabled={updateTranslations.isPending}
                                        >
                                          <Save className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setEditingKey(null);
                                            setEditingValue('');
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div 
                                      className="whitespace-pre-wrap"
                                      dir={language.direction}
                                    >
                                      {entry.value}
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => {
                                        setEditingKey(entry.key);
                                        setEditingValue(entry.value);
                                      }}
                                      disabled={editingKey !== null}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setShowDeleteDialog(entry.key)}
                                      disabled={editingKey !== null}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Add Translation Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('admin.translations.addNewKey', 'Add New Translation Key')}</DialogTitle>
            <DialogDescription>
              {t('admin.translations.addKeyDescription', 'Add a new translation key for')} {selectedLocale}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-key">{t('admin.translations.key', 'Key')}</Label>
              <Input
                id="new-key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g., common.newButton"
              />
            </div>
            <div>
              <Label htmlFor="new-value">{t('admin.translations.value', 'Value')}</Label>
              <Textarea
                id="new-value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={t('admin.translations.enterValue', 'Enter translation value...')}
                dir={supportedLanguages.find(l => l.code === selectedLocale)?.direction}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setNewKey('');
                setNewValue('');
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleAddKey}
              disabled={!newKey || !newValue || addTranslationKey.isPending}
            >
              {addTranslationKey.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {t('common.add', 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.translations.deleteKey', 'Delete Translation Key')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.translations.deleteConfirmation', 'Are you sure you want to delete this translation key? This action cannot be undone.')}
              <br />
              <code className="mt-2 block p-2 bg-muted rounded text-sm">
                {showDeleteDialog}
              </code>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showDeleteDialog && handleDeleteKey(showDeleteDialog)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};