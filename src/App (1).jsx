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
    maxPrice: '',
    minYear: '',
    search: '',
    inStock: ''
  });

  const [sortBy, setSortBy] = useState('default');

  // ✅ Fetch cars from API on mount
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
      console.log('📥 API Response:', result);
      
      const carsData = result.data || [];
      
      // ✅ קיבוץ לפי ad_id
      const groupedByAd = carsData.reduce((acc, car) => {
        const adId = car.ad_id || car.media_id;
        if (!acc[adId]) {
          acc[adId] = {
            ad_id: adId,
            images: [],
            // נשתמש בנתונים מהתיאור הראשון שיש לו
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
        
        // הוספת התמונה לרשימה
        acc[adId].images.push({
          media_id: car.media_id,
          url: car.s3_url,
          caption: car.caption
        });
        
        // עדכון נתונים אם התיאור יותר עדכני
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
      
      // המרה למערך ופורמט האתר
      const transformedCars = Object.values(groupedByAd).map(ad => ({
        id: ad.ad_id,
        ad_id: ad.ad_id,
        
        // Car Details
        model: `${ad.company_name || ''} ${ad.model_name || ''}`.trim() || ad.description || 'רכב ללא שם',
        year: parseInt(ad.year) || new Date().getFullYear(),
        km: parseInt(ad.km) || 0,
        price: parseInt(ad.price) || 0,
        
        type: determineCarType(ad.model_name, ad.company_name, ad.description),
        inStock: ad.in_stock !== false,
        
        // Images - array of all images for this ad
        images: ad.images,
        image: ad.images[0]?.url || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d',
        
        description: ad.description || ad.images[0]?.caption || 'רכב איכותי',
        
        phone: '074-7000-222',
        email: 'info@sevres-auto.com',
        
        from: ad.from,
        timestamp: ad.timestamp,
        is_valid: ad.is_valid,
        missing_fields: ad.missing_fields
      }));
      
      console.log('✅ Transformed cars:', transformedCars);
      console.log(`📊 Total: ${carsData.length} images → ${transformedCars.length} ads`);
      setCars(transformedCars);
      setLoading(false);
      
    } catch (err) {
      console.error('❌ Error fetching cars:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // ✅ קביעת סוג רכב
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
    if (text.includes('משפחתי') || text.includes('7 מקומות') || text.includes('מינivan')) {
      return 'משפחתי';
    }
    return 'פרטי';
  };

  // Filter and sort logic
  useEffect(() => {
    let filtered = cars.filter(car => {
      return (!filters.type || car.type === filters.type) &&
             (!filters.maxPrice || car.price <= parseInt(filters.maxPrice)) &&
             (!filters.minYear || car.year >= parseInt(filters.minYear)) &&
             (!filters.inStock || (filters.inStock === 'true' ? car.inStock : !car.inStock)) &&
             (!filters.search || 
              car.model.toLowerCase().includes(filters.search.toLowerCase()) || 
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
          case 'inStock': return (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0);
          default: return 0;
        }
      });
    }

    setFilteredCars(filtered);
  }, [cars, filters, sortBy]);

  // Message handling
  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
  };

  const clearMessage = () => {
    setMessage(null);
  };

  // Auth functions
  const handleLogin = (username, password) => {
    if (username === 'admin' && password === '123456') {
      setCurrentUser({ username: 'admin', role: 'admin' });
      setLoginModalOpen(false);
      showMessage('🎉 התחברת בהצלחה למערכת הניהול!', 'success');
    } else {
      showMessage('❌ שם משתמש או סיסמה שגויים', 'error');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showMessage('👋 התנתקת בהצלחה מהמערכת', 'success');
  };

  // Filter functions
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ type: '', maxPrice: '', minYear: '', search: '', inStock: '' });
    setSortBy('default');
  };

  // Car management
  const handleAddCar = () => {
    setEditingCar(null);
    setCarFormModalOpen(true);
  };

  const handleEditCar = (car) => {
    setEditingCar(car);
    setCarFormModalOpen(true);
  };

  const handleSaveCar = async (carData) => {
    try {
      const response = await fetch('https://api.sabresai.com/api/cars_data?client_id=cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_id: carData.id || `manual_${Date.now()}`,
          caption: carData.description,
          description: `${carData.model} ${carData.year} ${carData.km} ק"מ`,
          company_name: carData.model.split(' ')[0],
          model_name: carData.model.split(' ').slice(1).join(' '),
          year: carData.year.toString(),
          km: carData.km.toString(),
          price: carData.price ? carData.price.toString() : null,
          s3_url: carData.image,
          in_stock: carData.inStock,
          client_id: 'cars',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save car');
      }

      await fetchCars();
      showMessage(editingCar ? '✅ הרכב עודכן בהצלחה!' : '🎉 הרכב נוסף בהצלחה לקטלוג!', 'success');
      setCarFormModalOpen(false);
      setEditingCar(null);
      
    } catch (error) {
      console.error('Error saving car:', error);
      showMessage('❌ שגיאה בשמירת הרכב', 'error');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (window.confirm('🗑️ האם אתה בטוח שברצונך למחוק את הרכב מהקטלוג?')) {
      // TODO: Add DELETE endpoint to API
      setCars(prev => prev.filter(car => car.id !== carId));
      showMessage('🗑️ הרכב נמחק בהצלחה מהמערכת!', 'success');
    }
  };

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setCarDetailsModalOpen(true);
  };

  const isAdmin = currentUser && currentUser.role === 'admin';

  // ===============================
  // UI COMPONENTS
  // ===============================

  const Button = ({ children, onClick, variant = 'primary', type = 'button', style = {} }) => {
    const styles = {
      primary: { background: '#0066cc', color: 'white' },
      secondary: { background: 'transparent', color: '#0066cc', border: '2px solid #0066cc' },
      success: { background: '#059669', color: 'white' },
      danger: { background: '#dc2626', color: 'white' }
    };

    return (
      <button
        type={type}
        onClick={onClick}
        style={{
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '14px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease',
          ...styles[variant],
          ...style
        }}
      >
        {children}
      </button>
    );
  };

  // Loading State
  if (loading) {
    return (
      <div style={{
        fontFamily: "'Heebo', sans-serif",
        background: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '4rem', animation: 'pulse 2s ease-in-out infinite' }}>🚗</div>
        <div style={{ fontSize: '1.5rem', color: '#0066cc', fontWeight: 600 }}>טוען מודעות מהמאגר...</div>
        <div style={{ 
          width: '200px', 
          height: '4px', 
          background: '#e0e0e0', 
          borderRadius: '2px', 
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{ 
            position: 'absolute',
            width: '50%', 
            height: '100%', 
            background: 'linear-gradient(90deg, #0066cc, #3b82f6)',
            borderRadius: '2px',
            animation: 'loading 1.5s ease-in-out infinite'
          }} />
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
          }
          @keyframes loading {
            0% { left: -50%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div style={{
        fontFamily: "'Heebo', sans-serif",
        background: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px'
      }}>
        <div style={{ fontSize: '4rem' }}>❌</div>
        <div style={{ fontSize: '1.5rem', color: '#dc2626', fontWeight: 600 }}>שגיאה בטעינת המודעות</div>
        <div style={{ color: '#6b7280', textAlign: 'center', maxWidth: '500px' }}>
          {error}
        </div>
        <Button onClick={fetchCars}>🔄 נסה שוב</Button>
      </div>
    );
  }

  const TopBar = () => (
    <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '8px 0', fontSize: '14px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📞 074-7000-222
          </span>
          <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ✉️ info@sevres-auto.com
          </span>
        </div>
      </div>
    </div>
  );

  const Header = () => (
    <header style={{ background: 'white', borderBottom: '1px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', width: '100%' }}>
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="60" height="40" viewBox="0 0 60 40">
              <path d="M5 35 Q15 25 30 35 Q45 25 55 35" stroke="#0066cc" strokeWidth="3" fill="none"/>
              <path d="M10 30 Q20 20 30 30 Q40 20 50 30" stroke="#0066cc" strokeWidth="2" fill="none"/>
              <path d="M15 25 Q22.5 18 30 25 Q37.5 18 45 25" stroke="#0066cc" strokeWidth="2" fill="none"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#1f2937' }}>סוכנות סברס</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', letterSpacing: '2px' }}>AUTO AGENCY</span>
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', borderTop: '1px solid #e5e7eb', padding: '15px 0', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%', maxWidth: 'none', padding: '0 20px' }}>
            <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <a href="#cars" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, fontSize: '16px', padding: '8px 0' }}>קטלוג רכבים</a>
              <a href="#services" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, fontSize: '16px', padding: '8px 0' }}>יבוא רכבים</a>
              <a href="#about" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, fontSize: '16px', padding: '8px 0' }}>אודות סברס</a>
              <a href="#contact" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, fontSize: '16px', padding: '8px 0' }}>יצירת קשר</a>
              <a href="#call" style={{ background: '#0066cc', color: 'white', padding: '8px 16px', borderRadius: '25px', fontWeight: 600, textDecoration: 'none' }}>לשיחה עם נציג 💬</a>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );

  const Message = ({ message, type, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <div style={{
        padding: '15px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontWeight: 500,
        background: type === 'success' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.1)',
        color: type === 'success' ? '#059669' : '#dc2626',
        border: `1px solid ${type === 'success' ? 'rgba(5, 150, 105, 0.2)' : 'rgba(220, 38, 38, 0.2)'}`
      }}>
        {message}
      </div>
    );
  };

  const SidebarFilters = () => (
    <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: 'fit-content', position: 'sticky', top: '120px' }}>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '20px', color: '#0066cc' }}>🔍 סינון רכבים</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>סוג רכב</label>
          <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }}>
            <option value="">כל הסוגים</option>
            <option value="פרטי">פרטי</option>
            <option value="משפחתי">משפחתי</option>
            <option value="ספורט">ספורט</option>
            <option value="שטח">שטח</option>
            <option value="מסחרי">מסחרי</option>
          </select>
        </div>
        
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>מחיר מקסימלי</label>
          <input type="number" placeholder="₪ 200,000" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }} />
        </div>
        
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>שנה מינימלית</label>
          <input type="number" placeholder="2020" value={filters.minYear} onChange={(e) => handleFilterChange('minYear', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }} />
        </div>
        
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>חיפוש חופשי</label>
          <input type="text" placeholder="דגם, יצרן..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }} />
        </div>

        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>זמינות</label>
          <select value={filters.inStock || ''} onChange={(e) => handleFilterChange('inStock', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }}>
            <option value="">הכל</option>
            <option value="true">במלאי</option>
            <option value="false">לא במלאי</option>
          </select>
        </div>
      </div>
      
      <div style={{ marginTop: '25px' }}>
        <Button onClick={clearFilters} variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>🔄 נקה מסננים</Button>
      </div>
    </div>
  );

  const SidebarSort = () => (
    <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: 'fit-content', position: 'sticky', top: '120px' }}>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '20px', color: '#0066cc' }}>📊 מיון תוצאות</h3>
      
      <div>
        <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>מיין לפי</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }}>
          <option value="default">ללא מיון</option>
          <option value="price-low">מחיר: נמוך לגבוה</option>
          <option value="price-high">מחיר: גבוה לנמוך</option>
          <option value="year-new">שנה: חדש לישן</option>
          <option value="year-old">שנה: ישן לחדש</option>
          <option value="km-low">קילומטראז': נמוך לגבוה</option>
          <option value="km-high">קילומטראז': גבוה לנמוך</option>
          <option value="inStock">במלאי קודם</option>
        </select>
      </div>
    </div>
  );

  const CarCard = ({ car }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = car.images || [{ url: car.image, caption: car.description }];
    
    const nextImage = () => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };
    
    const prevImage = () => {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };
    
    return (
      <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', transition: 'all 0.3s ease', position: 'relative' }}>
        {/* Stock Badge */}
        <div style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          zIndex: 10,
          background: car.inStock ? '#10b981' : '#ef4444',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 600
        }}>
          {car.inStock ? '✅ במלאי' : '❌ לא במלאי'}
        </div>

        {/* Image Counter Badge */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            zIndex: 10,
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            📷 {currentImageIndex + 1}/{images.length}
          </div>
        )}

        {/* Car Image with Carousel */}
        <div style={{ 
          width: '100%', 
          height: '280px', 
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundImage: `url(${images[currentImageIndex].url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            width: '100%',
            height: '100%',
            transition: 'opacity 0.3s ease'
          }}>
            {/* Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
              height: '50%',
              display: 'flex',
              alignItems: 'end',
              justifyContent: 'center',
              paddingBottom: '20px'
            }}>
              <span style={{ color: 'white', fontSize: '18px', fontWeight: 600, textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                {car.model}
              </span>
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 5,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'}
              >
                ◀
              </button>
              
              <button
                onClick={nextImage}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 5,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'}
              >
                ▶
              </button>

              {/* Dots Indicator */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '8px',
                zIndex: 5
              }}>
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      border: 'none',
                      background: index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      
      <div style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '15px', color: '#1f2937' }}>{car.model}</h3>
        
        {/* Car Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>שנה</div>
            <div style={{ fontWeight: 600, color: '#0066cc' }}>{car.year}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>ק"מ</div>
            <div style={{ fontWeight: 600, color: '#0066cc' }}>{car.km.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>סוג</div>
            <div style={{ fontWeight: 600, color: '#0066cc' }}>{car.type}</div>
          </div>
        </div>
        
        {car.price > 0 && (
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0066cc', marginBottom: '15px', textAlign: 'center' }}>
            ₪{car.price.toLocaleString()}
          </div>
        )}
        
        <div style={{ color: '#6b7280', lineHeight: 1.6, marginBottom: '25px', fontSize: '14px' }}>
          {car.description.substring(0, 120)}{car.description.length > 120 && '...'}
        </div>
        
        {/* Validation Badge */}
        {car.missing_fields && car.missing_fields.length > 0 && (
          <div style={{ 
            background: 'rgba(251, 191, 36, 0.1)', 
            border: '1px solid rgba(251, 191, 36, 0.3)', 
            padding: '10px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '12px',
            color: '#d97706'
          }}>
            ⚠️ חסרים פרטים: {car.missing_fields.join(', ')}
          </div>
        )}
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button onClick={() => handleViewDetails(car)} style={{ flex: 1, justifyContent: 'center' }}>👁️ פרטים מלאים</Button>
          {isAdmin && (
            <>
              <Button onClick={() => handleEditCar(car)} variant="success">✏️ עריכה</Button>
              <Button onClick={() => handleDeleteCar(car.id)} variant="danger">🗑️ מחיקה</Button>
            </>
          )}
        </div>
        
        {/* Contact Info */}
        <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)', padding: '20px', borderRadius: '12px' }}>
          <h4 style={{ color: '#0066cc', marginBottom: '15px', fontWeight: 600 }}>📞 יצירת קשר מהירה</h4>
          <div style={{ marginBottom: '8px', color: '#1f2937' }}>📱 {car.phone}</div>
          <div style={{ color: '#1f2937' }}>✉️ {car.email}</div>
        </div>
      </div>
    </div>
  );
};

  const CarsGrid = () => {
    if (filteredCars.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.5 }}>🔍</div>
          <div style={{ fontSize: '1.2rem', marginBottom: '30px' }}>לא נמצאו רכבים התואמים לחיפוש שלך</div>
          <Button onClick={clearFilters} variant="secondary">🔄 נקה מסננים</Button>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
        {filteredCars.map(car => <CarCard key={car.id} car={car} />)}
      </div>
    );
  };

  // Modal, Login, CarForm, CarDetails components...
  // (המשך בחלק הבא - הקובץ ארוך מדי)

  const Footer = () => (
    <footer style={{ background: '#1f2937', color: 'white', padding: '60px 0 20px', marginTop: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', textAlign: 'center' }}>
        <p style={{ color: '#d1d5db' }}>&copy; 2024 סוכנות סברס. כל הזכויות שמורות.</p>
        <p style={{ color: '#9ca3af', marginTop: '10px' }}>נתונים בזמן אמת מהמאגר</p>
      </div>
    </footer>
  );

  return (
    <div style={{
      fontFamily: "'Heebo', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      background: '#f5f5f5',
      color: '#1a1a1a',
      direction: 'rtl',
      lineHeight: 1.6
    }}>
      <TopBar />
      <Header />

      <div style={{ padding: '0 20px' }}>
        {/* Admin Dashboard */}
        {isAdmin && message && (
          <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 20px' }}>
            <Message message={message.text} type={message.type} onClose={clearMessage} />
          </div>
        )}
        
        {/* Three Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '40px', margin: '40px 0', maxWidth: '1400px', marginLeft: 'auto', marginRight: 'auto' }}>
          <SidebarFilters />

          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '30px', color: '#0066cc' }}>
              הרכבים שלנו ({filteredCars.length})
            </h2>
            <CarsGrid />
          </div>

          <SidebarSort />
        </div>
      </div>

      <Footer />
                {/* WhatsApp Button */}
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            width: '56px',
            height: '56px',
            background: '#25d366',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}>
            <span style={{ fontSize: '28px' }}>💬</span>
          </div>
    </div>
  );
};

export default App;
