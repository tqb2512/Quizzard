"use client";
import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Game } from "@/components/GameCreator";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export interface GameSession {
    id: string;
    game_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    games: Game;
}

interface GameSessionCardProps {
    gameSession: GameSession;
}

export default function GameSessionCard({ gameSession }: GameSessionCardProps) {
    const router = useRouter();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{gameSession.games.title}</CardTitle>
                <CardDescription>{gameSession.id}</CardDescription>
                <CardDescription>{gameSession.status}</CardDescription>
                <CardDescription>{gameSession.created_at}</CardDescription>
            </CardHeader>
            <CardFooter className="justify-end">
                <Button
                    onClick={async () => {
                        router.push(`/dashboard/sessions/${gameSession.id}`);
                    }}
                >View</Button>
            </CardFooter>
        </Card>
    );
};