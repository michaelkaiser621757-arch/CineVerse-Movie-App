import axios from 'axios';

interface Channel {
  id: string;
  name: string;
  logo: string;
  streamUrl: string;
  category: string;
  country: string;
  language: string;
  quality: string;
  description?: string;
}

interface ParsedM3U {
  channels: Channel[];
  lastUpdated: Date;
}

export const liveTvService = {
  // ========== FREE PUBLIC PLAYLISTS ==========
  
  // Global Free TV Playlists
  GLOBAL_PLAYLISTS: [
    'https://iptv-org.github.io/iptv/index.m3u',
    'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/in.m3u',
    'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/us.m3u',
    'https://raw.githubusercontent.com/iptv-org/iptv/master/streams/bd.m3u',
  ],

  // ========== PARSE M3U PLAYLIST ==========
  async parseM3UPlaylist(playlistUrl: string): Promise<ParsedM3U> {
    try {
      const response = await axios.get(playlistUrl);
      const lines = response.data.split('\n');
      const channels: Channel[] = [];
      let currentChannel: Partial<Channel> = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('#EXTINF')) {
          // Parse channel info
          const match = line.match(/#EXTINF:.*?tvg-logo="([^"]*)".*?group-title="([^"]*)".*?,(.+)/);
          if (match) {
            currentChannel = {
              logo: match[1] || '',
              category: match[2] || 'Uncategorized',
              name: match[3].trim(),
            };
          }
        } else if (line && !line.startsWith('#') && currentChannel.name) {
          // This is the stream URL
          currentChannel.streamUrl = line;
          currentChannel.id = `${currentChannel.name}-${Math.random().toString(36).substr(2, 9)}`;
          currentChannel.country = this.detectCountry(currentChannel.category);
          currentChannel.language = 'Mixed';
          currentChannel.quality = 'HD';

          channels.push(currentChannel as Channel);
          currentChannel = {};
        }
      }

      return {
        channels,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error parsing M3U playlist:', error);
      throw error;
    }
  },

  // ========== FETCH ALL GLOBAL CHANNELS ==========
  async getAllGlobalChannels(): Promise<Channel[]> {
    try {
      const allChannels: Channel[] = [];

      for (const playlistUrl of this.GLOBAL_PLAYLISTS) {
        try {
          const result = await this.parseM3UPlaylist(playlistUrl);
          allChannels.push(...result.channels);
        } catch (error) {
          console.warn(`Failed to parse playlist ${playlistUrl}:`, error);
        }
      }

      // Remove duplicates
      const uniqueChannels = Array.from(
        new Map(allChannels.map((channel) => [channel.streamUrl, channel])).values()
      );

      return uniqueChannels;
    } catch (error) {
      console.error('Error fetching global channels:', error);
      throw error;
    }
  },

  // ========== SEARCH CHANNELS ==========
  async searchChannels(query: string, channels: Channel[]): Promise<Channel[]> {
    const lowerQuery = query.toLowerCase();
    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(lowerQuery) ||
        channel.category.toLowerCase().includes(lowerQuery) ||
        channel.country.toLowerCase().includes(lowerQuery)
    );
  },

  // ========== FILTER BY CATEGORY ==========
  async getChannelsByCategory(category: string, channels: Channel[]): Promise<Channel[]> {
    return channels.filter((channel) =>
      channel.category.toLowerCase().includes(category.toLowerCase())
    );
  },

  // ========== FILTER BY COUNTRY ==========
  async getChannelsByCountry(country: string, channels: Channel[]): Promise<Channel[]> {
    return channels.filter((channel) =>
      channel.country.toLowerCase().includes(country.toLowerCase())
    );
  },

  // ========== GET CATEGORIES ==========
  getCategories(channels: Channel[]): string[] {
    const categories = new Set(channels.map((channel) => channel.category));
    return Array.from(categories).sort();
  },

  // ========== GET COUNTRIES ==========
  getCountries(channels: Channel[]): string[] {
    const countries = new Set(channels.map((channel) => channel.country));
    return Array.from(countries).sort();
  },

  // ========== DETECT COUNTRY FROM CATEGORY ==========
  private detectCountry(category: string): string {
    const countryMap: Record<string, string> = {
      'News': 'Global',
      'Sports': 'Global',
      'Entertainment': 'Global',
      'Movies': 'Global',
      'Music': 'Global',
      'Kids': 'Global',
      'Documentary': 'Global',
      'Indian': 'India',
      'Bangla': 'Bangladesh',
      'Pakistani': 'Pakistan',
      'Arabic': 'Middle East',
      'Turkish': 'Turkey',
      'Spanish': 'Spain',
      'Portuguese': 'Brazil',
      'French': 'France',
      'German': 'Germany',
      'Italian': 'Italy',
      'Russian': 'Russia',
      'Chinese': 'China',
      'Japanese': 'Japan',
      'Korean': 'South Korea',
    };

    for (const [key, country] of Object.entries(countryMap)) {
      if (category.toLowerCase().includes(key.toLowerCase())) {
        return country;
      }
    }

    return 'Global';
  },

  // ========== VALIDATE STREAM URL ==========
  async validateStreamUrl(url: string): Promise<boolean> {
    try {
      const response = await axios.head(url, {
        timeout: 5000,
      });
      return response.status === 200 || response.status === 206;
    } catch (error) {
      console.warn(`Invalid stream URL: ${url}`, error);
      return false;
    }
  },

  // ========== GET POPULAR CATEGORIES ==========
  getPopularCategories(): string[] {
    return [
      'News',
      'Sports',
      'Entertainment',
      'Movies',
      'Music',
      'Kids',
      'Documentary',
      'Indian',
      'Bangla',
    ];
  },
};

export default liveTvService;
