import { Button } from "@/components/ui/button";
import { GameHeader } from "./GameHeader";
import { ParticipantList } from "./ParticipantList";
import { QuestionList } from "./QuestionList";

interface PreGameViewProps {
    game: any;
    sessionId: string;
    questions: any[];
    participants: any[];
    onStartGame: () => void;
}

export function PreGameView({ game, sessionId, questions, participants, onStartGame }: PreGameViewProps) {
    return (
        <div className="space-y-6">
            <GameHeader title={game?.title} description={`Session ID: ${sessionId}`} />
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-3">Questions</h3>
                    <QuestionList questions={questions} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3">Participants ({participants.length})</h3>
                    <ParticipantList participants={participants} />
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={onStartGame} size="lg">
                    Start Game
                </Button>
            </div>
        </div>
    );
}

