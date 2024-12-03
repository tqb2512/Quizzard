"use client";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { start } from "repl";
import { time } from "console";

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
    const [currentTimeLeft, setCurrentTimeLeft] = useState<number | null>(null);

    const startCountdown = (duration: number) => {
        setCurrentTimeLeft(duration);
        const interval = setInterval(() => {
            setCurrentTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    setCurrentQuestionIndex((prevIndex) => {
                        if (prevIndex < questions.length - 1) {
                            return prevIndex + 1;
                        } else {

                            return prevIndex;
                        }
                    });
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
        }
    }, [gameSession]);

    useEffect(() => {
        if (gameSession && questions.length > 0 && answers.length > 0) {
            supabase().channel(`game_session:${gameSession?.id}`)
                .on("postgres_changes", { event: "INSERT", schema: "public", table: "participants" }, (payload) => {
                    setParticipants((prev) => [...prev, payload.new]);
                })
                .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_sessions" }, (payload) => {
                    setGameSession(payload.new);
                    setIsGameStarted(payload.new.status === "started");
                })
                .on("broadcast", { event: "submit_answer" }, async (payload) => {
                    const answer = payload.payload;
                    await supabase().from("participant_answers")
                        .insert({
                            participant_id: answer.participant_id,
                            question_id: answer.question,
                            answer_content: answer.data,
                        })
                    switch (answer.type) {
                        case "multiple_choice":
                            const correctAnswer = answers.find(
                                (ans) => ans.question_id === answer.question && ans.is_correct
                            );
                            if (correctAnswer?.id === answer.data) {
                                const score = Math.round(answer.time_left / game.settings.time_limit * 100);
                                await supabase().rpc("update_participant_score", { participant_id: answer.participant_id, score_increment: score })
                            } else {

                            }
                            break;
                        case "matching":
                            if (Object.entries(answer.data).every(([key, value]) => key === value)) {
                                const score = Math.round(answer.time_left / game.settings.time_limit * 200);
                                await supabase().rpc("update_participant_score", { participant_id: answer.participant_id, score_increment: score })
                            } else {
                            }
                            break;
                        case "drag_and_drop":
                            console.log("Drag and Drop Answer", answer);
                            break;
                    }
                })
                .subscribe();
        }
    }, [gameSession, answers, questions]);

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
                const filteredAnswers = answers.filter(answer => answer.question_id === questions[currentQuestionIndex]);
                setCurrentAnswers(filteredAnswers);
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
    }, [questions, answers, currentQuestionIndex, isGameStarted]);

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
                                            startCountdown(game.settings.time_limit);
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
                                        <div className="countdown-timer">
                                            Time Left: {currentTimeLeft} seconds
                                        </div>
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
                                        startCountdown(game.settings.time_limit);
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