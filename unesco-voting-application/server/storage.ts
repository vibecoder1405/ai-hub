import { 
  heritageSites, 
  votes,
  type HeritageSite as SchemaHeritageSite, 
  type InsertHeritageSite, 
  type Vote, 
  type InsertVote,
  type Matchup
} from "@shared/schema";

// Modified HeritageSite type to ensure rank is properly typed as optional
export type HeritageSite = Omit<SchemaHeritageSite, 'rank'> & {
  rank?: number | undefined;
};

// Interface definition for storage operations
export interface IStorage {
  // Heritage Sites operations
  getAllHeritageSites(): Promise<HeritageSite[]>;
  getHeritageSiteById(id: number): Promise<HeritageSite | undefined>;
  getHeritageSitesByCategory(category: string): Promise<HeritageSite[]>;
  createHeritageSite(site: InsertHeritageSite): Promise<HeritageSite>;
  updateHeritageSite(id: number, data: Partial<HeritageSite>): Promise<HeritageSite | undefined>;
  updateRankings(): Promise<void>;
  
  // Voting operations
  getRandomMatchup(): Promise<Matchup>;
  recordVote(vote: InsertVote): Promise<Vote>;
  getRecentVotes(limit: number): Promise<Vote[]>;
  
  // Stats operations
  getTotalVoteCount(): Promise<number>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private sites: Map<number, HeritageSite>;
  private voteHistory: Vote[];
  private currentId: number;
  private voteId: number;
  private matchupId: number;

  constructor() {
    this.sites = new Map();
    this.voteHistory = [];
    this.currentId = 1;
    this.voteId = 1;
    this.matchupId = 1;
    
    // Initialize with UNESCO World Heritage Sites in India
    this.initializeHeritageSites();
  }

  private initializeHeritageSites() {
    const sites: InsertHeritageSite[] = [
      {
        name: "Taj Mahal",
        description: "An immense mausoleum of white marble, built between 1631 and 1648 by order of the Mughal emperor Shah Jahan in memory of his favorite wife.",
        location: "Agra",
        state: "Uttar Pradesh",
        inscribedYear: 1983,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/The_Taj_Mahal_main_building.jpg/1600px-The_Taj_Mahal_main_building.jpg",
      },
      {
        name: "Agra Fort",
        description: "The Agra Fort is a UNESCO World Heritage site located in Agra, India. The fort is also known as Lal Qila, Fort Rouge and Red Fort of Agra. It is about 2.5 km northwest of its much more famous sister monument, the Taj Mahal.",
        location: "Agra",
        state: "Uttar Pradesh",
        inscribedYear: 1983,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/71/Uttar-Pradesh-Agra-Agra-Fort-Jahangiri-mahal-Apr-2004-00.JPG",
      },
      {
        name: "Khajuraho Temples",
        description: "The temples at Khajuraho were built during the Chandella dynasty, which reached its apogee between 950 and 1050. Today only 20 temples remain; they fall into three distinct groups and belong to two religions – Hinduism and Jainism.",
        location: "Chhatarpur",
        state: "Madhya Pradesh",
        inscribedYear: 1986,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/92/Lakshmana_Temple_24.jpg",
      },
      {
        name: "Red Fort Complex",
        description: "The Red Fort Complex was built as the palace fort of Shahjahanabad, the new capital of the fifth Mughal Emperor Shah Jahan. Named for its massive enclosing walls of red sandstone, it is adjacent to the older Salimgarh Fort.",
        location: "Delhi",
        state: "Delhi",
        inscribedYear: 2007,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Red_Fort_in_Delhi_03-2016_img1.jpg",
      },
      {
        name: "Qutub Minar",
        description: "The 73-meter tall tower built in 1193 by Qutab-ud-din Aibak immediately after the defeat of Delhi's last Hindu kingdom. The tower tapers from a 15 m diameter base to just 2.5 m at the top.",
        location: "Delhi",
        state: "Delhi",
        inscribedYear: 1993,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Qutab_Minar_mausoleum.jpg",
      },
      {
        name: "Ellora Caves",
        description: "The Ellora Caves are an archaeological area with more than 100 caves, of which only 34 are open to the public. The caves were built between the 5th and 10th centuries by various Buddhist, Jain, and Hindu dynasties.",
        location: "Aurangabad",
        state: "Maharashtra",
        inscribedYear: 1983,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/88/Kailasa_temple_overview%2C_Ellora.jpg",
      },
      {
        name: "Ajanta Caves",
        description: "The Ajanta Caves are approximately 30 rock-cut Buddhist cave monuments dating from the 2nd century BCE to about 480 CE in the Aurangabad district of Maharashtra state.",
        location: "Aurangabad",
        state: "Maharashtra",
        inscribedYear: 1983,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Cave_26%2C_Ajanta.jpg",
      },
      {
        name: "Humayun's Tomb",
        description: "This tomb, built in 1570, is of particular cultural significance as it was the first garden-tomb on the Indian subcontinent. It inspired several major architectural innovations, culminating in the construction of the Taj Mahal.",
        location: "Delhi",
        state: "Delhi",
        inscribedYear: 1993,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Humayun%27s_tomb_by_Shagil_Kannur_4.jpg",
      },
      {
        name: "Kaziranga National Park",
        description: "In the heart of Assam, this park is one of the last areas in eastern India undisturbed by a human presence. It is inhabited by the world's largest population of one-horned rhinoceroses, as well as many mammals, including tigers, elephants, panthers and bears, and thousands of birds.",
        location: "Golaghat & Nagaon",
        state: "Assam",
        inscribedYear: 1985,
        category: "NATURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Beauty_of_Kaziranga_National_Park.jpg",
      },
      {
        name: "Sundarbans National Park",
        description: "The Sundarbans contains the world's largest mangrove forests and one of the most biologically productive of all natural ecosystems. It is also home to a variety of bird, reptile and invertebrate species, including the salt-water crocodile.",
        location: "South 24 Parganas",
        state: "West Bengal",
        inscribedYear: 1987,
        category: "NATURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Sundarban_Tiger.jpg",
      },
      {
        name: "Mountain Railways of India",
        description: "This site includes three railways: the Darjeeling Himalayan Railway, the Nilgiri Mountain Railway and the Kalka Shimla Railway. The sites are examples of innovative transportation systems built through difficult terrain, which had great influence on the social and economic development of their regions.",
        location: "Various",
        state: "West Bengal, Tamil Nadu, Himachal Pradesh",
        inscribedYear: 1999,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d8/KSR_Train_on_a_big_bridge_05-02-12_71.jpeg",
      },
      {
        name: "Konark Sun Temple",
        description: "Built in the 13th century, the Sun Temple at Konark is known for its architectural grandeur and delicate workmanship. The entire temple was designed in the shape of a colossal chariot with seven horses and twelve wheels, carrying the sun god across the heavens.",
        location: "Puri",
        state: "Odisha",
        inscribedYear: 1984,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/47/Konarka_Temple.jpg",
      },
      {
        name: "Mahabodhi Temple Complex",
        description: "The Mahabodhi Temple Complex is one of the four holy sites related to the life of the Lord Buddha, and particularly to the attainment of Enlightenment. The first temple was built by Emperor Asoka in the 3rd century B.C.",
        location: "Bodh Gaya",
        state: "Bihar",
        inscribedYear: 2002,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mahabodhitemple.jpg",
      },
      {
        name: "Fatehpur Sikri",
        description: "Built during the second half of the 16th century by the Emperor Akbar, Fatehpur Sikri was the capital of the Mughal Empire for only some 10 years. The complex of monuments and temples, all in a uniform architectural style, includes one of the largest mosques in India.",
        location: "Agra",
        state: "Uttar Pradesh",
        inscribedYear: 1986,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Fatehput_Sikiri_Buland_Darwaza_gate_2010.jpg",
      },
      {
        name: "Hampi",
        description: "The austere, grandiose site of Hampi comprises mainly the ruins of the capital city of the Vijayanagara Empire (14th-16th centuries CE), the last great Hindu Kingdom. The ruins are set in a stunning landscape of granite boulders, hills and plains.",
        location: "Bellary",
        state: "Karnataka",
        inscribedYear: 1986,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/The_elegant_stone_chariot.jpg",
      },
      {
        name: "Elephanta Caves",
        description: "The 'City of Caves', on an island in the Sea of Oman close to Bombay, contains a collection of rock art linked to the cult of Shiva. Here, Indian art has found one of its most perfect expressions, particularly the huge high reliefs in the main cave.",
        location: "Mumbai",
        state: "Maharashtra",
        inscribedYear: 1987,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Elephanta_Cave_Temple_-_panoramio.jpg/1600px-Elephanta_Cave_Temple_-_panoramio.jpg",
      },
      {
        name: "Great Living Chola Temples",
        description: "The Great Living Chola Temples were built by kings of the Chola Empire, which stretched over all of south India and the neighbouring islands. The site includes three great 11th- and 12th-century Temples: the Brihadisvara Temple at Thanjavur, the Brihadisvara Temple at Gangaikondacholisvaram and the Airavatesvara Temple at Darasuram.",
        location: "Thanjavur",
        state: "Tamil Nadu",
        inscribedYear: 1987,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/77/Le_temple_de_Brihadishwara_%28Tanjore%2C_Inde%29_%2814354574611%29.jpg",
      },
      {
        name: "Pattadakal",
        description: "Pattadakal, in Karnataka, represents the high point of an eclectic art which, in the 7th and 8th centuries CE, had reached a harmonious blend of architectural forms from northern and southern India. Here is an impressive series of nine Hindu temples, as well as a Jain sanctuary.",
        location: "Bagalkot",
        state: "Karnataka",
        inscribedYear: 1987,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/89/Virupaksha_temple_at_Pattadakal.JPG",
      },
      {
        name: "Keoladeo National Park",
        description: "This former duck-hunting reserve of the Maharajas is one of the major wintering areas for large numbers of aquatic birds from Afghanistan, Turkmenistan, China and Siberia. Some 364 species of birds have been recorded in the park.",
        location: "Bharatpur",
        state: "Rajasthan",
        inscribedYear: 1985,
        category: "NATURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/95/Bar-headed_Geese-_Bharatpur_I_IMG_8335.jpg",
      },
      {
        name: "Manas Wildlife Sanctuary",
        description: "On a gentle slope in the foothills of the Himalayas, where wooded hills give way to alluvial grasslands and tropical forests, the Manas Wildlife Sanctuary is home to a great variety of wildlife, including many endangered species, such as the tiger, pygmy hog, one-horned rhinoceros and elephant.",
        location: "Barpeta & Bongaigaon",
        state: "Assam",
        inscribedYear: 1985,
        category: "NATURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/81/Herd_of_Elephant_in_Manas.jpg",
      },
      {
        name: "Churches and Convents of Goa",
        description: "The churches and convents of Goa, the former capital of the Portuguese Indies, illustrate the evangelization of Asia. These monuments were influential in spreading forms of Manueline, Mannerist and Baroque art throughout all the countries of Asia where missions were established.",
        location: "Old Goa",
        state: "Goa",
        inscribedYear: 1986,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Basilika_Bom_Jesus.jpeg",
      },
      {
        name: "Khangchendzonga National Park",
        description: "Located at the heart of the Himalayan range in northern India, the Khangchendzonga National Park includes a diversity of plains, valleys, lakes, glaciers, and spectacular snow-capped mountains covered with ancient forests, including the world's third highest peak, Mount Khangchendzonga.",
        location: "North Sikkim",
        state: "Sikkim",
        inscribedYear: 2016,
        category: "MIXED",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Mount_Kangchenjunga_from_Tiger_Hill%2C_Darjeeling.jpg/1280px-Mount_Kangchenjunga_from_Tiger_Hill%2C_Darjeeling.jpg",
      },
      {
        name: "Champaner-Pavagadh Archaeological Park",
        description: "A concentration of largely unexcavated archaeological, historic and living cultural heritage properties cradled in an impressive landscape which includes prehistoric (chalcolithic) sites, a hill fortress of an early Hindu capital, and remains of the 16th-century capital of the state of Gujarat.",
        location: "Panchmahal",
        state: "Gujarat",
        inscribedYear: 2004,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/20/Jama_masjid_in_Champaner.JPG",
      },
      {
        name: "Chhatrapati Shivaji Terminus",
        description: "The Chhatrapati Shivaji Terminus, formerly known as Victoria Terminus Station, in Mumbai, is an outstanding example of Victorian Gothic Revival architecture in India, blended with themes deriving from Indian traditional architecture.",
        location: "Mumbai",
        state: "Maharashtra",
        inscribedYear: 2004,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Chhatrapati_shivaji_terminus%2C_esterno_01.jpg",
      },
      {
        name: "Sanchi",
        description: "The Buddhist monuments at Sanchi are a group of Buddhist monuments situated about 46 km from Bhopal. The Great Stupa at Sanchi was originally commissioned by Emperor Ashoka the Great in the 3rd century BCE.",
        location: "Raisen",
        state: "Madhya Pradesh",
        inscribedYear: 1989,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Sanchi1_N-MP-220.jpg",
      },
      {
        name: "Nanda Devi and Valley of Flowers National Parks",
        description: "This national park encompasses the Nanda Devi, India's second highest mountain, and the Valley of Flowers, an outstandingly beautiful high-altitude Himalayan valley. It is home to rare and endangered animals, including the Asiatic black bear, snow leopard, brown bear and blue sheep.",
        location: "Chamoli",
        state: "Uttarakhand",
        inscribedYear: 1988,
        category: "NATURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/21/%28A%29_Valley_of_flowers%2C_Garhwal_Uttarakhand_India.jpg",
      },
      {
        name: "Western Ghats",
        description: "The Western Ghats, also known as the Sahyadri Mountains, represent geomorphic features of immense global importance, containing exceptional levels of biological diversity and endemism.",
        location: "Various",
        state: "Kerala, Tamil Nadu, Karnataka, Goa, Maharashtra and Gujarat",
        inscribedYear: 2012,
        category: "NATURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e2/Western_Ghats_Monsoon_Clouds.jpg",
      },
      {
        name: "Hill Forts of Rajasthan",
        description: "The Hill Forts of Rajasthan, spread across Rajasthan state in northern India, contains six majestic forts: Chittorgarh; Kumbhalgarh; Sawai Madhopur; Jhalawar; Jaipur, and Jaisalmer. The forts use the natural defenses offered by the landscape: hills, deserts, rivers, and dense forests.",
        location: "Various",
        state: "Rajasthan",
        inscribedYear: 2013,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Amber_Fort_Jaipur.jpg/1600px-Amber_Fort_Jaipur.jpg",
      },
      {
        name: "Rani-ki-Vav",
        description: "Rani-ki-Vav (the Queen's Stepwell) at Patan, Gujarat, is a famous stepwell and is a masterpiece of ground water technology on the banks of the Saraswati River. It was built as a memorial to a king in the 11th century CE. The stepwell is divided into seven levels of stairs with sculptural panels.",
        location: "Patan",
        state: "Gujarat",
        inscribedYear: 2014,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Rani_ki_vav_-_Stepped_corridor.jpg/1280px-Rani_ki_vav_-_Stepped_corridor.jpg",
      },
      {
        name: "Great Himalayan National Park",
        description: "The Great Himalayan National Park Conservation Area is located in the western part of the Himalayan Mountains in the northern Indian state of Himachal Pradesh. The 90,540 ha property includes the upper mountain glacial and snow meltwater sources of the westerly flowing Jiwa Nal, Sainj and Tirthan rivers.",
        location: "Kullu",
        state: "Himachal Pradesh",
        inscribedYear: 2014,
        category: "NATURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Great_Himalayan_National_Park_-_views_from_Sainj_Valley_42.jpg",
      },
      {
        name: "Nalanda Mahavihara",
        description: "The Nalanda Mahavihara site, in Bihar, comprises the archaeological remains of a monastic and scholastic institution dating from the 3rd century BCE to the 13th century CE. It includes stupas, shrines, viharas (residential and educational buildings) and important art works in stucco, stone and metal.",
        location: "Nalanda",
        state: "Bihar",
        inscribedYear: 2016,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Nalanda.JPG/1280px-Nalanda.JPG",
      },
      {
        name: "The Architectural Work of Le Corbusier",
        description: "The Capitol Complex in Chandigarh is part of this transnational property consisting of 17 sites. It is a joint project between India, Argentina, Belgium, France, Germany, Japan, and Switzerland. It is a masterpiece of Le Corbusier's creative genius and human talent.",
        location: "Chandigarh",
        state: "Chandigarh",
        inscribedYear: 2016,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Palace_of_Assembly_Chandigarh_2006.jpg/1280px-Palace_of_Assembly_Chandigarh_2006.jpg",
      },
      {
        name: "Historic City of Ahmedabad",
        description: "The historic city of Ahmedabad, founded in the 15th century, represents the finest example of Indo-Islamic architecture and Hindu-Muslim art forms. Its traditional wooden houses (havelis) feature rich carving, and several of these homes are organized around a common courtyard and share a street.",
        location: "Ahmedabad",
        state: "Gujarat", 
        inscribedYear: 2017,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/AhmedabadDargahJaliWork.jpg/1600px-AhmedabadDargahJaliWork.jpg",
      },
      {
        name: "Victorian Gothic and Art Deco Ensembles of Mumbai",
        description: "The Victorian Gothic and Art Deco Ensembles of Mumbai consists of a 19th-century collection of Victorian Gothic buildings and a 20th century collection of Art Deco buildings. Together, these two ensembles, along with their surroundings, form an urban cultural environment that represents modernization phases.",
        location: "Mumbai",
        state: "Maharashtra",
        inscribedYear: 2018,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Gateway_to_India.jpg/1600px-Gateway_to_India.jpg",
      },
      {
        name: "Jaipur City",
        description: "The fortified city of Jaipur, in India's northwestern state of Rajasthan was founded in 1727 by Sawai Jai Singh II. Unlike other cities in the region, Jaipur was built according to a grid plan set out in the Shilpa Shastra, with nine rectangular sectors symbolizing the nine divisions of the universe.",
        location: "Jaipur",
        state: "Rajasthan",
        inscribedYear: 2019,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Hawa_Mahal_at_Jaipur.jpg/1600px-Hawa_Mahal_at_Jaipur.jpg",
      },
      {
        name: "Dholavira: A Harappan City",
        description: "The ancient city of Dholavira, the southern center of the Harappan Civilization, is one of the most remarkable and well-preserved urban settlements from the 3rd to mid-2nd millennium BCE. Its elaborate water management system showcases the ingenuity of the Indus Valley people.",
        location: "Kutch",
        state: "Gujarat",
        inscribedYear: 2021,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Dholavira_-_Gujarat_-_05.jpg/1280px-Dholavira_-_Gujarat_-_05.jpg",
      },
      {
        name: "Kakatiya Rudreshwara Temple",
        description: "The Rudreshwara Temple, also known as Ramappa Temple, is located in the village of Palampet in Telangana. Built during the reign of the Kakatiya Empire, the temple's main deity is Ramalingeswara Swamy, a form of Shiva. It stands out for its intricate sculptures made of sandstone and its distinctive lightweight floating bricks.",
        location: "Warangal",
        state: "Telangana",
        inscribedYear: 2021,
        category: "CULTURAL",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Ramappa_Temple_exterior.jpg/1600px-Ramappa_Temple_exterior.jpg",
      }
    ];

    sites.forEach(site => {
      const newSite: HeritageSite = {
        ...site,
        id: this.currentId++,
        rating: 1500,
        rank: undefined
      };
      this.sites.set(newSite.id, newSite);
    });

    // Initial ranking based on alphabetical order (will be replaced by ELO)
    this.updateRankings();
  }

  async getAllHeritageSites(): Promise<HeritageSite[]> {
    return Array.from(this.sites.values());
  }

  async getHeritageSiteById(id: number): Promise<HeritageSite | undefined> {
    return this.sites.get(id);
  }

  async getHeritageSitesByCategory(category: string): Promise<HeritageSite[]> {
    return Array.from(this.sites.values()).filter(
      site => site.category.toUpperCase() === category.toUpperCase()
    );
  }

  async createHeritageSite(site: InsertHeritageSite): Promise<HeritageSite> {
    const newSite: HeritageSite = {
      ...site,
      id: this.currentId++,
      rating: 1500,
      rank: this.sites.size + 1
    };
    this.sites.set(newSite.id, newSite);
    await this.updateRankings();
    return newSite;
  }

  async updateHeritageSite(id: number, data: Partial<HeritageSite>): Promise<HeritageSite | undefined> {
    const site = this.sites.get(id);
    if (!site) return undefined;

    const updatedSite: HeritageSite = { ...site, ...data };
    this.sites.set(id, updatedSite);
    
    // If rating was updated, update rankings
    if (data.rating !== undefined) {
      await this.updateRankings();
    }
    
    return updatedSite;
  }

  async updateRankings(): Promise<void> {
    const sites = Array.from(this.sites.values());
    
    // Sort by rating (descending)
    sites.sort((a, b) => b.rating - a.rating);
    
    // Update ranks
    sites.forEach((site, index) => {
      const updatedSite = { ...site, rank: index + 1 };
      this.sites.set(site.id, updatedSite);
    });
  }

  async getRandomMatchup(): Promise<Matchup> {
    const sites = Array.from(this.sites.values());
    
    // Select two random sites that are not the same
    let leftIndex = Math.floor(Math.random() * sites.length);
    let rightIndex = Math.floor(Math.random() * sites.length);
    
    // Make sure the indices are different
    while (leftIndex === rightIndex) {
      rightIndex = Math.floor(Math.random() * sites.length);
    }
    
    const leftSite = sites[leftIndex];
    const rightSite = sites[rightIndex];
    
    return {
      leftSite,
      rightSite,
      matchupId: this.matchupId++
    };
  }

  async recordVote(vote: InsertVote): Promise<Vote> {
    const newVote: Vote = {
      ...vote,
      id: this.voteId++,
      timestamp: new Date()
    };
    
    this.voteHistory.push(newVote);
    return newVote;
  }

  async getRecentVotes(limit: number): Promise<Vote[]> {
    return this.voteHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getTotalVoteCount(): Promise<number> {
    return this.voteHistory.length;
  }
}

export const storage = new MemStorage();
