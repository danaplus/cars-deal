import React, { useState, useEffect } from 'react';

const App = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState(null);
  
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [carFormModalOpen, setCarFormModalOpen] = useState(false);
  const [carDetailsModalOpen, setCarDetailsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [selectedCar, setSelectedCar] = useState(null);

  const [filters, setFilters] = useState({
    type: '',
    manufacturer: '',
    minYear: '',
    search: '',
    inStock: ''
  });

  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('https://api.sabresai.com/api/cars_data?client_id=cars');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const carsData = result.data || [];
      
      const groupedByAd = carsData.reduce((acc, car) => {
        const adId = car.ad_id || car.media_id;
        if (!acc[adId]) {
          acc[adId] = {
            ad_id: adId,
            images: [],
            company_name: car.company_name,
            model_name: car.model_name,
            year: car.year,
            km: car.km,
            price: car.price,
            description: car.description,
            in_stock: car.in_stock,
            is_valid: car.is_valid,
            missing_fields: car.missing_fields || [],
            from: car.from,
            timestamp: car.timestamp
          };
        }
        
        acc[adId].images.push({
          media_id: car.media_id,
          url: car.s3_url,
          caption: car.caption
        });
        
        if (car.description && (!acc[adId].description || car.description_timestamp > acc[adId].description_timestamp)) {
          acc[adId].company_name = car.company_name || acc[adId].company_name;
          acc[adId].model_name = car.model_name || acc[adId].model_name;
          acc[adId].year = car.year || acc[adId].year;
          acc[adId].km = car.km || acc[adId].km;
          acc[adId].price = car.price || acc[adId].price;
          acc[adId].description = car.description || acc[adId].description;
          acc[adId].in_stock = car.in_stock !== undefined ? car.in_stock : acc[adId].in_stock;
          acc[adId].is_valid = car.is_valid !== undefined ? car.is_valid : acc[adId].is_valid;
          acc[adId].missing_fields = car.missing_fields || acc[adId].missing_fields;
          acc[adId].description_timestamp = car.description_timestamp;
        }
        
        return acc;
      }, {});
      
      const transformedCars = Object.values(groupedByAd).map(ad => ({
        id: ad.ad_id,
        ad_id: ad.ad_id,
        manufacturer: ad.company_name || 'יצרן',
        model: ad.model_name || ad.description || 'רכב',
        fullName: `${ad.company_name || ''} ${ad.model_name || ''}`.trim() || ad.description || 'רכב',
        year: parseInt(ad.year) || new Date().getFullYear(),
        km: parseInt(ad.km) || 0,
        price: parseInt(ad.price) || 0,
        type: determineCarType(ad.model_name, ad.company_name, ad.description),
        inStock: ad.in_stock !== false,
        images: ad.images,
        image: ad.images[0]?.url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d',
        description: ad.description || ad.images[0]?.caption || 'רכב איכותי',
        phone: '074-7000-222',
        email: 'info@sevres-auto.com',
        from: ad.from,
        timestamp: ad.timestamp,
        is_valid: ad.is_valid,
        missing_fields: ad.missing_fields,
        isElectric: isElectricCar(ad.model_name, ad.company_name, ad.description),
        isNew: isNewCar(ad.year),
        badge: determineBadge(ad.model_name, ad.company_name, ad.description, ad.year, ad.in_stock)
      }));
      
      setCars(transformedCars);
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Error fetching cars:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const isElectricCar = (modelName, companyName, description) => {
    const text = `${modelName} ${companyName} ${description}`.toLowerCase();
    return text.includes('חשמלי') || text.includes('electric') || text.includes('ev') || 
           text.includes('e-tron') || text.includes('id.') || text.includes('eq') ||
           text.includes('leaf') || text.includes('tesla');
  };

  const isNewCar = (year) => {
    const currentYear = new Date().getFullYear();
    return parseInt(year) >= currentYear;
  };

  const determineBadge = (modelName, companyName, description, year, inStock) => {
    const text = `${modelName} ${companyName} ${description}`.toLowerCase();
    
    if (text.includes('חשמלי') || text.includes('electric') || text.includes('ev')) {
      return { text: '⚡ חשמלי', color: '#0066FF' };
    }
    
    if (parseInt(year) >= new Date().getFullYear()) {
      return { text: '🌟 חדש', color: '#10B981' };
    }
    
    if (text.includes('מנהלים') || text.includes('executive') || text.includes('premium')) {
      return { text: '👔 מנהלים', color: '#1A1A1A' };
    }
    
    return null;
  };

  const determineCarType = (modelName, companyName, description) => {
    const text = `${modelName} ${companyName} ${description}`.toLowerCase();
    
    if (text.includes('x5') || text.includes('q7') || text.includes('טיגואן') || 
        text.includes('suv') || text.includes('שטח') || text.includes('santa')) {
      return 'שטח';
    }
    if (text.includes('sport') || text.includes('ספורט') || text.includes('amg') || 
        text.includes('m3') || text.includes('porsche')) {
      return 'ספורט';
    }
    if (text.includes('משפחתי') || text.includes('7 מקומות') || text.includes('מיניvan')) {
      return 'משפחתי';
    }
    return 'פרטי';
  };

  useEffect(() => {
    let filtered = cars.filter(car => {
      return (!filters.type || car.type === filters.type) &&
             (!filters.manufacturer || car.manufacturer.includes(filters.manufacturer)) &&
             (car.price >= priceRange[0] && car.price <= priceRange[1]) &&
             (!filters.minYear || car.year >= parseInt(filters.minYear)) &&
             (!filters.inStock || (filters.inStock === 'true' ? car.inStock : !car.inStock)) &&
             (!filters.search || 
              car.fullName.toLowerCase().includes(filters.search.toLowerCase()) || 
              car.description.toLowerCase().includes(filters.search.toLowerCase()));
    });

    if (sortBy !== 'default') {
      filtered = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'price-low': return a.price - b.price;
          case 'price-high': return b.price - a.price;
          case 'year-new': return b.year - a.year;
          case 'year-old': return a.year - b.year;
          case 'km-low': return a.km - b.km;
          case 'km-high': return b.km - a.km;
          default: return 0;
        }
      });
    }

    setFilteredCars(filtered);
  }, [cars, filters, sortBy, priceRange]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ type: '', manufacturer: '', minYear: '', search: '', inStock: '' });
    setSortBy('default');
    setPriceRange([0, 2000000]);
  };

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setCarDetailsModalOpen(true);
  };

  // ===============================
  // UI COMPONENTS
  // ===============================

  const Button = ({ children, onClick, variant = 'primary', type = 'button', style = {} }) => {
    const styles = {
      primary: { background: '#0066FF', color: 'white', border: 'none' },
      secondary: { background: 'transparent', color: '#0066FF', border: '2px solid #0066FF' },
      dark: { background: '#1A1A1A', color: 'white', border: 'none' },
      outline: { background: 'transparent', color: '#333', border: '1px solid #ddd' }
    };

    return (
      <button
        type={type}
        onClick={onClick}
        style={{
          padding: '12px 28px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          fontFamily: "'Heebo', sans-serif",
          ...styles[variant],
          ...style
        }}
        onMouseEnter={(e) => {
          if (variant === 'primary') e.currentTarget.style.background = '#004ECC';
          if (variant === 'dark') e.currentTarget.style.background = '#000';
        }}
        onMouseLeave={(e) => {
          if (variant === 'primary') e.currentTarget.style.background = '#0066FF';
          if (variant === 'dark') e.currentTarget.style.background = '#1A1A1A';
        }}
      >
        {children}
      </button>
    );
  };

  if (loading) {
    return (
      <div style={{
        fontFamily: "'Heebo', sans-serif",
        background: '#FFFFFF',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '30px'
      }}>
        <div style={{ 
          fontSize: '5rem', 
          animation: 'fadeInOut 2s ease-in-out infinite',
          filter: 'grayscale(20%)'
        }}>🚗</div>
        <div style={{ fontSize: '1.8rem', color: '#1A1A1A', fontWeight: 700 }}>טוען קטלוג רכבים...</div>
        <div style={{ 
          width: '250px', 
          height: '3px', 
          background: '#F5F6F7', 
          borderRadius: '2px', 
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ 
            position: 'absolute',
            width: '40%', 
            height: '100%', 
            background: '#0066FF',
            borderRadius: '2px',
            animation: 'loading 1.5s ease-in-out infinite'
          }} />
        </div>
        <style>{`
          @keyframes fadeInOut {
            0%, 100% { opacity: 0.4; transform: scale(0.95); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          @keyframes loading {
            0% { left: -40%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        fontFamily: "'Heebo', sans-serif",
        background: '#FFFFFF',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '25px',
        padding: '20px'
      }}>
        <div style={{ fontSize: '4.5rem', opacity: 0.3 }}>⚠️</div>
        <div style={{ fontSize: '1.8rem', color: '#1A1A1A', fontWeight: 700 }}>שגיאה בטעינת הקטלוג</div>
        <div style={{ color: '#666', textAlign: 'center', maxWidth: '500px', lineHeight: 1.6 }}>{error}</div>
        <Button onClick={fetchCars} variant="primary">🔄 טען מחדש</Button>
      </div>
    );
  }

  const TopBar = () => (
    <div style={{ background: '#1A1A1A', color: 'white', padding: '14px 0', fontSize: '14px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '35px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
            📞 <span style={{ letterSpacing: '0.5px' }}>074-7000-222</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}>
            ✉️ info@sevres-auto.com
          </span>
        </div>
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', fontWeight: 500, transition: 'color 0.3s' }}
                onMouseEnter={(e) => e.target.style.color = '#0066FF'}
                onMouseLeave={(e) => e.target.style.color = 'white'}>
            👤 התחברות
          </span>
          <Button variant="primary" style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 600 }}>
            📅 תיאום פגישה
          </Button>
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <header style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 1000 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '25px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '55px',
              height: '55px',
              background: 'linear-gradient(135deg, #0066FF 0%, #004ECC 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,102,255,0.25)'
            }}>
              <span style={{ fontSize: '28px' }}>🚗</span>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1A', letterSpacing: '-0.5px' }}>
                סוכנות סברס
              </div>
              <div style={{ fontSize: '11px', color: '#999', letterSpacing: '2px', fontWeight: 600, marginTop: '2px' }}>
                SEVRES MOTORS
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: '550px', margin: '0 50px', position: 'relative' }}>
            <input
              type="text"
              placeholder="חפש לפי דגם, יצרן או מילות מפתח..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{
                width: '100%',
                padding: '14px 50px 14px 20px',
                border: '2px solid #e0e0e0',
                borderRadius: '25px',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.3s',
                fontFamily: "'Heebo', sans-serif"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#0066FF';
                e.target.style.boxShadow = '0 0 0 4px rgba(0,102,255,0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              color: '#999',
              pointerEvents: 'none'
            }}>
              🔍
            </div>
          </div>

          {/* Menu Icon */}
          <div style={{ fontSize: '28px', cursor: 'pointer', color: '#1A1A1A' }}>☰</div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div style={{ background: '#0066FF', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px' }}>
          <nav style={{ display: 'flex', justifyContent: 'center', gap: '50px', padding: '18px 0' }}>
            {['קטלוג רכבים', 'ליסינג לעסקים', 'רכב חשמלי', 'הוואלה לדרך', 'סרייט-אין', 'יד 2'].map(item => (
              <a 
                key={item}
                href="#" 
                style={{ 
                  color: 'white', 
                  textDecoration: 'none', 
                  fontWeight: 600, 
                  fontSize: '15px',
                  transition: 'all 0.3s',
                  position: 'relative',
                  fontFamily: "'Heebo', sans-serif"
                }}
                onMouseEnter={(e) => {
                  e.target.style.opacity = '0.85';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.opacity = '1';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );

  const InteractiveFilters = () => {
    const manufacturers = [...new Set(cars.map(c => c.manufacturer))].filter(Boolean);
    
    return (
      <div style={{ background: 'white', padding: '35px 0', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px' }}>
          {/* Active Filters Display */}
          {(filters.type || filters.manufacturer || filters.minYear || priceRange[0] > 0 || priceRange[1] < 2000000) && (
            <div style={{ marginBottom: '25px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: 600 }}>מסננים פעילים:</span>
              {filters.type && (
                <span style={{ 
                  background: '#F5F6F7', 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontSize: '13px',
                  color: '#333',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {filters.type}
                  <span style={{ cursor: 'pointer', fontSize: '16px' }} onClick={() => handleFilterChange('type', '')}>×</span>
                </span>
              )}
              {filters.manufacturer && (
                <span style={{ 
                  background: '#F5F6F7', 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontSize: '13px',
                  color: '#333',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {filters.manufacturer}
                  <span style={{ cursor: 'pointer', fontSize: '16px' }} onClick={() => handleFilterChange('manufacturer', '')}>×</span>
                </span>
              )}
            </div>
          )}

          {/* Filter Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', alignItems: 'end' }}>
            {/* Price Range */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontSize: '14px', 
                color: '#333', 
                fontWeight: 700,
                fontFamily: "'Heebo', sans-serif"
              }}>
                טווח מחיר
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="מינימום"
                  value={priceRange[0] > 0 ? priceRange[0] : ''}
                  onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: "'Heebo', sans-serif",
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0066FF'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
                <input
                  type="number"
                  placeholder="מקסימום"
                  value={priceRange[1] < 2000000 ? priceRange[1] : ''}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 2000000])}
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: "'Heebo', sans-serif",
                    transition: 'border-color 0.3s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#0066FF'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>
            </div>

            {/* Car Type */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontSize: '14px', 
                color: '#333', 
                fontWeight: 700,
                fontFamily: "'Heebo', sans-serif"
              }}>
                סוג רכב
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer',
                  fontFamily: "'Heebo', sans-serif",
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0066FF'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              >
                <option value="">כל הסוגים</option>
                <option value="פרטי">🚗 פרטי</option>
                <option value="משפחתי">👨‍👩‍👧‍👦 משפחתי</option>
                <option value="ספורט">🏎️ ספורט</option>
                <option value="שטח">🚙 שטח</option>
              </select>
            </div>

            {/* Manufacturer */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontSize: '14px', 
                color: '#333', 
                fontWeight: 700,
                fontFamily: "'Heebo', sans-serif"
              }}>
                יצרן
              </label>
              <select
                value={filters.manufacturer}
                onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer',
                  fontFamily: "'Heebo', sans-serif",
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0066FF'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              >
                <option value="">כל היצרנים</option>
                {manufacturers.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontSize: '14px', 
                color: '#333', 
                fontWeight: 700,
                fontFamily: "'Heebo', sans-serif"
              }}>
                שנה מינימלית
              </label>
              <input
                type="number"
                placeholder="2020"
                value={filters.minYear}
                onChange={(e) => handleFilterChange('minYear', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontFamily: "'Heebo', sans-serif",
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0066FF'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            {/* Sort */}
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px', 
                fontSize: '14px', 
                color: '#333', 
                fontWeight: 700,
                fontFamily: "'Heebo', sans-serif"
              }}>
                מיון לפי
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer',
                  fontFamily: "'Heebo', sans-serif",
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0066FF'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              >
                <option value="default">מומלץ מאוד</option>
                <option value="price-low">מחיר: נמוך → גבוה</option>
                <option value="price-high">מחיר: גבוה → נמוך</option>
                <option value="year-new">שנה: חדש → ישן</option>
                <option value="km-low">ק"מ: נמוך → גבוה</option>
              </select>
            </div>

            {/* Clear Button */}
            <Button onClick={clearFilters} variant="outline" style={{ padding: '12px 24px', fontWeight: 600 }}>
              🔄 נקה הכל
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const CarCard = ({ car, index }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const images = car.images || [{ url: car.image }];
    
    const monthlyPayment = car.price > 0 ? Math.round(car.price / 60) : 0;
    
    return (
      <div 
        style={{
          background: 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: isHovered ? '0 12px 24px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          position: 'relative',
          transform: isHovered ? 'translateY(-8px)' : 'translateY(0)',
          animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => handleViewDetails(car)}
      >
        {/* Badge */}
        {car.badge && (
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: car.badge.color,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontFamily: "'Heebo', sans-serif"
          }}>
            {car.badge.text}
          </div>
        )}

        {/* Image Section */}
        <div style={{
          width: '100%',
          height: '260px',
          backgroundImage: `url(${images[currentImageIndex].url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          transition: 'transform 0.4s ease'
        }}>
          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
                }}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(26, 26, 26, 0.75)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  opacity: isHovered ? 1 : 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(26, 26, 26, 0.75)'}
              >
                ◀
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev + 1) % images.length);
                }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(26, 26, 26, 0.75)',
                  backdropFilter: 'blur(4px)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s',
                  opacity: isHovered ? 1 : 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(26, 26, 26, 0.75)'}
              >
                ▶
              </button>

              {/* Dots */}
              <div style={{
                position: 'absolute',
                bottom: '14px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                opacity: isHovered ? 1 : 0.7,
                transition: 'opacity 0.3s'
              }}>
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(idx);
                    }}
                    style={{
                      width: idx === currentImageIndex ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: idx === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent)',
            pointerEvents: 'none'
          }} />
        </div>

        {/* Content Section */}
        <div style={{ padding: '24px' }}>
          {/* Year Badge */}
          <div style={{
            display: 'inline-block',
            background: '#F5F6F7',
            padding: '6px 14px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#666',
            marginBottom: '14px',
            fontFamily: "'Heebo', sans-serif"
          }}>
            {car.year}
          </div>

          {/* Car Name */}
          <h3 style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#1A1A1A',
            marginBottom: '10px',
            lineHeight: 1.3,
            fontFamily: "'Heebo', sans-serif",
            letterSpacing: '-0.3px'
          }}>
            {car.fullName}
          </h3>

          {/* Details */}
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '18px',
            fontWeight: 500,
            fontFamily: "'Heebo', sans-serif"
          }}>
            {car.type} • {car.km.toLocaleString()} ק"מ
          </p>

          {/* Price Section */}
          <div style={{
            borderTop: '1px solid #F5F6F7',
            paddingTop: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ 
                fontSize: '12px', 
                color: '#999', 
                marginBottom: '6px',
                fontWeight: 600,
                fontFamily: "'Heebo', sans-serif"
              }}>
                החל מ-
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 800,
                color: '#0066FF',
                fontFamily: "'Heebo', sans-serif",
                letterSpacing: '-0.5px'
              }}>
                {car.price > 0 ? `₪${car.price.toLocaleString()}` : 'לפי בקשה'}
              </div>
            </div>
            
            {monthlyPayment > 0 && (
              <div style={{ 
                textAlign: 'left',
                background: '#F5F6F7',
                padding: '10px 16px',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '11px', color: '#999', marginBottom: '4px', fontWeight: 600 }}>
                  החזר חודשי מ-
                </div>
                <div style={{ 
                  fontWeight: 700, 
                  color: '#1A1A1A',
                  fontSize: '16px',
                  fontFamily: "'Heebo', sans-serif"
                }}>
                  ₪{monthlyPayment.toLocaleString()}
                </div>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <Button 
            variant="primary" 
            style={{ 
              width: '100%', 
              justifyContent: 'center',
              marginTop: '18px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 700
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(car);
            }}
          >
            📋 לפרטים נוספים
          </Button>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    );
  };

  const CarsGrid = () => {
    if (filteredCars.length === 0) {
      return (
        <div style={{
          textAlign: 'center',
          padding: '100px 30px',
          color: '#666'
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '25px', opacity: 0.2 }}>🔍</div>
          <div style={{ 
            fontSize: '24px', 
            marginBottom: '15px', 
            fontWeight: 700,
            color: '#1A1A1A',
            fontFamily: "'Heebo', sans-serif"
          }}>
            לא נמצאו תוצאות
          </div>
          <div style={{ 
            fontSize: '16px',
            color: '#999',
            marginBottom: '35px',
            fontFamily: "'Heebo', sans-serif"
          }}>
            נסה לשנות את המסננים או לבצע חיפוש אחר
          </div>
          <Button onClick={clearFilters} variant="primary">
            🔄 נקה מסננים
          </Button>
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '28px'
      }}>
        {filteredCars.map((car, index) => <CarCard key={car.id} car={car} index={index} />)}
      </div>
    );
  };

  const Footer = () => (
    <footer style={{
      background: '#1A1A1A',
      color: 'white',
      padding: '70px 0 30px',
      marginTop: '100px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 30px',
        textAlign: 'center'
      }}>
        <div style={{ 
          fontSize: '32px',
          fontWeight: 800,
          marginBottom: '15px',
          fontFamily: "'Heebo', sans-serif",
          letterSpacing: '-0.5px'
        }}>
          סוכנות סברס
        </div>
        <p style={{ 
          color: '#999', 
          marginBottom: '25px',
          fontSize: '15px',
          fontFamily: "'Heebo', sans-serif"
        }}>
          © 2024 כל הזכויות שמורות • נתונים בזמן אמת מהמאגר
        </p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '40px',
          fontSize: '14px',
          color: '#999',
          fontFamily: "'Heebo', sans-serif"
        }}>
          <span>{filteredCars.length} רכבים זמינים</span>
          <span>•</span>
          <span>📞 074-7000-222</span>
          <span>•</span>
          <span>✉️ info@sevres-auto.com</span>
        </div>
      </div>
    </footer>
  );

  return (
    <div style={{
      fontFamily: "'Heebo', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#FFFFFF',
      minHeight: '100vh',
      direction: 'rtl'
    }}>
      <TopBar />
      <Header />
      <InteractiveFilters />

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '50px 30px'
      }}>
        {/* Page Title */}
        <div style={{
          marginBottom: '50px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: 800,
            color: '#1A1A1A',
            marginBottom: '12px',
            fontFamily: "'Heebo', sans-serif",
            letterSpacing: '-1px'
          }}>
            חיפוש דגמים
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#666',
            fontWeight: 500,
            fontFamily: "'Heebo', sans-serif"
          }}>
            תוצאות: <strong style={{ color: '#0066FF' }}>{filteredCars.length}</strong>
          </p>
        </div>

        <CarsGrid />
      </div>

      <Footer />

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/972747000222"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '35px',
          left: '35px',
          width: '65px',
          height: '65px',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(37, 211, 102, 0.4)',
          zIndex: 1000,
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          animation: 'pulse 2s infinite'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(37, 211, 102, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.4)';
        }}
      >
        <span style={{ fontSize: '34px' }}>💬</span>
      </a>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
          }
          50% {
            box-shadow: 0 6px 30px rgba(37, 211, 102, 0.6);
          }
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default App;
