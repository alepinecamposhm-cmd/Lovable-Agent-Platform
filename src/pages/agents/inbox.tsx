import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  Send,
  Paperclip,
  Image,
  Smile,
  Check,
  CheckCheck,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockConversations, mockMessages, mockAgent } from '@/lib/agents/fixtures';
import { staggerContainer, staggerItem } from '@/lib/agents/motion/tokens';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Conversation, Message } from '@/types/agents';
import { add as addNotification, markRead as markNotificationRead, useNotificationStore } from '@/lib/agents/notifications/store';
import { addTask } from '@/lib/agents/tasks/store';
import { toast } from '@/components/ui/use-toast';

const templates = [
  { id: 't1', label: 'Saludo inicial', content: '¡Hola! Gracias por tu interés. Estoy aquí para ayudarte a encontrar tu propiedad ideal.' },
  { id: 't2', label: 'Agendar cita', content: '¿Te gustaría agendar una visita? Tengo disponibilidad esta semana.' },
  { id: 't3', label: 'Seguimiento', content: 'Hola, quería dar seguimiento a nuestra conversación anterior. ¿Tienes alguna pregunta?' },
];

function MessageBubble({ message, isOwn }: { message: Message; isOwn: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        'flex gap-2 max-w-[80%]',
        isOwn ? 'ml-auto flex-row-reverse' : ''
      )}
    >
      {!isOwn && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-muted text-xs">
            CL
          </AvatarFallback>
        </Avatar>
      )}
      <div>
        <div
          className={cn(
            'rounded-2xl px-4 py-2 text-sm',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          )}
        >
          {message.content}
          {message.attachments?.map((att) => (
            <div key={att.id} className="mt-2 rounded-lg border bg-background p-2 text-xs">
              {att.mimeType.startsWith('image/') ? (
                <img src={att.url} alt={att.filename} className="max-h-40 rounded" />
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Paperclip className="h-3 w-3" /> {att.filename}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={cn(
          'flex items-center gap-1 mt-1 text-xs text-muted-foreground',
          isOwn && 'justify-end'
        )}>
          <span>{format(message.createdAt, 'HH:mm')}</span>
          {isOwn && (
            message.status === 'read' ? (
              <CheckCheck className="h-3 w-3 text-primary" />
            ) : message.status === 'delivered' ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ConversationItem({ 
  conversation, 
  isActive, 
  onClick 
}: { 
  conversation: Conversation; 
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.5)' }}
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors',
        isActive && 'bg-muted'
      )}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary">
            {conversation.lead?.firstName[0]}{conversation.lead?.lastName?.[0] || ''}
          </AvatarFallback>
        </Avatar>
        {conversation.unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
            {conversation.unreadCount}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className={cn(
            'font-medium text-sm truncate',
            conversation.unreadCount > 0 && 'font-semibold'
          )}>
            {conversation.lead?.firstName} {conversation.lead?.lastName}
          </p>
          <span className="text-xs text-muted-foreground shrink-0 ml-2">
            {formatDistanceToNow(conversation.updatedAt, { addSuffix: false, locale: es })}
          </span>
        </div>
        <p className={cn(
          'text-sm truncate',
          conversation.unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {conversation.lastMessage?.content}
        </p>
      </div>
    </motion.button>
  );
}

export default function AgentInbox() {
  const { notifications } = useNotificationStore();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    mockConversations[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [onlyUnreadConv, setOnlyUnreadConv] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredConversations = conversations.filter(conv =>
    conv.lead?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lead?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(conv => !onlyUnreadConv || (conv.unreadCount ?? 0) > 0);

  const conversationMessages = messages.filter(
    msg => msg.conversationId === selectedConversation?.id
  );

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    const now = new Date();
    const outgoing: Message = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: mockAgent.id,
      senderType: 'agent',
      content: messageInput.trim(),
      contentType: 'text',
      status: 'sent',
      createdAt: now,
    };

    setMessages((prev) => [...prev, outgoing]);
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id
          ? { ...conv, lastMessage: outgoing, updatedAt: now }
          : conv
      )
    );
    setSelectedConversation((prev) =>
      prev && prev.id === selectedConversation.id ? { ...prev, lastMessage: outgoing, updatedAt: now } : prev
    );
    setMessageInput('');

    // Simula respuesta del lead para demo + trigger de notificación
    setTimeout(() => {
      const incoming: Message = {
        id: `msg-${Date.now() + 1}`,
        conversationId: selectedConversation.id,
        senderId: selectedConversation.leadId,
        senderType: 'lead',
        content: '¡Recibido! ¿Puedes compartir el brochure?',
        contentType: 'text',
        status: 'delivered',
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, incoming]);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation.id
            ? {
                ...conv,
                lastMessage: incoming,
                updatedAt: new Date(),
                unreadCount: (conv.unreadCount || 0) + 1,
              }
            : conv
        )
      );
      setSelectedConversation((prev) =>
        prev && prev.id === selectedConversation.id
          ? { ...prev, lastMessage: incoming, updatedAt: new Date(), unreadCount: (prev.unreadCount || 0) + 1 }
          : prev
      );
      addNotification({
        type: 'message',
        title: `Nuevo mensaje de ${selectedConversation.lead?.firstName}`,
        body: incoming.content,
        actionUrl: `/agents/leads/${selectedConversation.leadId}`,
      });
    }, 700);
  };

  const handleAttachFile = (file: File) => {
    if (!selectedConversation) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const now = new Date();
      const attachment = {
        id: `att-${Date.now()}`,
        url,
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
      };
      const outgoing: Message = {
        id: `msg-${Date.now()}`,
        conversationId: selectedConversation.id,
        senderId: mockAgent.id,
        senderType: 'agent',
        content: 'Adjunto',
        contentType: 'file',
        attachments: [attachment],
        status: 'sent',
        createdAt: now,
      };
      setMessages((prev) => [...prev, outgoing]);
      setUploading(false);
      window.dispatchEvent(new CustomEvent('analytics', { detail: { event: 'chat.attachment_upload', type: file.type } }));
    };
    reader.onerror = () => {
      setUploading(false);
      toast({ title: 'Error al adjuntar', description: 'No pudimos leer el archivo', variant: 'destructive' });
    };
    reader.readAsDataURL(file);
  };

  const handleTemplateSelect = (content: string) => {
    setMessageInput(content);
    setShowTemplates(false);
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
      )
    );
    notifications
      .filter((n) => n.actionUrl?.includes(conversation.leadId))
      .forEach((n) => markNotificationRead(n.id));
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="h-[calc(100vh-8rem)]"
    >
      <motion.div variants={staggerItem} className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="text-muted-foreground">
          Gestiona tus conversaciones con clientes
        </p>
      </motion.div>

      <motion.div 
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100%-4rem)]"
      >
        {/* Conversations List */}
        <Card className="lg:col-span-1 flex flex-col">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <Badge
                variant={onlyUnreadConv ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setOnlyUnreadConv((v) => !v)}
              >
                Solo no leídos
              </Badge>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={selectedConversation?.id === conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                />
              ))}
              {filteredConversations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No se encontraron conversaciones
                </p>
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedConversation.lead?.firstName[0]}
                      {selectedConversation.lead?.lastName?.[0] || ''}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedConversation.lead?.firstName} {selectedConversation.lead?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.lead?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!selectedConversation) return;
                      const task = addTask({
                        title: `Follow-up con ${selectedConversation.lead?.firstName || 'lead'}`,
                        leadId: selectedConversation.leadId,
                        dueAt: new Date(),
                        priority: 'medium',
                        tags: ['Inbox'],
                        origin: 'manual',
                      });
                      toast({ title: 'Tarea creada', description: task.title });
                    }}
                  >
                    Crear tarea
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {conversationMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderType === 'agent'}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 border-t">
                {showTemplates && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 p-2 bg-muted rounded-lg space-y-1"
                  >
                    <p className="text-xs font-medium text-muted-foreground px-2 mb-2">
                      Plantillas rápidas
                    </p>
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template.content)}
                        className="w-full text-left text-sm p-2 rounded hover:bg-background transition-colors"
                      >
                        <span className="font-medium">{template.label}</span>
                        <p className="text-xs text-muted-foreground truncate">
                          {template.content}
                        </p>
                      </button>
                    ))}
                  </motion.div>
                )}
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAttachFile(file);
                        if (e.target) e.target.value = '';
                      }}
                    />
                    <Textarea
                      placeholder="Escribe un mensaje..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[44px] max-h-32 resize-none pr-24"
                      rows={1}
                    />
                    <div className="absolute right-2 bottom-2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setShowTemplates(!showTemplates)}
                      >
                        <span className="text-xs">📝</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => fileInputRef.current?.click()}>
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleSendMessage} size="icon" className="shrink-0" disabled={uploading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {uploading && <p className="text-xs text-muted-foreground mt-2">Subiendo adjunto…</p>}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Selecciona una conversación para comenzar
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
