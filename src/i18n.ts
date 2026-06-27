import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          app_title: "Ruang Tsaqif",
          welcome: "Welcome to your personal workspace",
        },
      },
      id: {
        translation: {
          app_title: "Ruang Tsaqif",
          welcome: "Selamat datang di ruang kerja pribadi Anda",
        },
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
