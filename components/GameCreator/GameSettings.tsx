import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { GameSettings } from "./index"

interface GameSettingsProps {
    settings: GameSettings
    updateSettings: (field: keyof GameSettings, value: any) => void
}

export default function GameSettingsForm({ settings, updateSettings }: GameSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Game Settings</CardTitle>
                <CardDescription>Customize your game settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="time-limit">Time Limit per Question (seconds)</Label>
                    <Slider
                        id="time-limit"
                        max={120}
                        min={5}
                        step={5}
                        value={[settings.time_limit]}
                        onValueChange={([value]) => updateSettings("time_limit", value)}
                        className="w-[60%]"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="randomize"
                        checked={settings.randomize_questions}
                        onCheckedChange={(checked) => updateSettings("randomize_questions", checked)}
                    />
                    <Label htmlFor="randomize">Randomize Question Order</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <Switch
                        id="show-answers"
                        checked={settings.show_answers}
                        onCheckedChange={(checked) => updateSettings("show_answers", checked)}
                    />
                    <Label htmlFor="show-answers">Show Correct Answers After Each Question</Label>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="game-mode">Game Mode</Label>
                    <Select value={settings.game_mode} onValueChange={(value: "classic" | "team" | "live") => updateSettings("game_mode", value)}>
                        <SelectTrigger id="game-mode">
                            <SelectValue placeholder="Select game mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="classic">Classic</SelectItem>
                            <SelectItem value="team">Team Mode</SelectItem>
                            <SelectItem value="live">Live Competition</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </CardContent>
        </Card>
    )
}