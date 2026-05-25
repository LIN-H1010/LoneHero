import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useGameContext } from '../../store/GameContext';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { scheduleLocalNotification, cancelNotification } from '../hooks/useNotifications';

export default function BattleScreen() {
  const { level, addGold, addExp, activeHeroTier, ownedPets, activePetId, addBattleStats } = useGameContext();
  const [isFocusing, setIsFocusing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<number | 'infinity'>(25); // 分钟
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [timeElapsed, setTimeElapsed] = useState(0); // 正向计时使用

  // 动画值
  const heroAnim = useRef(new Animated.Value(0)).current;
  const petAnim = useRef(new Animated.Value(0)).current;
  const monsterAnim = useRef(new Animated.Value(0)).current;
  const bgAnim = useRef(new Animated.Value(0)).current; // 添加背景动画，营造呼吸感
  const animLoops = useRef<any[]>([]);

  // 绝对时间戳 (用于修复切后台不计时 Bug)
  const targetEndTime = useRef<number>(0);
  const activeStartTime = useRef<number>(0);
  const notificationId = useRef<string | null>(null);

  // 动画控制
  useEffect(() => {
    if (isFocusing) {
      startCombatAnimation();
    } else {
      stopCombatAnimation();
    }
  }, [isFocusing]);

  // 计时器控制
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isFocusing) {
      if (selectedDuration !== 'infinity' && timeLeft <= 0) {
        handleFocusComplete();
      } else {
        timer = setInterval(() => {
          if (selectedDuration === 'infinity') {
            setTimeElapsed(Math.floor((Date.now() - activeStartTime.current) / 1000));
          } else {
            const remaining = Math.floor((targetEndTime.current - Date.now()) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
          }
        }, 1000);
      }
    }
    return () => clearInterval(timer);
  }, [isFocusing, timeLeft, selectedDuration]);

  const startCombatAnimation = () => {
    stopCombatAnimation();

    const hLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heroAnim, { toValue: 50, duration: 200, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(heroAnim, { toValue: 0, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ])
    );

    // 宠物随动攻击循环 (轻微延迟和不同的浮动)
    const pLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(petAnim, { toValue: 30, duration: 250, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(petAnim, { toValue: 0, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ])
    );

    // 怪物受击循环
    const mLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(monsterAnim, { toValue: 20, duration: 100, easing: Easing.bounce, useNativeDriver: true }),
        Animated.timing(monsterAnim, { toValue: 0, duration: 400, easing: Easing.linear, useNativeDriver: true }),
      ])
    );

    const bLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(bgAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    );

    animLoops.current = [hLoop, pLoop, mLoop, bLoop];
    animLoops.current.forEach(l => l.start());
  };

  const stopCombatAnimation = () => {
    animLoops.current.forEach(l => l.stop());
    animLoops.current = [];
    heroAnim.setValue(0);
    petAnim.setValue(0);
    monsterAnim.setValue(0);
    bgAnim.setValue(0);
  };

  const handleFocusComplete = () => {
    setIsFocusing(false);
    if (notificationId.current) {
      cancelNotification(notificationId.current);
      notificationId.current = null;
    }
    
    let minutesCompleted = 0;
    if (selectedDuration === 'infinity') {
      minutesCompleted = Math.floor(timeElapsed / 60);
      setTimeElapsed(0);
    } else {
      minutesCompleted = selectedDuration;
      setTimeLeft(selectedDuration * 60);
    }

    if (minutesCompleted > 0) {
      const goldReward = minutesCompleted * 2;
      const expReward = minutesCompleted * 4;
      addGold(goldReward);
      addExp(expReward);
      
      let monsterType: 'slime' | 'goblin' | 'dragon' | 'demon' | 'dummy' = 'slime';
      if (selectedDuration === 'infinity') monsterType = 'dummy';
      else if (selectedDuration === 60) monsterType = 'demon';
      else if (selectedDuration === 45) monsterType = 'dragon';
      else if (selectedDuration === 25) monsterType = 'goblin';
      
      addBattleStats(minutesCompleted, monsterType);
      
      alert(`战斗胜利！获得了 ${goldReward} 金币和 ${expReward} 经验！`);
    } else {
      alert("修炼时间太短（不足1分钟），没有获得奖励。");
    }
  };

  const toggleFocus = () => {
    if (isFocusing && selectedDuration === 'infinity') {
      // 主动结算无尽模式
      handleFocusComplete();
    } else if (isFocusing && selectedDuration !== 'infinity') {
      // 倒计时模式放弃，弹出确认框
      Alert.alert(
        "临阵脱逃？",
        "你确定要像个懦夫一样逃跑吗？现在的坚持将全部作废！",
        [
          { text: "我再坚持一下！", style: "cancel" },
          { 
            text: "懦弱地逃跑", 
            style: "destructive", 
            onPress: () => {
              setIsFocusing(false);
              setTimeLeft(selectedDuration * 60);
              setTimeElapsed(0);
              if (notificationId.current) {
                cancelNotification(notificationId.current);
                notificationId.current = null;
              }
              
              // 怪物嘲讽
              let tauntMsg = "";
              if (selectedDuration === 60) tauntMsg = "黑暗魔王冷笑：\n「人类的意志力，果然如纸一般脆弱。」";
              else if (selectedDuration === 45) tauntMsg = "深渊恶龙打了个哈欠：\n「弱小的爬虫，滚回你的被窝去吧。」";
              else if (selectedDuration === 25) tauntMsg = "哥布林发出刺耳的嘲笑：\n「嘎嘎嘎，连我都打不过的废物！」";
              else tauntMsg = "史莱姆鄙视地抖了抖身体：\n「噗叽...就这？我还以为你多厉害呢。」";
              
              setTimeout(() => {
                Alert.alert("怪物发出了嘲讽...", tauntMsg);
              }, 500);
            }
          }
        ]
      );
    } else {
      setIsFocusing(true);
      if (selectedDuration !== 'infinity') {
        setTimeLeft(selectedDuration * 60);
        targetEndTime.current = Date.now() + selectedDuration * 60 * 1000;
        // 注册后台定时推送
        scheduleLocalNotification(
          "🎉 战斗结束！", 
          "你设定的专注打怪时间已完成，快回城领取你的金币和经验奖励！", 
          selectedDuration * 60
        ).then(id => notificationId.current = id);
      } else {
        activeStartTime.current = Date.now();
      }
      setTimeElapsed(0);
    }
  };

  const selectDuration = (minutes: number | 'infinity') => {
    if (isFocusing) return;
    setSelectedDuration(minutes);
    if (minutes === 'infinity') {
      setTimeElapsed(0);
    } else {
      setTimeLeft(minutes * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 根据选择的时长更换怪物
  const getMonsterImage = () => {
    if (selectedDuration === 'infinity') return require('../../../assets/images/dummy.png');
    if (selectedDuration === 60) return require('../../../assets/images/monster_demon.png');
    if (selectedDuration === 45) return require('../../../assets/images/monster_dragon.png');
    if (selectedDuration === 25) return require('../../../assets/images/goblin.png');
    return require('../../../assets/images/slime.png');
  };

  // 英雄图片
  const getHeroImage = () => {
    if (activeHeroTier === 3) return require('../../../assets/images/hero_tier3.png');
    if (activeHeroTier === 2) return require('../../../assets/images/hero_tier2.png');
    return require('../../../assets/images/hero2.png');
  };

  // 宠物图片
  const activePet = ownedPets.find(p => p.id === activePetId);
  const getPetImage = () => {
    if (!activePet) return null;
    if (activePet.type === 'treasure_poring') {
      return activePet.level >= 3 ? require('../../../assets/images/pet_poring_lv3.png') : require('../../../assets/images/pet_poring_lv1.png');
    }
    if (activePet.type === 'scholar_dragon') {
      return activePet.level >= 3 ? require('../../../assets/images/pet_dragon_lv3.png') : require('../../../assets/images/pet_dragon_lv1.png');
    }
    return null;
  };

  const bgColorInterp = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,0,0,0.1)', 'rgba(255,0,0,0.4)'] // 战斗时的红色呼吸遮罩
  });

  return (
    <ImageBackground source={require('../../../assets/images/bg_city2.png')} style={styles.container} resizeMode="cover">
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: isFocusing ? bgColorInterp : 'rgba(0,0,0,0.5)' }]} />

      {/* 顶部状态栏 */}
      <View style={styles.topBar}>
        <View style={styles.healthContainer}>
          <FontAwesome5 name="heart" size={16} color="#e74c3c" solid />
          <View style={styles.healthBarBg}>
            <View style={[styles.healthBarFill, { 
              width: selectedDuration === 'infinity' 
                ? '100%' 
                : `${Math.max(0, (timeLeft / (selectedDuration * 60)) * 100)}%`,
              backgroundColor: selectedDuration === 'infinity' 
                ? '#e74c3c'
                : (timeLeft / (selectedDuration * 60)) > 0.3 ? '#e74c3c' : '#ff6b6b'
            }]} />
          </View>
        </View>
        <View style={styles.timeContainer}>
          {selectedDuration === 'infinity' ? (
            <Ionicons name="infinite-outline" size={20} color="#f1c40f" />
          ) : (
            <Ionicons name="timer-outline" size={20} color="#fff" />
          )}
          <Text style={[styles.timeText, selectedDuration === 'infinity' && {color: '#f1c40f'}]}>
            {formatTime(selectedDuration === 'infinity' ? timeElapsed : timeLeft)}
          </Text>
        </View>
      </View>

      {/* 战斗区域 */}
      <View style={styles.battleArea}>
        {/* 左侧：勇士和宠物 */}
        <View style={styles.heroGroup}>
          <Animated.Image 
            source={getHeroImage()} 
            style={[styles.sprite, { transform: [{ translateX: heroAnim }] }]} 
          />
          {activePet && (
            <Animated.Image 
              source={getPetImage()} 
              style={[styles.petSprite, { transform: [{ translateX: petAnim }] }]} 
            />
          )}
        </View>

        {/* 右侧：怪物（全部预加载，通过 opacity 切换） */}
        <View>
          {[
            { dur: 10, src: require('../../../assets/images/slime.png') },
            { dur: 25, src: require('../../../assets/images/goblin.png') },
            { dur: 45, src: require('../../../assets/images/monster_dragon.png') },
            { dur: 60, src: require('../../../assets/images/monster_demon.png') },
            { dur: 'infinity', src: require('../../../assets/images/dummy.png') },
          ].map((m) => (
            <Animated.Image 
              key={`monster-${m.dur}`}
              source={m.src} 
              style={[
                styles.sprite, 
                { transform: [{ translateX: monsterAnim }], position: 'absolute', right: 0, bottom: 0 },
                selectedDuration !== m.dur && { opacity: 0 }
              ]} 
            />
          ))}
        </View>
      </View>

      {/* 底部控制台 */}
      <View style={styles.console}>
        <Text style={styles.statusText}>
          {isFocusing ? "⚔️ 战斗进行中... 保持专注！" : "💤 勇士正在休息..."}
        </Text>
        
        {!isFocusing && (
          <View style={styles.durationSelector}>
            {[10, 25, 45, 60].map(min => (
              <TouchableOpacity 
                key={min} 
                onPress={() => selectDuration(min)}
              >
                <LinearGradient 
                  colors={selectedDuration === min ? ['#f39c12', '#e67e22'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']} 
                  style={[styles.durationBtn, selectedDuration === min && styles.durationBtnActive]}
                >
                  <Text style={[styles.durationText, selectedDuration === min && {color: '#fff', fontWeight: 'bold'}]}>
                    {min}m
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => selectDuration('infinity')}>
              <LinearGradient 
                colors={selectedDuration === 'infinity' ? ['#f1c40f', '#f39c12'] : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.1)']} 
                style={[styles.durationBtn, selectedDuration === 'infinity' && styles.durationBtnActive]}
              >
                <Text style={[styles.durationText, selectedDuration === 'infinity' && {color: '#fff', fontWeight: 'bold'}]}>
                  ∞ 无尽
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.buttonContainer} onPress={toggleFocus}>
          <LinearGradient 
            colors={isFocusing ? (selectedDuration === 'infinity' ? ['#f39c12', '#d35400'] : ['#e74c3c', '#c0392b']) : ['#2ecc71', '#27ae60']} 
            style={styles.actionButton}
          >
            <Text style={styles.buttonText}>
              {isFocusing ? (selectedDuration === 'infinity' ? "结束修炼 (结算奖励)" : "撤退 (放弃专注)") : "出击 (开始专注)"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },
  healthBarBg: {
    flex: 1,
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    marginLeft: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e74c3c',
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
    backgroundColor: '#e74c3c',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  timeText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontVariant: ['tabular-nums'],
  },
  battleArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 30,
    paddingBottom: 80,
  },
  heroGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  sprite: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  petSprite: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginLeft: -20, // 让宠物紧贴着英雄
    marginBottom: 20, // 稍微漂浮起来
  },
  console: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    padding: 30,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statusText: {
    color: '#ccc',
    fontSize: 16,
    marginBottom: 15,
    fontWeight: '600',
  },
  durationSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  durationBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  durationBtnActive: {
    borderColor: '#f1c40f',
  },
  durationText: {
    color: '#aaa',
    fontSize: 14,
  },
  buttonContainer: {
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 8,
  },
  actionButton: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  }
});
