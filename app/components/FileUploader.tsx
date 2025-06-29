'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface FileUploadCardProps {
  entityName: string;
  onFileUpload: (data: any[], fileName: string) => void;
}

export function FileUploadCard({ entityName, onFileUpload }: FileUploadCardProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  const parseFile = (file: File) => {
    setFileName(file.name);
    setError(null);
    setIsParsing(true);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      let parsedData: any[] = [];

      try {
        if (!data) {
          throw new Error('File content is empty.');
        }

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          let rawData = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
            raw: false,
          });

          parsedData = rawData
            .map((row: any) => {
              const cleaned: Record<string, any> = {};
              for (const key in row) {
                if (!key.startsWith("__EMPTY")) {
                  cleaned[key.trim()] = row[key];
                }
              }
              return cleaned;
            })
            .filter((row) =>
              Object.values(row).some(
                (val) => val !== "" && val !== null && val !== undefined
              )
            );

        } else if (file.name.endsWith('.csv')) {
          const workbook = XLSX.read(data, { type: 'string' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          let rawData = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
            raw: false,
          });

          parsedData = rawData
            .map((row: any) => {
              const cleaned: Record<string, any> = {};
              for (const key in row) {
                if (!key.startsWith("__EMPTY")) {
                  cleaned[key.trim()] = row[key];
                }
              }
              return cleaned;
            })
            .filter((row) =>
              Object.values(row).some(
                (val) => val !== "" && val !== null && val !== undefined
              )
            );

        } else {
          throw new Error('Unsupported file type. Please upload a .csv or .xlsx file.');
        }

        if (
          !parsedData ||
          parsedData.length === 0 ||
          typeof parsedData[0] !== 'object'
        ) {
          throw new Error(
            'File parsed successfully, but no valid data or headers were found. Ensure your file is not empty or has correct headers.'
          );
        }

        onFileUpload(parsedData, file.name);
      } catch (e: any) {
        setError(`Error parsing ${file.name}: ${e.message}`);
        console.error("File parsing error:", e);
      } finally {
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setError(`Failed to read file: ${reader.error?.message}`);
      setIsParsing(false);
    };

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.readAsArrayBuffer(file);
    } else if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    }
  };

  return (
    <Card className="w-full max-w-[320px] mx-auto">
      <CardHeader>
        <CardTitle>{entityName} Data</CardTitle>
        <CardDescription>
          Upload your {entityName} CSV or XLSX file.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Label htmlFor={`file-upload-${entityName}`} className="sr-only">
          Upload {entityName} File
        </Label>
        <Input
          id={`file-upload-${entityName}`}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              parseFile(e.target.files[0]);
            }
          }}
          className="mt-2"
          disabled={isParsing}
        />

        {fileName && !isParsing && (
          <p className="text-gray-700 text-sm mt-2 text-center">
            Loaded: <span className="font-medium">{fileName}</span>
          </p>
        )}
        {isParsing && (
          <p className="text-gray-500 text-sm mt-2 text-center animate-pulse">
            Parsing...
          </p>
        )}
        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
