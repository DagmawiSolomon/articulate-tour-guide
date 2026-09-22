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

const mockData: SummaryData = {
  summary: [
    "Van Gogh painted The Starry Night in 1889 while in an asylum in Saint-Rémy-de-Provence.",
    "The cypress tree in the foreground represents death and eternal life, bridging the earth and sky.",
    "The swirling sky is believed to have been inspired by astronomical observations of the Whirlpool Galaxy."
  ],
  quiz: [
    {
      question: "What does the cypress tree in The Starry Night typically symbolize?",
      options: ["Wealth and prosperity", "Death and eternal life", "Peace and harmony", "The changing of seasons"],
      correctIndex: 1,
      explanation: "Cypress trees were traditionally associated with cemeteries and mourning, but they also symbolize eternity as they point toward the heavens."
    },
    {
      question: "Where was Van Gogh when he painted this masterpiece?",
      options: ["In Paris with his brother Theo", "At the Yellow House in Arles", "In an asylum in Saint-Rémy-de-Provence", "Back home in the Netherlands"],
      correctIndex: 2,
      explanation: "He painted it from the east-facing window of his asylum room at Saint-Paul-de-Mausole."
    }
  ]
};

export function SummaryView() {
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [selectedAnswer, setSelectedAnswer] = React.useState<number | null>(null);

  const activeQuestion = mockData.quiz[currentQuestion];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === activeQuestion.correctIndex;

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
  };

  const handleNext = () => {
    if (currentQuestion < mockData.quiz.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 sm:p-8 bg-card rounded-[20px] shadow-sm ring-1 ring-border overflow-y-auto">
      <div className="max-w-2xl mx-auto w-full flex flex-col h-full gap-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-ink-3 mb-1">
            <HugeIcon icon={CheckmarkBadge01Icon} size={18} />
            <span className="text-[13px] font-medium tracking-wide uppercase">Tour Complete</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">Your Custom Summary</h2>
          <p className="text-[15px] text-ink-2 leading-relaxed">Here are the key takeaways from your conversation with Mr. Triangle.</p>
        </div>

        {/* Summary Bullets */}
        <div className="flex flex-col gap-3">
          {mockData.summary.map((point, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl bg-field/50 border border-border">
              <div className="w-6 h-6 shrink-0 rounded-full bg-ink/5 flex items-center justify-center text-[12px] font-semibold text-ink">
                {i + 1}
              </div>
              <p className="text-[14.5px] leading-relaxed text-ink flex-1">{point}</p>
            </div>
          ))}
        </div>

        <hr className="w-full border-border my-2" />

        {/* Mini Quiz */}
        <div className="flex-1 flex flex-col gap-5 pb-8">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
              <HugeIcon icon={IdeaIcon} size={20} className="text-ink-2" />
              Quick Knowledge Check
            </h3>
            <p className="text-[14px] text-ink-2">Question {currentQuestion + 1} of {mockData.quiz.length}</p>
          </div>

          <div className="p-6 rounded-[16px] border border-border bg-field flex flex-col gap-5">
            <p className="text-[16px] font-medium text-ink leading-snug">
              {activeQuestion.question}
            </p>
            
            <div className="flex flex-col gap-2.5">
              {activeQuestion.options.map((opt, i) => {
                const isSelected = selectedAnswer === i;
                const isThisCorrect = isAnswered && i === activeQuestion.correctIndex;
                const isThisWrong = isSelected && !isCorrect;
                
                let btnStyle = "border-border bg-card hover:border-ink/20 text-ink";
                if (isThisCorrect) btnStyle = "border-green-600/30 bg-green-50/50 text-green-900";
                else if (isThisWrong) btnStyle = "border-red-600/30 bg-red-50/50 text-red-900";
                else if (isAnswered) btnStyle = "border-border bg-card/50 text-ink-3 opacity-60";

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={isAnswered}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${btnStyle}`}
                  >
                    <span className="text-[14.5px] leading-snug">{opt}</span>
                    {isThisCorrect && <HugeIcon icon={Tick01Icon} size={18} className="text-green-600 shrink-0" />}
                    {isThisWrong && <HugeIcon icon={Cancel01Icon} size={18} className="text-red-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className={`mt-2 p-4 rounded-xl text-[14px] leading-relaxed border ${isCorrect ? 'bg-green-50/50 border-green-600/20 text-green-800' : 'bg-red-50/50 border-red-600/20 text-red-800'}`}>
                <span className="font-semibold block mb-1">
                  {isCorrect ? 'Correct!' : 'Not quite!'}
                </span>
                {activeQuestion.explanation}
              </div>
            )}
          </div>

          {isAnswered && currentQuestion < mockData.quiz.length - 1 && (
            <button
              onClick={handleNext}
              className="self-end px-5 py-2.5 rounded-full bg-ink text-white text-[13.5px] font-medium transition-transform active:scale-95"
            >
              Next Question
            </button>
          )}
          {isAnswered && currentQuestion === mockData.quiz.length - 1 && (
            <p className="text-center text-[14px] text-ink-3 font-medium mt-2">
              Quiz completed! You can end the tour now.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
