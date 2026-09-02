import React, { useEffect, useState } from 'react';
import './HomePage.css';

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  overview: string;
  release_date: string;
}

interface LoadingState {
  movies: boolean;
  series: boolean;
  anime: boolean;
}

const HomePage: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [series, setSeries] = useState<Movie[]>([]);
  const [anime, setAnime] = useState<any[]>([]);
  const [loading, setLoading] = useState<LoadingState>({
    movies: true,
    series: true,
    anime: true,
  });
  const [error, setError] = useState<string>('');

  const API_BASE = 'http://localhost:5000/api';
  const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // মুভি লোড করুন
      const moviesRes = await fetch(`${API_BASE}/movies/popular`);
      const moviesData = await moviesRes.json();
      setMovies(moviesData.results?.slice(0, 10) || []);
      setLoading(prev => ({ ...prev, movies: false }));

      // সিরিজ লোড করুন
      const seriesRes = await fetch(`${API_BASE}/series/popular`);
      const seriesData = await seriesRes.json();
      setSeries(seriesData.results?.slice(0, 10) || []);
      setLoading(prev => ({ ...prev, series: false }));

      // অ্যানিমে লোড করুন
      const animeRes = await fetch(`${API_BASE}/anime/trending?limit=10`);
      const animeData = await animeRes.json();
      setAnime(animeData.data?.slice(0, 10) || []);
      setLoading(prev => ({ ...prev, anime: false }));
    } catch (err) {
      setError('সার্ভার সংযোগ করতে পারছি না। আগে সার্ভার চালু করুন।');
      setLoading({ movies: false, series: false, anime: false });
    }
  };

  const ContentCard = ({ item, type }: { item: any; type: 'movie' | 'anime' }) => {
    const posterPath = type === 'movie' 
      ? item.poster_path 
      : item.mal_id ? `https://cdn.myanimelist.net/images/anime/${item.mal_id}_large.jpg` : '';
    
    const title = type === 'movie' ? item.title : item.title;

    return (
      <div className="card">
        <div className="card-image">
          {posterPath ? (
            <img 
              src={type === 'movie' ? `${IMAGE_BASE}${posterPath}` : posterPath} 
              alt={title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x450?text=No+Image';
              }}
            />
          ) : (
            <div className="no-image">ছবি নেই</div>
          )}
        </div>
        <div className="card-content">
          <h3>{title}</h3>
          {type === 'movie' && item.vote_average && (
            <p className="rating">⭐ {item.vote_average.toFixed(1)}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="home-page">
      {/* হেডার */}
      <header className="header">
        <div className="container">
          <h1>🎬 CineVerse</h1>
          <p>সব সময় সবকিছু দেখুন - বিনামূল্যে!</p>
        </div>
      </header>

      {/* ত্রুটি বার্তা */}
      {error && (
        <div className="error-banner">
          <p>⚠️ {error}</p>
          <button onClick={fetchContent}>আবার চেষ্টা করুন</button>
        </div>
      )}

      <div className="container">
        {/* জনপ্রিয় মুভি */}
        <section className="content-section">
          <h2>🎥 জনপ্রিয় মুভি</h2>
          {loading.movies ? (
            <p className="loading">লোড হচ্ছে...</p>
          ) : movies.length > 0 ? (
            <div className="content-grid">
              {movies.map(movie => (
                <ContentCard key={movie.id} item={movie} type="movie" />
              ))}
            </div>
          ) : (
            <p>কোন মুভি পাওয়া যায়নি</p>
          )}
        </section>

        {/* জনপ্রিয় সিরিজ */}
        <section className="content-section">
          <h2>📺 জনপ্রিয় সিরিজ</h2>
          {loading.series ? (
            <p className="loading">লোড হচ্ছে...</p>
          ) : series.length > 0 ? (
            <div className="content-grid">
              {series.map(show => (
                <ContentCard key={show.id} item={show} type="movie" />
              ))}
            </div>
          ) : (
            <p>কোন সিরিজ পাওয়া যায়নি</p>
          )}
        </section>

        {/* ট্রেন্ডিং অ্যানিমে */}
        <section className="content-section">
          <h2>🌸 ট্রেন্ডিং অ্যানিমে</h2>
          {loading.anime ? (
            <p className="loading">লোড হচ্ছে...</p>
          ) : anime.length > 0 ? (
            <div className="content-grid">
              {anime.map(item => (
                <ContentCard key={item.mal_id} item={item.entry} type="anime" />
              ))}
            </div>
          ) : (
            <p>কোন অ্যানিমে পাওয়া যায়নি</p>
          )}
        </section>
      </div>

      {/* ফুটার */}
      <footer className="footer">
        <p>© 2024 CineVerse - সকল অধিকার সংরক্ষিত</p>
      </footer>
    </div>
  );
};

export default HomePage;
