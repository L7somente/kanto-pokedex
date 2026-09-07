const RAW_POKEMON = `
Bulbasaur|grass,poison
Ivysaur|grass,poison
Venusaur|grass,poison
Charmander|fire
Charmeleon|fire
Charizard|fire,flying
Squirtle|water
Wartortle|water
Blastoise|water
Caterpie|bug
Metapod|bug
Butterfree|bug,flying
Weedle|bug,poison
Kakuna|bug,poison
Beedrill|bug,poison
Pidgey|normal,flying
Pidgeotto|normal,flying
Pidgeot|normal,flying
Rattata|normal
Raticate|normal
Spearow|normal,flying
Fearow|normal,flying
Ekans|poison
Arbok|poison
Pikachu|electric
Raichu|electric
Sandshrew|ground
Sandslash|ground
Nidoran♀|poison
Nidorina|poison
Nidoqueen|poison,ground
Nidoran♂|poison
Nidorino|poison
Nidoking|poison,ground
Clefairy|fairy
Clefable|fairy
Vulpix|fire
Ninetales|fire
Jigglypuff|normal,fairy
Wigglytuff|normal,fairy
Zubat|poison,flying
Golbat|poison,flying
Oddish|grass,poison
Gloom|grass,poison
Vileplume|grass,poison
Paras|bug,grass
Parasect|bug,grass
Venonat|bug,poison
Venomoth|bug,poison
Diglett|ground
Dugtrio|ground
Meowth|normal
Persian|normal
Psyduck|water
Golduck|water
Mankey|fighting
Primeape|fighting
Growlithe|fire
Arcanine|fire
Poliwag|water
Poliwhirl|water
Poliwrath|water,fighting
Abra|psychic
Kadabra|psychic
Alakazam|psychic
Machop|fighting
Machoke|fighting
Machamp|fighting
Bellsprout|grass,poison
Weepinbell|grass,poison
Victreebel|grass,poison
Tentacool|water,poison
Tentacruel|water,poison
Geodude|rock,ground
Graveler|rock,ground
Golem|rock,ground
Ponyta|fire
Rapidash|fire
Slowpoke|water,psychic
Slowbro|water,psychic
Magnemite|electric,steel
Magneton|electric,steel
Farfetch'd|normal,flying
Doduo|normal,flying
Dodrio|normal,flying
Seel|water
Dewgong|water,ice
Grimer|poison
Muk|poison
Shellder|water
Cloyster|water,ice
Gastly|ghost,poison
Haunter|ghost,poison
Gengar|ghost,poison
Onix|rock,ground
Drowzee|psychic
Hypno|psychic
Krabby|water
Kingler|water
Voltorb|electric
Electrode|electric
Exeggcute|grass,psychic
Exeggutor|grass,psychic
Cubone|ground
Marowak|ground
Hitmonlee|fighting
Hitmonchan|fighting
Lickitung|normal
Koffing|poison
Weezing|poison
Rhyhorn|ground,rock
Rhydon|ground,rock
Chansey|normal
Tangela|grass
Kangaskhan|normal
Horsea|water
Seadra|water
Goldeen|water
Seaking|water
Staryu|water
Starmie|water,psychic
Mr. Mime|psychic,fairy
Scyther|bug,flying
Jynx|ice,psychic
Electabuzz|electric
Magmar|fire
Pinsir|bug
Tauros|normal
Magikarp|water
Gyarados|water,flying
Lapras|water,ice
Ditto|normal
Eevee|normal
Vaporeon|water
Jolteon|electric
Flareon|fire
Porygon|normal
Omanyte|rock,water
Omastar|rock,water
Kabuto|rock,water
Kabutops|rock,water
Aerodactyl|rock,flying
Snorlax|normal
Articuno|ice,flying
Zapdos|electric,flying
Moltres|fire,flying
Dratini|dragon
Dragonair|dragon
Dragonite|dragon,flying
Mewtwo|psychic
Mew|psychic`.trim();

const POKEMON = RAW_POKEMON.split('\n').map((row,index)=>{const [name,typeString]=row.split('|');return{id:index+1,name,types:typeString.split(',')}});

const TYPE_LABELS={normal:'Normal',fire:'Fogo',water:'Água',electric:'Elétrico',grass:'Planta',ice:'Gelo',fighting:'Lutador',poison:'Veneno',ground:'Terra',flying:'Voador',psychic:'Psíquico',bug:'Inseto',rock:'Pedra',ghost:'Fantasma',dragon:'Dragão',steel:'Aço',fairy:'Fada'};
const TYPE_COLORS={normal:'#8d8b79',fire:'#e64d2e',water:'#3184c6',electric:'#e2b51f',grass:'#55a653',ice:'#55b7bd',fighting:'#b93a32',poison:'#914b9b',ground:'#b98745',flying:'#758dc4',psychic:'#dc4f7d',bug:'#849b28',rock:'#987d47',ghost:'#5c5585',dragon:'#5d57b5',steel:'#68878e',fairy:'#d97891'};

const EVOLUTION_CHAINS=[
 [1,2,3],[4,5,6],[7,8,9],[10,11,12],[13,14,15],[16,17,18],[19,20],[21,22],[23,24],[25,26],[27,28],[29,30,31],[32,33,34],[35,36],[37,38],[39,40],[41,42],[43,44,45],[46,47],[48,49],[50,51],[52,53],[54,55],[56,57],[58,59],[60,61,62],[63,64,65],[66,67,68],[69,70,71],[72,73],[74,75,76],[77,78],[79,80],[81,82],[83],[84,85],[86,87],[88,89],[90,91],[92,93,94],[95],[96,97],[98,99],[100,101],[102,103],[104,105],[106],[107],[108],[109,110],[111,112],[113],[114],[115],[116,117],[118,119],[120,121],[122],[123],[124],[125],[126],[127],[128],[129,130],[131],[132],[133,134,135,136],[137],[138,139],[140,141],[142],[143],[144],[145],[146],[147,148,149],[150],[151]
];

const FALLBACK_FLAVOR={
  1:'Uma estranha semente foi plantada em suas costas ao nascer. A planta brota e cresce junto com este Pokémon.',
  4:'Prefere coisas quentes. Quando chove, dizem que o vapor sai da ponta de sua cauda.',
  7:'Quando recolhe seu longo pescoço para dentro do casco, esguicha água com força vigorosa.',
  25:'Quando vários deles se reúnem, sua eletricidade pode causar tempestades de raios.',
  133:'Seu código genético irregular permite que se adapte rapidamente a diversos ambientes.',
  150:'Criado por manipulação genética. Mesmo com todo seu poder, não recebeu um coração compassivo.',
  151:'Quando observado por microscópio, seus pelos curtos, finos e delicados podem ser vistos.'
};

const STAT_LABELS={'hp':'PS','attack':'Ataque','defense':'Defesa','special-attack':'Atq. Especial','special-defense':'Def. Especial','speed':'Velocidade'};
