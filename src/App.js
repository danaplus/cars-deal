import React, { useState, useEffect } from 'react';

// Sample car data
const initialCars = [
  {
    id: 1,
    model: "BMW X5 xDrive40i",
    year: 2023,
    km: 15000,
    price: 420000,
    type: "שטח",
    inStock: true,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "רכב שטח יוקרתי במצב חדש כמעט! כולל כל הציודים המתקדמים של BMW: מערכת ניווט Professional, מושבי עור Vernasca מחוממים ומאווררים, פנורמה, מערכת שמע Harman Kardon, חיישני חניה היקפיים, מצלמת 360 מעלות, ועוד הרבה תוספות יוקרה.",
    phone: "050-1234567",
    email: "bmw@sevres-auto.com"
  },
  {
    id: 2,
    model: "מרצדס C300 AMG",
    year: 2022,
    km: 28000,
    price: 350000,
    type: "ספורט",
    inStock: false,
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "מרצדס C-Class בגימור AMG מרהיב! מנוע טורבו חזק, עיצוב ספורטיבי, מושבי עור מחוממים, מערכת בידור MBUX מתקדמת, תאורת LED חכמה, מערכת בטיחות פעילה ועוד. רכב מטופח במיוחד עם היסטוריית שירות מלאה אצל מרצדס.",
    phone: "050-2345678",
    email: "mercedes@sevres-auto.com"
  },
  {
    id: 3,
    model: "אאודי Q7 S-Line",
    year: 2021,
    km: 45000,
    price: 380000,
    type: "שטח",
    inStock: true,
    image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "רכב שטח יוקרתי ומרווח ל-7 נוסעים. כולל מערכת quattro לכל הגלגלים, מושבי עור איכותיים, מערכת בידור אחורית, מזגן אחורי נפרד, פנורמה גדולה, מערכת שמע B&O מתקדמת, ומערכת בטיחות מקיפה. מושלם למשפחות גדולות.",
    phone: "050-3456789",
    email: "audi@sevres-auto.com"
  },
  {
    id: 4,
    model: "טויוטה קמרי היברידית",
    year: 2023,
    km: 12000,
    price: 165000,
    type: "פרטי",
    inStock: true,
    image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "רכב היברידי חדיש וחסכוני! צריכת דלק מינימלית, מערכת Toyota Safety Sense 2.0, מערכת בידור מתקדמת עם Apple CarPlay, מושבים נוחים מחוממים, ואחריות יצרן מלאה. הבחירה המושלמת לנהגים המחפשים חיסכון וטכנולוגיה.",
    phone: "050-4567890",
    email: "toyota@sevres-auto.com"
  },
  {
    id: 5,
    model: "יונדאי סנטה פה",
    year: 2022,
    km: 35000,
    price: 220000,
    type: "משפחתי",
    inStock: false,
    image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "רכב משפחתי מושלם עם 7 מקומות ישיבה! כולל מערכת SmartSense לבטיחות, מושבי עור מחוממים, מערכת בידור לנוסעים האחוריים, תא מטען גדול ומרווח, ואחריות מורחבת של יונדאי. נוח, בטוח ואמין למשפחות.",
    phone: "050-5678901",
    email: "hyundai@sevres-auto.com"
  },
  {
    id: 6,
    model: "פורשה מקאן טורבו",
    year: 2021,
    km: 22000,
    price: 520000,
    type: "ספורט",
    inStock: true,
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    description: "רכב ספורט יוקרתי מפורשה! מנוע טורבו חזק V6, תיבת הילוכים PDK, מתלי אוויר אדפטיביים, מושבי ספורט מחוממים ומאווררים, מערכת PCM מתקדמת, גלגלי 21 אינץ', וערכת ספורט מלאה. חוויית נהיגה בלתי נשכחת!",
    phone: "050-6789012",
    email: "porsche@sevres-auto.com"
  }
];

const App = () => {
  const [cars, setCars] = useState(initialCars);
  const [filteredCars, setFilteredCars] = useState(initialCars);
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

  // Filter and sort logic
  useEffect(() => {
    let filtered = cars.filter(car => {
      return (!filters.type || car.type === filters.type) &&
             (!filters.maxPrice || car.price <= parseInt(filters.maxPrice)) &&
             (!filters.minYear || car.year >= parseInt(filters.minYear)) &&
             (!filters.inStock || car.inStock.toString() === filters.inStock) &&
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
          case 'inStock': return b.inStock - a.inStock;
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

  const handleSaveCar = (carData) => {
    if (editingCar) {
      setCars(prev => prev.map(car => car.id === editingCar.id ? { ...car, ...carData } : car));
      showMessage('✅ הרכב עודכן בהצלחה!', 'success');
    } else {
      setCars(prev => [...prev, { ...carData, id: Date.now(), inStock: true }]);
      showMessage('🎉 הרכב נוסף בהצלחה לקטלוג!', 'success');
    }
    setCarFormModalOpen(false);
    setEditingCar(null);
  };

  const handleDeleteCar = (carId) => {
    if (window.confirm('🗑️ האם אתה בטוח שברצונך למחוק את הרכב מהקטלוג?')) {
      setCars(prev => prev.filter(car => car.id !== carId));
      showMessage('🗑️ הרכב נמחק בהצלחה מהמערכת!', 'success');
    }
  };

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setCarDetailsModalOpen(true);
  };

  const isAdmin = currentUser && currentUser.role === 'admin';

  // Components
  const Button = ({ children, onClick, variant = 'primary', type = 'button', style = {} }) => {
    const styles = {
      primary: { background: '#2563eb', color: 'white' },
      secondary: { background: 'transparent', color: '#2563eb', border: '2px solid #2563eb' },
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
    <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', width: '100%' }}>
      <div style={{ width: '100%' }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0', maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg width="60" height="40" viewBox="0 0 60 40">
              <path d="M5 35 Q15 25 30 35 Q45 25 55 35" stroke="#2563eb" strokeWidth="3" fill="none"/>
              <path d="M10 30 Q20 20 30 30 Q40 20 50 30" stroke="#2563eb" strokeWidth="2" fill="none"/>
              <path d="M15 25 Q22.5 18 30 25 Q37.5 18 45 25" stroke="#2563eb" strokeWidth="2" fill="none"/>
            </svg>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#1f2937' }}>סוכנות סברס</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280', letterSpacing: '2px' }}>AUTO AGENCY</span>
            </div>
          </div>
        </div>

        {/* Navigation - Full Width */}
        <div style={{ background: '#f8fafc', borderTop: '1px solid #e5e7eb', padding: '15px 0', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%', maxWidth: 'none', padding: '0 20px' }}>
            <nav style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
              <a href="#cars" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, fontSize: '16px', padding: '8px 0' }}>קטלוג רכבים</a>
              <a href="#services" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, fontSize: '16px', padding: '8px 0' }}>יבוא רכבים</a>
              <a href="#about" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, fontSize: '16px', padding: '8px 0' }}>אודות סברס</a>
              <a href="#contact" style={{ color: '#1f2937', textDecoration: 'none', fontWeight: 500, fontSize: '16px', padding: '8px 0' }}>יצירת קשר</a>
              <a href="#call" style={{ background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '25px', fontWeight: 600, textDecoration: 'none' }}>לשיחה עם נציג 💬</a>
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

  const AdminDashboard = () => isAdmin && (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '40px', margin: '40px 0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2563eb' }}>🎛️ דשבורד מנהל</h2>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Button onClick={handleAddCar}>➕ הוסף רכב חדש</Button>
          <Button onClick={handleLogout} variant="danger">🚪 התנתק</Button>
        </div>
      </div>
      {message && <Message message={message.text} type={message.type} onClose={clearMessage} />}
    </div>
  );

  const SidebarFilters = () => (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: 'fit-content', position: 'sticky', top: '120px' }}>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '20px', color: '#2563eb' }}>🔍 סינון רכבים</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>סוג רכב</label>
          <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }}>
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
          <input type="number" placeholder="₪ 200,000" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }} />
        </div>
        
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>שנה מינימלית</label>
          <input type="number" placeholder="2020" value={filters.minYear} onChange={(e) => handleFilterChange('minYear', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }} />
        </div>
        
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>חיפוש חופשי</label>
          <input type="text" placeholder="דגם, יצרן..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }} />
        </div>

        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>זמינות</label>
          <select value={filters.inStock || ''} onChange={(e) => handleFilterChange('inStock', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }}>
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
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', height: 'fit-content', position: 'sticky', top: '120px' }}>
      <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '20px', color: '#2563eb' }}>📊 מיון תוצאות</h3>
      
      <div>
        <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>מיין לפי</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#1f2937', fontSize: '14px' }}>
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

  const TopFiltersBar = () => (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '30px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', alignItems: 'end' }}>
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>חיפוש מהיר</label>
          <input type="text" placeholder="חפש רכב..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
        </div>
        
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>סוג רכב</label>
          <select value={filters.type} onChange={(e) => handleFilterChange('type', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <option value="">כל הסוגים</option>
            <option value="פרטי">פרטי</option>
            <option value="משפחתי">משפחתי</option>
            <option value="ספורט">ספורט</option>
            <option value="שטח">שטח</option>
            <option value="מסחרי">מסחרי</option>
          </select>
        </div>
        
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>מחיר עד</label>
          <input type="number" placeholder="₪ 200,000" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
        </div>
        
        <div>
          <label style={{ fontWeight: 600, color: '#1f2937', fontSize: '14px', marginBottom: '8px', display: 'block' }}>מיון</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
            <option value="default">ללא מיון</option>
            <option value="price-low">מחיר: נמוך לגבוה</option>
            <option value="price-high">מחיר: גבוה לנמוך</option>
            <option value="year-new">שנה: חדש לישן</option>
            <option value="inStock">במלאי קודם</option>
          </select>
        </div>
        
        <div>
          <Button onClick={clearFilters} variant="secondary" style={{ width: '100%', justifyContent: 'center' }}>🔄 נקה</Button>
        </div>
      </div>
    </div>
  );

  const CarCard = ({ car }) => (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', transition: 'all 0.3s ease', position: 'relative' }}>
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
        {car.inStock ? ' במלאי' : ' לא במלאי'}
      </div>

      {/* Car Image */}
      <div style={{ 
        width: '100%', 
        height: '280px', 
        backgroundImage: `url(${car.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Overlay for better text visibility */}
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
      
      <div style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '15px', color: '#1f2937' }}>{car.model}</h3>
        
        {/* Car Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>שנה</div>
            <div style={{ fontWeight: 600, color: '#2563eb' }}>{car.year}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>ק"מ</div>
            <div style={{ fontWeight: 600, color: '#2563eb' }}>{car.km.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>סוג</div>
            <div style={{ fontWeight: 600, color: '#2563eb' }}>{car.type}</div>
          </div>
        </div>
        
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb', marginBottom: '15px', textAlign: 'center' }}>
          ₪{car.price.toLocaleString()}
        </div>
        
        <div style={{ color: '#6b7280', lineHeight: 1.6, marginBottom: '25px', fontSize: '14px' }}>
          {car.description.substring(0, 120)}...
        </div>
        
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
          <h4 style={{ color: '#2563eb', marginBottom: '15px', fontWeight: 600 }}>📞 יצירת קשר מהירה</h4>
          <div style={{ marginBottom: '8px', color: '#1f2937' }}>📱 {car.phone}</div>
          <div style={{ color: '#1f2937' }}>✉️ {car.email}</div>
        </div>
      </div>
    </div>
  );

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

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(5px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#2563eb' }}>{title}</h2>
          </div>
          {children}
        </div>
      </div>
    );
  };

  const LoginModal = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleLogin(credentials.username, credentials.password);
    };

    return (
      <Modal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} title="🔐 התחברות מנהל">
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>שם משתמש</label>
            <input 
              type="text" 
              required 
              placeholder="הכנס שם משתמש"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              style={{ width: '100%', padding: '14px 18px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>סיסמה</label>
            <input 
              type="password" 
              required 
              placeholder="הכנס סיסמה"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              style={{ width: '100%', padding: '14px 18px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <Button type="submit">🚀 התחבר</Button>
            <Button type="button" variant="secondary" onClick={() => setLoginModalOpen(false)}>ביטול</Button>
          </div>
        </form>
        
        <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)', borderRadius: '8px', fontSize: '14px', lineHeight: 1.6 }}>
          <strong style={{ color: '#2563eb' }}>💡 להדגמה:</strong><br />
          שם משתמש: <strong>admin</strong><br />
          סיסמה: <strong>123456</strong>
        </div>
      </Modal>
    );
  };

  const CarFormModal = () => {
    const [formData, setFormData] = useState({
      model: '',
      year: '',
      km: '',
      price: '',
      type: '',
      image: '',
      description: '',
      phone: '',
      email: '',
      inStock: true
    });

    useEffect(() => {
      if (editingCar) {
        setFormData(editingCar);
      } else {
        setFormData({
          model: '',
          year: '',
          km: '',
          price: '',
          type: '',
          image: '',
          description: '',
          phone: '',
          email: '',
          inStock: true
        });
      }
    }, [editingCar]);

    const handleSubmit = (e) => {
      e.preventDefault();
      handleSaveCar({
        ...formData,
        year: parseInt(formData.year),
        km: parseInt(formData.km),
        price: parseInt(formData.price),
        id: editingCar?.id || Date.now()
      });
    };

    const inputStyle = { width: '100%', padding: '14px 18px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' };

    return (
      <Modal 
        isOpen={carFormModalOpen} 
        onClose={() => {
          setCarFormModalOpen(false);
          setEditingCar(null);
        }} 
        title={editingCar ? "✏️ ערוך רכב" : "➕ הוסף רכב חדש"}
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>יצרן ודגם</label>
            <input type="text" required placeholder="טויוטה קורולה" value={formData.model} onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))} style={inputStyle} />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>שנת ייצור</label>
            <input type="number" required min="1990" max="2025" placeholder="2023" value={formData.year} onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))} style={inputStyle} />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>קילומטראז'</label>
            <input type="number" required min="0" placeholder="50,000" value={formData.km} onChange={(e) => setFormData(prev => ({ ...prev, km: e.target.value }))} style={inputStyle} />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>מחיר (₪)</label>
            <input type="number" required min="0" placeholder="150,000" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} style={inputStyle} />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>קישור לתמונה</label>
            <input type="url" placeholder="https://example.com/car-image.jpg" value={formData.image} onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))} style={inputStyle} />
            {formData.image && (
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <img 
                  src={formData.image} 
                  alt="תצוגה מקדימה" 
                  style={{ 
                    width: '100%', 
                    maxWidth: '300px', 
                    height: '200px', 
                    objectFit: 'cover', 
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>סוג רכב</label>
            <select required value={formData.type} onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))} style={inputStyle}>
              <option value="">בחר סוג רכב</option>
              <option value="פרטי">פרטי</option>
              <option value="משפחתי">משפחתי</option>
              <option value="ספורט">ספורט</option>
              <option value="שטח">שטח</option>
              <option value="מסחרי">מסחרי</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>זמינות</label>
            <select value={formData.inStock} onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.value === 'true' }))} style={inputStyle}>
              <option value={true}>במלאי</option>
              <option value={false}>לא במלאי</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>תיאור מפורט</label>
            <textarea placeholder="תאר את הרכב..." value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>טלפון</label>
            <input type="tel" placeholder="050-1234567" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))} style={inputStyle} />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, color: '#1f2937' }}>אימייל</label>
            <input type="email" placeholder="contact@sevres-auto.com" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} style={inputStyle} />
          </div>
          
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <Button type="submit">💾 שמור רכב</Button>
            <Button type="button" variant="secondary" onClick={() => { setCarFormModalOpen(false); setEditingCar(null); }}>ביטול</Button>
          </div>
        </form>
      </Modal>
    );
  };

  const CarDetailsModal = () => {
    if (!selectedCar) return null;

    return (
      <Modal isOpen={carDetailsModalOpen} onClose={() => { setCarDetailsModalOpen(false); setSelectedCar(null); }} title={`🚗 ${selectedCar.model}`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '25px' }}>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>שנת ייצור</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2563eb' }}>{selectedCar.year}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>קילומטראז'</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2563eb' }}>{selectedCar.km.toLocaleString()} ק"מ</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>סוג רכב</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#2563eb' }}>{selectedCar.type}</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#f1f5f9', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>מחיר</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb' }}>₪{selectedCar.price.toLocaleString()}</div>
          </div>
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#2563eb', marginBottom: '15px', fontSize: '1.2rem' }}>📝 תיאור מפורט</h4>
          <p style={{ lineHeight: 1.8, color: '#6b7280' }}>{selectedCar.description}</p>
        </div>
        
        <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)', padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
          <h4 style={{ color: '#2563eb', marginBottom: '15px', fontWeight: 600 }}>📞 פרטי התקשרות</h4>
          <div style={{ marginBottom: '8px', color: '#1f2937' }}><strong>טלפון:</strong> {selectedCar.phone}</div>
          <div style={{ color: '#1f2937' }}><strong>אימייל:</strong> {selectedCar.email}</div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button variant="secondary" onClick={() => { setCarDetailsModalOpen(false); setSelectedCar(null); }}>✖️ סגור</Button>
        </div>
      </Modal>
    );
  };

  const Footer = () => (
    <footer style={{ background: '#1f2937', color: 'white', padding: '60px 0 20px', marginTop: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <h3 style={{ color: '#2563eb', marginBottom: '20px', fontSize: '1.3rem' }}>צור קשר</h3>
            <p style={{ color: '#d1d5db', marginBottom: '10px' }}>📍 רחוב הרצל 123, תל אביב</p>
            <p style={{ color: '#d1d5db', marginBottom: '10px' }}>📞 03-1234567</p>
            <p style={{ color: '#d1d5db', marginBottom: '10px' }}>📱 050-1234567</p>
            <p style={{ color: '#d1d5db', marginBottom: '10px' }}>✉️ info@sevres-auto.com</p>
            <p style={{ color: '#d1d5db', marginBottom: '10px' }}>🕒 א'-ה': 8:00-18:00, ו': 8:00-13:00</p>
          </div>

          <div>
            <h3 style={{ color: '#2563eb', marginBottom: '20px', fontSize: '1.3rem' }}>השירותים שלנו</h3>
            <div style={{ color: '#d1d5db', marginBottom: '10px' }}>מכירת רכבים חדשים</div>
            <div style={{ color: '#d1d5db', marginBottom: '10px' }}>מכירת רכבים משומשים</div>
            <div style={{ color: '#d1d5db', marginBottom: '10px' }}>מימון ולוהל'ים</div>
            <div style={{ color: '#d1d5db', marginBottom: '10px' }}>ביטוח רכב</div>
            <div style={{ color: '#d1d5db', marginBottom: '10px' }}>שירות ותחזוקה</div>
            <div style={{ color: '#d1d5db', marginBottom: '10px' }}>חלפי חילוף</div>
          </div>

          <div>
            <h3 style={{ color: '#2563eb', marginBottom: '20px', fontSize: '1.3rem' }}>אודותינו</h3>
            <p style={{ color: '#d1d5db', lineHeight: 1.8, marginBottom: '20px' }}>
              סוכנות סברס היא סוכנות רכב מובילה עם ניסיון של למעלה מ-20 שנה בתחום. 
              אנו מתמחים במכירת רכבים איכותיים ובמתן שירות מקצועי ואמין ללקוחותינו.
            </p>
            
            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📘</div>
              <div style={{ width: '40px', height: '40px', background: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
              <div style={{ width: '40px', height: '40px', background: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💼</div>
              <div style={{ width: '40px', height: '40px', background: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📺</div>
              <div style={{ width: '40px', height: '40px', background: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💬</div>
            </div>
          </div>

          <div>
            <h3 style={{ color: '#2563eb', marginBottom: '20px', fontSize: '1.3rem' }}>מיקום</h3>
            <div style={{ height: '200px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
              <div style={{ fontSize: '2rem' }}>🗺️</div>
              <p style={{ marginTop: '10px' }}>המפה תוצג כאן</p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #374151', paddingTop: '20px', textAlign: 'center', color: '#9ca3af' }}>
          <p>&copy; 2024 סוכנות סברס. כל הזכויות שמורות.</p>
          <a 
            href="#admin" 
            onClick={(e) => { e.preventDefault(); setLoginModalOpen(true); }}
            style={{ display: 'inline-block', marginTop: '10px', color: '#6b7280', textDecoration: 'none', fontSize: '12px', opacity: 0.7 }}
          >
            כניסת מנהלים
          </a>
        </div>
      </div>
    </footer>
  );

  return (
    <div style={{
      fontFamily: "'Heebo', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
      background: '#f8fafc',
      color: '#1f2937',
      direction: 'rtl',
      lineHeight: 1.6
    }}>
      <TopBar />
      <Header />

      <div style={{ padding: '0 20px' }}>
        {/* Admin Dashboard with max-width */}
        {isAdmin && (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '40px', margin: '40px 0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#2563eb' }}>🎛️ דשבורד מנהל</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <Button onClick={handleAddCar}>➕ הוסף רכב חדש</Button>
                  <Button onClick={handleLogout} variant="danger">🚪 התנתק</Button>
                </div>
              </div>
              {message && <Message message={message.text} type={message.type} onClose={clearMessage} />}
            </div>
          </div>
        )}
        
        {/* Three Column Layout - Full Width */}
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', gap: '40px', margin: '40px 0' }}>
          {/* Right Sidebar - Filters */}
          <SidebarFilters />

          {/* Center - Cars Grid */}
          <div>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 700, textAlign: 'center', marginBottom: '30px', color: '#2563eb' }}>
              הרכבים שלנו ({filteredCars.length})
            </h2>
            <CarsGrid />
          </div>

          {/* Left Sidebar - Sort */}
          <SidebarSort />
        </div>
      </div>

      <Footer />
      <LoginModal />
      <CarFormModal />
      <CarDetailsModal />
    </div>
  );
};

export default App;