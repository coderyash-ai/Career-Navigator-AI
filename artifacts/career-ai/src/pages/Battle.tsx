import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Swords, Trophy, Clock, Loader2, CheckCircle, XCircle, Star, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "@/context/AuthContext";
import { getAvatar } from "@/lib/avatars";
import { io as socketIo, type Socket } from "socket.io-client";

const CAREER_FIELDS = ["Machine Learning", "Web Development", "Data Science", "Cybersecurity", "Cloud Computing", "UX Design", "DevOps", "Blockchain", "Game Development", "Mobile Development"];
const QUESTION_TIME = 20;

type Phase = "setup" | "waiting" | "active" | "finished";

interface Question { question: string; options: string[]; correctAnswer: string; explanation: string; }
interface BattleData { id: number; player1Id: number; player2Id: number | null; careerField: string; status: string; questions?: Question[]; player1Score: number; player2Score: number; winnerId: number | null; }

export default function Battle() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<Phase>("setup");
  const [careerField, setCareerField] = useState(CAREER_FIELDS[0]);
  const [battle, setBattle] = useState<BattleData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ correct: boolean; answer: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { if (!user || !token) setLocation("/login"); }, [user, token, setLocation]);

  useEffect(() => {
    if (phase !== "active") return;
    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { handleAnswer("timeout"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentQ, phase]);

  const startBattle = async () => {
    setError("");
    setPhase("waiting");
    try {
      const res = await fetch("/api/battle/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ careerField }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBattle(data.battle);

      const socket = socketIo({ transports: ["websocket", "polling"] });
      socketRef.current = socket;
      socket.emit("join-battle", data.battle.id);

      if (data.role === "player2" && data.questions) {
        setQuestions(data.questions);
        setBattle(data.battle);
        setPhase("active");
        return;
      }

      socket.on("battle-start", ({ battle: b, questions: qs }: { battle: BattleData; questions: Question[] }) => {
        setBattle(b);
        setQuestions(qs);
        setPhase("active");
        if (pollRef.current) clearInterval(pollRef.current);
      });

      socket.on("answer-submitted", ({ userId }: { userId: number }) => {
        if (userId !== user!.id) setOpponentProgress(p => p + 1);
      });

      socket.on("battle-end", ({ battle: b }: { battle: BattleData }) => {
        setBattle(b);
        setPhase("finished");
      });

      pollRef.current = setInterval(async () => {
        const r = await fetch(`/api/battle/${data.battle.id}/status`, { headers: { Authorization: `Bearer ${token}` } });
        const b = await r.json();
        if (b?.status === "active" && b.questions) {
          setQuestions(b.questions as Question[]);
          setBattle(b);
          setPhase("active");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      }, 2000);
    } catch (err: any) {
      setError(err.message);
      setPhase("setup");
    }
  };

  const handleAnswer = useCallback(async (answer: string) => {
    if (selectedAnswer || isSubmitting || !battle || phase !== "active") return;
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);
    const ans = answer === "timeout" ? "" : answer;
    setSelectedAnswer(ans || "timeout");

    try {
      const res = await fetch(`/api/battle/${battle.id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ questionIndex: currentQ, answer: ans, timeTaken: QUESTION_TIME - timeLeft }),
      });
      const data = await res.json();
      const correct = data.isCorrect ?? false;
      setAnswers(prev => [...prev, { correct, answer: ans }]);

      if (data.done && data.battle) {
        setBattle(data.battle);
        setTimeout(() => { setPhase("finished"); }, 1200);
      } else {
        setTimeout(() => {
          setSelectedAnswer(null);
          setCurrentQ(q => q + 1);
          setIsSubmitting(false);
        }, 1200);
      }
    } catch {
      setIsSubmitting(false);
    }
  }, [selectedAnswer, isSubmitting, battle, phase, currentQ, token, timeLeft]);

  useEffect(() => () => {
    socketRef.current?.disconnect();
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  if (!user) return null;
  const avatar = getAvatar(user.avatarId);
  const myScore = answers.filter(a => a.correct).length;
  const isWinner = battle?.winnerId === user.id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {phase === "setup" && (
            <motion.div key="setup" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-4xl mx-auto mb-4 shadow-[0_0_40px_rgba(168,85,247,0.5)]">⚔️</div>
                <h1 className="text-4xl font-bold font-display text-white">Battle Arena</h1>
                <p className="text-muted-foreground mt-2">Challenge another learner. Win points. Climb the leaderboard.</p>
              </div>
              <div className="glass rounded-2xl p-8 border border-white/10 space-y-6">
                <div>
                  <label className="text-sm text-gray-300 font-medium mb-3 block">Choose your battlefield</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {CAREER_FIELDS.map(f => (
                      <button key={f} onClick={() => setCareerField(f)}
                        className={`p-3 rounded-xl text-sm font-medium text-left transition-all border ${careerField === f ? "bg-primary/20 border-primary/50 text-primary" : "border-white/10 text-gray-300 hover:bg-white/5"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-yellow-300 text-sm font-medium">🏆 Battle Stakes</p>
                  <p className="text-gray-400 text-sm mt-1">Winner earns <span className="text-green-400 font-bold">+75 points</span> · Loser loses <span className="text-red-400 font-bold">-38 points</span></p>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button onClick={startBattle} className="w-full rounded-xl h-12 gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] font-semibold">
                  <Swords className="w-5 h-5" /> Find Opponent in {careerField}
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "waiting" && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-24">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(168,85,247,0.4)]`}>{avatar.emoji}</div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                </div>
              </div>
              <h2 className="text-2xl font-bold font-display text-white">Searching for opponent...</h2>
              <p className="text-muted-foreground mt-2">Field: <span className="text-primary font-medium">{careerField}</span></p>
              <p className="text-muted-foreground text-sm mt-1">Waiting for another player to join. This may take a moment.</p>
              <Button onClick={() => { socketRef.current?.disconnect(); if (pollRef.current) clearInterval(pollRef.current); setPhase("setup"); }} variant="outline" className="mt-8 rounded-xl border-white/10">
                Cancel
              </Button>
            </motion.div>
          )}

          {phase === "active" && questions[currentQ] && (
            <motion.div key={`question-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-xl`}>{avatar.emoji}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.username}</p>
                    <p className="text-xs text-green-400">{myScore} correct</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold font-display ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-white"}`}>{timeLeft}s</div>
                  <p className="text-xs text-muted-foreground">Q {currentQ + 1}/{questions.length}</p>
                </div>
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className="w-10 h-10 rounded-xl bg-gray-700 flex items-center justify-center text-xl">👤</div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">Opponent</p>
                    <p className="text-xs text-green-400">{opponentProgress} answered</p>
                  </div>
                </div>
              </div>

              <div className="w-full bg-white/10 rounded-full h-1 mb-6">
                <div className="bg-primary h-1 rounded-full transition-all duration-1000" style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }} />
              </div>

              <div className="glass rounded-2xl p-6 border border-white/10 mb-4">
                <p className="text-lg font-medium text-white leading-relaxed">{questions[currentQ].question}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {questions[currentQ].options.map((opt, i) => {
                  const letter = opt[0];
                  const isSelected = selectedAnswer === letter;
                  const q = questions[currentQ];
                  const isCorrect = letter === q.correctAnswer;
                  const showResult = selectedAnswer !== null;
                  return (
                    <motion.button key={i} whileHover={!selectedAnswer ? { scale: 1.02 } : {}} whileTap={!selectedAnswer ? { scale: 0.98 } : {}}
                      onClick={() => handleAnswer(letter)} disabled={!!selectedAnswer || isSubmitting}
                      className={`p-4 rounded-xl text-left font-medium text-sm transition-all border ${
                        showResult
                          ? isCorrect ? "bg-green-500/30 border-green-500/60 text-green-300" : isSelected ? "bg-red-500/30 border-red-500/60 text-red-300" : "bg-white/5 border-white/10 text-gray-500"
                          : "bg-white/5 border-white/10 text-gray-200 hover:bg-primary/20 hover:border-primary/40"
                      }`}
                    >
                      {opt}
                    </motion.button>
                  );
                })}
              </div>

              {selectedAnswer && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-sm text-gray-300">{questions[currentQ].explanation}</p>
                </motion.div>
              )}
            </motion.div>
          )}

          {phase === "finished" && battle && (
            <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="text-8xl mb-4">{battle.winnerId === null ? "🤝" : isWinner ? "🏆" : "😤"}</div>
              <h2 className="text-4xl font-bold font-display text-white mb-2">
                {battle.winnerId === null ? "It's a Draw!" : isWinner ? "Victory!" : "Defeat!"}
              </h2>
              <p className={`text-lg font-medium mb-6 ${battle.winnerId === null ? "text-gray-300" : isWinner ? "text-green-400" : "text-red-400"}`}>
                {battle.winnerId === null ? "Great battle!" : isWinner ? `+75 points earned!` : `-38 points lost. Keep learning!`}
              </p>
              <div className="glass rounded-2xl p-6 border border-white/10 mb-8">
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-3xl mx-auto mb-2`}>{avatar.emoji}</div>
                    <p className="text-sm text-white font-medium">{user.username}</p>
                    <p className="text-3xl font-bold text-white">{battle.player1Id === user.id ? battle.player1Score : battle.player2Score}</p>
                  </div>
                  <div className="text-4xl font-black text-muted-foreground">VS</div>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center text-3xl mx-auto mb-2">👤</div>
                    <p className="text-sm text-white font-medium">Opponent</p>
                    <p className="text-3xl font-bold text-white">{battle.player1Id === user.id ? battle.player2Score : battle.player1Score}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => { setBattle(null); setPhase("setup"); setAnswers([]); setCurrentQ(0); setOpponentProgress(0); }} className="rounded-xl gap-2">
                  <Swords className="w-4 h-4" /> Battle Again
                </Button>
                <Button onClick={() => setLocation("/dashboard")} variant="outline" className="rounded-xl border-white/10 gap-2">
                  <Trophy className="w-4 h-4" /> View Dashboard
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
