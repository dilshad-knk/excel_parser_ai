// app/page.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import RuleBuilder from '@/app/components/rules/RuleBuilder';

import { FileUploadCard } from '@/app/components/FileUploader';
import { validateAll } from '@/app/lib/validator'; 
import { ValidationError } from '@/app/lib/types/validation';
import Link from 'next/link';
import DataInsightBox from './components/dataInsights';

export default function HomePage() {
  const [clientData, setClientData] = useState<any[]>([]);
  const [workerData, setWorkerData] = useState<any[]>([]);
  const [taskData, setTaskData] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState<string>('clients');

  const [editingCell, setEditingCell] = useState<{
    entity: 'clients' | 'workers' | 'tasks' | null;
    rowIndex: number | null;
    column: string | null;
  }>({ entity: null, rowIndex: null, column: null });

  const taskIDs = taskData.map((t) => String(t.TaskID).trim()).filter(Boolean);

  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const runValidations = useCallback(() => {
    // Calling the centralized validation function
    const errors = validateAll({ clients: clientData, workers: workerData, tasks: taskData });
    setValidationErrors(errors);
  }, [clientData, workerData, taskData]);

  // Run validations whenever data changes
  useEffect(() => {
    runValidations();
  }, [clientData, workerData, taskData, runValidations]); 

  const handleFileUpload = (entity: 'clients' | 'workers' | 'tasks', data: any[]) => {
    switch (entity) {
      case 'clients':
        setClientData(data);
        setActiveTab('clients');
        break;
      case 'workers':
        setWorkerData(data);
        setActiveTab('workers');
        break;
      case 'tasks':
        setTaskData(data);
        setActiveTab('tasks');
        break;
    }
  };

  const handleCellChange = (
    entity: 'clients' | 'workers' | 'tasks',
    rowIndex: number,
    column: string,
    newValue: string
  ) => {
    const updateData = (prevData: any[]) => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [column]: newValue,
      };
      return newData;
    };

    switch (entity) {
      case 'clients':
        setClientData(updateData);
        break;
      case 'workers':
        setWorkerData(updateData);
        break;
      case 'tasks':
        setTaskData(updateData);
        break;
    }
  };

  const hasError = (entity: 'clients' | 'workers' | 'tasks', rowIndex: number, column: string) => {
    return validationErrors.some(
      error => error.entity === entity && error.row === rowIndex && error.column === column
    );
  };

  const getCellErrors = (entity: 'clients' | 'workers' | 'tasks', rowIndex: number, column: string) => {
    return validationErrors
      .filter(error => error.entity === entity && error.row === rowIndex && error.column === column)
      .map(error => error.message);
  };

  const getHeaders = (data: any[]): string[] => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
  };

  const renderDataTable = (data: any[], entityName: 'clients' | 'workers' | 'tasks') => {
    if (data.length === 0) {
      return <p className="text-center text-gray-500 py-8">Upload {entityName} data to see it here.</p>;
    }

    const headers = getHeaders(data);

    return (
      
      <div className="overflow-auto w-full max-h-[900px] border rounded-md">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow>
              {headers.map((header) => (
                <TableHead key={header} className="whitespace-nowrap bg-gray-50">
                  {header}
                  {validationErrors.some(e => e.row === -1 && e.entity === entityName && e.column === header) && (
                    <span title={getCellErrors(entityName, -1, header).join(', ')} className="ml-1 text-red-500 text-xs">&#9888;</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={`${entityName}-row-${rowIndex}`}>
                {headers.map((column) => (
                  <TableCell
                    key={`${entityName}-cell-${rowIndex}-${column}`}
                   
                    className={`relative whitespace-nowrap px-4 py-2 min-w-[150px] ${
                      hasError(entityName, rowIndex, column) ? 'bg-red-100 border-red-500 border' : ''
                    }`}
                    onClick={() =>
                      setEditingCell({ entity: entityName, rowIndex, column })
                    }
                  >
                    {editingCell.entity === entityName &&
                    editingCell.rowIndex === rowIndex &&
                    editingCell.column === column ? (
                      <Input
                        type="text"
                        value={String(row[column] || '')}
                        onChange={(e) => handleCellChange(entityName, rowIndex, column, e.target.value)}
                        onBlur={() => setEditingCell({ entity: null, rowIndex: null, column: null })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setEditingCell({ entity: null, rowIndex: null, column: null });
                          }
                        }}
                        className="p-1 h-auto w-full text-sm border-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                    ) : (
                      <div
                        title={getCellErrors(entityName, rowIndex, column).join(', ') || String(row[column])}
                        className="w-full h-full"
                      >
                        {typeof row[column] === 'object' && row[column] !== null
                          ? JSON.stringify(row[column])
                          : String(row[column])}
                      </div>
                    )}
                    {hasError(entityName, rowIndex, column) && (
                      <span
                        className="absolute top-1 right-1 text-red-500 text-xs"
                        title={getCellErrors(entityName, rowIndex, column).join('\n')}
                      >
                        &#9888;
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50  flex flex-col items-center p-8">
      <header className="mb-8 text-center w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Data Alchemist
        </h1>
        <p className="text-xl text-gray-600 mt-2">
          Forge Your Own AI Resource-Allocation Configurator
        </p>
        <p className="text-lg text-gray-500 mt-1">
          Upload and manage your client, worker, and task data.
        </p>
      </header>

      <main className="flex flex-col lg:flex-row w-full max-w-7xl gap-8">
     
        <section className="flex-1 flex flex-col gap-8 min-w-0">
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Ingestion</h2>
            <p className="text-gray-600 mb-6">Upload your CSV or XLSX files for Clients, Workers, and Tasks below.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FileUploadCard
                entityName="Clients"
                onFileUpload={(data) => handleFileUpload('clients', data)}
              />
              <FileUploadCard
                entityName="Workers"
                onFileUpload={(data) => handleFileUpload('workers', data)}
              />
              <FileUploadCard
                entityName="Tasks"
                onFileUpload={(data) => handleFileUpload('tasks', data)}
              />
            </div>
          </div>

          <Separator />

          <div className="bg-white p-6 rounded-lg shadow-md border flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Parsed Data Preview</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-yellow-600">
                <TabsTrigger value="clients" disabled={clientData.length === 0}>
                  Clients ({clientData.length})
                </TabsTrigger>
                <TabsTrigger value="workers" disabled={workerData.length === 0}>
                  Workers ({workerData.length})
                </TabsTrigger>
                <TabsTrigger value="tasks" disabled={taskData.length === 0}>
                  Tasks ({taskData.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="clients" className="mt-4">
                {renderDataTable(clientData, 'clients')}
              </TabsContent>

              <TabsContent value="workers" className="mt-4">
                {renderDataTable(workerData, 'workers')}
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                {renderDataTable(taskData, 'tasks')}
              </TabsContent>
            </Tabs>
            <DataInsightBox clients={clientData} workers={workerData} tasks={taskData} />

          </div>
        </section>

        <aside className="w-full lg:w-96 flex flex-col gap-8">
         <div className="bg-white p-6 rounded-lg shadow-md border max-h-[400px] overflow-y-auto">
  <h2 className="text-2xl font-semibold text-gray-800 mb-4">Validation Summary</h2>

  {validationErrors.length > 0 ? (
    <ul className="space-y-3 text-sm text-gray-800">
      {validationErrors.map((err, index) => (
        <li
          key={index}
          className={`flex items-start gap-2 rounded-md px-3 py-2 border-l-4 ${
            err.type === 'error'
              ? 'border-red-500 bg-red-50'
              : 'border-yellow-500 bg-yellow-50'
          }`}
        >
          <span className="mt-1">
            {err.type === 'error' ? '❌' : '⚠️'}
          </span>
          <div>
            <div className="font-medium">
              <span className="uppercase text-xs tracking-wider bg-gray-200 px-2 py-0.5 rounded mr-2">
                {err.entity}
              </span>
              Row: <strong>{err.row === -1 ? 'Header' : err.row + 1}</strong>, Col: <strong>{err.column}</strong>
            </div>
            <p className="text-sm text-gray-700 mt-1">{err.message}</p>
          </div>
        </li>
      ))}
    </ul>
  ) : (
    <div className="text-green-600 font-medium flex items-center gap-2">
       No errors found. Data looks good!
    </div>
  )}
</div>

          <div className="bg-white p-6 rounded-lg shadow-md border flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Rule Input & Prioritization</h2>
           <RuleBuilder taskIDs={taskIDs} groupNames={[]} />
          </div>
        </aside>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <Link href="/about">
         <button>About</button>
        </Link>
       
        <p>&copy; {new Date().getFullYear()} Data Alchemist. All rights reserved.</p>
      </footer>
    </div>
  );
}