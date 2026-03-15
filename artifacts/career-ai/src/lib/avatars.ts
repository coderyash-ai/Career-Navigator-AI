export interface AvatarDef {
  id: number;
  emoji: string;
  bg: string;
  name: string;
}

export const AVATARS: AvatarDef[] = [
  { id: 0,  emoji: "🐱", bg: "from-orange-400 to-pink-500",    name: "Cat" },
  { id: 1,  emoji: "🐶", bg: "from-yellow-400 to-orange-500",  name: "Dog" },
  { id: 2,  emoji: "🦊", bg: "from-red-400 to-orange-600",     name: "Fox" },
  { id: 3,  emoji: "🐸", bg: "from-green-400 to-emerald-600",  name: "Frog" },
  { id: 4,  emoji: "🐼", bg: "from-gray-300 to-gray-500",      name: "Panda" },
  { id: 5,  emoji: "🦁", bg: "from-yellow-500 to-amber-600",   name: "Lion" },
  { id: 6,  emoji: "🐯", bg: "from-orange-500 to-yellow-600",  name: "Tiger" },
  { id: 7,  emoji: "🐻", bg: "from-amber-600 to-brown-700",    name: "Bear" },
  { id: 8,  emoji: "🦄", bg: "from-purple-400 to-pink-500",    name: "Unicorn" },
  { id: 9,  emoji: "🐺", bg: "from-gray-400 to-slate-600",     name: "Wolf" },
  { id: 10, emoji: "🦅", bg: "from-blue-500 to-indigo-600",    name: "Eagle" },
  { id: 11, emoji: "🐉", bg: "from-emerald-500 to-teal-700",   name: "Dragon" },
  { id: 12, emoji: "🦋", bg: "from-violet-400 to-purple-600",  name: "Butterfly" },
  { id: 13, emoji: "🦚", bg: "from-teal-400 to-cyan-600",      name: "Peacock" },
  { id: 14, emoji: "🦜", bg: "from-green-500 to-lime-600",     name: "Parrot" },
  { id: 15, emoji: "🐬", bg: "from-cyan-400 to-blue-500",      name: "Dolphin" },
  { id: 16, emoji: "🦈", bg: "from-blue-600 to-slate-700",     name: "Shark" },
  { id: 17, emoji: "🐙", bg: "from-pink-500 to-rose-600",      name: "Octopus" },
  { id: 18, emoji: "🦊", bg: "from-violet-500 to-indigo-600",  name: "Space Fox" },
  { id: 19, emoji: "🤖", bg: "from-cyan-500 to-blue-700",      name: "Robot" },
  { id: 20, emoji: "👾", bg: "from-purple-500 to-violet-700",  name: "Alien" },
  { id: 21, emoji: "🧙", bg: "from-indigo-500 to-purple-700",  name: "Wizard" },
  { id: 22, emoji: "🦸", bg: "from-red-500 to-orange-600",     name: "Hero" },
  { id: 23, emoji: "🥷",  bg: "from-gray-700 to-slate-900",     name: "Ninja" },
];

export function getAvatar(id: number): AvatarDef {
  return AVATARS[id % AVATARS.length] ?? AVATARS[0];
}
