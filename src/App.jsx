import { useState, useEffect, useMemo } from 'react';
import { 
  Settings, 
  X, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  Sprout, 
  Sparkles, 
  RefreshCw, 
  Clock, 
  Calendar 
} from 'lucide-react';

// Default values (planting closer to Tisha B'Av 2025 with exact hours, Orlah ending 2028, Chulin starting 2029)
const DEFAULT_PLANTING_DATE = '2025-08-03T08:00';
const DEFAULT_ORLAH_DATE = '2028-02-11T17:00';
const DEFAULT_CHULIN_DATE = '2029-01-31T17:00';

const TRANSLATIONS = {
  he: {
    dir: 'rtl',
    langName: 'English',
    title: 'מעקב לימוני <span>ערלה וחולין</span>',
    subtitle: 'ספירה לאחור ומעקב שלבים הלכתיים עבור עץ הלימון שלך',
    plantingDateText: 'תאריך נטיעה',
    targetDateText: 'תאריך יעד',
    orlahTitle: 'סיום שנות ערלה',
    chulinTitle: 'כניסה לחולין',
    forbiddenBadge: 'אסור באכילה',
    permittedBadge: 'מותר בפדיון',
    fullyPermittedBadge: 'חולין גמור',
    days: 'ימים',
    hours: 'שעות',
    minutes: 'דקות',
    seconds: 'שניות',
    completed: 'הושלם',
    timeLeftText: 'זמן נותר',
    elapsedText: 'חלף מהנטיעה',
    tooltipTitle: 'הסבר הלכתי קצר',
    orlahExplanation: 'ערלה: בשלוש השנים הראשונות לנטיעת עץ מאכל (מחושב הלכתית), פירותיו אסורים באכילה ובהנאה. לאחר מכן נכנסים לשנת נטע רבעי.',
    chulinExplanation: 'חולין: לאחר סיום שנות הערלה ונטע רבעי (המחייב פדיון), פירות העץ מוגדרים כחולין גמורים ומותרים באכילה חופשית (בכפוף לתרומות ומעשרות כדין בארץ ישראל).',
    settingsTitle: 'הגדרת תאריכי יעד',
    settingsSub: 'תוכל לשנות את תאריכי היעד שהגדרת בחישוב שלך כדי לעדכן את המונים באופן מדויק.',
    plantingInput: 'תאריך נטיעה (תחילת החישוב)',
    orlahInput: 'תאריך סיום ערלה (יעד 1)',
    chulinInput: 'תאריך כניסה לחולין (יעד 2)',
    btnSave: 'שמור ועדכן',
    btnReset: 'אפס הגדרות',
    timelineTitle: 'ציר זמן התפתחות העץ הלכתי',
    todayText: 'היום',
    congratsOrlah: 'בשעה טובה! תקופת הערלה הסתיימה! הפירות נכנסו לשלב נטע רבעי (מצריך פדיון בארץ ישראל).',
    congratsChulin: 'מזל טוב! פירות עץ הלימון הגיעו לשלב חולין גמור ומותרים באכילה ללא הגבלה!',
    invalidDatesError: 'שגיאה: התאריכים אינם מסודרים כרונולוגית (נטיעה < ערלה < חולין).',
    sourceCode: 'קוד מקור'
  },
  en: {
    dir: 'ltr',
    langName: 'עברית',
    title: 'The Lemon Tree <span>Chronicles</span>',
    subtitle: 'Halachic milestone countdowns and progress monitoring for your lemon tree',
    plantingDateText: 'Planting Date',
    targetDateText: 'Target Date',
    orlahTitle: 'End of Orlah Phase',
    chulinTitle: 'Full Chulin Phase',
    forbiddenBadge: 'Forbidden',
    permittedBadge: 'Redeemable',
    fullyPermittedBadge: 'Fully Permitted',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    completed: 'Completed',
    timeLeftText: 'Time Remaining',
    elapsedText: 'Elapsed since planting',
    tooltipTitle: 'Halachic Background',
    orlahExplanation: 'Orlah: For the first three years of a fruit tree\'s growth, its fruit is forbidden to eat or benefit from. The transition to Neta Reva\'i follows.',
    chulinExplanation: 'Chulin: Once Orlah and Neta Reva\'i (the fourth-year fruit that requires redemption) are complete, the lemons become regular Chulin fruit, fully permitted to eat.',
    settingsTitle: 'Configure Milestones',
    settingsSub: 'Customize the dates to align with your calculations. Changes will be saved locally.',
    plantingInput: 'Planting Date (Start Point)',
    orlahInput: 'Orlah End Date (Milestone 1)',
    chulinInput: 'Chulin Start Date (Milestone 2)',
    btnSave: 'Save & Update',
    btnReset: 'Reset Defaults',
    timelineTitle: 'Tree Halachic Timeline',
    todayText: 'Today',
    congratsOrlah: 'Congratulations! The Orlah forbidden phase has ended! Fruits enter Neta Reva\'i (requiring redemption).',
    congratsChulin: 'Mazel Tov! Your lemon tree has entered Chulin! You can now freely enjoy your lemons!',
    invalidDatesError: 'Error: Dates must be chronological (Planting < Orlah < Chulin).',
    sourceCode: 'Source Code'
  }
};

function App() {
  // 1. Language State
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lemon_tree_lang');
    return saved === 'en' || saved === 'he' ? saved : 'he';
  });

  const t = useMemo(() => TRANSLATIONS[lang], [lang]);

  // 2. Dates States (retrieved from LocalStorage or default values)
  const [plantingDateStr, setPlantingDateStr] = useState(() => {
    return localStorage.getItem('planting_date') || DEFAULT_PLANTING_DATE;
  });
  const [orlahDateStr, setOrlahDateStr] = useState(() => {
    return localStorage.getItem('orlah_date') || DEFAULT_ORLAH_DATE;
  });
  const [chulinDateStr, setChulinDateStr] = useState(() => {
    return localStorage.getItem('chulin_date') || DEFAULT_CHULIN_DATE;
  });

  // Temporarily held state for inputs in settings
  const [tempPlanting, setTempPlanting] = useState(plantingDateStr);
  const [tempOrlah, setTempOrlah] = useState(orlahDateStr);
  const [tempChulin, setTempChulin] = useState(chulinDateStr);
  const [validationError, setValidationError] = useState('');

  // 3. UI states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  // 4. Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 5. Toggle Language function
  const toggleLanguage = () => {
    const nextLang = lang === 'he' ? 'en' : 'he';
    setLang(nextLang);
    localStorage.setItem('lemon_tree_lang', nextLang);
  };

  // 6. Handle Settings Save
  const handleSave = (e) => {
    e.preventDefault();
    // Validate chronological order
    const pTime = new Date(tempPlanting).getTime();
    const oTime = new Date(tempOrlah).getTime();
    const cTime = new Date(tempChulin).getTime();

    if (isNaN(pTime) || isNaN(oTime) || isNaN(cTime) || pTime >= oTime || oTime >= cTime) {
      setValidationError(t.invalidDatesError);
      return;
    }

    setValidationError('');
    setPlantingDateStr(tempPlanting);
    setOrlahDateStr(tempOrlah);
    setChulinDateStr(tempChulin);

    localStorage.setItem('planting_date', tempPlanting);
    localStorage.setItem('orlah_date', tempOrlah);
    localStorage.setItem('chulin_date', tempChulin);
    
    setIsSettingsOpen(false);
  };

  // 7. Reset to Defaults
  const handleReset = () => {
    setTempPlanting(DEFAULT_PLANTING_DATE);
    setTempOrlah(DEFAULT_ORLAH_DATE);
    setTempChulin(DEFAULT_CHULIN_DATE);
    
    setPlantingDateStr(DEFAULT_PLANTING_DATE);
    setOrlahDateStr(DEFAULT_ORLAH_DATE);
    setChulinDateStr(DEFAULT_CHULIN_DATE);

    localStorage.setItem('planting_date', DEFAULT_PLANTING_DATE);
    localStorage.setItem('orlah_date', DEFAULT_ORLAH_DATE);
    localStorage.setItem('chulin_date', DEFAULT_CHULIN_DATE);
    setValidationError('');
  };

  // Sync temp variables when drawer opens
  useEffect(() => {
    if (isSettingsOpen) {
      setTempPlanting(plantingDateStr);
      setTempOrlah(orlahDateStr);
      setTempChulin(chulinDateStr);
      setValidationError('');
    }
  }, [isSettingsOpen, plantingDateStr, orlahDateStr, chulinDateStr]);

  // 8. Calculations for Dashboard & Timelines
  const calculations = useMemo(() => {
    const start = new Date(plantingDateStr).getTime();
    const orlahEnd = new Date(orlahDateStr).getTime();
    const chulinStart = new Date(chulinDateStr).getTime();
    const today = now.getTime();

    // Orlah Progress & Time left
    const totalOrlahDuration = orlahEnd - start;
    const elapsedOrlah = today - start;
    const progressOrlah = Math.max(0, Math.min(100, (elapsedOrlah / totalOrlahDuration) * 100));
    
    let timeLeftOrlah = { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: today >= orlahEnd };
    if (!timeLeftOrlah.isOver) {
      const diff = orlahEnd - today;
      timeLeftOrlah.days = Math.floor(diff / (1000 * 60 * 60 * 24));
      timeLeftOrlah.hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      timeLeftOrlah.minutes = Math.floor((diff / 1000 / 60) % 60);
      timeLeftOrlah.seconds = Math.floor((diff / 1000) % 60);
    }

    // Chulin Progress & Time left
    const totalChulinDuration = chulinStart - start;
    const elapsedChulin = today - start;
    const progressChulin = Math.max(0, Math.min(100, (elapsedChulin / totalChulinDuration) * 100));

    let timeLeftChulin = { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: today >= chulinStart };
    if (!timeLeftChulin.isOver) {
      const diff = chulinStart - today;
      timeLeftChulin.days = Math.floor(diff / (1000 * 60 * 60 * 24));
      timeLeftChulin.hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      timeLeftChulin.minutes = Math.floor((diff / 1000 / 60) % 60);
      timeLeftChulin.seconds = Math.floor((diff / 1000) % 60);
    }

    // Timeline positions (relative to overall timeline planting -> chulin)
    const overallDuration = chulinStart - start;
    const todayRelativePosition = Math.max(0, Math.min(100, ((today - start) / overallDuration) * 100));
    const orlahRelativePosition = Math.max(0, Math.min(100, ((orlahEnd - start) / overallDuration) * 100));

    return {
      progressOrlah,
      timeLeftOrlah,
      progressChulin,
      timeLeftChulin,
      todayRelativePosition,
      orlahRelativePosition,
      isOrlahOver: timeLeftOrlah.isOver,
      isChulinOver: timeLeftChulin.isOver
    };
  }, [now, plantingDateStr, orlahDateStr, chulinDateStr]);

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString(lang === 'he' ? 'he-IL' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div dir={t.dir} style={{ direction: t.dir }}>
      {/* Header Area */}
      <header className="app-header">
        <div className="logo-area">
          <div className="logo-icon-wrapper">
            <Sprout size={24} color="#0c0f17" />
          </div>
          <span className="logo-text">DadLemons</span>
        </div>
        
        <button className="btn-lang" onClick={toggleLanguage}>
          <Globe size={16} />
          <span>{t.langName}</span>
        </button>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: t.title }} />
        <p className="hero-subtitle">{t.subtitle}</p>
      </section>

      {/* Completion Banners */}
      {calculations.isChulinOver ? (
        <div className="congrats-banner">
          <div className="congrats-icon-wrapper">
            <Sparkles size={32} />
          </div>
          <h2 className="congrats-title">{lang === 'he' ? 'חולין גמור!' : 'Fully Permitted!'}</h2>
          <p className="congrats-text">{t.congratsChulin}</p>
        </div>
      ) : calculations.isOrlahOver ? (
        <div className="congrats-banner" style={{ borderColor: 'var(--accent-yellow)', boxShadow: 'var(--shadow-glow-yellow)' }}>
          <div className="congrats-icon-wrapper" style={{ background: 'var(--accent-yellow-glow)', color: 'var(--accent-yellow)' }}>
            <CheckCircle size={32} />
          </div>
          <h2 className="congrats-title" style={{ color: 'var(--accent-yellow)' }}>{lang === 'he' ? 'סיום ערלה!' : 'Orlah Over!'}</h2>
          <p className="congrats-text">{t.congratsOrlah}</p>
        </div>
      ) : null}

      {/* Dashboard Grid */}
      <main className="dashboard-grid">
        {/* Card 1: Orlah */}
        <div className="countdown-card card-orlah">
          <div className="card-header">
            <div className="card-title-group">
              <span className="card-tag">{t.plantingDateText}: {formatDate(plantingDateStr)}</span>
              <h2 className="card-title">{t.orlahTitle}</h2>
            </div>
            
            {calculations.isOrlahOver ? (
              <span className="badge-status badge-permitted">
                <CheckCircle size={12} />
                {t.permittedBadge}
              </span>
            ) : (
              <span className="badge-status badge-forbidden">
                <AlertTriangle size={12} />
                {t.forbiddenBadge}
              </span>
            )}
          </div>

          {/* Time Counter */}
          <div className="time-grid">
            <div className="time-box">
              <div className="time-value">
                {calculations.isOrlahOver ? '00' : String(calculations.timeLeftOrlah.days).padStart(2, '0')}
              </div>
              <div className="time-label">{t.days}</div>
            </div>
            <div className="time-box">
              <div className="time-value">
                {calculations.isOrlahOver ? '00' : String(calculations.timeLeftOrlah.hours).padStart(2, '0')}
              </div>
              <div className="time-label">{t.hours}</div>
            </div>
            <div className="time-box">
              <div className="time-value">
                {calculations.isOrlahOver ? '00' : String(calculations.timeLeftOrlah.minutes).padStart(2, '0')}
              </div>
              <div className="time-label">{t.minutes}</div>
            </div>
            <div className="time-box">
              <div className="time-value">
                {calculations.isOrlahOver ? '00' : String(calculations.timeLeftOrlah.seconds).padStart(2, '0')}
              </div>
              <div className="time-label">{t.seconds}</div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="progress-container">
            <div className="progress-header-info">
              <span>{t.elapsedText}</span>
              <span className="progress-percentage">{calculations.progressOrlah.toFixed(1)}% {t.completed}</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${calculations.progressOrlah}%` }}
              />
            </div>
            <div className="progress-dates">
              <span>{formatDate(plantingDateStr)}</span>
              <span>{formatDate(orlahDateStr)}</span>
            </div>
          </div>

          {/* Tooltip background info */}
          <div className="info-section">
            <Info size={16} className="info-icon" />
            <p>{t.orlahExplanation}</p>
          </div>
        </div>

        {/* Card 2: Chulin */}
        <div className="countdown-card card-chulin">
          <div className="card-header">
            <div className="card-title-group">
              <span className="card-tag">{t.plantingDateText}: {formatDate(plantingDateStr)}</span>
              <h2 className="card-title">{t.chulinTitle}</h2>
            </div>
            
            {calculations.isChulinOver ? (
              <span className="badge-status badge-permitted">
                <CheckCircle size={12} />
                {t.fullyPermittedBadge}
              </span>
            ) : (
              <span className="badge-status badge-forbidden" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                <Clock size={12} />
                {calculations.isOrlahOver ? t.permittedBadge : t.forbiddenBadge}
              </span>
            )}
          </div>

          {/* Time Counter */}
          <div className="time-grid">
            <div className="time-box">
              <div className="time-value">
                {calculations.isChulinOver ? '00' : String(calculations.timeLeftChulin.days).padStart(2, '0')}
              </div>
              <div className="time-label">{t.days}</div>
            </div>
            <div className="time-box">
              <div className="time-value">
                {calculations.isChulinOver ? '00' : String(calculations.timeLeftChulin.hours).padStart(2, '0')}
              </div>
              <div className="time-label">{t.hours}</div>
            </div>
            <div className="time-box">
              <div className="time-value">
                {calculations.isChulinOver ? '00' : String(calculations.timeLeftChulin.minutes).padStart(2, '0')}
              </div>
              <div className="time-label">{t.minutes}</div>
            </div>
            <div className="time-box">
              <div className="time-value">
                {calculations.isChulinOver ? '00' : String(calculations.timeLeftChulin.seconds).padStart(2, '0')}
              </div>
              <div className="time-label">{t.seconds}</div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="progress-container">
            <div className="progress-header-info">
              <span>{t.elapsedText}</span>
              <span className="progress-percentage">{calculations.progressChulin.toFixed(1)}% {t.completed}</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${calculations.progressChulin}%` }}
              />
            </div>
            <div className="progress-dates">
              <span>{formatDate(plantingDateStr)}</span>
              <span>{formatDate(chulinDateStr)}</span>
            </div>
          </div>

          {/* Tooltip background info */}
          <div className="info-section">
            <Info size={16} className="info-icon" />
            <p>{t.chulinExplanation}</p>
          </div>
        </div>
      </main>

      {/* Visual Timeline Section */}
      <section className="timeline-card">
        <h3 className="timeline-title">
          <Calendar size={20} style={{ color: 'var(--accent-yellow)' }} />
          {t.timelineTitle}
        </h3>
        
        <div className="timeline-track-wrapper">
          <div className="timeline-main-line" />
          <div 
            className="timeline-progress-line" 
            style={{ width: `${calculations.todayRelativePosition}%` }}
          />
          
          <div className="timeline-nodes" style={{ position: 'relative', width: '100%', height: '80px' }}>
            {/* Planting Node */}
            <div className="timeline-node" style={{ position: 'absolute', left: 'calc(0% - 60px)', top: 0 }}>
              <div className="node-dot completed">
                <CheckCircle size={12} />
              </div>
              <span className="node-label">{lang === 'he' ? 'נטיעה' : 'Planting'}</span>
              <span className="node-date">{formatDate(plantingDateStr)}</span>
            </div>

            {/* Today Node (Dynamic representation) */}
            <div 
              className="timeline-node" 
              style={{ 
                position: 'absolute', 
                left: `calc(${calculations.todayRelativePosition}% - 60px)`,
                top: 0,
                zIndex: 10
              }}
            >
              <div className="node-dot current" />
              <span className="node-label" style={{ color: 'var(--text-primary)' }}>{t.todayText}</span>
              <span className="node-date" style={{ color: 'var(--text-primary)', fontWeight: '700' }}>
                {formatDate(now)}
              </span>
            </div>

            {/* Orlah Ends Node */}
            <div className="timeline-node" style={{ position: 'absolute', left: `calc(${calculations.orlahRelativePosition}% - 60px)`, top: 0 }}>
              <div className={`node-dot ${calculations.isOrlahOver ? 'completed' : 'active'}`}>
                {calculations.isOrlahOver ? <CheckCircle size={12} /> : '1'}
              </div>
              <span className="node-label">{lang === 'he' ? 'סיום ערלה' : 'Orlah Ends'}</span>
              <span className="node-date">{formatDate(orlahDateStr)}</span>
            </div>

            {/* Chulin Starts Node */}
            <div className="timeline-node" style={{ position: 'absolute', left: 'calc(100% - 60px)', top: 0 }}>
              <div className={`node-dot ${calculations.isChulinOver ? 'completed' : 'active'}`}>
                {calculations.isChulinOver ? <CheckCircle size={12} /> : '2'}
              </div>
              <span className="node-label">{lang === 'he' ? 'חולין גמור' : 'Chulin Starts'}</span>
              <span className="node-date">{formatDate(chulinDateStr)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Halachic Guides Boxes (Bottom Section) */}
      <section className="halacha-guides">
        <div className="guide-box">
          <h4 className="guide-title" style={{ color: 'var(--accent-yellow)' }}>
            <Info size={16} />
            {lang === 'he' ? 'דיני ערלה בקצרה' : 'Quick Guide to Orlah'}
          </h4>
          <p className="guide-text">
            {lang === 'he' 
              ? 'עורלה חלה על כל עץ פרי בשלוש השנים הראשונות לנטיעתו. פירות שחנטו (הגיעו לשלב ראשוני של פרי) לפני תאריך סיום שנות הערלה אסורים באכילה ובהנאה לעולם. בישראל ובחו"ל ישנם כללים שונים להקלה במקרי ספק, אך פירות ודאיים אסורים מן התורה בכל מקום.'
              : 'The Orlah prohibition applies to all fruit trees during their first three years of growth. Any fruit that buds before the end of the third year remains permanently forbidden to eat or benefit from. There are specific halachic rules governing planting times and Jewish calendar years.'}
          </p>
        </div>
        <div className="guide-box">
          <h4 className="guide-title" style={{ color: 'var(--accent-green)' }}>
            <Info size={16} />
            {lang === 'he' ? 'נטע רבעי וחולין' : 'Neta Reva\'i & Chulin'}
          </h4>
          <p className="guide-text">
            {lang === 'he' 
              ? 'בשנה הרביעית (נטע רבעי), הפירות קדושים וניתן לאכול אותם רק בירושלים, או לחילופין לפדות אותם במטבע ייעודי המוציא אותם לחולין. לאחר הפדיון (או החל מהשנה החמישית), הפירות הופכים ל"חולין גמורים" ומותרים לגמרי, אם כי בארץ ישראל עדיין יש להפריש מהם תרומות ומעשרות.'
              : 'In the fourth year, fruits are classified as Neta Reva\'i. Historically eaten in Jerusalem, they are redeemed nowadays with a coin, rendering them permitted. From the fifth year onwards, the fruits are completely ordinary (Chulin), subject only to standard tithing laws in the Land of Israel.'}
          </p>
        </div>
      </section>

      {/* Floating Gear Settings Button */}
      <button 
        className="btn-settings-floating" 
        onClick={() => setIsSettingsOpen(true)}
        aria-label="Settings"
      >
        <Settings size={28} />
      </button>

      {/* Settings Overlay & Drawer */}
      <div className={`settings-overlay ${isSettingsOpen ? 'open' : ''}`} onClick={() => setIsSettingsOpen(false)}>
        <div className="settings-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h2 className="drawer-title">
              <Settings size={24} style={{ color: 'var(--accent-yellow)' }} />
              {t.settingsTitle}
            </h2>
            <button className="btn-close" onClick={() => setIsSettingsOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <p className="settings-description">{t.settingsSub}</p>

          <form onSubmit={handleSave}>
            {validationError && (
              <div style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: '1rem', fontWeight: '600' }}>
                {validationError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">{t.plantingInput}</label>
              <input 
                type="datetime-local" 
                className="input-date" 
                value={tempPlanting}
                onChange={(e) => setTempPlanting(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.orlahInput}</label>
              <input 
                type="datetime-local" 
                className="input-date" 
                value={tempOrlah}
                onChange={(e) => setTempOrlah(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t.chulinInput}</label>
              <input 
                type="datetime-local" 
                className="input-date" 
                value={tempChulin}
                onChange={(e) => setTempChulin(e.target.value)}
                required
              />
            </div>

            <div className="drawer-footer">
              <button type="button" className="btn-secondary" onClick={handleReset}>
                <RefreshCw size={16} />
                {t.btnReset}
              </button>
              <button type="submit" className="btn-primary">
                <CheckCircle size={16} />
                {t.btnSave}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <p>© {new Date().getFullYear()} DadLemons • {t.appSubtitle}</p>
      </footer>
    </div>
  );
}

export default App;
