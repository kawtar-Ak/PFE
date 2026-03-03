const API_URL = 'http://localhost:3000/api/match';

export const matchService = {
  getAllMatches: async () => {
    try {
      const response = await fetch(`${API_URL}/`);
      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  },

  getMatchesByLeague: async (league) => {
    try {
      const response = await fetch(`${API_URL}/league/${league}`);
      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  },

  getSupportedLeagues: async () => {
    try {
      const response = await fetch(`${API_URL}/import/leagues`);
      const data = await response.json();
      return data.leagues || [];
    } catch (error) {
      console.error('Error:', error);
      return [];
    }
  },

  importAllMatches: async () => {
    try {
      const response = await fetch(`${API_URL}/import/all`, { method: 'POST' });
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return { success: false, message: error.message };
    }
  },

  importLeague: async (leagueCode) => {
    try {
      const response = await fetch(`${API_URL}/import/${leagueCode}`, { method: 'POST' });
      return await response.json();
    } catch (error) {
      console.error('Error:', error);
      return { success: false, message: error.message };
    }
  }
};
