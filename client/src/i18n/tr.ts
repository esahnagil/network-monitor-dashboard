/**
 * Türkçe dil dosyası
 */
export const tr = {
  // Genel 
  app: {
    name: "NetGuardian",
    loading: "Yükleniyor...",
    error: "Bir hata oluştu",
    retry: "Tekrar Dene",
    save: "Kaydet",
    cancel: "İptal",
    delete: "Sil",
    edit: "Düzenle",
    create: "Oluştur",
    filter: "Filtrele",
    search: "Ara...",
    noData: "Veri bulunamadı",
    confirm: "Onayla",
    actions: "İşlemler",
    moreInfo: "Daha Fazla Bilgi",
    required: "Bu alan zorunludur",
    optional: "(isteğe bağlı)",
    settings: "Ayarlar"
  },

  // Bildirimler
  notifications: {
    success: "Başarılı!",
    error: "Hata!",
    warning: "Uyarı!",
    info: "Bilgi",
    connectionEstablished: "Bağlantı kuruldu",
    connectionLost: "Bağlantı kesildi",
    reconnecting: "Yeniden bağlanılıyor..."
  },

  // Kimlik doğrulama
  auth: {
    login: "Giriş Yap",
    logout: "Çıkış Yap",
    username: "Kullanıcı Adı",
    password: "Şifre",
    forgotPassword: "Şifremi Unuttum",
    register: "Kayıt Ol",
    loginError: "Giriş yapılamadı",
    invalidCredentials: "Geçersiz kullanıcı adı veya şifre"
  },

  // Ana sayfa
  dashboard: {
    title: "Kontrol Paneli",
    overview: "Genel Bakış",
    totalDevices: "Toplam Cihaz",
    onlineDevices: "Çevrimiçi Cihazlar",
    offlineDevices: "Çevrimdışı Cihazlar",
    uptime: "Çalışma Süresi",
    performance: "Performans",
    recentAlerts: "Son Uyarılar",
    status: {
      online: "Çevrimiçi",
      offline: "Çevrimdışı",
      warning: "Uyarı",
      error: "Hata",
      unknown: "Bilinmiyor"
    }
  },

  // Cihazlar
  devices: {
    title: "Cihazlar",
    add: "Yeni Cihaz Ekle",
    edit: "Cihazı Düzenle",
    delete: "Cihazı Sil",
    deleteConfirm: "Bu cihazı silmek istediğinize emin misiniz?",
    name: "Cihaz Adı",
    ipAddress: "IP Adresi",
    type: "Cihaz Türü",
    status: "Durum",
    location: "Konum",
    lastSeen: "Son Görülme",
    uptime: "Çalışma Süresi",
    details: "Cihaz Detayları",
    types: {
      server: "Sunucu",
      router: "Yönlendirici",
      switch: "Anahtar",
      firewall: "Güvenlik Duvarı",
      workstation: "İş İstasyonu",
      printer: "Yazıcı",
      other: "Diğer"
    }
  },

  // İzleme
  monitoring: {
    title: "İzleme",
    add: "Yeni İzleme Ekle",
    edit: "İzlemeyi Düzenle",
    delete: "İzlemeyi Sil",
    deleteConfirm: "Bu izlemeyi silmek istediğinize emin misiniz?",
    type: "İzleme Türü",
    device: "Cihaz",
    interval: "Kontrol Aralığı",
    status: "Durum",
    lastCheck: "Son Kontrol",
    nextCheck: "Sonraki Kontrol",
    responseTime: "Yanıt Süresi",
    details: "İzleme Detayları",
    enabled: "Etkin",
    disabled: "Devre Dışı",
    enableDisable: "Etkinleştir/Devre Dışı Bırak",
    connectionSuccess: "İzleme sunucusuna başarıyla bağlanıldı",
    connectionLost: "İzleme sunucusuyla bağlantı kesildi",
    reconnecting: "İzleme sunucusuna yeniden bağlanılıyor",
    types: {
      icmp: "ICMP (Ping)",
      http: "HTTP/HTTPS",
      tcp: "TCP Port",
      snmp: "SNMP",
      custom: "Özel"
    },
    configuration: {
      title: "İzleme Yapılandırması",
      timeout: "Zaman Aşımı (ms)",
      retries: "Yeniden Deneme",
      port: "Port",
      url: "URL",
      method: "Metod",
      username: "Kullanıcı Adı",
      password: "Şifre",
      community: "SNMP Community",
      version: "SNMP Sürümü",
      oid: "OID",
      expectedValue: "Beklenen Değer",
      expectedStatusCode: "Beklenen Durum Kodu",
      script: "Özel Script",
      headers: "HTTP Başlıkları",
      body: "HTTP İstek Gövdesi"
    }
  },

  // Uyarılar
  alerts: {
    title: "Uyarılar",
    add: "Yeni Uyarı Ekle",
    edit: "Uyarıyı Düzenle",
    delete: "Uyarıyı Sil",
    deleteConfirm: "Bu uyarıyı silmek istediğinize emin misiniz?",
    type: "Uyarı Türü",
    device: "Cihaz",
    monitor: "İzleme",
    status: "Durum",
    timestamp: "Zaman",
    message: "Mesaj",
    details: "Uyarı Detayları",
    acknowledge: "Onayla",
    resolve: "Çöz",
    severity: {
      info: "Bilgi",
      warning: "Uyarı",
      critical: "Kritik",
      error: "Hata"
    },
    alertStatus: {
      active: "Aktif",
      acknowledged: "Onaylandı",
      resolved: "Çözüldü"
    },
    notification: {
      title: "Yeni Uyarı",
      message: "{{deviceName}} için yeni bir uyarı oluştu: {{message}}"
    }
  },

  // Ayarlar
  settings: {
    title: "Ayarlar",
    general: "Genel Ayarlar",
    notifications: "Bildirim Ayarları",
    security: "Güvenlik Ayarları",
    users: "Kullanıcı Yönetimi",
    backup: "Yedekleme & Geri Yükleme",
    language: "Dil",
    theme: "Tema",
    timeZone: "Zaman Dilimi",
    dateFormat: "Tarih Formatı",
    save: "Ayarları Kaydet",
    reset: "Varsayılana Sıfırla",
    languages: {
      tr: "Türkçe",
      en: "İngilizce"
    },
    themes: {
      light: "Açık",
      dark: "Koyu",
      system: "Sistem"
    },
    notificationSettings: {
      email: "E-posta Bildirimleri",
      push: "Anlık Bildirimler",
      sms: "SMS Bildirimleri",
      enabled: "Etkin",
      disabled: "Devre Dışı",
      recipients: "Alıcılar",
      addRecipient: "Alıcı Ekle",
      testNotification: "Test Bildirimi Gönder"
    }
  },

  // Hata sayfaları
  errors: {
    notFound: {
      title: "Sayfa Bulunamadı",
      message: "Aradığınız sayfa mevcut değil veya kaldırılmış olabilir.",
      goBack: "Ana Sayfaya Dön"
    },
    serverError: {
      title: "Sunucu Hatası",
      message: "Bir sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.",
      goBack: "Ana Sayfaya Dön"
    },
    noConnection: {
      title: "Bağlantı Hatası",
      message: "Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.",
      retry: "Yeniden Dene"
    }
  }
};