"use client";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SessionDetailPage({ params }: { params: { id: string } }) {
    const [gameSession, setGameSession] = useState<any>();
    const [game, setGame] = useState<any>();
    const [participants, setParticipants] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any[]>([]);
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

    const [currentQuestion, setCurrentQuestion] = useState<any>();
    const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);

    useEffect(() => {
        const fetchGameSession = async () => {
            const { data, error } = await supabase()
                .from("game_sessions")
                .select("*")
                .eq("id", params.id)
                .single();
            if (data) {
                setGameSession(data);
                setIsGameStarted(data.status === "started");
            }
        };
        fetchGameSession();
    }, [params.id]);

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

        const fetchQuestions = async () => {
            const { data, error } = await supabase()
                .from("questions")
                .select("*")
                .eq("game_id", gameSession?.game_id);
            if (data) {
                setQuestions(data);
            }
        };

        const fetchParticipants = async () => {
            const { data, error } = await supabase()
                .from("participants")
                .select("*")
                .eq("game_session_id", gameSession?.id);
            if (data) {
                setParticipants(data);
            }
        };

        if (gameSession) {
            fetchGame();
            fetchQuestions();
            fetchParticipants();
            supabase().channel(`game_session:${gameSession?.id}`)
                .on("postgres_changes", { event: "INSERT", schema: "public", table: "participants" }, (payload) => {
                    setParticipants((prev) => [...prev, payload.new]);
                })
                .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_sessions" }, (payload) => {
                    setGameSession(payload.new);
                    setIsGameStarted(payload.new.status === "started");
                })
                .subscribe();
        }
    }, [gameSession]);

    useEffect(() => {
        const fetchAnswers = async () => {
            const { data, error } = await supabase()
                .from("answers")
                .select("*")
                .in("question_id", questions.map((question) => question.id));
            if (data) {
                setAnswers(data);
            }
        };

        if (questions) {
            fetchAnswers();
        }
    }, [questions]);

    useEffect(() => {
        if (isGameStarted) {
            if (questions.length > 0) {
                setCurrentQuestion(questions[currentQuestionIndex]);
                setCurrentAnswers(answers.filter((answer) => answer.question_id === questions[currentQuestionIndex].id));
            }
            supabase().channel(`game_session:${gameSession?.id}`)
                .send({
                    type: "broadcast",
                    event: "question_change",
                    payload: {
                        current_question_index: currentQuestionIndex,
                        question: questions[currentQuestionIndex],
                        answers: answers.filter((answer) => answer.question_id === questions[currentQuestionIndex].id)
                    }
                })

        }
    }, [questions, currentQuestionIndex, isGameStarted]);

    if (!isGameStarted)
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{game?.title}</CardTitle>
                        <CardDescription>
                            Session ID: {params.id}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Questions</h3>
                                <div className="grid gap-2">
                                    {questions.map((question, index) => (
                                        <Card key={question.id}>
                                            <CardContent className="p-4">
                                                <p className="font-medium">
                                                    {index + 1}. {question.question_text}
                                                </p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3">Participants ({participants.length})</h3>
                                <div className="flex flex-wrap gap-2">
                                    {participants.map((participant) => (
                                        <Badge key={participant.id} variant="secondary">
                                            {participant.nickname}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                {gameSession?.status === "pending" && (
                                    <Button
                                        onClick={async () => {
                                            await supabase()
                                                .from("game_sessions")
                                                .update({ status: "started", start_time: new Date() })
                                                .eq("id", params.id);
                                        }}
                                    >
                                        Start Game
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    else
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{game?.title}</CardTitle>
                        <CardDescription>
                            Question {currentQuestionIndex + 1} of {questions.length}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <div>
                                <Card>
                                    <CardContent className="p-6">
                                        <p className="font-medium">{currentQuestion?.question_text}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex justify-end">
                            <Button
                                onClick={() => {
                                    if (currentQuestionIndex < questions.length - 1) {
                                        setCurrentQuestionIndex((prev) => prev + 1);
                                    }
                                }}
                            >
                                Next Question
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        )
}