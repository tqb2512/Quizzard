"use client";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import MatchingForm from "@/components/Questions/Matching";
import DragAndDropForm from "@/components/Questions/DragAndDrop";
import MultipleChoiceForm from "@/components/Questions/MultipleChoice";
import { v4 as uuidv4 } from 'uuid';

export default function PlayPage({ params }: { params: { session_id: string } }) {
    const [gameSession, setGameSession] = useState<any>();
    const [game, setGame] = useState<any>();

    const [nickname, setNickname] = useState<string>('');
    const [participantId, setParticipantId] = useState<string>(uuidv4());
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
    const [isJoined, setIsJoined] = useState<boolean>(false);

    const [question, setQuestion] = useState<any>();
    const [answers, setAnswers] = useState<any[]>([]);
    const [currentTimeLeft, setCurrentTimeLeft] = useState<number | null>(null);
    const [isRunOut, setIsRunOut] = useState<boolean>(false);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startCountdown = (duration: number) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setCurrentTimeLeft(duration);
        setIsRunOut(false);
        intervalRef.current = setInterval(() => {
            setCurrentTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(intervalRef.current!);
                    setIsRunOut(true);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        const fetchGameSession = async () => {
            const { data, error } = await supabase()
                .from("game_sessions")
                .select("*")
                .eq("id", params.session_id)
                .single();
            if (data) {
                setGameSession(data);
                setIsGameStarted(data.status === "started");
            }
        };

        fetchGameSession();
    }, []);

    useEffect(() => {
        const fetchGame = async () => {
            const { data, error } = await supabase()
                .from("games")
                .select("*")
                .eq("id", gameSession?.game_id)
                .single();
            if (data) {
                setGame(data);
            }
        };

        if (gameSession) {
            fetchGame();
        }
    }, [gameSession]);


    const renderQuestion = () => {
        switch (question?.question_type) {
            case "matching":
                return (
                    <div>
                        <MatchingForm question={question} answers={answers} participantId={participantId} gameSessionId={gameSession.id} />
                    </div>
                )
            case "drag_and_drop":
                return (
                    <div>
                        <DragAndDropForm />
                    </div>
                )
            case "multiple_choice":
                return (
                    <div>
                        <MultipleChoiceForm question={question} answers={answers} participantId={participantId} gameSessionId={gameSession.id} />
                    </div>
                )
            default:
                return (
                    <div>
                        <h1>Question type not supported</h1>
                    </div>
                )
        }
    }

    const renderJoinGame = () => {
        return (
            <div className="space-y-4">
                <Input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your nickname"
                    className="w-full"
                />
                {!isGameStarted ? (
                    <Button
                        className="w-full"
                        onClick={async () => {
                            await supabase().from("participants").insert({
                                id: participantId,
                                game_session_id: gameSession.id,
                                nickname: nickname,
                            });
                            supabase().channel(`game_session:${gameSession.id}`)
                                .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_sessions" }, (payload) => {
                                    setGameSession(payload.new);
                                    setIsGameStarted(payload.new.status === "started");
                                })
                                .on("broadcast", { event: "question_change" }, (payload) => {
                                    setQuestion(payload.payload.question);
                                    setAnswers(payload.payload.answers);
                                    startCountdown(game.settings.time_limit);
                                })
                                .subscribe();
                            setIsJoined(true);
                        }}
                    >
                        Join Game
                    </Button>
                ) : (
                    <Button className="w-full" disabled>
                        Game has already started
                    </Button>
                )}
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <h1>Time left: {currentTimeLeft}</h1>
            {!isJoined ? renderJoinGame() : isGameStarted ? renderQuestion() : <h1>Waiting for game to start</h1>}
        </div>
    )
}