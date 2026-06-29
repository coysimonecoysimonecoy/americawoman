const targetDate = new Date("2026-09-07T00:00:00+08:00");
const driveFolderUrl = "https://drive.google.com/drive/folders/1P55h4GDDM60hLd57mctR3nHV_3YDlBb2?usp=sharing";
const memoryApiUrl = "/api/memories";
const feelingsApiUrl = "/api/feelings";
const persistentStorageUnavailableMessage = "Permanent saving works on the Cloudflare Pages website or with wrangler pages dev.";
const maxPhotoDimension = 1600;
const photoCompressionQuality = 0.82;
const randomCollageMinimumSlots = 100;
const collageBoxNameStorageKey = "iyas-return-collage-box-names";
const feelingOptions = [
  { score: 1, emoji: "\u{1F622}", label: "Sad / heavy" },
  { score: 2, emoji: "\u{1F615}", label: "Low" },
  { score: 3, emoji: "\u{1F610}", label: "Okay" },
  { score: 4, emoji: "\u{1F642}", label: "Good" },
  { score: 5, emoji: "\u{1F604}", label: "Joyful" },
];
const secretWelcomeMessages = [
  "Another memory unlocked.",
  "The trip book is open again.",
  "A little piece of the story is waiting.",
  "Passport mode: memory keeper verified.",
];
const countdownMilestoneMessages = {
  100: "100 days until Iya's return.",
  90: "90 days left. The countdown just got louder.",
  80: "80 days left. Another checkpoint unlocked.",
  70: "70 days left. The map is warming up.",
  60: "60 days left. Two months of anticipation.",
  50: "50 days left. Halfway through the double digits.",
  40: "40 days left. The return is getting real.",
  30: "30 days left. One month energy.",
  20: "20 days left. Pack the excitement.",
  10: "10 days left. Final countdown mode.",
  0: "Iya is back.",
};
const proudMessages = [
  "You are showing up, and that matters more than you know.",
  "I am proud of how you keep going, even on days that feel heavy.",
  "You do not have to be perfect today. I am proud of your effort.",
  "The way you keep trying says so much about your heart.",
  "I hope you remember that your quiet strength is still strength.",
  "You are doing better than you think, and I am proud of you.",
  "Even a small step today is still a step forward.",
  "I am proud of the way you care, feel, and keep becoming.",
  "You are allowed to move slowly. I am still proud of you.",
  "Your presence is a gift, even on the days you feel ordinary.",
  "I am proud of the softness you keep in your heart.",
  "You made it to today, and that is not nothing.",
  "You are brave in ways you may not always notice.",
  "I am proud of you for choosing hope again.",
  "You do not have to carry everything at once.",
  "I hope today reminds you that you are deeply loved.",
  "Your heart is beautiful, and I am proud of the person you are.",
  "I am proud of every little moment where you choose to keep going.",
  "You are growing, even when it feels quiet.",
  "The world is softer with you in it.",
  "I am proud of your patience with life and with yourself.",
  "You are not behind. You are becoming.",
  "I hope you give yourself the same grace I would give you.",
  "You deserve gentleness today.",
  "I am proud of you for facing another day with your whole heart.",
  "There is so much good in you.",
  "You are loved on the easy days and the hard days.",
  "I am proud of the way you keep your heart open.",
  "You are stronger than the mood of one day.",
  "I hope you can breathe a little easier today.",
  "You are doing enough. You are enough.",
];
const hugMessages = [
  "Hug sent. You just sent a little warmth across the distance.",
  "Hug sent. That one landed softly.",
  "Hug sent. A little closer, even from far away.",
  "Hug sent. The countdown got sweeter for a second.",
  "Hug sent. She is held in this tiny corner of the internet.",
];
const dailyBibleReadings = [
  { reference: "Matthew 5-7", theme: "Sermon on the Mount", note: "Start with the words of Jesus: humility, mercy, courage, forgiveness, and steady love." },
  { reference: "Romans 12", theme: "Sincere love", note: "Let this chapter shape the way you treat people, handle pressure, and answer difficulty with good." },
  { reference: "1 Corinthians 13", theme: "Real love", note: "Measure your day by patience, kindness, humility, and the kind of love that keeps showing up." },
  { reference: "Colossians 3", theme: "A renewed life", note: "Put on compassion, kindness, humility, gentleness, patience, forgiveness, and peace." },
  { reference: "Galatians 5:13-26", theme: "Fruit of the Spirit", note: "Look for one fruit to practice today: love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, or self-control." },
  { reference: "Ephesians 4:17-32", theme: "Kind speech", note: "Trade bitterness for tenderness, and let your words build instead of bruise." },
  { reference: "James 1", theme: "Steady under pressure", note: "Ask for wisdom, move slowly with anger, and let hard days train endurance." },
  { reference: "James 2", theme: "Faith in action", note: "Let belief become visible through mercy, fairness, and care for people who need help." },
  { reference: "James 3", theme: "A disciplined tongue", note: "Choose words that calm, heal, and guide; your speech can steer the whole day." },
  { reference: "Proverbs 3", theme: "Trust and wisdom", note: "Trust God with your path, stay humble, and let wisdom make your steps lighter." },
  { reference: "Proverbs 4", theme: "Guard your heart", note: "Protect what shapes you inside, then walk forward with focus and purpose." },
  { reference: "Proverbs 10", theme: "Daily wisdom", note: "Small choices matter; honesty, discipline, and kind speech build a better life." },
  { reference: "Proverbs 11", theme: "Integrity and generosity", note: "Live straight, give freely, and remember that generosity refreshes the giver too." },
  { reference: "Proverbs 15", theme: "Gentle answers", note: "A calm response can change the temperature of the whole room." },
  { reference: "Proverbs 16", theme: "Plans and patience", note: "Commit your work, check your motives, and let patience make you stronger." },
  { reference: "Proverbs 22", theme: "Reputation and wisdom", note: "Build a name marked by humility, fairness, discipline, and care." },
  { reference: "Micah 6:6-8", theme: "Justice, mercy, humility", note: "Keep the assignment simple and deep: do justice, love mercy, and walk humbly." },
  { reference: "Luke 10:25-37", theme: "The Good Samaritan", note: "Notice the person in front of you, then let compassion become action." },
  { reference: "Matthew 18:21-35", theme: "Forgiveness", note: "Release the weight you do not need to carry, and let mercy teach your heart." },
  { reference: "Luke 6:27-49", theme: "Mercy under pressure", note: "Choose love where it is hard, and build your life on a foundation that holds." },
  { reference: "1 Peter 3:8-17", theme: "Kindness under pressure", note: "Stay tenderhearted and brave, even when the atmosphere around you is tense." },
  { reference: "1 John 3", theme: "Love with action", note: "Let love move past words and become protection, generosity, and presence." },
  { reference: "1 John 4", theme: "God is love", note: "Receive love from God, then let fear loosen its grip on your heart." },
  { reference: "Philippians 2:1-18", theme: "Humble strength", note: "Choose humility without shrinking; serve with the quiet confidence of Christ." },
  { reference: "Titus 3:1-8", theme: "Gentleness and good works", note: "Be ready to do good, speak gently, and remember the mercy that changed you." },
  { reference: "2 Peter 1:3-11", theme: "Character growth", note: "Add goodness, knowledge, self-control, endurance, devotion, affection, and love one step at a time." },
  { reference: "Ecclesiastes 7", theme: "Wisdom and humility", note: "Let wisdom make you honest, patient, and less controlled by appearances." },
  { reference: "Psalm 15", theme: "Integrity", note: "Walk uprightly, speak truthfully, and become someone others can safely trust." },
  { reference: "Isaiah 58", theme: "True worship", note: "Spiritual strength grows when worship becomes justice, compassion, and help for others." },
  { reference: "Matthew 25:31-46", theme: "Care for the vulnerable", note: "Serve Christ by seeing and helping people who are hungry, lonely, sick, or overlooked." },
  { reference: "Deuteronomy 10:12-22", theme: "Love and reverence", note: "Walk in awe, love deeply, and protect the stranger with a generous heart." },
  { reference: "Leviticus 19:9-18", theme: "Love your neighbor", note: "Practice fairness in ordinary details, from honesty to how you treat the people nearby." },
  { reference: "Zechariah 7:8-14", theme: "Mercy and compassion", note: "Let your faith soften your heart toward the widow, orphan, stranger, and poor." },
  { reference: "Hebrews 13", theme: "Faithful love", note: "Keep loving, sharing, praying, and trusting God through ordinary duties." },
  { reference: "1 Thessalonians 5:12-24", theme: "Peace and gratitude", note: "Encourage the weary, be patient with everyone, and make room for gratitude." },
  { reference: "Joshua 1", theme: "Courage to begin", note: "Be strong and courageous; the next step matters more than fear's noise." },
  { reference: "Isaiah 40", theme: "Strength when tired", note: "When your energy runs thin, hope in God and let your strength be renewed." },
  { reference: "Philippians 4", theme: "Peace and focus", note: "Pray honestly, think on what is good, and let peace guard your heart." },
  { reference: "Hebrews 12:1-15", theme: "Endurance", note: "Run your race with your eyes lifted, and let discipline grow healing instead of shame." },
  { reference: "2 Corinthians 4", theme: "Do not give up", note: "Your pressure is not the whole story; keep going with eternal perspective." },
  { reference: "Nehemiah 1-2", theme: "Vision and action", note: "Pray deeply, plan wisely, and move when the door opens." },
  { reference: "Nehemiah 4", theme: "Build under pressure", note: "Keep building with courage when resistance shows up." },
  { reference: "Psalm 27", theme: "Courage and waiting", note: "Let your heart take courage while you wait for God with steady hope." },
  { reference: "Psalm 31", theme: "Strength in trouble", note: "Place your times in God's hands and breathe through the pressure." },
  { reference: "Psalm 37", theme: "Trust the process", note: "Do good, stay faithful, and do not let comparison steal your peace." },
  { reference: "Psalm 40", theme: "Patient rescue", note: "Wait with hope, then remember and retell the ways God lifted you." },
  { reference: "Psalm 46", theme: "God is refuge", note: "Be still for a moment; strength does not require panic." },
  { reference: "Psalm 56", theme: "Courage when afraid", note: "Name your fear honestly, then choose trust one breath at a time." },
  { reference: "Psalm 62", theme: "Quiet strength", note: "Let your soul wait quietly; your worth and rescue do not depend on noise." },
  { reference: "Psalm 73", theme: "Renewed perspective", note: "When life feels unfair, come close to God until your perspective clears." },
  { reference: "Psalm 84", theme: "Strength for the journey", note: "Move from strength to strength, trusting that the road can still become holy." },
  { reference: "Psalm 103", theme: "Remember goodness", note: "Count mercy, forgiveness, healing, compassion, and love until your heart remembers." },
  { reference: "Psalm 121", theme: "Help from God", note: "Lift your eyes; your help is not limited to what you can control." },
  { reference: "Psalm 138", theme: "Strengthened soul", note: "Ask God to strengthen your soul before the day asks anything from you." },
  { reference: "Romans 8", theme: "Hope and victory", note: "Nothing can separate you from God's love; carry that truth into the day." },
  { reference: "Romans 5:1-11", theme: "Endurance and hope", note: "Let hardship produce endurance, character, and hope that does not collapse." },
  { reference: "2 Timothy 1", theme: "Power, love, self-control", note: "You were not given fear as your master; walk with courage and discipline." },
  { reference: "2 Timothy 2:1-13", theme: "Disciplined endurance", note: "Be strong in grace, stay faithful, and keep moving with focus." },
  { reference: "1 Corinthians 15:50-58", theme: "Your work matters", note: "Stand firm; what you do in the Lord is not wasted." },
  { reference: "Ephesians 6:10-20", theme: "Spiritual strength", note: "Put on truth, righteousness, peace, faith, salvation, and prayer." },
  { reference: "Habakkuk 3", theme: "Joy in hard times", note: "Even before circumstances change, let God become your strength." },
  { reference: "Lamentations 3:19-33", theme: "Mercy every morning", note: "New mercy can meet you even after a heavy night." },
  { reference: "Jeremiah 17:5-10", theme: "Rooted strength", note: "Be like a tree by water: steady, nourished, and fruitful in dry seasons." },
  { reference: "Daniel 3", theme: "Courage under pressure", note: "Stand faithful when the heat rises; you are not alone in the fire." },
  { reference: "Daniel 6", theme: "Faith and discipline", note: "Keep your quiet habits with God even when the world gets loud." },
  { reference: "Genesis 39", theme: "Integrity when life is unfair", note: "Choose faithfulness when nobody is clapping and circumstances are unjust." },
  { reference: "Exodus 14", theme: "Move through fear", note: "When the path opens, step forward; fear does not get the final word." },
  { reference: "Psalm 23", theme: "Peace and restoration", note: "Let God shepherd your pace, restore your soul, and lead you beside quiet waters." },
  { reference: "Psalm 91", theme: "Protection and rest", note: "Rest under God's shelter and let trust calm what feels exposed." },
  { reference: "Psalm 139", theme: "Known by God", note: "You are fully known and still held; let that settle your breathing." },
  { reference: "Psalm 131", theme: "A calm soul", note: "Quiet your soul like a child at rest, without needing to solve everything now." },
  { reference: "Psalm 4", theme: "Peaceful sleep", note: "Release the day, receive safety, and let rest become an act of trust." },
  { reference: "Psalm 16", theme: "Security and joy", note: "Set God before you and let security become gladness." },
  { reference: "Psalm 34", theme: "Comfort when afraid", note: "Seek God in fear, then watch for the comfort that meets a broken heart." },
  { reference: "Psalm 42", theme: "Hope when discouraged", note: "Speak hope to your soul when feelings are heavy." },
  { reference: "Psalm 51", theme: "Cleansing and renewal", note: "Bring your whole heart to God and ask for a clean, steady spirit." },
  { reference: "Psalm 63", theme: "Deep longing", note: "Let your thirst lead you toward God instead of restless distraction." },
  { reference: "Psalm 86", theme: "Mercy and comfort", note: "Ask for an undivided heart and let mercy steady you." },
  { reference: "Psalm 94:16-23", theme: "Comfort for anxious thoughts", note: "When worries multiply, let God's comfort delight your soul again." },
  { reference: "Psalm 116", theme: "Return to rest", note: "Tell your soul it can return to rest because God has dealt kindly with you." },
  { reference: "Psalm 130", theme: "Waiting with hope", note: "Wait for God with more hope than a watchman waits for morning." },
  { reference: "Isaiah 26", theme: "Perfect peace", note: "Keep your mind stayed on God and let trust hold it steady." },
  { reference: "Isaiah 41", theme: "Do not fear", note: "God strengthens, helps, and upholds you when fear tries to take over." },
  { reference: "Isaiah 43", theme: "Held through deep waters", note: "Waters and fire may come, but they do not get to erase you." },
  { reference: "Isaiah 55", theme: "Rest and renewal", note: "Come thirsty, listen deeply, and receive what truly satisfies." },
  { reference: "Matthew 6:19-34", theme: "Freedom from worry", note: "Do today's faithfulness today, and leave tomorrow in God's hands." },
  { reference: "Matthew 11:25-30", theme: "Rest for your soul", note: "Bring your weariness to Jesus and learn the pace of gentleness." },
  { reference: "John 14", theme: "Peace from Jesus", note: "Let your heart be untroubled; peace can stay even when life is moving." },
  { reference: "John 15", theme: "Stay connected", note: "Abide in Christ, receive love, and let fruit grow from connection." },
  { reference: "John 16", theme: "Peace in trouble", note: "Take heart: trouble is real, but it is not stronger than Christ." },
  { reference: "2 Corinthians 1:3-11", theme: "Comfort in suffering", note: "Receive comfort, then become comfort for someone else." },
  { reference: "1 Peter 5:6-11", theme: "Cast anxiety on God", note: "Humble yourself, hand over anxiety, and stand firm with sober hope." },
  { reference: "Revelation 21", theme: "Future hope", note: "Pain and tears are not forever; let the promised ending give you courage now." },
  { reference: "Numbers 6:22-27", theme: "Blessing and peace", note: "Receive blessing, grace, and peace as a covering for the day." },
  { reference: "Ecclesiastes 3", theme: "Life's seasons", note: "There is a season for everything; rest inside God's timing." },
  { reference: "Job 38-42", theme: "Perspective in confusion", note: "When answers are hard, let God's greatness widen your view." },
  { reference: "Psalm 119", theme: "Wisdom for the path", note: "Walk the long road of wisdom one step, one word, and one faithful choice at a time." },
];
const millisecondsPerDay = 24 * 60 * 60 * 1000;
const usaBounds = [
  [24.4, -125],
  [49.4, -66.5],
];

const continentTilePositions = {
  20: [
    { row: 1, column: 3 },
    { row: 1, column: 4 },
    { row: 1, column: 5 },
    { row: 1, column: 6 },
    { row: 2, column: 2 },
    { row: 2, column: 3 },
    { row: 2, column: 4 },
    { row: 2, column: 5 },
    { row: 2, column: 6 },
    { row: 2, column: 7 },
    { row: 2, column: 8 },
    { row: 3, column: 1 },
    { row: 3, column: 2 },
    { row: 3, column: 3 },
    { row: 3, column: 4 },
    { row: 3, column: 5 },
    { row: 3, column: 6 },
    { row: 3, column: 7 },
    { row: 4, column: 4 },
    { row: 4, column: 7 },
  ],
  30: [
    { row: 1, column: 3 },
    { row: 1, column: 4 },
    { row: 1, column: 5 },
    { row: 1, column: 6 },
    { row: 1, column: 7 },
    { row: 2, column: 2 },
    { row: 2, column: 3 },
    { row: 2, column: 4 },
    { row: 2, column: 5 },
    { row: 2, column: 6 },
    { row: 2, column: 7 },
    { row: 2, column: 8 },
    { row: 2, column: 9 },
    { row: 3, column: 1 },
    { row: 3, column: 2 },
    { row: 3, column: 3 },
    { row: 3, column: 4 },
    { row: 3, column: 5 },
    { row: 3, column: 6 },
    { row: 3, column: 7 },
    { row: 3, column: 8 },
    { row: 3, column: 9 },
    { row: 4, column: 2 },
    { row: 4, column: 3 },
    { row: 4, column: 4 },
    { row: 4, column: 5 },
    { row: 4, column: 6 },
    { row: 4, column: 7 },
    { row: 5, column: 4 },
    { row: 5, column: 8 },
  ],
};

const itineraryCities = {
  myrtle: {
    name: "Myrtle Beach, South Carolina",
    shortName: "Myrtle Beach",
    tone: "coast",
    cityPin: [33.694026, -78.877372],
    cardKicker: "20 coastal places",
    stops: [
      { name: "Myrtle Beach SkyWheel", address: "1110 N Ocean Blvd, Myrtle Beach, SC 29577", lat: 33.694026, lng: -78.877372, image: "" },
      { name: "Myrtle Beach Boardwalk", address: "14th Ave N to 2nd Ave N, Myrtle Beach, SC 29577", lat: 33.690756, lng: -78.87989, image: "" },
      { name: "Broadway at the Beach", address: "1325 Celebrity Cir, Myrtle Beach, SC 29577", lat: 33.715611, lng: -78.882088, image: "" },
      { name: "Myrtle Beach State Park", address: "4401 S Kings Hwy, Myrtle Beach, SC 29575", lat: 33.651198, lng: -78.930625, image: "" },
      { name: "Brookgreen Gardens", address: "1931 Brookgreen Dr, Murrells Inlet, SC 29576", lat: 33.516925, lng: -79.090751, image: "" },
      { name: "Ripley's Aquarium of Myrtle Beach", address: "1110 Celebrity Cir, Myrtle Beach, SC 29577", lat: 33.71571, lng: -78.87776, image: "" },
      { name: "Apache Pier", address: "9700 Kings Rd, Myrtle Beach, SC 29572", lat: 33.761413, lng: -78.779684, image: "" },
      { name: "Barefoot Landing", address: "4898 Hwy 17 S, North Myrtle Beach, SC 29582", lat: 33.800497, lng: -78.738664, image: "" },
      { name: "Family Kingdom Amusement Park", address: "300 S Ocean Blvd, Myrtle Beach, SC 29577", lat: 33.675664, lng: -78.889164, image: "" },
      { name: "The Market Common", address: "4017 Deville St, Myrtle Beach, SC 29577", lat: 33.669672, lng: -78.938944, image: "" },
      { name: "Murrells Inlet MarshWalk", address: "4065 US-17 BUS, Murrells Inlet, SC 29576", lat: 33.556325, lng: -79.033334, image: "" },
      { name: "Huntington Beach State Park", address: "16148 Ocean Hwy, Murrells Inlet, SC 29576", lat: 33.508331, lng: -79.056667, image: "" },
      { name: "Atalaya Castle", address: "Atalaya Rd, Murrells Inlet, SC 29576", lat: 33.501779, lng: -79.067579, image: "" },
      { name: "Cherry Grove Pier", address: "3500 N Ocean Blvd, North Myrtle Beach, SC 29582", lat: 33.830542, lng: -78.633649, image: "" },
      { name: "Myrtle Waves Water Park", address: "3000 Mr. Joe White Ave, Myrtle Beach, SC 29577", lat: 33.716228, lng: -78.899334, image: "" },
      { name: "WonderWorks Myrtle Beach", address: "1313 Celebrity Cir, Myrtle Beach, SC 29577", lat: 33.71682, lng: -78.884307, image: "" },
      { name: "Hollywood Wax Museum Myrtle Beach", address: "1808 21st Ave N Unit A, Myrtle Beach, SC 29577", lat: 33.717142, lng: -78.891257, image: "" },
      { name: "Alligator Adventure", address: "4604 Hwy 17 S, North Myrtle Beach, SC 29582", lat: 33.799556, lng: -78.73729, image: "" },
      { name: "Warbird Park", address: "Farrow Pkwy, Myrtle Beach, SC 29577", lat: 33.660833, lng: -78.928056, image: "" },
      { name: "Second Avenue Pier", address: "110 N Ocean Blvd, Myrtle Beach, SC 29577", lat: 33.684274, lng: -78.886496, image: "" },
    ],
  },
  nyc: {
    name: "New York City, New York",
    shortName: "New York City",
    tone: "city",
    cityPin: [40.758896, -73.98513],
    cardKicker: "30 city places",
    stops: [
      { name: "Statue of Liberty", address: "Liberty Island, New York, NY 10004", lat: 40.689247, lng: -74.044502, image: "" },
      { name: "Times Square", address: "Broadway & 7th Ave, New York, NY 10036", lat: 40.758896, lng: -73.98513, image: "" },
      { name: "Empire State Building", address: "20 W 34th St, New York, NY 10001", lat: 40.748441, lng: -73.985664, image: "" },
      { name: "Central Park", address: "Manhattan, New York, NY", lat: 40.785091, lng: -73.968285, image: "" },
      { name: "Brooklyn Bridge", address: "Brooklyn Bridge, New York, NY 10038", lat: 40.706086, lng: -73.996864, image: "" },
      { name: "One World Trade Center", address: "285 Fulton St, New York, NY 10007", lat: 40.712742, lng: -74.013382, image: "" },
      { name: "Rockefeller Center", address: "45 Rockefeller Plaza, New York, NY 10111", lat: 40.758678, lng: -73.978798, image: "" },
      { name: "Grand Central Terminal", address: "89 E 42nd St, New York, NY 10017", lat: 40.752655, lng: -73.977295, image: "" },
      { name: "The Metropolitan Museum of Art", address: "1000 5th Ave, New York, NY 10028", lat: 40.779434, lng: -73.963402, image: "" },
      { name: "Museum of Modern Art (MoMA)", address: "11 W 53rd St, New York, NY 10019", lat: 40.761509, lng: -73.978271, image: "" },
      { name: "Fifth Avenue", address: "Fifth Ave, Manhattan, New York, NY", lat: 40.773998, lng: -73.966003, image: "" },
      { name: "Wall Street", address: "Wall St, New York, NY 10005", lat: 40.706005, lng: -74.008827, image: "" },
      { name: "Charging Bull", address: "Bowling Green, Broadway, New York, NY 10004", lat: 40.705574, lng: -74.013588, image: "" },
      { name: "St. Patrick's Cathedral", address: "5th Ave, New York, NY 10022", lat: 40.75816, lng: -73.975418, image: "" },
      { name: "Bryant Park", address: "6th Ave & W 42nd St, New York, NY 10018", lat: 40.753742, lng: -73.983559, image: "" },
      { name: "New York Public Library", address: "476 5th Ave, New York, NY 10018", lat: 40.753181, lng: -73.982254, image: "" },
      { name: "Radio City Music Hall", address: "1260 6th Ave, New York, NY 10020", lat: 40.759979, lng: -73.980049, image: "" },
      { name: "Madison Square Garden", address: "4 Pennsylvania Plaza, New York, NY 10001", lat: 40.750298, lng: -73.993324, image: "" },
      { name: "Flatiron Building", address: "175 5th Ave, New York, NY 10010", lat: 40.741112, lng: -73.989723, image: "" },
      { name: "Washington Square Arch", address: "Washington Square Park, New York, NY 10012", lat: 40.731236, lng: -73.997103, image: "" },
      { name: "Coney Island Boardwalk", address: "Riegelmann Boardwalk, Brooklyn, NY 11224", lat: 40.574879, lng: -73.982872, image: "" },
      { name: "Ellis Island", address: "Ellis Island, New York Harbor", lat: 40.699475, lng: -74.039559, image: "" },
      { name: "The High Line", address: "Gansevoort St to W 34th St, New York, NY", lat: 40.747993, lng: -74.00489, image: "" },
      { name: "Chelsea Market", address: "75 9th Ave, New York, NY 10011", lat: 40.742352, lng: -74.00621, image: "" },
      { name: "Yankee Stadium", address: "1 E 161st St, Bronx, NY 10451", lat: 40.829659, lng: -73.926186, image: "" },
      { name: "Apollo Theater", address: "253 W 125th St, New York, NY 10027", lat: 40.810018, lng: -73.950056, image: "" },
      { name: "Lincoln Center", address: "10 Lincoln Center Plaza, New York, NY 10023", lat: 40.772311, lng: -73.983403, image: "" },
      { name: "United Nations Headquarters", address: "405 E 42nd St, New York, NY 10017", lat: 40.749423, lng: -73.968051, image: "" },
      { name: "Brooklyn Botanic Garden", address: "990 Washington Ave, Brooklyn, NY 11225", lat: 40.667621, lng: -73.963189, image: "" },
      { name: "Belvedere Castle", address: "Central Park, New York, NY 10024", lat: 40.779447, lng: -73.969061, image: "" },
    ],
  },
};

const elements = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
  spoken: document.querySelector("#spoken-countdown"),
  milestone: document.querySelector("#milestone-message"),
  dailyReadingReference: document.querySelector("#daily-reading-reference"),
  dailyReadingTheme: document.querySelector("#daily-reading-theme"),
  dailyReadingNote: document.querySelector("#daily-reading-note"),
  dailyReadingLink: document.querySelector("#daily-reading-link"),
  proudMessageText: document.querySelector("#proud-message-text"),
  hugButton: document.querySelector("#send-hug"),
  hugStatus: document.querySelector("#hug-status"),
  hugBurst: document.querySelector("#hug-burst"),
  feelingMeter: document.querySelector("#feeling-meter"),
  feelingCheckin: document.querySelector(".feeling-checkin"),
  feelingNote: document.querySelector("#feeling-note"),
  feelingPasscode: document.querySelector("#feeling-passcode"),
  feelingStatus: document.querySelector("#feeling-status"),
  saveFeeling: document.querySelector("#save-feeling"),
  feelingHistoryButton: document.querySelector("#feeling-history-button"),
  memoryDrive: document.querySelector("#memory-drive"),
  map: document.querySelector("#itinerary-map"),
  cityControls: [...document.querySelectorAll(".city-control")],
  resetMap: document.querySelector("#reset-map"),
  openCollage: document.querySelector("#open-collage"),
  locationPanel: document.querySelector("#location-panel"),
  selectedCityKicker: document.querySelector("#selected-city-kicker"),
  selectedCityTitle: document.querySelector("#selected-city-title"),
  locationGrid: document.querySelector("#location-grid"),
};

let previousValues = {};
let map = null;
let cityMarkerLayer = null;
let locationMarkerLayer = null;
let activeCityKey = "";
let activeLocationId = "";
let activeMarkers = new Map();
let savedMemoryPhotos = {};
let savedCollagePhotos = [];
let memoryLoadSequence = 0;
let memoryMutationVersion = 0;
let savedFeelings = {};
let savedHugs = {};
let activeFeelingDateKey = getLocalDateKey();
let selectedFeelingScore = 0;
let todayFeelingLocked = false;
let memoryStorageReady = window.location.protocol !== "file:";
let memoryStorageMessage = memoryStorageReady ? "" : persistentStorageUnavailableMessage;
let photoContext = null;
let photoDialog = null;
let photoFileInput = null;
let collageDialog = null;
let collageFileInput = null;
let collageActiveTab = "random";
let collagePanelOpen = false;
let activeCollageSlotIndex = 0;
let savedCollageBoxNames = loadCollageBoxNames();
let memoryViewer = null;
let viewerContext = null;
let fullscreenPhotoViewer = null;
let feelingHistoryDialog = null;
let feelingHistoryPasscode = "";
let selectedFeelingDate = "";
let feelingHistoryMonth = null;
let dailyReadingRefreshTimer = null;
let hugSendCount = 0;
let hugButtonTimer = null;
let hugBurstTimer = null;

function buildDigit(number) {
  const digit = document.createElement("span");
  digit.className = "digit";
  digit.textContent = number;

  return digit;
}

function renderDigits(element, value) {
  if (previousValues[element.id] === value) {
    return;
  }

  previousValues[element.id] = value;
  element.replaceChildren(...value.split("").map(buildDigit));
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function getCountdownParts() {
  const remaining = Math.max(0, targetDate.getTime() - Date.now());
  const totalSeconds = Math.floor(remaining / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function updateCountdown() {
  const { days, hours, minutes, seconds } = getCountdownParts();
  const dayDigits = String(days).padStart(days > 99 ? 3 : 2, "0");
  const milestoneMessage = days % 10 === 0 ? countdownMilestoneMessages[days] || `${days} days left. A special checkpoint is ready.` : "";

  renderDigits(elements.days, dayDigits);
  renderDigits(elements.hours, pad(hours));
  renderDigits(elements.minutes, pad(minutes));
  renderDigits(elements.seconds, pad(seconds));

  elements.milestone.textContent = milestoneMessage;
  elements.milestone.hidden = !milestoneMessage;
  elements.spoken.textContent = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds until September 7, 2026 in Philippine time.`;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getLocalCalendarDayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / millisecondsPerDay);
}

function getLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseLocalDateKey(dateKey) {
  const [year, month, day] = String(dateKey || "").split("-").map(Number);

  if (!year || !month || !day) {
    return new Date();
  }

  return new Date(year, month - 1, day);
}

function getDailyBibleReadingIndex(date = new Date()) {
  const targetLocalDay = getLocalCalendarDayNumber(targetDate);
  const todayLocalDay = getLocalCalendarDayNumber(date);
  const daysUntilTargetLocalDate = targetLocalDay - todayLocalDay;

  return clamp(dailyBibleReadings.length - daysUntilTargetLocalDate, 0, dailyBibleReadings.length - 1);
}

function getBiblePassageUrl(reference) {
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(reference)}&version=KJV`;
}

function getDailyProudMessageIndex(date = new Date()) {
  return getLocalCalendarDayNumber(date) % proudMessages.length;
}

function updateDailyProudMessage(date = new Date()) {
  if (!elements.proudMessageText) {
    return;
  }

  elements.proudMessageText.textContent = proudMessages[getDailyProudMessageIndex(date)];
}

function renderHugBurst() {
  if (!elements.hugBurst) {
    return;
  }

  window.clearTimeout(hugBurstTimer);
  elements.hugBurst.replaceChildren();

  Array.from({ length: 9 }, (_, index) => {
    const heart = document.createElement("span");
    const angle = -155 + index * 38;
    const distance = 32 + (index % 3) * 8;
    const x = Math.cos((angle * Math.PI) / 180) * distance;
    const y = Math.sin((angle * Math.PI) / 180) * distance - 12;

    heart.textContent = "\u2665";
    heart.style.setProperty("--x", `${x.toFixed(1)}px`);
    heart.style.setProperty("--y", `${y.toFixed(1)}px`);
    heart.style.setProperty("--rotate", `${-18 + index * 5}deg`);
    heart.style.setProperty("--delay", `${index * 18}ms`);
    heart.style.setProperty("--size", `${13 + (index % 3) * 2}px`);

    return heart;
  }).forEach((heart) => elements.hugBurst.append(heart));

  hugBurstTimer = window.setTimeout(() => {
    elements.hugBurst.replaceChildren();
  }, 1050);
}

async function saveDistanceHugToHistory() {
  if (!memoryStorageReady) {
    return null;
  }

  const data = await requestFeelingJson(feelingsApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "hug",
      date: getLocalDateKey(),
    }),
  });

  savedHugs = normalizeHugs(data.hugs);

  return data.hug || null;
}

async function sendDistanceHug() {
  if (!elements.hugButton || !elements.hugStatus) {
    return;
  }

  hugSendCount += 1;
  elements.hugStatus.textContent = hugMessages[(hugSendCount - 1) % hugMessages.length];
  elements.hugStatus.hidden = false;

  elements.hugButton.classList.add("hugging");
  window.clearTimeout(hugButtonTimer);
  hugButtonTimer = window.setTimeout(() => {
    elements.hugButton.classList.remove("hugging");
  }, 760);

  renderHugBurst();

  try {
    const savedHug = await saveDistanceHugToHistory();

    if (savedHug) {
      const count = Number(savedHug.count) || getHugCount();

      elements.hugStatus.textContent = `${elements.hugStatus.textContent} Saved as hug ${count} for today.`;
    } else if (!memoryStorageReady) {
      elements.hugStatus.textContent = `${elements.hugStatus.textContent} Saving works on the Cloudflare Pages website.`;
    }

    if (feelingHistoryPasscode && feelingHistoryDialog && !feelingHistoryDialog.hidden) {
      renderFeelingHistoryDialog("Hug added to the calendar.");
    }
  } catch (error) {
    elements.hugStatus.textContent = `${elements.hugStatus.textContent} It could not be saved to the calendar yet.`;
  }
}

function updateDailyBibleReading(date = new Date()) {
  const readingIndex = getDailyBibleReadingIndex(date);
  const reading = dailyBibleReadings[readingIndex];

  elements.dailyReadingReference.textContent = reading.reference;
  elements.dailyReadingTheme.textContent = reading.theme;
  elements.dailyReadingNote.textContent = reading.note;
  elements.dailyReadingLink.href = getBiblePassageUrl(reading.reference);
  elements.dailyReadingLink.setAttribute("aria-label", `Read ${reading.reference} in the King James Version`);
}

function scheduleNextDailyReadingUpdate() {
  if (dailyReadingRefreshTimer) {
    window.clearTimeout(dailyReadingRefreshTimer);
  }

  const now = new Date();
  const nextLocalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  const delay = Math.max(1000, nextLocalMidnight.getTime() - now.getTime());

  dailyReadingRefreshTimer = window.setTimeout(() => {
    updateDailyBibleReading();
    updateDailyProudMessage();
    refreshFeelingDateState();
    scheduleNextDailyReadingUpdate();
  }, delay);
}

function refreshDailyBibleReading() {
  updateDailyBibleReading();
  updateDailyProudMessage();
  refreshFeelingDateState();
  scheduleNextDailyReadingUpdate();
}

function getStopId(cityKey, index) {
  return `${cityKey}-${index}`;
}

function getContinentTilePosition(count, index) {
  const positions = continentTilePositions[count] || continentTilePositions[30];

  return positions[index % positions.length];
}

function buildCityIcon(city) {
  return L.divIcon({
    className: "",
    html: `<div class="leaflet-city-pin ${city.tone}"><span></span><strong>${city.shortName}</strong></div>`,
    iconSize: [150, 42],
    iconAnchor: [21, 21],
  });
}

function buildLocationIcon(city, index, isActive = false) {
  return L.divIcon({
    className: "",
    html: `<div class="leaflet-location-pin ${city.tone}${isActive ? " active" : ""}">${String(index + 1).padStart(2, "0")}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function getCityBounds(city) {
  return L.latLngBounds(city.stops.map((stop) => [stop.lat, stop.lng]));
}

function fitUsaView() {
  map.fitBounds(usaBounds, {
    padding: [28, 28],
    animate: true,
  });
}

function clearActiveLocation() {
  activeLocationId = "";
  document.querySelectorAll(".location-card.active").forEach((card) => card.classList.remove("active"));
}

function getStopPhoto(cityKey, index) {
  const id = getStopId(cityKey, index);
  const stop = itineraryCities[cityKey].stops[index];

  return savedMemoryPhotos[id]?.url || stop.userImage || stop.image;
}

function getStopJournal(cityKey, index) {
  return savedMemoryPhotos[getStopId(cityKey, index)]?.journal || "";
}

function getSecretWelcomeMessage(cityKey, index) {
  const messageIndex = Math.abs(`${cityKey}-${index}`.split("").reduce((total, character) => total + character.charCodeAt(0), 0)) % secretWelcomeMessages.length;

  return secretWelcomeMessages[messageIndex];
}

function setPhotoDialogError(message = "") {
  const error = photoDialog?.querySelector("#photo-dialog-error");

  if (error) {
    error.textContent = message;
    error.hidden = !message;
  }
}

function setPhotoDialogBusy(isBusy, message = "") {
  if (!photoDialog) {
    return;
  }

  photoDialog.querySelectorAll("button, input").forEach((control) => {
    control.disabled = isBusy;
  });
  setPhotoDialogError(message);
}

async function requestMemoryJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "Memory photos could not be saved right now.");

    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function requestFeelingJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || "Feelings could not be saved right now.");

    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function getMemoryPasscode() {
  return elements.feelingPasscode?.value.trim() || feelingHistoryPasscode || "";
}

function loadCollageBoxNames() {
  try {
    const names = JSON.parse(window.localStorage?.getItem(collageBoxNameStorageKey) || "{}");

    return names && typeof names === "object" && !Array.isArray(names) ? names : {};
  } catch {
    return {};
  }
}

function saveCollageBoxNames() {
  try {
    window.localStorage?.setItem(collageBoxNameStorageKey, JSON.stringify(savedCollageBoxNames));
  } catch {
    // Box names are a browser convenience; photo storage still works if localStorage is blocked.
  }
}

function getCollageBoxName(index) {
  return String(savedCollageBoxNames[index] || "");
}

function getCollageBoxLabel(index, photo) {
  return getCollageBoxName(index) || (photo ? `Random Memory ${String(index + 1).padStart(2, "0")}` : `Box ${String(index + 1).padStart(2, "0")}`);
}

function updateCollageBoxName(index, value, card) {
  const name = String(value || "").slice(0, 80);

  if (name) {
    savedCollageBoxNames[index] = name;
  } else {
    delete savedCollageBoxNames[index];
  }

  saveCollageBoxNames();
  const heading = card?.querySelector(".location-copy h4");

  if (heading) {
    heading.textContent = getCollageBoxLabel(index, savedCollagePhotos[index]);
  }
}

function normalizeFeelings(feelings) {
  return feelings && typeof feelings === "object" && !Array.isArray(feelings) ? feelings : {};
}

function normalizePhotoRecords(records) {
  const slots = Array.from({ length: randomCollageMinimumSlots }, () => null);

  if (!Array.isArray(records)) {
    return slots;
  }

  records
    .filter((record) => record && typeof record.url === "string" && record.url)
    .forEach((record) => {
      const slot = Number(record.slot);

      if (Number.isInteger(slot) && slot >= 0 && slot < randomCollageMinimumSlots) {
        const existing = slots[slot];

        if (!existing || new Date(record.uploadedAt || 0).getTime() > new Date(existing.uploadedAt || 0).getTime()) {
          slots[slot] = record;
        }
        return;
      }

      const emptyIndex = slots.findIndex((photo) => !photo);

      if (emptyIndex >= 0) {
        slots[emptyIndex] = {
          ...record,
          slot: emptyIndex,
        };
      }
    });

  return slots;
}

function isValidCollageSlotIndex(value) {
  const slot = Number(value);

  return Number.isInteger(slot) && slot >= 0 && slot < randomCollageMinimumSlots;
}

function normalizeCollageWithUploadedPhoto(records, slotIndex, photo) {
  const slots = normalizePhotoRecords(records);
  const slot = Number(slotIndex);

  if (isValidCollageSlotIndex(slot) && photo?.url) {
    slots[slot] = { ...photo, slot };
  }

  return slots;
}

function normalizeCollageWithoutPhoto(records, slotIndex, pathname = "") {
  const slots = normalizePhotoRecords(records);
  const slot = Number(slotIndex);
  const removedPathname = String(pathname || "");

  if (isValidCollageSlotIndex(slot)) {
    slots[slot] = null;
  }

  if (removedPathname) {
    slots.forEach((photo, index) => {
      if (photo?.pathname === removedPathname) {
        slots[index] = null;
      }
    });
  }

  return slots;
}

function isImageFile(file) {
  const type = String(file?.type || "").toLowerCase();
  const name = String(file?.name || "").toLowerCase();

  return type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(name);
}

function getSavedCollagePhotos() {
  return savedCollagePhotos.filter(Boolean);
}

function getSavedCollagePhotoCount() {
  return getSavedCollagePhotos().length;
}

function getFirstAvailableCollageSlot() {
  const emptyIndex = savedCollagePhotos.findIndex((photo) => !photo);

  return emptyIndex >= 0 ? emptyIndex : 0;
}

function isValidDateKey(dateKey) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(dateKey || ""));
}

function normalizeHugs(hugs) {
  if (!hugs || typeof hugs !== "object" || Array.isArray(hugs)) {
    return {};
  }

  return Object.entries(hugs).reduce((normalized, [dateKey, entry]) => {
    const count = Math.max(0, Math.floor(Number(entry?.count ?? entry) || 0));

    if (isValidDateKey(dateKey) && count) {
      normalized[dateKey] = {
        date: dateKey,
        count,
        updatedAt: String(entry?.updatedAt || ""),
      };
    }

    return normalized;
  }, {});
}

function getFeelingOption(score) {
  return feelingOptions.find((option) => option.score === Number(score)) || feelingOptions[2];
}

function getFeelingEntry(dateKey = getLocalDateKey()) {
  return savedFeelings[dateKey] || null;
}

function getHugCount(dateKey = getLocalDateKey()) {
  return Math.max(0, Number(savedHugs[dateKey]?.count) || 0);
}

function getTotalHugCount() {
  return Object.values(savedHugs).reduce((total, entry) => total + (Number(entry?.count) || 0), 0);
}

function getMonthHugCount(month = feelingHistoryMonth || new Date()) {
  const monthPrefix = `${month.getFullYear()}-${pad(month.getMonth() + 1)}-`;

  return Object.entries(savedHugs).reduce((total, [dateKey, entry]) => (
    dateKey.startsWith(monthPrefix) ? total + (Number(entry?.count) || 0) : total
  ), 0);
}

function formatFeelingDate(dateKey) {
  return parseLocalDateKey(dateKey).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function setFeelingStatus(message = "", isError = false) {
  if (!elements.feelingStatus) {
    return;
  }

  elements.feelingStatus.textContent = message;
  elements.feelingStatus.hidden = !message;
  elements.feelingStatus.classList.toggle("error", isError);
}

function setFeelingFormLocked(isLocked) {
  todayFeelingLocked = isLocked;
  elements.feelingCheckin?.classList.toggle("locked", isLocked);
  elements.feelingCheckin?.setAttribute("aria-disabled", String(isLocked));
  elements.feelingMeter?.querySelectorAll("button").forEach((button) => {
    button.disabled = isLocked;
  });
  [elements.feelingNote, elements.feelingPasscode, elements.saveFeeling].forEach((control) => {
    if (control) {
      control.disabled = isLocked;
    }
  });

  if (elements.saveFeeling) {
    elements.saveFeeling.textContent = isLocked ? "Saved for today" : "Save feeling";
  }
}

function setFeelingBusy(isBusy, message = "") {
  const shouldDisable = isBusy || todayFeelingLocked;

  elements.feelingMeter?.querySelectorAll("button").forEach((button) => {
    button.disabled = shouldDisable;
  });
  [elements.feelingNote, elements.feelingPasscode, elements.saveFeeling].forEach((control) => {
    if (control) {
      control.disabled = shouldDisable;
    }
  });

  if (message) {
    setFeelingStatus(message);
  }
}

function updateFeelingSideButton(score = selectedFeelingScore) {
  if (!elements.feelingHistoryButton) {
    return;
  }

  const hasSavedFeeling = Boolean(score);
  const option = getFeelingOption(hasSavedFeeling ? score : 3);

  elements.feelingHistoryButton.textContent = option.emoji;
  elements.feelingHistoryButton.dataset.score = String(hasSavedFeeling ? score : 3);
  elements.feelingHistoryButton.setAttribute(
    "aria-label",
    hasSavedFeeling ? `Open feeling history. Today feels ${option.label}.` : "Open feeling history",
  );
}

function renderFeelingMeterSelection(container, score) {
  container?.querySelectorAll(".feeling-option").forEach((button) => {
    const isActive = Number(button.dataset.score) === Number(score);

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-checked", String(isActive));
  });
}

function buildFeelingOptionButton(option, selectedScore, onSelect) {
  const button = document.createElement("button");
  const emoji = document.createElement("span");
  const label = document.createElement("span");

  button.type = "button";
  button.className = "feeling-option";
  button.dataset.score = String(option.score);
  button.setAttribute("role", "radio");
  button.setAttribute("aria-checked", String(option.score === Number(selectedScore)));
  button.setAttribute("aria-label", option.label);
  emoji.className = "feeling-option-emoji";
  emoji.textContent = option.emoji;
  label.className = "feeling-option-label";
  label.textContent = option.label;
  button.classList.toggle("active", option.score === Number(selectedScore));
  button.append(emoji, label);
  button.addEventListener("click", () => onSelect(option.score));

  return button;
}

function buildFeelingMeter(container, selectedScore, onSelect) {
  if (!container) {
    return;
  }

  container.replaceChildren(
    ...feelingOptions.map((option) => buildFeelingOptionButton(option, selectedScore, (score) => {
      onSelect(score);
      renderFeelingMeterSelection(container, score);
    })),
  );
}

function createFeelingMeter() {
  buildFeelingMeter(elements.feelingMeter, selectedFeelingScore, (score) => {
    selectedFeelingScore = score;
    setFeelingStatus();
  });
}

function syncTodayFeelingFromSaved() {
  const todayKey = getLocalDateKey();
  const entry = getFeelingEntry(todayKey);

  activeFeelingDateKey = todayKey;
  selectedFeelingScore = Number(entry?.score) || 0;
  setFeelingFormLocked(Boolean(entry));

  if (elements.feelingNote) {
    elements.feelingNote.value = entry?.note || "";
  }

  if (entry && elements.feelingPasscode) {
    elements.feelingPasscode.value = "";
  }

  renderFeelingMeterSelection(elements.feelingMeter, selectedFeelingScore);
  updateFeelingSideButton(selectedFeelingScore);

  if (entry) {
    setFeelingStatus("Today's feeling is saved. Come back tomorrow for a new check-in.");
  } else {
    setFeelingStatus();
  }
}

function refreshFeelingDateState() {
  const todayKey = getLocalDateKey();

  if (todayKey !== activeFeelingDateKey) {
    syncTodayFeelingFromSaved();
  }
}

async function saveTodayFeeling() {
  const existingEntry = getFeelingEntry(getLocalDateKey());

  if (todayFeelingLocked || existingEntry) {
    syncTodayFeelingFromSaved();
    return;
  }

  if (!memoryStorageReady) {
    setFeelingStatus(memoryStorageMessage || persistentStorageUnavailableMessage, true);
    return;
  }

  const passcode = elements.feelingPasscode?.value.trim() || "";

  if (!selectedFeelingScore) {
    setFeelingStatus("Choose a feeling first.", true);
    elements.feelingMeter?.querySelector("button")?.focus();
    return;
  }

  if (!passcode) {
    setFeelingStatus("Enter the memory passcode first.", true);
    elements.feelingPasscode?.focus();
    return;
  }

  try {
    setFeelingBusy(true, "Saving feeling...");
    const data = await requestFeelingJson(feelingsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passcode,
        date: getLocalDateKey(),
        score: selectedFeelingScore,
        note: elements.feelingNote?.value || "",
      }),
    });

    savedFeelings = normalizeFeelings(data.feelings);
    savedHugs = normalizeHugs(data.hugs);
    feelingHistoryPasscode = passcode;
    syncTodayFeelingFromSaved();
    setFeelingStatus("Saved for today. Come back tomorrow for a new check-in.");

    if (feelingHistoryDialog && !feelingHistoryDialog.hidden) {
      renderFeelingHistoryDialog("Saved for today.");
    }
  } catch (error) {
    if (error.status === 409 && error.data?.feelings) {
      savedFeelings = normalizeFeelings(error.data.feelings);
      savedHugs = normalizeHugs(error.data.hugs);
      feelingHistoryPasscode = passcode;
      syncTodayFeelingFromSaved();
      return;
    }

    setFeelingStatus(error.message, true);
  } finally {
    setFeelingBusy(false);
  }
}

function getFeelingHistoryPasscodeInput() {
  return feelingHistoryDialog?.querySelector("#feeling-history-passcode");
}

function setFeelingHistoryMessage(message = "", isError = false) {
  const messageElement = feelingHistoryDialog?.querySelector("#feeling-history-status");

  if (!messageElement) {
    return;
  }

  messageElement.textContent = message;
  messageElement.hidden = !message;
  messageElement.classList.toggle("error", isError);
}

function setFeelingHistoryBusy(isBusy, message = "") {
  if (!feelingHistoryDialog) {
    return;
  }

  feelingHistoryDialog.querySelectorAll("button, input, textarea").forEach((control) => {
    control.disabled = isBusy;
  });

  if (message) {
    setFeelingHistoryMessage(message);
  }
}

function shiftFeelingHistoryMonth(offset) {
  const base = feelingHistoryMonth || new Date();

  feelingHistoryMonth = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  renderFeelingHistoryDialog();
}

async function loadFeelingHistory(passcode) {
  const cleanPasscode = String(passcode || "").trim();

  if (!cleanPasscode) {
    setFeelingHistoryMessage("Enter the memory passcode first.", true);
    getFeelingHistoryPasscodeInput()?.focus();
    return;
  }

  if (!memoryStorageReady) {
    setFeelingHistoryMessage(memoryStorageMessage || persistentStorageUnavailableMessage, true);
    return;
  }

  try {
    setFeelingHistoryBusy(true, "Unlocking history...");
    const data = await requestFeelingJson(`${feelingsApiUrl}?passcode=${encodeURIComponent(cleanPasscode)}`);

    savedFeelings = normalizeFeelings(data.feelings);
    savedHugs = normalizeHugs(data.hugs);
    feelingHistoryPasscode = cleanPasscode;
    syncTodayFeelingFromSaved();
    renderFeelingHistoryDialog("History unlocked.");
  } catch (error) {
    setFeelingHistoryBusy(false);
    setFeelingHistoryMessage(error.message, true);
    getFeelingHistoryPasscodeInput()?.focus();
  }
}

async function saveFeelingForDate(dateKey, score, note) {
  if (!feelingHistoryPasscode) {
    setFeelingHistoryMessage("Unlock with the memory passcode first.", true);
    return;
  }

  if (getFeelingEntry(dateKey)) {
    setFeelingHistoryMessage("This day already has a saved feeling.", true);
    return;
  }

  if (!score) {
    setFeelingHistoryMessage("Choose a feeling first.", true);
    return;
  }

  try {
    setFeelingHistoryBusy(true, "Saving feeling...");
    const data = await requestFeelingJson(feelingsApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        passcode: feelingHistoryPasscode,
        date: dateKey,
        score,
        note,
      }),
    });

    savedFeelings = normalizeFeelings(data.feelings);
    savedHugs = normalizeHugs(data.hugs);
    if (dateKey === getLocalDateKey()) {
      syncTodayFeelingFromSaved();
    }
    renderFeelingHistoryDialog("Feeling saved.");
  } catch (error) {
    setFeelingHistoryBusy(false);
    setFeelingHistoryMessage(error.message, true);
  }
}

function buildFeelingHistoryUnlock() {
  const wrapper = document.createElement("div");
  const label = document.createElement("label");
  const labelText = document.createElement("span");
  const input = document.createElement("input");
  const button = document.createElement("button");
  const currentPasscode = feelingHistoryPasscode || getFeelingHistoryPasscodeInput()?.value || "";

  wrapper.className = "feeling-history-unlock";
  label.className = "feeling-passcode-wrap";
  label.setAttribute("for", "feeling-history-passcode");
  labelText.textContent = "Passcode";
  input.id = "feeling-history-passcode";
  input.type = "password";
  input.autocomplete = "current-password";
  input.placeholder = "Enter passcode";
  input.value = currentPasscode;
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      loadFeelingHistory(input.value);
    }
  });
  button.type = "button";
  button.className = "feeling-history-unlock-button";
  button.textContent = feelingHistoryPasscode ? "Refresh" : "Unlock";
  button.addEventListener("click", () => loadFeelingHistory(input.value));

  label.append(labelText, input);
  wrapper.append(label, button);

  return wrapper;
}

function buildFeelingHugSummary() {
  const wrapper = document.createElement("section");
  const title = document.createElement("h4");
  const stats = document.createElement("div");
  const totalCount = getTotalHugCount();
  const monthCount = getMonthHugCount();
  const todayCount = getHugCount();
  const statItems = [
    { label: "Total hugs", value: totalCount },
    { label: "This month", value: monthCount },
    { label: "Today", value: todayCount },
  ];

  wrapper.className = "feeling-hug-summary";
  title.textContent = "Hugs sent";
  stats.className = "feeling-hug-stats";
  statItems.forEach((item) => {
    const stat = document.createElement("p");
    const value = document.createElement("strong");
    const label = document.createElement("span");

    value.textContent = String(item.value);
    label.textContent = item.label;
    stat.append(value, label);
    stats.append(stat);
  });
  wrapper.append(title, stats);

  return wrapper;
}

function buildFeelingCalendar() {
  const wrapper = document.createElement("section");
  const nav = document.createElement("div");
  const previous = document.createElement("button");
  const next = document.createElement("button");
  const monthLabel = document.createElement("h4");
  const grid = document.createElement("div");
  const month = feelingHistoryMonth || new Date();
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  feelingHistoryMonth = monthStart;
  wrapper.className = "feeling-calendar-wrap";
  nav.className = "feeling-calendar-nav";
  previous.type = "button";
  previous.className = "feeling-calendar-arrow";
  previous.textContent = "<";
  previous.setAttribute("aria-label", "Previous month");
  previous.addEventListener("click", () => shiftFeelingHistoryMonth(-1));
  next.type = "button";
  next.className = "feeling-calendar-arrow";
  next.textContent = ">";
  next.setAttribute("aria-label", "Next month");
  next.addEventListener("click", () => shiftFeelingHistoryMonth(1));
  monthLabel.textContent = monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  nav.append(previous, monthLabel, next);

  grid.className = "feeling-calendar-grid";
  weekdayLabels.forEach((label) => {
    const dayLabel = document.createElement("span");

    dayLabel.className = "feeling-weekday";
    dayLabel.textContent = label;
    grid.append(dayLabel);
  });

  Array.from({ length: monthStart.getDay() }).forEach(() => {
    const blank = document.createElement("span");

    blank.className = "feeling-calendar-blank";
    grid.append(blank);
  });

  Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), day);
    const dateKey = getLocalDateKey(date);
    const entry = getFeelingEntry(dateKey);
    const option = entry ? getFeelingOption(entry.score) : null;
    const hugCount = getHugCount(dateKey);
    const button = document.createElement("button");
    const number = document.createElement("span");
    const emoji = document.createElement("strong");
    const hugs = document.createElement("em");
    const feelingLabel = entry ? option.label : "no feeling saved";
    const hugLabel = hugCount ? `${hugCount} ${hugCount === 1 ? "hug" : "hugs"} sent` : "no hugs sent";

    button.type = "button";
    button.className = "feeling-calendar-day";
    button.classList.toggle("has-entry", Boolean(entry));
    button.classList.toggle("has-hugs", Boolean(hugCount));
    button.classList.toggle("active", dateKey === selectedFeelingDate);
    button.setAttribute("aria-label", `${formatFeelingDate(dateKey)}: ${feelingLabel}; ${hugLabel}`);
    number.textContent = String(day);
    emoji.textContent = option?.emoji || "";
    hugs.className = "feeling-calendar-hugs";
    hugs.textContent = hugCount ? `\u2665 ${hugCount}` : "";
    button.append(number, emoji, hugs);
    button.addEventListener("click", () => {
      selectedFeelingDate = dateKey;
      renderFeelingHistoryDialog();
    });
    grid.append(button);
  });

  wrapper.append(nav, grid);

  return wrapper;
}

function buildFeelingDetail() {
  const dateKey = selectedFeelingDate || getLocalDateKey();
  const entry = getFeelingEntry(dateKey);
  const hasEntry = Boolean(entry);
  const hugCount = getHugCount(dateKey);
  const detail = document.createElement("section");
  const title = document.createElement("h4");
  const meta = document.createElement("p");
  const hugMeta = document.createElement("p");
  const meter = document.createElement("div");
  const noteLabel = document.createElement("label");
  const noteText = document.createElement("span");
  const note = document.createElement("textarea");
  const actions = document.createElement("div");
  const saveButton = document.createElement("button");
  let editorScore = Number(entry?.score) || 0;

  detail.className = "feeling-history-detail";
  title.textContent = formatFeelingDate(dateKey);
  meta.textContent = entry ? `${getFeelingOption(entry.score).label} - saved for this day.` : "No feeling saved yet.";
  hugMeta.className = "feeling-history-hug-line";
  hugMeta.textContent = hugCount ? `${hugCount} ${hugCount === 1 ? "hug" : "hugs"} sent this day.` : "No hugs sent this day yet.";
  meter.className = "feeling-meter feeling-editor-meter";
  meter.setAttribute("role", "radiogroup");
  meter.setAttribute("aria-label", `Feeling for ${formatFeelingDate(dateKey)}`);
  buildFeelingMeter(meter, editorScore, (score) => {
    editorScore = score;
    setFeelingHistoryMessage();
  });
  meter.querySelectorAll("button").forEach((button) => {
    button.disabled = hasEntry;
  });

  noteLabel.className = "feeling-note-wrap";
  noteLabel.setAttribute("for", "feeling-history-note");
  noteText.textContent = "Note";
  note.id = "feeling-history-note";
  note.maxLength = 240;
  note.placeholder = "A short thought for this day...";
  note.value = entry?.note || "";
  note.disabled = hasEntry;
  noteLabel.append(noteText, note);

  actions.className = "feeling-history-actions";
  saveButton.type = "button";
  saveButton.className = "feeling-history-action primary";
  saveButton.textContent = entry ? "Saved once" : "Save day";
  saveButton.disabled = hasEntry;
  saveButton.addEventListener("click", () => saveFeelingForDate(dateKey, editorScore, note.value));
  actions.append(saveButton);
  detail.append(title, meta, hugMeta, meter, noteLabel, actions);

  return detail;
}

function renderFeelingHistoryDialog(message = "", isError = false) {
  if (!feelingHistoryDialog) {
    return;
  }

  const card = document.createElement("section");
  const closeButton = document.createElement("button");
  const kicker = document.createElement("p");
  const title = document.createElement("h3");
  const messageElement = document.createElement("p");

  if (!selectedFeelingDate) {
    selectedFeelingDate = getLocalDateKey();
  }

  if (!feelingHistoryMonth) {
    const today = new Date();
    feelingHistoryMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  card.className = "feeling-history-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-labelledby", "feeling-history-title");
  closeButton.type = "button";
  closeButton.className = "photo-dialog-close feeling-history-close";
  closeButton.setAttribute("aria-label", "Close feeling history");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", closeFeelingHistory);
  kicker.className = "feeling-history-kicker";
  kicker.textContent = "Emotion calendar";
  title.id = "feeling-history-title";
  title.textContent = "Feeling history";
  messageElement.id = "feeling-history-status";
  messageElement.className = "feeling-history-status";
  messageElement.textContent = message;
  messageElement.hidden = !message;
  messageElement.classList.toggle("error", isError);

  card.append(closeButton, kicker, title, buildFeelingHistoryUnlock(), messageElement);

  if (feelingHistoryPasscode) {
    card.append(buildFeelingHugSummary(), buildFeelingCalendar(), buildFeelingDetail());
  } else {
    const locked = document.createElement("p");

    locked.className = "feeling-history-locked";
    locked.textContent = "Unlock with the memory passcode to see past check-ins.";
    card.append(locked);
  }

  feelingHistoryDialog.replaceChildren(card);
}

function openFeelingHistory() {
  if (!feelingHistoryDialog) {
    return;
  }

  selectedFeelingDate = selectedFeelingDate || getLocalDateKey();

  if (!feelingHistoryMonth) {
    const selectedDate = parseLocalDateKey(selectedFeelingDate);

    feelingHistoryMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  }

  renderFeelingHistoryDialog();
  feelingHistoryDialog.hidden = false;
  feelingHistoryDialog.querySelector("input, .feeling-calendar-day.active, button")?.focus();
}

function closeFeelingHistory() {
  if (feelingHistoryDialog) {
    feelingHistoryDialog.hidden = true;
    feelingHistoryDialog.querySelectorAll("button, input, textarea").forEach((control) => {
      control.disabled = false;
    });
  }
}

function createFeelingHistoryDialog() {
  feelingHistoryDialog = document.createElement("div");
  feelingHistoryDialog.className = "feeling-history";
  feelingHistoryDialog.hidden = true;
  feelingHistoryDialog.addEventListener("click", (event) => {
    if (event.target === feelingHistoryDialog) {
      closeFeelingHistory();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && feelingHistoryDialog && !feelingHistoryDialog.hidden) {
      closeFeelingHistory();
    }
  });

  document.body.append(feelingHistoryDialog);
}

async function loadSavedMemoryPhotos() {
  if (!memoryStorageReady) {
    return;
  }

  const loadId = ++memoryLoadSequence;
  const mutationVersionAtStart = memoryMutationVersion;

  try {
    const data = await requestMemoryJson(memoryApiUrl);

    if (loadId !== memoryLoadSequence || mutationVersionAtStart !== memoryMutationVersion) {
      return;
    }

    savedMemoryPhotos = data.photos || {};
    savedCollagePhotos = normalizePhotoRecords(data.collage);
    memoryStorageMessage = "";
    renderCollageDialogContent();
    if (collagePanelOpen) {
      renderCollagePanel(collageActiveTab);
    }

    if (activeCityKey) {
      renderLocationCards(activeCityKey);
      const [cityKey, index] = activeLocationId.split("-");

      if (cityKey === activeCityKey && index !== undefined) {
        setActiveLocation(cityKey, Number(index), false);
      }
    }
  } catch (error) {
    if (loadId !== memoryLoadSequence || mutationVersionAtStart !== memoryMutationVersion) {
      return;
    }

    if (error.status === 503) {
      memoryStorageReady = false;
    }
    memoryStorageMessage = error.message || "Saved memory photos could not load.";
  }
}

function setActiveLocation(cityKey, index, panToMarker = true) {
  const city = itineraryCities[cityKey];
  const stop = city.stops[index];
  const id = getStopId(cityKey, index);
  const marker = activeMarkers.get(id);

  activeLocationId = id;
  document.querySelectorAll(".location-card.active").forEach((card) => card.classList.remove("active"));
  document.querySelector(`[data-stop-id="${id}"]`)?.classList.add("active");

  city.stops.forEach((_, markerIndex) => {
    const markerId = getStopId(cityKey, markerIndex);
    const itemMarker = activeMarkers.get(markerId);

    if (itemMarker) {
      itemMarker.setIcon(buildLocationIcon(city, markerIndex, markerId === id));
    }
  });

  if (marker && panToMarker) {
    map.flyTo([stop.lat, stop.lng], Math.max(map.getZoom(), 14), {
      duration: 0.55,
    });
    marker.openTooltip();
  }
}

function closePhotoDialog() {
  if (photoDialog) {
    photoDialog.querySelectorAll("button, input").forEach((control) => {
      control.disabled = false;
    });
    photoDialog.hidden = true;
  }

  photoContext = null;
  setPhotoDialogError();
}

function openPhotoFilePicker() {
  if (!photoFileInput) {
    return;
  }

  if (!memoryStorageReady) {
    setPhotoDialogError(memoryStorageMessage || persistentStorageUnavailableMessage);
    return;
  }

  photoFileInput.value = "";
  photoFileInput.click();
}

function downloadCurrentPhoto() {
  if (!photoContext) {
    return;
  }

  const { cityKey, index } = photoContext;
  const stop = itineraryCities[cityKey].stops[index];
  const photo = getStopPhoto(cityKey, index);

  if (!photo) {
    return;
  }

  const link = document.createElement("a");
  const filename = stop.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "memory";
  link.href = photo;
  link.download = `${filename}.jpg`;
  document.body.append(link);
  link.click();
  link.remove();
}

function buildPhotoDropzone() {
  const dropzone = document.createElement("button");
  const label = document.createElement("strong");
  const hint = document.createElement("span");

  dropzone.type = "button";
  dropzone.className = "photo-dropzone";
  label.textContent = "Drag here or upload photo";
  hint.textContent = "Click to choose a file";
  dropzone.append(label, hint);
  dropzone.addEventListener("click", openPhotoFilePicker);

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove("dragging");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];

    if (file) {
      savePhotoFile(file);
      return;
    }

    openPhotoFilePicker();
  });

  return dropzone;
}

function renderPhotoDialogContent() {
  if (!photoDialog || !photoContext) {
    return;
  }

  const { cityKey, index } = photoContext;
  const stop = itineraryCities[cityKey].stops[index];
  const hasPhoto = Boolean(getStopPhoto(cityKey, index));
  const title = photoDialog.querySelector("#photo-dialog-title");
  const message = photoDialog.querySelector("#photo-dialog-message");
  const actions = photoDialog.querySelector(".photo-dialog-actions");

  photoDialog.querySelectorAll("button, input").forEach((control) => {
    control.disabled = false;
  });
  title.textContent = stop.name;
  message.textContent = hasPhoto
    ? `${getSecretWelcomeMessage(cityKey, index)} Drag a new photo here, click the box to upload, or remove the current photo.`
    : `${getSecretWelcomeMessage(cityKey, index)} Drag a photo here or click the box to upload.`;

  if (!memoryStorageReady) {
    message.textContent = memoryStorageMessage || persistentStorageUnavailableMessage;
  }

  actions.replaceChildren();
  setPhotoDialogError();

  const dropzone = buildPhotoDropzone();
  const cancelButton = document.createElement("button");

  actions.append(dropzone);

  if (hasPhoto) {
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "photo-dialog-button danger";
    removeButton.textContent = "Remove photo";
    removeButton.addEventListener("click", removeCurrentPhoto);
    actions.append(removeButton);
  }

  cancelButton.type = "button";
  cancelButton.className = "photo-dialog-button ghost";
  cancelButton.textContent = "Cancel";
  cancelButton.addEventListener("click", closePhotoDialog);

  actions.append(cancelButton);
  dropzone.focus();
}

function openPhotoDialog(cityKey, index) {
  photoContext = { cityKey, index };
  setActiveLocation(cityKey, index, false);
  renderPhotoDialogContent();
  photoDialog.hidden = false;
  photoDialog.querySelector(".photo-dropzone, .photo-dialog-button")?.focus();
}

function createPhotoControls() {
  photoDialog = document.createElement("div");
  photoDialog.className = "photo-dialog";
  photoDialog.hidden = true;
  photoDialog.innerHTML = `
    <div class="photo-dialog-card" role="dialog" aria-modal="true" aria-labelledby="photo-dialog-title" aria-describedby="photo-dialog-message">
      <button class="photo-dialog-close" type="button" aria-label="Close photo options">x</button>
      <h3 id="photo-dialog-title"></h3>
      <p id="photo-dialog-message"></p>
      <p class="photo-dialog-error" id="photo-dialog-error" role="alert" hidden></p>
      <div class="photo-dialog-actions"></div>
    </div>
  `;

  photoFileInput = document.createElement("input");
  photoFileInput.type = "file";
  photoFileInput.accept = "image/*";
  photoFileInput.hidden = true;

  photoDialog.addEventListener("click", (event) => {
    if (event.target === photoDialog) {
      closePhotoDialog();
    }
  });
  photoDialog.querySelector(".photo-dialog-close").addEventListener("click", closePhotoDialog);
  photoFileInput.addEventListener("change", handlePhotoSelected);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && photoDialog && !photoDialog.hidden) {
      closePhotoDialog();
    }
  });

  document.body.append(photoDialog, photoFileInput);
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Photo could not be prepared."));
    }, type, quality);
  });
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.addEventListener("load", () => {
      URL.revokeObjectURL(url);
      resolve(image);
    });
    image.addEventListener("error", () => {
      URL.revokeObjectURL(url);
      reject(new Error("Photo could not be read."));
    });
    image.src = url;
  });
}

async function compressPhoto(file) {
  const image = await loadImage(file);
  const scale = Math.min(1, maxPhotoDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return canvasToBlob(canvas, "image/jpeg", photoCompressionQuality);
}

async function removeCurrentPhoto() {
  if (!photoContext) {
    return;
  }

  if (!memoryStorageReady) {
    setPhotoDialogError(memoryStorageMessage || persistentStorageUnavailableMessage);
    return;
  }

  const { cityKey, index } = photoContext;
  const id = getStopId(cityKey, index);

  try {
    setPhotoDialogBusy(true, "Removing photo...");
    await requestMemoryJson(`${memoryApiUrl}?cityKey=${encodeURIComponent(cityKey)}&index=${encodeURIComponent(index)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cityKey, index, passcode: getMemoryPasscode() }),
    });
    memoryMutationVersion += 1;
    delete savedMemoryPhotos[id];
    delete itineraryCities[cityKey].stops[index].userImage;
    if (collagePanelOpen) {
      renderCollagePanel(collageActiveTab);
    } else {
      renderLocationCards(cityKey);
    }
    setActiveLocation(cityKey, index, false);
    closePhotoDialog();
  } catch (error) {
    setPhotoDialogBusy(false, error.message);
  }
}

async function savePhotoFile(file) {
  if (!photoContext || !file) {
    return;
  }

  if (!isImageFile(file)) {
    setPhotoDialogError("Choose an image file.");
    return;
  }

  if (!memoryStorageReady) {
    setPhotoDialogError(memoryStorageMessage || persistentStorageUnavailableMessage);
    return;
  }

  const { cityKey, index } = photoContext;

  try {
    setPhotoDialogBusy(true, "Saving photo...");
    const compressedPhoto = await compressPhoto(file);
    const formData = new FormData();
    formData.append("cityKey", cityKey);
    formData.append("index", String(index));
    formData.append("passcode", getMemoryPasscode());
    formData.append("file", compressedPhoto, file.name.replace(/\.[a-z0-9]+$/i, ".jpg") || "memory.jpg");

    const data = await requestMemoryJson(memoryApiUrl, {
      method: "POST",
      body: formData,
    });
    const id = getStopId(cityKey, index);
    const existingJournal = savedMemoryPhotos[id]?.journal || "";
    memoryMutationVersion += 1;
    savedMemoryPhotos[id] = { ...data.photo, journal: existingJournal };
    delete itineraryCities[cityKey].stops[index].userImage;
    if (collagePanelOpen) {
      renderCollagePanel(collageActiveTab);
    } else {
      renderLocationCards(cityKey);
    }
    setActiveLocation(cityKey, index, false);
    closePhotoDialog();
  } catch (error) {
    setPhotoDialogBusy(false, error.message);
  }
}

async function handlePhotoSelected() {
  if (!photoContext || !photoFileInput.files.length) {
    return;
  }

  await savePhotoFile(photoFileInput.files[0]);
}

function setCollageDialogError(message = "") {
  const error = collageDialog?.querySelector("#collage-dialog-error");

  if (error) {
    error.textContent = message;
    error.hidden = !message;
  }
}

function setCollageDialogBusy(isBusy, message = "") {
  if (!collageDialog) {
    return;
  }

  collageDialog.querySelectorAll("button, input").forEach((control) => {
    control.disabled = isBusy;
  });
  setCollageDialogError(message);
}

function getCollageTileClass(photo, index) {
  const variants = ["", "wide", "tall", "soft"];
  const seed = `${photo.pathname || photo.url || "collage"}-${index}`;
  const total = seed.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);

  return variants[total % variants.length];
}

function closeCollageDialog() {
  if (collageDialog) {
    collageDialog.hidden = true;
    collageDialog.querySelectorAll("button, input").forEach((control) => {
      control.disabled = false;
    });
  }

  setCollageDialogError();
}

function openCollageDialog() {
  renderCollagePanel(collageActiveTab);
  loadSavedMemoryPhotos();
}

function openCollageManager() {
  renderCollageDialogContent();
  collageDialog.hidden = false;
  collageDialog.querySelector(".collage-dropzone, .collage-tab, button")?.focus();
  loadSavedMemoryPhotos();
}

function setActiveCollageSlot(index) {
  const slot = Number(index);

  activeCollageSlotIndex = Number.isInteger(slot) && slot >= 0 && slot < randomCollageMinimumSlots
    ? slot
    : getFirstAvailableCollageSlot();
}

function openCollageFilePicker() {
  if (!collageFileInput) {
    return;
  }

  if (!memoryStorageReady) {
    setCollageDialogError(memoryStorageMessage || persistentStorageUnavailableMessage);
    return;
  }

  collageFileInput.value = "";
  collageFileInput.click();
}

function buildCollageDropzone() {
  const dropzone = document.createElement("button");
  const label = document.createElement("strong");
  const hint = document.createElement("span");

  dropzone.type = "button";
  dropzone.className = "photo-dropzone collage-dropzone";
  label.textContent = "Add photo";
  hint.textContent = "Choose image";
  dropzone.append(label, hint);
  dropzone.addEventListener("click", openCollageFilePicker);

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("dragging");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove("dragging");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    const file = event.dataTransfer?.files?.[0];

    if (file) {
      saveCollagePhoto(file);
      return;
    }

    openCollageFilePicker();
  });

  return dropzone;
}

async function saveCollagePhoto(file) {
  if (!file) {
    return;
  }

  if (!isImageFile(file)) {
    setCollageDialogError("Choose an image file.");
    return;
  }

  if (!memoryStorageReady) {
    setCollageDialogError(memoryStorageMessage || persistentStorageUnavailableMessage);
    return;
  }

  const slotIndex = activeCollageSlotIndex;

  try {
    setCollageDialogBusy(true, "Saving collage photo...");
    const compressedPhoto = await compressPhoto(file);
    const currentSlotPhoto = savedCollagePhotos[slotIndex];
    const formData = new FormData();
    formData.append("action", "collage");
    formData.append("slot", String(slotIndex));
    formData.append("passcode", getMemoryPasscode());
    if (currentSlotPhoto?.pathname) {
      formData.append("previousPathname", currentSlotPhoto.pathname);
    }
    formData.append("file", compressedPhoto, file.name.replace(/\.[a-z0-9]+$/i, ".jpg") || "collage.jpg");

    const data = await requestMemoryJson(memoryApiUrl, {
      method: "POST",
      body: formData,
    });

    const confirmedCollage = normalizeCollageWithUploadedPhoto(data.collage, slotIndex, data.photo);
    memoryMutationVersion += 1;
    savedCollagePhotos = confirmedCollage;
    if (collagePanelOpen) {
      renderCollagePanel("random");
    }
    renderCollageDialogContent();
    setCollageDialogError();
  } catch (error) {
    setCollageDialogBusy(false, error.message);
  }
}

async function handleCollagePhotoSelected() {
  if (!collageFileInput?.files.length) {
    return;
  }

  await saveCollagePhoto(collageFileInput.files[0]);
}

async function removeCollagePhoto(pathname, slotIndex = activeCollageSlotIndex) {
  if (!memoryStorageReady) {
    setCollageDialogError(memoryStorageMessage || persistentStorageUnavailableMessage);
    return;
  }

  if (!window.confirm("Remove this collage photo?")) {
    return;
  }

  const removedSlot = Number(slotIndex);

  try {
    setCollageDialogBusy(true, "Removing collage photo...");
    const data = await requestMemoryJson(memoryApiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "collage", pathname, slot: removedSlot, passcode: getMemoryPasscode() }),
    });
    const confirmedCollage = normalizeCollageWithoutPhoto(data.collage, removedSlot, pathname);
    memoryMutationVersion += 1;
    savedCollagePhotos = confirmedCollage;
    if (collagePanelOpen) {
      renderCollagePanel("random");
    }
    renderCollageDialogContent();
  } catch (error) {
    setCollageDialogBusy(false, error.message);
  }
}

function buildCollagePhotoTile(photo, index) {
  const figure = document.createElement("figure");
  const image = document.createElement("img");
  const removeButton = document.createElement("button");
  const tileClass = getCollageTileClass(photo, index);

  figure.className = `collage-photo${tileClass ? ` ${tileClass}` : ""}`;
  image.src = photo.url;
  image.alt = "Collage memory";
  image.loading = "lazy";
  removeButton.type = "button";
  removeButton.className = "collage-remove";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => removeCollagePhoto(photo.pathname, photo.slot));
  figure.append(image, removeButton);

  return figure;
}

function getSavedMapMemoryEntries() {
  return Object.entries(savedMemoryPhotos)
    .map(([id, record]) => {
      const match = id.match(/^(myrtle|nyc)-(\d+)$/);

      if (!match || !record?.url) {
        return null;
      }

      const cityKey = match[1];
      const index = Number(match[2]);
      const city = itineraryCities[cityKey];
      const stop = city?.stops[index];

      if (!city || !stop) {
        return null;
      }

      return {
        id,
        cityKey,
        index,
        city,
        stop,
        record,
      };
    })
    .filter(Boolean)
    .sort((first, second) => new Date(second.record.uploadedAt || 0).getTime() - new Date(first.record.uploadedAt || 0).getTime());
}

function openMemoryFromCollage(cityKey, index) {
  closeCollageDialog();
  openMemoryViewer(cityKey, index);
}

function buildCollageMemoryTile(entry) {
  const button = document.createElement("button");
  const image = document.createElement("img");
  const copy = document.createElement("span");
  const title = document.createElement("strong");
  const meta = document.createElement("span");

  button.type = "button";
  button.className = "collage-memory-card";
  image.src = entry.record.url;
  image.alt = entry.stop.name;
  image.loading = "lazy";
  title.textContent = entry.stop.name;
  meta.textContent = entry.record.journal ? `${entry.city.shortName} - Journal saved` : entry.city.shortName;
  copy.className = "collage-memory-copy";
  copy.append(title, meta);
  button.append(image, copy);
  button.addEventListener("click", () => openMemoryFromCollage(entry.cityKey, entry.index));

  return button;
}

function buildCollageTabs() {
  const tabs = document.createElement("div");
  const randomButton = document.createElement("button");
  const memoriesButton = document.createElement("button");
  const mapMemoryCount = getSavedMapMemoryEntries().length;

  tabs.className = "collage-tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Collage views");

  randomButton.type = "button";
  randomButton.className = `collage-tab${collageActiveTab === "random" ? " active" : ""}`;
  randomButton.setAttribute("role", "tab");
  randomButton.setAttribute("aria-selected", String(collageActiveTab === "random"));
  randomButton.textContent = `Random (${getSavedCollagePhotoCount()})`;
  randomButton.addEventListener("click", () => {
    collageActiveTab = "random";
    renderCollageDialogContent();
  });

  memoriesButton.type = "button";
  memoriesButton.className = `collage-tab${collageActiveTab === "memories" ? " active" : ""}`;
  memoriesButton.setAttribute("role", "tab");
  memoriesButton.setAttribute("aria-selected", String(collageActiveTab === "memories"));
  memoriesButton.textContent = `Memories (${mapMemoryCount})`;
  memoriesButton.addEventListener("click", () => {
    collageActiveTab = "memories";
    renderCollageDialogContent();
  });

  tabs.append(randomButton, memoriesButton);

  return tabs;
}

function buildRandomCollagePanel() {
  const fragment = document.createDocumentFragment();
  const dropzone = buildCollageDropzone();
  const grid = document.createElement("div");
  const photos = getSavedCollagePhotos();

  grid.className = "collage-grid";
  if (photos.length) {
    grid.append(...photos.map((photo) => buildCollagePhotoTile(photo, photo.slot ?? 0)));
  } else {
    const empty = document.createElement("p");
    empty.className = "collage-empty";
    empty.textContent = "No random collage photos yet.";
    grid.append(empty);
  }

  fragment.append(dropzone, grid);

  return fragment;
}

function buildMapMemoriesPanel() {
  const grid = document.createElement("div");
  const entries = getSavedMapMemoryEntries();

  grid.className = "collage-memory-grid";
  if (entries.length) {
    grid.append(...entries.map(buildCollageMemoryTile));
  } else {
    const empty = document.createElement("p");
    empty.className = "collage-empty";
    empty.textContent = "No map memories yet. Add photos to places first.";
    grid.append(empty);
  }

  return grid;
}

function buildCollagePanelTabs() {
  const tabs = document.createElement("div");
  const randomButton = document.createElement("button");
  const memoriesButton = document.createElement("button");
  const mapMemoryCount = getSavedMapMemoryEntries().length;

  tabs.className = "collage-panel-tabs";
  tabs.setAttribute("role", "tablist");
  tabs.setAttribute("aria-label", "Collage view");

  randomButton.type = "button";
  randomButton.className = `collage-panel-tab${collageActiveTab === "random" ? " active" : ""}`;
  randomButton.setAttribute("role", "tab");
  randomButton.setAttribute("aria-selected", String(collageActiveTab === "random"));
  randomButton.textContent = `Random (${getSavedCollagePhotoCount()})`;
  randomButton.addEventListener("click", () => renderCollagePanel("random"));

  memoriesButton.type = "button";
  memoriesButton.className = `collage-panel-tab${collageActiveTab === "memories" ? " active" : ""}`;
  memoriesButton.setAttribute("role", "tab");
  memoriesButton.setAttribute("aria-selected", String(collageActiveTab === "memories"));
  memoriesButton.textContent = `Memories (${mapMemoryCount})`;
  memoriesButton.addEventListener("click", () => renderCollagePanel("memories"));

  tabs.append(randomButton, memoriesButton);

  return tabs;
}

function openCollagePhotoManager(event) {
  event?.stopPropagation();
  setActiveCollageSlot(event?.currentTarget?.closest(".collage-slot")?.dataset.collageSlot);
  collageActiveTab = "random";
  openCollageManager();
}

function closeFullscreenPhoto() {
  if (fullscreenPhotoViewer) {
    fullscreenPhotoViewer.hidden = true;
    fullscreenPhotoViewer.replaceChildren();
  }
}

function openFullscreenPhoto(photo, label = "Collage photo") {
  if (!fullscreenPhotoViewer || !photo?.url) {
    return;
  }

  const card = document.createElement("div");
  const closeButton = document.createElement("button");
  const image = document.createElement("img");

  card.className = "fullscreen-photo-card";
  closeButton.type = "button";
  closeButton.className = "photo-dialog-close fullscreen-photo-close";
  closeButton.setAttribute("aria-label", "Close full screen photo");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", closeFullscreenPhoto);
  image.src = photo.url;
  image.alt = label;
  image.decoding = "async";
  card.append(closeButton, image);
  fullscreenPhotoViewer.replaceChildren(card);
  fullscreenPhotoViewer.hidden = false;
  closeButton.focus();
}

function openRandomCollageFullscreen(event, photo, label) {
  event?.preventDefault();
  event?.stopPropagation();
  openFullscreenPhoto(photo, label);
}

function openCollageSlotManager(event, index) {
  event?.preventDefault();
  event?.stopPropagation();
  setActiveCollageSlot(index);
  collageActiveTab = "random";
  openCollageManager();
}

function removeRandomCollagePhoto(event, photo, index) {
  event?.preventDefault();
  event?.stopPropagation();

  if (!photo) {
    return;
  }

  setActiveCollageSlot(index);
  removeCollagePhoto(photo.pathname, index);
}

function buildCollageLocationCard(photo, index) {
  const card = document.createElement("article");
  const frame = document.createElement("button");
  const pin = document.createElement("span");
  const controls = document.createElement("div");
  const addButton = document.createElement("button");
  const fullButton = document.createElement("button");
  const removeButton = document.createElement("button");
  const nameInput = document.createElement("input");
  const body = document.createElement("div");
  const name = document.createElement("h4");
  const caption = document.createElement("p");
  const label = getCollageBoxLabel(index, photo);

  card.className = photo ? "location-card collage-slot random-collage-slot has-photo" : "location-card collage-slot random-collage-slot";
  card.dataset.collageSlot = String(index);
  frame.type = "button";
  frame.className = "location-photo";
  frame.setAttribute("aria-label", photo ? `Open random collage photo ${index + 1}` : `Add random collage photo ${index + 1}`);
  pin.className = "route-pin";
  pin.textContent = String(index + 1).padStart(2, "0");
  controls.className = "collage-box-controls";
  addButton.type = "button";
  addButton.className = "collage-box-control";
  addButton.textContent = photo ? "Replace Photo" : "Add Photo";
  addButton.addEventListener("click", (event) => openCollageSlotManager(event, index));
  fullButton.type = "button";
  fullButton.className = "collage-box-control";
  fullButton.textContent = "Full Screen Photo";
  fullButton.disabled = !photo;
  fullButton.addEventListener("click", (event) => openRandomCollageFullscreen(event, photo, label));
  removeButton.type = "button";
  removeButton.className = "collage-box-control danger";
  removeButton.textContent = "Remove Photo";
  removeButton.disabled = !photo;
  removeButton.addEventListener("click", (event) => removeRandomCollagePhoto(event, photo, index));
  nameInput.className = "collage-box-name-input";
  nameInput.type = "text";
  nameInput.value = getCollageBoxName(index);
  nameInput.placeholder = "Name this box";
  nameInput.setAttribute("aria-label", `Name collage box ${index + 1}`);
  nameInput.addEventListener("click", (event) => event.stopPropagation());
  nameInput.addEventListener("keydown", (event) => event.stopPropagation());
  nameInput.addEventListener("input", (event) => updateCollageBoxName(index, event.currentTarget.value, card));
  controls.append(addButton, fullButton, removeButton, nameInput);
  body.className = "location-copy";
  name.textContent = label;
  caption.textContent = "Travel collage";

  if (photo) {
    const fillImage = document.createElement("img");
    const image = document.createElement("img");
    fillImage.src = photo.url;
    fillImage.alt = "";
    fillImage.className = "collage-photo-fill";
    fillImage.loading = "lazy";
    fillImage.decoding = "async";
    fillImage.setAttribute("aria-hidden", "true");
    image.src = photo.url;
    image.alt = `Random collage photo ${index + 1}`;
    image.className = "collage-photo-main";
    image.loading = "lazy";
    image.decoding = "async";
    frame.append(fillImage, image);
  }

  frame.append(pin);
  body.append(name, caption);
  card.append(frame, controls, body);
  frame.addEventListener("click", (event) => openCollageSlotManager(event, index));

  return card;
}

function buildCollageMemoryLocationCard(entry, index) {
  const card = document.createElement("article");
  const frame = document.createElement("button");
  const pin = document.createElement("span");
  const action = document.createElement("span");
  const body = document.createElement("div");
  const name = document.createElement("h4");
  const caption = document.createElement("p");
  const image = document.createElement("img");

  card.className = "location-card collage-slot map-memory-slot has-photo";
  card.dataset.stopId = entry.id;
  frame.type = "button";
  frame.className = "location-photo";
  frame.setAttribute("aria-label", `Open memory for ${entry.stop.name}`);
  pin.className = "route-pin";
  pin.textContent = String(index + 1).padStart(2, "0");
  action.className = "photo-card-action";
  action.textContent = "View";
  body.className = "location-copy";
  name.textContent = entry.stop.name;
  caption.textContent = entry.record.journal ? `${entry.city.shortName} - Journal saved` : entry.city.shortName;
  image.src = entry.record.url;
  image.alt = entry.stop.name;
  image.loading = "lazy";
  image.decoding = "async";
  frame.append(image, pin, action);
  body.append(name, caption);
  card.append(frame, body);
  card.addEventListener("click", () => openMemoryFromCollage(entry.cityKey, entry.index));
  frame.addEventListener("click", (event) => {
    event.stopPropagation();
    openMemoryFromCollage(entry.cityKey, entry.index);
  });

  return card;
}

function renderCollagePanel(tab = "random") {
  const normalizedTab = tab === "memories" ? "memories" : "random";
  const title = normalizedTab === "memories" ? "Memory Photos" : "Random Collage";
  const kicker = normalizedTab === "memories" ? `${getSavedMapMemoryEntries().length} saved map memories` : `${getSavedCollagePhotoCount()} random photos`;

  collageActiveTab = normalizedTab;
  const tabs = buildCollagePanelTabs();

  collagePanelOpen = true;
  activeCityKey = "";
  clearActiveLocation();
  cityMarkerLayer.clearLayers();
  locationMarkerLayer.clearLayers();
  activeMarkers.clear();
  elements.cityControls.forEach((button) => {
    button.classList.remove("active");
    button.setAttribute("aria-pressed", "false");
  });
  elements.openCollage.classList.add("active");
  elements.openCollage.setAttribute("aria-pressed", "true");
  elements.selectedCityKicker.textContent = kicker;
  elements.selectedCityTitle.textContent = title;
  elements.locationPanel.querySelector(".collage-panel-tabs")?.remove();
  elements.selectedCityTitle.after(tabs);
  elements.locationGrid.className = "location-grid collage-location-grid";

  if (normalizedTab === "memories") {
    const entries = getSavedMapMemoryEntries();
    elements.locationGrid.replaceChildren(...entries.map(buildCollageMemoryLocationCard));
    if (!entries.length) {
      const empty = document.createElement("p");
      empty.className = "collage-location-empty";
      empty.textContent = "No map memories yet. Add photos to Myrtle Beach or NYC places first.";
      elements.locationGrid.append(empty);
    }
  } else {
    const slotCount = randomCollageMinimumSlots;
    const slots = Array.from({ length: slotCount }, (_, index) => buildCollageLocationCard(savedCollagePhotos[index], index));
    elements.locationGrid.replaceChildren(...slots);
  }

  elements.locationPanel.hidden = false;
  addCityMarkers();
  fitUsaView();
  elements.locationPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderCollageDialogContent() {
  if (!collageDialog) {
    return;
  }

  const card = document.createElement("div");
  const closeButton = document.createElement("button");
  const title = document.createElement("h3");
  const message = document.createElement("p");
  const error = document.createElement("p");
  const tabs = buildCollageTabs();
  const activePanel = collageActiveTab === "memories" ? buildMapMemoriesPanel() : buildRandomCollagePanel();
  const closeAction = document.createElement("button");

  card.className = "photo-dialog-card collage-card";
  card.setAttribute("role", "dialog");
  card.setAttribute("aria-modal", "true");
  card.setAttribute("aria-labelledby", "collage-dialog-title");
  card.setAttribute("aria-describedby", "collage-dialog-message");

  closeButton.type = "button";
  closeButton.className = "photo-dialog-close";
  closeButton.setAttribute("aria-label", "Close collage");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", closeCollageDialog);

  title.id = "collage-dialog-title";
  title.textContent = "Collage";
  message.id = "collage-dialog-message";
  message.textContent = memoryStorageReady
    ? "Add photos here."
    : memoryStorageMessage || persistentStorageUnavailableMessage;

  error.id = "collage-dialog-error";
  error.className = "photo-dialog-error";
  error.hidden = true;

  closeAction.type = "button";
  closeAction.className = "photo-dialog-button ghost";
  closeAction.textContent = "Close";
  closeAction.addEventListener("click", closeCollageDialog);

  card.append(closeButton, title, message, error, tabs, activePanel, closeAction);
  collageDialog.replaceChildren(card);
}

function createCollageControls() {
  collageDialog = document.createElement("div");
  collageDialog.className = "photo-dialog collage-dialog";
  collageDialog.hidden = true;

  collageFileInput = document.createElement("input");
  collageFileInput.type = "file";
  collageFileInput.accept = "image/*";
  collageFileInput.hidden = true;

  collageDialog.addEventListener("click", (event) => {
    if (event.target === collageDialog) {
      closeCollageDialog();
    }
  });
  collageFileInput.addEventListener("change", handleCollagePhotoSelected);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && collageDialog && !collageDialog.hidden) {
      closeCollageDialog();
    }
  });

  document.body.append(collageDialog, collageFileInput);
}

function buildViewerButton(label, className, onClick) {
  const button = document.createElement("button");

  button.type = "button";
  button.className = `photo-dialog-button ${className}`;
  button.textContent = label;
  button.addEventListener("click", onClick);

  return button;
}

function setMemoryViewerBusy(isBusy, message = "") {
  if (!memoryViewer) {
    return;
  }

  memoryViewer.querySelectorAll("button, input, textarea").forEach((control) => {
    control.disabled = isBusy;
  });

  const error = memoryViewer.querySelector("#journal-editor-error");

  if (error) {
    error.textContent = message;
    error.hidden = !message;
  }
}

function closeMemoryViewer() {
  if (memoryViewer) {
    memoryViewer.hidden = true;
  }

  viewerContext = null;
}

function openPhotoManagerFromViewer() {
  if (!viewerContext) {
    return;
  }

  const { cityKey, index } = viewerContext;
  closeMemoryViewer();
  openPhotoDialog(cityKey, index);
}

function renderMemoryViewer(mode = "view") {
  if (!memoryViewer || !viewerContext) {
    return;
  }

  const { cityKey, index } = viewerContext;
  const city = itineraryCities[cityKey];
  const stop = city.stops[index];
  const photo = getStopPhoto(cityKey, index);
  const journal = getStopJournal(cityKey, index);
  const card = document.createElement("div");
  const closeButton = document.createElement("button");

  card.className = mode === "journal" ? "memory-viewer-card journal-mode" : "memory-viewer-card";
  closeButton.type = "button";
  closeButton.className = "photo-dialog-close";
  closeButton.setAttribute("aria-label", "Close memory viewer");
  closeButton.textContent = "x";
  closeButton.addEventListener("click", closeMemoryViewer);
  card.append(closeButton);

  if (mode === "journal") {
    const title = document.createElement("h3");
    const message = document.createElement("p");
    const textarea = document.createElement("textarea");
    const error = document.createElement("p");
    const actions = document.createElement("div");

    title.textContent = "Memory journal";
    message.textContent = stop.name;
    textarea.id = "journal-editor-text";
    textarea.className = "journal-editor-text";
    textarea.maxLength = 900;
    textarea.placeholder = "Write a note for this memory...";
    textarea.value = journal;
    error.id = "journal-editor-error";
    error.className = "photo-dialog-error";
    error.hidden = true;
    actions.className = "photo-dialog-actions";
    actions.append(
      buildViewerButton("Save journal", "primary", saveCurrentJournal),
      buildViewerButton("Back", "ghost", () => renderMemoryViewer("view")),
    );
    card.append(title, message, textarea, error, actions);
    memoryViewer.replaceChildren(card);
    textarea.focus();
    return;
  }

  const title = document.createElement("h3");
  const polaroid = document.createElement("figure");
  const image = document.createElement("img");
  const caption = document.createElement("figcaption");
  const journalText = document.createElement("p");
  const actions = document.createElement("div");

  title.textContent = stop.name;
  polaroid.className = "polaroid-frame";
  image.src = photo;
  image.alt = stop.name;
  caption.textContent = city.shortName;
  journalText.className = journal ? "memory-journal-text" : "memory-journal-text empty";
  journalText.textContent = journal || "No journal yet.";
  actions.className = "photo-dialog-actions";
  actions.append(
    buildViewerButton(journal ? "Edit journal" : "Add journal", "secondary", () => renderMemoryViewer("journal")),
    buildViewerButton("Manage photo", "danger", openPhotoManagerFromViewer),
    buildViewerButton("Close", "ghost", closeMemoryViewer),
  );
  polaroid.append(image, caption);
  card.append(title, polaroid, journalText, actions);
  memoryViewer.replaceChildren(card);
  actions.querySelector("button")?.focus();
}

function openMemoryViewer(cityKey, index) {
  viewerContext = { cityKey, index };
  setActiveLocation(cityKey, index, false);
  renderMemoryViewer("view");
  memoryViewer.hidden = false;
}

async function saveCurrentJournal() {
  if (!viewerContext) {
    return;
  }

  if (!memoryStorageReady) {
    setMemoryViewerBusy(false, memoryStorageMessage || persistentStorageUnavailableMessage);
    return;
  }

  const { cityKey, index } = viewerContext;
  const id = getStopId(cityKey, index);
  const textarea = memoryViewer.querySelector("#journal-editor-text");

  const formData = new FormData();
  formData.append("action", "journal");
  formData.append("cityKey", cityKey);
  formData.append("index", String(index));
  formData.append("journal", textarea?.value || "");
  formData.append("passcode", getMemoryPasscode());

  try {
    setMemoryViewerBusy(true, "Saving journal...");
    const data = await requestMemoryJson(memoryApiUrl, {
      method: "POST",
      body: formData,
    });
    memoryMutationVersion += 1;
    savedMemoryPhotos[id] = {
      ...(savedMemoryPhotos[id] || {}),
      url: getStopPhoto(cityKey, index),
      journal: data.journal || "",
    };
    if (collagePanelOpen) {
      renderCollagePanel(collageActiveTab);
    } else {
      renderLocationCards(cityKey);
    }
    setActiveLocation(cityKey, index, false);
    renderMemoryViewer("view");
  } catch (error) {
    setMemoryViewerBusy(false, error.message);
    textarea?.focus();
  }
}

function createMemoryViewer() {
  memoryViewer = document.createElement("div");
  memoryViewer.className = "memory-viewer";
  memoryViewer.hidden = true;
  memoryViewer.addEventListener("click", (event) => {
    if (event.target === memoryViewer) {
      closeMemoryViewer();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && memoryViewer && !memoryViewer.hidden) {
      closeMemoryViewer();
    }
  });
  document.body.append(memoryViewer);
}

function createFullscreenPhotoViewer() {
  fullscreenPhotoViewer = document.createElement("div");
  fullscreenPhotoViewer.className = "fullscreen-photo-viewer";
  fullscreenPhotoViewer.hidden = true;
  fullscreenPhotoViewer.addEventListener("click", (event) => {
    if (event.target === fullscreenPhotoViewer) {
      closeFullscreenPhoto();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && fullscreenPhotoViewer && !fullscreenPhotoViewer.hidden) {
      closeFullscreenPhoto();
    }
  });
  document.body.append(fullscreenPhotoViewer);
}

function buildLocationCard(cityKey, city, stop, index) {
  const card = document.createElement("article");
  const frame = document.createElement("button");
  const pin = document.createElement("span");
  const action = document.createElement("span");
  const body = document.createElement("div");
  const name = document.createElement("h4");
  const address = document.createElement("p");
  const id = getStopId(cityKey, index);
  const photo = getStopPhoto(cityKey, index);

  card.className = photo ? "location-card has-photo" : "location-card";
  card.dataset.stopId = id;
  card.title = `${stop.name}\n${stop.address}`;
  frame.className = "location-photo";
  frame.type = "button";
  frame.setAttribute("aria-label", `${photo ? "Open memory" : "Add photo"} for ${stop.name}`);
  pin.className = "route-pin";
  pin.textContent = String(index + 1).padStart(2, "0");
  action.className = "photo-card-action";
  action.textContent = photo ? "View" : "+";
  body.className = "location-copy";
  name.textContent = stop.name;
  address.textContent = stop.address;

  if (photo) {
    const image = document.createElement("img");
    image.src = photo;
    image.alt = stop.name;
    image.loading = "lazy";
    image.decoding = "async";
    frame.append(image);
  }

  frame.append(pin, action);
  body.append(name, address);
  card.append(frame, body);
  card.addEventListener("click", () => setActiveLocation(cityKey, index));
  frame.addEventListener("click", (event) => {
    event.stopPropagation();
    if (photo) {
      openMemoryViewer(cityKey, index);
      return;
    }

    openPhotoDialog(cityKey, index);
  });

  return card;
}

function renderLocationCards(cityKey) {
  const city = itineraryCities[cityKey];

  elements.locationPanel.querySelector(".collage-panel-tabs")?.remove();
  elements.selectedCityKicker.textContent = city.cardKicker;
  elements.selectedCityTitle.textContent = city.name;
  elements.locationGrid.className = `location-grid continent-count-${city.stops.length}`;
  elements.locationGrid.replaceChildren(
    ...city.stops.map((stop, index) => buildLocationCard(cityKey, city, stop, index)),
  );
  elements.locationPanel.hidden = false;
}

function renderLocationMarkers(cityKey) {
  const city = itineraryCities[cityKey];

  activeMarkers.clear();
  locationMarkerLayer.clearLayers();

  city.stops.forEach((stop, index) => {
    const marker = L.marker([stop.lat, stop.lng], {
      icon: buildLocationIcon(city, index),
      keyboard: true,
      title: stop.name,
    });

    marker.bindTooltip(stop.name, {
      direction: "top",
      offset: [0, -14],
      opacity: 0.96,
    });
    marker.on("click", () => setActiveLocation(cityKey, index, false));
    marker.addTo(locationMarkerLayer);
    activeMarkers.set(getStopId(cityKey, index), marker);
  });
}

function setSelectedCity(cityKey) {
  const city = itineraryCities[cityKey];

  activeCityKey = cityKey;
  collagePanelOpen = false;
  clearActiveLocation();
  elements.openCollage.classList.remove("active");
  elements.openCollage.setAttribute("aria-pressed", "false");
  elements.cityControls.forEach((button) => {
    button.classList.toggle("active", button.dataset.city === cityKey);
    button.setAttribute("aria-pressed", String(button.dataset.city === cityKey));
  });

  cityMarkerLayer.clearLayers();
  renderLocationMarkers(cityKey);
  renderLocationCards(cityKey);

  map.fitBounds(getCityBounds(city), {
    padding: [48, 48],
    maxZoom: cityKey === "nyc" ? 13 : 11,
    animate: true,
  });
}

function resetMapView() {
  activeCityKey = "";
  collagePanelOpen = false;
  clearActiveLocation();
  cityMarkerLayer.clearLayers();
  locationMarkerLayer.clearLayers();
  activeMarkers.clear();
  elements.cityControls.forEach((button) => button.classList.remove("active"));
  elements.cityControls.forEach((button) => button.setAttribute("aria-pressed", "false"));
  elements.openCollage.classList.remove("active");
  elements.openCollage.setAttribute("aria-pressed", "false");
  elements.locationPanel.querySelector(".collage-panel-tabs")?.remove();
  elements.locationPanel.hidden = true;
  elements.locationGrid.replaceChildren();
  addCityMarkers();
  fitUsaView();
}

function addCityMarkers() {
  Object.entries(itineraryCities).forEach(([cityKey, city]) => {
    const marker = L.marker(city.cityPin, {
      icon: buildCityIcon(city),
      keyboard: true,
      title: city.name,
    });

    marker.on("click", () => setSelectedCity(cityKey));
    marker.addTo(cityMarkerLayer);
  });
}

function initializeMap() {
  if (!elements.map) {
    return;
  }

  if (!window.L) {
    elements.map.textContent = "Map could not load. Check your internet connection and refresh.";
    return;
  }

  map = L.map(elements.map, {
    zoomControl: true,
    scrollWheelZoom: false,
    minZoom: 2,
    maxZoom: 16,
    zoomDelta: 0.5,
    zoomSnap: 0.25,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map);

  cityMarkerLayer = L.layerGroup().addTo(map);
  locationMarkerLayer = L.layerGroup().addTo(map);
  addCityMarkers();
  fitUsaView();
}

updateCountdown();
setInterval(updateCountdown, 1000);
refreshDailyBibleReading();
window.addEventListener("focus", refreshDailyBibleReading);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    refreshDailyBibleReading();
  }
});

elements.memoryDrive.href = driveFolderUrl;
elements.cityControls.forEach((button) => {
  button.setAttribute("aria-pressed", "false");
  button.addEventListener("click", () => setSelectedCity(button.dataset.city));
});
elements.resetMap?.addEventListener("click", resetMapView);
if (elements.openCollage) {
  elements.openCollage.setAttribute("aria-pressed", "false");
  elements.openCollage.addEventListener("click", openCollageDialog);
}
elements.hugButton?.addEventListener("click", sendDistanceHug);
elements.saveFeeling?.addEventListener("click", saveTodayFeeling);
elements.feelingHistoryButton?.addEventListener("click", openFeelingHistory);
elements.feelingPasscode?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    saveTodayFeeling();
  }
});
if (elements.map) {
  createPhotoControls();
  createFullscreenPhotoViewer();
  loadSavedMemoryPhotos();
}
if (elements.openCollage) {
  createCollageControls();
}
createMemoryViewer();
createFeelingMeter();
createFeelingHistoryDialog();
syncTodayFeelingFromSaved();
initializeMap();
