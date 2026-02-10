import { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Bot, User, Loader2, Languages } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

// Language Configuration
const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', name: 'English', voice: 'en-IN-NeerjaNeural' },
  { code: 'hi-IN', name: 'Hindi (हिंदी)', voice: 'hi-IN-SwaraNeural' },
  { code: 'ta-IN', name: 'Tamil (தமிழ்)', voice: 'ta-IN-PallaviNeural' },
  { code: 'ml-IN', name: 'Malayalam (മലയാളം)', voice: 'ml-IN-SobhanaNeural' },
  { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', voice: 'kn-IN-SapnaNeural' },
  { code: 'te-IN', name: 'Telugu (తెలుగు)', voice: 'te-IN-ShrutiNeural' },
  { code: 'bn-IN', name: 'Bengali (বাংলা)', voice: 'bn-IN-TanishaaNeural' },
  { code: 'or-IN', name: 'Odia (ଓଡ଼ିଆ)', voice: 'or-IN-SubhasiniNeural' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState<any[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AgriMarket AI Assistant. I can help you manage your farm data, find the best markets, and answer any questions. You can type or speak to me. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Refs for Speech SDK
  const recognizerRef = useRef<SpeechSDK.SpeechRecognizer | null>(null);
  const synthesizerRef = useRef<SpeechSDK.SpeechSynthesizer | null>(null);
  const playerRef = useRef<SpeechSDK.SpeakerAudioDestination | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.close();
      }
      if (synthesizerRef.current) {
        synthesizerRef.current.close();
      }
    };
  }, []);

  const getTokenOrThrow = async () => {
    const res = await fetch('http://localhost:5000/api/ai/speech-token');
    if (!res.ok) throw new Error('Failed to get speech token');
    return await res.json();
  };

  const startListening = async () => {
    try {
      if (isListening) return;
      setIsLoading(true); // Show loading while initializing

      const { token, region } = await getTokenOrThrow();
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = selectedLang.code;

      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

      recognizerRef.current = recognizer;

      recognizer.recognizing = (s, e) => {
        // Real-time interim results
      };

      recognizer.recognized = (s, e) => {
        if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          setInput(prev => {
            const spacer = prev ? ' ' : '';
            return prev + spacer + e.result.text;
          });
        }
      };

      recognizer.canceled = (s, e) => {
        console.error(`CANCELED: Reason=${e.reason}`);
        if (e.reason === SpeechSDK.CancellationReason.Error) {
          console.error(`CANCELED: ErrorDetails=${e.errorDetails}`);
        }
        stopListening(); // Ensure cleanup
      };

      recognizer.sessionStopped = (s, e) => {
        stopListening(); // Ensure cleanup
      };

      await recognizer.startContinuousRecognitionAsync(() => {
        setIsListening(true);
        setIsLoading(false);
      }, (err) => {
        console.error(err);
        setIsLoading(false);
        setIsListening(false);
      });

    } catch (err) {
      console.error(err);
      setIsLoading(false);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    setIsListening(false); // Update UI immediately

    if (recognizerRef.current) {
      try {
        recognizerRef.current.stopContinuousRecognitionAsync(() => {
          // Stopped
        }, (err) => {
          console.error("Error stopping recognition:", err);
        });
      } catch (e) {
        console.error("Exception stopping recognition:", e);
      }
    }
  };

  const speakText = async (text: string) => {
    try {
      stopSpeaking(); // Stop any current speech
      setIsSpeaking(true);

      const { token, region } = await getTokenOrThrow();
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechSynthesisVoiceName = selectedLang.voice;

      const player = new SpeechSDK.SpeakerAudioDestination();
      playerRef.current = player;
      const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);

      const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
      synthesizerRef.current = synthesizer;

      synthesizer.speakTextAsync(
        text,
        result => {
          if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            setIsSpeaking(false);
          } else {
            console.error(result.errorDetails);
            setIsSpeaking(false);
          }
          synthesizer.close();
          synthesizerRef.current = null;
        },
        error => {
          console.error(error);
          setIsSpeaking(false);
          synthesizer.close();
          synthesizerRef.current = null;
        }
      );

    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (playerRef.current) {
      playerRef.current.pause();
      setIsSpeaking(false);
    }
    if (synthesizerRef.current) {
      synthesizerRef.current.close();
      synthesizerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (isListening) stopListening();

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          // Pass language context to AI so it replies in same language
          system_prompt_addition: `Reply in ${selectedLang.name}.`
        })
      });

      const data = await res.json();

      if (data.response) {
        const aiResponse = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiResponse]);
        speakText(data.response);
      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error communicating with the AI server.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bot className="w-10 h-10" />
              <h2 className="text-3xl font-bold">Smart AI Assistant</h2>
            </div>
            <p className="text-purple-100">
              Powered by Azure OpenAI & Speech Services. Update your farm data just by talking!
            </p>
          </div>

          {/* Language Selector */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/20">
            <Languages className="w-5 h-5 ml-3 mr-2 text-white/80" />
            <select
              value={selectedLang.code}
              onChange={(e) => {
                const lang = SUPPORTED_LANGUAGES.find(l => l.code === e.target.value);
                if (lang) setSelectedLang(lang);
              }}
              className="bg-transparent text-white border-none outline-none py-2 pr-8 cursor-pointer font-medium"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code} className="text-gray-900">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Messages */}
        <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${message.role === 'user'
                ? 'bg-green-100 dark:bg-green-900/30'
                : 'bg-purple-100 dark:bg-purple-900/30'
                }`}>
                {message.role === 'user' ? (
                  <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                )}
              </div>

              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block rounded-2xl px-5 py-3 shadow-sm ${message.role === 'user'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-100 dark:border-gray-700'
                  }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
                <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 border border-gray-100 dark:border-gray-700 flex items-center">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500 mr-2" />
                <span className="text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
          <div className="flex gap-3">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-3 rounded-xl transition-all duration-300 ${isListening
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-md animate-pulse'
                : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? `Listening (${selectedLang.name})...` : `Type in ${selectedLang.name} or speak...`}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
              disabled={isListening}
            />

            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform active:scale-95"
            >
              <Send className="w-6 h-6" />
            </button>

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="p-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white animate-pulse shadow-md"
                title="Stop speaking"
              >
                <Volume2 className="w-6 h-6" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center font-medium">
            {isListening ? (
              <span className="text-red-500 flex items-center justify-center gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                Listening to {selectedLang.name}...
              </span>
            ) : (
              `Selected Language: ${selectedLang.name}`
            )}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-2">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Try asking:</h3>
        <div className="flex flex-wrap gap-3">
          {[
            'I harvested 500kg of Wheat today',
            'What is the price of Rice in Delhi?',
            'Update my location to Punjab',
            'Do I have any weather alerts?',
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => setInput(action)}
              className="px-4 py-2 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-all text-sm shadow-sm"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
