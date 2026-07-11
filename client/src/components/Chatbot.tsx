import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import Markdown from "react-markdown";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "bot",
      content: "Hi! I'm your coding assistant. Ask me anything about HTML, CSS, JavaScript, or any web development topic!",
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.chat.ask.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "bot", content: data.reply },
      ]);
    },
    onError: (error) => {
      let errorMsg = error.message;
      if (errorMsg.includes("Unexpected end of JSON input") || errorMsg.includes("Unexpected token") || errorMsg.includes("execute 'json' on 'Response'")) {
        errorMsg = "API configuration error (likely on Vercel). Please ensure you have pushed the latest updates to Vercel (including the `/api` directory) and configured the `GEMINI_API_KEY` environment variable in your Vercel project settings.";
      }
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "bot", content: `Error: ${errorMsg}` },
      ]);
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    
    const userMsg = input.trim();
    setInput("");
    
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userMsg },
    ]);
    
    chatMutation.mutate({ prompt: userMsg });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatMutation.isPending]);

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 flex items-center justify-center p-0"
          size="icon"
        >
          <MessageCircle size={28} />
        </Button>
      )}

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 w-full sm:w-[400px] h-[100dvh] sm:h-[550px] sm:max-h-[85vh] bg-background sm:border border-border shadow-2xl sm:rounded-2xl flex flex-col z-50 overflow-hidden flex-shrink-0">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-secondary/30">
            <div className="flex items-center gap-2 font-semibold">
              <Bot className="text-primary" size={20} />
              <span>Dev Assistant</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm"}`}>
                  {msg.role === "user" ? (
                    <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                  ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                      <Markdown
                        components={{
                          code({ node, inline, className, children, ...props }: any) {
                            const match = /language-(\w+)/.exec(className || "");
                            return !inline && match ? (
                              <SyntaxHighlighter
                                {...props}
                                children={String(children).replace(/\n$/, "")}
                                style={oneDark as any}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-md my-2 !bg-background !p-3 text-xs"
                              />
                            ) : (
                              <code {...props} className="bg-background px-1.5 py-0.5 rounded-sm text-[13px] font-mono">
                                {children}
                              </code>
                            );
                          },
                          p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                        }}
                      >
                        {msg.content}
                      </Markdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="animate-spin text-muted-foreground" size={16} />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border bg-background">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 rounded-full bg-secondary/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full h-10 w-10 shrink-0"
                disabled={!input.trim() || chatMutation.isPending}
              >
                <Send size={18} className={input.trim() ? "text-primary-foreground ml-1" : "text-muted-foreground"} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
