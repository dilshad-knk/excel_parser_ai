// components/rules/CoRunForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiSelect } from '@/app/components/ui/MultiSelect';

interface CoRunFormProps {
  taskOptions: string[];
  onAddRule: (rule: { type: 'coRun'; tasks: string[] }) => void;
}

export default function CoRunForm({ taskOptions, onAddRule }: CoRunFormProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  const handleAddRule = () => {
   
    if (selectedTasks.length >= 2) {
      onAddRule({ type: 'coRun', tasks: selectedTasks });
      setSelectedTasks([]);
    }
  };

  return (
    <Card className="w-full">
     
      <CardHeader>
        <CardTitle>Co-run Rule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select 2 or more TaskIDs to co-run:</Label>
          <MultiSelect
            options={taskOptions}
            selected={selectedTasks}
            onChange={setSelectedTasks}
            placeholder="Choose tasks..."
          />
        </div>
      
        <Button onClick={handleAddRule} disabled={selectedTasks.length < 2}>
          Add Co-run Rule
        </Button>
      </CardContent>
    </Card>
  );
}