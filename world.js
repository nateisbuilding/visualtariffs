document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing map...");

    // Tariff data for countries as of April 12 2025
    const tariffData = {
        "European Union": { imports: "18.5%", previous: "20%", updated: "10%" },
        "China": { imports: "13.4%", previous: "34%", updated: "145%" },
        "Japan": { imports: "4.5%", previous: "24%", updated: "10%" },
        "Vietnam": { imports: "4.2%", previous: "46%", updated: "10%" },
        "South Korea": { imports: "4%", previous: "25%", updated: "10%" },
        "Taiwan": { imports: "3.6%", previous: "32%", updated: "10%" },
        "India": { imports: "2.7%", previous: "26%", updated: "10%" },
        "United Kingdom": { imports: "2.1%", previous: "10%", updated: "10%" },
        "Switzerland": { imports: "1.9%", previous: "31%", updated: "10%" },
        "Thailand": { imports: "1.9%", previous: "36%", updated: "10%" },
        "Malaysia": { imports: "1.6%", previous: "24%", updated: "10%" },
        "Brazil": { imports: "1.3%", previous: "10%", updated: "10%" },
        "Singapore": { imports: "1.3%", previous: "10%", updated: "10%" },
        "Afghanistan": { imports: "<1%", previous: "10%", updated: "10%" },
        "Albania": { imports: "<1%", previous: "10%", updated: "10%" },
        "Algeria": { imports: "<1%", previous: "30%", updated: "10%" },
        "Andorra": { imports: "<1%", previous: "10%", updated: "10%" },
        "Angola": { imports: "<1%", previous: "32%", updated: "10%" },
        "Anguilla": { imports: "<1%", previous: "10%", updated: "10%" },
        "Antigua and Barbuda": { imports: "<1%", previous: "10%", updated: "10%" },
        "Argentina": { imports: "<1%", previous: "10%", updated: "10%" },
        "Armenia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Aruba": { imports: "<1%", previous: "10%", updated: "10%" },
        "Australia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Azerbaijan": { imports: "<1%", previous: "10%", updated: "10%" },
        "Bahamas": { imports: "<1%", previous: "10%", updated: "10%" },
        "Bahrain": { imports: "<1%", previous: "10%", updated: "10%" },
        "Bangladesh": { imports: "<1%", previous: "37%", updated: "10%" },
        "Barbados": { imports: "<1%", previous: "10%", updated: "10%" },
        "Belize": { imports: "<1%", previous: "10%", updated: "10%" },
        "Benin": { imports: "<1%", previous: "10%", updated: "10%" },
        "Bermuda": { imports: "<1%", previous: "10%", updated: "10%" },
        "Bhutan": { imports: "<1%", previous: "10%", updated: "10%" },
        "Bolivia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Bosnia and Herzegovina": { imports: "<1%", previous: "35%", updated: "10%" },
        "Botswana": { imports: "<1%", previous: "37%", updated: "10%" },
        "British Indian Ocean Territory": { imports: "<1%", previous: "10%", updated: "10%" },
        "British Virgin Islands": { imports: "<1%", previous: "10%", updated: "10%" },
        "Brunei": { imports: "<1%", previous: "24%", updated: "10%" },
        "Burundi": { imports: "<1%", previous: "10%", updated: "10%" },
        "Cambodia": { imports: "<1%", previous: "49%", updated: "10%" },
        "Cameroon": { imports: "<1%", previous: "11%", updated: "10%" },
        "Cape Verde": { imports: "<1%", previous: "10%", updated: "10%" },
        "Cayman Islands": { imports: "<1%", previous: "10%", updated: "10%" },
        "Central African Republic": { imports: "<1%", previous: "10%", updated: "10%" },
        "Chad": { imports: "<1%", previous: "13%", updated: "10%" },
        "Chile": { imports: "<1%", previous: "10%", updated: "10%" },
        "Christmas Island": { imports: "<1%", previous: "10%", updated: "10%" },
        "Cocos (Keeling) Islands": { imports: "<1%", previous: "10%", updated: "10%" },
        "Colombia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Comoros": { imports: "<1%", previous: "10%", updated: "10%" },
        "Cook Islands": { imports: "<1%", previous: "10%", updated: "10%" },
        "Costa Rica": { imports: "<1%", previous: "10%", updated: "10%" },
        "Côte d'Ivoire": { imports: "<1%", previous: "21%", updated: "10%" },
        "Curaçao": { imports: "<1%", previous: "10%", updated: "10%" },
        "Democratic Republic of the Congo": { imports: "<1%", previous: "11%", updated: "10%" },
        "Djibouti": { imports: "<1%", previous: "10%", updated: "10%" },
        "Dominica": { imports: "<1%", previous: "10%", updated: "10%" },
        "Dominican Republic": { imports: "<1%", previous: "10%", updated: "10%" },
        "Ecuador": { imports: "<1%", previous: "10%", updated: "10%" },
        "Egypt": { imports: "<1%", previous: "10%", updated: "10%" },
        "El Salvador": { imports: "<1%", previous: "10%", updated: "10%" },
        "Equatorial Guinea": { imports: "<1%", previous: "13%", updated: "10%" },
        "Eritrea": { imports: "<1%", previous: "10%", updated: "10%" },
        "Eswatini (Swaziland)": { imports: "<1%", previous: "10%", updated: "10%" },
        "Ethiopia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Falkland Islands": { imports: "<1%", previous: "41%", updated: "10%" },
        "Fiji": { imports: "<1%", previous: "32%", updated: "10%" },
        "French Guiana": { imports: "<1%", previous: "10%", updated: "10%" },
        "French Polynesia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Gabon": { imports: "<1%", previous: "10%", updated: "10%" },
        "Gambia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Georgia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Ghana": { imports: "<1%", previous: "10%", updated: "10%" },
        "Gibraltar": { imports: "<1%", previous: "10%", updated: "10%" },
        "Grenada": { imports: "<1%", previous: "10%", updated: "10%" },
        "Guadeloupe": { imports: "<1%", previous: "10%", updated: "10%" },
        "Guatemala": { imports: "<1%", previous: "10%", updated: "10%" },
        "Guinea": { imports: "<1%", previous: "10%", updated: "10%" },
        "Guinea-Bissau": { imports: "<1%", previous: "10%", updated: "10%" },
        "Guyana": { imports: "<1%", previous: "38%", updated: "10%" },
        "Haiti": { imports: "<1%", previous: "10%", updated: "10%" },
        "Honduras": { imports: "<1%", previous: "10%", updated: "10%" },
        "Iceland": { imports: "<1%", previous: "10%", updated: "10%" },
        "Indonesia": { imports: "<1%", previous: "32%", updated: "10%" },
        "Iran": { imports: "<1%", previous: "10%", updated: "10%" },
        "Iraq": { imports: "<1%", previous: "39%", updated: "10%" },
        "Israel": { imports: "<1%", previous: "17%", updated: "10%" },
        "Jamaica": { imports: "<1%", previous: "10%", updated: "10%" },
        "Jordan": { imports: "<1%", previous: "20%", updated: "10%" },
        "Kazakhstan": { imports: "<1%", previous: "27%", updated: "10%" },
        "Kenya": { imports: "<1%", previous: "10%", updated: "10%" },
        "Kiribati": { imports: "<1%", previous: "10%", updated: "10%" },
        "Kosovo": { imports: "<1%", previous: "10%", updated: "10%" },
        "Kuwait": { imports: "<1%", previous: "10%", updated: "10%" },
        "Kyrgyzstan": { imports: "<1%", previous: "10%", updated: "10%" },
        "Laos": { imports: "<1%", previous: "48%", updated: "10%" },
        "Lebanon": { imports: "<1%", previous: "10%", updated: "10%" },
        "Lesotho": { imports: "<1%", previous: "50%", updated: "10%" },
        "Liberia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Libya": { imports: "<1%", previous: "31%", updated: "10%" },
        "Liechtenstein": { imports: "<1%", previous: "37%", updated: "10%" },
        "Madagascar": { imports: "<1%", previous: "47%", updated: "10%" },
        "Malawi": { imports: "<1%", previous: "17%", updated: "10%" },
        "Maldives": { imports: "<1%", previous: "10%", updated: "10%" },
        "Mali": { imports: "<1%", previous: "10%", updated: "10%" },
        "Marshall Islands": { imports: "<1%", previous: "10%", updated: "10%" },
        "Martinique": { imports: "<1%", previous: "10%", updated: "10%" },
        "Mauritania": { imports: "<1%", previous: "10%", updated: "10%" },
        "Mauritius": { imports: "<1%", previous: "40%", updated: "10%" },
        "Mayotte": { imports: "<1%", previous: "10%", updated: "10%" },
        "Micronesia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Moldova": { imports: "<1%", previous: "31%", updated: "10%" },
        "Monaco": { imports: "<1%", previous: "10%", updated: "10%" },
        "Mongolia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Montenegro": { imports: "<1%", previous: "10%", updated: "10%" },
        "Montserrat": { imports: "<1%", previous: "10%", updated: "10%" },
        "Morocco": { imports: "<1%", previous: "10%", updated: "10%" },
        "Mozambique": { imports: "<1%", previous: "16%", updated: "10%" },
        "Myanmar": { imports: "<1%", previous: "44%", updated: "10%" },
        "Namibia": { imports: "<1%", previous: "21%", updated: "10%" },
        "Nauru": { imports: "<1%", previous: "30%", updated: "10%" },
        "Nepal": { imports: "<1%", previous: "10%", updated: "10%" },
        "New Zealand": { imports: "<1%", previous: "10%", updated: "10%" },
        "Nicaragua": { imports: "<1%", previous: "18%", updated: "10%" },
        "Niger": { imports: "<1%", previous: "10%", updated: "10%" },
        "Nigeria": { imports: "<1%", previous: "14%", updated: "10%" },
        "North Macedonia": { imports: "<1%", previous: "33%", updated: "10%" },
        "Norway": { imports: "<1%", previous: "15%", updated: "10%" },
        "Oman": { imports: "<1%", previous: "10%", updated: "10%" },
        "Pakistan": { imports: "<1%", previous: "29%", updated: "10%" },
        "Panama": { imports: "<1%", previous: "10%", updated: "10%" },
        "Papua New Guinea": { imports: "<1%", previous: "10%", updated: "10%" },
        "Paraguay": { imports: "<1%", previous: "10%", updated: "10%" },
        "Peru": { imports: "<1%", previous: "10%", updated: "10%" },
        "Philippines": { imports: "<1%", previous: "17%", updated: "10%" },
        "Qatar": { imports: "<1%", previous: "10%", updated: "10%" },
        "Republic of the Congo": { imports: "<1%", previous: "10%", updated: "10%" },
        "Rwanda": { imports: "<1%", previous: "10%", updated: "10%" },
        "Saint Helena": { imports: "<1%", previous: "10%", updated: "10%" },
        "Saint Kitts and Nevis": { imports: "<1%", previous: "10%", updated: "10%" },
        "Saint Lucia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Saint Vincent and the Grenadines": { imports: "<1%", previous: "10%", updated: "10%" },
        "Samoa": { imports: "<1%", previous: "10%", updated: "10%" },
        "San Marino": { imports: "<1%", previous: "10%", updated: "10%" },
        "São Tomé and Príncipe": { imports: "<1%", previous: "10%", updated: "10%" },
        "Saudi Arabia": { imports: "<1%", previous: "10%", updated: "10%" },
        "Senegal": { imports: "<1%", previous: "10%", updated: "10%" },
        "Serbia": { imports: "<1%", previous: "37%", updated: "10%" },
        "Sierra Leone": { imports: "<1%", previous: "10%", updated: "10%" },
        "Sint Maarten": { imports: "<1%", previous: "10%", updated: "10%" },
        "Solomon Islands": { imports: "<1%", previous: "10%", updated: "10%" },
        "South Africa": { imports: "<1%", previous: "30%", updated: "10%" },
        "South Sudan": { imports: "<1%", previous: "10%", updated: "10%" },
        "Sri Lanka": { imports: "<1%", previous: "44%", updated: "10%" },
        "Sudan": { imports: "<1%", previous: "10%", updated: "10%" },
        "Suriname": { imports: "<1%", previous: "10%", updated: "10%" },
        "Syria": { imports: "<1%", previous: "41%", updated: "10%" },
        "Tajikistan": { imports: "<1%", previous: "10%", updated: "10%" },
        "Tanzania": { imports: "<1%", previous: "10%", updated: "10%" },
        "Timor-Leste": { imports: "<1%", previous: "10%", updated: "10%" },
        "Togo": { imports: "<1%", previous: "10%", updated: "10%" },
        "Tokelau": { imports: "<1%", previous: "10%", updated: "10%" },
        "Tonga": { imports: "<1%", previous: "10%", updated: "10%" },
        "Trinidad and Tobago": { imports: "<1%", previous: "10%", updated: "10%" },
        "Tunisia": { imports: "<1%", previous: "28%", updated: "10%" },
        "Turkey": { imports: "<1%", previous: "10%", updated: "10%" },
        "Turkmenistan": { imports: "<1%", previous: "10%", updated: "10%" },
        "Turks and Caicos Islands": { imports: "<1%", previous: "10%", updated: "10%" },
        "Tuvalu": { imports: "<1%", previous: "10%", updated: "10%" },
        "Uganda": { imports: "<1%", previous: "10%", updated: "10%" },
        "Ukraine": { imports: "<1%", previous: "10%", updated: "10%" },
        "United Arab Emirates": { imports: "<1%", previous: "10%", updated: "10%" },
        "Uruguay": { imports: "<1%", previous: "10%", updated: "10%" },
        "Uzbekistan": { imports: "<1%", previous: "10%", updated: "10%" },
        "Vanuatu": { imports: "<1%", previous: "22%", updated: "10%" },
        "Venezuela": { imports: "<1%", previous: "15%", updated: "10%" },
        "Yemen": { imports: "<1%", previous: "10%", updated: "10%" },
        "Zambia": { imports: "<1%", previous: "17%", updated: "10%" },
        "Zimbabwe": { imports: "<1%", previous: "18%", updated: "10%" },
        "Heard and McDonald Islands": { imports: "NA", previous: "10%", updated: "10%" },
        "Svalbard and Jan Mayen": { imports: "NA", previous: "10%", updated: "10%" }
    };

    // ISO country codes
    const countryCodeToName = {
        'CHN': 'China', 'JPN': 'Japan', 'KOR': 'South Korea', 'GBR': 'United Kingdom', 'IND': 'India',
        'THA': 'Thailand', 'VNM': 'Vietnam', 'CHE': 'Switzerland', 'BRA': 'Brazil', 'MYS': 'Malaysia',
        'SGP': 'Singapore', 'FRA': 'European Union', 'DEU': 'European Union', 'ITA': 'European Union',
        'ESP': 'European Union', 'PRT': 'European Union', 'BEL': 'European Union', 'NLD': 'European Union',
        'LUX': 'European Union', 'AUT': 'European Union', 'FIN': 'European Union', 'SWE': 'European Union',
        'IRL': 'European Union', 'DNK': 'European Union', 'GRC': 'European Union', 'HRV': 'European Union',
        'BGR': 'European Union', 'CYP': 'European Union', 'CZE': 'European Union', 'EST': 'European Union',
        'HUN': 'European Union', 'LVA': 'European Union', 'LTU': 'European Union', 'MLT': 'European Union',
        'POL': 'European Union', 'ROU': 'European Union', 'SVK': 'European Union', 'SVN': 'European Union',
        'AFG': 'Afghanistan', 'ALB': 'Albania', 'DZA': 'Algeria', 'AND': 'Andorra', 'AGO': 'Angola',
        'AIA': 'Anguilla', 'ATG': 'Antigua and Barbuda', 'ARG': 'Argentina', 'ARM': 'Armenia', 'ABW': 'Aruba',
        'AUS': 'Australia', 'AZE': 'Azerbaijan', 'BHS': 'Bahamas', 'BHR': 'Bahrain', 'BGD': 'Bangladesh',
        'BRB': 'Barbados', 'BLZ': 'Belize', 'BEN': 'Benin', 'BMU': 'Bermuda', 'BTN': 'Bhutan', 'BOL': 'Bolivia',
        'BIH': 'Bosnia and Herzegovina', 'BWA': 'Botswana', 'IOT': 'British Indian Ocean Territory',
        'VGB': 'British Virgin Islands', 'BRN': 'Brunei', 'BDI': 'Burundi', 'KHM': 'Cambodia', 'CMR': 'Cameroon',
        'CPV': 'Cape Verde', 'CYM': 'Cayman Islands', 'CAF': 'Central African Republic', 'TCD': 'Chad',
        'CHL': 'Chile', 'CXR': 'Christmas Island', 'CCK': 'Cocos (Keeling) Islands', 'COL': 'Colombia', 'TWN': 'Taiwan',
        'COM': 'Comoros', 'COK': 'Cook Islands', 'CRI': 'Costa Rica', 'CIV': "Côte d'Ivoire", 'CUW': 'Curaçao',
        'COD': 'Democratic Republic of the Congo', 'DJI': 'Djibouti', 'DMA': 'Dominica', 'DOM': 'Dominican Republic',
        'ECU': 'Ecuador', 'EGY': 'Egypt', 'SLV': 'El Salvador', 'GNQ': 'Equatorial Guinea', 'ERI': 'Eritrea',
        'SWZ': 'Eswatini (Swaziland)', 'ETH': 'Ethiopia', 'FLK': 'Falkland Islands', 'FJI': 'Fiji', 'GUF': 'French Guiana',
        'PYF': 'French Polynesia', 'GAB': 'Gabon', 'GMB': 'Gambia', 'GEO': 'Georgia', 'GHA': 'Ghana', 'GIB': 'Gibraltar',
        'GRD': 'Grenada', 'GLP': 'Guadeloupe', 'GTM': 'Guatemala', 'GIN': 'Guinea', 'GNB': 'Guinea-Bissau', 'GUY': 'Guyana',
        'HTI': 'Haiti', 'HND': 'Honduras', 'ISL': 'Iceland', 'IDN': 'Indonesia', 'IRN': 'Iran', 'IRQ': 'Iraq',
        'ISR': 'Israel', 'JAM': 'Jamaica', 'JOR': 'Jordan', 'KAZ': 'Kazakhstan', 'KEN': 'Kenya', 'KIR': 'Kiribati',
        'XKX': 'Kosovo', 'KWT': 'Kuwait', 'KGZ': 'Kyrgyzstan', 'LAO': 'Laos', 'LBN': 'Lebanon', 'LSO': 'Lesotho',
        'LBR': 'Liberia', 'LBY': 'Libya', 'LIE': 'Liechtenstein', 'MDG': 'Madagascar', 'MWI': 'Malawi', 'MDV': 'Maldives',
        'MLI': 'Mali', 'MHL': 'Marshall Islands', 'MTQ': 'Martinique', 'MRT': 'Mauritania', 'MUS': 'Mauritius',
        'MYT': 'Mayotte', 'FSM': 'Micronesia', 'MDA': 'Moldova', 'MCO': 'Monaco', 'MNG': 'Mongolia', 'MNE': 'Montenegro',
        'MSR': 'Montserrat', 'MAR': 'Morocco', 'MOZ': 'Mozambique', 'MMR': 'Myanmar', 'NAM': 'Namibia', 'NRU': 'Nauru',
        'NPL': 'Nepal', 'NZL': 'New Zealand', 'NIC': 'Nicaragua', 'NER': 'Niger', 'NGA': 'Nigeria', 'MKD': 'North Macedonia',
        'NOR': 'Norway', 'OMN': 'Oman', 'PAK': 'Pakistan', 'PAN': 'Panama', 'PNG': 'Papua New Guinea', 'PRY': 'Paraguay',
        'PER': 'Peru', 'PHL': 'Philippines', 'QAT': 'Qatar', 'COG': 'Republic of the Congo', 'RWA': 'Rwanda',
        'SHN': 'Saint Helena', 'KNA': 'Saint Kitts and Nevis', 'LCA': 'Saint Lucia', 'VCT': 'Saint Vincent and the Grenadines',
        'WSM': 'Samoa', 'SMR': 'San Marino', 'STP': 'São Tomé and Príncipe', 'SAU': 'Saudi Arabia', 'SEN': 'Senegal',
        'SRB': 'Serbia', 'SLE': 'Sierra Leone', 'SXM': 'Sint Maarten', 'SLB': 'Solomon Islands', 'ZAF': 'South Africa',
        'SSD': 'South Sudan', 'LKA': 'Sri Lanka', 'SDN': 'Sudan', 'SUR': 'Suriname', 'SYR': 'Syria', 'TJK': 'Tajikistan',
        'TZA': 'Tanzania', 'TLS': 'Timor-Leste', 'TGO': 'Togo', 'TKL': 'Tokelau', 'TON': 'Tonga', 'TTO': 'Trinidad and Tobago',
        'TUN': 'Tunisia', 'TUR': 'Turkey', 'TKM': 'Turkmenistan', 'TCA': 'Turks and Caicos Islands', 'TUV': 'Tuvalu',
        'UGA': 'Uganda', 'UKR': 'Ukraine', 'ARE': 'United Arab Emirates', 'URY': 'Uruguay', 'UZB': 'Uzbekistan',
        'VUT': 'Vanuatu', 'VEN': 'Venezuela', 'YEM': 'Yemen', 'ZMB': 'Zambia', 'ZWE': 'Zimbabwe', 'HMD': 'Heard and McDonald Islands',
        'SJM': 'Svalbard and Jan Mayen'
    };

    // ISO 3166 numeric to Alpha-3 country codes
    const numericToAlpha3 = {
        "156": "CHN", "392": "JPN", "410": "KOR", "826": "GBR", "356": "IND", "764": "THA", "704": "VNM",
        "756": "CHE", "076": "BRA", "458": "MYS", "702": "SGP", "250": "FRA", "276": "DEU", "380": "ITA",
        "724": "ESP", "620": "PRT", "056": "BEL", "528": "NLD", "442": "LUX", "040": "AUT", "246": "FIN",
        "752": "SWE", "372": "IRL", "208": "DNK", "300": "GRC", "191": "HRV", "100": "BGR", "196": "CYP",
        "203": "CZE", "233": "EST", "348": "HUN", "428": "LVA", "440": "LTU", "470": "MLT", "616": "POL",
        "642": "ROU", "703": "SVK", "705": "SVN", "004": "AFG", "008": "ALB", "012": "DZA", "020": "AND",
        "024": "AGO", "660": "AIA", "028": "ATG", "032": "ARG", "051": "ARM", "533": "ABW", "036": "AUS",
        "031": "AZE", "044": "BHS", "048": "BHR", "050": "BGD", "052": "BRB", "084": "BLZ", "204": "BEN",
        "060": "BMU", "064": "BTN", "068": "BOL", "070": "BIH", "072": "BWA", "086": "IOT", "092": "VGB",
        "096": "BRN", "108": "BDI", "116": "KHM", "120": "CMR", "132": "CPV", "136": "CYM", "140": "CAF",
        "148": "TCD", "152": "CHL", "162": "CXR", "166": "CCK", "170": "COL", "158": "TWN", "174": "COM",
        "184": "COK", "188": "CRI", "384": "CIV", "531": "CUW", "180": "COD", "262": "DJI", "212": "DMA",
        "214": "DOM", "218": "ECU", "818": "EGY", "222": "SLV", "226": "GNQ", "232": "ERI", "748": "SWZ",
        "231": "ETH", "238": "FLK", "242": "FJI", "254": "GUF", "258": "PYF", "266": "GAB", "270": "GMB",
        "268": "GEO", "288": "GHA", "292": "GIB", "308": "GRD", "312": "GLP", "320": "GTM", "324": "GIN",
        "624": "GNB", "328": "GUY", "332": "HTI", "340": "HND", "352": "ISL", "360": "IDN", "364": "IRN",
        "368": "IRQ", "376": "ISR", "388": "JAM", "400": "JOR", "398": "KAZ", "404": "KEN", "296": "KIR",
        "414": "KWT", "417": "KGZ", "418": "LAO", "422": "LBN", "426": "LSO", "430": "LBR", "434": "LBY",
        "438": "LIE", "450": "MDG", "454": "MWI", "462": "MDV", "466": "MLI", "584": "MHL", "474": "MTQ",
        "478": "MRT", "480": "MUS", "175": "MYT", "583": "FSM", "498": "MDA", "492": "MCO", "496": "MNG",
        "499": "MNE", "500": "MSR", "504": "MAR", "508": "MOZ", "104": "MMR", "516": "NAM", "520": "NRU",
        "524": "NPL", "554": "NZL", "558": "NIC", "562": "NER", "566": "NGA", "807": "MKD", "578": "NOR",
        "512": "OMN", "586": "PAK", "591": "PAN", "598": "PNG", "600": "PRY", "604": "PER", "608": "PHL",
        "634": "QAT", "178": "COG", "646": "RWA", "654": "SHN", "659": "KNA", "662": "LCA", "670": "VCT",
        "882": "WSM", "674": "SMR", "678": "STP", "682": "SAU", "686": "SEN", "688": "SRB", "694": "SLE",
        "534": "SXM", "090": "SLB", "710": "ZAF", "728": "SSD", "144": "LKA", "729": "SDN", "740": "SUR",
        "760": "SYR", "762": "TJK", "834": "TZA", "626": "TLS", "768": "TGO", "776": "TON", "780": "TTO",
        "788": "TUN", "792": "TUR", "795": "TKM", "796": "TCA", "798": "TUV", "800": "UGA", "804": "UKR",
        "784": "ARE", "858": "URY", "860": "UZB", "548": "VUT", "862": "VEN", "887": "YEM", "894": "ZMB",
        "716": "ZWE", "334": "HMD", "744": "SJM"
    };
    let showPrevious = false;

    function getTariffValue(countryName) {
        return showPrevious 
            ? parseFloat(tariffData[countryName].previous.replace('%', '')) 
            : parseFloat(tariffData[countryName].updated.replace('%', ''));
    }

    initMap();

    function initMap() {
        console.log("Initializing map...");

        const mapContainer = document.getElementById('map-container');
        let width = mapContainer.clientWidth;
        let height = mapContainer.clientHeight;

        const svg = d3.select('#map-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('viewBox', [0, 0, width, height]);

        console.log(`Created SVG with dimensions: ${width}x${height}`);

        let projection = d3.geoMercator()
            .scale(width / 5.5)
            .center([0, 20])
            .translate([width / 2, height / 2]);

        const path = d3.geoPath().projection(projection);

        const tariffScale = d3.scaleLinear()
        .domain(showPrevious ? [10, 50] : [10, 145])
        .range(['#FFFACD', '#B22222']);

        const zoom = d3.zoom()
            .scaleExtent([1, 12])
            .on('zoom', (event) => {
                svg.selectAll('.country').attr('transform', event.transform);
            });

        svg.call(zoom);

        console.log("Loading map data...");
        fetch('https://unpkg.com/world-atlas@2.0.2/countries-50m.json', { cache: 'force-cache' })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                console.log("Map data loaded successfully");
                return response.json();
            })
            .then(data => {
                console.log("Processing map data...");
                const countries = topojson.feature(data, data.objects.countries).features;

                svg.selectAll('.country')
                    .data(countries)
                    .enter()
                    .append('path')
                    .attr('class', d => {
                        const alpha3 = numericToAlpha3[d.id];
                        const countryName = countryCodeToName[alpha3];
                        const hasTariff = countryName && tariffData[countryName];
                        return hasTariff ? 'country has-tariff' : 'country no-data';
                    })
                    .style('fill', d => {
                        const alpha3 = numericToAlpha3[d.id];
                        const countryName = countryCodeToName[alpha3];
                        const tariff = countryName && tariffData[countryName] ? getTariffValue(countryName) : null;
                        return tariff ? tariffScale(tariff) : '#555';
                    })
                    .attr('data-alpha3', d => numericToAlpha3[d.id] || '')
                    .attr('d', path)
                    .attr('id', d => `country-${d.id}`)
                    .attr('role', 'button')
                    .attr('aria-label', d => countryCodeToName[numericToAlpha3[d.id]] || 'Unknown Country')
                    .attr('tabindex', 0)
                    .on('mouseover', handleMouseOver)
                    .on('mousemove', handleMouseMove)
                    .on('mouseout', handleMouseOut)
                    .on('click', handleClick)
                    .on('keydown', function(event, d) {
                        if (event.key === 'Enter' || event.key === ' ') {
                            handleClick.call(this, event, d);
                        }
                    });

                console.log(`Rendered ${countries.length} countries on the map`);
                document.getElementById('loading').style.display = 'none';

                updateLegend();

                const searchInput = document.getElementById('country-search');
                const countryNames = Object.keys(tariffData).sort();
                searchInput.addEventListener('input', (event) => {
                    const value = event.target.value.toLowerCase();
                    const suggestions = countryNames.filter(name => name.toLowerCase().includes(value));
                    const datalist = document.getElementById('country-suggestions');
                    datalist.innerHTML = suggestions.map(name => `<option value="${name}">`).join('');
                });
                searchInput.addEventListener('change', handleSearch);

                    // Initialize panel toggle
                    const toggleButton = document.getElementById('toggle-panel');
                    const infoPanel = document.getElementById('info-panel');

                    toggleButton.addEventListener('click', () => {
                        const isHidden = infoPanel.classList.contains('hidden');
                        infoPanel.classList.toggle('hidden');
                        toggleButton.textContent = isHidden ? 'Hide Tariff Info' : 'Show Tariff Info';
                        resizeMap();
                    });

                    const resetButton = document.createElement('button');
                    resetButton.textContent = 'Reset Zoom';
                    resetButton.className = 'reset-zoom';
                    resetButton.addEventListener('click', () => {
                        svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
                    });
                    document.querySelector('.controls').appendChild(resetButton);   
                
                            const tariffToggleButton = document.createElement('button');
                            tariffToggleButton.textContent = 'Show Previous Tariffs';
                            tariffToggleButton.className = 'tariff-toggle';
                            tariffToggleButton.addEventListener('click', () => {
                                showPrevious = !showPrevious;
                                tariffToggleButton.textContent = showPrevious ? 'Show Updated Tariffs' : 'Show Previous Tariffs';
                                updateMapColors();
                                updateLegend();
                            });
                            document.querySelector('.controls').appendChild(tariffToggleButton);

                            function updateMapColors() {
                                tariffScale.domain(showPrevious ? [10, 50] : [10, 145]);
                                svg.selectAll('.country')
                                    .transition()
                                    .duration(500)
                                    .style('fill', d => {
                                        const alpha3 = numericToAlpha3[d.id];
                                        const countryName = countryCodeToName[alpha3];
                                        const tariff = countryName && tariffData[countryName] ? getTariffValue(countryName) : null;
                                        return tariff ? tariffScale(tariff) : '#555';
                                    });
                            }
                
            })
            .catch(error => {
                console.error('Error loading map data:', error);
                document.getElementById('loading').innerHTML = 'Error loading map. <button onclick="location.reload()">Retry</button>';
            });

        function resizeMap() {
            const infoPanel = document.getElementById('info-panel');
            const isPanelVisible = !infoPanel.classList.contains('hidden');
            width = isPanelVisible ? Math.max(mapContainer.clientWidth - 300, 100) : mapContainer.clientWidth; // Minimum width of 100
            height = mapContainer.clientHeight;
        
            svg.attr('width', width)
               .attr('height', height)
               .attr('viewBox', [0, 0, width, height]);
        
            projection
                .scale(width / 5.5)
                .translate([width / 2, height / 2]);
        
            svg.selectAll('.country')
               .attr('d', path);
        }

        window.addEventListener('resize', resizeMap);

        function updateLegend() {
            const legend = d3.select('#legend');
            legend.selectAll('*').remove(); // Clear all children
        
            legend.append('div')
                .attr('class', 'legend-title')
                .text(showPrevious ? 'Previous Tariff Rates' : 'Updated Tariff Rates');
        
            const maxTariff = showPrevious ? 50 : 145;
            legend.append('div')
                .attr('class', 'legend-item')
                .html(`
                    <div class="legend-color gradient" style="background: linear-gradient(to right, ${tariffScale(10)}, ${tariffScale(maxTariff)});"></div>
                    <span>10% - ${maxTariff}%</span>
                `);
        
            const keyTariffs = showPrevious ? [10, 50] : [10, 145];
            keyTariffs.forEach(tariff => {
                legend.append('div')
                    .attr('class', 'legend-item')
                    .html(`
                        <div class="legend-color" style="background-color: ${tariffScale(tariff)}"></div>
                        <span>${tariff}%</span>
                    `);
            });
        
            legend.append('div')
                .attr('class', 'legend-item')
                .html(`
                    <div class="legend-color no-data"></div>
                    <span>No Tariff Data</span>
                `);
        }

        function handleMouseOver(event, d) {
            const alpha3 = numericToAlpha3[d.id];
            const countryName = countryCodeToName[alpha3];
            if (countryName) showTooltip(event, countryName);
        }

        function handleMouseMove(event) {
            updateTooltipPosition(event);
        }

        function handleMouseOut() {
            hideTooltip();
        }

        function handleClick(event, d) {
            const alpha3 = numericToAlpha3[d.id];
            const countryName = countryCodeToName[alpha3];
            if (!countryName) return;

            console.log(`Country clicked: ${countryName}`);
            d3.selectAll('.country').classed('selected', false);
            d3.select(event.currentTarget).classed('selected', true);
            updateCountryInfo(countryName);

            const infoPanel = document.getElementById('info-panel');
            const toggleButton = document.getElementById('toggle-panel');
            if (infoPanel.classList.contains('hidden')) {
                infoPanel.classList.remove('hidden');
                toggleButton.textContent = 'Hide Tariff Info';
                resizeMap();
            }
        }

        function handleSearch(event) {
            const countryName = event.target.value;
            if (!countryName || !tariffData[countryName]) return;
        
            const country = svg.select(`#country-${Object.keys(numericToAlpha3).find(key => countryCodeToName[numericToAlpha3[key]] === countryName)}`);
            if (!country.empty()) {
                d3.selectAll('.country').classed('selected', false);
                country.classed('selected', true);
                svg.transition().call(zoom.translateTo, country.node().getBBox().x + country.node().getBBox().width / 2, country.node().getBBox().y + country.node().getBBox().height / 2);
            }
            updateCountryInfo(countryName);
            event.target.value = ''; // Reset input
        }

        function showTooltip(event, countryName) {
            const tooltip = document.getElementById('tooltip');
            const data = tariffData[countryName];
            tooltip.innerHTML = data
                ? `${countryName === 'European Union' ? `${countryName} (Shared Tariff)` : countryName}<br>Imports: ${data.imports === 'NA' ? 'Not Available' : data.imports}<br>Previous: ${data.previous}<br>Updated: ${data.updated}`
                : `${countryName}<br>No Tariff Data`;
            tooltip.style.display = 'block';
            tooltip.classList.add('visible');
            updateTooltipPosition(event);
        }

        function updateTooltipPosition(event) {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY + 10) + 'px';
        }

        function hideTooltip() {
            const tooltip = document.getElementById('tooltip');
            tooltip.classList.remove('visible');
            setTimeout(() => { tooltip.style.display = 'none'; }, 100); // Match CSS transition
        }

        function updateCountryInfo(countryName) {
            const infoPanel = document.getElementById('country-info');
            const data = tariffData[countryName];

            if (!data) {
                infoPanel.innerHTML = `
                    <h2 class="country-name">${countryName}</h2>
                    <div class="no-data">No tariff data available</div>
                `;
                return;
            }

            const prevRate = parseFloat(data.previous.replace('%', ''));
            const newRate = parseFloat(data.updated.replace('%', ''));
            const changeClass = newRate > prevRate ? 'increase' : newRate < prevRate ? 'decrease' : 'no-change';
            const changeSymbol = newRate > prevRate ? '↑' : newRate < prevRate ? '↓' : '→';

            infoPanel.innerHTML = `
                <h2 class="country-name">${countryName}</h2>
                <div class="tariff-card">
                    <div class="tariff-label">Share of US Imports</div>
                    <div class="tariff-value">${data.imports}</div>
                </div>
                <div class="tariff-card">
                    <div class="tariff-label">Previous Tariff Rate</div>
                    <div class="tariff-value">${data.previous}</div>
                </div>
                <div class="tariff-card">
                    <div class="tariff-label">Updated Tariff Rate</div>
                    <div class="tariff-value">${data.updated}</div>
                    <div class="comparison ${changeClass}">
                        <span class="arrow">${changeSymbol}</span>
                        ${Math.abs(newRate - prevRate)}% ${newRate > prevRate ? 'increase' : newRate < prevRate ? 'decrease' : 'no change'}
                    </div>
                </div>
            `;
        }
    }
});
