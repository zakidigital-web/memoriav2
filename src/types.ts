
export interface Alumni {
  id: string;
  name: string;
  ttl: string;
  message: string;
  photo: string;
  socialMedia: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  graduationYear: number;
  class: string;
}

export interface Teacher {
  id: string;
  name: string;
  position: string;
  message: string;
  photo: string;
  category: 'Pimpinan' | 'Guru Kelas' | 'Staf TU';
}

export interface Yearbook {
  id: string;
  year: number;
  title: string;
  coverImage: string;
  totalStudents: number;
  totalClasses: number;
  pages: string[];
  pdfUrl?: string;
  pageCount?: number | null;
  backgroundMusic?: string;
}

export const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'Drs. H. Ahmad Fauzi, M.Pd',
    position: 'Kepala Sekolah',
    message: 'Jadilah generasi yang tidak hanya cerdas secara intelektual, tetapi juga memiliki akhlak yang mulia. Masa depan bangsa ada di tangan kalian.',
    photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
    category: 'Pimpinan'
  },
  {
    id: '2',
    name: 'Siti Aminah, S.Pd',
    position: 'Wakil Kepala Kurikulum / Guru IPA',
    message: 'Ilmu itu seperti cahaya, ia akan menerangi jalanmu di saat gelap. Jangan pernah lelah untuk terus belajar dan mengukir prestasi.',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    category: 'Pimpinan'
  },
  {
    id: '3',
    name: 'Rizky Pratama, S.Kom',
    position: 'Guru TIK',
    message: 'Teknologi adalah alat, tapi kreativitas dan inovasi datang dari pikiran kalian. Gunakan teknologi untuk menciptakan hal-hal hebat.',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    category: 'Guru Kelas'
  }
];

export const mockYearbooks: Yearbook[] = [
  {
    id: '2024',
    year: 2024,
    title: 'Angkatan 2024',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    totalStudents: 128,
    totalClasses: 3,
    pages: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1532012197367-2836974a776c?auto=format&fit=crop&q=80&w=800'
    ]
  },
  {
    id: '2023',
    year: 2023,
    title: 'Angkatan 2023',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400',
    totalStudents: 115,
    totalClasses: 3,
    pages: []
  },
  {
    id: '2022',
    year: 2022,
    title: 'Angkatan 2022',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=400',
    totalStudents: 132,
    totalClasses: 4,
    pages: []
  }
];

export const mockAlumni: Alumni[] = [
  {
    id: 'a1',
    name: 'Budi Santoso',
    ttl: 'Jakarta, 12 Mei 2006',
    message: 'Pantang menyerah adalah kunci sukses. Terimakasih untuk semua kenangan indah di sekolah ini.',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    socialMedia: { instagram: '@budisnt' },
    graduationYear: 2024,
    class: 'XII IPA 1'
  },
  {
    id: 'a2',
    name: 'Santi Wijaya',
    ttl: 'Bandung, 3 Agustus 2006',
    message: 'Masa depan milik mereka yang percaya pada keindahan mimpi mereka.',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    socialMedia: { instagram: '@santi_wjy' },
    graduationYear: 2024,
    class: 'XII IPA 1'
  }
];
