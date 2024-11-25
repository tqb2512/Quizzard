'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, useDroppable, useDraggable } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

interface Answer {
    id: string
    answer_text: string
    answer_specific_data: {
        matching_text: string
    }
}

interface Question {
    id: string
    question_text: string
}

interface MatchingFormProps {
    question: Question
    answers: Answer[]
}

interface MatchingItem {
    id: string
    text: string
    position: { x: number; y: number }
}

const DraggableItem = ({ id, text, position }: MatchingItem) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id,
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined

    return (
        <Card
            ref={setNodeRef}
            style={{
                ...style,
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                touchAction: 'none',
            }}
            className="w-32 cursor-move"
            {...listeners}
            {...attributes}
        >
            <CardContent className="p-2 text-center">
                {text}
            </CardContent>
        </Card>
    )
}

const AnswerCard = ({ id, text, matchedItem, onRemoveMatch }: { id: string, text: string, matchedItem?: string, onRemoveMatch: () => void }) => {
    const { setNodeRef } = useDroppable({ id: `answer-${id}` })

    return (
        <Card
            ref={setNodeRef}
            className="mb-2"
        >
            <CardContent className="p-4 flex justify-between items-center">
                <span>{text}</span>
                {matchedItem && (
                    <div className="flex items-center">
                        <span className="font-semibold mr-2">{matchedItem}</span>
                        <Button variant="ghost" size="sm" onClick={onRemoveMatch}>&times;</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

export default function MatchingForm({ question, answers }: MatchingFormProps) {
    const [matchingItems, setMatchingItems] = useState<MatchingItem[]>([])
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({})
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
    const [activeId, setActiveId] = useState<string | null>(null)

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        },
    }))

    const getRandomPosition = useCallback(() => {
        const margin = 20
        const width = Math.max(windowSize.width / 2, 300)
        const height = windowSize.height - 150
        return {
            x: Math.random() * (width - margin * 2) + margin,
            y: Math.random() * (height - margin * 2) + margin
        }
    }, [windowSize])

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight })
        }

        handleResize()
        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        if (windowSize.width > 0 && windowSize.height > 0) {
            const items = answers.map(a => ({
                id: a.id,
                text: a.answer_specific_data.matching_text,
                position: getRandomPosition()
            }))
            setMatchingItems(items)
        }
    }, [answers, windowSize, getRandomPosition])

    const handleDragStart = (event: any) => {
        setActiveId(event.active.id)
    }

    const handleDragEnd = (event: any) => {
        const { active, over } = event

        if (over && over.id.startsWith('answer-')) {
            const answerId = over.id.replace('answer-', '')
            setUserAnswers(prev => ({
                ...prev,
                [answerId]: active.id
            }))
            setMatchingItems(items => items.filter(item => item.id !== active.id))
        } else {
            // Update position when dragged within the drag zone
            setMatchingItems(items =>
                items.map(item =>
                    item.id === active.id
                        ? { ...item, position: { x: event.delta.x + item.position.x, y: event.delta.y + item.position.y } }
                        : item
                )
            )
        }

        setActiveId(null)
    }

    const handleRemoveMatch = (answerId: string) => {
        const itemId = userAnswers[answerId]
        setUserAnswers(prev => {
            const newAnswers = { ...prev }
            delete newAnswers[answerId]
            return newAnswers
        })
        setMatchingItems(prev => [
            ...prev,
            {
                id: itemId,
                text: answers.find(a => a.id === itemId)?.answer_specific_data.matching_text || '',
                position: getRandomPosition()
            }
        ])
    }

    const handleSubmit = () => {
        
    }

    const resetGame = () => {
        setMatchingItems(answers.map(a => ({
            id: a.id,
            text: a.answer_specific_data.matching_text,
            position: getRandomPosition()
        })))
        setUserAnswers({})
    }

    return (
        <div className="w-full h-[calc(100vh-100px)] overflow-hidden relative">
            <h2 className="text-2xl font-bold mb-4 text-center">{question.question_text}</h2>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="h-full w-full flex space-x-4">
                    <div className="overflow-y-auto w-1/3">
                        <h3 className="text-xl font-semibold mb-2">Answers</h3>
                        {answers.map((answer) => (
                            <AnswerCard
                                key={answer.id}
                                id={answer.id}
                                text={answer.answer_text}
                                matchedItem={userAnswers[answer.id] ? answers.find(a => a.id === userAnswers[answer.id])?.answer_specific_data.matching_text : undefined}
                                onRemoveMatch={() => handleRemoveMatch(answer.id)}
                            />
                        ))}
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleSubmit} className="flex-1">Submit</Button>
                            <Button onClick={resetGame} variant="outline" className="flex-1">Reset</Button>
                        </div>
                    </div>
                    <div className="relative w-full h-full bg-secondary/20 rounded-lg">
                        {matchingItems.map((item) => (
                            <DraggableItem key={item.id} {...item} />
                        ))}
                    </div>
                </div>
                <DragOverlay>
                    {activeId ? (
                        <Card className="w-32">
                            <CardContent className="p-2 text-center">
                                {matchingItems.find(item => item.id === activeId)?.text}
                            </CardContent>
                        </Card>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}
