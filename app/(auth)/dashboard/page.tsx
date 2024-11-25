"use client";
import GameCard from "@/components/Dashboard/GameCard";
import GameSessionCard, { GameSession } from "@/components/Dashboard/GameSessionCard";
import { Game } from "@/components/GameCreator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client"
import { Session } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

export default function DashboardPage() {
    const [session, setSession] = useState<Session>();
    const [games, setGames] = useState<Game[]>([]);
    const [gameSessions, setGameSessions] = useState<GameSession[]>([]);

    useEffect(() => {
        supabase().auth.getSession().then(({ data, error }) => {
            if (data.session) {
                setSession(data.session);
            }
        });
    }, []);

    useEffect(() => {
        const fetchGames = async () => {
            const { data, error } = await supabase()
                .from("games")
                .select("*")
                .eq("creator_id", session?.user.id);
            if (data) {
                setGames(data);
            }
        };

        const fetchGameSessions = async () => {
            const { data, error } = await supabase()
                .from("game_sessions")
                .select("*, games(*)")
                .eq("creator_id", session?.user.id);
            if (data) {
                setGameSessions(data);
            }
        }

        if (session) {
            fetchGames();
            fetchGameSessions();
        }
    }, [session]);

    return (
        <div>
        <div className="container mx-auto p-6">
            <Tabs defaultValue="games" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="games">My Games</TabsTrigger>
                    <TabsTrigger value="sessions">Game Sessions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="games">
                    <div className="grid grid-cols-2 gap-4">
                        {games.map((game) => (
                            <GameCard key={game.id} game={game} />
                        ))}
                    </div>
                </TabsContent>
                
                <TabsContent value="sessions">
                    <div className="grid grid-cols-2 gap-4">
                        {gameSessions.map((gameSession) => (
                            <GameSessionCard key={gameSession.id} gameSession={gameSession} />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    </div>
    )
}