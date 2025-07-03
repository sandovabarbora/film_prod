import React from 'react';
import styled from 'styled-components';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Sunrise, Sunset, MapPin, AlertTriangle } from 'lucide-react';

const WeatherContainer = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LocationSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
`;

const LocationIcon = styled(MapPin)`
  width: 20px;
  height: 20px;
  color: ${({ theme }) => theme.colors.primary};
`;

const LocationName = styled.h2`
  font-size: 1.125rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const WeatherGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const CurrentWeather = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: 2rem;
`;

const CurrentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
`;

const Temperature = styled.div`
  font-size: 4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1;
`;

const WeatherIcon = styled.div`
  svg {
    width: 80px;
    height: 80px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const WeatherDescription = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
`;

const WeatherDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
`;

const DetailCard = styled.div`
  text-align: center;
`;

const DetailIcon = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const DetailLabel = styled.p`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.p`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const SunTimes = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: 2rem;
`;

const SunTimeCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.gray[700]};
  }
`;

const SunTimeInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme.colors.warning};
  }
`;

const SunTimeLabel = styled.p`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const SunTimeValue = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ForecastSection = styled.div`
  background: ${({ theme }) => theme.colors.gray[800]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 12px;
  padding: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.5rem;
`;

const ForecastGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
`;

const ForecastCard = styled.div`
  background: ${({ theme }) => theme.colors.gray[750]};
  border: 1px solid ${({ theme }) => theme.colors.gray[700]};
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
`;

const ForecastDay = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const ForecastIcon = styled.div`
  margin: 0.5rem 0;
  
  svg {
    width: 32px;
    height: 32px;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ForecastTemp = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const TempHigh = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 600;
`;

const TempLow = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const WeatherAlert = styled.div`
  background: ${({ theme }) => theme.colors.warning}20;
  border: 1px solid ${({ theme }) => theme.colors.warning};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme.colors.warning};
  }
`;

const AlertText = styled.p`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.875rem;
`;

const Weather: React.FC = () => {
  // Mock weather data
  const currentWeather = {
    temperature: 15,
    description: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 12,
    visibility: 10,
    sunrise: '06:45',
    sunset: '17:30',
    goldenHour: '16:30',
    blueHour: '17:00'
  };
  
  const forecast = [
    { day: 'Today', high: 15, low: 8, icon: Cloud },
    { day: 'Tomorrow', high: 17, low: 10, icon: Sun },
    { day: 'Thursday', high: 14, low: 9, icon: CloudRain },
    { day: 'Friday', high: 16, low: 11, icon: Cloud },
    { day: 'Saturday', high: 18, low: 12, icon: Sun },
    { day: 'Sunday', high: 19, low: 13, icon: Sun },
  ];

  return (
    <WeatherContainer>
      <PageHeader>
        <Title>Weather Forecast</Title>
      </PageHeader>
      
      <LocationSelector>
        <LocationIcon />
        <LocationName>Prague, Czech Republic - Production Location</LocationName>
      </LocationSelector>
      
      <WeatherAlert>
        <AlertTriangle />
        <AlertText>
          Light rain expected Thursday afternoon. Consider rescheduling outdoor scenes or prepare rain covers.
        </AlertText>
      </WeatherAlert>
      
      <WeatherGrid>
        <CurrentWeather>
          <CurrentHeader>
            <div>
              <Temperature>{currentWeather.temperature}°C</Temperature>
              <WeatherDescription>{currentWeather.description}</WeatherDescription>
            </div>
            <WeatherIcon>
              <Cloud />
            </WeatherIcon>
          </CurrentHeader>
          
          <WeatherDetails>
            <DetailCard>
              <DetailIcon><Droplets /></DetailIcon>
              <DetailLabel>Humidity</DetailLabel>
              <DetailValue>{currentWeather.humidity}%</DetailValue>
            </DetailCard>
            
            <DetailCard>
              <DetailIcon><Wind /></DetailIcon>
              <DetailLabel>Wind Speed</DetailLabel>
              <DetailValue>{currentWeather.windSpeed} km/h</DetailValue>
            </DetailCard>
            
            <DetailCard>
              <DetailIcon><Eye /></DetailIcon>
              <DetailLabel>Visibility</DetailLabel>
              <DetailValue>{currentWeather.visibility} km</DetailValue>
            </DetailCard>
          </WeatherDetails>
        </CurrentWeather>
        
        <SunTimes>
          <SectionTitle>Light Information</SectionTitle>
          
          <SunTimeCard>
            <SunTimeInfo>
              <Sunrise />
              <div>
                <SunTimeLabel>Sunrise</SunTimeLabel>
                <SunTimeValue>{currentWeather.sunrise}</SunTimeValue>
              </div>
            </SunTimeInfo>
          </SunTimeCard>
          
          <SunTimeCard>
            <SunTimeInfo>
              <Sun />
              <div>
                <SunTimeLabel>Golden Hour</SunTimeLabel>
                <SunTimeValue>{currentWeather.goldenHour}</SunTimeValue>
              </div>
            </SunTimeInfo>
          </SunTimeCard>
          
          <SunTimeCard>
            <SunTimeInfo>
              <Cloud />
              <div>
                <SunTimeLabel>Blue Hour</SunTimeLabel>
                <SunTimeValue>{currentWeather.blueHour}</SunTimeValue>
              </div>
            </SunTimeInfo>
          </SunTimeCard>
          
          <SunTimeCard>
            <SunTimeInfo>
              <Sunset />
              <div>
                <SunTimeLabel>Sunset</SunTimeLabel>
                <SunTimeValue>{currentWeather.sunset}</SunTimeValue>
              </div>
            </SunTimeInfo>
          </SunTimeCard>
        </SunTimes>
      </WeatherGrid>
      
      <ForecastSection>
        <SectionTitle>6-Day Forecast</SectionTitle>
        <ForecastGrid>
          {forecast.map((day, index) => (
            <ForecastCard key={index}>
              <ForecastDay>{day.day}</ForecastDay>
              <ForecastIcon>
                <day.icon />
              </ForecastIcon>
              <ForecastTemp>
                <TempHigh>{day.high}°</TempHigh>
                <TempLow>{day.low}°</TempLow>
              </ForecastTemp>
            </ForecastCard>
          ))}
        </ForecastGrid>
      </ForecastSection>
    </WeatherContainer>
  );
};

export default Weather;