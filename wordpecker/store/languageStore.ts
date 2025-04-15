import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language } from "@/types";
import { LANGUAGES } from "@/constants/mockData";

interface LanguageState {
  currentLanguage: Language;
  availableLanguages: Language[];
  translations: Record<string, Record<string, string>>;
  setLanguage: (languageCode: string) => void;
  translate: (key: string) => string;
}

// Default translations for each language
const translations = {
  en: {
    // Common
    "app.name": "WordPecker",
    "app.tagline": "Learn languages one word at a time",
    
    // Auth
    "auth.welcome": "Welcome Back",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.forgotPassword": "Forgot Password?",
    "auth.login": "Log In",
    "auth.noAccount": "Don't have an account?",
    "auth.signup": "Sign Up",
    "auth.createAccount": "Create Account",
    "auth.name": "Full Name",
    "auth.confirmPassword": "Confirm Password",
    "auth.alreadyAccount": "Already have an account?",
    "auth.resetPassword": "Reset Password",
    "auth.resetInstructions": "Enter your email and we'll send you instructions to reset your password.",
    "auth.sendInstructions": "Send Instructions",
    "auth.backToLogin": "Back to Login",
    "auth.testCredentials": "Test Credentials",
    
    // Home
    "home.hello": "Hello",
    "home.dailyStreak": "Daily Streak",
    "home.days": "days",
    "home.keepLearning": "Keep learning to maintain your streak!",
    "home.wordsMastered": "Words Mastered",
    "home.wordLists": "Word Lists",
    "home.quizAvg": "Quiz Avg.",
    "home.recentLists": "Recent Lists",
    "home.seeAll": "See All",
    "home.createNewList": "Create New List",
    
    // Lists
    "lists.myLists": "My Lists",
    "lists.search": "Search lists...",
    "lists.noLists": "No Lists Yet",
    "lists.createFirst": "Create your first word list to start learning",
    "lists.create": "Create List",
    "lists.sortBy": "Sort by",
    "lists.newest": "Newest",
    "lists.oldest": "Oldest",
    "lists.alphabetical": "A-Z",
    "lists.progress": "Progress",
    
    // Create List
    "createList.title": "Create New List",
    "createList.listDetails": "List Details",
    "createList.listTitle": "List Title",
    "createList.titlePlaceholder": "e.g., Daily Conversations",
    "createList.description": "Description",
    "createList.descriptionPlaceholder": "What is this list about?",
    "createList.category": "Category",
    "createList.languages": "Languages",
    "createList.from": "From:",
    "createList.to": "To:",
    "createList.source": "Source (Optional)",
    "createList.sourcePlaceholder": "e.g., Textbook, Website, Course",
    "createList.cancel": "Cancel",
    "createList.createAddWords": "Create & Add Words",
    
    // Settings
    "settings.title": "Settings",
    "settings.editProfile": "Edit Profile",
    "settings.preferences": "Preferences",
    "settings.darkMode": "Dark Mode",
    "settings.notifications": "Notifications",
    "settings.language": "Language",
    "settings.data": "Data",
    "settings.exportData": "Export Data",
    "settings.exportDescription": "Export all your word lists and progress",
    "settings.importData": "Import Data",
    "settings.importDescription": "Import word lists from a file",
    "settings.support": "Support",
    "settings.helpFaq": "Help & FAQ",
    "settings.privacyPolicy": "Privacy Policy",
    "settings.logout": "Logout",
    "settings.deleteAccount": "Delete Account",
    "settings.version": "Version",
    
    // Learning
    "learning.title": "Learning",
    "learning.progress": "Progress",
    "learning.mastered": "Mastered",
    "learning.remaining": "Remaining",
    "learning.showAnswer": "Show Answer",
    "learning.iKnowThis": "I Know This",
    "learning.stillLearning": "Still Learning",
    "learning.completed": "Completed!",
    "learning.allWordsMastered": "You've mastered all words in this list!",
    "learning.backToList": "Back to List",
    "learning.takeQuiz": "Take Quiz",
    
    // Quiz
    "quiz.title": "Quiz",
    "quiz.question": "Question",
    "quiz.of": "of",
    "quiz.check": "Check Answer",
    "quiz.next": "Next",
    "quiz.correct": "Correct!",
    "quiz.incorrect": "Incorrect!",
    "quiz.completed": "Quiz Completed!",
    "quiz.yourScore": "Your Score",
    "quiz.tryAgain": "Try Again",
    "quiz.backToList": "Back to List",
    
    // Word
    "word.addWord": "Add Word",
    "word.sourceWord": "Source Word",
    "word.targetWord": "Target Word",
    "word.pronunciation": "Pronunciation (Optional)",
    "word.contextSentence": "Context Sentence (Optional)",
    "word.difficulty": "Difficulty",
    "word.easy": "Easy",
    "word.medium": "Medium",
    "word.hard": "Hard",
    "word.add": "Add Word",
    "word.addAnother": "Add Another",
    "word.finishAdding": "Finish Adding",
    
    // Errors
    "error.required": "This field is required",
    "error.invalidEmail": "Please enter a valid email",
    "error.passwordLength": "Password must be at least 6 characters",
    "error.passwordMatch": "Passwords do not match",
    "error.failedLogin": "Failed to login. Please check your credentials.",
    "error.failedRegister": "Failed to register. Please try again.",
    "error.failedCreateList": "Failed to create list. Please try again.",
    "error.failedAddWord": "Failed to add word. Please try again.",
  },
  tr: {
    // Common
    "app.name": "KelimePicker",
    "app.tagline": "Dilleri kelime kelime öğrenin",
    
    // Auth
    "auth.welcome": "Tekrar Hoşgeldiniz",
    "auth.email": "E-posta",
    "auth.password": "Şifre",
    "auth.forgotPassword": "Şifremi Unuttum?",
    "auth.login": "Giriş Yap",
    "auth.noAccount": "Hesabınız yok mu?",
    "auth.signup": "Kaydol",
    "auth.createAccount": "Hesap Oluştur",
    "auth.name": "Ad Soyad",
    "auth.confirmPassword": "Şifreyi Onayla",
    "auth.alreadyAccount": "Zaten hesabınız var mı?",
    "auth.resetPassword": "Şifre Sıfırlama",
    "auth.resetInstructions": "E-posta adresinizi girin, şifrenizi sıfırlamak için talimatları göndereceğiz.",
    "auth.sendInstructions": "Talimatları Gönder",
    "auth.backToLogin": "Girişe Dön",
    "auth.testCredentials": "Test Bilgileri",
    
    // Home
    "home.hello": "Merhaba",
    "home.dailyStreak": "Günlük Seri",
    "home.days": "gün",
    "home.keepLearning": "Serinizi korumak için öğrenmeye devam edin!",
    "home.wordsMastered": "Öğrenilen Kelimeler",
    "home.wordLists": "Kelime Listeleri",
    "home.quizAvg": "Quiz Ort.",
    "home.recentLists": "Son Listeler",
    "home.seeAll": "Tümünü Gör",
    "home.createNewList": "Yeni Liste Oluştur",
    
    // Lists
    "lists.myLists": "Listelerim",
    "lists.search": "Listelerde ara...",
    "lists.noLists": "Henüz Liste Yok",
    "lists.createFirst": "Öğrenmeye başlamak için ilk kelime listenizi oluşturun",
    "lists.create": "Liste Oluştur",
    "lists.sortBy": "Sırala",
    "lists.newest": "En Yeni",
    "lists.oldest": "En Eski",
    "lists.alphabetical": "A-Z",
    "lists.progress": "İlerleme",
    
    // Create List
    "createList.title": "Yeni Liste Oluştur",
    "createList.listDetails": "Liste Detayları",
    "createList.listTitle": "Liste Başlığı",
    "createList.titlePlaceholder": "örn., Günlük Konuşmalar",
    "createList.description": "Açıklama",
    "createList.descriptionPlaceholder": "Bu liste ne hakkında?",
    "createList.category": "Kategori",
    "createList.languages": "Diller",
    "createList.from": "Kaynak:",
    "createList.to": "Hedef:",
    "createList.source": "Kaynak (İsteğe Bağlı)",
    "createList.sourcePlaceholder": "örn., Ders Kitabı, Web Sitesi, Kurs",
    "createList.cancel": "İptal",
    "createList.createAddWords": "Oluştur ve Kelime Ekle",
    
    // Settings
    "settings.title": "Ayarlar",
    "settings.editProfile": "Profili Düzenle",
    "settings.preferences": "Tercihler",
    "settings.darkMode": "Karanlık Mod",
    "settings.notifications": "Bildirimler",
    "settings.language": "Dil",
    "settings.data": "Veri",
    "settings.exportData": "Verileri Dışa Aktar",
    "settings.exportDescription": "Tüm kelime listelerinizi ve ilerlemenizi dışa aktarın",
    "settings.importData": "Verileri İçe Aktar",
    "settings.importDescription": "Kelime listelerini bir dosyadan içe aktarın",
    "settings.support": "Destek",
    "settings.helpFaq": "Yardım ve SSS",
    "settings.privacyPolicy": "Gizlilik Politikası",
    "settings.logout": "Çıkış Yap",
    "settings.deleteAccount": "Hesabı Sil",
    "settings.version": "Sürüm",
    
    // Learning
    "learning.title": "Öğrenme",
    "learning.progress": "İlerleme",
    "learning.mastered": "Öğrenildi",
    "learning.remaining": "Kalan",
    "learning.showAnswer": "Cevabı Göster",
    "learning.iKnowThis": "Bunu Biliyorum",
    "learning.stillLearning": "Hala Öğreniyorum",
    "learning.completed": "Tamamlandı!",
    "learning.allWordsMastered": "Bu listedeki tüm kelimeleri öğrendiniz!",
    "learning.backToList": "Listeye Dön",
    "learning.takeQuiz": "Quiz Yap",
    
    // Quiz
    "quiz.title": "Quiz",
    "quiz.question": "Soru",
    "quiz.of": "/",
    "quiz.check": "Cevabı Kontrol Et",
    "quiz.next": "Sonraki",
    "quiz.correct": "Doğru!",
    "quiz.incorrect": "Yanlış!",
    "quiz.completed": "Quiz Tamamlandı!",
    "quiz.yourScore": "Puanınız",
    "quiz.tryAgain": "Tekrar Dene",
    "quiz.backToList": "Listeye Dön",
    
    // Word
    "word.addWord": "Kelime Ekle",
    "word.sourceWord": "Kaynak Kelime",
    "word.targetWord": "Hedef Kelime",
    "word.pronunciation": "Telaffuz (İsteğe Bağlı)",
    "word.contextSentence": "Bağlam Cümlesi (İsteğe Bağlı)",
    "word.difficulty": "Zorluk",
    "word.easy": "Kolay",
    "word.medium": "Orta",
    "word.hard": "Zor",
    "word.add": "Kelime Ekle",
    "word.addAnother": "Başka Ekle",
    "word.finishAdding": "Eklemeyi Bitir",
    
    // Errors
    "error.required": "Bu alan gereklidir",
    "error.invalidEmail": "Lütfen geçerli bir e-posta adresi girin",
    "error.passwordLength": "Şifre en az 6 karakter olmalıdır",
    "error.passwordMatch": "Şifreler eşleşmiyor",
    "error.failedLogin": "Giriş başarısız. Lütfen bilgilerinizi kontrol edin.",
    "error.failedRegister": "Kayıt başarısız. Lütfen tekrar deneyin.",
    "error.failedCreateList": "Liste oluşturulamadı. Lütfen tekrar deneyin.",
    "error.failedAddWord": "Kelime eklenemedi. Lütfen tekrar deneyin.",
  },
  de: {
    // Common
    "app.name": "WortPicker",
    "app.tagline": "Sprachen Wort für Wort lernen",
    
    // Auth
    "auth.welcome": "Willkommen zurück",
    "auth.email": "E-Mail",
    "auth.password": "Passwort",
    "auth.forgotPassword": "Passwort vergessen?",
    "auth.login": "Anmelden",
    "auth.noAccount": "Noch kein Konto?",
    "auth.signup": "Registrieren",
    "auth.createAccount": "Konto erstellen",
    "auth.name": "Vollständiger Name",
    "auth.confirmPassword": "Passwort bestätigen",
    "auth.alreadyAccount": "Bereits ein Konto?",
    "auth.resetPassword": "Passwort zurücksetzen",
    "auth.resetInstructions": "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen Anweisungen zum Zurücksetzen Ihres Passworts.",
    "auth.sendInstructions": "Anweisungen senden",
    "auth.backToLogin": "Zurück zur Anmeldung",
    "auth.testCredentials": "Testanmeldedaten",
    
    // Home
    "home.hello": "Hallo",
    "home.dailyStreak": "Tägliche Serie",
    "home.days": "Tage",
    "home.keepLearning": "Lernen Sie weiter, um Ihre Serie aufrechtzuerhalten!",
    "home.wordsMastered": "Beherrschte Wörter",
    "home.wordLists": "Wortlisten",
    "home.quizAvg": "Quiz-Durchschnitt",
    "home.recentLists": "Neueste Listen",
    "home.seeAll": "Alle anzeigen",
    "home.createNewList": "Neue Liste erstellen",
    
    // Lists
    "lists.myLists": "Meine Listen",
    "lists.search": "Listen durchsuchen...",
    "lists.noLists": "Noch keine Listen",
    "lists.createFirst": "Erstellen Sie Ihre erste Wortliste, um mit dem Lernen zu beginnen",
    "lists.create": "Liste erstellen",
    "lists.sortBy": "Sortieren nach",
    "lists.newest": "Neueste",
    "lists.oldest": "Älteste",
    "lists.alphabetical": "A-Z",
    "lists.progress": "Fortschritt",
    
    // Create List
    "createList.title": "Neue Liste erstellen",
    "createList.listDetails": "Listendetails",
    "createList.listTitle": "Listentitel",
    "createList.titlePlaceholder": "z.B. Tägliche Gespräche",
    "createList.description": "Beschreibung",
    "createList.descriptionPlaceholder": "Worum geht es in dieser Liste?",
    "createList.category": "Kategorie",
    "createList.languages": "Sprachen",
    "createList.from": "Von:",
    "createList.to": "Nach:",
    "createList.source": "Quelle (Optional)",
    "createList.sourcePlaceholder": "z.B. Lehrbuch, Website, Kurs",
    "createList.cancel": "Abbrechen",
    "createList.createAddWords": "Erstellen & Wörter hinzufügen",
    
    // Settings
    "settings.title": "Einstellungen",
    "settings.editProfile": "Profil bearbeiten",
    "settings.preferences": "Präferenzen",
    "settings.darkMode": "Dunkelmodus",
    "settings.notifications": "Benachrichtigungen",
    "settings.language": "Sprache",
    "settings.data": "Daten",
    "settings.exportData": "Daten exportieren",
    "settings.exportDescription": "Exportieren Sie alle Ihre Wortlisten und Fortschritte",
    "settings.importData": "Daten importieren",
    "settings.importDescription": "Wortlisten aus einer Datei importieren",
    "settings.support": "Support",
    "settings.helpFaq": "Hilfe & FAQ",
    "settings.privacyPolicy": "Datenschutzrichtlinie",
    "settings.logout": "Abmelden",
    "settings.deleteAccount": "Konto löschen",
    "settings.version": "Version",
    
    // Learning
    "learning.title": "Lernen",
    "learning.progress": "Fortschritt",
    "learning.mastered": "Beherrscht",
    "learning.remaining": "Verbleibend",
    "learning.showAnswer": "Antwort anzeigen",
    "learning.iKnowThis": "Ich weiß das",
    "learning.stillLearning": "Noch am Lernen",
    "learning.completed": "Abgeschlossen!",
    "learning.allWordsMastered": "Sie haben alle Wörter in dieser Liste gemeistert!",
    "learning.backToList": "Zurück zur Liste",
    "learning.takeQuiz": "Quiz machen",
    
    // Quiz
    "quiz.title": "Quiz",
    "quiz.question": "Frage",
    "quiz.of": "von",
    "quiz.check": "Antwort prüfen",
    "quiz.next": "Weiter",
    "quiz.correct": "Richtig!",
    "quiz.incorrect": "Falsch!",
    "quiz.completed": "Quiz abgeschlossen!",
    "quiz.yourScore": "Ihr Ergebnis",
    "quiz.tryAgain": "Erneut versuchen",
    "quiz.backToList": "Zurück zur Liste",
    
    // Word
    "word.addWord": "Wort hinzufügen",
    "word.sourceWord": "Quellwort",
    "word.targetWord": "Zielwort",
    "word.pronunciation": "Aussprache (Optional)",
    "word.contextSentence": "Kontextsatz (Optional)",
    "word.difficulty": "Schwierigkeit",
    "word.easy": "Leicht",
    "word.medium": "Mittel",
    "word.hard": "Schwer",
    "word.add": "Wort hinzufügen",
    "word.addAnother": "Weiteres hinzufügen",
    "word.finishAdding": "Hinzufügen beenden",
    
    // Errors
    "error.required": "Dieses Feld ist erforderlich",
    "error.invalidEmail": "Bitte geben Sie eine gültige E-Mail-Adresse ein",
    "error.passwordLength": "Das Passwort muss mindestens 6 Zeichen lang sein",
    "error.passwordMatch": "Die Passwörter stimmen nicht überein",
    "error.failedLogin": "Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Anmeldedaten.",
    "error.failedRegister": "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
    "error.failedCreateList": "Liste konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
    "error.failedAddWord": "Wort konnte nicht hinzugefügt werden. Bitte versuchen Sie es erneut.",
  },
  fr: {
    // Common
    "app.name": "MotPicker",
    "app.tagline": "Apprenez les langues mot par mot",
    
    // Auth
    "auth.welcome": "Bon Retour",
    "auth.email": "Email",
    "auth.password": "Mot de passe",
    "auth.forgotPassword": "Mot de passe oublié?",
    "auth.login": "Se connecter",
    "auth.noAccount": "Vous n'avez pas de compte?",
    "auth.signup": "S'inscrire",
    "auth.createAccount": "Créer un compte",
    "auth.name": "Nom complet",
    "auth.confirmPassword": "Confirmer le mot de passe",
    "auth.alreadyAccount": "Vous avez déjà un compte?",
    "auth.resetPassword": "Réinitialiser le mot de passe",
    "auth.resetInstructions": "Entrez votre email et nous vous enverrons des instructions pour réinitialiser votre mot de passe.",
    "auth.sendInstructions": "Envoyer les instructions",
    "auth.backToLogin": "Retour à la connexion",
    "auth.testCredentials": "Identifiants de test",
    
    // Home
    "home.hello": "Bonjour",
    "home.dailyStreak": "Série quotidienne",
    "home.days": "jours",
    "home.keepLearning": "Continuez à apprendre pour maintenir votre série!",
    "home.wordsMastered": "Mots maîtrisés",
    "home.wordLists": "Listes de mots",
    "home.quizAvg": "Moy. des quiz",
    "home.recentLists": "Listes récentes",
    "home.seeAll": "Voir tout",
    "home.createNewList": "Créer une nouvelle liste",
    
    // Lists
    "lists.myLists": "Mes listes",
    "lists.search": "Rechercher des listes...",
    "lists.noLists": "Pas encore de listes",
    "lists.createFirst": "Créez votre première liste de mots pour commencer à apprendre",
    "lists.create": "Créer une liste",
    "lists.sortBy": "Trier par",
    "lists.newest": "Plus récent",
    "lists.oldest": "Plus ancien",
    "lists.alphabetical": "A-Z",
    "lists.progress": "Progrès",
    
    // Create List
    "createList.title": "Créer une nouvelle liste",
    "createList.listDetails": "Détails de la liste",
    "createList.listTitle": "Titre de la liste",
    "createList.titlePlaceholder": "ex., Conversations quotidiennes",
    "createList.description": "Description",
    "createList.descriptionPlaceholder": "De quoi parle cette liste?",
    "createList.category": "Catégorie",
    "createList.languages": "Langues",
    "createList.from": "De:",
    "createList.to": "À:",
    "createList.source": "Source (Optionnel)",
    "createList.sourcePlaceholder": "ex., Manuel, Site web, Cours",
    "createList.cancel": "Annuler",
    "createList.createAddWords": "Créer et ajouter des mots",
    
    // Settings
    "settings.title": "Paramètres",
    "settings.editProfile": "Modifier le profil",
    "settings.preferences": "Préférences",
    "settings.darkMode": "Mode sombre",
    "settings.notifications": "Notifications",
    "settings.language": "Langue",
    "settings.data": "Données",
    "settings.exportData": "Exporter les données",
    "settings.exportDescription": "Exportez toutes vos listes de mots et vos progrès",
    "settings.importData": "Importer des données",
    "settings.importDescription": "Importer des listes de mots à partir d'un fichier",
    "settings.support": "Support",
    "settings.helpFaq": "Aide et FAQ",
    "settings.privacyPolicy": "Politique de confidentialité",
    "settings.logout": "Déconnexion",
    "settings.deleteAccount": "Supprimer le compte",
    "settings.version": "Version",
    
    // Learning
    "learning.title": "Apprentissage",
    "learning.progress": "Progrès",
    "learning.mastered": "Maîtrisé",
    "learning.remaining": "Restant",
    "learning.showAnswer": "Afficher la réponse",
    "learning.iKnowThis": "Je connais ça",
    "learning.stillLearning": "Encore en apprentissage",
    "learning.completed": "Terminé!",
    "learning.allWordsMastered": "Vous avez maîtrisé tous les mots de cette liste!",
    "learning.backToList": "Retour à la liste",
    "learning.takeQuiz": "Faire un quiz",
    
    // Quiz
    "quiz.title": "Quiz",
    "quiz.question": "Question",
    "quiz.of": "sur",
    "quiz.check": "Vérifier la réponse",
    "quiz.next": "Suivant",
    "quiz.correct": "Correct!",
    "quiz.incorrect": "Incorrect!",
    "quiz.completed": "Quiz terminé!",
    "quiz.yourScore": "Votre score",
    "quiz.tryAgain": "Réessayer",
    "quiz.backToList": "Retour à la liste",
    
    // Word
    "word.addWord": "Ajouter un mot",
    "word.sourceWord": "Mot source",
    "word.targetWord": "Mot cible",
    "word.pronunciation": "Prononciation (Optionnel)",
    "word.contextSentence": "Phrase contextuelle (Optionnel)",
    "word.difficulty": "Difficulté",
    "word.easy": "Facile",
    "word.medium": "Moyen",
    "word.hard": "Difficile",
    "word.add": "Ajouter un mot",
    "word.addAnother": "Ajouter un autre",
    "word.finishAdding": "Terminer l'ajout",
    
    // Errors
    "error.required": "Ce champ est obligatoire",
    "error.invalidEmail": "Veuillez entrer un email valide",
    "error.passwordLength": "Le mot de passe doit comporter au moins 6 caractères",
    "error.passwordMatch": "Les mots de passe ne correspondent pas",
    "error.failedLogin": "Échec de la connexion. Veuillez vérifier vos identifiants.",
    "error.failedRegister": "Échec de l'inscription. Veuillez réessayer.",
    "error.failedCreateList": "Échec de la création de la liste. Veuillez réessayer.",
    "error.failedAddWord": "Échec de l'ajout du mot. Veuillez réessayer.",
  },
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      // Set Turkish as the default language
      currentLanguage: LANGUAGES.find(lang => lang.code === "tr") || LANGUAGES[0],
      availableLanguages: LANGUAGES.slice(0, 4), // Use first 4 languages
      translations,
      
      setLanguage: (languageCode) => {
        const language = LANGUAGES.find(lang => lang.code === languageCode);
        if (language) {
          set({ currentLanguage: language });
        }
      },
      
      translate: (key) => {
        const { currentLanguage, translations } = get();
        const langTranslations = translations[currentLanguage.code] || translations.en;
        return langTranslations[key] || translations.en[key] || key;
      },
    }),
    {
      name: "language-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);