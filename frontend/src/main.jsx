// ============================================================
// GharDisha AI — Guided Trust Prototype Frontend
// ============================================================
// Hackathon design goal:
//   Do not throw rural/disaster-affected users directly into a form.
//   First build trust through language choice, name/role, a simple guide,
//   and then the live AI case interpreter.
// ============================================================
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowRight, BadgeCheck, BookOpenCheck, Building2, CalendarClock, CheckCircle2,
  ChevronLeft, ChevronRight, FileText, Globe2, HandHeart, Home, Landmark,
  Languages, MapPinned, Mic, MicOff, RotateCcw, ShieldCheck, Sparkles,
  UploadCloud, UserRound, UsersRound, Waves,
} from 'lucide-react';
import { useVoiceInput } from './useVoiceInput';
import { tr } from './translations';
import './styles.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const MAX_FOLLOW_UPS = 2;

const LANGUAGE_OPTIONS = [
  {
    "code": "en",
    "label": "English",
    "native": "English",
    "mode": "voice"
  },
  {
    "code": "hi",
    "label": "Hindi",
    "native": "हिन्दी",
    "mode": "voice"
  },
  {
    "code": "as",
    "label": "Assamese",
    "native": "অসমীয়া",
    "mode": "text"
  },
  {
    "code": "ta",
    "label": "Tamil",
    "native": "தமிழ்",
    "mode": "voice"
  },
  {
    "code": "mr",
    "label": "Marathi",
    "native": "मराठी",
    "mode": "voice"
  }
];

const FLOW_COPY = {
  "en": {
    "splashKicker": "Student-built PMAY-G navigation prototype",
    "splashTitle": "GharDisha AI",
    "splashPitch": "A trusted-helper-assisted AI case interpreter for disaster-displaced rural families.",
    "splashCta": "Begin guided setup",
    "notOfficial": "Not an official Government of India service",
    "languageTitle": "Which language should we use?",
    "languageSubtitle": "Choose the language that feels most comfortable for the family or helper.",
    "voiceText": "Voice + text",
    "textOutput": "Text output",
    "continue": "Continue",
    "back": "Back",
    "nameTitle": "Let’s make this easy",
    "nameSubtitle": "Your name is only used to make the summary easier to read. No account is needed.",
    "nameLabel": "What should we call you?",
    "namePlaceholder": "Example: Priya",
    "roleLabel": "Who is using GharDisha today?",
    "roleFamily": "I am a family member",
    "roleHelper": "I am helping a family",
    "rolePanchayat": "Panchayat / village representative",
    "roleNgo": "Aid group / relief worker",
    "guideTitle": "Why families can trust GharDisha",
    "guideSubtitle": "Before asking for details, GharDisha explains what it does and what it never does.",
    "startCase": "Start case interpretation",
    "restart": "Restart guide",
    "profile": "User profile",
    "usingAs": "Using as",
    "generatedOn": "Generated on",
    "safeNoticeTitle": "Safe guidance, not a final decision",
    "illustrationLabel": "Safe path to PMAY-G",
    "cards": [
      {
        "title": "1. Tell the story naturally",
        "body": "A family or trusted helper explains what happened — disaster damage, shelter, missing papers, and confusion."
      },
      {
        "title": "2. AI turns the story into a case file",
        "body": "The AI picks out the important facts, shows what is unclear, and asks the next best question."
      },
      {
        "title": "3. Official PMAY-G information is used",
        "body": "The answer is based on verified PMAY-G information, not random Google results or rumours."
      },
      {
        "title": "4. Human officials remain in control",
        "body": "GharDisha prepares the family for Gram Sabha / BDO verification. It never approves anyone."
      }
    ],
    "trustPoints": [
      "Uses official PMAY-G information",
      "Never says “you qualify”; it says “you may need official verification”",
      "Can be used with a Panchayat helper, aid group, or relief worker",
      "Final decision remains with Gram Sabha / BDO officials"
    ]
  },
  "hi": {
    "splashKicker": "छात्रों द्वारा बनाया गया PMAY-G सहायता प्रोटोटाइप",
    "splashTitle": "GharDisha AI",
    "splashPitch": "बाढ़ से प्रभावित ग्रामीण परिवारों के लिए भरोसेमंद सहायक के साथ चलने वाला AI मार्गदर्शक।",
    "splashCta": "आसान मार्गदर्शन शुरू करें",
    "notOfficial": "यह भारत सरकार की आधिकारिक सेवा नहीं है",
    "languageTitle": "आप कौन सी भाषा इस्तेमाल करना चाहते हैं?",
    "languageSubtitle": "परिवार या मदद करने वाले व्यक्ति के लिए जो भाषा आसान हो, वही चुनें।",
    "voiceText": "आवाज़ + लिखित",
    "textOutput": "लिखित जवाब",
    "continue": "आगे बढ़ें",
    "back": "पीछे",
    "nameTitle": "आइए, इसे आसान बनाते हैं",
    "nameSubtitle": "आपका नाम केवल सारांश को आसान बनाने के लिए लिया जाता है। यहाँ कोई खाता बनाने की जरूरत नहीं है।",
    "nameLabel": "हम आपको किस नाम से बुलाएँ?",
    "namePlaceholder": "उदाहरण: प्रिया",
    "roleLabel": "आज GharDisha का उपयोग कौन कर रहा है?",
    "roleFamily": "मैं परिवार का सदस्य हूँ",
    "roleHelper": "मैं किसी परिवार की मदद कर रहा/रही हूँ",
    "rolePanchayat": "पंचायत / गाँव प्रतिनिधि",
    "roleNgo": "सहायता संस्था / राहत कार्यकर्ता",
    "guideTitle": "GharDisha पर भरोसा क्यों किया जा सकता है",
    "guideSubtitle": "जानकारी लेने से पहले यह साफ बताता है कि यह क्या करता है और क्या नहीं करता।",
    "startCase": "मामला समझना शुरू करें",
    "restart": "गाइड फिर से शुरू करें",
    "profile": "उपयोगकर्ता जानकारी",
    "usingAs": "भूमिका",
    "generatedOn": "तारीख और समय",
    "safeNoticeTitle": "सुरक्षित सलाह, अंतिम निर्णय नहीं",
    "illustrationLabel": "PMAY-G तक सुरक्षित रास्ता",
    "cards": [
      {
        "title": "1. अपनी बात सामान्य भाषा में बताइए",
        "body": "परिवार या भरोसेमंद सहायक बताएगा कि क्या हुआ — बाढ़, रहने की जगह, कागजों की कमी और उलझन।"
      },
      {
        "title": "2. AI बात को केस जानकारी में बदलता है",
        "body": "AI जरूरी जानकारी निकालता है, जो बात साफ नहीं है उसे दिखाता है और अगला जरूरी सवाल पूछता है।"
      },
      {
        "title": "3. आधिकारिक PMAY-G जानकारी का उपयोग होता है",
        "body": "जवाब आधिकारिक PMAY-G जानकारी पर आधारित होता है, अफवाह या बिना जाँच वाली जानकारी पर नहीं।"
      },
      {
        "title": "4. अंतिम निर्णय अधिकारी लेते हैं",
        "body": "GharDisha परिवार को ग्राम सभा / BDO जाँच के लिए तैयार करता है। यह किसी को मंजूरी नहीं देता।"
      }
    ],
    "trustPoints": [
      "जवाब आधिकारिक PMAY-G जानकारी के आधार पर तैयार होता है",
      "यह कभी “आप पात्र हैं” नहीं कहता; यह केवल “आगे सरकारी जाँच जरूरी है” कहता है",
      "परिवार के साथ पंचायत सहायक, सहायता संस्था या राहत कार्यकर्ता इसका उपयोग कर सकते हैं",
      "अंतिम निर्णय ग्राम सभा और BDO अधिकारी के पास रहता है"
    ]
  },
  "as": {
    "splashKicker": "ছাত্ৰ-নিৰ্মিত PMAY-G সহায়ক prototype",
    "splashTitle": "GharDisha AI",
    "splashPitch": "বানপানীত ক্ষতিগ্ৰস্ত গাঁওৰ পৰিয়ালৰ বাবে বিশ্বাসযোগ্য সহায়কৰ সৈতে ব্যৱহাৰ কৰিব পৰা AI guide.",
    "splashCta": "সহজ guide আৰম্ভ কৰক",
    "notOfficial": "এইটো ভাৰত চৰকাৰৰ আনুষ্ঠানিক সেৱা নহয়",
    "languageTitle": "আপুনি কোন ভাষা ব্যৱহাৰ কৰিব বিচাৰে?",
    "languageSubtitle": "পৰিয়াল বা সহায়কৰ বাবে যিটো ভাষা সহজ, সেইটো বাছক।",
    "voiceText": "আৱাজ + লেখা",
    "textOutput": "লিখিত উত্তৰ",
    "continue": "আগলৈ",
    "back": "পিছলৈ",
    "nameTitle": "ইয়াক সহজ কৰি লওঁ",
    "nameSubtitle": "আপোনাৰ নাম কেৱল summary সহজে পঢ়িবলৈ ব্যৱহাৰ কৰা হয়। কোনো account বনাব নালাগে।",
    "nameLabel": "আপোনাক আমি কি নামেৰে মাতিম?",
    "namePlaceholder": "উদাহৰণ: Priya",
    "roleLabel": "আজ GharDisha কোনে ব্যৱহাৰ কৰিছে?",
    "roleFamily": "মই পৰিয়ালৰ সদস্য",
    "roleHelper": "মই এটা পৰিয়ালক সহায় কৰি আছোঁ",
    "rolePanchayat": "পঞ্চায়ত / গাঁও প্ৰতিনিধি",
    "roleNgo": "সহায় সংস্থা / relief worker",
    "guideTitle": "GharDisha-ত কিয় বিশ্বাস কৰিব পাৰি",
    "guideSubtitle": "তথ্য লোৱাৰ আগতে ই স্পষ্টকৈ বুজায় — ই কি কৰে আৰু কি নকৰে।",
    "startCase": "মামলা বুজা আৰম্ভ কৰক",
    "restart": "Guide পুনৰ আৰম্ভ কৰক",
    "profile": "ব্যৱহাৰকাৰীৰ তথ্য",
    "usingAs": "ভূমিকা",
    "generatedOn": "তাৰিখ আৰু সময়",
    "safeNoticeTitle": "সুৰক্ষিত সহায়, চূড়ান্ত সিদ্ধান্ত নহয়",
    "illustrationLabel": "PMAY-G লৈ সুৰক্ষিত পথ",
    "cards": [
      {
        "title": "1. নিজৰ কথা স্বাভাৱিকভাৱে কওক",
        "body": "পৰিয়াল বা বিশ্বাসযোগ্য সহায়কে কি ঘটিল ক’ব — বানপানী, আশ্ৰয়, নথিৰ অভাৱ আৰু বিভ্ৰান্তি।"
      },
      {
        "title": "2. AI কথাক case তথ্যত সলনি কৰে",
        "body": "AI প্ৰয়োজনীয় তথ্য উলিয়ায়, অস্পষ্ট বিষয় দেখুৱায় আৰু পৰৱৰ্তী সঠিক প্ৰশ্ন সাজে।"
      },
      {
        "title": "3. আনুষ্ঠানিক PMAY-G তথ্য ব্যৱহাৰ হয়",
        "body": "উত্তৰ PMAY-G ৰ যাচাই কৰা তথ্যৰ ওপৰত ভিত্তি কৰি হয়, উৰাবাতৰি বা অনিয়ন্ত্ৰিত search result নহয়।"
      },
      {
        "title": "4. চূড়ান্ত সিদ্ধান্ত official-এ লয়",
        "body": "GharDisha পৰিয়ালক Gram Sabha / BDO verification-ৰ বাবে সাজু কৰে। ই approval নিদিয়ে।"
      }
    ],
    "trustPoints": [
      "PMAY-G ৰ আনুষ্ঠানিক তথ্য ব্যৱহাৰ কৰে",
      "ই “আপুনি যোগ্য” নকয়; ই official verification ৰ কথা কয়",
      "পঞ্চায়ত সহায়ক, সহায় সংস্থা বা relief worker-ৰ সৈতে ব্যৱহাৰ কৰিব পাৰি",
      "চূড়ান্ত সিদ্ধান্ত Gram Sabha আৰু BDO official-ৰ হাতত থাকে"
    ]
  },
  "ta": {
    "splashKicker": "மாணவர்கள் உருவாக்கிய PMAY-G வழிகாட்டி prototype",
    "splashTitle": "GharDisha AI",
    "splashPitch": "வெள்ளத்தால் பாதிக்கப்பட்ட கிராம குடும்பங்களுக்கு நம்பகமான உதவியாளருடன் பயன்படுத்தும் AI வழிகாட்டி.",
    "splashCta": "எளிய வழிகாட்டலை தொடங்குங்கள்",
    "notOfficial": "இது இந்திய அரசின் அதிகாரப்பூர்வ சேவை அல்ல",
    "languageTitle": "எந்த மொழியை பயன்படுத்தலாம்?",
    "languageSubtitle": "குடும்பத்திற்கோ உதவியாளருக்கோ எது எளிதோ அந்த மொழியை தேர்வு செய்யுங்கள்.",
    "voiceText": "குரல் + எழுத்து",
    "textOutput": "எழுத்து பதில்",
    "continue": "தொடரவும்",
    "back": "பின்செல்லவும்",
    "nameTitle": "இதை எளிதாக்குவோம்",
    "nameSubtitle": "உங்கள் பெயர் சுருக்கத்தை எளிதாக காட்டுவதற்கே பயன்படுத்தப்படும். கணக்கு உருவாக்க தேவையில்லை.",
    "nameLabel": "உங்களை எந்த பெயரில் அழைக்கலாம்?",
    "namePlaceholder": "உதாரணம்: பிரியா",
    "roleLabel": "இன்று GharDisha-வை யார் பயன்படுத்துகிறார்?",
    "roleFamily": "நான் குடும்ப உறுப்பினர்",
    "roleHelper": "நான் ஒரு குடும்பத்திற்கு உதவுகிறேன்",
    "rolePanchayat": "பஞ்சாயத்து / கிராம பிரதிநிதி",
    "roleNgo": "உதவி அமைப்பு / நிவாரண பணியாளர்",
    "guideTitle": "GharDisha மீது ஏன் நம்பிக்கை வைக்கலாம்",
    "guideSubtitle": "தகவல் கேட்பதற்கு முன், இது என்ன செய்கிறது, என்ன செய்யாது என்பதைக் தெளிவாக சொல்கிறது.",
    "startCase": "வழக்கை புரிந்துகொள்ள தொடங்குங்கள்",
    "restart": "வழிகாட்டலை மீண்டும் தொடங்குங்கள்",
    "profile": "பயனர் தகவல்",
    "usingAs": "பங்கு",
    "generatedOn": "தேதி மற்றும் நேரம்",
    "safeNoticeTitle": "பாதுகாப்பான வழிகாட்டல், இறுதி முடிவு அல்ல",
    "illustrationLabel": "PMAY-G வரை பாதுகாப்பான வழி",
    "cards": [
      {
        "title": "1. உங்கள் நிலையை இயல்பாக சொல்லுங்கள்",
        "body": "குடும்பம் அல்லது நம்பகமான உதவியாளர் என்ன நடந்தது என்பதைச் சொல்வார் — வெள்ளம், தங்கும் இடம், ஆவணங்கள் இல்லை, குழப்பம்."
      },
      {
        "title": "2. AI அதை case தகவலாக மாற்றும்",
        "body": "AI முக்கிய தகவல்களை எடுக்கும், தெளிவில்லாத விஷயங்களை காட்டும், அடுத்த கேள்வியை கேட்கும்."
      },
      {
        "title": "3. அதிகாரப்பூர்வ PMAY-G தகவல் பயன்படுத்தப்படும்",
        "body": "பதில் சரிபார்க்கப்பட்ட PMAY-G தகவலின் அடிப்படையில் இருக்கும்; வதந்தி அல்லது சீரற்ற search முடிவு அல்ல."
      },
      {
        "title": "4. இறுதி முடிவு அதிகாரிகளிடமே இருக்கும்",
        "body": "GharDisha குடும்பத்தை Gram Sabha / BDO சரிபார்ப்பிற்கு தயார் செய்கிறது. இது approval கொடுக்காது."
      }
    ],
    "trustPoints": [
      "அதிகாரப்பூர்வ PMAY-G தகவலை பயன்படுத்துகிறது",
      "“நீங்கள் தகுதி பெற்றவர்” என்று சொல்லாது; அரசு சரிபார்ப்பு தேவை என்று சொல்கிறது",
      "பஞ்சாயத்து உதவியாளர், உதவி அமைப்பு அல்லது நிவாரண பணியாளருடன் பயன்படுத்தலாம்",
      "இறுதி முடிவு Gram Sabha மற்றும் BDO அதிகாரிகளிடம் இருக்கும்"
    ]
  },
  "mr": {
    "splashKicker": "विद्यार्थ्यांनी बनवलेला PMAY-G मदत prototype",
    "splashTitle": "GharDisha AI",
    "splashPitch": "पूरामुळे प्रभावित ग्रामीण कुटुंबांसाठी विश्वासू मदतनीसासोबत वापरता येणारा AI मार्गदर्शक.",
    "splashCta": "सोपा मार्गदर्शक सुरू करा",
    "notOfficial": "ही भारत सरकारची अधिकृत सेवा नाही",
    "languageTitle": "आपण कोणती भाषा वापरू?",
    "languageSubtitle": "कुटुंबाला किंवा मदतनीसाला जी भाषा सोपी वाटते ती निवडा.",
    "voiceText": "आवाज + मजकूर",
    "textOutput": "लिखित उत्तर",
    "continue": "पुढे जा",
    "back": "मागे",
    "nameTitle": "चला, हे सोपे करूया",
    "nameSubtitle": "आपले नाव फक्त सारांश सोपा करण्यासाठी घेतले जाते. खाते तयार करण्याची गरज नाही.",
    "nameLabel": "आम्ही आपल्याला कोणत्या नावाने बोलवू?",
    "namePlaceholder": "उदाहरण: प्रिया",
    "roleLabel": "आज GharDisha कोण वापरत आहे?",
    "roleFamily": "मी कुटुंबातील सदस्य आहे",
    "roleHelper": "मी एका कुटुंबाला मदत करत आहे",
    "rolePanchayat": "पंचायत / गाव प्रतिनिधी",
    "roleNgo": "मदत संस्था / राहत कार्यकर्ता",
    "guideTitle": "GharDisha वर विश्वास का ठेवू शकतो",
    "guideSubtitle": "माहिती घेण्यापूर्वी हे काय करते आणि काय करत नाही हे स्पष्ट सांगते.",
    "startCase": "प्रकरण समजून घेणे सुरू करा",
    "restart": "मार्गदर्शक पुन्हा सुरू करा",
    "profile": "वापरकर्ता माहिती",
    "usingAs": "भूमिका",
    "generatedOn": "तारीख आणि वेळ",
    "safeNoticeTitle": "सुरक्षित मार्गदर्शन, अंतिम निर्णय नाही",
    "illustrationLabel": "PMAY-G पर्यंत सुरक्षित मार्ग",
    "cards": [
      {
        "title": "1. आपली गोष्ट सहज भाषेत सांगा",
        "body": "कुटुंब किंवा विश्वासू मदतनीस काय झाले ते सांगेल — पूर, राहण्याची जागा, कागदपत्रांची कमतरता आणि गोंधळ."
      },
      {
        "title": "2. AI गोष्ट case माहितीमध्ये बदलते",
        "body": "AI महत्त्वाची माहिती काढते, काय स्पष्ट नाही ते दाखवते आणि पुढचा योग्य प्रश्न विचारते."
      },
      {
        "title": "3. अधिकृत PMAY-G माहिती वापरली जाते",
        "body": "उत्तर तपासलेल्या PMAY-G माहितीवर आधारित असते; अफवा किंवा अनियमित search result वर नाही."
      },
      {
        "title": "4. अंतिम निर्णय अधिकारी घेतात",
        "body": "GharDisha कुटुंबाला Gram Sabha / BDO पडताळणीसाठी तयार करते. हे approval देत नाही."
      }
    ],
    "trustPoints": [
      "अधिकृत PMAY-G माहिती वापरते",
      "“आपण पात्र आहात” असे सांगत नाही; सरकारी पडताळणीची गरज सांगते",
      "पंचायत मदतनीस, मदत संस्था किंवा राहत कार्यकर्त्यासोबत वापरता येते",
      "अंतिम निर्णय Gram Sabha आणि BDO अधिकाऱ्यांकडे राहतो"
    ]
  }
};

const EXTRA_UI = {
  en: {
    langNote: 'Voice input supports English, Hindi, Tamil, and Marathi. Assamese is available as written output.',
    uploadLabel: 'Optional document/photo upload',
    uploadHint: 'Upload disaster/damage certificate, Panchayat note, rejection letter, or text PDF if available.',
    chooseFile: 'Choose file',
    noFile: 'No file selected',
    storyPlaceholder: 'Example: Our house in Majuli, Assam was damaged in a flood.\nWe are staying with relatives near Jorhat.\nWe have Aadhaar and ration card, but no land papers.\nWe do not know if our family is on the Awaas+ or SECC list.',
  },
  as: {
    chooseFile: 'ফাইল বাছক',
    noFile: 'কোনো ফাইল বাছনি কৰা নাই',
  },
  "hi": {
    "tagline": "PMAY-G के लिए ग्रामीण परिवारों की मदद करने वाला लाइव AI मार्गदर्शक",
    "voiceReady": "आवाज सुविधा तैयार है",
    "textFileMode": "लिखकर और फाइल से मदद",
    "badge": "सुरक्षित लाइव AI",
    "heroTitle": "आपदा की उलझन से BDO के लिए तैयार कार्य योजना तक।",
    "heroBody": "GharDisha AI भरोसेमंद सहायक को परिवार की बाढ़ से जुड़ी कहानी को PMAY-G के अगले कदम, जरूरी कागज और सुरक्षित सारांश में बदलने में मदद करता है।",
    "startBtn": "लाइव विश्लेषण शुरू करें",
    "trustNote": "छात्रों द्वारा बनाया गया मार्गदर्शक — यह भारत सरकार की आधिकारिक सेवा नहीं है।",
    "journeyTitle": "प्रिया की मदद की यात्रा",
    "journey1": "बाढ़ से ग्रामीण घर नष्ट हुआ",
    "journey2": "भरोसेमंद सहायक GharDisha खोलता है",
    "journey3": "AI जरूरी जानकारी और कमी निकालता है",
    "journey4": "BDO के लिए तैयार सारांश बनता है",
    "guideTitle": "यह आपकी कैसे मदद करता है",
    "guideBody": "यह एक मुफ्त मददगार tool है। अपनी स्थिति बताइए। हम बताएँगे कि PMAY-G में आगे किस बात की जाँच करानी है और अधिकारी के पास कौन से कागज ले जाने हैं। अंतिम निर्णय सरकारी अधिकारी लेते हैं।",
    "whyTitle": "यहाँ AI क्यों जरूरी है",
    "why1Title": "बिखरी हुई बात समझता है",
    "why1Body": "लोग बाढ़, डर, रिश्तेदारों के घर रहना और कागज न होना बताते हैं — साफ फॉर्म नहीं भरते।",
    "why2Title": "जरूरत पड़ने पर दस्तावेज पढ़ता है",
    "why2Body": "JPG, PNG, PDF या TXT दस्तावेज जोड़ सकते हैं; AI उसे भी समझने में इस्तेमाल करता है।",
    "why3Title": "PMAY-G जानकारी से जवाब देता है",
    "why3Body": "जवाब आधिकारिक जानकारी पर आधारित होता है, बिना जाँच वाली search जानकारी पर नहीं।",
    "why4Title": "अधिकारी से मिलने के लिए तैयार करता है",
    "why4Body": "AI परिवार को Gram Sabha / BDO के लिए तैयार करता है; वह अधिकारियों की जगह नहीं लेता।",
    "panelPill": "सहायक के साथ लाइव AI मदद",
    "inputTitle": "परिवार की स्थिति लिखें",
    "inputSubtitle": "अपनी बात सामान्य भाषा में लिखें या बोलें। अगर दस्तावेज है तो जोड़ें।",
    "outputLanguage": "जवाब की भाषा",
    "langNote": "आवाज सुविधा English, Hindi, Tamil और Marathi में है। Assamese में लिखित जवाब उपलब्ध है।",
    "speak": "बोलें",
    "stop": "रोकें",
    "familyStory": "परिवार की कहानी",
    "storyPlaceholder": "उदाहरण: असम में हमारा घर बाढ़ में बह गया। हम रिश्तेदारों के यहाँ रह रहे हैं। हमारे पास आधार और राशन कार्ड है, लेकिन जमीन के कागज नहीं हैं।",
    "uploadLabel": "दस्तावेज / फोटो जोड़ें",
    "uploadHint": "अगर हो तो आपदा/नुकसान प्रमाणपत्र, पंचायत पत्र, rejection letter या PDF जोड़ें।",
    "chooseFile": "फाइल चुनें",
    "noFile": "कोई फाइल नहीं चुनी गई",
    "footerSafety": "सुरक्षित लाइव मोड: जवाब AI/ML API से आता है और अंतिम निर्णय अधिकारी पर छोड़ता है।",
    "analyzeBtn": "लाइव AI से मामला समझें",
    "analyzing": "लाइव AI काम कर रहा है...",
    "loadingText": "AI कहानी समझ रहा है, दस्तावेज देख रहा है, PMAY-G जानकारी ला रहा है और सुरक्षा जाँच कर रहा है…",
    "listening": "सुन रहा है… कृपया अपनी स्थिति बोलें।",
    "resultTitle": "लाइव AI केस समझ",
    "safeMode": "सुरक्षित लाइव AI मदद चालू है",
    "resultSubtitle": "AI केस जानकारी बनाता है, PMAY-G जानकारी लाता है और सुरक्षित कार्य योजना देता है।",
    "printBtn": "प्रिंट / सारांश सेव करें",
    "docProcessed": "अपलोड किया गया दस्तावेज पढ़ा गया",
    "caseFacts": "AI ने कहानी से क्या समझा",
    "factDisaster": "आपदा से विस्थापित",
    "factShelter": "अभी कहाँ रह रहे हैं",
    "factRural": "ग्रामीण स्थिति",
    "factPucca": "पक्का घर है",
    "factAwaas": "Awaas+ / SECC स्थिति",
    "docsAvailable": "उपलब्ध दस्तावेज",
    "biggestObstacle": "सबसे बड़ी बाधा",
    "nextQuestion": "अगला जरूरी सवाल",
    "actionPlan": "अगले 48 घंटे की योजना",
    "bdoQuestions": "BDO / पंचायत से पूछने वाले सवाल",
    "summaryTitle": "BDO के लिए तैयार पारिवारिक सारांश",
    "missingItems": "कमी या अस्पष्ट बातें",
    "raiBoundary": "जिम्मेदार AI सीमा",
    "sourcesTitle": "इस जवाब के लिए उपयोग की गई आधिकारिक जानकारी",
    "confidence": "विश्वास स्तर",
    "footer": "GharDisha AI • छात्रों द्वारा बनाया गया PMAY-G मार्गदर्शक • भारत सरकार की आधिकारिक सेवा नहीं"
  },
  "ta": {
    "tagline": "PMAY-G வழிகாட்டும் live AI case helper",
    "voiceReady": "குரல் வசதி தயார்",
    "textFileMode": "மொழி + கோப்பு live mode",
    "badge": "பாதுகாப்பான live AI",
    "heroTitle": "அவசர குழப்பத்திலிருந்து BDO-க்கு தயாரான செயல் திட்டம் வரை.",
    "heroBody": "GharDisha AI, நம்பகமான உதவியாளர் மூலம் குடும்பத்தின் வெள்ளக் கதையை PMAY-G அடுத்த படிகள், தேவைப்படும் ஆவணங்கள், பாதுகாப்பான சுருக்கம் ஆகியவையாக மாற்ற உதவுகிறது.",
    "startBtn": "Live analysis தொடங்குங்கள்",
    "trustNote": "மாணவர்கள் உருவாக்கிய வழிகாட்டி — இது இந்திய அரசின் அதிகாரப்பூர்வ சேவை அல்ல.",
    "journeyTitle": "Priya-வின் உதவி பயணம்",
    "journey1": "வெள்ளம் கிராம வீட்டை சேதப்படுத்துகிறது",
    "journey2": "நம்பகமான உதவியாளர் GharDisha-வை திறக்கிறார்",
    "journey3": "AI முக்கிய தகவல் மற்றும் குறைகளை கண்டறிகிறது",
    "journey4": "BDO-க்கு தயாரான சுருக்கம் உருவாகிறது",
    "guideTitle": "இது உங்களுக்கு எப்படி உதவும்",
    "guideBody": "இது ஒரு இலவச உதவி கருவி. உங்கள் வீட்டிற்கு என்ன நடந்தது என்று சொல்லுங்கள். PMAY-G பற்றி அதிகாரியிடம் என்ன கேட்க வேண்டும், எந்த ஆவணங்களை எடுத்துச் செல்ல வேண்டும் என்பதை நாங்கள் விளக்குகிறோம். இறுதி முடிவு அரசு அதிகாரியிடம் இருக்கும்.",
    "whyTitle": "இங்கு AI ஏன் தேவை",
    "why1Title": "சீரற்ற கதையையும் புரிந்துகொள்ளும்",
    "why1Body": "மக்கள் வெள்ளம், பயம், உறவினர் வீடு, ஆவணங்கள் இல்லை என்று சொல்வார்கள் — சுத்தமான form அல்ல.",
    "why2Title": "தேவைப்பட்டால் ஆவணத்தை படிக்கும்",
    "why2Body": "JPG, PNG, PDF அல்லது TXT கோப்பை upload செய்யலாம்; AI அதையும் கருத்தில் கொள்கிறது.",
    "why3Title": "PMAY-G தகவலுடன் பதில் தரும்",
    "why3Body": "பதில் அதிகாரப்பூர்வ தகவலின் அடிப்படையில் இருக்கும்; சரிபார்க்காத search பதில் அல்ல.",
    "why4Title": "அதிகாரியை சந்திக்க தயாராக்கும்",
    "why4Body": "AI குடும்பத்தை Gram Sabha / BDO சரிபார்ப்பிற்கு தயாராக்கும்; அதிகாரிகளை மாற்றாது.",
    "panelPill": "உதவியாளர் + live AI",
    "inputTitle": "குடும்ப நிலையை எழுதுங்கள்",
    "inputSubtitle": "உங்கள் கதையை இயல்பாக எழுதுங்கள் அல்லது பேசுங்கள். ஆவணம் இருந்தால் சேர்க்கவும்.",
    "outputLanguage": "பதில் மொழி",
    "langNote": "குரல் வசதி English, Hindi, Tamil, Marathi-க்கு உள்ளது. Assamese-ல் எழுத்து பதில் உள்ளது.",
    "speak": "பேசுங்கள்",
    "stop": "நிறுத்துங்கள்",
    "familyStory": "குடும்பத்தின் கதை",
    "storyPlaceholder": "உதாரணம்: அசாமில் எங்கள் வீடு வெள்ளத்தில் அடித்துச் சென்றது. நாங்கள் உறவினர்களிடம் தங்கியிருக்கிறோம். Aadhaar மற்றும் ration card இருக்கிறது, ஆனால் நில ஆவணங்கள் இல்லை.",
    "uploadLabel": "ஆவணம் / புகைப்படம் சேர்க்கவும்",
    "uploadHint": "பேரிடர்/சேதச் சான்று, பஞ்சாயத்து கடிதம், rejection letter அல்லது PDF இருந்தால் upload செய்யவும்.",
    "chooseFile": "கோப்பை தேர்வு செய்யவும்",
    "noFile": "கோப்பு தேர்வு செய்யவில்லை",
    "footerSafety": "பாதுகாப்பான live mode: பதில் AI/ML API மூலம் வரும்; இறுதி முடிவு அதிகாரிகளிடம் இருக்கும்.",
    "analyzeBtn": "Live AI மூலம் case புரிந்துகொள்ளுங்கள்",
    "analyzing": "Live AI வேலை செய்கிறது...",
    "loadingText": "AI கதையைப் புரிந்துகொள்கிறது, ஆவணத்தைப் பார்க்கிறது, PMAY-G தகவலை எடுக்கிறது, பாதுகாப்பு சோதனை செய்கிறது…",
    "listening": "கேட்கிறது… உங்கள் நிலையை பேசுங்கள்.",
    "resultTitle": "Live AI case விளக்கம்",
    "safeMode": "பாதுகாப்பான live AI உதவி இயங்குகிறது",
    "resultSubtitle": "AI case தகவலை உருவாக்கி, PMAY-G தகவலை எடுத்து, பாதுகாப்பான செயல் திட்டம் தருகிறது.",
    "printBtn": "அச்சிடு / சுருக்கம் சேமி",
    "docProcessed": "Upload செய்த ஆவணம் படிக்கப்பட்டது",
    "caseFacts": "AI உங்கள் கதையில் புரிந்தது",
    "factDisaster": "அபாயத்தால் இடம்பெயர்ந்தவர்",
    "factShelter": "தற்போது தங்கும் இடம்",
    "factRural": "கிராம நிலை",
    "factPucca": "பக்கா வீடு உள்ளது",
    "factAwaas": "Awaas+ / SECC நிலை",
    "docsAvailable": "உள்ள ஆவணங்கள்",
    "biggestObstacle": "முக்கிய தடையேது",
    "nextQuestion": "அடுத்த முக்கிய கேள்வி",
    "actionPlan": "அடுத்த 48 மணி நேர திட்டம்",
    "bdoQuestions": "BDO / Panchayat-க்கு கேட்க வேண்டிய கேள்விகள்",
    "summaryTitle": "BDO-க்கு தயாரான குடும்ப சுருக்கம்",
    "missingItems": "குறைவான அல்லது தெளிவில்லாதவை",
    "raiBoundary": "பொறுப்பான AI வரம்பு",
    "sourcesTitle": "இந்த பதிலுக்கு பயன்படுத்திய அதிகாரப்பூர்வ தகவல்",
    "confidence": "நம்பிக்கை நிலை",
    "footer": "GharDisha AI • மாணவர்கள் உருவாக்கிய PMAY-G வழிகாட்டி • இந்திய அரசின் அதிகாரப்பூர்வ சேவை அல்ல"
  },
  "mr": {
    "tagline": "PMAY-G साठी ग्रामीण कुटुंबांना मदत करणारा live AI मार्गदर्शक",
    "voiceReady": "आवाज सुविधा तयार आहे",
    "textFileMode": "मजकूर + फाइल live mode",
    "badge": "सुरक्षित live AI",
    "heroTitle": "आपत्तीच्या गोंधळातून BDO-साठी तयार कृती योजनेपर्यंत.",
    "heroBody": "GharDisha AI विश्वासू मदतनीसाला कुटुंबाची पूरामुळे झालेली स्थिती PMAY-G पुढील पावले, लागणारी कागदपत्रे आणि सुरक्षित सारांशात बदलण्यास मदत करते.",
    "startBtn": "Live analysis सुरू करा",
    "trustNote": "विद्यार्थ्यांनी बनवलेला मार्गदर्शक — ही भारत सरकारची अधिकृत सेवा नाही.",
    "journeyTitle": "Priya ची मदत यात्रा",
    "journey1": "पूरामुळे गावातील घर नष्ट झाले",
    "journey2": "विश्वासू मदतनीस GharDisha उघडतो",
    "journey3": "AI महत्त्वाची माहिती आणि कमतरता शोधते",
    "journey4": "BDO-साठी तयार सारांश बनतो",
    "guideTitle": "हे आपल्याला कसे मदत करते",
    "guideBody": "हे एक मोफत मदत tool आहे. आपल्या घराचे काय झाले ते सांगा. PMAY-G बद्दल अधिकाऱ्यांना काय विचारायचे आणि कोणती कागदपत्रे घ्यायची ते आम्ही सांगतो. अंतिम निर्णय सरकारी अधिकारी घेतात.",
    "whyTitle": "इथे AI का गरजेचे आहे",
    "why1Title": "गोंधळलेली गोष्टही समजते",
    "why1Body": "लोक पूर, भीती, नातेवाईकांकडे राहणे आणि कागदपत्रे नसणे सांगतात — स्वच्छ form नाही.",
    "why2Title": "गरज असेल तर कागदपत्र वाचते",
    "why2Body": "JPG, PNG, PDF किंवा TXT फाइल upload करू शकता; AI तीही विचारात घेते.",
    "why3Title": "PMAY-G माहितीवर आधारित उत्तर देते",
    "why3Body": "उत्तर अधिकृत माहितीवर आधारित असते; न तपासलेल्या search उत्तरावर नाही.",
    "why4Title": "अधिकाऱ्यांना भेटण्यासाठी तयार करते",
    "why4Body": "AI कुटुंबाला Gram Sabha / BDO पडताळणीसाठी तयार करते; अधिकारी बदलत नाही.",
    "panelPill": "मदतनीस + live AI",
    "inputTitle": "कुटुंबाची स्थिती लिहा",
    "inputSubtitle": "आपली गोष्ट साध्या भाषेत लिहा किंवा बोला. कागदपत्र असेल तर जोडा.",
    "outputLanguage": "उत्तराची भाषा",
    "langNote": "आवाज सुविधा English, Hindi, Tamil आणि Marathi मध्ये आहे. Assamese मध्ये लिखित उत्तर आहे.",
    "speak": "बोला",
    "stop": "थांबा",
    "familyStory": "कुटुंबाची गोष्ट",
    "storyPlaceholder": "उदाहरण: असममध्ये आमचे घर पुरात वाहून गेले. आम्ही नातेवाईकांकडे राहतो. Aadhaar आणि ration card आहे, पण जमीन कागदपत्रे नाहीत.",
    "uploadLabel": "कागदपत्र / फोटो जोडा",
    "uploadHint": "आपत्ती/नुकसान प्रमाणपत्र, पंचायत पत्र, rejection letter किंवा PDF असेल तर upload करा.",
    "chooseFile": "फाइल निवडा",
    "noFile": "फाइल निवडलेली नाही",
    "footerSafety": "सुरक्षित live mode: उत्तर AI/ML API मधून येते; अंतिम निर्णय अधिकाऱ्यांकडे राहतो.",
    "analyzeBtn": "Live AI ने case समजून घ्या",
    "analyzing": "Live AI काम करत आहे...",
    "loadingText": "AI गोष्ट समजत आहे, कागदपत्र पाहत आहे, PMAY-G माहिती आणत आहे आणि सुरक्षा तपासत आहे…",
    "listening": "ऐकत आहे… कृपया आपली स्थिती बोला.",
    "resultTitle": "Live AI case समज",
    "safeMode": "सुरक्षित live AI मदत चालू आहे",
    "resultSubtitle": "AI case माहिती बनवते, PMAY-G माहिती आणते आणि सुरक्षित कृती योजना देते.",
    "printBtn": "प्रिंट / सारांश सेव करा",
    "docProcessed": "Upload केलेले कागदपत्र वाचले गेले",
    "caseFacts": "AI ने गोष्टीतून काय समजले",
    "factDisaster": "आपत्तीमुळे विस्थापित",
    "factShelter": "सध्या राहण्याची जागा",
    "factRural": "ग्रामीण स्थिती",
    "factPucca": "पक्का घर आहे",
    "factAwaas": "Awaas+ / SECC स्थिती",
    "docsAvailable": "उपलब्ध कागदपत्रे",
    "biggestObstacle": "सर्वात मोठी अडचण",
    "nextQuestion": "पुढचा महत्त्वाचा प्रश्न",
    "actionPlan": "पुढील 48 तासांची योजना",
    "bdoQuestions": "BDO / Panchayat ला विचारायचे प्रश्न",
    "summaryTitle": "BDO-साठी तयार कुटुंब सारांश",
    "missingItems": "कमी किंवा अस्पष्ट गोष्टी",
    "raiBoundary": "जबाबदार AI मर्यादा",
    "sourcesTitle": "या उत्तरासाठी वापरलेली अधिकृत माहिती",
    "confidence": "विश्वास पातळी",
    "footer": "GharDisha AI • विद्यार्थ्यांनी बनवलेला PMAY-G मार्गदर्शक • भारत सरकारची अधिकृत सेवा नाही"
  }
};

function getStored(key, fallback = '') {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
}

function setStored(key, value) {
  try { localStorage.setItem(key, value); } catch { /* no-op */ }
}

function Pill({ icon: Icon, children }) {
  return <span className="pill"><Icon size={16} />{children}</span>;
}

function GlassCard({ children, className = '', id }) {
  return <section id={id} className={`glass-card ${className}`}>{children}</section>;
}

function formatSourceTopic(topic, language) {
  const topics = {
    'Core eligibility conditions': {
      en: 'Core eligibility conditions',
      hi: 'मुख्य पात्रता शर्तें',
      as: 'মূল যোগ্যতাৰ চৰ্ত',
      ta: 'முக்கிய தகுதி நிபந்தனைகள்',
      mr: 'मुख्य पात्रता अटी',
    },
    'How beneficiaries are identified': {
      en: 'How beneficiaries are identified',
      hi: 'लाभार्थियों की पहचान कैसे होती है',
      as: 'লাভাৰ্থীক কেনেকৈ চিনাক্ত কৰা হয়',
      ta: 'பயனாளர்கள் எப்படி அடையாளம் காணப்படுகிறார்கள்',
      mr: 'लाभार्थी कसे ओळखले जातात',
    },
    'Awaas+ 2024 survey (new entry path)': {
      en: 'Awaas+ 2024 survey (new entry path)',
      hi: 'Awaas+ 2024 सर्वे / नया नाम जोड़ने का रास्ता',
      as: 'Awaas+ 2024 survey / নতুন নাম যোগ কৰাৰ পথ',
      ta: 'Awaas+ 2024 survey / புதிய பெயர் சேர்க்கும் வழி',
      mr: 'Awaas+ 2024 survey / नवीन नाव जोडण्याचा मार्ग',
    },
    'Responsible-AI / human-in-the-loop boundary': {
      en: 'Responsible-AI / human-in-the-loop boundary',
      hi: 'जिम्मेदार AI और मानव निर्णय सीमा',
      as: 'দায়িত্বশীল AI আৰু মানুহৰ চূড়ান্ত সিদ্ধান্ত',
      ta: 'பொறுப்பான AI மற்றும் மனித இறுதி முடிவு',
      mr: 'जबाबदार AI आणि मानवी अंतिम निर्णय',
    },
  };

  return topics[topic]?.[language] || topic;
}

function formatOfficialSourceLabel(language) {
  const labels = {
    en: 'Official source',
    hi: 'आधिकारिक स्रोत',
    as: 'আনুষ্ঠানিক উৎস',
    ta: 'அதிகாரப்பூர்வ மூலம்',
    mr: 'अधिकृत स्रोत',
  };

  return labels[language] || labels.en;
}

function formatConfidenceValue(value, language) {
  const confidence = {
    high: {
      en: 'high',
      hi: 'उच्च',
      as: 'উচ্চ',
      ta: 'உயர்',
      mr: 'उच्च',
    },
    'medium-high': {
      en: 'medium-high',
      hi: 'मध्यम से उच्च',
      as: 'মধ্যমৰ পৰা উচ্চ',
      ta: 'நடுத்தர முதல் உயர்',
      mr: 'मध्यम ते उच्च',
    },
    'design-statement': {
      en: 'design statement',
      hi: 'डिज़ाइन सिद्धांत',
      as: 'ডিজাইন নীতি',
      ta: 'வடிவமைப்பு கொள்கை',
      mr: 'डिझाइन तत्त्व',
    },
  };

  return confidence[value]?.[language] || value;
}

function supportCopy(language) {
  const copy = {
    en: {
      familyQuestionTitle: 'Question to ask the family/helper now',
      answerQuestionLabel: 'Answer this question',
      answerQuestionPlaceholder: 'Example: Yes, the Gram Panchayat gave us a damage letter yesterday.',
      updateCaseBtn: 'Update case with this answer',
      updatingCaseBtn: 'Updating case...',
      caseUpdatedTitle: 'Case updated with your answer',
      caseUpdatedBody: 'Your answer has been added to the case. Use the action plan and BDO / Panchayat questions below for the next step.',
      nextRemainingQuestion: 'Next remaining question',
      answerNextQuestionBtn: 'Answer this next question',
      readinessTitle: 'BDO Visit Readiness',
      readinessSubtitle: 'A simple readiness meter for official verification. This is not approval prediction.',
      initialReadinessTitle: 'Initial BDO Visit Readiness',
      initialReadinessSubtitle: 'Based on the first story only. Answer the follow-up question to update this score.',
      updatedReadinessTitle: 'Updated BDO Visit Readiness',
      updatedReadinessSubtitle: 'Recalculated after the family/helper answered the missing question.',
      temporaryShelterSafeguard: 'Temporary stay with relatives or a shelter is treated as current shelter, not proof of eligibility. The household’s own housing status must still be verified by Gram Sabha / BDO.',
      pathwayFit: 'PMAY-G pathway fit',
      evidenceReadiness: 'Evidence readiness',
      listingClarity: 'Awaas+/SECC clarity',
      officialVisitReadiness: 'Official visit readiness',
      overallReadiness: 'Overall readiness',
      readinessStrong: 'Strong',
      readinessMedium: 'Needs preparation',
      readinessLow: 'Needs more information',
      readinessDisclaimer: 'This score only shows how ready the case is for Gram Panchayat / BDO verification. It does not decide eligibility or guarantee approval.',
      followUpLimitTitle: 'Case prepared for official visit',
      followUpLimitBody: 'GharDisha has collected the key follow-up answers for this pass. Remaining issues, like Awaas+/SECC listing, damage certificate, land/site verification, and final approval, must now be checked by Gram Panchayat / BDO officials.',
      followUpCounter: 'Follow-up answers used',
    },
    hi: {
      familyQuestionTitle: 'अभी परिवार / सहायक से पूछने वाला सवाल',
      answerQuestionLabel: 'इस सवाल का जवाब लिखें',
      answerQuestionPlaceholder: 'उदाहरण: हाँ, पंचायत ने कल हमें नुकसान का पत्र दिया था।',
      updateCaseBtn: 'इस जवाब से केस अपडेट करें',
      updatingCaseBtn: 'केस अपडेट हो रहा है...',
      caseUpdatedTitle: 'आपके जवाब से केस अपडेट हो गया',
      caseUpdatedBody: 'आपका जवाब केस में जोड़ दिया गया है। अब अगले कदम के लिए नीचे दी गई योजना और BDO / पंचायत वाले सवाल देखें।',
      nextRemainingQuestion: 'अगला बचा हुआ सवाल',
      answerNextQuestionBtn: 'इस अगले सवाल का जवाब दें',
      readinessTitle: 'BDO जाने की तैयारी',
      readinessSubtitle: 'यह सरकारी जाँच के लिए तैयारी दिखाता है। यह मंजूरी की भविष्यवाणी नहीं है।',
      initialReadinessTitle: 'शुरुआती BDO जाने की तैयारी',
      initialReadinessSubtitle: 'यह केवल पहली कहानी के आधार पर है। इस स्कोर को अपडेट करने के लिए follow-up सवाल का जवाब दें।',
      updatedReadinessTitle: 'अपडेटेड BDO जाने की तैयारी',
      updatedReadinessSubtitle: 'परिवार / सहायक के missing सवाल का जवाब देने के बाद यह दोबारा निकाला गया है।',
      temporaryShelterSafeguard: 'रिश्तेदारों के घर या shelter में अस्थायी रूप से रहना केवल वर्तमान रहने की स्थिति है, पात्रता का प्रमाण नहीं। परिवार के अपने घर की स्थिति Gram Sabha / BDO से verify होनी चाहिए।',
      pathwayFit: 'PMAY-G रास्ते से जुड़ाव',
      evidenceReadiness: 'प्रमाण / कागज की तैयारी',
      listingClarity: 'Awaas+ / SECC स्थिति की स्पष्टता',
      officialVisitReadiness: 'अधिकारी से मिलने की तैयारी',
      overallReadiness: 'कुल तैयारी',
      readinessStrong: 'मजबूत',
      readinessMedium: 'तैयारी चाहिए',
      readinessLow: 'और जानकारी चाहिए',
      readinessDisclaimer: 'यह स्कोर केवल Gram Panchayat / BDO जाँच के लिए तैयारी दिखाता है। यह पात्रता तय नहीं करता और मंजूरी की गारंटी नहीं देता।',
      followUpLimitTitle: 'अधिकारी से मिलने के लिए case तैयार है',
      followUpLimitBody: 'GharDisha ने इस चरण के लिए जरूरी follow-up जवाब ले लिए हैं। अब बाकी बातें, जैसे Awaas+/SECC list, damage certificate, जमीन/site verification और final approval, Gram Panchayat / BDO अधिकारी ही verify करेंगे।',
      followUpCounter: 'दिए गए follow-up जवाब',
    },
    as: {
      familyQuestionTitle: 'এতিয়া পৰিয়াল / সহায়কৰ পৰা সোধা প্ৰশ্ন',
      answerQuestionLabel: 'এই প্ৰশ্নৰ উত্তৰ লিখক',
      answerQuestionPlaceholder: 'উদাহৰণ: হয়, পঞ্চায়তে কালি ক্ষতিৰ এখন চিঠি দিছিল।',
      updateCaseBtn: 'এই উত্তৰে case update কৰক',
      updatingCaseBtn: 'case update কৰি আছে...',
      caseUpdatedTitle: 'আপোনাৰ উত্তৰে case update হ’ল',
      caseUpdatedBody: 'আপোনাৰ উত্তৰ case-ত যোগ কৰা হৈছে। এতিয়া পৰৱৰ্তী পদক্ষেপৰ বাবে তলৰ action plan আৰু BDO / Panchayat প্ৰশ্নসমূহ চাওক।',
      nextRemainingQuestion: 'পৰৱৰ্তী বাকী থকা প্ৰশ্ন',
      answerNextQuestionBtn: 'এই পৰৱৰ্তী প্ৰশ্নৰ উত্তৰ দিয়ক',
      readinessTitle: 'BDO লৈ যোৱাৰ প্ৰস্তুতি',
      readinessSubtitle: 'এই meter-এ চৰকাৰী পৰীক্ষাৰ বাবে প্ৰস্তুতি দেখুৱায়। ই approval prediction নহয়।',
      initialReadinessTitle: 'আৰম্ভণিৰ BDO প্ৰস্তুতি',
      initialReadinessSubtitle: 'এইটো কেৱল প্ৰথম কাহিনীৰ ভিত্তিত। score update কৰিবলৈ follow-up প্ৰশ্নৰ উত্তৰ দিয়ক।',
      updatedReadinessTitle: 'Update কৰা BDO প্ৰস্তুতি',
      updatedReadinessSubtitle: 'পৰিয়াল / সহায়কে missing প্ৰশ্নৰ উত্তৰ দিয়াৰ পিছত এইটো পুনৰ গণনা কৰা হৈছে।',
      temporaryShelterSafeguard: 'আত্মীয়ৰ ঘৰত বা shelter-ত সাময়িকভাৱে থকা মানে কেৱল বৰ্তমান আশ্ৰয়। ই যোগ্যতাৰ প্ৰমাণ নহয়। পৰিয়ালৰ নিজা ঘৰৰ অৱস্থা Gram Sabha / BDO-এ verify কৰিব লাগিব।',
      pathwayFit: 'PMAY-G পথৰ সৈতে মিল',
      evidenceReadiness: 'প্ৰমাণ / নথিৰ প্ৰস্তুতি',
      listingClarity: 'Awaas+ / SECC অৱস্থা স্পষ্টতা',
      officialVisitReadiness: 'official-ৰ ওচৰলৈ যোৱাৰ প্ৰস্তুতি',
      overallReadiness: 'মুঠ প্ৰস্তুতি',
      readinessStrong: 'ভাল',
      readinessMedium: 'আরো প্ৰস্তুতি লাগে',
      readinessLow: 'আরো তথ্য লাগে',
      readinessDisclaimer: 'এই score-এ কেৱল Gram Panchayat / BDO পৰীক্ষাৰ বাবে প্ৰস্তুতি দেখুৱায়। ই যোগ্যতা ঠিক নকৰে আৰু approval guarantee নকৰে।',
      followUpLimitTitle: 'official visit-ৰ বাবে case সাজু হৈছে',
      followUpLimitBody: 'GharDisha-এ এই ধাপৰ বাবে মূল follow-up উত্তৰ লৈছে। এতিয়া বাকী বিষয়, যেনে Awaas+/SECC list, damage certificate, land/site verification আৰু final approval, Gram Panchayat / BDO official-এ verify কৰিব লাগিব।',
      followUpCounter: 'দিয়া follow-up উত্তৰ',
    },
    ta: {
      familyQuestionTitle: 'இப்போது குடும்பம் / உதவியாளரிடம் கேட்க வேண்டிய கேள்வி',
      answerQuestionLabel: 'இந்த கேள்விக்கான பதிலை எழுதுங்கள்',
      answerQuestionPlaceholder: 'உதாரணம்: ஆம், பஞ்சாயத்து நேற்று சேதம் குறித்த கடிதம் கொடுத்தது.',
      updateCaseBtn: 'இந்த பதிலால் case-ஐ update செய்யுங்கள்',
      updatingCaseBtn: 'case update ஆகிறது...',
      caseUpdatedTitle: 'உங்கள் பதிலால் case update செய்யப்பட்டது',
      caseUpdatedBody: 'உங்கள் பதில் case-ல் சேர்க்கப்பட்டது. அடுத்த படிக்காக கீழே உள்ள action plan மற்றும் BDO / Panchayat கேள்விகளைப் பாருங்கள்.',
      nextRemainingQuestion: 'மீதமுள்ள அடுத்த கேள்வி',
      answerNextQuestionBtn: 'இந்த அடுத்த கேள்விக்கு பதில் எழுதுங்கள்',
      readinessTitle: 'BDO செல்லும் தயார்நிலை',
      readinessSubtitle: 'இது அரசு சரிபார்ப்பிற்கான தயார்நிலையை காட்டும். இது approval prediction அல்ல.',
      initialReadinessTitle: 'ஆரம்ப BDO செல்லும் தயார்நிலை',
      initialReadinessSubtitle: 'இது முதல் கதையின் அடிப்படையில் மட்டும். இந்த score-ஐ update செய்ய follow-up கேள்விக்கு பதில் எழுதுங்கள்.',
      updatedReadinessTitle: 'Update செய்யப்பட்ட BDO செல்லும் தயார்நிலை',
      updatedReadinessSubtitle: 'குடும்பம் / உதவியாளர் missing கேள்விக்கு பதில் அளித்த பிறகு இது மீண்டும் கணக்கிடப்பட்டது.',
      temporaryShelterSafeguard: 'உறவினர் வீடு அல்லது shelter-ல் தற்காலிகமாக இருப்பது தற்போதைய தங்குமிடம் மட்டும்; அது தகுதி சான்று அல்ல. குடும்பத்தின் சொந்த வீட்டு நிலை Gram Sabha / BDO மூலம் verify செய்யப்பட வேண்டும்.',
      pathwayFit: 'PMAY-G பாதையுடன் பொருந்தல்',
      evidenceReadiness: 'ஆதாரம் / ஆவண தயார்நிலை',
      listingClarity: 'Awaas+ / SECC நிலை தெளிவு',
      officialVisitReadiness: 'அதிகாரியை சந்திக்கும் தயார்நிலை',
      overallReadiness: 'மொத்த தயார்நிலை',
      readinessStrong: 'நன்று',
      readinessMedium: 'மேலும் தயாரிப்பு தேவை',
      readinessLow: 'மேலும் தகவல் தேவை',
      readinessDisclaimer: 'இந்த score Gram Panchayat / BDO சரிபார்ப்பிற்கான தயார்நிலையை மட்டும் காட்டுகிறது. இது தகுதி முடிவு அல்லது approval guarantee அல்ல.',
      followUpLimitTitle: 'அதிகாரி சந்திப்பிற்கு case தயாராக உள்ளது',
      followUpLimitBody: 'இந்த கட்டத்திற்கு தேவையான முக்கிய follow-up பதில்களை GharDisha சேகரித்துள்ளது. மீதமுள்ளவை, Awaas+/SECC list, damage certificate, land/site verification மற்றும் final approval போன்றவை, Gram Panchayat / BDO அதிகாரிகளால் verify செய்யப்பட வேண்டும்.',
      followUpCounter: 'கொடுக்கப்பட்ட follow-up பதில்கள்',
    },
    mr: {
      familyQuestionTitle: 'आता कुटुंब / मदतनीसाला विचारायचा प्रश्न',
      answerQuestionLabel: 'या प्रश्नाचे उत्तर लिहा',
      answerQuestionPlaceholder: 'उदाहरण: हो, पंचायतने काल नुकसानाचे पत्र दिले.',
      updateCaseBtn: 'या उत्तराने case update करा',
      updatingCaseBtn: 'case update होत आहे...',
      caseUpdatedTitle: 'आपल्या उत्तराने case update झाला',
      caseUpdatedBody: 'आपले उत्तर case मध्ये जोडले गेले आहे. पुढील पावलांसाठी खालील action plan आणि BDO / Panchayat प्रश्न पहा.',
      nextRemainingQuestion: 'पुढचा उरलेला प्रश्न',
      answerNextQuestionBtn: 'या पुढच्या प्रश्नाचे उत्तर द्या',
      readinessTitle: 'BDO कडे जाण्याची तयारी',
      readinessSubtitle: 'हे सरकारी पडताळणीसाठीची तयारी दाखवते. हे approval prediction नाही.',
      initialReadinessTitle: 'सुरुवातीची BDO तयारी',
      initialReadinessSubtitle: 'हे फक्त पहिल्या गोष्टीवर आधारित आहे. हा score update करण्यासाठी follow-up प्रश्नाचे उत्तर द्या.',
      updatedReadinessTitle: 'अपडेट केलेली BDO तयारी',
      updatedReadinessSubtitle: 'कुटुंब / मदतनीसाने missing प्रश्नाचे उत्तर दिल्यानंतर हा score पुन्हा काढला आहे.',
      temporaryShelterSafeguard: 'नातेवाईकांच्या घरी किंवा shelter मध्ये तात्पुरते राहणे ही फक्त सध्याची राहण्याची स्थिती आहे; ते पात्रतेचा पुरावा नाही. कुटुंबाच्या स्वतःच्या घराची स्थिती Gram Sabha / BDO कडून verify होणे गरजेचे आहे.',
      pathwayFit: 'PMAY-G मार्गाशी जुळणारे',
      evidenceReadiness: 'पुरावा / कागदपत्र तयारी',
      listingClarity: 'Awaas+ / SECC स्थिती स्पष्टता',
      officialVisitReadiness: 'अधिकाऱ्यांना भेटण्याची तयारी',
      overallReadiness: 'एकूण तयारी',
      readinessStrong: 'मजबूत',
      readinessMedium: 'तयारी हवी',
      readinessLow: 'अधिक माहिती हवी',
      readinessDisclaimer: 'हा score फक्त Gram Panchayat / BDO पडताळणीसाठी तयारी दाखवतो. तो पात्रता ठरवत नाही आणि approval guarantee देत नाही.',
      followUpLimitTitle: 'अधिकारी भेटीसाठी case तयार आहे',
      followUpLimitBody: 'GharDisha ने या टप्प्यासाठी महत्त्वाची follow-up उत्तरे घेतली आहेत. आता उरलेल्या गोष्टी, जसे Awaas+/SECC list, damage certificate, land/site verification आणि final approval, Gram Panchayat / BDO अधिकारी verify करतील.',
      followUpCounter: 'दिलेली follow-up उत्तरे',
    },
  };

  return copy[language] || copy.en;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function textHasAny(text, words) {
  const haystack = String(text || '').toLowerCase();
  return words.some((word) => haystack.includes(word));
}

function inputSafetyCopy(language) {
  const copy = {
    en: {
      mainIncomplete: 'Please describe a real housing or disaster situation first. Include what happened to the house, where the family is staying now, and what documents they have.',
      unsafeRequest: 'GharDisha can only help with PMAY-G case preparation. It cannot bypass official verification, create false claims, or say someone is approved.',
      followUpIncomplete: 'This answer does not address the follow-up question. Please answer the missing information question so the case can be updated safely.',
    },
    hi: {
      mainIncomplete: 'कृपया पहले घर या आपदा से जुड़ी वास्तविक स्थिति लिखें। घर को क्या हुआ, परिवार अभी कहाँ रह रहा है, और कौन से दस्तावेज हैं — यह बताइए।',
      unsafeRequest: 'GharDisha केवल PMAY-G केस तैयारी में मदद कर सकता है। यह सरकारी जांच को bypass नहीं कर सकता, झूठे दावे नहीं बना सकता, और approval नहीं दे सकता।',
      followUpIncomplete: 'यह जवाब follow-up सवाल का सही जवाब नहीं देता। केस को सुरक्षित रूप से अपडेट करने के लिए missing जानकारी का जवाब लिखें।',
    },
    as: {
      mainIncomplete: 'অনুগ্ৰহ কৰি প্ৰথমে ঘৰ বা দুৰ্যোগ সম্পৰ্কীয় বাস্তৱ পৰিস্থিতি লিখক। ঘৰটোৰ কি হ’ল, পৰিয়াল এতিয়া ক’ত আছে, আৰু কি নথি আছে — এইবোৰ লিখক।',
      unsafeRequest: 'GharDisha কেৱল PMAY-G case preparation-ত সহায় কৰিব পাৰে। ই official verification bypass কৰিব নোৱাৰে, মিছা claim বনাব নোৱাৰে, আৰু approval দিব নোৱাৰে।',
      followUpIncomplete: 'এই উত্তৰে follow-up প্ৰশ্নৰ তথ্য নিদিয়ে। Case safely update কৰিবলৈ missing তথ্যৰ উত্তৰ লিখক।',
    },
    ta: {
      mainIncomplete: 'முதலில் வீடு அல்லது பேரிடர் தொடர்பான உண்மையான நிலையை எழுதுங்கள். வீட்டிற்கு என்ன நடந்தது, குடும்பம் இப்போது எங்கு தங்கியுள்ளது, எந்த ஆவணங்கள் உள்ளன என்பதை சேர்க்கவும்.',
      unsafeRequest: 'GharDisha PMAY-G case preparation-க்கு மட்டும் உதவும். அரசு சரிபார்ப்பை bypass செய்ய முடியாது, பொய்யான claims உருவாக்க முடியாது, approval சொல்ல முடியாது.',
      followUpIncomplete: 'இந்த பதில் follow-up கேள்விக்கு தேவையான தகவலை தரவில்லை. Case-ஐ பாதுகாப்பாக update செய்ய missing தகவலுக்கு பதில் எழுதுங்கள்.',
    },
    mr: {
      mainIncomplete: 'कृपया आधी घर किंवा आपत्तीशी संबंधित खरी परिस्थिती लिहा. घराचे काय झाले, कुटुंब सध्या कुठे राहत आहे, आणि कोणती कागदपत्रे आहेत ते सांगा.',
      unsafeRequest: 'GharDisha फक्त PMAY-G case preparation मध्ये मदत करू शकते. ते सरकारी पडताळणी bypass करू शकत नाही, खोटे claims बनवू शकत नाही, आणि approval देऊ शकत नाही.',
      followUpIncomplete: 'हे उत्तर follow-up प्रश्नाचे योग्य उत्तर देत नाही. Case सुरक्षितपणे update करण्यासाठी missing माहितीचे उत्तर लिहा.',
    },
  };

  return copy[language] || copy.en;
}

const JAILBREAK_OR_ABUSE_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|system|developer)\s+(instructions|rules)/i,
  /ignore\s+(all\s+)?(the\s+)?(rules|instructions|safety|guardrails)/i,
  /forget\s+(all\s+)?(previous|above|system|developer)\s+(instructions|rules)/i,
  /forget\s+(all\s+)?(the\s+)?(rules|instructions|safety|guardrails)/i,
  /reveal\s+(the\s+)?(system|developer)\s+(prompt|message|instructions)/i,
  /system\s+prompt/i,
  /jailbreak/i,
  /\b(i\s+am|i'm)\s+(your|ur)\s+(master|admin|developer|system)\b/i,
  /bypass\s+(rules|verification|official|government|safety)/i,
  /(say|tell\s+me)\s+(i|we|they)\s+(qualify|am\s+eligible|are\s+eligible|approved)/i,
  /(say|tell\s+me)\s+(that\s+)?(i|we|they)\s+(am|are)?\s*(eligible|qualified|approved)/i,
  /make\s+(me|us|them)\s+(eligible|qualified|approved)/i,
  /mark\s+(me|us|them)\s+as\s+(eligible|qualified|approved)/i,
  /guarantee\s+(approval|eligibility)/i,
  /fake\s+(document|certificate|letter|proof|aadhaar|ration)/i,
  /create\s+(fake|false)\s+(document|certificate|letter|proof)/i,
  /lie\s+to\s+(the\s+)?(panchayat|bdo|official|government)/i,
  /false\s+(claim|information|proof|document)/i,
  /hack|exploit|steal|scam/i,
  /porn|nude|sex/i,
];

const HOUSING_CASE_SIGNALS = [
  'pmay', 'pmay-g', 'awas', 'awaas', 'secc', 'bdo', 'panchayat', 'gram sabha',
  'house', 'home', 'hut', 'shelter', 'relief camp', 'school shelter', 'temporary shelter',
  'kutcha', 'kaccha', 'pucca', 'pakka', 'damaged', 'destroyed', 'crack', 'roof', 'wall',
  'flood', 'earthquake', 'landslide', 'cyclone', 'disaster', 'rain', 'river', 'erosion',
  'aadhaar', 'aadhar', 'ration', 'bank', 'land paper', 'certificate', 'damage letter',
  'घर', 'मकान', 'आवास', 'बाढ़', 'भूकंप', 'आपदा', 'पंचायत', 'ग्राम सभा', 'राशन', 'आधार', 'जमीन', 'नुकसान', 'प्रमाण',
  'ঘৰ', 'বান', 'বানপানী', 'ভূমিকম্প', 'দুৰ্যোগ', 'পঞ্চায়ত', 'আধাৰ', 'ৰেচন', 'নথি', 'ক্ষতি',
  'வீடு', 'வெள்ளம்', 'நிலநடுக்கம்', 'பேரிடர்', 'பஞ்சாயத்து', 'ஆதார்', 'ரேஷன்', 'சான்று', 'சேதம்',
  'घर', 'पूर', 'भूकंप', 'आपत्ती', 'पंचायत', 'रेशन', 'आधार', 'जमीन', 'पुरावा', 'नुकसान',
];

const GREETING_ONLY_PATTERNS = [
  /^(hi|hello|hey|how are you|good morning|good evening|salam|assalamualaikum|namaste|thanks|thank you)[\s!?. ,]*$/i,
  /^(hi|hello|hey)[\s!?. ,]*(how are you)?[\s!?. ,]*$/i,
];

function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function hasJailbreakOrAbuse(text) {
  return JAILBREAK_OR_ABUSE_PATTERNS.some((pattern) => pattern.test(String(text || '')));
}

function hasHousingCaseSignal(text) {
  return textHasAny(text, HOUSING_CASE_SIGNALS);
}

function isGreetingOnly(text) {
  const value = String(text || '').trim();
  return GREETING_ONLY_PATTERNS.some((pattern) => pattern.test(value));
}

function detectMainInputIssue(text, language) {
  const safety = inputSafetyCopy(language);
  const value = String(text || '').trim();

  if (hasJailbreakOrAbuse(value)) return safety.unsafeRequest;
  if (!value || value.length < 18 || isGreetingOnly(value)) return safety.mainIncomplete;
  if (!hasHousingCaseSignal(value) && wordCount(value) < 18) return safety.mainIncomplete;

  return '';
}

function detectFollowUpInputIssue(answer, question, language) {
  const safety = inputSafetyCopy(language);
  const value = String(answer || '').trim();
  const lower = value.toLowerCase();

  if (hasJailbreakOrAbuse(value)) return safety.unsafeRequest;
  if (!value || value.length < 3 || isGreetingOnly(value)) return safety.followUpIncomplete;

  const directAnswer = /\b(yes|no|not yet|not now|already|tomorrow|today|yesterday)\b/i.test(value)
    || /हाँ|हां|नहीं|अभी नहीं|হয়|নহয়|नाही|होय|ஆம்|இல்லை/.test(value);

  if (!directAnswer && !hasHousingCaseSignal(value) && wordCount(value) < 8) {
    return safety.followUpIncomplete;
  }

  const unsafeApprovalOnly = /(qualify|eligible|approved|approval|पात्र|योग्य|मंजूर|தகுதி|ஒப்புதல்|पात्रता)/i.test(lower)
    && !hasHousingCaseSignal(value)
    && !directAnswer;
  if (unsafeApprovalOnly) return safety.unsafeRequest;

  return '';
}

function calculateCaseReadiness(caseFacts, action, language, hasFollowUpAnswer = false) {
  const ux = supportCopy(language);
  const disaster = caseFacts?.disaster_displaced?.value;
  const rural = String(caseFacts?.rural_context?.value || '').toLowerCase();
  const pucca = caseFacts?.owns_pucca_house?.value;
  const awaas = String(caseFacts?.awaas_or_secc_status?.value || '').toLowerCase();
  const docs = (caseFacts?.documents_available || []).join(' ').toLowerCase();
  const missing = [
    ...(action?.missing_or_uncertain_items || []),
    action?.biggest_obstacle || '',
    action?.next_best_question || '',
  ].join(' ').toLowerCase();

  let pathway = 35;
  if (disaster === true) pathway += 20;
  if (rural === 'likely_rural') pathway += 25;
  else if (rural === 'uncertain') pathway += 10;
  else if (rural === 'likely_urban') pathway -= 25;
  if (pucca === false) pathway += 25;
  else if (pucca === 'unknown') pathway += 5;
  else if (pucca === true) pathway -= 30;

  let evidence = 10;
  if (textHasAny(docs, ['aadhaar', 'आधार', 'আধাৰ', 'ration', 'राशन', 'ரேஷன்', 'रेशन'])) evidence += 30;
  if (textHasAny(docs, ['bank', 'account', 'बैंक', 'வங்கி', 'बँक'])) evidence += 15;
  if (textHasAny(docs, ['damage', 'certificate', 'panchayat letter', 'flood', 'earthquake', 'नुकसान', 'प्रमाण', 'சான்று', 'पुरावा'])) evidence += 25;
  if (textHasAny(docs, ['land', 'जमीन', 'நில', 'जमीन'])) evidence += 15;
  if (textHasAny(missing, ['damage proof', 'damage certificate', 'certificate', 'land', 'site proof', 'missing', 'uncertain', 'अस्पष्ट', 'குறை', 'कमी'])) evidence -= 15;
  if (hasFollowUpAnswer) evidence += 10;
  else evidence -= 10;

  let listing = 35;
  if (textHasAny(awaas, ['listed', 'captured', 'included', 'yes'])) listing = 80;
  if (textHasAny(awaas, ['unknown', 'uncertain', 'not know', 'don’t know', 'dont know'])) listing = 25;
  if (textHasAny(awaas, ['not listed', 'not included'])) listing = 35;

  const actions = action?.next_48_hours || [];
  const questions = action?.questions_for_bdo_or_panchayat || [];
  let officialVisit = 25;
  if (actions.length >= 4) officialVisit += 35;
  else if (actions.length >= 2) officialVisit += 20;
  if (questions.length >= 2) officialVisit += 25;
  else if (questions.length >= 1) officialVisit += 12;
  if (action?.plain_language_summary) officialVisit += 15;
  if (hasFollowUpAnswer) officialVisit += 10;
  else officialVisit = Math.min(officialVisit - 15, 70);

  const unresolvedOfficialChecks =
    listing < 50 ||
    textHasAny(missing, [
      'awaas', 'secc', 'unknown', 'uncertain', 'damage proof', 'damage certificate',
      'damage letter', 'official proof', 'land', 'site proof', 'letter',
      'पता नहीं', 'अस्पष्ट', 'नुकसान', 'पत्र', 'जमीन',
      'তথ্য', 'অস্পষ্ট', 'চিঠি', 'முழுமையில்லை', 'கடிதம்', 'நில',
      'माहित नाही', 'अस्पष्ट', 'पत्र', 'जमीन'
    ]);

  if (unresolvedOfficialChecks) {
    officialVisit = Math.min(officialVisit, hasFollowUpAnswer ? 85 : 70);
  }

  const items = [
    { key: 'pathway', label: ux.pathwayFit, score: clampScore(pathway) },
    { key: 'evidence', label: ux.evidenceReadiness, score: clampScore(evidence) },
    { key: 'listing', label: ux.listingClarity, score: clampScore(listing) },
    { key: 'official', label: ux.officialVisitReadiness, score: clampScore(officialVisit) },
  ];

  const overall = clampScore(items.reduce((sum, item) => sum + item.score, 0) / items.length);
  const bandLabel = overall >= 75 ? ux.readinessStrong : overall >= 45 ? ux.readinessMedium : ux.readinessLow;

  const isUpdated = Boolean(hasFollowUpAnswer);
  const title = isUpdated ? ux.updatedReadinessTitle : ux.initialReadinessTitle;
  const subtitle = isUpdated ? ux.updatedReadinessSubtitle : ux.initialReadinessSubtitle;
  const stage = isUpdated ? 'updated' : 'initial';

  return { items, overall, bandLabel, ux, title, subtitle, stage };
}

function formatFact(value, language) {
  const unknownMap = {
    en: 'unknown',
    hi: 'पता नहीं',
    as: 'অজ্ঞাত',
    ta: 'தெரியவில்லை',
    mr: 'माहित नाही',
  };

  if (value === undefined || value === null) {
    return unknownMap[language] || unknownMap.en;
  }

  if (typeof value === 'boolean') {
    const yesNo = {
      en: value ? 'yes' : 'no',
      hi: value ? 'हाँ' : 'नहीं',
      as: value ? 'হয়' : 'নহয়',
      ta: value ? 'ஆம்' : 'இல்லை',
      mr: value ? 'होय' : 'नाही',
    };
    return yesNo[language] || yesNo.en;
  }

  const str = String(typeof value === 'object' ? JSON.stringify(value) : value);
  const map = {
    likely_rural: {
      en: 'likely rural',
      hi: 'शायद ग्रामीण',
      as: 'সম্ভৱত গাঁও অঞ্চল',
      ta: 'கிராம பகுதி போல தெரிகிறது',
      mr: 'बहुधा ग्रामीण',
    },
    likely_urban: {
      en: 'likely urban',
      hi: 'शायद शहरी',
      as: 'সম্ভৱত নগৰ',
      ta: 'நகர பகுதி போல தெரிகிறது',
      mr: 'बहुधा शहरी',
    },
    uncertain: {
      en: 'uncertain',
      hi: 'साफ नहीं',
      as: 'অনিশ্চিত',
      ta: 'தெளிவில்லை',
      mr: 'स्पष्ट नाही',
    },
    unknown: {
      en: 'unknown',
      hi: 'पता नहीं',
      as: 'অজ্ঞাত',
      ta: 'தெரியவில்லை',
      mr: 'माहित नाही',
    },
  };
  return map[str]?.[language] || str;
}

function CaseFact({ label, value, language }) {
  return (
    <div className="fact-row">
      <span>{label}</span>
      <strong>{formatFact(value, language)}</strong>
    </div>
  );
}

function getDemoVisualCopy(language) {
  const copy = {
    en: {
      safePathTitle: 'Safe path to PMAY-G',
      pathTag: 'Story → proof gaps → official visit plan',
      ruralStory: 'Rural family story',
      caseFacts: 'Case facts',
      structured: 'structured',
      missingProof: 'Missing proof',
      detected: 'detected',
      bdoTitle: 'Gram Panchayat / BDO',
      bdoBody: 'Final verification stays human',
      visualSteps: [
        { title: 'Disaster story', body: 'voice / text / file' },
        { title: 'AI case file', body: 'facts + gaps' },
        { title: 'Source check', body: 'PMAY-G corpus' },
        { title: 'BDO plan', body: 'human decision' },
      ],
      journeyKicker: 'Judge demo flow',
      journeyTitle: 'Understand the AI value in 10 seconds',
      journeySteps: [
        { title: 'Messy story', body: 'Voice, text, or a document becomes a clear housing case.' },
        { title: 'AI case file', body: 'The system extracts facts, uncertainty, proof gaps, and the next question.' },
        { title: 'Source check', body: 'Guidance stays grounded in the curated PMAY-G knowledge base.' },
        { title: 'Human handoff', body: 'The family gets a BDO-ready plan while officials keep final authority.' },
      ],
      ribbon: {
        studentPrototype: { title: 'Student prototype', body: 'Not an official Government of India service' },
        sourceGrounded: { title: 'Source-grounded', body: 'Uses curated PMAY-G guidance, not random claims' },
        officialsDecide: { title: 'Officials decide', body: 'Gram Sabha / BDO keep final verification authority' },
      },
      proofPoints: ['Messy story to case file', 'Source-grounded guidance', 'Human decision boundary'],
      capabilityCards: [
        { title: 'RAG', body: 'PMAY-G source library' },
        { title: 'Voice', body: 'trusted-helper input' },
        { title: 'Guarded', body: 'no fake eligibility' },
      ],
      starterTitle: 'Need a fast demo?',
      starterBody: 'Use one realistic starter, then edit it like a trusted helper would.',
    },
    hi: {
      safePathTitle: 'PMAY-G तक सुरक्षित रास्ता',
      pathTag: 'कहानी → प्रमाण की कमी → अधिकारी से मिलने की योजना',
      ruralStory: 'ग्रामीण परिवार की कहानी',
      caseFacts: 'केस तथ्य',
      structured: 'संरचित',
      missingProof: 'प्रमाण की कमी',
      detected: 'पहचानी गई',
      bdoTitle: 'ग्राम पंचायत / BDO',
      bdoBody: 'अंतिम जांच इंसान के पास रहती है',
      visualSteps: [
        { title: 'आपदा की कहानी', body: 'आवाज़ / लिखित / फाइल' },
        { title: 'AI केस फाइल', body: 'तथ्य + कमी' },
        { title: 'स्रोत जांच', body: 'PMAY-G corpus' },
        { title: 'BDO योजना', body: 'मानवीय निर्णय' },
      ],
      journeyKicker: 'जज डेमो फ्लो',
      journeyTitle: '10 सेकंड में AI की उपयोगिता समझें',
      journeySteps: [
        { title: 'बिखरी कहानी', body: 'आवाज़, लिखित बात या दस्तावेज़ साफ housing case में बदलता है।' },
        { title: 'AI केस फाइल', body: 'सिस्टम तथ्य, अनिश्चितता, प्रमाण की कमी और अगला सवाल निकालता है।' },
        { title: 'स्रोत जांच', body: 'मार्गदर्शन curated PMAY-G knowledge base पर आधारित रहता है।' },
        { title: 'मानवीय handoff', body: 'परिवार को BDO-ready योजना मिलती है, अंतिम authority अधिकारियों के पास रहती है।' },
      ],
      ribbon: {
        studentPrototype: { title: 'Student prototype', body: 'यह भारत सरकार की आधिकारिक सेवा नहीं है' },
        sourceGrounded: { title: 'स्रोत-आधारित', body: 'Curated PMAY-G guidance का उपयोग, random claims नहीं' },
        officialsDecide: { title: 'अधिकारी निर्णय लेते हैं', body: 'Gram Sabha / BDO अंतिम verification रखते हैं' },
      },
      proofPoints: ['बिखरी कहानी से केस फाइल', 'स्रोत-आधारित मार्गदर्शन', 'अंतिम निर्णय इंसान के पास'],
      capabilityCards: [
        { title: 'RAG', body: 'PMAY-G source library' },
        { title: 'आवाज़', body: 'trusted-helper input' },
        { title: 'सुरक्षित', body: 'fake eligibility नहीं' },
      ],
      starterTitle: 'तेज़ डेमो चाहिए?',
      starterBody: 'एक realistic starter चुनें, फिर trusted helper की तरह edit करें।',
    },
    as: {
      safePathTitle: 'PMAY-G লৈ সুৰক্ষিত পথ',
      pathTag: 'কাহিনী → প্ৰমাণৰ gap → official visit plan',
      ruralStory: 'গাঁও পৰিয়ালৰ কাহিনী',
      caseFacts: 'Case facts',
      structured: 'সাজু কৰা',
      missingProof: 'প্ৰমাণৰ অভাৱ',
      detected: 'ধৰা পৰিল',
      bdoTitle: 'Gram Panchayat / BDO',
      bdoBody: 'চূড়ান্ত verification মানুহৰ হাতত থাকে',
      visualSteps: [
        { title: 'দুৰ্যোগৰ কাহিনী', body: 'voice / text / file' },
        { title: 'AI case file', body: 'facts + gaps' },
        { title: 'Source check', body: 'PMAY-G corpus' },
        { title: 'BDO plan', body: 'human decision' },
      ],
      journeyKicker: 'জজ demo flow',
      journeyTitle: '১০ ছেকেণ্ডত AI value বুজক',
      journeySteps: [
        { title: 'অস্পষ্ট কাহিনী', body: 'Voice, text বা document এখন clear housing case-ত সলনি হয়।' },
        { title: 'AI case file', body: 'System-এ facts, uncertainty, proof gaps আৰু next question উলিয়ায়।' },
        { title: 'Source check', body: 'Guidance curated PMAY-G knowledge base-ত grounded থাকে।' },
        { title: 'Human handoff', body: 'পৰিয়ালে BDO-ready plan পায় আৰু final authority official-ৰ হাতত থাকে।' },
      ],
      ribbon: {
        studentPrototype: { title: 'Student prototype', body: 'এইটো ভাৰত চৰকাৰৰ আনুষ্ঠানিক সেৱা নহয়' },
        sourceGrounded: { title: 'Source-grounded', body: 'Curated PMAY-G guidance ব্যৱহাৰ কৰে, random claims নহয়' },
        officialsDecide: { title: 'Official-এ সিদ্ধান্ত লয়', body: 'Gram Sabha / BDO final verification ৰাখে' },
      },
      proofPoints: ['কাহিনীৰ পৰা case file', 'Source-grounded guidance', 'মানুহৰ final decision'],
      capabilityCards: [
        { title: 'RAG', body: 'PMAY-G source library' },
        { title: 'Voice', body: 'trusted-helper input' },
        { title: 'Guarded', body: 'fake eligibility নহয়' },
      ],
      starterTitle: 'দ্ৰুত demo লাগে?',
      starterBody: 'এটা realistic starter বাছক, তাৰ পিছত trusted helper-ৰ দৰে edit কৰক।',
    },
    ta: {
      safePathTitle: 'PMAY-G-க்கு பாதுகாப்பான வழி',
      pathTag: 'கதை → proof gaps → official visit plan',
      ruralStory: 'கிராம குடும்ப கதை',
      caseFacts: 'Case facts',
      structured: 'சீரமைக்கப்பட்டது',
      missingProof: 'சான்று குறைவு',
      detected: 'கண்டறியப்பட்டது',
      bdoTitle: 'Gram Panchayat / BDO',
      bdoBody: 'இறுதி சரிபார்ப்பு மனிதர்களிடம் இருக்கும்',
      visualSteps: [
        { title: 'பேரிடர் கதை', body: 'voice / text / file' },
        { title: 'AI case file', body: 'facts + gaps' },
        { title: 'Source check', body: 'PMAY-G corpus' },
        { title: 'BDO plan', body: 'human decision' },
      ],
      journeyKicker: 'ஜட்ஜ் demo flow',
      journeyTitle: '10 விநாடிகளில் AI மதிப்பை புரிந்துகொள்ளுங்கள்',
      journeySteps: [
        { title: 'சீரற்ற கதை', body: 'Voice, text அல்லது document clear housing case ஆக மாறும்.' },
        { title: 'AI case file', body: 'System facts, uncertainty, proof gaps, next question ஆகியவற்றை கண்டறியும்.' },
        { title: 'Source check', body: 'Guidance curated PMAY-G knowledge base-இல் grounded இருக்கும்.' },
        { title: 'Human handoff', body: 'குடும்பத்திற்கு BDO-ready plan கிடைக்கும்; final authority officials களிடம் இருக்கும்.' },
      ],
      ribbon: {
        studentPrototype: { title: 'Student prototype', body: 'இது இந்திய அரசின் அதிகாரப்பூர்வ சேவை அல்ல' },
        sourceGrounded: { title: 'Source-grounded', body: 'Curated PMAY-G guidance பயன்படுத்தும், random claims அல்ல' },
        officialsDecide: { title: 'அதிகாரிகள் முடிவு செய்கிறார்கள்', body: 'Gram Sabha / BDO final verification authority வைத்திருக்கிறார்கள்' },
      },
      proofPoints: ['கதையிலிருந்து case file', 'Source-grounded guidance', 'இறுதி முடிவு மனிதர்களிடம்'],
      capabilityCards: [
        { title: 'RAG', body: 'PMAY-G source library' },
        { title: 'Voice', body: 'trusted-helper input' },
        { title: 'Guarded', body: 'fake eligibility இல்லை' },
      ],
      starterTitle: 'வேகமான demo வேண்டுமா?',
      starterBody: 'ஒரு realistic starter தேர்ந்தெடுத்து, trusted helper போல edit செய்யுங்கள்.',
    },
    mr: {
      safePathTitle: 'PMAY-G पर्यंत सुरक्षित मार्ग',
      pathTag: 'गोष्ट → proof gaps → official visit plan',
      ruralStory: 'ग्रामीण कुटुंबाची गोष्ट',
      caseFacts: 'Case facts',
      structured: 'सुव्यवस्थित',
      missingProof: 'पुराव्याची कमतरता',
      detected: 'ओळखली',
      bdoTitle: 'Gram Panchayat / BDO',
      bdoBody: 'अंतिम पडताळणी मानवी अधिकाऱ्यांकडे राहते',
      visualSteps: [
        { title: 'आपत्तीची गोष्ट', body: 'voice / text / file' },
        { title: 'AI case file', body: 'facts + gaps' },
        { title: 'Source check', body: 'PMAY-G corpus' },
        { title: 'BDO plan', body: 'human decision' },
      ],
      journeyKicker: 'जज demo flow',
      journeyTitle: '10 सेकंदात AI value समजून घ्या',
      journeySteps: [
        { title: 'गोंधळलेली गोष्ट', body: 'Voice, text किंवा document clear housing case मध्ये बदलते.' },
        { title: 'AI case file', body: 'System facts, uncertainty, proof gaps आणि next question शोधते.' },
        { title: 'Source check', body: 'Guidance curated PMAY-G knowledge base वर grounded राहते.' },
        { title: 'Human handoff', body: 'कुटुंबाला BDO-ready plan मिळतो आणि final authority officials कडे राहते.' },
      ],
      ribbon: {
        studentPrototype: { title: 'Student prototype', body: 'ही भारत सरकारची अधिकृत सेवा नाही' },
        sourceGrounded: { title: 'Source-grounded', body: 'Curated PMAY-G guidance वापरते, random claims नाही' },
        officialsDecide: { title: 'अधिकारी निर्णय घेतात', body: 'Gram Sabha / BDO final verification authority ठेवतात' },
      },
      proofPoints: ['गोष्ट ते case file', 'Source-grounded guidance', 'मानवी अंतिम निर्णय'],
      capabilityCards: [
        { title: 'RAG', body: 'PMAY-G source library' },
        { title: 'Voice', body: 'trusted-helper input' },
        { title: 'Guarded', body: 'fake eligibility नाही' },
      ],
      starterTitle: 'जलद demo हवा आहे?',
      starterBody: 'एक realistic starter निवडा, मग trusted helper सारखे edit करा.',
    },
  };
  return copy[language] || copy.en;
}

function ReliefIllustration({ label, language = 'en' } = {}) {
  const copy = getDemoVisualCopy(language);
  const icons = [Waves, Sparkles, BookOpenCheck, Landmark];
  const visualSteps = copy.visualSteps.map((step, index) => ({ ...step, icon: icons[index] }));

  return (
    <div className="relief-illustration storyboard-visual" aria-label={copy.safePathTitle}>
      <div className="visual-glow visual-glow-one" />
      <div className="visual-glow visual-glow-two" />

      <div className="visual-header">
        <span>{label || copy.safePathTitle}</span>
        <strong>{copy.pathTag}</strong>
      </div>

      <div className="visual-stage">
        <div className="visual-village-card">
          <div className="village-sun" />
          <div className="village-hills" />
          <div className="village-house house-one">
            <span />
          </div>
          <div className="village-house house-two">
            <span />
          </div>
          <div className="damage-marker">!</div>
          <div className="family-dots">
            <i /><i /><i />
          </div>
          <small>{copy.ruralStory}</small>
        </div>

        <div className="visual-phone">
          <div className="phone-speaker" />
          <div className="phone-chip"><Sparkles size={14} /> GharDisha AI</div>
          <div className="phone-card active">
            <span>{copy.caseFacts}</span>
            <strong>{copy.structured}</strong>
          </div>
          <div className="phone-card">
            <span>{copy.missingProof}</span>
            <strong>{copy.detected}</strong>
          </div>
          <div className="phone-scan" />
        </div>

        <div className="visual-bdo-card">
          <div className="bdo-building">
            <Building2 size={42} />
          </div>
          <strong>{copy.bdoTitle}</strong>
          <span>{copy.bdoBody}</span>
        </div>
      </div>

      <div className="visual-path">
        {visualSteps.map(({ icon: Icon, title, body }, index) => (
          <div className="visual-path-step" key={title}>
            <div className="path-node"><Icon size={18} /></div>
            <strong>{title}</strong>
            <span>{body}</span>
            {index < visualSteps.length - 1 && <ArrowRight size={18} className="path-arrow" />}
          </div>
        ))}
      </div>
    </div>
  );
}


function JudgeJourneyPanel({ language = 'en' }) {
  const copy = getDemoVisualCopy(language);
  const icons = [Waves, Sparkles, BookOpenCheck, ShieldCheck];
  const steps = copy.journeySteps.map((step, index) => ({ ...step, icon: icons[index] }));

  return (
    <section className="judge-journey" aria-label="GharDisha AI workflow">
      <div className="journey-title-row journey-title-row-single">
        <strong>{copy.journeyTitle}</strong>
      </div>
      <div className="journey-step-grid">
        {steps.map(({ icon: Icon, title, body }, index) => (
          <div className="journey-step" key={title}>
            <div className="journey-icon"><Icon size={22} /></div>
            <small>0{index + 1}</small>
            <strong>{title}</strong>
            <p>{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


function getStoryStarters(language) {
  const starters = {
    en: [
      {
        label: 'Flood damage',
        text: 'Our rural family home was damaged during flooding. We are staying temporarily with relatives and have Aadhaar, ration card, and bank account, but we do not know if our name is on Awaas+ or SECC.',
      },
      {
        label: 'Earthquake cracks',
        text: 'Our kutcha house developed deep cracks after an earthquake and land movement. The roof is unsafe, we are staying in a temporary shelter, and we have photos but no official damage certificate yet.',
      },
      {
        label: 'Missing land papers',
        text: 'Our house was damaged in a disaster. We do not own any pucca house, but our land papers are missing and we need to know what proof the Gram Panchayat or BDO office may ask for.',
      },
    ],
    hi: [
      {
        label: 'बाढ़ से नुकसान',
        text: 'हमारा ग्रामीण घर बाढ़ में क्षतिग्रस्त हो गया। हम अभी रिश्तेदारों के पास अस्थायी रूप से रह रहे हैं। हमारे पास Aadhaar, ration card और bank account है, लेकिन हमें नहीं पता कि नाम Awaas+ या SECC में है या नहीं।',
      },
      {
        label: 'भूकंप से दरारें',
        text: 'भूकंप और जमीन खिसकने के बाद हमारे कच्चे घर में गहरी दरारें आ गईं। छत सुरक्षित नहीं है, हम अस्थायी shelter में रह रहे हैं, और हमारे पास photos हैं लेकिन official damage certificate अभी नहीं है।',
      },
      {
        label: 'जमीन के कागज नहीं',
        text: 'आपदा में हमारा घर खराब हो गया। हमारे पास कोई पक्का घर नहीं है, लेकिन जमीन के कागज नहीं मिल रहे हैं। हमें जानना है कि Gram Panchayat या BDO office कौन सा proof माँग सकता है।',
      },
    ],
  };

  return starters[language] || starters.en;
}


function App() {
  const [step, setStep] = useState(() => getStored('gd_onboarded') === 'true' ? 'app' : 'splash');
  const [language, setLanguage] = useState(() => getStored('gd_language', 'en'));
  const [userName, setUserName] = useState(() => getStored('gd_user_name', ''));
  const [role, setRole] = useState(() => getStored('gd_role', 'family'));
  const [guideIndex, setGuideIndex] = useState(0);
  const [now, setNow] = useState(new Date());

  const [story, setStory] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [caseUpdatedWithFollowUp, setCaseUpdatedWithFollowUp] = useState(false);
  const [followUpInputOpen, setFollowUpInputOpen] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const copy = FLOW_COPY[language] || FLOW_COPY.en;
  const t = (key) => EXTRA_UI[language]?.[key] || tr(language, key);

  const appendTranscript = (text) =>
    setStory((prev) => (prev ? `${prev} ${text}` : text).replace(/\s+/g, ' ').trim());
  const voice = useVoiceInput(appendTranscript, language);
  const voiceSupported = ['en', 'hi', 'ta', 'mr'].includes(language);

  const caseFacts = useMemo(() => result?.case_json?.case_facts || {}, [result]);
  const action = result?.action_plan;
  const decisionSupport = supportCopy(language);
  const storyStarters = useMemo(() => getStoryStarters(language), [language]);
  const visualUi = getDemoVisualCopy(language);
  const readiness = useMemo(
    () => (action ? calculateCaseReadiness(caseFacts, action, language, caseUpdatedWithFollowUp) : null),
    [caseFacts, action, language, caseUpdatedWithFollowUp],
  );
  const followUpLimitReached = followUpCount >= MAX_FOLLOW_UPS;
  const canAskAnotherFollowUp = Boolean(action?.next_best_question) && !followUpLimitReached;

  const roleLabel = {
    family: copy.roleFamily,
    helper: copy.roleHelper,
    panchayat: copy.rolePanchayat,
    ngo: copy.roleNgo,
  }[role] || role;

  const dateTimeText = useMemo(() => {
    const locale = ({ en: 'en-IN', hi: 'hi-IN', as: 'as-IN', ta: 'ta-IN', mr: 'mr-IN' }[language]) || 'en-IN';
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(now);
  }, [language, now]);

  function beginApp() {
    setStored('gd_onboarded', 'true');
    setStored('gd_language', language);
    setStored('gd_user_name', userName || 'Priya');
    setStored('gd_role', role);
    setStep('app');
  }

  function resetGuide() {
    try {
      localStorage.removeItem('gd_onboarded');
    } catch { /* no-op */ }
    setResult(null);
    setErr('');
    setFollowUpAnswer('');
    setCaseUpdatedWithFollowUp(false);
    setFollowUpInputOpen(false);
    setFollowUpCount(0);
    setStep('splash');
  }

  function applyStoryStarter(text) {
    setStory(text);
    setErr('');
    setResult(null);
    setTimeout(() => document.getElementById('family-story-input')?.focus(), 80);
  }

  async function analyze() {
    const inputIssue = detectMainInputIssue(story, language);
    if (inputIssue) {
      setErr(inputIssue);
      setResult(null);
      return;
    }

    setLoading(true);
    setErr('');
    setResult(null);
    setFollowUpAnswer('');
    setCaseUpdatedWithFollowUp(false);
    setFollowUpInputOpen(false);
    setFollowUpCount(0);
    try {
      const form = new FormData();
      form.append('story', story);
      form.append('language', language);
      if (file) form.append('file', file);

      const res = await fetch(`${API_URL}/api/analyze-with-file`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = typeof data.detail === 'string' ? data.detail : 'Live backend/AI API error.';
        throw new Error(detail);
      }
      setResult(data);
      setTimeout(
        () => document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth' }),
        150,
      );
    } catch (e) {
      setErr(e.message || 'Could not complete live AI analysis. Check backend, API keys, and internet connection.');
    } finally {
      setLoading(false);
    }
  }

  async function submitFollowUpAnswer() {
    const answer = followUpAnswer.trim();
    if (!answer || !action?.next_best_question) return;

    const followUpIssue = detectFollowUpInputIssue(answer, action.next_best_question, language);
    if (followUpIssue) {
      setErr(followUpIssue);
      return;
    }

    const updatedStory = [
      story,
      '',
      'Follow-up question from GharDisha:',
      action.next_best_question,
      '',
      'Family/helper answer:',
      answer,
    ].join('\n');

    setLoading(true);
    setErr('');
    try {
      const form = new FormData();
      form.append('story', updatedStory);
      form.append('language', language);
      if (file) form.append('file', file);

      const res = await fetch(`${API_URL}/api/analyze-with-file`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const detail = typeof data.detail === 'string' ? data.detail : 'Live backend/AI API error.';
        throw new Error(detail);
      }

      setStory(updatedStory);
      setFollowUpAnswer('');
      setFollowUpCount((count) => count + 1);
      setCaseUpdatedWithFollowUp(true);
      setFollowUpInputOpen(false);
      setResult(data);
      setTimeout(
        () => document.getElementById('result-panel')?.scrollIntoView({ behavior: 'smooth' }),
        150,
      );
    } catch (e) {
      setErr(e.message || 'Could not update the case with the follow-up answer.');
    } finally {
      setLoading(false);
    }
  }

  if (step !== 'app') {
    return (
      <main className="onboarding redesigned-onboarding">
        <div className="background-orbs" aria-hidden="true"><span /><span /><span /></div>

        {step === 'splash' && (
          <section className="splash-screen">
            <div className="splash-copy">
              <div className="badge animate-pop"><Sparkles size={16} /> {copy.splashKicker}</div>
              <h1 className="splash-title">{copy.splashTitle}</h1>
              <p className="splash-pitch">{copy.splashPitch}</p>
              <button className="primary-btn big-btn" onClick={() => setStep('language')}>
                {copy.splashCta}<ArrowRight size={20} />
              </button>
              <span className="trust-note splash-trust"><ShieldCheck size={16} /> {copy.notOfficial}</span>
              <div className="splash-metrics" aria-label="GharDisha safety and workflow highlights">
                <div><strong>5</strong><span>languages</span></div>
                <div><strong>2-step</strong><span>follow-up limit</span></div>
                <div><strong>0</strong><span>approval claims</span></div>
              </div>
            </div>
            <ReliefIllustration label={copy.illustrationLabel} language={language} />
          </section>
        )}

        {step === 'language' && (
          <section className="wizard-screen">
            <GlassCard className="wizard-card language-card">
              <div className="wizard-icon"><Languages size={34} /></div>
              <h2>{copy.languageTitle}</h2>
              <p>{copy.languageSubtitle}</p>
              <div className="language-grid">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang.code}
                    className={`language-choice ${language === lang.code ? 'selected' : ''}`}
                    onClick={() => setLanguage(lang.code)}
                  >
                    <strong>{lang.native}</strong>
                    <span>{lang.label}</span>
                    <small>{lang.mode === 'voice' ? copy.voiceText : copy.textOutput}</small>
                  </button>
                ))}
              </div>
              <div className="wizard-actions">
                <button className="ghost-btn" onClick={() => setStep('splash')}><ChevronLeft size={18} />{copy.back}</button>
                <button className="primary-btn" onClick={() => setStep('identity')}>{copy.continue}<ChevronRight size={18} /></button>
              </div>
            </GlassCard>
          </section>
        )}

        {step === 'identity' && (
          <section className="wizard-screen">
            <GlassCard className="wizard-card identity-card">
              <div className="wizard-icon"><UserRound size={34} /></div>
              <h2>{copy.nameTitle}</h2>
              <p>{copy.nameSubtitle}</p>

              <label className="wizard-label">
                {copy.nameLabel}
                <input
                  className="name-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder={copy.namePlaceholder}
                />
              </label>

              <div className="role-options">
                {[
                  ['family', copy.roleFamily, Home],
                  ['helper', copy.roleHelper, HandHeart],
                  ['panchayat', copy.rolePanchayat, Landmark],
                  ['ngo', copy.roleNgo, UsersRound],
                ].map(([value, label, Icon]) => (
                  <button
                    key={value}
                    className={`role-card ${role === value ? 'selected' : ''}`}
                    onClick={() => setRole(value)}
                  >
                    <Icon size={22} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              <div className="wizard-actions">
                <button className="ghost-btn" onClick={() => setStep('language')}><ChevronLeft size={18} />{copy.back}</button>
                <button className="primary-btn" onClick={() => setStep('guide')}>{copy.continue}<ChevronRight size={18} /></button>
              </div>
            </GlassCard>
          </section>
        )}

        {step === 'guide' && (
          <section className="wizard-screen guide-wizard">
            <GlassCard className="wizard-card guide-main-card">
              <div className="guide-progress">
                {copy.cards.map((_, i) => <span key={i} className={i <= guideIndex ? 'active' : ''} />)}
              </div>
              <div className="wizard-icon"><ShieldCheck size={34} /></div>
              <h2>{copy.guideTitle}</h2>
              <p>{copy.guideSubtitle}</p>
              <div className="guide-slide">
                <h3>{copy.cards[guideIndex].title}</h3>
                <p>{copy.cards[guideIndex].body}</p>
              </div>

              {guideIndex === copy.cards.length - 1 && (
                <div className="trust-list">
                  {copy.trustPoints.map((point) => (
                    <div key={point}><CheckCircle2 size={18} /> <span>{point}</span></div>
                  ))}
                </div>
              )}

              <div className="wizard-actions">
                <button
                  className="ghost-btn"
                  onClick={() => guideIndex === 0 ? setStep('identity') : setGuideIndex((x) => x - 1)}
                >
                  <ChevronLeft size={18} />{copy.back}
                </button>
                {guideIndex < copy.cards.length - 1 ? (
                  <button className="primary-btn" onClick={() => setGuideIndex((x) => x + 1)}>
                    {copy.continue}<ChevronRight size={18} />
                  </button>
                ) : (
                  <button className="primary-btn" onClick={beginApp}>
                    {copy.startCase}<ArrowRight size={18} />
                  </button>
                )}
              </div>
            </GlassCard>
          </section>
        )}
      </main>
    );
  }

  return (
    <main className="app-shell cinematic-shell">
      <div className="background-orbs" aria-hidden="true"><span /><span /><span /></div>

      <header className="topbar premium-topbar">
        <div className="brand-lockup">
          <div className="logo-mark"><Home size={24} /></div>
          <div>
            <h1>GharDisha AI</h1>
            <p>{t('tagline')}</p>
          </div>
        </div>
        <div className="top-actions">
          {voice.available && voiceSupported
            ? <span className="voice-chip live"><Mic size={16} /> {t('voiceReady')}</span>
            : <span className="roadmap-chip">{t('textFileMode')}</span>}
          <button className="ghost-btn mini" onClick={resetGuide}><RotateCcw size={16} /> {copy.restart}</button>
        </div>
      </header>

      <section className="operator-strip">
  <div>
    <UserRound size={20} />
    <strong>{copy.profile}</strong>
    <span>{userName || 'Priya'}</span>
  </div>

  <div>
    <HandHeart size={20} />
    <strong>{copy.usingAs}</strong>
    <span title={roleLabel}>{roleLabel}</span>
  </div>

  <div>
    <CalendarClock size={20} />
    <strong>{copy.generatedOn}</strong>
    <span>{dateTimeText}</span>
  </div>

  <div>
    <ShieldCheck size={20} />
    <strong>{copy.safeNoticeTitle}</strong>
    <span title={copy.notOfficial}>{copy.notOfficial}</span>
  </div>
</section>

      <section className="official-boundary-ribbon" aria-label="Responsible AI boundary">
        <div>
          <ShieldCheck size={18} />
          <strong>{visualUi.ribbon.studentPrototype.title}</strong>
          <span>{visualUi.ribbon.studentPrototype.body}</span>
        </div>
        <div>
          <BookOpenCheck size={18} />
          <strong>{visualUi.ribbon.sourceGrounded.title}</strong>
          <span>{visualUi.ribbon.sourceGrounded.body}</span>
        </div>
        <div>
          <Landmark size={18} />
          <strong>{visualUi.ribbon.officialsDecide.title}</strong>
          <span>{visualUi.ribbon.officialsDecide.body}</span>
        </div>
      </section>

      <section className="trust-hero winning-hero action-hero">
        <div className="hero-copy-block">
          <Pill icon={Sparkles}>{t('panelPill')}</Pill>
          <h2>{t('inputTitle')}</h2>
          <p>{t('inputSubtitle')}</p>
          <div className="hero-proof-points" aria-label="Responsible AI proof points">
            {visualUi.proofPoints.map((point, index) => {
              const icons = [FileText, BookOpenCheck, ShieldCheck];
              const Icon = icons[index];
              return <span key={point}><Icon size={16} /> {point}</span>;
            })}
          </div>
          <div className="hero-mini-dashboard" aria-label="Product capabilities">
            {visualUi.capabilityCards.map((card) => (
              <div key={card.title}><strong>{card.title}</strong><span>{card.body}</span></div>
            ))}
          </div>
        </div>
      </section>


      <GlassCard id="input-panel" className="input-panel premium-input">
        <div className="panel-heading">
          <div>
            <h2>{t('familyStory')}</h2>
            <p>{t('inputSubtitle')}</p>
          </div>
          <div className="input-actions">
            {voice.available && voiceSupported && (
              <button
                type="button"
                className={`mic-btn ${voice.recording ? 'recording' : ''}`}
                onClick={voice.toggle}
                aria-label={voice.recording ? t('stop') : t('speak')}
              >
                {voice.recording ? <MicOff size={18} /> : <Mic size={18} />}
                {voice.recording ? t('stop') : t('speak')}
              </button>
            )}
          </div>
        </div>

        <div className="control-row">
          <label>
            {t('outputLanguage')}
            <select value={language} onChange={(e) => { setLanguage(e.target.value); setStored('gd_language', e.target.value); }}>
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                {lang.native === lang.label ? lang.label : `${lang.native} ${lang.label}`}
              </option>
              ))}
            </select>
          </label>
          <span className="lang-note">{t('langNote')}</span>
        </div>

        <div className="story-starter-panel" aria-label={visualUi.starterTitle}>
          <div className="starter-copy">
            <span>{visualUi.starterTitle}</span>
            <small>{visualUi.starterBody}</small>
          </div>
          <div className="story-starter-chips">
            {storyStarters.map((starter) => (
              <button
                key={starter.label}
                type="button"
                onClick={() => applyStoryStarter(starter.text)}
              >
                {starter.label}
              </button>
            ))}
          </div>
        </div>

        <label htmlFor="family-story-input">{t('familyStory')}</label>
        <textarea
          id="family-story-input"
          value={story}
          onChange={(e) => {
            setStory(e.target.value);
            if (err) setErr('');
          }}
          rows={8}
          placeholder={t('storyPlaceholder')}
        />

        <div className="file-upload">
          <div className="upload-icon">
            <UploadCloud size={24} />
          </div>

          <div className="upload-main">
            <strong>{t('uploadLabel')}</strong>
            <div className="upload-control">
              <input
                id="supporting-file-upload"
                className="file-input-hidden"
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.md,image/*,application/pdf,text/plain"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label className="file-pick-btn" htmlFor="supporting-file-upload">{t('chooseFile')}</label>
              <span className="selected-file-name">{file ? file.name : t('noFile')}</span>
            </div>
          </div>

          <div className="upload-help">
            <small>{t('uploadHint')}</small>
          </div>
        </div>

        {voice.recording && (
          <div className="voice-live">
            <span className="rec-dot" /> {voice.partial || t('listening')}
          </div>
        )}
        {voice.status && !voice.recording && <div className="voice-status">{voice.status}</div>}

        <div className="input-footer">
          <button className="primary-btn" onClick={analyze} disabled={loading || story.trim().length < 10}>
            {loading ? t('analyzing') : t('analyzeBtn')}<Sparkles size={18} />
          </button>
        </div>
        {loading && <div className="loading-card"><span className="spinner" />{t('loadingText')}</div>}
        {err && <div className="error-card">{err}</div>}
      </GlassCard>

      {result && action && (
        <section id="result-panel" className="results animate-in">
          <div className="result-heading">
            <div>
              <Pill icon={BadgeCheck}>{t('safeMode')}</Pill>
              <h2>{t('resultTitle')}</h2>
              <p>{t('resultSubtitle')}</p>
            </div>
            <button className="ghost-btn" onClick={() => window.print()}>{t('printBtn')}</button>
          </div>

          {result.uploaded_document && (
            <GlassCard className="document-card">
              <h3>{t('docProcessed')}</h3>
              <p><strong>{result.uploaded_document.filename}</strong> &mdash; {result.uploaded_document.method}</p>
            </GlassCard>
          )}

          <div className="results-grid">
            <GlassCard className="large-card">
              <h3>{t('caseFacts')}</h3>
              <CaseFact label={t('factDisaster')} value={caseFacts.disaster_displaced?.value} language={language} />
              <CaseFact label={t('factShelter')} value={caseFacts.current_shelter?.value} language={language} />
              <CaseFact label={t('factRural')} value={caseFacts.rural_context?.value} language={language} />
              <CaseFact label={t('factPucca')} value={caseFacts.owns_pucca_house?.value} language={language} />
              <CaseFact label={t('factAwaas')} value={caseFacts.awaas_or_secc_status?.value} language={language} />
              <div className="chips-block">
                <span>{t('docsAvailable')}</span>
                <div>{(caseFacts.documents_available || []).map((d) => <em key={d}>{d}</em>)}</div>
              </div>
            </GlassCard>

            <GlassCard className="highlight-card">
              <h3>{t('biggestObstacle')}</h3>
              <p className="big-text">{action.biggest_obstacle}</p>

              <div className="followup-box">
                {caseUpdatedWithFollowUp && !followUpInputOpen ? (
                  <div className="case-updated-box">
                    <div className="case-updated-title">
                      <CheckCircle2 size={18} />
                      <span>{decisionSupport.caseUpdatedTitle}</span>
                    </div>
                    <p>{decisionSupport.caseUpdatedBody}</p>

                    {followUpLimitReached ? (
                      <div className="followup-final-box">
                        <div className="case-updated-title">
                          <ShieldCheck size={18} />
                          <span>{decisionSupport.followUpLimitTitle}</span>
                        </div>
                        <p>{decisionSupport.followUpLimitBody}</p>
                      </div>
                    ) : (
                      <>
                        {action.next_best_question && (
                          <div className="remaining-question">
                            <small>{decisionSupport.nextRemainingQuestion}</small>
                            <p>{action.next_best_question}</p>
                          </div>
                        )}
                        {canAskAnotherFollowUp && (
                          <button
                            className="followup-btn followup-secondary-btn"
                            onClick={() => {
                              setFollowUpAnswer('');
                              setFollowUpInputOpen(true);
                            }}
                          >
                            {decisionSupport.answerNextQuestionBtn}
                            <ArrowRight size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    <small>{caseUpdatedWithFollowUp ? decisionSupport.nextRemainingQuestion : decisionSupport.familyQuestionTitle}</small>
                    <p className="followup-question">{action.next_best_question}</p>

                    <label className="followup-label">
                      {decisionSupport.answerQuestionLabel}
                      <textarea
                        className="followup-input"
                        value={followUpAnswer}
                        onChange={(e) => {
                          setFollowUpAnswer(e.target.value);
                          if (err) setErr('');
                        }}
                        rows={3}
                        placeholder={decisionSupport.answerQuestionPlaceholder}
                      />
                    </label>

                    <div className="followup-actions">
                      <button
                        className="followup-btn"
                        onClick={submitFollowUpAnswer}
                        disabled={loading || followUpAnswer.trim().length < 3}
                      >
                        {loading ? decisionSupport.updatingCaseBtn : decisionSupport.updateCaseBtn}
                        <ArrowRight size={16} />
                      </button>
                      <span className="followup-counter">
                        {decisionSupport.followUpCounter}: {Math.min(followUpCount + 1, MAX_FOLLOW_UPS)} / {MAX_FOLLOW_UPS}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </GlassCard>

            <GlassCard>
              <h3>{t('actionPlan')}</h3>
              <ol className="clean-list">{(action.next_48_hours || []).map((x, i) => <li key={i}>{x}</li>)}</ol>
            </GlassCard>

            <GlassCard>
              <h3>{t('bdoQuestions')}</h3>
              <ol className="clean-list">{(action.questions_for_bdo_or_panchayat || []).map((x, i) => <li key={i}>{x}</li>)}</ol>
            </GlassCard>
          </div>

          {readiness && (
            <GlassCard className={`readiness-card readiness-${readiness.stage}`}>
              <div className="readiness-heading">
                <div>
                  <Pill icon={BadgeCheck}>{decisionSupport.overallReadiness}</Pill>
                  <h3>{readiness.title}</h3>
                  <p>{readiness.subtitle}</p>
                </div>
                <div className="readiness-score">
                  <strong>{readiness.overall}%</strong>
                  <span>{readiness.bandLabel}</span>
                </div>
              </div>

              <div className="readiness-bars">
                {readiness.items.map((item) => (
                  <div className="readiness-row" key={item.key}>
                    <div className="readiness-row-top">
                      <span>{item.label}</span>
                      <strong>{item.score}%</strong>
                    </div>
                    <div className="readiness-track">
                      <div style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <p className="readiness-disclaimer">
                <ShieldCheck size={16} />
                {decisionSupport.readinessDisclaimer}
              </p>
              <p className="readiness-disclaimer shelter-safeguard">
                <Home size={16} />
                {decisionSupport.temporaryShelterSafeguard}
              </p>
            </GlassCard>
          )}

          <GlassCard className="summary-card printable">
            <h3>{t('summaryTitle')}</h3>
            <p className="status-line">{action.status}</p>
            <p>{action.plain_language_summary}</p>
            <h4>{t('missingItems')}</h4>
            <ul>{(action.missing_or_uncertain_items || []).map((x) => <li key={x}>{x}</li>)}</ul>
            <h4>{t('raiBoundary')}</h4>
            <p>{action.human_in_loop}</p>
          </GlassCard>

          <GlassCard className="sources-card">
            <h3>{t('sourcesTitle')}</h3>
            <div className="source-grid">
              {(action.sources_used || []).map((s) => (
                <div className="source-card" key={s.id || `${s.topic}-${s.source}`}>
                  <strong>{formatSourceTopic(s.topic, language)}</strong>
                  <span>{formatOfficialSourceLabel(language)}: {s.source}</span>
                  <small>
                    {s.date} • {t('confidence')}: {formatConfidenceValue(s.confidence, language)}
                  </small>
                </div>
              ))}
            </div>
          </GlassCard>
        </section>
      )}

      <footer>{t('footer')}</footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);