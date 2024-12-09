import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionListProps {
    questions: any[];
}

export function QuestionList({ questions }: QuestionListProps) {
    return (
        <ScrollArea className="h-[300px] w-full rounded-md border">
            <div className="p-4 space-y-4">
                {questions.map((question, index) => (
                    <Card key={question.id}>
                        <CardContent className="p-4">
                            <p className="font-medium">
                                {index + 1}. {question.question_text}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    );
}

