import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ParticipantListProps {
    participants: any[];
}

export function ParticipantList({ participants }: ParticipantListProps) {
    return (
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <div className="space-y-4">
                {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center space-x-4">
                        <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${participant.nickname}`} />
                            <AvatarFallback>{participant.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium leading-none">{participant.nickname}</p>
                            <p className="text-sm text-muted-foreground">Score: {participant.score || 0}</p>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}

