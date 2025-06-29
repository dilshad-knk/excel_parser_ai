
'use client';

import { useState, useTransition } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { generateInsightFromData } from '@/app/lib/ai/ai-insights';

interface DataInsightBoxProps {
  clients: any[];
  workers: any[];
  tasks: any[];
}

export default function DataInsightBox({ clients, workers, tasks }: DataInsightBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAsk = () => {
    setError(null);
    setResponse('');

    const allEmpty = !clients.length && !workers.length && !tasks.length;
    if (allEmpty) {
      setError('No data uploaded to analyze.');
      return;
    }

    startTransition(async () => {
      try {
        const insight = await generateInsightFromData(prompt, {
          clients,
          workers,
          tasks,
        });
        setResponse(insight);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      }
    });
  };

  return (
    <div className="mt-8 border rounded-md bg-white p-6 space-y-4 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-800">Ask AI About Your Data</h2>
      <div className="flex gap-2">
        <Input
          placeholder="e.g. Which workers are overloaded this phase?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isPending}
        />
        <Button onClick={handleAsk} disabled={!prompt || isPending}>
          {isPending ? 'Asking...' : 'Ask AI'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {response && (
        <Textarea
          className="text-sm text-gray-800 h-48 bg-gray-50"
          readOnly
          value={response}
        />
      )}
    </div>
  );
}
