'use client';

import { useState } from 'react';
import CoRunForm from './coRunForm';
import SlotRestrictionForm from './slotRestriction';
import PrioritySliders from '@/app/components/priority/prioritySliders';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AIPromptForm from './aiPromptForm';

export default function RuleBuilder({ taskIDs, groupNames }: { taskIDs: string[]; groupNames: string[] }) {
  const [rules, setRules] = useState<any[]>([]);
  const [priorityWeights, setPriorityWeights] = useState<any>({});

  const handleAddRule = (rule: any) => {
    setRules(prev => [...prev, rule]);
  };

  const handleDeleteRule = (index: number) => {
    setRules(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportRules = () => {
    const exportData = {
      rules,
      priorities: priorityWeights
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rules.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <CardHeader>
          <CardTitle>Define Rules</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <AIPromptForm onAddRule={handleAddRule} />
          <CoRunForm taskOptions={taskIDs} onAddRule={handleAddRule} />
          <SlotRestrictionForm groupOptions={groupNames} onAddRule={handleAddRule} />   
          <PrioritySliders onChange={setPriorityWeights} />
        </CardContent>
      </div>

 

      {rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Rules & Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded">
                <code className="text-xs overflow-x-auto">{JSON.stringify(rule)}</code>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteRule(idx)}>
                  Delete
                </Button>
              </div>
            ))}
            <Button className="mt-4 w-full" onClick={handleExportRules}>
              Export Full Configuration (rules.json)
            </Button>
          </CardContent>
        </Card>
      )}
     
    </div>
  );
}
