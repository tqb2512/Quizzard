import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"
import { Question, QuestionType } from "./index"
import QuestionItem from "./QuestionItem"

interface QuestionListProps {
    questions: Question[]
    addQuestion: (type: QuestionType) => void
    removeQuestion: (index: number) => void
    updateQuestion: (index: number, question: Question) => void
}

export default function QuestionList({ questions, addQuestion, removeQuestion, updateQuestion }: QuestionListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add and manage your quiz questions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {questions.map((q, index) => (
                    <QuestionItem
                        key={index}
                        question={q}
                        index={index}
                        removeQuestion={removeQuestion}
                        updateQuestion={updateQuestion}
                    />
                ))}
                <div className="flex space-x-2">
                    <Button onClick={() => addQuestion("multiple_choice")} className="flex-1">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Multiple Choice
                    </Button>
                    <Button onClick={() => addQuestion("drag_and_drop")} className="flex-1">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Drag and Drop
                    </Button>
                    <Button onClick={() => addQuestion("matching")} className="flex-1">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Matching
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}