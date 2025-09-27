'use client';

import { Button } from '../ui/button';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';

const questions = [
  'What are your popular dishes?',
  'Do you have any vegan options?',
  "What's the soup of the day?",
  "Can you recommend something spicy?",
  "What are the drink specials?",
];

type StarterQuestionsProps = {
  onQuestionSelect: (question: string) => void;
};

export default function StarterQuestions({ onQuestionSelect }: StarterQuestionsProps) {
  return (
    <div className="relative">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="mb-2 flex w-max items-center gap-2">
            <p className="text-sm font-medium text-muted-foreground">Try asking:</p>
          {questions.map((q) => (
            <Button
              key={q}
              variant="outline"
              size="sm"
              onClick={() => onQuestionSelect(q)}
              className="rounded-full"
            >
              {q}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

    