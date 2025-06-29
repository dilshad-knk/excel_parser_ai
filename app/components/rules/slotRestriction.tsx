
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SlotRestrictionFormProps {
  groupOptions: string[];
  onAddRule: (rule: { type: 'slotRestriction'; group: string; minCommonSlots: number }) => void;
}

export default function SlotRestrictionForm({ groupOptions, onAddRule }: SlotRestrictionFormProps) {
  const [group, setGroup] = useState('');
  const [minSlots, setMinSlots] = useState('');

  const handleAdd = () => {
    const parsedSlots = parseInt(minSlots);
    if (group && !isNaN(parsedSlots) && parsedSlots >= 0) {
      onAddRule({ type: 'slotRestriction', group, minCommonSlots: parsedSlots });
      setGroup('');
      setMinSlots('');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Slot Restriction Rule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="group">ClientGroup or WorkerGroup</Label>
          <Input
            id="group"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            placeholder="e.g. Sales, HighPriority"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="minSlots">Minimum Common Slots</Label>
          <Input
            id="minSlots"
            type="number"
            min={0}
            value={minSlots}
            onChange={(e) => setMinSlots(e.target.value)}
            placeholder="e.g. 2"
          />
        </div>
        <Button onClick={handleAdd} disabled={!group || !minSlots}>Add Slot Restriction Rule</Button>
      </CardContent>
    </Card>
  );
}
