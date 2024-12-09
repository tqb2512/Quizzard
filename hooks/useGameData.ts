import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase/client";

export function useGameData(sessionId: string) {
    const [gameSession, setGameSession] = useState<any>(null);
    const [game, setGame] = useState<any>(null);
    const [participants, setParticipants] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [answers, setAnswers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const sessionData = await supabase().from("game_sessions").select("*").eq("id", sessionId).single();
            const [gameData, questionsData, participantsData] = await Promise.all([
                supabase().from("games").select("*").eq("id", sessionData.data?.game_id).single(),
                supabase().from("questions").select("*").eq("game_id", sessionData.data?.game_id),
                supabase().from("participants").select("*").eq("game_session_id", sessionId)
            ]);

            if (sessionData.data) setGameSession(sessionData.data);
            if (gameData.data) setGame(gameData.data);
            if (questionsData.data) setQuestions(questionsData.data);
            if (participantsData.data) setParticipants(participantsData.data);

            const answersData = await supabase()
                .from("answers")
                .select("*")
                .in("question_id", questionsData.data?.map((q: any) => q.id) || []);

            if (answersData.data) setAnswers(answersData.data);

            setLoading(false);
        };

        fetchData();

        return () => {
            supabase().channel(`game_session:${sessionId}:data`)
                .on("postgres_changes", { event: "INSERT", schema: "public", table: "participants" }, (payload) => {
                    setParticipants((prev) => [...prev, payload.new]);
                })
                .on("postgres_changes", { event: "UPDATE", schema: "public", table: "game_sessions" }, (payload) => {
                    setGameSession(payload.new);
                })
                .subscribe();
        };

    }, [sessionId]);

    return { gameSession, setGameSession, game, participants, setParticipants, questions, answers, loading };
}
