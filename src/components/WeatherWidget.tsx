import { useState, useEffect } from 'react';
import { CloudSun, CloudRain, Sun, Cloud, Snowflake, CloudLightning } from 'lucide-react';

const WEATHER_CODES: Record<number, { label: string; icon: typeof Sun }> = {
  0: { label: 'Ciel dégagé', icon: Sun },
  1: { label: 'Plutôt dégagé', icon: Sun },
  2: { label: 'Partiellement nuageux', icon: CloudSun },
  3: { label: 'Couvert', icon: Cloud },
  45: { label: 'Brouillard', icon: Cloud },
  48: { label: 'Brouillard givrant', icon: Cloud },
  51: { label: 'Bruine', icon: CloudRain },
  53: { label: 'Bruine', icon: CloudRain },
  55: { label: 'Bruine dense', icon: CloudRain },
  61: { label: 'Pluie légère', icon: CloudRain },
  63: { label: 'Pluie', icon: CloudRain },
  65: { label: 'Forte pluie', icon: CloudRain },
  71: { label: 'Neige légère', icon: Snowflake },
  73: { label: 'Neige', icon: Snowflake },
  75: { label: 'Forte neige', icon: Snowflake },
  80: { label: 'Averses', icon: CloudRain },
  81: { label: 'Averses', icon: CloudRain },
  82: { label: 'Violentes averses', icon: CloudRain },
  95: { label: 'Orage', icon: CloudLightning },
  96: { label: 'Orage et grêle', icon: CloudLightning },
};

const getWeatherInfo = (code: number) =>
  WEATHER_CODES[code] || { label: 'Données indisponibles', icon: CloudSun };

interface WeatherWidgetProps {
  city?: string;
  latitude?: number;
  longitude?: number;
  className?: string;
}

const WeatherWidget = ({ city = 'Villeurbanne', latitude = 45.77, longitude = 4.88, className = '' }: WeatherWidgetProps) => {
  const [data, setData] = useState<{ temp: number; code: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
    )
      .then((res) => res.json())
      .then((d) => {
        if (d?.current_weather) {
          setData({
            temp: Math.round(d.current_weather.temperature),
            code: d.current_weather.weathercode,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [latitude, longitude]);

  const info = data ? getWeatherInfo(data.code) : null;
  const Icon = info?.icon ?? CloudSun;

  return (
    <div
      className={`fintech-card p-4 flex flex-col justify-between min-h-[120px] border border-foreground/5 ${className}`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          Météo
        </span>
        <Icon size={22} className="text-amber-400 shrink-0" />
      </div>
      <div>
        {loading ? (
          <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        ) : (
          <>
            <div className="text-3xl font-bold tracking-tighter">{data?.temp ?? '--'}°</div>
            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{info?.label}</p>
            <p className="text-[10px] text-muted-foreground">{city}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default WeatherWidget;
