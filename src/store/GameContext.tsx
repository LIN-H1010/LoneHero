import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  isDaily: boolean;
  deadlineDate?: string; // YYYY-MM-DD
  createdAt: string;     // YYYY-MM-DD
};

export type PetType = 'treasure_poring' | 'scholar_dragon';

export type Pet = {
  id: string;
  type: PetType;
  name: string;
  level: number;
  exp: number;
};

export type Stats = {
  totalFocusMinutes: number;
  monstersDefeated: { slime: number; goblin: number; dragon: number; demon: number; dummy: number };
  tasksCompleted: number;
};

type GameContextType = {
  gold: number;
  exp: number;
  level: number;
  tasks: Task[];
  ownedHeroTiers: number[];
  activeHeroTier: number;
  ownedPets: Pet[];
  activePetId: string | null;
  stats: Stats;
  addGold: (amount: number) => void;
  addExp: (amount: number) => void;
  addTask: (title: string, isDaily: boolean, deadlineDate?: string) => void;
  completeTask: (id: string) => void;
  deleteTask: (id: string) => void;
  buyHeroUpgrade: (tier: number, cost: number) => void;
  buyPet: (type: PetType, name: string, cost: number) => void;
  setActivePet: (id: string | null) => void;
  setActiveHeroTier: (tier: number) => void;
  addBattleStats: (minutes: number, monsterType: keyof Stats['monstersDefeated']) => void;
  clearData: () => void;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

const getTodayStr = () => new Date().toISOString().split('T')[0];

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gold, setGold] = useState(0);
  const [exp, setExp] = useState(0);
  const [level, setLevel] = useState(1);
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: '喝一杯水', completed: false, isDaily: true, createdAt: getTodayStr() }
  ]);
  const [ownedHeroTiers, setOwnedHeroTiers] = useState<number[]>([1]); 
  const [activeHeroTier, setActiveHeroTier] = useState<number>(1);
  const [ownedPets, setOwnedPets] = useState<Pet[]>([]);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalFocusMinutes: 0,
    monstersDefeated: { slime: 0, goblin: 0, dragon: 0, demon: 0, dummy: 0 },
    tasksCompleted: 0
  });
  
  const [lastCheckDate, setLastCheckDate] = useState<string>(getTodayStr());
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. 从 AsyncStorage 读取存档
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('lonehero_save_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.gold !== undefined) setGold(parsed.gold);
          if (parsed.exp !== undefined) setExp(parsed.exp);
          if (parsed.level !== undefined) setLevel(parsed.level);
          if (parsed.tasks !== undefined) setTasks(parsed.tasks);
          if (parsed.ownedHeroTiers !== undefined) setOwnedHeroTiers(parsed.ownedHeroTiers);
          if (parsed.activeHeroTier !== undefined) setActiveHeroTier(parsed.activeHeroTier);
          if (parsed.ownedPets !== undefined) setOwnedPets(parsed.ownedPets);
          if (parsed.activePetId !== undefined) setActivePetId(parsed.activePetId);
          if (parsed.lastCheckDate !== undefined) setLastCheckDate(parsed.lastCheckDate);
          if (parsed.stats !== undefined) setStats(parsed.stats);
        }
      } catch (e) {
        console.log('No save data or error loading', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // 2. 静默写入 AsyncStorage
  useEffect(() => {
    if (!isLoaded) return;
    const saveData = async () => {
      const dataToSave = { gold, exp, level, tasks, ownedHeroTiers, activeHeroTier, ownedPets, activePetId, lastCheckDate, stats };
      await AsyncStorage.setItem('lonehero_save_data', JSON.stringify(dataToSave));
    };
    saveData();
  }, [gold, exp, level, tasks, ownedHeroTiers, activeHeroTier, ownedPets, activePetId, lastCheckDate, stats, isLoaded]);

  // 调度哥布林晚间查岗推送 (每当 tasks 发生变化时，如果存在未完成的任务，就注册今晚 20:00 的推送)
  useEffect(() => {
    const setupDailyReminder = async () => {
      // 先取消旧的定时器，避免重复注册
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      const hasUncompleted = tasks.some(t => !t.completed);
      if (hasUncompleted) {
        // 注册每天晚上 20:00 的重复推送
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🚨 哥布林大军正在靠近！",
            body: "你今天还有悬赏任务未完成，如果不做，明天会被抢走金币哦！",
            sound: true,
          },
          trigger: {
            hour: 20,
            minute: 0,
            repeats: true,
          },
        });
      }
    };
    if (isLoaded) {
      setupDailyReminder();
    }
  }, [tasks, isLoaded]);

  // 惩罚与刷新机制
  useEffect(() => {
    if (!isLoaded) return;
    const today = getTodayStr();
    if (today > lastCheckDate) {
      let penalty = 0;
      let failedTasksCount = 0;

      setTasks(prev => prev.map(task => {
        if (!task.completed) {
          // 判断是否逾期：
          // 日常任务，如果是在昨天及以前创建的，且没完成，就是违约。
          // 死线任务，如果今天 > deadlineDate，且没完成，也是违约。
          let isOverdue = false;
          if (task.isDaily && task.createdAt < today) {
            isOverdue = true;
          } else if (!task.isDaily && task.deadlineDate && task.deadlineDate < today) {
            // 普通任务每天都会被检查，如果已经惩罚过需要标记以免重复惩罚？
            // 简单起见，只要没做完且超期，每天登录都要被惩罚一次！极其硬核。
            isOverdue = true;
          }

          if (isOverdue) {
            // 根据要求，这里原本扣10金币，现在改为扣5金币
            penalty += 5;
            failedTasksCount++;
            if (task.isDaily) {
              // 日常任务违约后，刷新它为今天的任务继续做
              return { ...task, createdAt: today };
            }
          }
        } else {
          // 已完成的任务
          if (task.isDaily && task.createdAt < today) {
            // 日常任务第二天刷新为未完成
            return { ...task, completed: false, createdAt: today };
          }
        }
        return task;
      }));

      if (failedTasksCount > 0) {
        setGold(prev => prev - penalty);
        Alert.alert(
          "🚨 哥布林突袭查岗 🚨", 
          `昨天你有 ${failedTasksCount} 个任务违约！\n哥布林洗劫了你的钱包，抢走了 ${penalty} 金币！\n快去把逾期的任务补上！`
        );
      }

      setLastCheckDate(today);
    }
  }, [lastCheckDate]);

  // 宠物获得经验逻辑
  const addPetExp = (amount: number) => {
    if (!activePetId) return;
    setOwnedPets(prev => prev.map(pet => {
      if (pet.id === activePetId) {
        let newExp = pet.exp + amount;
        let newLevel = pet.level;
        // 宠物升级逻辑：硬核模式下大幅提高升级难度
        // 1级->2级需要 150 经验；2级->3级需要 (500 - 150 = 350) 经验
        while (newLevel === 1 && newExp >= 150) {
          newLevel = 2;
        }
        while (newLevel === 2 && newExp >= 500) {
          newLevel = 3;
        }
        return { ...pet, exp: newExp, level: newLevel };
      }
      return pet;
    }));
  };

  const addGold = (amount: number) => {
    let finalAmount = amount;
    const activePet = ownedPets.find(p => p.id === activePetId);
    if (activePet && activePet.type === 'treasure_poring') {
      const buffMultiplier = activePet.level === 3 ? 0.05 : 0.02;
      finalAmount += Math.max(1, Math.floor(amount * buffMultiplier));
    }
    setGold((prev) => prev + finalAmount);
  };
  
  const addExp = (amount: number) => {
    let finalAmount = amount;
    const activePet = ownedPets.find(p => p.id === activePetId);
    if (activePet && activePet.type === 'scholar_dragon') {
      const buffMultiplier = activePet.level === 3 ? 0.05 : 0.02;
      finalAmount += Math.max(1, Math.floor(amount * buffMultiplier));
    }

    setExp((prev) => {
      const newExp = prev + finalAmount;
      if (newExp >= 100 * level) {
        setLevel((l) => l + 1);
        return newExp - (100 * level);
      }
      return newExp;
    });
    // 同时也给宠物经验
    addPetExp(amount);
  };

  const addTask = (title: string, isDaily: boolean, deadlineDate?: string) => {
    setTasks((prev) => [
      ...prev, 
      { id: Date.now().toString(), title, completed: false, isDaily, deadlineDate, createdAt: getTodayStr() }
    ]);
  };
  
  const completeTask = (id: string) => {
    const today = getTodayStr();
    let isOverdue = false;
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (task.isDaily && task.createdAt < today) isOverdue = true;
      if (!task.isDaily && task.deadlineDate && task.deadlineDate < today) isOverdue = true;
    }

    setTasks((prev) => prev.map(t => t.id === id ? { ...t, completed: true } : t));
    
    // 逾期的任务不给奖励
    if (!isOverdue) {
      addGold(2);
      addExp(5);
    }
    
    setStats(prev => ({ ...prev, tasksCompleted: prev.tasksCompleted + 1 }));
  };

  const addBattleStats = (minutes: number, monsterType: keyof Stats['monstersDefeated']) => {
    setStats(prev => ({
      ...prev,
      totalFocusMinutes: prev.totalFocusMinutes + minutes,
      monstersDefeated: {
        ...prev.monstersDefeated,
        [monsterType]: prev.monstersDefeated[monsterType] + 1
      }
    }));
  };

  const deleteTask = (id: string) => setTasks((prev) => prev.filter(t => t.id !== id));

  const buyHeroUpgrade = (tier: number, cost: number) => {
    if (gold >= cost && !ownedHeroTiers.includes(tier)) {
      setGold(prev => prev - cost);
      setOwnedHeroTiers(prev => [...prev, tier]);
      setActiveHeroTier(tier);
    }
  };

  const buyPet = (type: PetType, name: string, cost: number) => {
    if (gold >= cost) {
      setGold(prev => prev - cost);
      const newPet = { id: Date.now().toString(), type, name, level: 1, exp: 0 };
      setOwnedPets(prev => [...prev, newPet]);
      if (!activePetId) setActivePetId(newPet.id);
    }
  };

  const setActivePet = (id: string | null) => setActivePetId(id);

  const clearData = async () => {
    setGold(0);
    setExp(0);
    setLevel(1);
    setTasks([{ id: Date.now().toString(), title: '喝一杯水', completed: false, isDaily: true, createdAt: getTodayStr() }]);
    setOwnedHeroTiers([1]);
    setActiveHeroTier(1);
    setOwnedPets([]);
    setActivePetId(null);
    setStats({ totalFocusMinutes: 0, monstersDefeated: { slime: 0, goblin: 0, dragon: 0, demon: 0, dummy: 0 }, tasksCompleted: 0 });
    setLastCheckDate(getTodayStr());
    await AsyncStorage.removeItem('lonehero_save_data');
    alert("存档已清空！");
  };

  if (!isLoaded) return null; // 或者返回一个加载动画

  return (
    <GameContext.Provider value={{ gold, exp, level, tasks, ownedHeroTiers, activeHeroTier, ownedPets, activePetId, stats, addGold, addExp, addTask, completeTask, deleteTask, buyHeroUpgrade, buyPet, setActivePet, setActiveHeroTier, addBattleStats, clearData }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGameContext must be used within GameProvider");
  return context;
};
