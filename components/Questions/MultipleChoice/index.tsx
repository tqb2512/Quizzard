import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroupItem } from "@/components/ui/radio-group"
import { RadioGroup } from "@radix-ui/react-radio-group"
import { useState } from "react"
import { supabase } from "@/lib/supabase/client";

interface Answer {
    id: string
    answer_text: string
}

interface Question {
    id: string
    question_text: string
}

interface MultipleChoiceProps {
    question: Question
    answers: Answer[]
    participantId: string
    gameSessionId: string
}

export default function MultipleChoiceForm({ question, answers, participantId, gameSessionId }: MultipleChoiceProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const resetQuestion = () => {
        setSelectedAnswer(null)
    }

    const handleSubmit = () => {
        supabase().channel(`game_session:${gameSessionId}`)
            .send({
                type: "broadcast",
                event: "submit_answer",
                payload: {
                    participant_id: participantId,
                    question: question.id,
                    type: "multiple_choice",
                    data: selectedAnswer
                }
            })
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{question.question_text}</CardTitle>
            </CardHeader>
            <CardContent>
                <RadioGroup
                    onValueChange={setSelectedAnswer}
                    value={selectedAnswer || undefined}
                    disabled={isSubmitted}
                >
                    {answers.map((choice) => (
                        <div key={choice.id} className="flex items-center space-x-2">
                            <RadioGroupItem
                                value={choice.id}
                                id={choice.id}
                                className="peer"
                            />
                            <Label
                                htmlFor={choice.id}
                                className={`flex-grow p-2 rounded-md peer-aria-checked:bg-primary peer-aria-checked:text-primary-foreground`}
                            >
                                {choice.answer_text}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button onClick={resetQuestion} variant="outline" disabled={isSubmitted}>
                    Reset
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitted}>
                    Submit
                </Button>
            </CardFooter>
        </Card>
    )
}
