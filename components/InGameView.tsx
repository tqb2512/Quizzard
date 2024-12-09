import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GameHeader } from "./GameHeader";
import { Progress } from "@/components/ui/progress";

interface InGameViewProps {
    game: any;
    currentQuestionIndex: number;
    totalQuestions: number;
    currentQuestion: any;
    currentAnswers: any[];
    currentTimeLeft: number | null;
    timeLimit: number;
    onNextQuestion: () => void;
    onShowLeaderboard: () => void;
    showingLeaderboard: boolean;
}

export function InGameView({
    game,
    currentQuestionIndex,
    totalQuestions,
    currentQuestion,
    currentAnswers,
    currentTimeLeft,
    timeLimit,
    onNextQuestion,
    onShowLeaderboard,
    showingLeaderboard
}: InGameViewProps) {
    const progress = currentTimeLeft ? (currentTimeLeft / timeLimit) * 100 : 0;

    return (
        <div className="space-y-6">
            <GameHeader
                title={game?.title}
                description={`Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
            />
            <Card>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-medium">Time Left: {currentTimeLeft} seconds</span>
                            <Progress value={progress} className="w-1/2" />
                        </div>
                        <p className="text-2xl font-semibold">{currentQuestion?.question_text}</p>
                        {showingLeaderboard && <p className="text-xl font-medium">Showing Leaderboard...</p>}
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end space-x-4">
                <Button onClick={onNextQuestion} size="lg" disabled={showingLeaderboard}>
                    Next Question
                </Button>
                <Button onClick={onShowLeaderboard} variant="outline" size="lg" disabled={showingLeaderboard}>
                    Show Leaderboard
                </Button>
            </div>
        </div>
    );
}

