import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, ImageBackground } from 'react-native';
import { useGameContext, Pet } from '../../store/GameContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function InventoryScreen() {
  const { gold, exp, level, ownedHeroTiers, activeHeroTier, ownedPets, activePetId, buyHeroUpgrade, buyPet, setActivePet, setActiveHeroTier, clearData } = useGameContext();

  const handleBuyHero2 = () => {
    if (level < 2) {
      Alert.alert("等级不足！", "需要达到 Lv.2 才能转职圣骑士。");
      return;
    }
    if (gold < 500) {
      Alert.alert("金币不足！", "转职需要 500 金币。");
      return;
    }
    buyHeroUpgrade(2, 500);
    Alert.alert("转职成功！", "你已解锁【圣骑士】！");
  };

  const handleBuyHero3 = () => {
    if (level < 5) {
      Alert.alert("等级不足！", "需要达到 Lv.5 才能转职暗影刺客。");
      return;
    }
    if (gold < 1500) {
      Alert.alert("金币不足！", "转职需要 1500 金币。");
      return;
    }
    buyHeroUpgrade(3, 1500);
    Alert.alert("转职成功！", "你已解锁终极形态【暗影刺客】！");
  };

  const handleBuyPetPoring = () => {
    if (gold < 300) {
      Alert.alert("金币不足！", "购买宠物蛋需要 300 金币。");
      return;
    }
    buyPet('treasure_poring', '寻宝波利', 300);
    Alert.alert("购买成功！", "获得了新宠物：寻宝波利！");
  };

  const handleBuyPetDragon = () => {
    if (level < 3) {
      Alert.alert("等级不足！", "需要达到 Lv.3 才能购买学霸飞龙蛋。");
      return;
    }
    if (gold < 500) {
      Alert.alert("金币不足！", "购买宠物蛋需要 500 金币。");
      return;
    }
    buyPet('scholar_dragon', '学霸飞龙', 500);
    Alert.alert("购买成功！", "获得了新宠物：学霸飞龙！");
  };

  const getPetBuffText = (pet: Pet) => {
    if (pet.type === 'treasure_poring') {
      return pet.level >= 3 ? "👑 金币加成: +5%" : "✨ 金币加成: +2%";
    }
    if (pet.type === 'scholar_dragon') {
      return pet.level >= 3 ? "👑 经验加成: +5%" : "✨ 经验加成: +2%";
    }
    return "";
  };

  return (
    <ImageBackground source={require('../../../assets/images/bg_city1.png')} style={styles.container} resizeMode="cover">
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.65)' }]} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <FontAwesome5 name="user-shield" size={28} color="#e94560" />
            <Text style={styles.title}>个人面板与商店</Text>
          </View>
          <TouchableOpacity onPress={() => {
            Alert.alert(
              "清空存档",
              "确定要重置所有测试数据吗？",
              [
                { text: "取消", style: "cancel" },
                { text: "确定清空", style: "destructive", onPress: clearData }
              ]
            );
          }}>
            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>

        {/* 状态卡片 */}
        <LinearGradient colors={['rgba(22,33,62,0.9)', 'rgba(15,52,96,0.9)']} style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', width: 110}}>
              <FontAwesome5 name="medal" size={16} color="#f1c40f" />
              <Text style={styles.statLabel}> 勇士等级：</Text>
            </View>
            <Text style={styles.statValue}>Lv. {level}</Text>
          </View>
          
          <View style={styles.statRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', width: 110}}>
              <FontAwesome5 name="star" size={16} color="#3498db" />
              <Text style={styles.statLabel}> 当前经验：</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={[styles.statValue, {color: '#3498db', fontSize: 14, marginBottom: 4}]}>{exp} / {level * 100}</Text>
              <View style={styles.expBarBg}>
                <LinearGradient 
                  colors={['#3498db', '#2980b9']} 
                  style={[styles.expBarFill, { width: `${(exp / (level * 100)) * 100}%` }]} 
                  start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                />
              </View>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={{flexDirection: 'row', alignItems: 'center', width: 110}}>
              <FontAwesome5 name="coins" size={16} color="#f39c12" />
              <Text style={styles.statLabel}> 财富积累：</Text>
            </View>
            <Text style={[styles.statValue, {color: '#f1c40f', fontSize: 24, textShadowColor: 'rgba(241,196,15,0.5)', textShadowRadius: 10}]}>{gold} <Text style={{fontSize: 14}}>金币</Text></Text>
          </View>
          
          <View style={[styles.statRow, {marginTop: 10}]}>
            <View style={{flexDirection: 'row', alignItems: 'center', width: 110}}>
              <FontAwesome5 name="khanda" size={16} color="#e74c3c" />
              <Text style={styles.statLabel}> 职业形态：</Text>
            </View>
            <Text style={[styles.statValue, {color: '#e74c3c'}]}>
              {activeHeroTier === 1 && "见习勇者"}
              {activeHeroTier === 2 && "圣骑士 (Tier 2)"}
              {activeHeroTier === 3 && "暗影刺客 (Tier 3)"}
            </Text>
          </View>
          
          <View style={{flexDirection: 'row', gap: 10, marginTop: 15, flexWrap: 'wrap'}}>
            <TouchableOpacity onPress={() => setActiveHeroTier(1)}>
              <LinearGradient colors={activeHeroTier === 1 ? ['#e94560', '#c0392b'] : ['#2c3e50', '#34495e']} style={styles.equipBtn}>
                <Text style={styles.equipBtnText}>换装: 见习勇者</Text>
              </LinearGradient>
            </TouchableOpacity>
            {ownedHeroTiers.includes(2) && (
              <TouchableOpacity onPress={() => setActiveHeroTier(2)}>
                <LinearGradient colors={activeHeroTier === 2 ? ['#e94560', '#c0392b'] : ['#2c3e50', '#34495e']} style={styles.equipBtn}>
                  <Text style={styles.equipBtnText}>换装: 圣骑士</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
            {ownedHeroTiers.includes(3) && (
              <TouchableOpacity onPress={() => setActiveHeroTier(3)}>
                <LinearGradient colors={activeHeroTier === 3 ? ['#e94560', '#c0392b'] : ['#2c3e50', '#34495e']} style={styles.equipBtn}>
                  <Text style={styles.equipBtnText}>换装: 暗影刺客</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* 宠物窝 */}
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15, marginTop: 10}}>
          <MaterialCommunityIcons name="paw" size={24} color="#2ecc71" />
          <Text style={styles.subtitle}>宠物窝</Text>
        </View>

        {ownedPets.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="egg-outline" size={40} color="#555" />
            <Text style={styles.emptyText}>空空如也，去商店买只宠物陪伴你吧！</Text>
          </View>
        ) : (
          <View style={styles.petsContainer}>
            {ownedPets.map(pet => (
              <View key={pet.id} style={[styles.petCard, activePetId === pet.id && styles.activePetCard]}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  <Text style={styles.petName}>{pet.name} <Text style={{fontSize: 14, color: '#aaa'}}>(Lv.{pet.level})</Text></Text>
                  {activePetId !== pet.id ? (
                    <TouchableOpacity onPress={() => setActivePet(pet.id)}>
                      <LinearGradient colors={['#27ae60', '#2ecc71']} style={styles.petEquipBtn}>
                        <Text style={{color: '#fff', fontSize: 12, fontWeight: 'bold'}}>出战</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setActivePet(null)}>
                      <LinearGradient colors={['#c0392b', '#e74c3c']} style={styles.petEquipBtn}>
                        <Text style={{color: '#fff', fontSize: 12, fontWeight: 'bold'}}>休息</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
                
                <Text style={{color: '#aaa', fontSize: 10, marginTop: 10, marginBottom: 4}}>升级进度: {pet.exp} / {pet.level * 50}</Text>
                <View style={styles.petExpBar}>
                  <LinearGradient 
                    colors={['#4cd137', '#009432']} 
                    style={[styles.petExpFill, {width: `${(pet.exp / (pet.level * 50)) * 100}%`}]} 
                    start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                  />
                </View>
                <Text style={styles.petBuffText}>
                  {getPetBuffText(pet)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 商店 */}
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15, marginTop: 10}}>
          <FontAwesome5 name="store" size={20} color="#f39c12" />
          <Text style={styles.subtitle}>神秘商店</Text>
        </View>

        <View style={styles.storeContainer}>
          {/* 圣骑士 */}
          <View style={styles.storeItem}>
            <View style={{flex: 1}}>
              <Text style={styles.itemName}>
                <FontAwesome5 name="scroll" size={16} color="#eccc68" /> 圣骑士转职书 
                <Text style={styles.reqText}> (需 Lv.2)</Text>
              </Text>
              <Text style={styles.itemDesc}>华丽变身！将战斗形态升级为【圣骑士】。</Text>
            </View>
            {!ownedHeroTiers.includes(2) ? (
              <TouchableOpacity onPress={handleBuyHero2}>
                <LinearGradient colors={['#f1c40f', '#f39c12']} style={styles.buyBtn}>
                  <Text style={styles.buyBtnText}>500 金币</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <Text style={styles.soldOut}>已购买</Text>
            )}
          </View>

          {/* 暗影刺客 */}
          <LinearGradient colors={['rgba(26,26,46,0.9)', 'rgba(30,10,20,0.9)']} style={[styles.storeItem, {borderColor: '#c0392b', borderWidth: 1}]}>
            <View style={{flex: 1}}>
              <Text style={[styles.itemName, {color: '#ff4757'}]}>
                <FontAwesome5 name="skull" size={16} color="#ff4757" /> 暗影刺客转职书 
                <Text style={styles.reqText}> (需 Lv.5)</Text>
              </Text>
              <Text style={styles.itemDesc}>终极形态！将战斗形态升级为无情的【暗影刺客】。</Text>
            </View>
            {!ownedHeroTiers.includes(3) ? (
              <TouchableOpacity onPress={handleBuyHero3}>
                <LinearGradient colors={['#ff4757', '#c0392b']} style={styles.buyBtn}>
                  <Text style={[styles.buyBtnText, {color: '#fff'}]}>1500 金币</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <Text style={styles.soldOut}>已购买</Text>
            )}
          </LinearGradient>

          {/* 波利蛋 */}
          <View style={styles.storeItem}>
            <View style={{flex: 1}}>
              <Text style={styles.itemName}>
                <FontAwesome5 name="egg" size={16} color="#ff9ff3" /> 寻宝波利蛋
              </Text>
              <Text style={styles.itemDesc}>孵化后增加 2% 专注金币收益！满级增加至 5%。</Text>
            </View>
            {!ownedPets.some(p => p.type === 'treasure_poring') ? (
              <TouchableOpacity onPress={handleBuyPetPoring}>
                <LinearGradient colors={['#f1c40f', '#f39c12']} style={styles.buyBtn}>
                  <Text style={styles.buyBtnText}>300 金币</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <Text style={styles.soldOut}>已拥有</Text>
            )}
          </View>

          {/* 飞龙蛋 */}
          <View style={styles.storeItem}>
            <View style={{flex: 1}}>
              <Text style={styles.itemName}>
                <FontAwesome5 name="dragon" size={16} color="#48dbfb" /> 学霸飞龙蛋 
                <Text style={styles.reqText}> (需 Lv.3)</Text>
              </Text>
              <Text style={styles.itemDesc}>孵化后增加 2% 专注经验收益！满级增加至 5%。</Text>
            </View>
            {!ownedPets.some(p => p.type === 'scholar_dragon') ? (
              <TouchableOpacity onPress={handleBuyPetDragon}>
                <LinearGradient colors={['#f1c40f', '#f39c12']} style={styles.buyBtn}>
                  <Text style={styles.buyBtnText}>500 金币</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <Text style={styles.soldOut}>已拥有</Text>
            )}
          </View>
        </View>

        <View style={{height: 80}} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  statsCard: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 15,
    color: '#ccc',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  expBarBg: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  expBarFill: {
    height: '100%',
  },
  subtitle: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emptyBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 25,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    marginTop: 10,
  },
  petsContainer: {
    marginBottom: 25,
    gap: 12,
  },
  petCard: {
    backgroundColor: 'rgba(22,33,62,0.8)',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activePetCard: {
    borderColor: '#f1c40f',
    borderWidth: 1.5,
    backgroundColor: 'rgba(30,40,70,0.9)',
    shadowColor: "#f1c40f",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  petName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  petExpBar: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 3,
    marginBottom: 10,
    overflow: 'hidden',
  },
  petExpFill: {
    height: '100%',
  },
  petBuffText: {
    color: '#f1c40f',
    fontSize: 13,
    fontWeight: 'bold',
  },
  equipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  equipBtnText: {
    color: 'white', 
    fontSize: 12,
    fontWeight: 'bold',
  },
  petEquipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  storeContainer: {
    gap: 15,
  },
  storeItem: {
    backgroundColor: 'rgba(22,33,62,0.8)',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemDesc: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 18,
    paddingRight: 10,
  },
  buyBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  buyBtnText: {
    color: '#000',
    fontWeight: 'bold',
  },
  soldOut: {
    color: '#888',
    fontWeight: 'bold',
    paddingHorizontal: 15,
  },
  reqText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: 'normal',
  }
});
