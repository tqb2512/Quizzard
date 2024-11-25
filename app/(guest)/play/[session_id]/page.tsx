"use client";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"


export default function PlayPage({ params }: { params: { session_id: string } }) {
    const [gameSession, setGameSession] = useState<any>();
    const [game, setGame] = useState<any>();

    const [nickname, setNickname] = useState<string>();
    const [isGameStarted, setIsGameStarted] = useState<boolean>(false);
    const [isJoined, setIsJoined] = useState<boolean>(false);

    const [question, setQuestion] = useState<any>();
    const [answers, setAnswers] = useState<any[]>([]);

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

    return (
        <div className="container mx-auto p-6">
            <Card className="max-w-md mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">
                        {isJoined ? 'Waiting Room' : 'Join Game'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isJoined ? (
                        <div className="space-y-4">
                            {isGameStarted ? (
                                <div className="space-y-4">

                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h1 className="text-xl font-bold">Waiting for game to start...</h1>
                                </div>
                            )}
                        </div>

                    ) : (
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
                                                console.log(payload.payload);
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
                    )}
                </CardContent>
            </Card>
        </div>
    )
}