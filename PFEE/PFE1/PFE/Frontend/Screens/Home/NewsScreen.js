import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { newsService } from '../../services/newsService';

const { width } = Dimensions.get('window');

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
    loadNews('all');
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await newsService.getCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const loadNews = async (category = selectedCategory) => {
    try {
      setLoading(true);
      const newsData = await newsService.getNews(category);
      setNews(newsData);
      setSelectedCategory(category);
    } catch (error) {
      console.error('Erreur chargement news:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadNews(selectedCategory);
  };

  const formatDate = (date) => {
    const today = new Date();
    const newsDate = new Date(date);
    const diffTime = today.getTime() - newsDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return newsDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateShort = (date) => {
    const newsDate = new Date(date);
    return newsDate.toLocaleDateString('en-US', { weekday: 'long', month: '2-digit', day: '2-digit' });
  };

  const getNewsGroupedByDate = () => {
    const grouped = {};
    
    news.forEach(item => {
      const newsDate = new Date(item.date);
      const dateKey = newsDate.toLocaleDateString('en-US'); // "2/5/2026"
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          dateLabel: formatDateShort(newsDate),
          articles: []
        };
      }
      grouped[dateKey].articles.push(item);
    });

    // Trier par date (plus récente en premier)
    return Object.entries(grouped)
      .sort((a, b) => new Date(b[0]) - new Date(a[0]))
      .map(([dateKey, data]) => ({
        ...data,
        dateKey
      }));
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>News</Text>
            <Ionicons name="person-circle" size={28} color="#fff" />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Chargement des actualités...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>News</Text>
          <Ionicons name="person-circle" size={28} color="#fff" />
        </View>
      </View>

      {/* Categories Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
        pointerEvents="box-none"
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryTab,
              selectedCategory === category && styles.categoryTabActive
            ]}
            onPress={() => loadNews(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}
            >
              {category.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* News List */}
      <ScrollView
        style={styles.newsContainer}
        contentContainerStyle={styles.newsListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#3b82f6"
          />
        }
      >
        {news.length > 0 ? (
          getNewsGroupedByDate().map((dayGroup) => (
            <View key={dayGroup.dateKey}>
              {/* Date Section Header */}
              <Text style={styles.dateHeader}>{dayGroup.dateLabel}</Text>
              
              {/* Articles for this day */}
              {dayGroup.articles.map((item, index) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[
                    styles.newsCard,
                    index === 0 && styles.firstArticleOfDay
                  ]}
                >
                  <Image
                    source={{ uri: item.image }}
                    style={styles.newsImage}
                  />
                  <View style={styles.newsCardContent}>
                    <Text style={styles.newsTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <Text style={styles.newsCategory}>
                      {item.category.toUpperCase()}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color="#94a3b8" />
            <Text style={styles.emptyText}>Aucune actualité disponible</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoriesContainer: {
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  categoriesContent: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  categoryTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  categoryTabActive: {
    borderBottomColor: '#ef4444',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  categoryTextActive: {
    color: '#ef4444',
  },
  newsContainer: {
    flex: 1,
  },
  newsListContent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    paddingBottom: 70,
    paddingTop: 0,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    paddingTop: 8,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  // Featured Article
  featuredNewsCard: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 6,
    marginTop: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  featuredImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#1e293b',
  },
  featuredContent: {
    padding: 10,
  },
  featuredTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 20,
  },
  // Standard News Card
  newsCard: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    borderRadius: 0,
    marginHorizontal: 0,
    marginBottom: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  firstArticleOfDay: {
    borderTopWidth: 1,
    marginHorizontal: 0,
  },
  newsImage: {
    width: 100,
    height: 100,
    backgroundColor: '#1e293b',
  },
  newsCardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  newsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 16,
  },
  newsCategory: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ef4444',
    textTransform: 'uppercase',
  },
  newsDate: {
    fontSize: 11,
    color: '#94a3b8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 16,
  },
});