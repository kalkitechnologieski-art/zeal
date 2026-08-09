'use client';
import { Avatar, AvatarImage, AvatarFallback, Badge, Button } from '@zeal/ui';
import { useRouter } from 'next/navigation';
import { Calendar, MessageCircle, Phone } from 'lucide-react';

export function ConsultantProfile({ consultant, isAI }: { consultant: any; isAI: boolean }) {
  const router = useRouter();
  if (!consultant) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#E1C5E7] dark:border-gray-700 p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="w-24 h-24 border-4 border-[#E1C5E7]">
            <AvatarImage src={consultant.avatar} alt={consultant.name} />
            <AvatarFallback>{consultant.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-[#5E4B8B] dark:text-white">{consultant.name}</h1>
              <Badge variant={consultant.isOnline ? 'success' : 'secondary'}>{consultant.isOnline ? 'Online' : 'Offline'}</Badge>
              {isAI && <Badge variant="outline">AI</Badge>}
            </div>
            <p className="text-sm text-[#B8A1D9] dark:text-gray-400">@{consultant.username}</p>
            <p className="text-sm text-[#5E4B8B] dark:text-white mt-2">{consultant.bio}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-[#B8A1D9] dark:text-gray-400">
              <span>⭐ {consultant.rating}</span>
              <span>•</span>
              <span>₹{consultant.perMinuteRate}/min</span>
              <span>•</span>
              <span>{consultant.totalConsultations} consultations</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {consultant.specialties?.map((s: string) => (
                <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <Button variant="primary" onClick={() => router.push(`/booking?consultantId=${consultant.id}`)}>
                <Calendar className="w-4 h-4 mr-2" /> Book
              </Button>
              <Button variant="secondary" onClick={() => router.push(`/chat/${consultant.id}`)}>
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
              </Button>
              <Button variant="secondary" onClick={() => alert('Call initiated!')}>
                <Phone className="w-4 h-4 mr-2" /> Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
