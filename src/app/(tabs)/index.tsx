import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform, ImageBackground, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useGameContext, Task } from '../../store/GameContext';

export default function CityScreen() {
  const { tasks, addTask, completeTask, deleteTask, level, stats, activeHeroTier, gold, exp } = useGameContext();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isDaily, setIsDaily] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'todo' | 'completed'>('todo');
  const [showStatsModal, setShowStatsModal] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setDeadlineDate(dateStr);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;
    addTask(newTaskTitle, isDaily, isDaily ? undefined : (deadlineDate.trim() || undefined));
    setNewTaskTitle("");
    setDeadlineDate("");
  };

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const today = getTodayStr();

  const isTaskOverdue = (task: Task) => {
    if (task.completed) return false;
    if (task.isDaily && task.createdAt < today) return true;
    if (!task.isDaily && task.deadlineDate && task.deadlineDate < today) return true;
    return false;
  };

  const filteredTasks = tasks.filter(t => activeTab === 'todo' ? !t.completed : t.completed);

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed === b.completed) {
      const aOverdue = isTaskOverdue(a);
      const bOverdue = isTaskOverdue(b);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      return 0;
    }
    return a.completed ? 1 : -1;
  });

  const clearCompleted = () => {
    tasks.filter(t => t.completed).forEach(t => deleteTask(t.id));
  };

  const getCityInfo = () => {
    if (level >= 10) return { name: "天空之城", icon: "cloud" };
    if (level >= 5) return { name: "勇士部落", icon: "fire" };
    return { name: "明珠港", icon: "home" };
  };

  const getCityBgImage = () => {
    if (level >= 10) return require('../../../assets/images/bg_city3.png');
    if (level >= 5) return require('../../../assets/images/bg_city2.png');
    return require('../../../assets/images/bg_city1.png');
  };

  // 英雄图片
  const getHeroImage = () => {
    if (activeHeroTier === 3) return require('../../../assets/images/hero_tier3.png');
    if (activeHeroTier === 2) return require('../../../assets/images/hero_tier2.png');
    return require('../../../assets/images/hero2.png');
  };

  const city = getCityInfo();
  const expMax = level * 100;
  const expPercent = Math.min(100, Math.max(0, (exp / expMax) * 100));

  return (
    <ImageBackground source={getCityBgImage()} style={styles.container} resizeMode="cover">
      <View style={styles.overlay}>
        {/* 英雄身份牌 */}
        <View style={styles.heroProfileCard}>
          <Image source={getHeroImage()} style={styles.heroAvatar} />
          <View style={{flex: 1, marginLeft: 15}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <FontAwesome5 name={city.icon} size={16} color="#f1c40f" />
                <Text style={styles.cityName}>{city.name} (Lv.{level})</Text>
              </View>
              <TouchableOpacity onPress={() => setShowStatsModal(true)}>
                <Ionicons name="trophy" size={24} color="#f1c40f" />
              </TouchableOpacity>
            </View>
            
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8}}>
              <FontAwesome5 name="coins" size={14} color="#f1c40f" />
              <Text style={styles.goldText}>{gold}</Text>
            </View>

            <View style={styles.expBarContainer}>
              <View style={[styles.expBarFill, { width: `${expPercent}%` }]} />
              <Text style={styles.expText}>EXP: {exp} / {expMax}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.subtitle}>冒险者悬赏榜</Text>

      <View style={styles.inputGlassContainer}>
        <View style={{flex: 1}}>
          <TextInput 
            style={styles.input} 
            placeholder="发布新悬赏（例如：背 50 个单词）"
            placeholderTextColor="#888"
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
          />
          <View style={{flexDirection: 'row', marginTop: 12, alignItems: 'center', gap: 15}}>
            <TouchableOpacity onPress={() => setIsDaily(!isDaily)} style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={[styles.checkbox, isDaily && styles.checkboxActive]}>
                {isDaily && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text style={{color: '#ccc', marginLeft: 8, fontSize: 13}}>设为每日日常</Text>
            </TouchableOpacity>
            {!isDaily && (
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInputWrapper}>
                <Ionicons name="calendar-outline" size={14} color={deadlineDate ? '#f1c40f' : '#666'} />
                <Text style={{color: deadlineDate ? '#fff' : '#666', fontSize: 12, marginLeft: 5}}>
                  {deadlineDate ? `死线: ${deadlineDate}` : '死线日期 (可选)'}
                </Text>
              </TouchableOpacity>
            )}
            {showDatePicker && (
              Platform.OS === 'ios' ? (
                <Modal transparent={true} animationType="fade">
                  <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
                    <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={{color: '#3498db', fontSize: 16, fontWeight: 'bold'}}>完成</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={deadlineDate ? new Date(deadlineDate) : new Date()}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                      />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </Modal>
              ) : (
                <DateTimePicker
                  value={deadlineDate ? new Date(deadlineDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )
            )}
          </View>
        </View>
        <TouchableOpacity onPress={handleAddTask}>
          <LinearGradient colors={['#ff416c', '#ff4b2b']} style={styles.addButton}>
            <Ionicons name="add" size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 标签页 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'todo' && styles.tabButtonActive]} onPress={() => setActiveTab('todo')}>
          <Text style={[styles.tabText, activeTab === 'todo' && styles.tabTextActive]}>🔥 悬赏榜</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tabButton, activeTab === 'completed' && styles.tabButtonActive]} onPress={() => setActiveTab('completed')}>
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>📜 功勋簿</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
        {sortedTasks.map((task) => {
          const overdue = isTaskOverdue(task);
          return (
            <View key={task.id} style={[styles.taskCard, task.completed && styles.taskCompleted, overdue && styles.taskOverdueBorder]}>
              <View style={{flex: 1}}>
                <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 5}}>
                  {task.isDaily && <Text style={styles.tagDaily}>[日常]</Text>}
                  {!task.isDaily && task.deadlineDate && <Text style={[styles.tagDeadline, overdue && styles.tagOverdue]}>[死线: {task.deadlineDate}]</Text>}
                  <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted, overdue && !task.completed && {color: '#ff4757'}]}>
                    {task.title}
                  </Text>
                </View>
                {!task.completed && !overdue && (
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 5}}>
                    <FontAwesome5 name="coins" size={10} color="#f39c12" />
                    <Text style={styles.taskReward}>5</Text>
                    <FontAwesome5 name="star" size={10} color="#3498db" style={{marginLeft: 10}} />
                    <Text style={styles.taskReward}>10</Text>
                  </View>
                )}
                {overdue && !task.completed && <Text style={{color: '#ff4757', fontSize: 12, marginTop: 5}}>⚠️ 已逾期！完成无奖励，且每天都会扣钱！</Text>}
              </View>
              
              {!task.completed ? (
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => completeTask(task.id)}>
                    <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.completeBtn}>
                      <Ionicons name="checkmark-done" size={20} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTask(task.id)}>
                    <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  <Ionicons name="medal" size={16} color="#4cd137" />
                  <Text style={{color: '#4cd137', fontWeight: 'bold'}}>已领取</Text>
                </View>
              )}
            </View>
          );
        })}
        {sortedTasks.length === 0 && (
          <View style={{alignItems: 'center', marginTop: 80}}>
            <Ionicons name={activeTab === 'todo' ? "clipboard-outline" : "medal-outline"} size={60} color="#555" />
            <Text style={{color: '#888', textAlign: 'center', marginTop: 15, fontSize: 16}}>
              {activeTab === 'todo' ? "目前没有悬赏任务，给自己安排点事情做吧！" : "暂无已完成的功勋。"}
            </Text>
          </View>
        )}
        
        {activeTab === 'completed' && sortedTasks.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearCompleted}>
            <Ionicons name="flame" size={18} color="#fff" />
            <Text style={{color: '#fff', fontWeight: 'bold', marginLeft: 5}}>一键烧毁已完成契约</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* 生涯战绩 Modal */}
      <Modal visible={showStatsModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.statsModalContent}>
            <View style={styles.modalHeader}>
              <Text style={{fontSize: 20, color: '#fff', fontWeight: 'bold'}}>🏆 生涯战绩</Text>
              <TouchableOpacity onPress={() => setShowStatsModal(false)}>
                <Ionicons name="close" size={24} color="#888" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>⏱️ 累计专注</Text>
                <Text style={styles.statValue}>{stats.totalFocusMinutes} 分钟</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>✅ 完成契约</Text>
                <Text style={styles.statValue}>{stats.tasksCompleted} 个</Text>
              </View>
              
              <Text style={{color: '#f1c40f', fontWeight: 'bold', marginTop: 20, marginBottom: 10}}>🗡️ 怪物讨伐榜</Text>
              <View style={styles.statRow}><Text style={styles.statLabel}>史莱姆 (10m)</Text><Text style={styles.statValue}>{stats.monstersDefeated.slime}</Text></View>
              <View style={styles.statRow}><Text style={styles.statLabel}>哥布林 (25m)</Text><Text style={styles.statValue}>{stats.monstersDefeated.goblin}</Text></View>
              <View style={styles.statRow}><Text style={styles.statLabel}>深渊恶龙 (45m)</Text><Text style={styles.statValue}>{stats.monstersDefeated.dragon}</Text></View>
              <View style={styles.statRow}><Text style={styles.statLabel}>黑暗魔王 (60m)</Text><Text style={styles.statValue}>{stats.monstersDefeated.demon}</Text></View>
              <View style={styles.statRow}><Text style={styles.statLabel}>修炼木桩 (无尽)</Text><Text style={styles.statValue}>{stats.monstersDefeated.dummy}</Text></View>

              <Text style={{color: '#3498db', fontWeight: 'bold', marginTop: 20, marginBottom: 10}}>🎖️ 成就徽章</Text>
              <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10}}>
                {stats.tasksCompleted >= 1 && <Text style={styles.badge}>🔰 初级猎人</Text>}
                {stats.tasksCompleted >= 10 && <Text style={styles.badge}>⚔️ 资深猎人</Text>}
                {stats.totalFocusMinutes >= 60 && <Text style={styles.badge}>🔥 渐入佳境</Text>}
                {stats.monstersDefeated.dragon > 0 && <Text style={styles.badge}>🐉 屠龙勇士</Text>}
                {stats.monstersDefeated.demon > 0 && <Text style={styles.badge}>👑 魔王终结者</Text>}
                {stats.totalFocusMinutes === 0 && <Text style={{color: '#666'}}>尚未解锁任何徽章</Text>}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)', // 深色遮罩保证可读性
    padding: 20,
    paddingTop: 50,
  },
  heroProfileCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 20, 10, 0.85)', // 深木色质感
    borderRadius: 15,
    padding: 15,
    borderWidth: 2,
    borderColor: '#d4af37', // 暗金边框
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroAvatar: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#f1c40f',
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cityName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  goldText: {
    color: '#f1c40f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  expBarContainer: {
    marginTop: 6,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#555',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  expBarFill: {
    height: '100%',
    backgroundColor: '#3498db',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  expText: {
    color: '#fff',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  subtitle: {
    color: '#f39c12',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    marginLeft: 5,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputGlassContainer: {
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  input: {
    color: '#fff',
    fontSize: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#d4af37',
    borderColor: '#d4af37',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    alignItems: 'center',
  },
  addButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 15,
    shadowColor: "#ff416c",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#555',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)', // 暗金背景
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#f1c40f',
  },
  taskList: {
    flex: 1,
  },
  taskCard: {
    backgroundColor: 'rgba(40, 30, 20, 0.95)', // 深木色悬赏单
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 6,
    borderLeftColor: '#d4af37', // 金边
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  taskCompleted: {
    borderLeftColor: '#7f8c8d',
    opacity: 0.7,
  },
  taskOverdueBorder: {
    borderLeftColor: '#c0392b',
    backgroundColor: 'rgba(40, 20, 20, 0.95)',
    borderColor: 'rgba(255, 71, 87, 0.5)',
  },
  tagDaily: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    color: '#f1c40f',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: 'bold',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  tagDeadline: {
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    color: '#f39c12',
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: 'bold',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(243, 156, 18, 0.5)',
  },
  tagOverdue: {
    backgroundColor: 'rgba(255, 71, 87, 0.2)',
    color: '#ff4757',
    borderColor: 'rgba(255, 71, 87, 0.5)',
  },
  taskTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#7f8c8d',
  },
  taskReward: {
    color: '#ecf0f1',
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  completeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#d4af37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteBtn: {
    padding: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
    marginTop: 'auto',
  },
  statsModalContent: {
    backgroundColor: '#1e272e',
    borderRadius: 20,
    padding: 25,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 15,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    color: '#bdc3c7',
    fontSize: 16,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: 'rgba(243, 156, 18, 0.2)',
    color: '#f39c12',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(243, 156, 18, 0.5)',
    fontWeight: 'bold',
    fontSize: 13,
  },
  clearBtn: {
    flexDirection: 'row',
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  }
});
