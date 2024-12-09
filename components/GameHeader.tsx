import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GameHeaderProps {
    title: string;
    description: string;
}

export function GameHeader({ title, description }: GameHeaderProps) {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="text-3xl font-bold">{title}</CardTitle>
                <CardDescription className="text-lg">{description}</CardDescription>
            </CardHeader>
        </Card>
    );
}

