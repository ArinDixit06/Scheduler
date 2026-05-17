import { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  Vibration,
  Platform,
  Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 3 columns: total padding = 40 (20 on each side), total gaps = 24 (12 between each of the 3 items)
// TILE_WIDTH = (SCREEN_WIDTH - total padding - total gaps) / 3
const TILE_WIDTH = (SCREEN_WIDTH - 40 - 24) / 3 - 1;

type GridTile = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  color: string;
  isTab?: boolean;
};

const GRID_TILES: GridTile[] = [
  { label: 'Insights', icon: 'bulb-outline', route: 'Insights', color: '#FFB800' },
  { label: 'Recap', icon: 'stats-chart-outline', route: 'WeeklyRecap', color: '#10B981' },
  { label: 'Habits', icon: 'flash-outline', route: 'Habits', color: '#3B82F6' },
  { label: 'Focus', icon: 'timer-outline', route: 'Focus', color: '#EF4444' },
  { label: 'AI Copilot', icon: 'sparkles-outline', route: 'AI', color: '#8B5CF6' },
  { label: 'Projects', icon: 'folder-open-outline', route: 'TasksTab', color: '#EC4899', isTab: true },
  { label: 'Integrations', icon: 'link-outline', route: 'Integrations', color: '#06B6D4' },
  { label: 'Alerts', icon: 'notifications-outline', route: 'NotificationSettings', color: '#F59E0B' },
  { label: 'Settings', icon: 'settings-outline', route: 'Settings', color: '#6B7280' }
];

export function MoreScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTiles = useMemo(() => {
    if (!searchQuery.trim()) return GRID_TILES;
    return GRID_TILES.filter((tile) =>
      tile.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleTilePress = (tile: GridTile) => {
    Vibration.vibrate(10);
    if (tile.isTab) {
      navigation.navigate(tile.route);
    } else {
      navigation.navigate('More', { screen: tile.route });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.launchpadHeader}>Chronos Launchpad</Text>
        <Text style={styles.launchpadSub}>Quick access to all secondary systems, settings, and workspace metrics.</Text>

        {/* 1. Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search launchpad utilities..."
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={16} color="#6B7280" />
            </Pressable>
          )}
        </View>

        {/* 2. Grid Menu */}
        <View style={styles.gridContainer}>
          {filteredTiles.length === 0 ? (
            <View style={styles.emptyGrid}>
              <Text style={styles.emptyGridText}>No matching utilities found.</Text>
            </View>
          ) : (
            filteredTiles.map((tile) => (
              <Pressable
                key={tile.label}
                onPress={() => handleTilePress(tile)}
                style={({ pressed }) => [
                  styles.gridTile,
                  pressed && styles.gridTilePressed
                ]}
              >
                <View style={[styles.tileIconContainer, { backgroundColor: `${tile.color}12` }]}>
                  <Ionicons name={tile.icon} size={22} color={tile.color} />
                </View>
                <Text style={styles.tileLabel} numberOfLines={1}>
                  {tile.label}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>

      {/* 3. System Status Footer */}
      <View style={styles.footerContainer}>
        <View style={styles.statusPill}>
          <View style={styles.statusIndicator} />
          <Text style={styles.statusLabel}>System Optimal</Text>
        </View>
        <Text style={styles.versionLabel}>Version 1.4.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F8'
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 110
  },
  launchpadHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  launchpadSub: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 16,
    marginBottom: 20
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 24,
    shadowColor: colors.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    padding: 0
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'flex-start'
  },
  emptyGrid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40
  },
  emptyGridText: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '700'
  },
  gridTile: {
    width: TILE_WIDTH,
    height: TILE_WIDTH * 1.08,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1
  },
  gridTilePressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }]
  },
  tileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  tileLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textPrimary
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(245,246,248,0.92)',
    paddingVertical: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: 'rgba(232,236,244,0.5)'
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEFBF7',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4
  },
  statusIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46'
  },
  versionLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textLight
  }
});
