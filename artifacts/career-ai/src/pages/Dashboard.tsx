import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Trophy, Swords, Star, BookOpen, BarChart2, Clock, CheckCircle, XCircle, Flame, Skull, GraduationCap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getAvatar } from "@/lib/avatars";

interface LeaderboardEntry { id: number; username: string; avatarId: number; points: number; careerField: string | null; }
interface QuizResult { id: number; careerField: string; score: number; total: number; type: string; createdAt: string; }
interface ActivityData { quizHistory: QuizResult[]; wins: number; losses: number; milestonesCompleted: number; }

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className={`glass rounded-2xl p-5 border ${color}`}>
      <div className="flex items-center gap-3">
        <div className="opacity-80">{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-white font-display">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activity, setActivity] = useState<ActivityData>({ quizHistory: [], wins: 0, losses: 0, milestonesCompleted: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) { setLocation("/login"); return; }
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("/api/progress/leaderboard").then(r => r.json()),
      fetch("/api/progress/activity", { headers }).then(r => r.json()),
    ]).then(([lb, act]) => {
      setLeaderboard(lb);
      setActivity(act);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [user, token, setLocation]);

  if (!user) return null;

  const userRank = leaderboard.findIndex(u => u.id === user.id) + 1;
  const avatar = getAvatar(user.avatarId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6 border border-white/10 mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${avatar.bg} flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(168,85,247,0.4)] border-2 border-white/20 flex-shrink-0`}>
            {avatar.emoji}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold font-display text-white">{user.username}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            {user.careerField && <p className="text-primary text-sm mt-1">🎯 {user.careerField}</p>}
          </div>
          <div className="flex gap-4">
            <Link href="/profile">
              <Button variant="outline" className="rounded-xl border-white/10 hover:bg-white/5">Edit Profile</Button>
            </Link>
            <Link href="/battle">
              <Button className="rounded-xl gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                <Swords className="w-4 h-4" /> Battle Now
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={<Star className="w-7 h-7 text-yellow-400" />} label="Total Points" value={user.points.toLocaleString()} color="border-yellow-500/20" />
          <StatCard icon={<Trophy className="w-7 h-7 text-purple-400" />} label="Global Rank" value={userRank ? `#${userRank}` : "—"} color="border-purple-500/20" />
          <StatCard icon={<Flame className="w-7 h-7 text-green-400" />} label="Battle Wins" value={activity.wins} color="border-green-500/20" />
          <StatCard icon={<Skull className="w-7 h-7 text-red-400" />} label="Battle Losses" value={activity.losses} color="border-red-500/20" />
          <StatCard icon={<GraduationCap className="w-7 h-7 text-cyan-400" />} label="Milestones Done" value={activity.milestonesCompleted} color="border-cyan-500/20" />
          <StatCard icon={<BookOpen className="w-7 h-7 text-orange-400" />} label="Quizzes Taken" value={activity.quizHistory?.length ?? 0} color="border-orange-500/20" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="md:col-span-2">
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" /> Recent Activity
              </h2>
              {isLoading ? (
                <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)}</div>
              ) : activity.quizHistory?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No activity yet. Start a battle or take a quiz!</p>
                  <Link href="/battle"><Button className="mt-4 rounded-xl" size="sm">Start First Battle</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activity.quizHistory?.slice(0, 8).map((q, i) => {
                    const pct = Math.round((q.score / q.total) * 100);
                    const passed = pct >= 60;
                    return (
                      <motion.div key={q.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
                      >
                        {passed ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-200 truncate">{q.careerField}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(q.createdAt).toLocaleDateString()}
                            {q.type === "battle" && <span className="ml-2 text-purple-400">⚔ Battle</span>}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-sm font-bold ${passed ? "text-green-400" : "text-red-400"}`}>{q.score}/{q.total}</p>
                          <p className="text-xs text-muted-foreground">{pct}%</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="glass rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" /> Leaderboard
            </h2>
            {isLoading ? (
              <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}</div>
            ) : (
              <div className="space-y-2">
                {leaderboard.slice(0, 10).map((u, i) => {
                  const av = getAvatar(u.avatarId);
                  const isMe = u.id === user.id;
                  return (
                    <div key={u.id} className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${isMe ? "bg-primary/20 border border-primary/30" : "hover:bg-white/5"}`}>
                      <span className={`text-sm font-bold w-5 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${av.bg} flex items-center justify-center text-base flex-shrink-0`}>
                        {av.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isMe ? "text-primary" : "text-gray-200"}`}>{u.username}{isMe && " (you)"}</p>
                        {u.careerField && <p className="text-[10px] text-muted-foreground truncate">{u.careerField}</p>}
                      </div>
                      <span className="text-xs font-bold text-yellow-400">{u.points}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
