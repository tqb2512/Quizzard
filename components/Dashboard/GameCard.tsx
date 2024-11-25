import * as React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Game } from "@/components/GameCreator";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase/client";

interface GameCardProps {
    game: Game;
}

export default function GameCard({ game }: GameCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{game.title}</CardTitle>
                <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardFooter className="justify-end">
                <Button
                    onClick={async () => {
                        await supabase().from("game_sessions").insert({
                            game_id: game.id,
                            status: "pending",
                        });
                    }}
                >Create Session</Button>
            </CardFooter>
        </Card>
    );
};