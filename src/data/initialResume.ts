import { ResumeData } from '../types/resume';

export const initialResumeData: ResumeData = {
  header: {
    fullName: 'Anshul Singh Chauhan',
    cohortOrDegree: 'MBA 2025-2027',
    instituteName: 'IIM BODH GAYA',
    instituteSubtext: 'विद्यया विन्दतेऽमृतम्',
    showEmblem: true,
    address: 'Indian Institute of Management Bodh Gaya, Bihar',
    phone: '+91 9140775332',
    email: 'anshulsc2027i@iimbg.ac.in',
  },
  settings: {
    fontFamily: 'serif',
    fontSize: 'compact',
    spacingDensity: 'compact',
    showBorders: true,
    borderStyle: 'all',
    accentColor: '#1e293b',
    leftColWidth: 15,
    dateColWidth: 12,
    educationColWidths: [12, 60, 14, 14],
  },
  sections: [
    {
      id: 'sec-internships',
      title: 'INTERNSHIPS',
      type: 'internships',
      badgeText: '5 months',
      visible: true,
      entries: [
        {
          id: 'ent-int-1',
          organization: 'Niranjana River Recharge Mission',
          roleOrTitle: 'Social Intern',
          dateOrYear: "Mar'24 – Apr'24",
          subtitle: 'Roles and\nResponsibilities',
          bullets: [
            {
              id: 'b-int-1-1',
              text: 'Led diagnostics by surveying 150+ villagers across 5 villages to quantify water access and supply gap.',
            },
            {
              id: 'b-int-1-2',
              text: 'Spearheaded stakeholder alignment via 30+ member Gram Sabha to build consensus on project design.',
            },
            {
              id: 'b-int-1-3',
              text: 'Investigated rural water inequity by designing surveys and applying statistical tools on Excel and Python.',
            },
            {
              id: 'b-int-1-4',
              text: 'Applied policy communication frameworks to translate ground insight into an elaborative project narrative.',
            },
          ],
        },
        {
          id: 'ent-int-2',
          organization: 'Rancho Labs',
          roleOrTitle: 'Business Development Intern',
          dateOrYear: "Apr'26 – Jun'26",
          subtitle: 'Roles and\nResponsibilities',
          bullets: [
            {
              id: 'b-int-2-1',
              text: 'Generated a total of ₹5 Lakh+ direct revenue by converting 57 premium B2C leads at an 8.5% rate.',
            },
            {
              id: 'b-int-2-2',
              text: 'Managed 650+ inbound leads via TeleCRM, optimizing follow-ups to maximize sales funnel efficiency.',
            },
            {
              id: 'b-int-2-3',
              text: 'Delivered highly customized consultative sales pitches to close high-ticket STEM program enrolments.',
            },
            {
              id: 'b-int-2-4',
              text: 'Boosted team sales through lead analysis, targeted WhatsApp broadcasts, and inventory management.',
            },
            {
              id: 'b-int-2-5',
              text: 'Awarded "Best Team Player" for cross-functional collaboration and consistently exceeding sales KPIs.',
            },
          ],
        },
      ],
    },
    {
      id: 'sec-education',
      title: 'EDUCATION',
      type: 'education',
      visible: true,
      entries: [
        {
          id: 'ent-edu-1',
          degree: 'M.B.A.',
          institution: 'Indian Institute of Management, Bodh Gaya',
          score: '73.7 %',
          dateOrYear: '2027',
          bullets: [],
        },
        {
          id: 'ent-edu-2',
          degree: 'B.B.A.',
          institution: 'Indian Institute of Management, Bodh Gaya',
          score: '70.6 %',
          dateOrYear: '2025',
          bullets: [],
        },
        {
          id: 'ent-edu-3',
          degree: '12TH',
          institution: 'Sanskar International School, Prayagraj',
          score: '74 %',
          dateOrYear: '2020',
          bullets: [],
        },
        {
          id: 'ent-edu-4',
          degree: '10TH',
          institution: 'St. Joseph’s College, Prayagraj',
          score: '85 %',
          dateOrYear: '2018',
          bullets: [],
        },
      ],
    },
    {
      id: 'sec-por',
      title: 'POSITION OF RESPONSIBILITY',
      type: 'por',
      visible: true,
      entries: [
        {
          id: 'ent-por-1',
          category: 'Sports\nCommittee',
          organization: 'Sports Committee',
          dateOrYear: '2025',
          bullets: [
            {
              id: 'b-por-1-1',
              text: 'Spearheaded sports operations for 50+ Executive MBA participants; functioned as Volleyball POC and delivered comprehensive event branding, creatives and communication materials for major Sports Committee events. Planned and executed large-scale event logistics, stakeholder coordination and efficient on-ground management for Clash of Clans involving 500+ attendees.',
            },
          ],
        },
      ],
    },
    {
      id: 'sec-academic',
      title: 'ACADEMIC ACHIEVEMENTS',
      type: 'academic_achievements',
      visible: true,
      entries: [
        {
          id: 'ent-acad-1',
          category: 'Research Papers',
          dateOrYear: '2024',
          bullets: [
            {
              id: 'b-acad-1-1',
              text: 'Presented the paper "Impact of Mindfulness on the Modern Workplace" at the 2nd IRCM 2024, organized by IIM Bodh Gaya; subsequently published in the Scopus-indexed book “Comparative Analysis of the Digital Consciousness and Human Consciousness”.',
            },
          ],
        },
        {
          id: 'ent-acad-2',
          category: 'Live Project',
          dateOrYear: '2025',
          bullets: [
            {
              id: 'b-acad-2-1',
              text: 'Design and strategize implementation of AI-based wellness tracker for healthcare platform.',
            },
            {
              id: 'b-acad-2-2',
              text: 'Applied predictive analytics to improve outcomes and personalize healthcare experience.',
            },
            {
              id: 'b-acad-2-3',
              text: 'Received a Letter of Recommendation for top 50% performance in Product Management.',
            },
          ],
        },
      ],
    },
    {
      id: 'sec-extracurricular',
      title: 'EXTRACURRICULAR ACTIVITIES',
      type: 'extracurricular',
      visible: true,
      entries: [
        {
          id: 'ent-extra-1',
          category: 'Competitions',
          dateOrYear: '2024',
          bullets: [
            {
              id: 'b-extra-1-1',
              text: '3rd position among 400+ participants in Quizzilla, National-Level quiz competition by IIM BG',
              year: '2024',
            },
          ],
        },
        {
          id: 'ent-extra-2',
          category: 'Badminton',
          dateOrYear: '2025 / 2024',
          bullets: [
            {
              id: 'b-extra-2-1',
              text: '1st position in Men’s Doubles Badminton at Sangram1.0 sports tournament, IIM Bodhgaya.',
              year: '2025',
            },
            {
              id: 'b-extra-2-2',
              text: '1st position in Men’s Doubles Badminton at Inter-IIM Sports Tournament, IIM Bodhgaya.',
              year: '2024',
            },
          ],
        },
        {
          id: 'ent-extra-3',
          category: 'Football',
          dateOrYear: '2024 / 2023',
          bullets: [
            {
              id: 'b-extra-3-1',
              text: 'Secured 2nd position in Football at Elegante 7.0 annual sports tournament, IIM Bodhgaya.',
              year: '2024',
            },
            {
              id: 'b-extra-3-2',
              text: 'Achieved 1st position in Football at Elegante 6.0 annual sports tournament, IIM Bodhgaya.',
              year: '2023',
            },
          ],
        },
      ],
    },
    {
      id: 'sec-certifications',
      title: 'CERTIFICATIONS',
      type: 'certifications',
      visible: true,
      entries: [
        {
          id: 'ent-cert-1',
          category: 'Operations',
          dateOrYear: '2025',
          bullets: [
            {
              id: 'b-cert-1',
              text: 'Successfully completed Certified Product Manager certification from Phoenix Markacademy.',
            },
          ],
        },
        {
          id: 'ent-cert-2',
          category: 'Marketing',
          dateOrYear: '2025',
          bullets: [
            {
              id: 'b-cert-2',
              text: 'Completed course on social media marketing focused on content strategy, & engagement.',
            },
          ],
        },
        {
          id: 'ent-cert-3',
          category: 'Data Analytics',
          dateOrYear: '2025',
          bullets: [
            {
              id: 'b-cert-3',
              text: 'Acquired certification in Google Data Analytics covering data cleaning, analysis, visualization.',
            },
          ],
        },
        {
          id: 'ent-cert-4',
          category: 'R Programming',
          dateOrYear: '2025',
          bullets: [
            {
              id: 'b-cert-4',
              text: 'Attained certification in R Programming for statistical analysis and data visualization using R.',
            },
          ],
        },
        {
          id: 'ent-cert-5',
          category: 'Tableau',
          dateOrYear: '2025',
          bullets: [
            {
              id: 'b-cert-5',
              text: 'Obtained Tableau certification in data visualization and communication through dashboards.',
            },
          ],
        },
        {
          id: 'ent-cert-6',
          category: 'Excel',
          dateOrYear: '2022',
          bullets: [
            {
              id: 'b-cert-6',
              text: 'Completed Udemy course focused on advanced Excel functions for data analysis & reporting.',
            },
          ],
        },
      ],
    },
    {
      id: 'sec-interests',
      title: 'OTHER INTERESTS',
      type: 'other_interests',
      visible: true,
      entries: [
        {
          id: 'ent-interest-1',
          category: 'Hobbies',
          isInlineList: true,
          inlineItems: ['Badminton', 'Volleyball', 'Football'],
          bullets: [],
        },
      ],
    },
  ],
};
