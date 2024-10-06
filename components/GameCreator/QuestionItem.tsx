import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, Minus } from "lucide-react"
import { Question, QuestionType, Answer } from "./index"
import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid";

interface QuestionItemProps {
    question: Question
    index: number
    removeQuestion: (index: number) => void
    updateQuestion: (index: number, question: Question) => void
}

export default function QuestionItem({ question, index, removeQuestion, updateQuestion }: QuestionItemProps) {
    const [answers, setAnswers] = useState<Answer[]>(
        question.answers || [
            { id: uuidv4(), question_id: question.id, answer_text: "", is_correct: false, answer_specific_data: {} },
            { id: uuidv4(), question_id: question.id, answer_text: "", is_correct: false, answer_specific_data: {} }
        ]
    )

    const handleQuestionChange = (field: keyof Question, value: any) => {
        updateQuestion(index, { ...question, [field]: value })
    }

    const handleAnswerChange = (answerIndex: number, field: keyof Answer, value: any) => {
        const updatedAnswers = answers.map((answer, i) =>
            i === answerIndex ? { ...answer, [field]: value } : answer
        )
        setAnswers(updatedAnswers)
        updateQuestion(index, { ...question, answers: updatedAnswers })
    }

    const addAnswer = () => {
        setAnswers([...answers, { id: uuidv4(), question_id: question.id, answer_text: "", is_correct: false, answer_specific_data: {} }])
    }

    const removeAnswer = (answerIndex: number) => {
        if (answers.length > 2) {
            setAnswers(answers.filter((_, i) => i !== answerIndex))
        }
    }

    const renderQuestionFields = () => {
        switch (question.question_type) {
            case "multiple_choice":
                return (
                    <>
                        <Textarea
                            placeholder="Enter your question"
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange("question_text", e.target.value)}
                        />
                        <RadioGroup
                            value={answers.findIndex(a => a.is_correct).toString()}
                            onValueChange={(value) => {
                                const updatedAnswers = answers.map((answer, i) => ({
                                    ...answer,
                                    is_correct: i === parseInt(value)
                                }))
                                setAnswers(updatedAnswers)
                            }}
                        >
                            {answers.map((answer, answerIndex) => (
                                <div key={answerIndex} className="flex items-center space-x-2">
                                    <RadioGroupItem value={answerIndex.toString()} id={`q${index}a${answerIndex}`} />
                                    <Input
                                        placeholder={`Answer ${answerIndex + 1}`}
                                        value={answer.answer_text}
                                        onChange={(e) => handleAnswerChange(answerIndex, "answer_text", e.target.value)}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeAnswer(answerIndex)}
                                        disabled={answers.length <= 2}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </RadioGroup>
                        <Button variant="outline" onClick={addAnswer} className="mt-2">
                            <Plus className="h-4 w-4 mr-2" /> Add Answer
                        </Button>
                    </>
                )
            case "drag_and_drop":
            case "matching":
                return (
                    <>
                        <Textarea
                            placeholder="Enter your question"
                            value={question.question_text}
                            onChange={(e) => handleQuestionChange("question_text", e.target.value)}
                        />
                        {answers.map((answer, answerIndex) => (
                            <div key={answerIndex} className="flex items-center space-x-2 mb-2">
                                <Input
                                    placeholder={`Item ${answerIndex + 1}`}
                                    value={answer.answer_text}
                                    onChange={(e) => handleAnswerChange(answerIndex, "answer_text", e.target.value)}
                                />
                                {question.question_type === "matching" && (
                                    <Input
                                        placeholder={`Matching item ${answerIndex + 1}`}
                                        value={answer.answer_specific_data.matching_text || ""}
                                        onChange={(e) => handleAnswerChange(answerIndex, "answer_specific_data", { ...answer.answer_specific_data, matching_text: e.target.value })}
                                    />
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeAnswer(answerIndex)}
                                    disabled={answers.length <= 2}
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addAnswer} className="mt-2">
                            <Plus className="h-4 w-4 mr-2" /> Add {question.question_type === "matching" ? "Pair" : "Item"}
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                            {question.question_type === "drag_and_drop"
                                ? "Items will be randomized during the game."
                                : "Matching pairs will be randomized during the game."}
                        </p>
                    </>
                )
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Question {index + 1}</CardTitle>
                <div className="flex items-center space-x-2">
                    <Select
                        value={question.question_type}
                        onValueChange={(value: QuestionType) => handleQuestionChange("question_type", value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Question Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                            <SelectItem value="drag_and_drop">Drag and Drop</SelectItem>
                            <SelectItem value="matching">Matching</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="ghost" size="sm" onClick={() => removeQuestion(index)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {renderQuestionFields()}
            </CardContent>
        </Card>
    )
}