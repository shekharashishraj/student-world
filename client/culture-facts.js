// ─── Culture Facts: country name → facts ─────────────────────────────────────
// Keys must exactly match the COUNTRIES object in globe.js
const CULTURE_FACTS = {
  "Afghanistan": {
    emoji: "🇦🇫",
    tagline: "Where ancient trade routes meet the Hindu Kush",
    facts: [
      "Afghanistan has been at the crossroads of civilizations for over 3,000 years.",
      "The game of Buzkashi (polo with a goat carcass) is the national sport.",
      "Afghan hospitality ('Pashtunwali') is a sacred code of honor for welcoming guests."
    ],
    leadershipInsight: "Afghan resilience through centuries of hardship teaches that true leadership is forged under pressure, not comfort."
  },
  "Argentina": {
    emoji: "🇦🇷",
    tagline: "Land of tango, Patagonia, and passionate debate",
    facts: [
      "Argentina has won the FIFA World Cup three times.",
      "Buenos Aires has more psychiatrists per capita than any other city in the world.",
      "Argentina has the highest literacy rate in Latin America at over 98%."
    ],
    leadershipInsight: "Argentine culture values passionate advocacy — leaders are expected to stand for something with fervor, not merely manage from the middle."
  },
  "Australia": {
    emoji: "🇦🇺",
    tagline: "The land Down Under where ancient meets modern",
    facts: [
      "Australia is home to 21 of the world's 25 most venomous snakes.",
      "The Aboriginal Australians have one of the oldest continuous cultures on Earth — over 65,000 years old.",
      "Australia is the world's largest exporter of wool."
    ],
    leadershipInsight: "The Australian concept of 'mateship' — loyalty, equality, and support — underpins a leadership style built on collective trust rather than hierarchy."
  },
  "Austria": {
    emoji: "🇦🇹",
    tagline: "The land of Mozart, the waltz, and Alpine grandeur",
    facts: [
      "Vienna was once the capital of the Habsburg Empire, ruling over 50 million people.",
      "Austria gave the world Mozart, Freud, and Schrödinger's cat.",
      "The Viennese coffee house tradition is recognized by UNESCO as Intangible Cultural Heritage."
    ],
    leadershipInsight: "Austrian coffeehouse culture — where artists, thinkers, and revolutionaries met as equals — reflects a leadership philosophy that great ideas emerge from open conversation."
  },
  "Bangladesh": {
    emoji: "🇧🇩",
    tagline: "The delta nation where rivers shape life and spirit",
    facts: [
      "Bangladesh is the birthplace of microfinance — Grameen Bank pioneered small loans for the rural poor.",
      "The Sundarbans, the world's largest mangrove forest, spans Bangladesh and India.",
      "Bangladesh produces nearly 85% of the world's jute."
    ],
    leadershipInsight: "Bangladesh's microfinance revolution shows that empowering the least powerful creates the most powerful social change."
  },
  "Belgium": {
    emoji: "🇧🇪",
    tagline: "The heart of Europe where chocolate meets diplomacy",
    facts: [
      "Belgium has over 1,500 different types of beer.",
      "Brussels is home to more diplomats than Washington D.C.",
      "Belgium invented the saxophone (Adolphe Sax, 1846) and french fries."
    ],
    leadershipInsight: "As the seat of the EU and NATO, Belgium's identity is built on finding common ground — a leadership lesson in building consensus across deep differences."
  },
  "Brazil": {
    emoji: "🇧🇷",
    tagline: "Where the Amazon meets carnival and community",
    facts: [
      "Brazil contains 60% of the Amazon rainforest, home to 10% of all species on Earth.",
      "Brazil is the only country in the Americas where Portuguese is the official language.",
      "Brazilians spend more time on social media per day than any other nationality."
    ],
    leadershipInsight: "Brazilian 'jogo bonito' (the beautiful game) philosophy extends beyond football — leadership is about creativity, joy, and collective harmony, not just winning."
  },
  "Canada": {
    emoji: "🇨🇦",
    tagline: "The mosaic nation of forests, lakes, and radical kindness",
    facts: [
      "Canada has the longest coastline of any country in the world — over 202,000 km.",
      "Canada officially adopted multiculturalism as government policy in 1971 — the first country to do so.",
      "Hockey was invented in Canada in the 1870s."
    ],
    leadershipInsight: "Canada's 'mosaic' identity (versus the U.S. 'melting pot') teaches that strength comes from preserving and celebrating differences, not erasing them."
  },
  "Chile": {
    emoji: "🇨🇱",
    tagline: "The thin thread of land stretching from desert to ice",
    facts: [
      "Chile is the world's longest country at 4,300 km from north to south.",
      "Chile produces nearly one-third of the world's copper.",
      "The Atacama Desert in Chile is the driest place on Earth outside Antarctica."
    ],
    leadershipInsight: "Chile's geography — navigating extreme climates and terrains — mirrors its leadership culture of adaptability and persistence across impossible odds."
  },
  "China": {
    emoji: "🇨🇳",
    tagline: "Where 5,000 years of civilization meet the future",
    facts: [
      "China invented paper, printing, gunpowder, and the compass — four of history's most transformative technologies.",
      "China has the world's largest high-speed rail network — over 40,000 km.",
      "The Chinese calendar is one of the oldest in continuous use, dating back over 4,000 years."
    ],
    leadershipInsight: "Confucian leadership emphasizes cultivation of self before leading others — personal virtue is the foundation of social and political authority."
  },
  "Colombia": {
    emoji: "🇨🇴",
    tagline: "Where emeralds, coffee, and a resilient spirit bloom",
    facts: [
      "Colombia is the only country in South America with both Pacific and Caribbean coastlines.",
      "Colombia produces 70% of the world's emeralds.",
      "Medellín was once the world's most dangerous city and is now celebrated as a model of urban transformation."
    ],
    leadershipInsight: "Medellín's transformation from conflict to innovation hub shows that the most powerful leadership stories are those of radical reinvention from the inside out."
  },
  "Czech Republic": {
    emoji: "🇨🇿",
    tagline: "A thousand spires and a velvet revolutionary spirit",
    facts: [
      "The Czech Republic has the highest beer consumption per capita in the world.",
      "Prague's Charles University (1348) is one of the oldest universities in Europe.",
      "The Velvet Revolution of 1989 peacefully ended communist rule in just 10 days."
    ],
    leadershipInsight: "The Velvet Revolution proved that peaceful, creative resistance led by artists and intellectuals can topple authoritarian regimes — leadership doesn't require weapons."
  },
  "Denmark": {
    emoji: "🇩🇰",
    tagline: "The happiest nation, LEGO, and the Viking legacy",
    facts: [
      "Denmark consistently ranks as one of the world's happiest countries.",
      "LEGO was invented by a Danish carpenter in 1932.",
      "Denmark generates over 50% of its electricity from wind power."
    ],
    leadershipInsight: "Danish 'hygge' (the art of cozy togetherness) reflects a leadership culture where psychological safety and belonging are treated as productivity tools, not luxuries."
  },
  "Egypt": {
    emoji: "🇪🇬",
    tagline: "Where the Pharaohs built monuments to last eternity",
    facts: [
      "Ancient Egypt was one of the world's first nation-states, dating back over 5,000 years.",
      "The Great Pyramid of Giza was the world's tallest man-made structure for 3,800 years.",
      "Egypt has more ancient monuments than any other country."
    ],
    leadershipInsight: "Egyptian civilization's longevity teaches that sustainable leadership is built on institutions and culture — not the charisma of any single ruler."
  },
  "Ethiopia": {
    emoji: "🇪🇹",
    tagline: "The cradle of humanity and the origin of coffee",
    facts: [
      "Ethiopia is where humanity's earliest ancestors — including 'Lucy' (3.2 million years old) — were discovered.",
      "Coffee originates from Ethiopia's Kaffa region; the word 'coffee' comes from 'Kaffa'.",
      "Ethiopia was never colonized, remaining one of only two African countries to resist European colonization."
    ],
    leadershipInsight: "Ethiopia's ancient kingdom of Aksum and its resistance to colonization reflect a leadership tradition rooted in cultural pride, sovereignty, and historical depth."
  },
  "Finland": {
    emoji: "🇫🇮",
    tagline: "Land of saunas, Nokia, and the world's best education",
    facts: [
      "Finland has the world's highest coffee consumption per capita.",
      "Finland's education system is ranked #1 globally — with no standardized tests until age 16.",
      "99% of Finns have access to a sauna; there are more saunas (3.3 million) than cars."
    ],
    leadershipInsight: "Finland's education philosophy — trust teachers as professionals, don't test children to death — is a masterclass in leading through autonomy and intrinsic motivation."
  },
  "France": {
    emoji: "🇫🇷",
    tagline: "Liberty, equality, and the art of living beautifully",
    facts: [
      "France is the most visited country in the world — over 90 million tourists per year.",
      "The French language has 35 words for types of bread.",
      "France has won the most Nobel Prizes in Literature of any country."
    ],
    leadershipInsight: "French 'art de vivre' (art of living) philosophy insists that how you do things — with craft, elegance, and intention — matters as much as what you achieve."
  },
  "Germany": {
    emoji: "🇩🇪",
    tagline: "Engineering precision, beer gardens, and the Reformation",
    facts: [
      "Germany has over 1,500 different types of beer and 1,300 breweries.",
      "The printing press was invented by Johannes Gutenberg in Germany in 1440.",
      "Germany has the fourth-largest economy in the world."
    ],
    leadershipInsight: "German 'Meister' (master craftsman) culture teaches that excellence is earned through years of deliberate practice — leadership is a craft, not a title."
  },
  "Ghana": {
    emoji: "🇬🇭",
    tagline: "The gateway to Africa, where Kente cloth tells history",
    facts: [
      "Ghana was the first sub-Saharan African country to gain independence, in 1957.",
      "Ghana is the world's second-largest producer of cocoa.",
      "Kente cloth — Ghana's iconic woven textile — was originally reserved for royalty."
    ],
    leadershipInsight: "Kwame Nkrumah's vision of Pan-African unity showed that the most powerful leaders don't just serve their nation — they serve a continent's dream."
  },
  "Greece": {
    emoji: "🇬🇷",
    tagline: "The cradle of democracy, philosophy, and the Olympic spirit",
    facts: [
      "Greece invented democracy, theater, the marathon, and the Olympic Games.",
      "Greece has more archaeological museums than any other country.",
      "The Greek alphabet is the oldest alphabet still in use today."
    ],
    leadershipInsight: "Socrates taught that the wisest leader is one who knows they don't know everything — intellectual humility is the foundation of all genuine wisdom."
  },
  "Hungary": {
    emoji: "🇭🇺",
    tagline: "Where thermal baths, paprika, and resilience define a people",
    facts: [
      "Hungary invented the Rubik's Cube, the ballpoint pen, and the hologram.",
      "Budapest has the oldest metro line in continental Europe (1896).",
      "Hungary has 13 Nobel laureates — extraordinary for a country of 10 million people."
    ],
    leadershipInsight: "Hungary's disproportionate Nobel Prize count shows that small nations can punch far above their weight when they invest fiercely in education and intellectual culture."
  },
  "India": {
    emoji: "🇮🇳",
    tagline: "Land of a thousand festivals and ancient wisdom",
    facts: [
      "India invented chess, yoga, and the decimal number system (including zero).",
      "India has the world's largest film industry by number of films produced annually.",
      "Over 19,500 languages and dialects are spoken across India."
    ],
    leadershipInsight: "Indian philosophy of 'Seva' (selfless service) teaches that the most enduring leaders are those who lead not for glory, but for the good of those they serve."
  },
  "Indonesia": {
    emoji: "🇮🇩",
    tagline: "17,000 islands, 300 languages, one republic",
    facts: [
      "Indonesia is the world's largest archipelago nation — 17,508 islands.",
      "Indonesia has the world's fourth-largest population at over 270 million people.",
      "Komodo dragons — the world's largest lizards — are found only in Indonesia."
    ],
    leadershipInsight: "Indonesia's 'Bhinneka Tunggal Ika' (Unity in Diversity) national motto embodies the leadership challenge of building cohesion across staggering difference."
  },
  "Iran": {
    emoji: "🇮🇷",
    tagline: "The ancient Persian empire where poetry and science flourished",
    facts: [
      "Iran (Persia) is one of the world's oldest civilizations, dating back 7,000 years.",
      "Iran has the highest number of UNESCO World Heritage Sites in the Middle East.",
      "Persian poets like Rumi and Hafez are still among the most-read poets in the world."
    ],
    leadershipInsight: "Rumi's poetry — 'Out beyond ideas of wrongdoing and rightdoing, there is a field. I'll meet you there.' — captures a leadership philosophy of transcending judgment to find common humanity."
  },
  "Iraq": {
    emoji: "🇮🇶",
    tagline: "Mesopotamia — where human civilization was born",
    facts: [
      "Iraq (ancient Mesopotamia) is where writing, the wheel, and the first legal code were invented.",
      "Iraq has the world's second-largest oil reserves.",
      "The city of Baghdad was once the largest city in the world and the center of Islamic learning."
    ],
    leadershipInsight: "Mesopotamia's Code of Hammurabi — one of history's first written laws — teaches that sustainable civilizations are built on clear, fair rules applied to everyone equally."
  },
  "Ireland": {
    emoji: "🇮🇪",
    tagline: "The Emerald Isle of storytellers, rebels, and endless craic",
    facts: [
      "Ireland has won the Eurovision Song Contest more than any other country (7 times).",
      "The Irish diaspora is enormous — more people of Irish descent live outside Ireland than in it.",
      "Ireland was the first country in the world to legalize same-sex marriage by popular vote (2015)."
    ],
    leadershipInsight: "Ireland's storytelling tradition — 'seanachie' (oral historians) — teaches that leaders who master narrative can preserve culture and inspire movements across generations."
  },
  "Israel": {
    emoji: "🇮🇱",
    tagline: "The startup nation where ancient history meets cutting-edge innovation",
    facts: [
      "Israel has more startups per capita than any country in the world.",
      "Israel is the only country in the world to have revived a dead language — Modern Hebrew.",
      "Israel has the world's highest rate of university degrees per capita."
    ],
    leadershipInsight: "Israel's startup culture embodies 'chutzpah' — the audacity to challenge the status quo, question authority, and pursue impossible ideas with relentless energy."
  },
  "Italy": {
    emoji: "🇮🇹",
    tagline: "Where art, food, and passion are a way of life",
    facts: [
      "Italy has more UNESCO World Heritage Sites than any other country — 58 and counting.",
      "Italy is the world's largest wine producer.",
      "The Italian Renaissance (14th–17th century) transformed art, science, and humanism globally."
    ],
    leadershipInsight: "The Italian Renaissance ideal of 'l'uomo universale' (the universal man, like Leonardo da Vinci) celebrates leaders who pursue mastery across multiple disciplines."
  },
  "Japan": {
    emoji: "🇯🇵",
    tagline: "Where tradition and innovation coexist in perfect tension",
    facts: [
      "Japan has more than 80,000 companies that are over 100 years old.",
      "The Japanese concept of 'Kaizen' (continuous improvement) revolutionized global manufacturing.",
      "Japan has the world's third-largest economy despite having no natural resources."
    ],
    leadershipInsight: "Japanese 'nemawashi' (building quiet consensus before announcing decisions) shows that the most durable agreements are built through patient, respectful dialogue — not top-down mandates."
  },
  "Jordan": {
    emoji: "🇯🇴",
    tagline: "Where ancient Petra rises from the rose-red desert",
    facts: [
      "Petra — the 'Rose City' carved into rock — was a lost city for over 1,000 years before being rediscovered in 1812.",
      "Jordan hosts more refugees per capita than almost any other nation.",
      "The Dead Sea, bordering Jordan, is the lowest point on Earth at 430 meters below sea level."
    ],
    leadershipInsight: "Jordan's tradition of hosting refugees — welcoming Palestinians, Iraqis, and Syrians — demonstrates that hospitality and humanitarian leadership are not charity, but dignity in action."
  },
  "Kenya": {
    emoji: "🇰🇪",
    tagline: "The marathon nation where innovation and the savanna meet",
    facts: [
      "Kenya dominates long-distance running — Kenyan athletes have won over 100 Olympic medals in track events.",
      "Kenya's M-Pesa (2007) was the world's first successful mobile money platform.",
      "The Great Rift Valley in Kenya is where the earliest human ancestors are believed to have evolved."
    ],
    leadershipInsight: "Kenya's M-Pesa revolution shows that the most transformative innovations often come from solving the problems of the most marginalized, not the most privileged."
  },
  "Malaysia": {
    emoji: "🇲🇾",
    tagline: "Where rainforests, skyscrapers, and diversity coexist",
    facts: [
      "Malaysia is home to some of the world's oldest rainforests — over 130 million years old.",
      "The Petronas Twin Towers in Kuala Lumpur were the world's tallest buildings from 1998–2004.",
      "Malaysia has three major ethnic groups — Malay, Chinese, and Indian — living alongside 60+ indigenous groups."
    ],
    leadershipInsight: "Malaysia's multicultural 'muhibah' (goodwill and harmony) ideal reflects that effective leadership in diverse societies requires active cultivation of respect across difference."
  },
  "Mexico": {
    emoji: "🇲🇽",
    tagline: "Where ancient empires, vibrant murals, and culinary genius live",
    facts: [
      "Mexico is home to one of the world's great ancient civilizations — the Aztec Empire had a capital larger than any European city of its time.",
      "Mexican cuisine is UNESCO-recognized as Intangible Cultural Heritage.",
      "Mexico City is built on the ruins of Tenochtitlan — sinking about 9 inches per year."
    ],
    leadershipInsight: "Mexico's muralist tradition (Diego Rivera, Frida Kahlo) proved that art can be political protest, community education, and national identity — leadership through visual storytelling."
  },
  "Morocco": {
    emoji: "🇲🇦",
    tagline: "Where the Sahara meets the medina and Atlantic winds",
    facts: [
      "Morocco is home to the University of al-Qarawiyyin (859 AD) — the world's oldest continuously operating university.",
      "Morocco has one of the most ambitious renewable energy programs in the world — aiming for 52% clean energy by 2030.",
      "Moroccan architecture (geometric tilework, riads, zellige) influenced Islamic design globally."
    ],
    leadershipInsight: "Al-Qarawiyyin's founding by Fatima al-Fihri — a woman in the 9th century — is a reminder that throughout history, women have always been builders of lasting institutions."
  },
  "Netherlands": {
    emoji: "🇳🇱",
    tagline: "Land of windmills, bicycles, and radical tolerance",
    facts: [
      "The Netherlands has 23 million bicycles for 17 million people.",
      "About 26% of the Netherlands is below sea level — the Dutch have mastered water management for 500 years.",
      "The Amsterdam Stock Exchange (1602) was the world's first modern stock exchange."
    ],
    leadershipInsight: "Dutch 'poldermodel' (consensus-based decision-making developed from managing shared water resources) teaches that collaboration — not competition — is often the only way to survive shared challenges."
  },
  "New Zealand": {
    emoji: "🇳🇿",
    tagline: "Where the haka, Middle-Earth, and the world's first voters live",
    facts: [
      "New Zealand was the first country in the world to give women the right to vote (1893).",
      "The Māori haka is one of the world's most recognized Indigenous cultural practices.",
      "New Zealand has more sheep (5:1) than people."
    ],
    leadershipInsight: "New Zealand's former PM Jacinda Ardern demonstrated that empathetic, grief-forward leadership in crisis is not weakness — it's the most powerful form of strength."
  },
  "Nigeria": {
    emoji: "🇳🇬",
    tagline: "Africa's giant where Nollywood, Afrobeats, and ambition reign",
    facts: [
      "Nigeria is Africa's most populous country — over 220 million people — and its largest economy.",
      "Nollywood (Nigeria's film industry) is the world's second-largest by number of films produced.",
      "Afrobeats music has become one of the world's fastest-growing musical genres."
    ],
    leadershipInsight: "Nigeria's 'ìmọ̀le' spirit — a drive to achieve against all odds, to hustle and build — reflects an entrepreneurial leadership tradition that turns adversity into opportunity."
  },
  "Norway": {
    emoji: "🇳🇴",
    tagline: "Fjords, oil wealth wisely saved, and the Nobel Peace Prize",
    facts: [
      "Norway's sovereign wealth fund — built from oil revenues — is the world's largest, worth over $1.4 trillion.",
      "Norway scores highest globally on the Human Development Index.",
      "The Nobel Peace Prize is awarded in Oslo (all other Nobel Prizes are awarded in Stockholm)."
    ],
    leadershipInsight: "Norway's decision to save its oil wealth for future generations — instead of spending it — is a masterclass in long-term thinking and intergenerational leadership responsibility."
  },
  "Pakistan": {
    emoji: "🇵🇰",
    tagline: "Where the Indus Valley civilization left its ancient roots",
    facts: [
      "Pakistan is home to K2 — the world's second-highest mountain and considered harder to climb than Everest.",
      "The Indus Valley Civilization (3300–1300 BC) in modern-day Pakistan is one of the world's oldest.",
      "Pakistan has one of the world's largest youth populations — 64% are under 30."
    ],
    leadershipInsight: "Pakistan's youth demographic is its greatest leadership challenge and opportunity — a country's future is determined by whether it equips its young people to lead."
  },
  "Peru": {
    emoji: "🇵🇪",
    tagline: "The Incan Empire and the world's highest cuisine",
    facts: [
      "Machu Picchu, built by the Inca in the 15th century, was unknown to the outside world until 1911.",
      "Peru is considered the origin of the potato — over 3,000 varieties grow there.",
      "Lima is South America's culinary capital — with multiple restaurants in the world's top 10."
    ],
    leadershipInsight: "Incan 'mit'a' (communal labor for the common good) teaches that the most sophisticated civilizations build systems where everyone contributes to shared infrastructure."
  },
  "Philippines": {
    emoji: "🇵🇭",
    tagline: "7,641 islands of warmth, resilience, and bayanihan spirit",
    facts: [
      "The Philippines has 7,641 islands — the world's second-largest archipelago.",
      "'Bayanihan' (communal unity and cooperation) is the Philippines' defining cultural value.",
      "The Philippines is home to the world's smallest monkey (the tarsier) and the whale shark."
    ],
    leadershipInsight: "'Bayanihan' — neighbors literally carrying a house to a new location together — is a living metaphor for leadership as collective action, not individual heroism."
  },
  "Poland": {
    emoji: "🇵🇱",
    tagline: "Where Solidarity rose to topple communism peacefully",
    facts: [
      "Poland's Solidarity movement (1980–81) was the first independent trade union in the communist bloc and helped end the Cold War.",
      "Poland gave the world Marie Curie — the only person to win Nobel Prizes in two different sciences.",
      "Poland has rebuilt its capital Warsaw from 85% destruction twice in the 20th century."
    ],
    leadershipInsight: "Solidarity showed that ordinary workers — not just elites — can shift the course of history when they organize around shared values and refuse to be divided."
  },
  "Portugal": {
    emoji: "🇵🇹",
    tagline: "The Age of Discovery nation where the sea is in the soul",
    facts: [
      "Portugal was the first global maritime empire — Portuguese explorers mapped 70% of the world's coastlines.",
      "Portuguese is spoken by over 250 million people across 10 countries.",
      "Portugal was the first country in Europe to abolish the death penalty (1867)."
    ],
    leadershipInsight: "Portugal's 'saudade' — a melancholic longing for what is absent — reflects leaders who are defined not just by conquest, but by the weight of what they have lost and left behind."
  },
  "Romania": {
    emoji: "🇷🇴",
    tagline: "Transylvania, painted monasteries, and computational genius",
    facts: [
      "Romania is the birthplace of the world's first jet engine designer (Henri Coandă) and the discoverer of insulin (Nicolae Paulescu).",
      "Romania's Transfăgărășan is considered one of the world's most spectacular mountain roads.",
      "Romania's Danube Delta is one of Europe's largest and best-preserved wetlands."
    ],
    leadershipInsight: "Romania's Revolution of 1989 — started by a single pastor refusing to be silenced — shows how one person's moral courage can trigger a national transformation."
  },
  "Russia": {
    emoji: "🇷🇺",
    tagline: "The largest nation on Earth — from the Baltic to the Pacific",
    facts: [
      "Russia spans 11 time zones — the most of any country.",
      "Russia was the first country to send a human into space (Yuri Gagarin, 1961).",
      "Russia has 1/5 of the world's forests and 1/4 of its fresh water."
    ],
    leadershipInsight: "Tolstoy wrote that history is not made by great leaders but by the collective movement of millions of ordinary people — a radical challenge to hero-worship in leadership theory."
  },
  "Saudi Arabia": {
    emoji: "🇸🇦",
    tagline: "The birthplace of Islam and a nation in rapid transformation",
    facts: [
      "Saudi Arabia is home to the two holiest cities in Islam — Mecca and Medina.",
      "Saudi Arabia holds 17% of the world's proven petroleum reserves.",
      "Saudi Arabia launched Vision 2030 — one of the world's most ambitious national transformation programs."
    ],
    leadershipInsight: "Vision 2030's goal of reducing oil dependency reflects a rare form of leadership courage: a nation proactively disrupting its own most successful industry before it collapses."
  },
  "South Africa": {
    emoji: "🇿🇦",
    tagline: "The Rainbow Nation where Ubuntu defines humanity",
    facts: [
      "South Africa has 11 official languages — the most of any country in the world.",
      "Nelson Mandela was imprisoned for 27 years and emerged to lead his country without bitterness.",
      "South Africa is the only country to voluntarily dismantle its nuclear weapons program."
    ],
    leadershipInsight: "'Ubuntu — I am because we are' — is South Africa's gift to global leadership philosophy: personhood and power are fundamentally relational, not individual."
  },
  "South Korea": {
    emoji: "🇰🇷",
    tagline: "From war-torn poverty to K-pop, semiconductors, and Squid Game",
    facts: [
      "South Korea went from one of the world's poorest countries to a top-12 economy in one generation.",
      "South Korea has the world's fastest average internet speeds.",
      "K-pop and Korean cinema (Parasite won the first non-English Best Picture Oscar) have become global cultural forces."
    ],
    leadershipInsight: "South Korea's 'ppali ppali' (hurry hurry) culture reflects a leadership mindset that urgency, compressed timelines, and relentless iteration can compress decades of progress into years."
  },
  "Spain": {
    emoji: "🇪🇸",
    tagline: "Where flamenco, Gaudí, and siesta culture collide",
    facts: [
      "Spain is the world's second-most visited country.",
      "Spanish is the world's second-most spoken native language (after Mandarin).",
      "The Prado Museum in Madrid has over 8,200 paintings — one of the world's greatest art collections."
    ],
    leadershipInsight: "Spanish 'duende' — the mysterious force of art that moves you to tears — reflects a leadership tradition where passion and aesthetic vision are inseparable from effectiveness."
  },
  "Sri Lanka": {
    emoji: "🇱🇰",
    tagline: "The Pearl of the Indian Ocean with ancient roots and resilience",
    facts: [
      "Sri Lanka has the oldest tree in the world planted by a known person — a Sacred Bo Tree, over 2,300 years old.",
      "Sri Lanka has been producing cinnamon for over 2,500 years.",
      "Sri Lanka elected the world's first female prime minister (Sirimavo Bandaranaike, 1960)."
    ],
    leadershipInsight: "Sri Lanka's election of the world's first female PM in 1960 — decades before most Western nations — reminds us that trailblazing leadership often comes from unexpected places."
  },
  "Sweden": {
    emoji: "🇸🇪",
    tagline: "Innovation, IKEA, and the world's most generous parental leave",
    facts: [
      "Sweden offers 480 days of parental leave per child, shared between both parents.",
      "Sweden gave the world IKEA, Spotify, H&M, Volvo, and Minecraft.",
      "Sweden has been at peace for over 200 years — the longest continuous peace of any nation."
    ],
    leadershipInsight: "Swedish 'lagom' (not too much, not too little — just right) is a leadership philosophy of balance, sustainability, and collective moderation over individual excess."
  },
  "Switzerland": {
    emoji: "🇨🇭",
    tagline: "The world's mediator — where chocolate, clocks, and neutrality thrive",
    facts: [
      "Switzerland has been neutral in every war since 1515.",
      "Geneva hosts the UN, WHO, Red Cross, and WTO — the world's diplomatic hub.",
      "Switzerland has four national languages: German, French, Italian, and Romansh."
    ],
    leadershipInsight: "Switzerland's 700-year tradition of direct democracy — citizens vote on hundreds of issues annually — is a radical experiment in trusting people with real power over their own lives."
  },
  "Taiwan": {
    emoji: "🇹🇼",
    tagline: "The Silicon Island at the heart of the chip revolution",
    facts: [
      "Taiwan produces over 60% of the world's semiconductors — making it critical to the global tech supply chain.",
      "Taiwan has one of Asia's most vibrant democracies and civil societies.",
      "Taiwan's night markets are considered among the world's greatest street food experiences."
    ],
    leadershipInsight: "TSMC's dominance in semiconductors shows that focused national strategy — betting everything on one critical technology — can make a small island indispensable to the entire world."
  },
  "Tanzania": {
    emoji: "🇹🇿",
    tagline: "Home to Kilimanjaro, the Serengeti, and Zanzibar's spice islands",
    facts: [
      "Tanzania's Serengeti hosts the world's largest land animal migration — 1.5 million wildebeest annually.",
      "Mount Kilimanjaro is Africa's highest peak and the world's tallest free-standing mountain.",
      "Zanzibar was the center of the East African spice trade for centuries."
    ],
    leadershipInsight: "Tanzania's founding president Julius Nyerere built national identity around 'Ujamaa' (familyhood) — the belief that a nation is a family, and leaders are accountable caretakers, not owners."
  },
  "Thailand": {
    emoji: "🇹🇭",
    tagline: "The Land of Smiles where Buddhist wisdom meets vibrant culture",
    facts: [
      "Thailand has over 40,000 Buddhist temples (wats).",
      "Thailand is the world's largest exporter of rice and rubber.",
      "Thailand is the only Southeast Asian country never to have been colonized."
    ],
    leadershipInsight: "Thailand's Buddhist philosophy of 'sanuk' (finding joy in everything you do) reflects a leadership value that sustainable excellence must be nourished by meaning and pleasure, not just discipline."
  },
  "Turkey": {
    emoji: "🇹🇷",
    tagline: "Where East meets West on the crossroads of civilization",
    facts: [
      "Istanbul is the only city in the world that spans two continents.",
      "Turkey is home to Troy, the site of the legendary Trojan War.",
      "Turkey produces more hazelnuts than the rest of the world combined."
    ],
    leadershipInsight: "Istanbul's position at the crossroads of East and West has always made it a place where ideas, religions, and cultures collide and transform — a physical metaphor for boundary-crossing leadership."
  },
  "Uganda": {
    emoji: "🇺🇬",
    tagline: "The Pearl of Africa where gorillas and Victoria's shores meet",
    facts: [
      "Uganda is home to half the world's remaining mountain gorilla population.",
      "The source of the Nile River — the world's longest river — is Lake Victoria, bordering Uganda.",
      "Uganda has the world's youngest population — over 75% are under 30."
    ],
    leadershipInsight: "Uganda's extraordinary youth bulge is both its greatest leadership challenge and resource — building institutions that channel young energy into innovation rather than instability will define its century."
  },
  "Ukraine": {
    emoji: "🇺🇦",
    tagline: "The breadbasket of Europe, Chernobyl, and the sunflower fields",
    facts: [
      "Ukraine is the world's largest country located entirely in Europe.",
      "Ukraine produces 50% of the world's sunflower oil.",
      "Kyiv's St. Sophia Cathedral (1037 AD) is one of the world's oldest Christian cathedrals still in use."
    ],
    leadershipInsight: "Ukraine's resistance has shown the world that national identity — the will to exist as a people — can be a military force more powerful than any weapon."
  },
  "United Arab Emirates": {
    emoji: "🇦🇪",
    tagline: "From sand dunes to skyscrapers in one generation",
    facts: [
      "The UAE went from having no paved roads in 1960 to building the Burj Khalifa (world's tallest building) by 2010.",
      "Dubai has the world's busiest international airport by passenger traffic.",
      "The UAE sent a spacecraft to Mars (Hope Probe) in 2020 — just 50 years after its founding."
    ],
    leadershipInsight: "The UAE's Mars mission — 50 years after the country's founding — is a statement that ambitious national vision, relentless investment, and patience can compress generations of progress."
  },
  "United Kingdom": {
    emoji: "🇬🇧",
    tagline: "Where Shakespeare, the BBC, and the Industrial Revolution changed the world",
    facts: [
      "The UK invented the World Wide Web (Tim Berners-Lee, 1989), the telephone, and the TV.",
      "The UK is home to the world's oldest public museum (Ashmolean, 1683) and oldest national library.",
      "English is now the world's most widely spoken language — a result of British colonial reach."
    ],
    leadershipInsight: "Churchill's wartime speeches demonstrate that in moments of greatest crisis, a leader's most powerful tool is the ability to narrate a story of possible victory against impossible odds."
  },
  "USA": {
    emoji: "🇺🇸",
    tagline: "The experiment in democracy that became the world's loudest voice",
    facts: [
      "The United States has the world's oldest written national constitution still in use (1788).",
      "The U.S. has won more Nobel Prizes than any other country.",
      "Silicon Valley (California) has produced more unicorn companies than any other region in the world."
    ],
    leadershipInsight: "America's founding promise — 'all men are created equal' — has been the standard against which American leadership has been measured and found wanting, inspiring generations of civil rights leaders."
  },
  "Venezuela": {
    emoji: "🇻🇪",
    tagline: "Angel Falls, oil riches, and a nation searching for itself",
    facts: [
      "Venezuela is home to Angel Falls — the world's highest uninterrupted waterfall at 979 meters.",
      "Venezuela has the world's largest proven oil reserves.",
      "Venezuela produces more Miss Universe and Miss World winners than any other country."
    ],
    leadershipInsight: "Venezuela's trajectory from oil wealth to economic collapse is a cautionary study in how resource abundance without institutional strength and diversification leads to fragility, not power."
  },
  "Vietnam": {
    emoji: "🇻🇳",
    tagline: "The phoenix nation that rebuilt from war to become Asia's tiger",
    facts: [
      "Vietnam defeated three of the world's superpowers in the 20th century — France, the US, and China.",
      "Vietnam is the world's second-largest exporter of coffee (after Brazil).",
      "Vietnam's 'Doi Moi' economic reforms (1986) transformed one of Asia's poorest countries into a rising economy."
    ],
    leadershipInsight: "Vietnam's Doi Moi reforms showed that the most courageous leadership decision is sometimes admitting the ideology you fought for doesn't work — and changing course without losing face."
  },
  "Zimbabwe": {
    emoji: "🇿🇼",
    tagline: "Great Zimbabwe, Victoria Falls, and a people who refuse to give up",
    facts: [
      "Victoria Falls — on the Zimbabwe-Zambia border — is the world's largest waterfall by total water flow.",
      "Great Zimbabwe (1100–1450 AD) was sub-Saharan Africa's largest medieval city.",
      "Zimbabwe has one of the world's highest literacy rates in sub-Saharan Africa at over 90%."
    ],
    leadershipInsight: "Zimbabwe's literacy rate — maintained through extraordinary adversity — reflects the belief that education is the one asset that cannot be inflated, devalued, or taken away by political chaos."
  }
};
