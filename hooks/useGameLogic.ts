import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabase/client";

export function useGameLogic(gameSession: any, questions: any[], answers: any[], game: any) {
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [currentAnswers, setCurrentAnswers] = useState<any[]>([]);
    const [currentTimeLeft, setCurrentTimeLeft] = useState<number | null>(null);
    const [showingLeaderboard, setShowingLeaderboard] = useState<boolean>(false);

    useEffect(() => {
        if (gameSession) {
            setIsGameStarted(gameSession.status === "started");
        }
    }, [gameSession]);

    useEffect(() => {
        if (isGameStarted && questions.length > 0) {
            setCurrentQuestion(questions[currentQuestionIndex]);
            const filteredAnswers = answers.filter(answer => answer.question_id === questions[currentQuestionIndex].id);
            setCurrentAnswers(filteredAnswers);

            supabase().channel(`game_session:${gameSession?.id}`)
                .send({
                    type: "broadcast",
                    event: "question_change",
                    payload: {
                        current_question_index: currentQuestionIndex,
                        question: questions[currentQuestionIndex],
                        answers: answers.filter((answer) => answer.question_id === questions[currentQuestionIndex].id)
                    }
                });
        }
    }, [isGameStarted, questions, answers, currentQuestionIndex, gameSession]);

    const startCountdown = useCallback((duration: number) => {
        setCurrentTimeLeft(duration);
        const interval = setInterval(() => {
            setCurrentTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    showLeaderboard();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const showLeaderboard = useCallback(() => {
        setShowingLeaderboard(true);
        supabase().channel(`game_session:${gameSession?.id}`)
            .send({
                type: "broadcast",
                event: "leaderboard",
                payload: {
                    isShow: true
                }
            });
        setTimeout(() => {
            setShowingLeaderboard(false);
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
                startCountdown(game.settings.time_limit);
            }
        }, 5000);
    }, [currentQuestionIndex, game, gameSession, questions, startCountdown]);

    const startGame = useCallback(async () => {
        await supabase()
            .from("game_sessions")
            .update({ status: "started", start_time: new Date() })
            .eq("id", gameSession.id);
        setIsGameStarted(true);
        startCountdown(game.settings.time_limit);
    }, [gameSession, game, startCountdown]);

    const nextQuestion = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            startCountdown(game.settings.time_limit);
        }
    }, [currentQuestionIndex, questions, game, startCountdown]);

    useEffect(() => {
        if (gameSession && questions.length > 0 && answers.length > 0) {
            const channel = supabase().channel(`game_session:${gameSession.id}`)
                .on("broadcast", { event: "submit_answer" }, async (payload) => {
                    const answer = payload.payload;
                    await supabase().from("participant_answers")
                        .insert({
                            participant_id: answer.participant_id,
                            question_id: answer.question,
                            answer_content: answer.data,
                        });
                    switch (answer.type) {
                        case "multiple_choice":
                            const correctAnswer = answers.find(
                                (ans) => ans.question_id === answer.question && ans.is_correct
                            );
                            if (correctAnswer?.id === answer.data) {
                                const score = Math.round(answer.time_left / game.settings.time_limit * 100);
                                await supabase().rpc("update_participant_score", { participant_id: answer.participant_id, score_increment: score });
                            }
                            break;
                        case "matching":
                            if (Object.entries(answer.data).every(([key, value]) => key === value)) {
                                const score = Math.round(answer.time_left / game.settings.time_limit * 200);
                                await supabase().rpc("update_participant_score", { participant_id: answer.participant_id, score_increment: score });
                            }
                            break;
                        case "drag_and_drop":
                            console.log("Drag and Drop Answer", answer);
                            break;
                    }
                })
                .subscribe();

            return () => {
                channel.unsubscribe();
            };
        }
    }, [gameSession, answers, questions, game]);

    return {
        isGameStarted,
        currentQuestionIndex,
        currentQuestion,
        currentAnswers,
        currentTimeLeft,
        showingLeaderboard,
        startGame,
        nextQuestion,
        showLeaderboard
    };
}

