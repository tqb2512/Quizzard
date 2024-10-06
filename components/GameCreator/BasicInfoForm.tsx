import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Game } from "./index";

interface BasicInfoFormProps {
    game: Game;
    updateGame: (field: keyof Game, value: any) => void;
}

export default function BasicInfoForm({ game, updateGame }: BasicInfoFormProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Set up the basic details for your quiz game.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Game Title</Label>
                    <Input
                        id="title"
                        value={game.title}
                        onChange={(e) => updateGame("title", e.target.value)}
                        placeholder="Enter game title"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={game.description}
                        onChange={(e) => updateGame("description", e.target.value)}
                        placeholder="Enter game description"
                    />
                </div>
            </CardContent>
        </Card>
    );
}