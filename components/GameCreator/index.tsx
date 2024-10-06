"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import BasicInfoForm from "./BasicInfoForm";
import QuestionList from "./QuestionList";
import GameSettingsForm from "./GameSettings";
import { supabase } from "@/lib/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { Textarea } from "../ui/textarea";
import { Session } from "@supabase/supabase-js";

export type QuestionType = "multiple_choice" | "drag_and_drop" | "matching";

export interface Game {
    id?: string;
    creator_id?: string;
    title: string;
    description: string;
    settings: GameSettings;
}

export interface Question {
    id: string;
    game_id: string;
    question_text: string;
    question_type: QuestionType;
    media_content?: any;
    answers?: Answer[];
}

export interface Answer {
    id: string;
    question_id: string;
    answer_text: string;
    is_correct: boolean;
    answer_specific_data?: any;
}

export interface GameSettings {
    time_limit: number;
    randomize_questions: boolean;
    show_answers: boolean;
    game_mode: "classic" | "team" | "live";
}

interface GameCreatorProps {
    existingGame?: Game;
    existingQuestions?: Question[];
}

export default function GameCreator({ existingGame, existingQuestions }: GameCreatorProps) {
    const [session, setSession] = useState<Session>();
    const [game, setGame] = useState<Game>({
            id: uuidv4(),
            title: "",
            description: "",
            settings: {
                time_limit: 30,
                randomize_questions: false,
                show_answers: false,
                game_mode: "classic",
            },
        }
    );
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        supabase().auth.getSession().then(({ data, error }) => {
            if (data.session) {
                setSession(data.session);
                if (!existingGame) {
                    setGame({ ...game, creator_id: data.session.user.id });
                }
            }
        });
    }, [existingGame]);

    useEffect(() => {
        if (existingGame) {
            setGame(existingGame);
        }
        if (existingQuestions) {
            setQuestions(existingQuestions);
        }
    }, [existingGame, existingQuestions]);

    const updateGame = (field: keyof Game, value: any) => {
        setGame({ ...game, [field]: value });
    };

    const updateGameSettings = (field: keyof GameSettings, value: any) => {
        setGame({ ...game, settings: { ...game.settings, [field]: value } });
    };

    const addQuestion = (type: QuestionType) => {
        const newQuestion: Question = {
            id: uuidv4(),
            game_id: game.id || "",
            question_text: "",
            question_type: type,
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (index: number) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, updatedQuestion: Question) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index] = updatedQuestion;
        setQuestions(updatedQuestions);
    };

    const handleSaveGame = async () => {
        await supabase(session?.access_token).from("games").upsert([
            {
                id: game.id,
                creator_id: game.creator_id,
                title: game.title,
                description: game.description,
                settings: game.settings,
            },
        ]);


        await supabase(session?.access_token).from("questions").upsert(questions.map(q => ({
            id: q.id,
            game_id: q.game_id,
            question_text: q.question_text,
            question_type: q.question_type,
            media_content: q.media_content,
        })));

        await supabase(session?.access_token).from("answers").upsert(questions.flatMap(q => q.answers || []));
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">{existingGame ? "Edit Game" : "Create New Game"}</h1>
            <Tabs defaultValue="basic" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="questions">Questions</TabsTrigger>
                    <TabsTrigger value="settings">Game Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="basic">
                    <BasicInfoForm game={game} updateGame={updateGame} />
                </TabsContent>
                <TabsContent value="questions">
                    <QuestionList
                        questions={questions}
                        addQuestion={addQuestion}
                        removeQuestion={removeQuestion}
                        updateQuestion={updateQuestion}
                    />
                </TabsContent>
                <TabsContent value="settings">
                    <GameSettingsForm settings={game.settings} updateSettings={updateGameSettings} />
                </TabsContent>
            </Tabs>
            <Card className="mt-6 w-full flex justify-end">
                <CardContent className="mt-6 justify-end ">
                    <Button onClick={handleSaveGame}>{existingGame ? "Save Changes" : "Create Game"}</Button>
                </CardContent>
            </Card>
        </div>
    );
}