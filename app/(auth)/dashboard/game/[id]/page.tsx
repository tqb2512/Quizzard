"use client";
import GameCreator, { Game, Question } from "@/components/GameCreator";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function EditGamePage({ params }: { params: { id: string } }) {
    const [game, setGame] = useState<Game>();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGame = async () => {
            const { data: gameData, error } = await supabase()
                .schema("public")
                .from("games")
                .select("*")
                .eq("id", params.id)
                .single();
            const { data: questionData, error: questionError } = await supabase()
                .schema("public")
                .from("questions")
                .select("*, answers(*)")
                .eq("game_id", params.id);

            setGame(gameData);
            setQuestions(questionData || []);
            setLoading(false);
        };

        fetchGame();
    }, [params.id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <GameCreator existingGame={game} existingQuestions={questions} />;
}