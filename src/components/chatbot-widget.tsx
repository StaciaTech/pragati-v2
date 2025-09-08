
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, MessageSquare, X, Send, HelpCircle } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const initialMessages = [
    { from: 'bot', text: 'Hello! I am Pragati, your AI assistant. How can I help you today?' },
];

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [messages, setMessages] = React.useState(initialMessages);
  const [input, setInput] = React.useState('');
  const { toast } = useToast();

  const handleSend = () => {
    if (input.trim() === '') return;
    const newMessages = [...messages, { from: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: 'This is a mock response. For real support, please email support@staciacorp.com' }]);
       toast({
        title: "This is a demo",
        description: "The AI chatbot functionality is currently in development.",
      });
    }, 1000);
  };
  
  const handleMenuClick = (action: 'chat' | 'help') => {
    setIsOpen(false);
    if (action === 'chat') {
        setIsChatOpen(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
         <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-end gap-3 mb-3"
                >
                    <Link href="/support">
                        <Button 
                            variant="secondary"
                            className="rounded-full shadow-lg h-12 pr-6"
                            onClick={() => handleMenuClick('help')}
                        >
                            <HelpCircle className="mr-2" />
                            Get Help
                        </Button>
                    </Link>
                    <Button 
                        variant="secondary"
                        className="rounded-full shadow-lg h-12 pr-6"
                        onClick={() => handleMenuClick('chat')}
                    >
                        <MessageSquare className="mr-2" />
                        Chat with Us
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
        <motion.div
            initial={false}
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
        >
            <Button 
                onClick={() => setIsOpen(!isOpen)} 
                className="h-16 w-16 rounded-full shadow-lg z-50 flex items-center justify-center btn-primary text-white" 
                size="icon" 
                aria-label="Toggle Chat Menu"
            >
                {isOpen ? <X className="h-8 w-8" /> : <Bot className="h-8 w-8" />}
            </Button>
        </motion.div>
      </div>

      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="sm:max-w-[425px] flex flex-col h-[70vh]">
          <DialogHeader>
            <DialogTitle>Chat with Pragati</DialogTitle>
            <DialogDescription>
              Your AI assistant for navigating the platform.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.from === 'user' ? 'justify-end' : ''
                  )}
                >
                  {message.from === 'bot' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-lg p-3 text-sm',
                      message.from === 'bot'
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground'
                    )}
                  >
                    {message.text}
                  </div>
                   {message.from === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <div className="flex w-full items-center space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type your message..."
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
