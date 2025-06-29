// components/priority/PrioritySliders.tsx
'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

interface PriorityWeights {
  priorityLevel: number;
  taskFulfillment: number;
  fairness: number;
  workloadBalance: number;
  phaseEfficiency: number;
}

interface PrioritySlidersProps {
  onChange: (weights: PriorityWeights) => void;
}

export default function PrioritySliders({ onChange }: PrioritySlidersProps) {
  const [weights, setWeights] = useState<PriorityWeights>({
    priorityLevel: 5,
    taskFulfillment: 5,
    fairness: 5,
    workloadBalance: 5,
    phaseEfficiency: 5,
  });

  const handleSliderChange = (key: keyof PriorityWeights, value: number) => {
    const newWeights = { ...weights, [key]: value };
    setWeights(newWeights);
    onChange(newWeights);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Prioritization Weights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(weights).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <Label className="capitalize">
              {key.replace(/([A-Z])/g, ' $1')}: <span className="font-semibold">{value}</span>
            </Label>
            <Slider
              min={0}
              max={10}
              step={1}
              value={[value]}
              onValueChange={([v]) => handleSliderChange(key as keyof PriorityWeights, v)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
