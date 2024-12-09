"use client";

import { useGameData } from "@/hooks/useGameData";
import { useGameLogic } from "@/hooks/useGameLogic";
import { PreGameView } from "@/components/PreGameView";
import { InGameView } from "@/components/InGameView";
import { Skeleton } from "@/components/ui/skeleton";

export default function SessionDetailPage({ params }: { params: { id: string } }) {
    const { gameSession, game, participants, questions, answers, loading } = useGameData(params.id);
    const {
        isGameStarted,
        currentQuestionIndex,
        currentQuestion,
        currentAnswers,
        currentTimeLeft,
        showingLeaderboard,
        startGame,
        nextQuestion,
        showLeaderboard
    } = useGameLogic(gameSession, questions, answers, game);

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <Skeleton className="w-full h-12" />
                <div className="grid md:grid-cols-2 gap-6">
                    <Skeleton className="w-full h-[300px]" />
                    <Skeleton className="w-full h-[300px]" />
                </div>
                <Skeleton className="w-32 h-10 ml-auto" />
            </div>
        );
    }

    if (!gameSession || !game) {
        return <div className="container mx-auto p-6">Failed to load game session.</div>;
    }

    return (
        <div className="container mx-auto p-6">
            {!isGameStarted ? (
                <PreGameView
                    game={game}
                    sessionId={params.id}
                    questions={questions}
                    participants={participants}
                    onStartGame={startGame}
                />
            ) : (
                <InGameView
                    game={game}
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={questions.length}
                    currentQuestion={currentQuestion}
                    currentAnswers={currentAnswers}
                    currentTimeLeft={currentTimeLeft}
                    timeLimit={game.settings.time_limit}
                    onNextQuestion={nextQuestion}
                    onShowLeaderboard={showLeaderboard}
                    showingLeaderboard={showingLeaderboard}
                />
            )}
        </div>
    );
}

