import { useState, useEffect } from "react";
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Star, Clock, Navigation, Filter } from "lucide-react";

const mapsApi = "AIzaSyDCEDPDZZy5tkTMk1nGNlhkdvknnYk5Gyg";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const libraries: ("places")[] = ["places"];

// Your local sports venues data
const localSportsVenues = [
  { name: 'The Turf Arena Box Cricket and Football', address: '36 meter road, near, Surya Rd, opp. Avaniprastha, Sargasan, Gandhinagar', lat: 23.2002494, lng: 72.6087675, rating: 4.8, type: 'turf' },
  { name: 'Smash turf', address: '4HJ7+QCV, Ahmedabad', lat: 23.131794, lng: 72.56329300000002, rating: 4.6, type: 'turf' },
  { name: 'Elite Sports 1.0 Box cricket', address: "the elite sports, Service Rd, behind sachin's k cafe, near german greenfield Ring road, Bhat, Ahmedabad", lat: 23.1149944, lng: 72.6342708, rating: 4.7, type: 'cricket' },
  { name: 'STRIKERS SPORTS | BOX CRICKET & FOOTBALL TURF', address: 'NANA CHILODA CIRCLE, Sardar Patel Ring Rd, behind ANTILIA BUSINESS HUB, Ahmedabad', lat: 23.1109277, lng: 72.6721158, rating: 4.8, type: 'turf' },
  { name: 'Power Play Cricket Turf', address: 'Near Ambapur Petrol Pump, Koba-Adalaj Highway To Ambapur, Dist, Gandhinagar', lat: 23.1508067, lng: 72.6054575, rating: 4.9, type: 'cricket' },
  { name: 'Elite sports 2.0 ( Box cricket / Football & Pickle ball )', address: 'near Sangath Pearl, behind ratnaraj classic, GIDC Bhat, Motera, Ahmedabad', lat: 23.1088934, lng: 72.6098042, rating: 4.8, type: 'turf' },
  { name: 'ICONIC TURF VAVOL', address: 'Road, near Shri Khodiyar Temple, Vavol, Pundarasan, Gandhinagar', lat: 23.2324993, lng: 72.60491329999999, rating: 4.4, type: 'turf' },
  { name: 'Patel Brothers Box Cricket', address: 'Patel Brothers Box Cricket, Hillock Hotel Road, nr. Savitaba Cricle, Zundal, Ahmedabad', lat: 23.1416146, lng: 72.5673583, rating: 4.7, type: 'cricket' },
  { name: 'RWorld Arena Cricket & Football Turf', address: 'Adalaj', lat: 23.18104, lng: 72.5650949, rating: 4.5, type: 'turf' },
  { name: '7 King Cricket Box Arena', address: '4GWQ+QG6 SHREE ASHUTOSH FARMKHODIYAR, Umiya Dham Rd, near VAISHNODEVI DEVI CIRCLE, Ahmedabad, Khodiyar', lat: 23.1479693, lng: 72.53824399999999, rating: 4.2, type: 'cricket' },
  { name: 'Matrix 360 Box Cricket & Sports Club', address: 'Sr.No.62/2, Matrix 360, Circle, nr. Nayara Petrol Pump, Gujarat International Finance Tec-City, Gandhinagar', lat: 23.1845198, lng: 72.6728595, rating: 4.8, type: 'cricket' },
  { name: '3Ace Box Cricket and Pickleball', address: '4HHF+VGC, Ahmedabad', lat: 23.1296698, lng: 72.573224, rating: 4.8, type: 'pickleball' },
  { name: 'Phoenix Turf - Football, Box Cricket, Volleyball, Kabaddi and Hockey Booking', address: 'Survery no. 182, Opp Trilok Elegance Motera Bhat, Link Road, Motera Koteshwar Rd, Ahmedabad', lat: 23.1043888, lng: 72.6140358, rating: 4.2, type: 'turf' },
  { name: 'ONESTOP TURF BOX CRICKET', address: 'RUTA FARM PARTY PLOT, Adalaj, Shertha', lat: 23.1842594, lng: 72.55506969999999, rating: 4.8, type: 'cricket' },
  { name: 'All Stars Box Turf and Cafe', address: 'All Stars Box Turf and Cafe, near Parchadham Ramdevpir Temple Adalaj opposite Panchvati farmhouse society, Koba-Adalaj road, Ambapur, Gandhinagar', lat: 23.1545866, lng: 72.6013852, rating: 4.6, type: 'turf' },
  { name: 'Swing Sports', address: '5H6W+CFR, Koba-Adalaj Rd, Gandhinagar', lat: 23.1611112, lng: 72.5961414, rating: 4.5, type: 'turf' },
  { name: 'Cric Bees Box Arena', address: 'Sardar Patel Ring Rd, near Sadhi Petroleum(Nayara Petrol Pump, Ognaj, Ahmedabad', lat: 23.1113557, lng: 72.502195, rating: 4.8, type: 'cricket' },
  { name: 'Java Sports Academy', address: 'Plot No. 367/2/2 TP 234, opp. Mapple Parmeshwar Zundal, Ahmedabad', lat: 23.1276013, lng: 72.5723759, rating: 4.4, type: 'academy' },
  { name: 'Shivay, The Cricketing Hub, Karai', address: 'Karai Dam, Karai', lat: 23.133662, lng: 72.6583818, rating: 4.4, type: 'cricket' },
  { name: 'SGVP Cricket Ground', address: 'SGVP Cricket Ground, SGVP Campus,, Nr. SGVP circle, Chharodi, Ahmedabad', lat: 23.1311893, lng: 72.5384175, rating: 4.7, type: 'cricket' },
  { name: 'Malaviya Cricket Ground ONGC', address: '4H3Q+7F8, Mahavirnagar, ONGC Colony, Chandkheda, Ahmedabad', lat: 23.1031503, lng: 72.5886893, rating: 4.2, type: 'cricket' },
  { name: 'Green Oval', address: '5M26+W56', lat: 23.1522954, lng: 72.6603885, rating: 4.1, type: 'cricket' },
  { name: 'Huddle Arena', address: 'Elite Sports Academy, opp. Devshrusti -2, Bunglows, Motera, Ahmedabad', lat: 23.1019545, lng: 72.6047873, rating: 4.8, type: 'turf' },
  { name: 'Play Ground - Sector 3 new', address: '6J2H+72Q, Sector 3A New, Sector 3, Gandhinagar', lat: 23.2007078, lng: 72.6276216, rating: 4.2, type: 'playground' },
  { name: "Box warriors & Bachelor's Cafe", address: 'FP 315, TP 19, Raysan', lat: 23.164194, lng: 72.661194, rating: 4.5, type: 'cricket' },
  { name: 'Champions Arena (Pickleball / Cricket / Football)', address: 'B/s, Kd Hospital, Sardar Patel Ring Rd, nr. Vaishnodevi Circle, Ahmedabad, Khodiyar', lat: 23.1357766, lng: 72.53985349999999, rating: 3.7, type: 'pickleball' },
  { name: 'DAIICT Football/Cricket Ground', address: '5JRG+3Q3, Gandhinagar', lat: 23.1901319, lng: 72.6269319, rating: 4.6, type: 'football' },
  { name: 'All Season Box', address: 'Gandhinagar', lat: 23.1590982, lng: 72.6469506, rating: 4.9, type: 'cricket' },
  { name: 'ONGC Badminton Court', address: '4H3M+6G8, ONGC Colony, Chandkheda, Ahmedabad', lat: 23.1030263, lng: 72.5838295, rating: 4.5, type: 'badminton' },
  { name: 'Phoenix badminton academy', address: 'Opp Trilok Elegance Motera Bhat, Link Road, Motera Koteshwar Rd, Ahmedabad', lat: 23.1042686, lng: 72.613568, rating: 4.9, type: 'badminton' },
  { name: 'Savvy Swaraaj Sports Club', address: 'SAVVY SWARAAJ, Gota, Ahmedabad', lat: 23.1044849, lng: 72.54938489999999, rating: 4.4, type: 'sports' },
  { name: 'Phoenix Sports Academy', address: 'Survery no. 182, Opp Trilok Elegance Motera Bhat, Link Road, Motera Koteshwar Rd, Ahmedabad', lat: 23.1042786, lng: 72.61377329999999, rating: 4.9, type: 'academy' },
  { name: 'Dk badminton academy', address: 'Sakar English School, SAKAR ENGLISH SCHOOL, New CG Rd, Nigam Nagar, Chandkheda, Ahmedabad', lat: 23.1087548, lng: 72.5916926, rating: 4.9, type: 'badminton' },
  { name: 'H3 Sports Academy', address: 'Nr. H3, World School, Tragad Gam Rd, opp. DUTT PARISAR, Tragad, Ahmedabad', lat: 23.1273275, lng: 72.5652159, rating: 4.4, type: 'academy' },
  { name: 'DA-IICT Badminton Courts', address: '5JQG+PM7, Infocity, Gandhinagar', lat: 23.1893004, lng: 72.6265453, rating: 4, type: 'badminton' },
  { name: 'Aloka Sports Academy', address: '1020 Lavarpur, lavarpur - prantiya, road, near GIFT city, Gandhinagar', lat: 23.1888688, lng: 72.70829719999999, rating: 4.2, type: 'academy' },
  { name: 'Lakshya Sports Academy', address: 'Road, opp. Aakruti Elegance, nr. Godrej Garden City Road, New Chamunda Society, Godrej Garden City, Jagatpur, Tragad, Ahmedabad', lat: 23.1188462, lng: 72.5566959, rating: 4.9, type: 'academy' },
  { name: 'VGEC Gymkhana', address: 'C Block, VGEC, Chandkheda, Ahmedabad', lat: 23.1068136, lng: 72.5943028, rating: 4.5, type: 'sports' },
  { name: 'NCCMA Club North', address: 'North Club, New Chamunda Society, Godrej Garden City, Chandkheda, Ahmedabad', lat: 23.1155553, lng: 72.5560642, rating: 4.7, type: 'sports' },
  { name: 'Sai Sports Training Centre', address: 'Sports Authority of India, Sector 15, Gandhinagar', lat: 23.2342665, lng: 72.6343831, rating: 4.4, type: 'academy' },
  { name: 'Elite Pickle Ball Motera', address: 'Elite sports 2.0 near sangath pearl, motera, Chandkheda, Ahmedabad', lat: 23.1089653, lng: 72.60967409999999, rating: 4.3, type: 'pickleball' },
  { name: 'Pickleball Legends', address: '5H77+VXW, canal, Sarkhej - Gandhinagar Hwy, near adalaj, Adalaj', lat: 23.1646875, lng: 72.5649375, rating: 4.9, type: 'pickleball' },
  { name: 'Akshar Sports Academy', address: '4HF8+WX2 SANIDHYA ROYAL, 100ft Tragad Rd, near Akshar Sports Academy, New, Chandkheda, Ahmedabad', lat: 23.1248432, lng: 72.5667988, rating: 4.5, type: 'academy' },
  { name: 'IIT Gandhinagar Sports Complex', address: '6M6Q+HJJ, Gandhinagar', lat: 23.211442, lng: 72.689014, rating: 4.8, type: 'sports' },
  { name: 'Tennis court', address: '4JC2+JG9, Nigam Nagar, Chandkheda, Ahmedabad', lat: 23.1215325, lng: 72.60137139999999, rating: 5, type: 'tennis' },
  { name: 'Shree Balaji Agora Residency - Basket Ball Court', address: '4J9F+9W9, Sardar Patel Ring Rd, Sughad, Ahmedabad', lat: 23.1184059, lng: 72.62487399999999, rating: 4.3, type: 'basketball' },
  { name: 'IIT Gandhinagar New Basketball Court', address: '6M6M+GRP, Unnamed Road', lat: 23.2113257, lng: 72.6845779, rating: 4.8, type: 'basketball' },
  { name: 'IIT Gandhinagar Basketball Court 2', address: '6M6M+GCH, Gandhinagar', lat: 23.211324, lng: 72.6835998, rating: 4.7, type: 'basketball' },
  { name: 'DA-IICT Basketball COurt', address: '5JRG+7HV, Gandhinagar', lat: 23.1907316, lng: 72.62643299999999, rating: 3.4, type: 'basketball' },
  { name: 'Basketball court', address: '5HQH+WH8, Amba Township', lat: 23.1897855, lng: 72.5789458, rating: 5, type: 'basketball' },
  { name: "St. Xavier's School Basketball Ground", address: '1661, Rd Number 3, Sector 7, Gandhinagar', lat: 23.2102399, lng: 72.6498665, rating: 4.6, type: 'basketball' },
  { name: 'Cricket Ground, Nirma Vidyavihar', address: '4GHW+5P3, Nirma University Rd, near institute of science(ISNU, Ahmedabad', lat: 23.1278831, lng: 72.5467841, rating: 4.6, type: 'cricket' },
  { name: 'Drona Sports Academy', address: 'Drona Sports Academy, Ahmedabad', lat: 23.1315435, lng: 72.63706719999999, rating: 4.7, type: 'academy' },
  { name: 'I.C.T.A TENNIS ACADEMY', address: 's resort, Ch - 0 infocity club, Ahmedabad highway, Gandhinagar', lat: 23.1950197, lng: 72.6366501, rating: 4.8, type: 'tennis' },
  { name: 'CRPF BASKETBALL COURT', address: 'GC crpf, Gandhinagar', lat: 23.2526111, lng: 72.6940434, rating: 4.7, type: 'basketball' },
  { name: 'Monic Chowk', address: '5M36+M4, Raysan', lat: 23.154153, lng: 72.6602805, rating: 5, type: 'playground' },
  { name: 'Ace Bounce Pickleball', address: 'next to Hari heights, Kudasan, Gandhinagar', lat: 23.1713278, lng: 72.6343023, rating: 4.9, type: 'pickleball' },
  { name: "𝗙𝗟𝗜𝗖𝗞 '𝗡 𝗥𝗢𝗟𝗟 | 𝗕𝗲𝘀𝘁 𝗣𝗶𝗰𝗸𝗹𝗲𝗯𝗮𝗹𝗹 𝗜𝗻 𝗚𝗮𝗻𝗱𝗵𝗶𝗻𝗮𝗴𝗮𝗿", address: "FLICK 'N ROLL , Chh, 3, Nr. Parinam Circle, Gandhinagar", lat: 23.208178, lng: 72.65421789999999, rating: 5, type: 'pickleball' },
  { name: 'Asterix', address: '5H77+VXW, Canal Road, Sarkhej - Gandhinagar Hwy, near Adalaj, Adalaj', lat: 23.1646596, lng: 72.5648914, rating: 5, type: 'cafe' },
  { name: 'PICKLE HUB', address: "Near, Vaishnodevi Cir, near Shambhu's Coffee Bar, Ahmedabad, Khodiyar", lat: 23.1333151, lng: 72.5411123, rating: 3.6, type: 'pickleball' },
  { name: 'Pickle Park', address: 'near Anand Niketan School, Sughad, Gandhinagar, Ahmedabad', lat: 23.1228897, lng: 72.6343009, rating: 4.6, type: 'pickleball' },
  { name: 'Thunder box cricket & pickle ball', address: 'near Dwarkesh Antilia, opp. Decathlon, GIDC Bhat, Motera, Ahmedabad', lat: 23.1118806, lng: 72.6082814, rating: 4.3, type: 'pickleball' },
  { name: 'SwingZone Box Cricket & Pickle Ball', address: 'Gota - Jagatpur Rd, near Chacha Chaudhary Tea And Snacks Corner, opp. Godrej Garden City, Gota, Ahmedabad', lat: 23.106312, lng: 72.55326350000001, rating: 4.6, type: 'pickleball' },
  { name: 'Zodiac Cricket Ground By Point Red Sports Club', address: 'Shaligram Lakeview Lane, Zodiac Cricket Ground, Zodiac Party Plot, Sarkhej - Gandhinagar Hwy, behind Vaishno Devi Temple, Ahmedabad', lat: 23.1392468, lng: 72.55004989999999, rating: 5, type: 'cricket' },
  { name: 'Pramukh Sports Ground', address: 'Nr Santosa Neemland Ahmedabad, Mehsana Highway Road, Adalaj', lat: 23.147414, lng: 72.5892321, rating: 4.1, type: 'sports' },
  { name: 'Sports Club- Vollyball Ground', address: 'near vollyball ground, Sector 4B, Sector 4, Gandhinagar', lat: 23.2116169, lng: 72.6214598, rating: 3.6, type: 'volleyball' },
  { name: 'GROUND 83', address: 'Survey no 286, nr. kotak bungalow, shilpgram 1 road, near Sardar Dham Road, vaishnodevi, Ahmedabad, Lilapur', lat: 23.1482261, lng: 72.52596129999999, rating: 4.6, type: 'sports' },
  { name: 'SwingZone 2 Box Cricket', address: '4HJF+JXG, Chandkheda - Zundal Rd, Chandkheda, Ahmedabad', lat: 23.1315722, lng: 72.5749503, rating: 4.3, type: 'cricket' },
  { name: 'Champion Sports Academy', address: 'Shlok Rd, Chandkheda, Ahmedabad', lat: 23.1139517, lng: 72.5762056, rating: 4.7, type: 'academy' },
  { name: 'Smashboundary Box Cricket & volleyball', address: 'Survey no.404, nr badiyadev Mandir, Por-adalaj, Road, Por, Gandhinagar', lat: 23.1680067, lng: 72.6067987, rating: 4.9, type: 'volleyball' },
  { name: 'Umiya Cricket Ground', address: '4GJF+75X, Sardar Patel Ring Rd, Ahmedabad', lat: 23.1307406, lng: 72.52297279999999, rating: 4.3, type: 'cricket' },
  { name: 'Dadobat Sports & Cafe | Cricket Box | Science City', address: 'Sardar Patel Ring Rd, behind VEDANT KADAM BUNGALOWS, nr. Babylon Club, Science City, Ahmedabad', lat: 23.1012162, lng: 72.5039702, rating: 4.7, type: 'cricket' },
  { name: 'The Seven Sky Box Cricket', address: 'Near Gwalbhog, Tapovan Cir, Nigam Nagar, Chandkheda, Ahmedabad', lat: 23.1182613, lng: 72.6122676, rating: 4.9, type: 'cricket' }
];

const NearbySports: React.FC = () => {
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral>();
  const [filteredPlaces, setFilteredPlaces] = useState(localSportsVenues);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [selectedSport, setSelectedSport] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: mapsApi as string,
    libraries,
  });

  const sportTypes = [
    { value: "all", label: "All Sports", icon: "🏟️", color: "#10B981" },
    { value: "turf", label: "Turf", icon: "🏈", color: "#059669" },
    { value: "cricket", label: "Cricket", icon: "🏏", color: "#DC2626" },
    { value: "basketball", label: "Basketball", icon: "🏀", color: "#EA580C" },
    { value: "badminton", label: "Badminton", icon: "🏸", color: "#7C3AED" },
    { value: "tennis", label: "Tennis", icon: "🎾", color: "#059669" },
    { value: "football", label: "Football", icon: "⚽", color: "#0D9488" },
    { value: "pickleball", label: "Pickleball", icon: "🏓", color: "#7C2D12" },
    { value: "volleyball", label: "Volleyball", icon: "🏐", color: "#B45309" },
    { value: "academy", label: "Sports Academy", icon: "🏫", color: "#1D4ED8" },
    { value: "sports", label: "Sports Club", icon: "🎯", color: "#DB2777" },
  ];

  // Get user location (default to Gandhinagar)
  useEffect(() => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
        },
        () => {
          // Default to Gandhinagar center
          setCurrentPosition({ lat: 23.2156, lng: 72.6369 });
          setIsLoading(false);
        }
      );
    } else {
      setCurrentPosition({ lat: 23.2156, lng: 72.6369 });
      setIsLoading(false);
    }
  }, []);

  // Filter venues by sport type
  useEffect(() => {
    if (selectedSport === "all") {
      setFilteredPlaces(localSportsVenues);
    } else {
      setFilteredPlaces(localSportsVenues.filter(venue => venue.type === selectedSport));
    }
  }, [selectedSport]);

  const getSportIcon = (type: string) => {
    const sport = sportTypes.find(s => s.value === type);
    return sport?.icon || "🏟️";
  };

  const getSportColor = (type: string) => {
    const sport = sportTypes.find(s => s.value === type);
    return sport?.color || "#10B981";
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Sports Map...</p>
        </div>
      </div>
    );
  }

  const currentSport = sportTypes.find(sport => sport.value === selectedSport);

  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{currentSport?.icon}</span>
          <h1 className="text-xl font-bold">
            {selectedSport === "all" ? "All Sports Venues" : currentSport?.label} - Gandhinagar & Ahmedabad
          </h1>
        </div>
        <p className="opacity-90 text-sm">
          Showing {filteredPlaces.length} venues • Real locations with ratings
        </p>
      </div>

      {/* Sport Filter */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter by Sport:</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {sportTypes.map((sport) => (
            <button
              key={sport.value}
              onClick={() => setSelectedSport(sport.value)}
              className={`p-3 rounded-lg text-center transition-all duration-200 ${
                selectedSport === sport.value
                  ? "bg-blue-600 text-white shadow-md transform scale-105"
                  : "bg-white text-gray-700 hover:bg-gray-100 border"
              }`}
            >
              <div className="text-lg mb-1">{sport.icon}</div>
              <div className="text-xs font-medium">{sport.label.split(' ')[0]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={currentPosition}
          zoom={11}
          options={{
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {/* User location marker */}
          {currentPosition && (
            <Marker
              position={currentPosition}
              title="You are here"
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#3B82F6" stroke="white" stroke-width="3"/>
                    <circle cx="12" cy="12" r="4" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(24, 24),
              }}
            />
          )}

          {/* Sports venue markers */}
          {filteredPlaces.map((place, idx) => (
            <Marker
              key={`${place.name}-${idx}`}
              position={{ lat: place.lat, lng: place.lng }}
              onClick={() => setSelectedPlace(place)}
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" fill="${getSportColor(place.type)}" stroke="white" stroke-width="2"/>
                    <text x="16" y="20" text-anchor="middle" fill="white" font-size="14" font-weight="bold">${getSportIcon(place.type)}</text>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
              }}
            />
          ))}

          {/* Info Window */}
          {selectedPlace && (
            <InfoWindow
              position={{ lat: selectedPlace.lat, lng: selectedPlace.lng }}
              onCloseClick={() => setSelectedPlace(null)}
            >
              <div className="p-3 max-w-sm">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-lg">{getSportIcon(selectedPlace.type)}</span>
                  <h3 className="font-bold text-base text-gray-800 leading-tight">
                    {selectedPlace.name}
                  </h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="h-3 w-3 mt-1 flex-shrink-0" />
                    <span className="leading-tight">{selectedPlace.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="font-medium">
                      {selectedPlace.rating} ⭐ • {selectedPlace.type.charAt(0).toUpperCase() + selectedPlace.type.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.lat},${selectedPlace.lng}`, '_blank')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Navigation className="h-3 w-3" />
                    Directions
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPlace.name + " " + selectedPlace.address)}`, '_blank')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    View on Maps
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Venues List */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            {selectedSport === "all" ? "All Venues" : `${currentSport?.label} (${filteredPlaces.length})`}
          </h2>
          <div className="text-sm text-gray-500">
            Tap any venue for details
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {filteredPlaces
            .sort((a, b) => b.rating - a.rating) // Sort by rating
            .map((place, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPlace(place)}
              className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition-shadow border"
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getSportIcon(place.type)}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-800 leading-tight truncate">
                    {place.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">{place.rating}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 capitalize">{place.type}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {place.address}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No results message */}
      {filteredPlaces.length === 0 && (
        <div className="p-8 text-center text-gray-500 bg-gray-50">
          <div className="text-4xl mb-4">{currentSport?.icon}</div>
          <h3 className="text-lg font-medium mb-2">No {currentSport?.label.toLowerCase()} found</h3>
          <p className="text-sm">Try selecting a different sport category.</p>
        </div>
      )}
    </div>
  );
};

export default NearbySports;