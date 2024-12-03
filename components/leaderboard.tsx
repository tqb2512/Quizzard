"use client";
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supabase } from '@/lib/supabase/client'

interface Participant {
    id: string
    created_at: string
    game_session_id: string
    nickname: string
    score: number
}

interface LeaderboardProps {
    gameSessionId: string
}

export default function Leaderboard({ gameSessionId }: LeaderboardProps) {
    const [participants, setParticipants] = useState<Participant[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                supabase()
                    .from("participants")
                    .select("*")
                    .eq("game_session_id", gameSessionId)
                    .order("score", { ascending: false })
                    .then(({ data, error }) => {
                        if (error) {
                            throw error
                        }

                        if (data) {
                            setParticipants(data)
                        }
                    })
                setIsLoading(false)
            } catch (err) {
                setError('Failed to load leaderboard data')
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    if (isLoading) {
        return <div>Loading leaderboard...</div>
    }

    if (error) {
        return <div>{error}</div>
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Quizizz Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Rank</TableHead>
                            <TableHead>Nickname</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {participants.map((participant, index) => (
                            <TableRow key={participant.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>{participant.nickname}</TableCell>
                                <TableCell className="text-right">{participant.score}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

