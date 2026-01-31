import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import prisma from '@/lib/db';
import { timeAgo } from '@/lib/utils';
import { MessageCircle, Send } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getMessages() {
  // Get demo messages
  return prisma.message.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      sender: true,
      receiver: true,
      listing: true,
    },
  });
}

export default async function MessagesPage() {
  const messages = await getMessages();

  // Group messages into threads (simplified)
  const threads = messages.reduce((acc, msg) => {
    const key = msg.listingId || `${msg.senderId}-${msg.receiverId}`;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        participants: [msg.sender, msg.receiver],
        listing: msg.listing,
        messages: [],
        lastMessage: msg,
      };
    }
    acc[key].messages.push(msg);
    return acc;
  }, {} as Record<string, any>);

  const threadList = Object.values(threads);

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-white border-b border-sand-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-8 h-8 text-lobster-500" />
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          </div>
          <p className="text-muted-foreground">
            Communicate with buyers and sellers
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {threadList.length > 0 ? (
          <div className="space-y-3">
            {threadList.map((thread: any) => (
              <Link key={thread.id} href={`/messages/${thread.id}`}>
                <Card className="hover:border-lobster-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-lobster-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">🦞</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {thread.participants[0]?.name || 'Unknown User'}
                          </h3>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {timeAgo(thread.lastMessage.createdAt)}
                          </span>
                        </div>
                        
                        {thread.listing && (
                          <p className="text-sm text-lobster-600 truncate mb-1">
                            Re: {thread.listing.title}
                          </p>
                        )}
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {thread.lastMessage.content}
                        </p>
                      </div>

                      {/* Unread indicator */}
                      {!thread.lastMessage.isRead && (
                        <div className="w-3 h-3 rounded-full bg-lobster-500 flex-shrink-0"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">💬</span>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages yet</h3>
            <p className="text-muted-foreground mb-6">
              Start a conversation by messaging a seller about a listing
            </p>
            <Link href="/listings">
              <Button variant="lobster">
                <Send className="w-4 h-4 mr-2" />
                Browse Listings
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
