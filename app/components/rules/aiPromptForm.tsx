// components/rules/AIPromptForm.tsx
'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateRuleFromPrompt } from '@/app/lib/ai/gemini';

interface AIPromptFormProps {
  onAddRule: (rule: any) => void;
}

export default function AIPromptForm({ onAddRule }: AIPromptFormProps) {
  const [prompt, setPrompt] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      try {
        const rule = await generateRuleFromPrompt(prompt);
        onAddRule(rule);
        setPrompt('');
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Rule from AI</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          type="text"
          placeholder="e.g. Make T1 and T3 always co-run"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isPending}
        />
        <Button onClick={handleGenerate} disabled={!prompt || isPending}>
          {isPending ? 'Thinking...' : 'Generate Rule'}
        </Button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}
