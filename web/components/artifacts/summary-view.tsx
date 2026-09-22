"use client";

import * as React from "react";
import { HugeIcon } from "@/components/ui/hugeicon";
import { CheckmarkBadge01Icon, Cancel01Icon, IdeaIcon, Tick01Icon } from "@hugeicons/core-free-icons";

interface SummaryData {
  summary: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface SummaryViewProps {
  data: SummaryData | null;
}

export function SummaryView({ data }: SummaryViewProps) {
  // -1 = Summary view
  // 0, 1, 2 = Quiz questions
  // 3 = Done
  const [step, setStep] = React.useState(-1);
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);

  // If data is null, it's either loading or failed. 
  // (The Skeleton covers the loading state, but if we render this without data, handle it safely)
  if (!data) return null;

  const isSummary = step === -1;
  const isDone = step >= data.quiz.length;
  
  const activeQuestion = !isSummary && !isDone ? data.quiz[step] : null;
  const isAnswered = selectedAnswer !== null;
  const isCorrect = activeQuestion ? selectedAnswer === activeQuestion.correctIndex : false;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    setStep(s => s + 1);
    setSelectedAnswer(null);
  };

  if (isSummary) {
    return (
      <div className="w-full h-full flex flex-col p-4 sm:p-6 bg-card rounded-[20px] overflow-hidden">
        <div className="max-w-2xl mx-auto w-full flex flex-col justify-center h-full">
          <div className="flex flex-col gap-1 mb-4 text-center sm:text-left">
            <div className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-ink-3 mb-0.5">
              <HugeIcon icon={CheckmarkBadge01Icon} size={16} />
              <span className="text-[12px] font-medium tracking-wide uppercase">Tour Complete</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">Your Custom Summary</h2>
            <p className="text-[14.5px] text-ink-2 leading-relaxed">Here are the key takeaways from your conversation with Mr. Triangle.</p>
          </div>

          <div className="flex flex-col gap-2.5 mb-6">
            {data.summary.map((point, i) => (
              <div key={i} className="flex gap-3 p-3.5 rounded-xl bg-field/80 border border-border">
                <div className="w-6 h-6 shrink-0 rounded-full bg-ink/5 flex items-center justify-center text-[12.5px] font-semibold text-ink">
                  {i + 1}
                </div>
                <p className="text-[14px] leading-relaxed text-ink flex-1">{point}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 self-center sm:self-start">
            <button
              onClick={handleNext}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-ink text-white text-[14.5px] font-medium transition-transform active:scale-95"
            >
              <HugeIcon icon={IdeaIcon} size={18} />
              Start Quick Quiz
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-card hover:bg-muted text-ink text-[14.5px] font-medium transition-all active:scale-95 border border-border"
            >
              Skip Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="w-full h-full flex flex-col p-6 sm:p-8 bg-card rounded-[20px] overflow-hidden items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-6 border border-green-100">
          <HugeIcon icon={CheckmarkBadge01Icon} size={32} />
        </div>
        <h2 className="text-3xl font-semibold text-ink tracking-tight mb-3">Quiz Complete!</h2>
        <p className="text-[16px] text-ink-2 leading-relaxed mb-8 max-w-sm">
          Great job. You can now close this summary or return home to start a new tour.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 rounded-full bg-ink text-white text-[14.5px] font-medium transition-transform active:scale-95"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // Quiz View
  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 bg-card rounded-[20px] overflow-y-auto overflow-x-hidden">
      <div className="max-w-xl mx-auto w-full flex flex-col justify-start my-auto py-2">
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
              <HugeIcon icon={IdeaIcon} size={20} className="text-ink-2" />
              Knowledge Check
            </h3>
            <p className="text-[12px] font-medium text-ink-3 tracking-wide uppercase">Question {step + 1} of {data.quiz.length}</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-[16px] border border-border bg-field flex flex-col gap-3 shadow-sm">
          <p className="text-[14.5px] font-medium text-ink leading-snug">
            {activeQuestion?.question}
          </p>
          
          <div className="flex flex-col gap-2">
            {activeQuestion?.options.map((opt, i) => {
              const isSelected = selectedAnswer === i;
              const isThisCorrect = isAnswered && i === activeQuestion.correctIndex;
              const isThisWrong = isSelected && !isCorrect;
              
              let btnStyle = "border-border bg-card hover:border-ink/30 hover:bg-card/80 text-ink";
              if (isThisCorrect) btnStyle = "border-green-600/30 bg-green-50 text-green-900";
              else if (isThisWrong) btnStyle = "border-red-600/30 bg-red-50 text-red-900";
              else if (isAnswered) btnStyle = "border-border bg-card/40 text-ink-3 opacity-50";

              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={isAnswered}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-between gap-2 ${btnStyle}`}
                >
                  <span className="text-[14px] leading-snug">{opt}</span>
                  {isThisCorrect && <HugeIcon icon={Tick01Icon} size={18} className="text-green-600 shrink-0" />}
                  {isThisWrong && <HugeIcon icon={Cancel01Icon} size={18} className="text-red-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className={`mt-0.5 p-3 rounded-xl text-[13px] leading-relaxed border ${isCorrect ? 'bg-green-50/50 border-green-600/20 text-green-800' : 'bg-red-50/50 border-red-600/20 text-red-800'} animate-in fade-in slide-in-from-top-2 duration-300`}>
              <span className="font-semibold block mb-0.5">
                {isCorrect ? 'Correct!' : 'Not quite!'}
              </span>
              {activeQuestion?.explanation}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end h-[36px]">
          {isAnswered && (
            <button
              onClick={handleNext}
              className="px-7 py-2.5 rounded-full bg-ink text-white text-[14.5px] font-medium transition-transform active:scale-95 animate-in fade-in slide-in-from-bottom-2"
            >
              {step < data.quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
