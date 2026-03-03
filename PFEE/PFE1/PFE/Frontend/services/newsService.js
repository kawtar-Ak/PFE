// Service pour récupérer les news de football
export const newsService = {
  // Données mockées de news de football
  getNews: async (category = 'all') => {
    try {
      // Simulation d'une API call avec un délai
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const allNews = [
        {
          id: '1',
          title: "Could Cristiano Ronaldo's controversial stance bring forward his footballing retirement?",
          description: 'Cristiano Ronaldo\'s recent controversial decisions have sparked debates about his future in professional football.',
          image: 'https://images.unsplash.com/photo-1579952549286-26f92ff5a5dc?w=400&h=300&fit=crop',
          category: 'football',
          date: new Date('2026-02-05'),
          source: 'Sports News'
        },
        {
          id: '2',
          title: 'Giannis reportedly to stay with Milwaukee Bucks as NBA trade deadline looms',
          description: 'The Milwaukee Bucks star is expected to remain with the team despite ongoing trade rumors.',
          image: 'https://images.unsplash.com/photo-1546519062-68e109498995?w=400&h=300&fit=crop',
          category: 'football',
          date: new Date('2026-02-04'),
          source: 'Sports News'
        },
        {
          id: '3',
          title: 'Premier League Title Race: Manchester City extends lead',
          description: 'Manchester City continues to dominate the Premier League with impressive performances this season.',
          image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
          category: 'premier league',
          date: new Date('2026-02-03'),
          source: 'Premier League Official'
        },
        {
          id: '4',
          title: 'Barcelona vs Real Madrid: El Clásico Preview',
          description: 'Get ready for the most anticipated match in Spanish football as Barcelona faces Real Madrid.',
          image: 'https://images.unsplash.com/photo-1517747590174-8f986f1d0b20?w=400&h=300&fit=crop',
          category: 'football',
          date: new Date('2026-02-02'),
          source: 'Football Daily'
        },
        {
          id: '5',
          title: 'Winter Olympics 2026: Figure Skating Finals',
          description: 'The figure skating finals showcase the world\'s best athletes competing for gold medals.',
          image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop',
          category: 'winter olympics',
          date: new Date('2026-02-01'),
          source: 'Olympics News'
        },
        {
          id: '6',
          title: 'Liverpool Signs New Striker',
          description: 'Liverpool FC completes transfer of highly-rated striker in a record deal.',
          image: 'https://images.unsplash.com/photo-1579952549286-26f92ff5a5dc?w=400&h=300&fit=crop',
          category: 'premier league',
          date: new Date('2026-01-31'),
          source: 'Transfer News'
        },
        {
          id: '7',
          title: 'PSG vs Lyon: Ligue 1 Clash',
          description: 'Two French powerhouses meet in an exciting Ligue 1 encounter.',
          image: 'https://images.unsplash.com/photo-1546519062-68e109498995?w=400&h=300&fit=crop',
          category: 'football',
          date: new Date('2026-01-30'),
          source: 'Ligue 1 News'
        },
        {
          id: '8',
          title: 'Bundesliga: Bayern Munich Wins Streak Continues',
          description: 'Bayern Munich extends their winning streak in the German top division.',
          image: 'https://images.unsplash.com/photo-1517747590174-8f986f1d0b20?w=400&h=300&fit=crop',
          category: 'football',
          date: new Date('2026-01-29'),
          source: 'Bundesliga News'
        }
      ];
      
      // Filtrer par catégorie
      if (category === 'all') {
        return allNews;
      } else {
        return allNews.filter(news => news.category.toLowerCase() === category.toLowerCase());
      }
    } catch (error) {
      console.error('Erreur chargement news:', error);
      return [];
    }
  },

  getCategories: async () => {
    return ['all', 'football', 'premier league', 'winter olympics'];
  }
};
