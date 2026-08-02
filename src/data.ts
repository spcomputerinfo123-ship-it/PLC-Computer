import { Course, Feature } from "./types";

export const coursesData: Course[] = [
  {
    id: "c1",
    title: "រដ្ឋបាលកុំព្យូទ័រទូទៅ",
    title_en: "General Computer Administration",
    description: "សិក្សាពីមូលដ្ឋានគ្រឹះនៃកុំព្យូទ័រ និងកម្មវិធីរដ្ឋបាលដូចជា Microsoft Word, Excel, និង PowerPoint សម្រាប់ការងារការិយាល័យ។",
    description_en: "Learn computer basics and administration programs like Microsoft Word, Excel, and PowerPoint for office work.",
    icon: "MonitorPlay",
    duration: "៣ ខែ",
    duration_en: "3 Months",
    price: "$50",
    price_en: "$50",
    imageUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "c2",
    title: "រចនាគេហទំព័រ (Web Design)",
    title_en: "Web Design",
    description: "រៀនពីរបៀបបង្កើតគេហទំព័រប្រកបដោយភាពច្នៃប្រឌិតដោយប្រើប្រាស់ HTML, CSS, JavaScript និង Tailwind CSS។",
    description_en: "Learn how to creatively build websites using HTML, CSS, JavaScript, and Tailwind CSS.",
    icon: "Layout",
    duration: "៤ ខែ",
    duration_en: "4 Months",
    price: "$70",
    price_en: "$70",
    imageUrl: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "c3",
    title: "ក្រាហ្វិកឌីហ្សាញ (Graphic Design)",
    title_en: "Graphic Design",
    description: "ក្លាយជាអ្នករចនាក្រាហ្វិកអាជីពជាមួយនឹងការប្រើប្រាស់កម្មវិធី Adobe Photoshop និង Illustrator កម្រិតខ្ពស់។",
    description_en: "Become a professional graphic designer by using advanced Adobe Photoshop and Illustrator.",
    icon: "Palette",
    duration: "៣ ខែ",
    duration_en: "3 Months",
    price: "$50",
    price_en: "$50",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "c4",
    title: "បណ្តាញ និងជួសជុលកុំព្យូទ័រ",
    title_en: "IT & Networking",
    description: "សិក្សាពីការដំឡើងប្រព័ន្ធប្រតិបត្តិការ ការជួសជុលកុំព្យូទ័រ និងការរៀបចំបណ្តាញ Network សម្រាប់ក្រុមហ៊ុន។",
    description_en: "Learn operating system installation, computer repair, and corporate network setup.",
    icon: "Server",
    duration: "៤ ខែ",
    duration_en: "4 Months",
    price: "$70",
    price_en: "$70",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "c5",
    title: "អភិវឌ្ឍន៍កម្មវិធីទូរស័ព្ទ (Mobile App Dev)",
    title_en: "Mobile App Development",
    description: "រៀនបង្កើតកម្មវិធីទូរស័ព្ទ iOS និង Android ដោយប្រើ React Native និង Flutter ប្រកបដោយប្រសិទ្ធភាព។",
    description_en: "Learn to build iOS and Android mobile apps using React Native and Flutter effectively.",
    icon: "Smartphone",
    duration: "៥ ខែ",
    duration_en: "5 Months",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "c6",
    title: "គ្រប់គ្រងទិន្នន័យ (Database Admin)",
    title_en: "Database Administration",
    description: "សិក្សាពីការគ្រប់គ្រង និងការរចនាមូលដ្ឋានទិន្នន័យ SQL និង NoSQL ដើម្បីសុវត្ថិភាព និងល្បឿនប្រតិបត្តិការ។",
    description_en: "Study the management and design of SQL and NoSQL databases for security and performance.",
    icon: "Database",
    duration: "៣ ខែ",
    duration_en: "3 Months",
    price: "$50",
    price_en: "$50",
    imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "c7",
    title: "ទីផ្សារឌីជីថល (Digital Marketing)",
    title_en: "Digital Marketing",
    description: "យុទ្ធសាស្ត្រទីផ្សារអនឡាញ ការគ្រប់គ្រងបណ្តាញសង្គម និងការបង្កើតមាតិកាដែលទាក់ទាញអតិថិជន។",
    description_en: "Online marketing strategies, social media management, and creating engaging content.",
    icon: "Megaphone",
    duration: "៣ ខែ",
    duration_en: "3 Months",
    price: "$50",
    price_en: "$50",
    imageUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "c8",
    title: "វិភាគទិន្នន័យ (Data Analysis)",
    title_en: "Data Analysis",
    description: "សិក្សាពីការវិភាគទិន្នន័យជាមួយ Python, Excel កម្រិតខ្ពស់ និង Power BI ដើម្បីធ្វើការសម្រេចចិត្តអាជីវកម្ម។",
    description_en: "Learn data analysis with Python, advanced Excel, and Power BI for business decisions.",
    icon: "PieChart",
    duration: "៤ ខែ",
    duration_en: "4 Months",
    price: "$70",
    price_en: "$70",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
  }
];

export const featuresData: Feature[] = [
  {
    id: "f1",
    title: "សាស្ត្រាចារ្យមានបទពិសោធន៍",
    title_en: "Experienced Instructors",
    description: "បង្រៀនដោយសាស្ត្រាចារ្យដែលមានបទពិសោធន៍ការងារជាក់ស្តែងជាច្រើនឆ្នាំ។",
    description_en: "Taught by instructors with many years of practical work experience.",
    icon: "GraduationCap"
  },
  {
    id: "f2",
    title: "បន្ទប់សិក្សាទំនើប",
    title_en: "Modern Classrooms",
    description: "បំពាក់ដោយកុំព្យូទ័រជំនាន់ថ្មី និងម៉ាស៊ីនត្រជាក់ ដើម្បីផ្តល់ផាសុកភាពក្នុងការសិក្សា។",
    description_en: "Equipped with new generation computers and air conditioning to provide learning comfort.",
    icon: "Monitor"
  },
  {
    id: "f3",
    title: "អនុវត្តជាក់ស្តែង ១០០%",
    title_en: "100% Practical",
    description: "ផ្តោតសំខាន់លើការអនុវត្តជាក់ស្តែងដើម្បីធានាថាសិស្សអាចធ្វើការងារបានពិតប្រាកដ។",
    description_en: "Focused heavily on practical application to ensure students can do actual work.",
    icon: "Wrench"
  },
  {
    id: "f4",
    title: "វិញ្ញាបនបត្រទទួលស្គាល់",
    title_en: "Recognized Certificate",
    description: "ផ្តល់ជូនវិញ្ញាបនបត្របញ្ជាក់ការសិក្សាដែលមានការទទួលស្គាល់ត្រឹមត្រូវពេលបញ្ចប់វគ្គ។",
    description_en: "Provide a properly recognized study certificate upon course completion.",
    icon: "Award"
  },
  {
    id: "f5",
    title: "កាលវិភាគបត់បែនបាន",
    title_en: "Flexible Schedules",
    description: "ជ្រើសរើសម៉ោងសិក្សាដែលស័ក្តិសមជាមួយពេលវេលារបស់អ្នក ទាំងពេលថ្ងៃនិងពេលល្ងាច។",
    description_en: "Choose study hours that fit your schedule, both daytime and evening options.",
    icon: "Clock"
  },
  {
    id: "f6",
    title: "តម្លៃសមរម្យ",
    title_en: "Affordable Tuition",
    description: "តម្លៃសិក្សាសមរម្យ គុណភាពល្អ និងមានអាហារូបករណ៍សម្រាប់សិស្សឆ្នើម។",
    description_en: "Affordable tuition with good quality and scholarships available for outstanding students.",
    icon: "Tag"
  },
  {
    id: "f7",
    title: "ជំនួយស្វែងរកការងារ",
    title_en: "Job Placement Support",
    description: "ជួយសិស្សក្នុងការរៀបចំប្រវត្តិរូបសង្ខេប (CV) និងភ្ជាប់ទំនាក់ទំនងជាមួយក្រុមហ៊ុននានា។",
    description_en: "Assist students with resume (CV) preparation and networking with various companies.",
    icon: "Briefcase"
  },
  {
    id: "f8",
    title: "ឯកសារមេរៀនសំបូរបែប",
    title_en: "Rich Learning Materials",
    description: "សិស្សនឹងទទួលបានឯកសារមេរៀន វីដេអូ និងកូដគំរូសម្រាប់សិក្សាបន្ថែមនៅផ្ទះ។",
    description_en: "Students will receive learning materials, videos, and sample codes for further study at home.",
    icon: "BookOpen"
  }
];

export const newsData = [
  {
    id: "n1",
    title: "ពិធីប្រគល់វិញ្ញាបនបត្រជូនសិស្សជាន់ទី ១៥",
    title_en: "Certificate Awarding Ceremony for Cohort 15",
    description: "សាលាភីអិលស៊ី បានរៀបចំពិធីប្រគល់វិញ្ញាបនបត្រជូនសិស្សដែលបានបញ្ចប់ការសិក្សាដោយជោគជ័យ។",
    description_en: "PLC Computer organized a certificate awarding ceremony for students who successfully graduated.",
    date: "១៥ តុលា ២០២៣",
    imageUrl: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "n2",
    title: "បើកវគ្គថ្មីសម្រាប់ខែវិច្ឆិកា ការបញ្ចុះតម្លៃពិសេស",
    title_en: "New Classes Opening in November with Special Discounts",
    description: "ចុះឈ្មោះថ្ងៃនេះដើម្បីទទួលបានការបញ្ចុះតម្លៃ ២០% លើគ្រប់វគ្គសិក្សាទាំងអស់។",
    description_en: "Register today to get a 20% discount on all our training courses.",
    date: "០១ វិច្ឆិកា ២០២៣",
    imageUrl: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "n3",
    title: "សិក្ខាសាលាស្ដីពីបច្ចេកវិទ្យា AI ក្នុងវិស័យអប់រំ",
    title_en: "Workshop on AI Technology in Education",
    description: "ចូលរួមដោយសេរីក្នុងសិក្ខាសាលាដើម្បីស្វែងយល់ពីរបៀបប្រើប្រាស់ AI ក្នុងការសិក្សា។",
    description_en: "Join our free workshop to understand how to leverage AI tools in modern education.",
    date: "១២ ធ្នូ ២០២៣",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "n4",
    title: "ដំណើរកម្សាន្តប្រចាំឆ្នាំរបស់សិស្សានុសិស្ស",
    title_en: "Annual Student Trip",
    description: "សាលាបានរៀបចំដំណើរកម្សាន្តទៅកាន់ខេត្តសៀមរាប ដើម្បីផ្តល់ឱកាសរឹតចំណងមិត្តភាព។",
    description_en: "The school organized a trip to Siem Reap to provide an opportunity to strengthen friendships.",
    date: "២៥ ធ្នូ ២០២៣",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "n5",
    title: "ការប្រកួតប្រជែងសរសេរកូដ (Coding Competition)",
    title_en: "Coding Competition Event",
    description: "សិស្សឆ្នើមនឹងចូលរួមប្រកួតប្រជែងដើម្បីដណ្តើមពានរង្វាន់ប្រចាំឆ្នាំ។",
    description_en: "Outstanding students will compete to win the annual championship trophy.",
    date: "១០ មករា ២០២៤",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "n6",
    title: "កម្មវិធីបរិច្ចាគឈាមសប្បុរសធម៌",
    title_en: "Charity Blood Donation Event",
    description: "សូមអញ្ជើញចូលរួមបរិច្ចាគឈាមដើម្បីជួយសង្គ្រោះជីវិតជនរងគ្រោះ ដែលត្រូវការឈាមជាចាំបាច់។",
    description_en: "Please join the blood donation event to help save the lives of victims in need.",
    date: "១៤ កុម្ភៈ ២០២៤",
    imageUrl: "https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "n7",
    title: "អាហារូបករណ៍សិស្សឆ្នើមប្រចាំឆ្នាំ",
    title_en: "Annual Outstanding Student Scholarships",
    description: "PLC ផ្តល់ជូនអាហារូបករណ៍ ១០០% ដល់សិស្សពូកែដែលមានចំណាត់ថ្នាក់ល្អចំនួន ៥ នាក់។",
    description_en: "PLC offers 100% scholarships to 5 outstanding students with top academic performance.",
    date: "១០ មីនា ២០២៤",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "n8",
    title: "ទស្សនកិច្ចសិក្សានៅក្រុមហ៊ុនបច្ចេកវិទ្យា",
    title_en: "Study Tour to Tech Companies",
    description: "សិស្សផ្នែកបណ្តាញ និងរចនាគេហទំព័រ បានចុះកម្មវត្ថុទស្សនកិច្ចផ្ទាល់នៅក្រុមហ៊ុនធំៗក្នុងរាជធានី។",
    description_en: "Networking and web design students conducted a field study tour at major companies in the capital.",
    date: "០៥ មេសា ២០២៤",
    imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=600&q=80"
  }
];

export const galleryData = [
  "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=600&q=80"
];

export const faqData = [
  { question: 'តើវគ្គសិក្សាមួយមានរយៈពេលប៉ុន្មាន?', question_en: 'How long is a course?', answer: 'រយៈពេលសិក្សាអាស្រ័យលើវគ្គនីមួយៗ ជាទូទៅមានចាប់ពី ៣ ខែ ទៅ ៤ ខែ។', answer_en: 'Course duration depends on each course, generally ranging from 3 to 4 months.' },
  { question: 'តើមានការបញ្ចុះតម្លៃសម្រាប់សិស្សដែរឬទេ?', question_en: 'Is there any discount for students?', answer: 'យើងមានការបញ្ចុះតម្លៃពិសេសសម្រាប់សិស្ស និស្សិត និងចុះឈ្មោះជាក្រុម។', answer_en: 'We have special discounts for students and group registrations.' },
  { question: 'តើមានផ្តល់វិញ្ញាបនបត្រពេលរៀនចប់ទេ?', question_en: 'Do you provide a certificate upon completion?', answer: 'បាទ/ចាស យើងនឹងផ្តល់វិញ្ញាបនបត្រដែលមានការទទួលស្គាល់បន្ទាប់ពីបញ្ចប់វគ្គសិក្សាដោយជោគជ័យ។', answer_en: 'Yes, we provide a recognized certificate after successfully completing the course.' },
  { question: 'តើខ្ញុំអាចចុះឈ្មោះចូលរៀនដោយរបៀបណា?', question_en: 'How can I register?', answer: 'លោកអ្នកអាចចុះឈ្មោះតាមរយៈទម្រង់អនឡាញ ទូរស័ព្ទ ឬអញ្ជើញមកកាន់មជ្ឈមណ្ឌលផ្ទាល់។', answer_en: 'You can register via the online form, phone, or visit the center directly.' },
  { question: 'តើមានអាហារូបករណ៍សម្រាប់សិស្សក្រីក្រដែរឬទេ?', question_en: 'Are there scholarships for poor students?', answer: 'បាទ/ចាស យើងមានកម្មវិធីអាហារូបករណ៍រហូតដល់ ៥០% សម្រាប់សិស្សដែលមានជីវភាពខ្វះខាត និងមានលទ្ធផលសិក្សាល្អ។', answer_en: 'Yes, we have scholarship programs up to 50% for students in need with good academic results.' },
  { question: 'តើសិស្សអាចរៀនសងវិញបានទេ ប្រសិនបើអវត្តមាន?', question_en: 'Can students take makeup classes if absent?', answer: 'សិស្សអាចទាក់ទងការិយាល័យសិក្សាដើម្បីរៀបចំម៉ោងរៀនសងវិញ ក្នុងករណីមានច្បាប់អនុញ្ញាតត្រឹមត្រូវ។', answer_en: 'Students can contact the academic office to arrange makeup classes in case of authorized leave.' },
  { question: 'តើត្រូវមានមូលដ្ឋានគ្រឹះកុំព្យូទ័រមុនចូលរៀនដែរឬទេ?', question_en: 'Do I need computer basics before enrolling?', answer: 'មិនចាំបាច់ទេ យើងមានវគ្គសិក្សាពីកម្រិតដំបូងរហូតដល់កម្រិតខ្ពស់សម្រាប់គ្រប់គ្នា។', answer_en: 'Not necessarily, we have courses from beginner to advanced levels for everyone.' },
  { question: 'តើការបង់ប្រាក់អាចធ្វើឡើងជាដំណាក់កាលបានទេ?', question_en: 'Can payments be made in installments?', answer: 'សិស្សអាចបង់ប្រាក់ជាពីរ ឬបីដំណាក់កាល អាស្រ័យលើការព្រមព្រៀងជាមួយការិយាល័យ។', answer_en: 'Students can pay in two or three installments depending on the agreement with the office.' }
];
