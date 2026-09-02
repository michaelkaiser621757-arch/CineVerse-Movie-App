# 🎬 CineVerse - সম্পূর্ণ সেটআপ গাইড (বাংলা)

## শুরু করার আগে জানতে হবে

আপনার CineVerse অ্যাপ এখন একটি **পূর্ণ-সক্ষম স্ট্রিমিং প্ল্যাটফর্ম** যা:
- মুভি, সিরিজ, অ্যানিমে এবং লাইভ টিভি দেখায়
- সব কিছু **সম্পূর্ণ বিনামূল্যে** API থেকে পায়

---

## 📁 আপনার প্রজেক্ট এর ফোল্ডার স্ট্রাকচার

```
CineVerse-Movie-App/
├── artifacts/
│   ├── api-server/              ← এখানে সার্ভার আছে
│   │   ├── src/
│   │   │   ├── services/        ← এখানে API কানেক্ট করি
│   │   │   │   ├── tmdbService.ts
│   │   │   │   ├── jikanService.ts
│   │   │   │   ├── anilistService.ts
│   │   │   │   ├── tvmazeService.ts
│   │   │   │   └── liveTvService.ts
│   │   │   ├── routes/
│   │   │   │   └── streaming.ts  ← সব এন্ডপয়েন্ট এখানে
│   │   │   └── app.ts
│   │   ├── .env                 ← এখানে API Key রাখি
│   │   └── package.json
│   └── cineverse/               ← এখানে ফ্রন্টএন্ড UI আছে
└── lib/
    └── ...
```

---

## 🚀 ধাপে ধাপে সেটআপ

### ধাপ ১: Replit খুলুন
আপনার Replit এ যান এবং টার্মিনাল খুলুন (নিচে থাকবে)

### ধাপ ২: প্রজেক্ট ডাউনলোড করুন
```bash
git pull origin feature/integrate-free-apis
```

### ধাপ ৩: ডিপেন্ডেন্সি ইন্সটল করুন
```bash
pnpm install
```

এটি সব package ডাউনলোড করবে।

### ধাপ ৪: সার্ভার চালান
```bash
pnpm --filter @workspace/api-server run dev
```

**আপনি দেখবেন:**
```
Server running on http://localhost:5000
✅ Connected to TMDB API
✅ Connected to Jikan API
✅ Connected to AniList API
```

---

## 🎯 এখন কি করবেন?

### টেস্ট করুন - ব্রাউজার এ যান

**মুভি দেখুন:**
```
http://localhost:5000/api/movies/popular
```

আপনি দেখবেন এমন কিছু:
```json
{
  "results": [
    {
      "id": 123,
      "title": "Avatar",
      "poster_path": "/image.jpg",
      "vote_average": 8.5
    }
  ]
}
```

**মুভি খুঁজুন:**
```
http://localhost:5000/api/movies/search?q=Avatar
```

**অ্যানিমে দেখুন:**
```
http://localhost:5000/api/anime/trending
```

**লাইভ টিভি চ্যানেল:**
```
http://localhost:5000/api/live-tv/channels
```

---

## 📱 ফ্রন্টএন্ড এ কিভাবে ব্যবহার করবেন?

### React ফাংশন (artifacts/cineverse/src/ এ লিখবেন)

**১. মুভি লোড করুন:**
```typescript
import { useEffect, useState } from 'react';

function Movies() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    // সার্ভার থেকে মুভি নিন
    fetch('http://localhost:5000/api/movies/popular')
      .then(res => res.json())
      .then(data => setMovies(data.results));
  }, []);

  return (
    <div>
      {movies.map(movie => (
        <div key={movie.id}>
          <h3>{movie.title}</h3>
          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} />
        </div>
      ))}
    </div>
  );
}
```

**২. মুভি সার্চ করুন:**
```typescript
function SearchMovies() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    fetch(`http://localhost:5000/api/movies/search?q=${query}`)
      .then(res => res.json())
      .then(data => setResults(data.results));
  };

  return (
    <form onSubmit={handleSearch}>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="মুভির নাম লিখুন..."
      />
      <button>সার্চ করুন</button>
      
      <div>
        {results.map(movie => (
          <div key={movie.id}>{movie.title}</div>
        ))}
      </div>
    </form>
  );
}
```

**৩. লাইভ টিভি চ্যানেল দেখুন:**
```typescript
function LiveTVChannels() {
  const [channels, setChannels] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/live-tv/channels')
      .then(res => res.json())
      .then(data => setChannels(data.channels));
  }, []);

  return (
    <div>
      {channels.map(channel => (
        <div key={channel.id}>
          <h4>{channel.name}</h4>
          <p>{channel.category}</p>
          <video src={channel.streamUrl} controls width="300" />
        </div>
      ))}
    </div>
  );
}
```

---

## 🎬 সব API এন্ডপয়েন্ট

### মুভি:
```
/api/movies/popular          - জনপ্রিয় মুভি
/api/movies/trending         - ট্রেন্ডিং মুভি
/api/movies/top-rated        - সেরা মুভি
/api/movies/upcoming         - আসছে শীঘ্রই
/api/movies/search?q=Avatar  - মুভি খুঁজুন
/api/movies/123              - মুভির বিস্তারিত
```

### সিরিজ:
```
/api/series/popular
/api/series/trending
/api/series/top-rated
/api/series/search?q=
/api/series/123
```

### অ্যানিমে:
```
/api/anime/trending          - ট্রেন্ডিং অ্যানিমে
/api/anime/top-rated         - সেরা অ্যানিমে
/api/anime/search?q=Attack   - অ্যানিমে খুঁজুন
/api/anime/1/episodes        - এপিসোড লিস্ট
```

### লাইভ টিভি:
```
/api/live-tv/channels              - সব চ্যানেল
/api/live-tv/search?q=news         - চ্যানেল খুঁজুন
/api/live-tv/categories            - ক্যাটেগরি লিস্ট
/api/live-tv/country/India         - দেশ অনুযায়ী
/api/live-tv/category/News         - ক্যাটেগরি অনুযায়ী
```

---

## 🔑 API Key কোথায় আছে?

```
artifacts/api-server/.env

TMDB_API_KEY=a1f2e0aef374804444d2dd746ae79b25
```

এটি ইতিমধ্যে সেট করা আছে। চিন্তা করবেন না। 👍

---

## ⚠️ সাধারণ সমস্যা ও সমাধান

### সমস্যা ১: "Cannot find module"
**সমাধান:** 
```bash
pnpm install
```

### সমস্যা ২: পোর্ট ৫০০০ বানান নেই
**সমাধান:** অন্য পোর্ট ব্যবহার করুন:
```bash
PORT=3000 pnpm --filter @workspace/api-server run dev
```

### সমস্যা ৩: API রেসপন্স নেই
**সমাধান:** ইন্টারনেট চেক করুন এবং সার্ভার রিস্টার্ট করুন

### সমস্যা ৪: ইমেজ দেখা যাচ্ছে না
**সমাধান:** TMDB ইমেজ URL ব্যবহার করুন:
```
https://image.tmdb.org/t/p/w500{poster_path}
```

---

## 📝 পরবর্তী কাজ (করার জন্য)

- [ ] মুভি কম্পোনেন্ট তৈরি করুন
- [ ] সিরিজ কম্পোনেন্ট তৈরি করুন
- [ ] অ্যানিমে কম্পোনেন্ট তৈরি করুন
- [ ] লাইভ টিভি প্লেয়ার তৈরি করুন
- [ ] সার্চ পেজ তৈরি করুন
- [ ] Watchlist ফিচার যোগ করুন
- [ ] গুগল লগইন যোগ করুন

---

## 💡 মনে রাখবেন

1. **API Key গোপনীয় রাখুন** - কখনও GitHub এ আপলোড করবেন না
2. **Localhost এ কাজ করুন** প্রথমে
3. **Reload করুন** পরিবর্তনের পরে
4. **Console দেখুন** (F12) যদি ত্রুটি হয়

---

## 🆘 সাহায্যের জন্য

এই ফাইলগুলি পড়ুন:
- `API_INTEGRATION_GUIDE.md` - বিস্তারিত গাইড
- `INTEGRATION_SUMMARY.md` - সারসংক্ষেপ

---

**এখন শুরু করুন!** 🚀

```bash
pnpm install
pnpm --filter @workspace/api-server run dev
```

**তারপর ব্রাউজার এ যান:**
```
http://localhost:5000/api/movies/popular
```

হ্যাপি কোডিং! 😊
