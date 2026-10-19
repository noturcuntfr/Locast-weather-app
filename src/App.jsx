import { useState, useEffect } from 'react';
import './App.css';

const API_KEY = import.meta.env.VITE_API_KEY;

const WORLD_LANGS = {
  'Vapi': 'gu-IN', 'Surat': 'gu-IN',
  'Ahmedabad': 'gu-IN', 'Vadodara': 'gu-IN',
  'Rajkot': 'gu-IN',
  'Mumbai': 'mr-IN', 'Pune': 'mr-IN',
  'Nagpur': 'mr-IN', 'Nashik': 'mr-IN',
  'Delhi': 'hi-IN', 'Lucknow': 'hi-IN',
  'Jaipur': 'hi-IN', 'Patna': 'hi-IN',
  'Bhopal': 'hi-IN', 'Indore': 'hi-IN',
  'Kolkata': 'bn-IN', 'Chennai': 'ta-IN',
  'Hyderabad': 'te-IN', 'Vijayawada': 'te-IN',
  'Bengaluru': 'kn-IN', 'Bangalore': 'kn-IN',
  'Tokyo': 'ja-JP', 'Osaka': 'ja-JP',
  'Beijing': 'zh-CN', 'Shanghai': 'zh-CN',
  'Paris': 'fr-FR', 'Lyon': 'fr-FR',
  'Berlin': 'de-DE', 'Munich': 'de-DE',
  'Madrid': 'es-ES', 'Barcelona': 'es-ES',
  'Rome': 'it-IT', 'Milan': 'it-IT',
  'Moscow': 'ru-RU', 'Seoul': 'ko-KR',
  'Dubai': 'ar-AE', 'Riyadh': 'ar-SA',
  'Doha': 'ar-SA',
  'London': 'en-GB', 'New York': 'en-US',
  'Los Angeles': 'en-US',
};

const COUNTRY_LANG = {
  'JP': 'ja-JP', 'CN': 'zh-CN',
  'FR': 'fr-FR', 'DE': 'de-DE',
  'ES': 'es-ES', 'IT': 'it-IT',
  'RU': 'ru-RU', 'KR': 'ko-KR',
  'SA': 'ar-SA', 'AE': 'ar-AE',
  'QA': 'ar-SA', 'BR': 'pt-BR',
  'PT': 'pt-PT', 'TR': 'tr-TR',
  'GB': 'en-GB', 'US': 'en-US'
};

const REPORT_TEMPLATES = {
  'gu-IN': (w) => `હવામાન રિપોર્ટ ${w.name} માટે.
    અત્યારે ${Math.round(w.main.temp)} ડિગ્રી,
    ${w.weather[0].description}.`,

  'hi-IN': (w) => `मौसम रिपोर्ट ${w.name} के लिए।
    अभी ${Math.round(w.main.temp)} डिग्री,
    ${w.weather[0].description}।`,

  'mr-IN': (w) => `हवामान अहवाल ${w.name} साठी.
    सध्या ${Math.round(w.main.temp)} अंश.`,

  'ja-JP': (w) => `天気予報 ${w.name}。
    現在 ${Math.round(w.main.temp)}度、
    ${w.weather[0].description}。`,

  'fr-FR': (w) => `Rapport météo pour ${w.name}.
    Actuellement ${Math.round(w.main.temp)} degrés.`,

  'de-DE': (w) => `Wetterbericht für ${w.name}.
    Aktuell ${Math.round(w.main.temp)} Grad.`,

  'es-ES': (w) => `Reporte para ${w.name}.
    Ahora ${Math.round(w.main.temp)} grados.`,

  'ar-SA': (w) => `تقرير الطقس لـ ${w.name}.
    الآن ${Math.round(w.main.temp)} درجة.`,

  'ar-AE': (w) => `تقرير الطقس لـ ${w.name}.
    الآن ${Math.round(w.main.temp)} درجة.`,

  'en-IN': (w) => `Weather report for ${w.name}.
    Currently ${Math.round(w.main.temp)} degrees,
    ${w.weather[0].description}.
    High ${Math.round(w.main.temp_max)},
    low ${Math.round(w.main.temp_min)}.
    Humidity ${w.main.humidity} percent.`,

  'default': (w) => `Weather report for ${w.name}.
    Currently ${Math.round(w.main.temp)} degrees,
    ${w.weather[0].description}.`
};

function App(){
  const [q,setQ]=useState('');
  const [weather,setWeather]=useState(null);
  const [forecast,setForecast]=useState(null);
  const [alerts,setAlerts]=useState(null);
  const [cityImg,setCityImg]=useState('');
  const [menuOpen,setMenuOpen]=useState(false);
  const [isSpeaking,setIsSpeaking]=useState(false);
  const [currentLang,setCurrentLang]=useState('EN');
  const [mapMode,setMapMode]=useState('wind');
  const [showSplash,setShowSplash]=useState(true);
  const [voices,setVoices]=useState([]);

  const [saved,setSaved]=useState(
    JSON.parse(
      localStorage.getItem('locast_saved')||
      '["Vapi","Mumbai","Delhi","Tokyo"]'
    )
  );

  const cities = [
    "Vapi","Mumbai","Delhi",
    "Tokyo","Paris","Dubai"
  ];

  const [typedCity,setTypedCity]=useState("");
  const [cityIdx,setCityIdx]=useState(0);
  const [isDeleting,setIsDeleting]=useState(false);
  const [isFocused,setIsFocused]=useState(false);

  useEffect(()=>{
    const t=setTimeout(
      ()=>setShowSplash(false),2500
    );
    return()=>clearTimeout(t);
  },[]);

  useEffect(()=>{
    if(isFocused||q) return;
    const cur=cities[cityIdx];
    const t=setTimeout(()=>{
      if(!isDeleting){
        setTypedCity(
          cur.substring(0,typedCity.length+1)
        );
        if(typedCity.length+1===cur.length){
          setTimeout(()=>setIsDeleting(true),1200);
        }
      } else {
        setTypedCity(
          cur.substring(0,typedCity.length-1)
        );
        if(typedCity.length===0){
          setIsDeleting(false);
          setCityIdx(p=>(p+1)%cities.length);
        }
      }
    },isDeleting?60:120);
    return()=>clearTimeout(t);
  },[typedCity,isDeleting,cityIdx,isFocused,q]);

  useEffect(()=>{
    const load=()=>{
      const v=window.speechSynthesis.getVoices();
      if(v.length) setVoices(v);
    };
    load();
    window.speechSynthesis.onvoiceschanged=load;
  },[]);

  const getRealCityImage=async(city)=>{
    try{
      const url=`https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(city)}&prop=pageimages&format=json&pithumbsize=1200&origin=*`;
      const d=await fetch(url).then(r=>r.json());
      const page=Object.values(d.query.pages)[0];
      if(page?.thumbnail?.source){
        return page.thumbnail.source;
      }
    }catch{}
    return null;
  };

  const fetchAll=async(name,lat,lon)=>{
    if(!name&&!lat) return;
    let w;

    if(lat){
      w=await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      ).then(r=>r.json());
    } else {
      w=await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${API_KEY}&units=metric`
      ).then(r=>r.json());
    }

    if(w.cod!=200){
      alert("Not found");
      return;
    }

    const f=await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${w.name}&appid=${API_KEY}&units=metric`
    ).then(r=>r.json());

    setWeather(w);
    setForecast(f);

    const img=await getRealCityImage(w.name);
    if(img) setCityImg(img);

    try{
      const one=await fetch(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${w.coord.lat}&lon=${w.coord.lon}&appid=${API_KEY}&units=metric`
      ).then(r=>r.json());
      setAlerts(one.alerts||null);
    }catch{
      setAlerts(null);
    }
  };

  const getMyLocation=()=>{
    navigator.geolocation.getCurrentPosition(
      p=>fetchAll(null,p.coords.latitude,p.coords.longitude),
      ()=>fetchAll("Vapi")
    );
  };

  useEffect(()=>{ getMyLocation(); },[]);

  const daily=[];
  if(forecast){
    const map={};
    forecast.list.forEach(i=>{
      const d=i.dt_txt.split(' ')[0];
      if(!map[d]){
        map[d]={
          dt:i.dt,
          min:100,
          max:-100,
          main:i.weather[0].main,
          desc:i.weather[0].description,
          icon:i.weather[0].icon
        };
      }
      map[d].min=Math.min(map[d].min,i.main.temp);
      map[d].max=Math.max(map[d].max,i.main.temp);
      map[d].dt=i.dt;
    });

    Object.values(map).slice(0,7).forEach(v=>{
      daily.push({
        dt:v.dt,
        temp:{min:v.min, max:v.max},
        weather:[{main:v.main, description:v.desc}],
        icon:v.icon
      });
    });
  }

  if(showSplash ||!weather){
    return (
      <div className="splash">
        <div className="splash-card">
          <h1>LOCAST</h1>
          <p className="def">
            <b>Lo</b>cation + Fore<b>cast</b>
          </p>
          <p className="tagline">
            Every Location Has a Story.
          </p>
          <div className="splash-loader">
            <div></div>
          </div>
          <p className="meaning">
            Your Location, Broadcasted.
          </p>
        </div>
      </div>
    );
  }

  const formatUnix=(unix,tz)=>
    new Date((unix+tz)*1000)
     .toLocaleTimeString([],{
        hour:'2-digit',
        minute:'2-digit',
        timeZone:'UTC'
      });

  const cityTime=new Date(
    Date.now()+
    new Date().getTimezoneOffset()*60000+
    weather.timezone*1000
  );

  const getLangForLocation=()=>{
    if(!weather) return 'en-IN';
    if(WORLD_LANGS[weather.name]){
      return WORLD_LANGS[weather.name];
    }
    if(COUNTRY_LANG[weather.sys.country]){
      return COUNTRY_LANG[weather.sys.country];
    }
    if(weather.sys.country==='IN'){
      return 'hi-IN';
    }
    return 'en-IN';
  };

  const speakWeather=(forceLang)=>{
    if(isSpeaking){
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const autoLang = getLangForLocation();
    const targetLang = forceLang || autoLang;
    const fn = REPORT_TEMPLATES[targetLang]
      || REPORT_TEMPLATES['default'];
    const text = fn(weather, formatUnix);

    const voice = voices.find(
      v=>v.lang===targetLang
    ) || voices.find(
      v=>v.lang && v.lang.startsWith(
        targetLang.split('-')[0]
      )
    );

    const u = new SpeechSynthesisUtterance(text);
    u.lang = targetLang;
    if(voice) u.voice=voice;
    u.rate=0.9;
    u.onend=()=>setIsSpeaking(false);
    u.onerror=()=>setIsSpeaking(false);

    setIsSpeaking(true);
    setCurrentLang(
      targetLang.split('-')[0].toUpperCase()
    );

    window.speechSynthesis.cancel();
    setTimeout(
      ()=>window.speechSynthesis.speak(u), 100
    );
  };

  const saveCurrent=()=>{
    if(!saved.includes(weather.name)){
      const ns=[...saved,weather.name];
      setSaved(ns);
      localStorage.setItem(
        'locast_saved',JSON.stringify(ns)
      );
    }
  };

  const unsaveCity=(city,e)=>{
    e.preventDefault();
    e.stopPropagation();
    const ns=saved.filter(c=>c!==city);
    setSaved(ns);
    localStorage.setItem(
      'locast_saved',JSON.stringify(ns)
    );
  };

  const iconEmoji=(code)=>{
    if(!code) return '⛅';
    if(code.includes('01')) return '☀️';
    if(code.includes('02')) return '⛅';
    if(code.includes('03')||code.includes('04')){
      return '☁️';
    }
    if(code.includes('09')||code.includes('10')){
      return '🌧️';
    }
    if(code.includes('11')) return '⛈️';
    if(code.includes('13')) return '❄️';
    if(code.includes('50')) return '🌫️';
    return '☀️';
  };

  return(
    <div
      className="app"
      style={{
        backgroundImage: cityImg
         ? `url(${cityImg})`
          : 'none'
      }}
    >
      <div className="bg-overlay"></div>

      <div className="top-bar">
        <button
          className="menu-btn"
          onClick={()=>setMenuOpen(true)}
        >☰</button>

        <div className="search-pill">
          <input
            value={q}
            onChange={e=>setQ(e.target.value)}
            onFocus={()=>setIsFocused(true)}
            onBlur={()=>setIsFocused(false)}
            onKeyDown={e=>e.key==='Enter'&&fetchAll(q)}
            placeholder={
              q? "Search..." : `Search ${typedCity}`
            }
          />
          <button onClick={()=>fetchAll(q)}>⌕</button>
        </div>

        <button
          className="loc-btn"
          onClick={getMyLocation}
        >📍</button>

        <button
          className="voice-btn"
          onClick={()=>speakWeather()}
        >
          {isSpeaking?`⏹️ ${currentLang}`:`🔊 ${currentLang}`}
        </button>

        <button
          className="voice-btn en"
          onClick={()=>speakWeather('en-IN')}
        >EN</button>
      </div>

      <div className="saved-bar">
        {saved.map(c=>(
          <button
            key={c}
            className={c===weather.name?'active':''}
            onClick={()=>fetchAll(c)}
          >
            {c}
            <span
              onClick={(e)=>unsaveCity(c,e)}
              className="x"
            >✕</span>
          </button>
        ))}
        <button
          className="save-add"
          onClick={saveCurrent}
        >+ Save</button>
      </div>

      {alerts&&
        <div className="alert-banner">
          ⚠️ {alerts[0].event} -
          {alerts[0].description.slice(0,100)}
          <button onClick={()=>setAlerts(null)}>✕</button>
        </div>
      }

      <div
        className="hero"
        style={cityImg? {backgroundImage: `url(${cityImg})`} : {}}
      >
        <div className="hero-shade"></div>
        <div className="hero-left">
          <h1>{Math.round(weather.main.temp)}°</h1>
          <p>
            {weather.name}, {weather.sys.country} •
            {weather.weather[0].description} •
            {getLangForLocation()}
          </p>
        </div>
        <div className="hero-right">
          <p>
            {cityTime.toLocaleTimeString([],{
              hour:'2-digit',
              minute:'2-digit'
            })}
          </p>
          <span>
            {cityTime.toLocaleDateString([],{
              weekday:'long',
              day:'numeric',
              month:'short'
            })}
          </span>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <p>💧 Humidity</p>
          <h3>{weather.main.humidity}%</h3>
        </div>
        <div className="card">
          <p>↗ Wind</p>
          <h3>{weather.wind.speed} mph</h3>
        </div>
        <div className="card">
          <p>🧭 Pressure</p>
          <h3>{weather.main.pressure} hPa</h3>
        </div>
        <div className="card">
          <p>👁️ Visibility</p>
          <h3>{(weather.visibility/1000).toFixed(1)} km</h3>
        </div>
        <div className="card">
          <p>☀ Sunrise</p>
          <h3>{formatUnix(weather.sys.sunrise,weather.timezone)}</h3>
        </div>
        <div className="card">
          <p>🌙 Sunset</p>
          <h3>{formatUnix(weather.sys.sunset,weather.timezone)}</h3>
        </div>
      </div>

      <div className="card big">
        <div className="big-head">
          <h3>
            {weather.name} •
            H:{Math.round(weather.main.temp_max)}°
            L:{Math.round(weather.main.temp_min)}°
          </h3>
          <span>Hourly</span>
        </div>
        <div className="hourly">
          {forecast?.list.slice(0,8).map((h,i)=>{
            const d=new Date(
              (h.dt+forecast.city.timezone)*1000
            );
            const time=i===0
             ?'Now'
              :d.toLocaleTimeString('en-GB',{
                hour:'2-digit',
                minute:'2-digit',
                timeZone:'UTC'
              });

            return(
              <div key={i} className="h-item">
                <p>{time}</p>
                <div className="icon-box">
                  {iconEmoji(h.weather[0].icon)}
                </div>
                <b>{Math.round(h.main.temp)}°</b>
              </div>
            )
          })}
        </div>
      </div>

      {/* LIVE RADAR */}
      <div className="pro-row two-col">
        <div className="pro-card radar small">
          <div className="radar-head">
            <h4>🌧️ Live Radar • {weather.name}</h4>
            <span className="live-tag">LIVE</span>
          </div>

          <iframe
            key={mapMode}
            src={
              mapMode === 'rainviewer'
             ? `https://www.rainviewer.com/map.html?loc=${weather.coord.lat},${weather.coord.lon},7&oFa=0&oC=1&oU=0&oCS=1&oF=0&oAP=0&c=1&o=83&lm=0&layer=radar&sm=1&sn=1`
              : `https://embed.windy.com/embed2.html?lat=${weather.coord.lat}&lon=${weather.coord.lon}&zoom=7&level=surface&overlay=${mapMode}&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&detailLat=${weather.coord.lat}&detailLon=${weather.coord.lon}&metricWind=default&metricTemp=default&radarRange=-1`
            }
            title="radar"
            loading="lazy"
            style={{
              width:'100%',
              height:'400px',
              border:0,
              borderRadius:'12px'
            }}
          ></iframe>

          <div style={{
            display:'flex',
            gap:'8px',
            marginTop:'12px',
            flexWrap:'wrap',
            background:'#0a0a0a',
            padding:'6px',
            borderRadius:'100px',
            width:'fit-content',
            border:'1px solid #222'
          }}>
            <button
              onClick={()=>setMapMode('rain')}
              style={{
                padding:'7px 16px',
                borderRadius:'20px',
                border:'none',
                background: mapMode==='rain'? '#fff' : '#2a2a2a',
                color: mapMode==='rain'? '#000' : '#fff',
                fontSize:'12px',
                fontWeight:'800',
                cursor:'pointer'
              }}
            >🌧️ Rain</button>

            <button
              onClick={()=>setMapMode('wind')}
              style={{
                padding:'7px 16px',
                borderRadius:'20px',
                border:'none',
                background: mapMode==='wind'? '#fff' : '#2a2a2a',
                color: mapMode==='wind'? '#000' : '#fff',
                fontSize:'12px',
                fontWeight:'800',
                cursor:'pointer'
              }}
            >💨 Wind</button>

            <a
              href={`https://www.windy.com/${weather.coord.lat}/${weather.coord.lon}`}
              target="_blank"
              rel="noreferrer"
              style={{
                padding:'7px 16px',
                borderRadius:'20px',
                background:'#2a2a2a',
                color:'#fff',
                fontSize:'12px',
                fontWeight:'800',
                textDecoration:'none'
              }}
            >↗ Windy</a>

            <button
              onClick={()=>setMapMode('rainviewer')}
              style={{
                padding:'7px 16px',
                borderRadius:'20px',
                border:'none',
                background: mapMode==='rainviewer'? '#fff' : '#2a2a2a',
                color: mapMode==='rainviewer'? '#000' : '#fff',
                fontSize:'12px',
                fontWeight:'800',
                cursor:'pointer'
              }}
            >🌧️ RainViewer</button>
          </div>
        </div>

        <div className="side-stack">
          <div className="mini-card">
            <h4>🌡️ Feels Like</h4>
            <b>{Math.round(weather.main.feels_like)}°</b>
            <p>
              Actual {Math.round(weather.main.temp)}° •
              {weather.weather[0].description}
            </p>
            <div className="bar">
              <div style={{
                width:`${Math.min(100, Math.round((weather.main.feels_like + 10) * 2))}%`
              }}></div>
            </div>
          </div>

          <div className="mini-card alert-card">
            <h4>⚠️ Alerts</h4>
            {alerts && alerts.length>0
             ? <>
                <b style={{color:'#ff3b30'}}>
                  {alerts[0].event}
                </b>
                <p>
                  {alerts[0].description.slice(0,120)}...
                </p>
              </>
              : <>
                <b style={{color:'#00ff88'}}>
                  ✅ No Alerts
                </b>
                <p>All clear in {weather.name}</p>
              </>
            }
          </div>
        </div>
      </div>

      <div className={`drawer-container ${menuOpen? 'open':''}`}>
        <div
          className="drawer-bg"
          onClick={()=>setMenuOpen(false)}
        ></div>
        <div className="drawer">
          <div className="drawer-head">
            <h2>7-Day • {weather.name}</h2>
            <button onClick={()=>setMenuOpen(false)}>✕</button>
          </div>

          <div className="days-list">
            {daily.map((d,i)=>(
              <div
                key={i}
                className={`day-card ${i===0?'today':''}`}
              >
                <b>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
                    [new Date(d.dt*1000).getDay()]}
                </b>
                <span>
                  {d.weather[0].main==='Clear'
                   ?'☀️'
                    :d.weather[0].main==='Clouds'
                   ?'☁️':'🌧️'}
                </span>
                <span className="desc">
                  {d.weather[0].description}
                </span>
                <span>{Math.round(d.temp.max)}°</span>
                <small>{Math.round(d.temp.min)}°</small>
              </div>
            ))}
          </div>

          {daily.length>0 && (
            <div className="drawer-footer-card">
              <h4>
                Week Overview • {getLangForLocation()}
              </h4>
              <div className="footer-stats">
                <div>
                  <p>Avg High</p>
                  <b>
                    {Math.round(
                      daily.reduce(
                        (a,b)=>a+b.temp.max,0
                      )/daily.length
                    )}°
                  </b>
                </div>
                <div>
                  <p>Avg Low</p>
                  <b>
                    {Math.round(
                      daily.reduce(
                        (a,b)=>a+b.temp.min,0
                      )/daily.length
                    )}°
                  </b>
                </div>
                <div>
                  <p>Trend</p>
                  <b>
                    {daily[0].temp.max <
                      daily[daily.length-1].temp.max
                     ? '↗ Warmer' : '↘ Cooler'}
                  </b>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;