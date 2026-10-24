// Dessins animés, animés et méchants : personnages et lieux avec leur œuvre, image tirée du wiki Fandom.
// Entrée : « Nom affiché~palier~Titre de la page » (palier 1 = connu de tous … 4 = très pointu / ancien).
// Sans image trouvée, l'entrée est écartée. Usage : node scripts/build-fandom.mjs [dessins|animes|mechants]
import { writeFile } from 'node:fs/promises'

const UA = { 'User-Agent': 'Croivez/0.1 (app perso de quiz)' }

// ——— Dessins animés : de quel dessin animé vient ce personnage ? (g : époque, pour des propositions crédibles)
const DESSINS = [
  { oeuvre: 'Bob l’éponge', wiki: 'spongebob', g: 'recent', persos: `Bob l’éponge~1~SpongeBob SquarePants | Patrick Étoile~1~Patrick Star | Carlo Tentacule~1~Squidward Tentacles | M. Krabs~1~Eugene H. Krabs | Sandy Écureuil~2~Sandy Cheeks | Plankton~2~Sheldon J. Plankton | Gary~2~Gary the Snail | Mme Puff~3~Mrs. Puff | Pearl~3~Pearl Krabs | Larry le homard~4~Larry the Lobster | Homme-Sirène~4~Mermaid Man` },
  { oeuvre: 'Les Simpson', wiki: 'simpsons', g: 'recent', persos: `Homer Simpson~1 | Bart Simpson~1 | Marge Simpson~1 | Lisa Simpson~1 | Maggie Simpson~2 | M. Burns~2~Charles Montgomery Burns | Ned Flanders~2 | Milhouse~2~Milhouse Van Houten | Apu~3~Apu Nahasapeemapetilon | Krusty le clown~3~Krusty the Clown | Moe~3~Moe Szyslak | Smithers~3~Waylon Smithers | Ralph Wiggum~3 | Tahiti Bob~3~Sideshow Bob | Barney Gumble~4 | Nelson Muntz~4 | Patty et Selma~4~Patty Bouvier | Willie le jardinier~4~Groundskeeper Willie` },
  { oeuvre: 'Les Griffin', wiki: 'familyguy', g: 'recent', persos: `Peter Griffin~2 | Stewie Griffin~2 | Brian Griffin~2 | Lois Griffin~3 | Meg Griffin~3 | Chris Griffin~3 | Glenn Quagmire~3 | Cleveland Brown~4 | Joe Swanson~4` },
  { oeuvre: 'South Park', wiki: 'southpark', g: 'recent', persos: `Eric Cartman~2 | Kenny McCormick~2 | Stan Marsh~3 | Kyle Broflovski~3 | Butters~3~Butters Stotch | M. Garrison~4~Herbert Garrison | Randy Marsh~4 | Chef~4` },
  { oeuvre: 'Rick et Morty', wiki: 'rickandmorty', g: 'recent', persos: `Rick Sanchez~2 | Morty Smith~2 | Summer Smith~3 | Beth Smith~3 | Jerry Smith~3 | M. Larbin~4~Mr. Poopybutthole | Birdperson~4 | Squanchy~4` },
  { oeuvre: 'Scooby-Doo', wiki: 'scoobydoo', g: 'classique', persos: `Scooby-Doo~1 | Sammy~1~Shaggy Rogers | Fred~2~Fred Jones | Daphné~2~Daphne Blake | Véra~2~Velma Dinkley | Scrappy-Doo~3` },
  { oeuvre: 'Looney Tunes', wiki: 'looneytunes', g: 'classique', persos: `Bugs Bunny~1 | Daffy Duck~1 | Titi~1~Tweety | Grosminet~1~Sylvester | Porky Pig~2 | Bip Bip~2~Road Runner | Vil Coyote~2~Wile E. Coyote | Taz~2~Tasmanian Devil | Speedy Gonzales~3 | Pépé le putois~3~Pepé Le Pew | Sam le pirate~3~Yosemite Sam | Elmer Fudd~3 | Marvin le Martien~4~Marvin the Martian | Foghorn Leghorn~4` },
  { oeuvre: 'Tom et Jerry', wiki: 'tomandjerry', g: 'classique', persos: `Tom~1~Tom Cat | Jerry~1~Jerry Mouse | Spike~3~Spike Bulldog | Nibbles~4` },
  { oeuvre: 'Les Schtroumpfs', wiki: 'smurfs', g: 'classique', persos: `Grand Schtroumpf~2~Papa Smurf | Schtroumpfette~2~Smurfette | Gargamel~2 | Azraël~3~Azrael | Schtroumpf à lunettes~3~Brainy Smurf | Schtroumpf costaud~4~Hefty Smurf | Schtroumpf farceur~4~Jokey Smurf` },
  { oeuvre: 'La Panthère rose', wiki: 'pinkpanther', g: 'ancien', persos: `La Panthère rose~2~Pink Panther | Le petit homme~4~Little Man | Inspecteur Clouseau~3~Inspector Clouseau` },
  { oeuvre: 'Inspecteur Gadget', wiki: 'inspectorgadget', g: 'ancien', persos: `Inspecteur Gadget~2 | Sophie~3~Penny | Finot~3~Brain | Docteur Gang~3~Dr. Claw | Chef Quimby~4` },
  { oeuvre: 'Les Zinzins de l’espace', wiki: 'spacegoofs', g: 'annees2000', persos: `Gorgious Klatoo~3 | Étno Polino~3~Etno Polino | Bud Budiovitch~3 | Candy Caramella~3 | Stereo~4 | Fred~4~Fred Fern` },
  { oeuvre: 'Atomic Betty', wiki: 'atomicbetty', g: 'annees2000', persos: `Atomic Betty~2~Betty | Sparky~3 | X-5~3 | Maximus I.Q.~4~Maximus | Minimus~4` },
  { oeuvre: 'Shuriken School', wiki: 'shurikenschool', g: 'annees2000', persos: `Eizan Kaburagi~3 | Okuni Yoshida~4 | Jimmy B.~4 | Maître Hattori~4~Master Hattori` },
  { oeuvre: 'Rekkit', wiki: 'rekkitrabbit', g: 'annees2000', persos: `Rekkit~3 | Jay Shmufton~4~Jay | Larry Shmufton~4 | Mme Shmufton~4~Ruby Shmufton` },
  { oeuvre: 'Marsupilami', wiki: 'marsupilami', g: 'ancien', persos: `Marsupilami~2 | Bring M. Backalive~4` },
  { oeuvre: 'Totally Spies!', wiki: 'totallyspies', g: 'annees2000', persos: `Sam~2~Samantha Simpson | Clover~2~Clover Ewing | Alex~2~Alexandra Vasquez | Jerry Lewis~3~Jerry Lewis | Mandy~3~Mandy Luxe` },
  { oeuvre: 'Code Lyoko', wiki: 'codelyoko', g: 'annees2000', persos: `Aelita~2~Aelita Schaeffer | Jérémie~3~Jérémie Belpois | Ulrich~3~Ulrich Stern | Yumi~3~Yumi Ishiyama | Odd~3~Odd Della Robbia | X.A.N.A.~3~XANA | William Dunbar~4 | Jim Morales~4` },
  { oeuvre: 'Miraculous', wiki: 'miraculousladybug', g: 'recent', persos: `Ladybug~1~Marinette Dupain-Cheng | Chat Noir~1~Adrien Agreste | Hawk Moth~2~Gabriel Agreste | Tikki~2 | Plagg~2 | Alya~3~Alya Césaire | Chloé Bourgeois~3 | Nino~4~Nino Lahiffe` },
  { oeuvre: 'Oggy et les Cafards', wiki: 'oggyandthecockroaches', g: 'annees2000', persos: `Oggy~2 | Jack~3 | Joey~3 | Dee Dee~3 | Marky~3 | Bob~4 | Olivia~4` },
  { oeuvre: 'Le Monde incroyable de Gumball', wiki: 'theamazingworldofgumball', g: 'recent', persos: `Gumball Watterson~2 | Darwin Watterson~2 | Anais Watterson~3 | Nicole Watterson~3 | Richard Watterson~3 | Penny Fitzgerald~4 | Banana Joe~4` },
  { oeuvre: 'Adventure Time', wiki: 'adventuretime', g: 'recent', persos: `Finn~2~Finn | Jake~2~Jake | Princesse Chewing-gum~3~Princess Bubblegum | Marceline~3 | Le Roi des glaces~3~Ice King | BMO~3 | Princesse des Flammes~4~Flame Princess` },
  { oeuvre: 'Souvenirs de Gravity Falls', wiki: 'gravityfalls', g: 'recent', persos: `Dipper Pines~2 | Mabel Pines~2 | Bill Cipher~3 | Grunkle Stan~3~Stanley Pines | Soos~3~Soos Ramirez | Wendy~4~Wendy Corduroy | Ford Pines~4~Stanford Pines` },
  { oeuvre: 'Phinéas et Ferb', wiki: 'phineasandferb', g: 'recent', persos: `Phinéas~2~Phineas Flynn | Ferb~2~Ferb Fletcher | Perry l’ornithorynque~2~Perry the Platypus | Dr Doofenshmirtz~2~Heinz Doofenshmirtz | Candace~3~Candace Flynn | Isabella~3~Isabella Garcia-Shapiro | Major Monogram~4~Francis Monogram` },
  { oeuvre: 'Les Super Nanas', wiki: 'powerpuffgirls', g: 'annees2000', persos: `Belle~2~Blossom | Bulle~2~Bubbles | Rebelle~2~Buttercup | Mojo Jojo~3 | Professeur Utonium~3 | Lui~4~Him | Princesse Plein-aux-As~4~Princess Morbucks` },
  { oeuvre: 'Le Laboratoire de Dexter', wiki: 'dexterslab', g: 'annees2000', persos: `Dexter~2 | Dee Dee~3~Dee Dee | Mandark~3 | Monkey~4` },
  { oeuvre: 'Courage, le chien froussard', wiki: 'couragethecowardlydog', g: 'annees2000', persos: `Courage~2 | Muriel Bagge~3 | Eustache Bagge~3~Eustace Bagge | Le Chat Katz~4~Katz` },
  { oeuvre: 'Kim Possible', wiki: 'kimpossible', g: 'annees2000', persos: `Kim Possible~2 | Ron Stoppable~3 | Rufus~3 | Dr Drakken~3~Drakken | Shego~3 | Wade~4~Wade Load` },
  { oeuvre: 'Ben 10', wiki: 'ben10', g: 'annees2000', persos: `Ben Tennyson~2 | Gwen Tennyson~3 | Grand-père Max~3~Max Tennyson | Vilgax~3 | Kevin Levin~4 | Quatre Bras~4~Four Arms` },
  { oeuvre: 'Avatar, le dernier maître de l’air', wiki: 'avatar', g: 'annees2000', persos: `Aang~2 | Katara~2 | Sokka~2 | Zuko~2 | Toph~3~Toph Beifong | Iroh~3 | Azula~3 | Appa~3 | Momo~4 | Ozai~4` },
  { oeuvre: 'Teen Titans', wiki: 'teentitans', g: 'annees2000', persos: `Starfire~3 | Beast Boy~3 | Raven~3 | Cyborg~3 | Slade~4 | Terra~4` },
  { oeuvre: 'Les Razmoket', wiki: 'rugrats', g: 'ancien', persos: `Tommy Cornichon~3~Tommy Pickles | Angelica~3~Angelica Pickles | Charlie Charlot~4~Chuckie Finster | Phil et Lil~4~Phil and Lil DeVille | Susie Carmichael~4` },
  { oeuvre: 'Hé Arnold !', wiki: 'heyarnold', g: 'ancien', persos: `Arnold~3~Arnold Shortman | Helga Pataki~3 | Gérald~4~Gerald Johanssen | Grand-père Phil~4~Phil Shortman` },
  { oeuvre: 'Johnny Bravo', wiki: 'johnnybravo', g: 'ancien', persos: `Johnny Bravo~3 | Suzy~4 | Bunny Bravo~4` },
  { oeuvre: 'Ed, Edd et Eddy', wiki: 'ed-edd-n-eddy', g: 'ancien', persos: `Ed~3 | Edd~3~Double D | Eddy~3 | Jonny~4~Jonny 2x4 | Planche~4~Plank` },
  { oeuvre: 'Mes parrains sont magiques', wiki: 'fairlyoddparents', g: 'annees2000', persos: `Timmy Turner~3 | Cosmo~3 | Wanda~3 | Vicky~4 | M. Crocker~4~Denzel Crocker` },
  { oeuvre: 'Jimmy Neutron', wiki: 'jimmyneutron', g: 'annees2000', persos: `Jimmy Neutron~3 | Goddard~4 | Carl Wheezer~4 | Cindy Vortex~4` },
  { oeuvre: 'Danny Fantôme', wiki: 'dannyphantom', g: 'annees2000', persos: `Danny Fantôme~3~Danny Phantom | Sam Manson~4 | Tucker Foley~4 | Vlad Plasmius~4~Vlad Masters` },
  { oeuvre: 'Les Animaniacs', wiki: 'animaniacs', g: 'ancien', persos: `Yakko~4~Yakko Warner | Wakko~4~Wakko Warner | Dot~4~Dot Warner` },
  { oeuvre: 'Minus et Cortex', wiki: 'pinkyandthebrain', g: 'ancien', persos: `Minus~3~Pinky | Cortex~3~The Brain` },
  { oeuvre: 'Regular Show', wiki: 'regularshow', g: 'recent', persos: `Mordecai~3 | Rigby~3 | Benson~4 | Skips~4 | Pops~4 | Muscle Man~4` },
  { oeuvre: 'Steven Universe', wiki: 'steven-universe', g: 'recent', persos: `Steven Universe~3 | Grenat~4~Garnet | Améthyste~4~Amethyst | Perle~4~Pearl | Peridot~4` },
  { oeuvre: 'Star Butterfly', wiki: 'svtfoe', g: 'recent', persos: `Star Butterfly~3 | Marco Diaz~4 | Ludo~4` },
  { oeuvre: 'Bluey', wiki: 'blueypedia', g: 'recent', persos: `Bluey~2~Bluey Heeler | Bingo~3~Bingo Heeler | Bandit~3~Bandit Heeler | Chilli~4~Chilli Heeler` },
  { oeuvre: 'Peppa Pig', wiki: 'peppapedia', g: 'recent', persos: `Peppa Pig~1 | George~2~George Pig | Papa Pig~3~Daddy Pig | Suzy Mouton~4~Suzy Sheep` },
  { oeuvre: 'La Pat’ Patrouille', wiki: 'pawpatrol', g: 'recent', persos: `Chase~2 | Marcus~3~Marshall | Ryder~3 | Stella~3~Skye | Ruben~4~Rubble | Zuma~4 | Rocky~4` },
  { oeuvre: 'Winx Club', wiki: 'winx', g: 'annees2000', persos: `Bloom~3 | Stella~4 | Flora~4 | Tecna~4 | Musa~4 | Icy~4` },
  { oeuvre: 'Titeuf', wiki: 'titeuf', g: 'annees2000', persos: `Titeuf~2 | Manu~4 | Nadia~4 | Vomito~4` },
  { oeuvre: 'Les Mystérieuses Cités d’or', wiki: 'lesmysterieusescitesdor', g: 'ancien', persos: `Esteban~4 | Zia~4 | Tao~4 | Mendoza~4` },
  { oeuvre: 'Lucky Luke', wiki: 'luckyluke', g: 'ancien', persos: `Lucky Luke~2 | Rantanplan~3 | Jolly Jumper~3 | Joe Dalton~3` },
  { oeuvre: 'Astérix', wiki: 'asterix', g: 'ancien', persos: `Astérix~1~Asterix | Obélix~1~Obelix | Idéfix~2~Dogmatix | Panoramix~2~Getafix | Abraracourcix~3~Vitalstatistix | Assurancetourix~3~Cacofonix | Jules César~3~Julius Caesar | Falbala~4~Panacea` },
  { oeuvre: 'Tintin', wiki: 'tintin', g: 'ancien', persos: `Tintin~1 | Milou~1~Snowy | Capitaine Haddock~2~Captain Haddock | Professeur Tournesol~2~Professor Calculus | Dupond et Dupont~3~Thomson and Thompson | Bianca Castafiore~3 | Rastapopoulos~4` },
  { oeuvre: 'Barbapapa', wiki: 'barbapapa', g: 'ancien', persos: `Barbapapa~3 | Barbamama~4 | Barbouille~4~Barbabeau` },
  { oeuvre: 'Ulysse 31', wiki: 'ulysses31', g: 'ancien', persos: `Ulysse~4~Ulysses | Télémaque~4~Telemachus | Nono~4` },
  { oeuvre: 'Les Maîtres de l’univers', wiki: 'he-man', g: 'ancien', persos: `Musclor~3~He-Man | Skeletor~3 | Battle Cat~4 | Man-At-Arms~4` },
  { oeuvre: 'Tortues Ninja', wiki: 'turtlepedia', g: 'ancien', persos: `Leonardo~2 | Raphael~2 | Donatello~2 | Michelangelo~2 | Splinter~3 | Shredder~3 | April O’Neil~3~April O'Neil | Krang~4` },
  { oeuvre: 'Samouraï Jack', wiki: 'samuraijack', g: 'annees2000', persos: `Jack~3~Samurai Jack | Aku~3 | L’Écossais~4~The Scotsman` },
  { oeuvre: 'La Maison de Mickey', wiki: 'disney', g: 'classique', persos: `Mickey Mouse~1 | Minnie Mouse~1 | Donald Duck~1 | Dingo~1~Goofy | Pluto~1 | Daisy Duck~2 | Picsou~2~Scrooge McDuck | Riri, Fifi et Loulou~2~Huey, Dewey, and Louie | Pat Hibulaire~3~Pete | Tic et Tac~3~Chip 'n' Dale` },
]

// ——— Animés : personnages et lieux
const ANIMES = [
  { oeuvre: 'Naruto', wiki: 'naruto', g: 'shonen', persos: `Naruto Uzumaki~1 | Sasuke Uchiha~1 | Sakura Haruno~2 | Kakashi Hatake~2 | Itachi Uchiha~2 | Gaara~2 | Orochimaru~3 | Jiraiya~3 | Hinata Hyuga~3 | Rock Lee~3 | Shikamaru Nara~3 | Madara Uchiha~3 | Pain~3~Nagato | Tsunade~3 | Kurama~3 | Neji Hyuga~4 | Obito Uchiha~4 | Kisame Hoshigaki~4 | Deidara~4 | Minato Namikaze~4 | Might Guy~4`, lieux: `Konoha~2~Konohagakure | Suna~3~Sunagakure | Akatsuki (repaire)~4~Akatsuki | Kiri~4~Kirigakure | Vallée de la Fin~4~Valley of the End` },
  { oeuvre: 'One Piece', wiki: 'onepiece', g: 'shonen', persos: `Monkey D. Luffy~1 | Roronoa Zoro~1 | Nami~2 | Sanji~2 | Usopp~2 | Tony Tony Chopper~2 | Nico Robin~3 | Franky~3 | Brook~3 | Shanks~2 | Portgas D. Ace~2 | Barbe Blanche~3~Edward Newgate | Barbe Noire~3~Marshall D. Teach | Doflamingo~3~Donquixote Doflamingo | Trafalgar Law~3 | Boa Hancock~3 | Jinbe~4 | Kaido~4 | Big Mom~4~Charlotte Linlin | Crocodile~4 | Barbe Brune~4~Rocks D. Xebec`, lieux: `Water Seven~3 | Alabasta~3~Arabasta Kingdom | Marineford~3 | Skypiea~3 | Wano~3~Wano Country | Thriller Bark~4 | Enies Lobby~4 | Dressrosa~4 | Île des Hommes-Poissons~4~Fish-Man Island | Impel Down~4` },
  { oeuvre: 'Dragon Ball', wiki: 'dragonball', g: 'shonen', persos: `Son Goku~1~Goku | Vegeta~1 | Son Gohan~2~Gohan | Piccolo~2 | Freezer~2~Frieza | Cell~2 | Boo~2~Majin Buu | Krilin~2~Krillin | Bulma~2 | Trunks~3~Future Trunks | Kame Sennin~3~Master Roshi | Shenron~3 | Beerus~3 | Broly~3 | Yamcha~3 | Ten Shin Han~4~Tien Shinhan | Jiren~4 | Raditz~4 | Nappa~4 | Chaozu~4~Chiaotzu`, lieux: `Namek~2~Planet Namek | Kame House~3 | Capsule Corporation~3 | Tour de Karin~4~Korin Tower | Planète du Roi Kaio~4~King Kai's Planet` },
  { oeuvre: 'Bleach', wiki: 'bleach', g: 'shonen', persos: `Ichigo Kurosaki~2 | Rukia Kuchiki~2 | Sosuke Aizen~3~Sōsuke Aizen | Byakuya Kuchiki~3 | Kenpachi Zaraki~3 | Orihime Inoue~3 | Uryu Ishida~4~Uryū Ishida | Urahara~4~Kisuke Urahara | Toshiro Hitsugaya~4~Tōshirō Hitsugaya | Grimmjow~4~Grimmjow Jaegerjaquez`, lieux: `Karakura~3~Karakura Town | Seireitei~4 | Hueco Mundo~4 | Soul Society~3` },
  { oeuvre: 'L’Attaque des Titans', wiki: 'attackontitan', g: 'shonen', persos: `Eren Jäger~1~Eren Yeager | Mikasa Ackerman~2 | Armin Arlert~2 | Livaï~2~Levi Ackerman | Erwin Smith~3 | Hansi Zoe~3~Hange Zoë | Reiner Braun~3 | Annie Leonhart~3 | Zeke Jäger~4~Zeke Yeager | Jean Kirschtein~4 | Sasha Braus~4 | Historia Reiss~4`, lieux: `Shiganshina~3 | Mur Maria~3~Wall Maria | Paradis~4~Paradis Island | Liberio~4 | Mahr~4~Marley` },
  { oeuvre: 'Demon Slayer', wiki: 'kimetsu-no-yaiba', g: 'shonen', persos: `Tanjiro Kamado~1 | Nezuko Kamado~1 | Zenitsu Agatsuma~2 | Inosuke Hashibira~2 | Muzan Kibutsuji~3 | Rengoku~3~Kyojuro Rengoku | Giyu Tomioka~3 | Shinobu Kocho~3 | Tengen Uzui~4 | Akaza~4 | Kokushibo~4` },
  { oeuvre: 'Jujutsu Kaisen', wiki: 'jujutsu-kaisen', g: 'shonen', persos: `Yuji Itadori~2 | Satoru Gojo~2 | Megumi Fushiguro~3 | Nobara Kugisaki~3 | Ryomen Sukuna~3~Sukuna | Kento Nanami~4 | Suguru Geto~4 | Mahito~4` },
  { oeuvre: 'My Hero Academia', wiki: 'myheroacademia', g: 'shonen', persos: `Izuku Midoriya~2 | All Might~2 | Katsuki Bakugo~2 | Shoto Todoroki~3 | Ochaco Uraraka~3 | Tomura Shigaraki~4 | All For One~4 | Dabi~4 | Himiko Toga~4 | Endeavor~4` },
  { oeuvre: 'Hunter × Hunter', wiki: 'hunterxhunter', g: 'shonen', persos: `Gon Freecss~2 | Kirua~2~Killua Zoldyck | Kurapika~3 | Leolio~3~Leorio Paradinight | Hisoka~3~Hisoka Morow | Meruem~4 | Chrollo Lucilfer~4 | Netero~4~Isaac Netero`, lieux: `Yorknew City~4 | Île de la Baleine~4~Whale Island | Tour céleste~4~Heavens Arena` },
  { oeuvre: 'Death Note', wiki: 'deathnote', g: 'seinen', persos: `Light Yagami~1 | L~2~L Lawliet | Ryuk~2 | Misa Amane~3 | Near~4 | Mello~4` },
  { oeuvre: 'Fullmetal Alchemist', wiki: 'fma', g: 'shonen', persos: `Edward Elric~2 | Alphonse Elric~2 | Roy Mustang~3 | Riza Hawkeye~4 | Scar~4 | Envy~4 | Père~4~Father`, lieux: `Amestris~4 | Central City~4` },
  { oeuvre: 'JoJo’s Bizarre Adventure', wiki: 'jojo', g: 'shonen', persos: `Jotaro Kujo~2~Jotaro Kujo | Dio Brando~2 | Joseph Joestar~3 | Giorno Giovanna~3 | Josuke Higashikata~4 | Jonathan Joestar~4 | Yoshikage Kira~4` },
  { oeuvre: 'One Punch Man', wiki: 'onepunchman', g: 'seinen', persos: `Saitama~2 | Genos~3 | Tatsumaki~4 | Garou~4 | Bang~4~Silver Fang` },
  { oeuvre: 'Spy × Family', wiki: 'spy-x-family', g: 'shonen', persos: `Anya Forger~2 | Loid Forger~3 | Yor Forger~3 | Bond Forger~4` },
  { oeuvre: 'Chainsaw Man', wiki: 'chainsaw-man', g: 'seinen', persos: `Denji~2 | Power~3 | Makima~3 | Pochita~3 | Aki Hayakawa~4` },
  { oeuvre: 'Pokémon', wiki: 'pokemon', g: 'shonen', persos: `Sacha~1~Ash Ketchum | Pikachu~1 | Ondine~2~Misty | Pierre~2~Brock | Jessie~2 | James~2 | Miaouss~2~Meowth | Professeur Chen~3~Professor Oak` },
  { oeuvre: 'Sailor Moon', wiki: 'sailormoon', g: 'shojo', persos: `Sailor Moon~2~Usagi Tsukino | Luna~3 | Sailor Mars~3~Rei Hino | Sailor Mercury~4~Ami Mizuno | Tuxedo Masque~3~Mamoru Chiba | Sailor Jupiter~4~Makoto Kino | Sailor Venus~4~Minako Aino` },
  { oeuvre: 'Détective Conan', wiki: 'detectiveconan', g: 'shonen', persos: `Conan Edogawa~2 | Ran Mouri~3~Ran Mori | Kogoro Mouri~3~Kogoro Mori | Ai Haibara~4 | Gin~4 | Kaito Kid~4~Kaito Kuroba` },
  { oeuvre: 'Neon Genesis Evangelion', wiki: 'evangelion', g: 'seinen', persos: `Shinji Ikari~2 | Rei Ayanami~2 | Asuka Langley~3~Asuka Langley Soryu | Misato Katsuragi~3 | Gendo Ikari~4 | Kaworu Nagisa~4`, lieux: `Tokyo-3~4` },
  { oeuvre: 'Cowboy Bebop', wiki: 'cowboybebop', g: 'seinen', persos: `Spike Spiegel~3 | Faye Valentine~4 | Jet Black~4 | Ed~4~Edward Wong Hau Pepelu Tivrusky IV | Ein~4` },
  { oeuvre: 'Yu-Gi-Oh!', wiki: 'yugioh', g: 'shonen', persos: `Yugi Muto~2~Yugi Mutou | Seto Kaiba~2 | Joey Wheeler~3~Joey Wheeler | Magicien des Ténèbres~3~Dark Magician | Dragon Blanc aux Yeux Bleus~3~Blue-Eyes White Dragon` },
  { oeuvre: 'Digimon', wiki: 'digimon', g: 'shonen', persos: `Agumon~2 | Gabumon~3 | Tai Kamiya~3~Tai Kamiya | Patamon~3 | Gatomon~4 | Greymon~4` },
  { oeuvre: 'Haikyu!!', wiki: 'haikyuu', g: 'sport', persos: `Shoyo Hinata~3~Shōyō Hinata | Tobio Kageyama~3 | Kei Tsukishima~4 | Yu Nishinoya~4~Yū Nishinoya | Tetsuro Kuroo~4~Tetsurō Kuroo` },
  { oeuvre: 'Blue Lock', wiki: 'bluelock', g: 'sport', persos: `Yoichi Isagi~3 | Meguru Bachira~4 | Rin Itoshi~4 | Seishiro Nagi~4 | Jinpachi Ego~4` },
  { oeuvre: 'Olive et Tom', wiki: 'captaintsubasa', g: 'sport', persos: `Olive Atton~3~Tsubasa Ozora | Thomas Price~4~Genzo Wakabayashi | Mark Landers~4~Kojiro Hyuga | Ben Becker~4~Taro Misaki` },
  { oeuvre: 'Frieren', wiki: 'frieren', g: 'shonen', persos: `Frieren~3 | Fern~4 | Stark~4 | Himmel~4` },
  { oeuvre: 'Solo Leveling', wiki: 'solo-leveling', g: 'shonen', persos: `Sung Jin-Woo~3 | Cha Hae-In~4 | Igris~4 | Beru~4` },
  { oeuvre: 'Black Clover', wiki: 'blackclover', g: 'shonen', persos: `Asta~3 | Yuno~4 | Noelle Silva~4 | Yami Sukehiro~4` },
  { oeuvre: 'Fairy Tail', wiki: 'fairytail', g: 'shonen', persos: `Natsu Dragneel~3 | Lucy Heartfilia~3 | Happy~3 | Erza Scarlet~4 | Grey Fullbuster~4 | Zeleph~4~Zeref Dragneel` },
  { oeuvre: 'Code Geass', wiki: 'codegeass', g: 'seinen', persos: `Lelouch~3~Lelouch Lamperouge | C.C.~4 | Suzaku Kururugi~4` },
  { oeuvre: 'Tokyo Ghoul', wiki: 'tokyoghoul', g: 'seinen', persos: `Ken Kaneki~3 | Touka Kirishima~4 | Rize Kamishiro~4 | Juuzou Suzuya~4` },
  { oeuvre: 'Studio Ghibli', wiki: 'ghibli', g: 'ghibli', persos: `Totoro~1 | Chihiro~2~Chihiro Ogino | Sans-Visage~2~No-Face | Kiki~2 | Haku~3 | Calcifer~3 | Howl~3~Howl Pendragon | Ponyo~3 | Princesse Mononoké~3~San | Porco Rosso~4~Porco Rosso | Nausicaä~4 | Jiji~4 | Chatbus~3~Catbus`, lieux: `Laputa~4 | Château ambulant~4~Howl's Moving Castle | Bains d’Aburaya~4~Bathhouse` },
  { oeuvre: 'Nicky Larson', wiki: 'cityhunter', g: 'ancien', persos: `Nicky Larson~3~Ryo Saeba | Laura Marconi~4~Kaori Makimura` },
  { oeuvre: 'Ken le survivant', wiki: 'hokuto-no-ken', g: 'ancien', persos: `Kenshiro~3 | Raoh~4 | Shin~4 | Bat~4` },
  { oeuvre: 'Lupin III', wiki: 'lupin', g: 'ancien', persos: `Arsène Lupin III~3~Arsène Lupin III | Daisuke Jigen~4 | Fujiko Mine~4 | Goemon~4~Goemon Ishikawa XIII | Inspecteur Zenigata~4~Koichi Zenigata` },
  { oeuvre: 'Saint Seiya', wiki: 'saintseiya', g: 'ancien', persos: `Seiya~3~Pegasus Seiya | Shiryu~4~Dragon Shiryū | Hyōga~4~Cygnus Hyōga | Shun~4~Andromeda Shun | Ikki~4~Phoenix Ikki` },
  { oeuvre: 'Goldorak', wiki: 'mazinger', g: 'ancien', persos: `Goldorak~3~Grendizer | Actarus~4~Duke Fleed | Alcor~4~Koji Kabuto` },
  { oeuvre: 'Albator', wiki: 'harlock', g: 'ancien', persos: `Albator~4~Captain Harlock | Toshiro~4` },
]

// ——— Méchants : de quelle œuvre vient ce méchant ? (g : support, pour des propositions du même genre)
const MECHANTS = [
  { wiki: 'villains', liste: [
    ['Dark Vador', 'Star Wars', 'film', 1, 'Darth Vader'], ['Voldemort', 'Harry Potter', 'film', 1, 'Lord Voldemort'], ['Le Joker', 'Batman', 'film', 1, 'Joker (DC)'], ['Thanos', 'Avengers', 'film', 1, 'Thanos (Marvel Cinematic Universe)'],
    ['Sauron', 'Le Seigneur des anneaux', 'film', 2], ['Hannibal Lecter', 'Le Silence des agneaux', 'film', 2], ['Freddy Krueger', 'Les Griffes de la nuit', 'film', 2], ['Jason Voorhees', 'Vendredi 13', 'film', 2],
    ['Michael Myers', 'Halloween', 'film', 2], ['Chucky', 'Chucky', 'film', 2, 'Chucky (Child\'s Play)'], ['Grippe-Sou', 'Ça', 'film', 2, 'Pennywise'], ['Agent Smith', 'Matrix', 'film', 2, 'Agent Smith'],
    ['T-1000', 'Terminator', 'film', 3], ['Hans Gruber', 'Piège de cristal', 'film', 3], ['Dr Denfer', 'Austin Powers', 'film', 3, 'Dr. Evil'], ['Bane', 'Batman', 'film', 3, 'Bane (Dark Knight Trilogy)'],
    ['Loki', 'Thor', 'film', 2, 'Loki (Marvel Cinematic Universe)'], ['Dolores Ombrage', 'Harry Potter', 'film', 3, 'Dolores Umbridge'], ['Bellatrix Lestrange', 'Harry Potter', 'film', 3], ['Saroumane', 'Le Seigneur des anneaux', 'film', 3, 'Saruman'],
    ['Palpatine', 'Star Wars', 'film', 2, 'Sheev Palpatine'], ['Kylo Ren', 'Star Wars', 'film', 3, 'Kylo Ren'], ['Ghostface', 'Scream', 'film', 3], ['Norman Bates', 'Psychose', 'film', 3], ['Annabelle', 'Annabelle', 'film', 3, 'Annabelle (The Conjuring Universe)'],
    ['Biff Tannen', 'Retour vers le futur', 'film', 4], ['Le Grinch', 'Le Grinch', 'film', 2, 'The Grinch'], ['Cruella d’Enfer', 'Les 101 Dalmatiens', 'disney', 2, 'Cruella De Vil'], ['Scar', 'Le Roi lion', 'disney', 1],
    ['Ursula', 'La Petite Sirène', 'disney', 2], ['Jafar', 'Aladdin', 'disney', 2], ['Maléfique', 'La Belle au bois dormant', 'disney', 2, 'Maleficent'], ['Hadès', 'Hercule', 'disney', 2, 'Hades (Disney)'],
    ['Capitaine Crochet', 'Peter Pan', 'disney', 2, 'Captain Hook (Disney)'], ['Frollo', 'Le Bossu de Notre-Dame', 'disney', 3, 'Claude Frollo'], ['Gaston', 'La Belle et la Bête', 'disney', 2], ['Shere Khan', 'Le Livre de la jungle', 'disney', 3, 'Shere Khan (Disney)'],
    ['Mère Gothel', 'Raiponce', 'disney', 3, 'Mother Gothel'], ['La Reine', 'Blanche-Neige', 'disney', 3, 'Evil Queen (Disney)'], ['Lord Farquaad', 'Shrek', 'film', 2], ['Syndrome', 'Les Indestructibles', 'disney', 3], ['Lotso', 'Toy Story 3', 'disney', 3, 'Lots-o\'-Huggin\' Bear'],
    ['Yzma', 'Kuzco', 'disney', 4], ['Ratigan', 'Basil, détective privé', 'disney', 4, 'Professor Ratigan'], ['Shan Yu', 'Mulan', 'disney', 4], ['Hans', 'La Reine des neiges', 'disney', 3, 'Hans (Frozen)'], ['Tamatoa', 'Vaiana', 'disney', 4],
    ['Bowser', 'Super Mario', 'jeu', 1], ['Ganondorf', 'The Legend of Zelda', 'jeu', 2], ['Dr Eggman', 'Sonic', 'jeu', 2, 'Doctor Eggman'], ['Sephiroth', 'Final Fantasy VII', 'jeu', 2], ['GLaDOS', 'Portal', 'jeu', 3],
    ['Handsome Jack', 'Borderlands', 'jeu', 3], ['Vaas Montenegro', 'Far Cry 3', 'jeu', 3], ['Albert Wesker', 'Resident Evil', 'jeu', 3], ['Kefka Palazzo', 'Final Fantasy VI', 'jeu', 4], ['Ridley', 'Metroid', 'jeu', 4],
    ['King K. Rool', 'Donkey Kong', 'jeu', 3], ['Dr Wily', 'Mega Man', 'jeu', 4, 'Dr. Wily'], ['M. Bison', 'Street Fighter', 'jeu', 3], ['Shao Kahn', 'Mortal Kombat', 'jeu', 3], ['Arthas', 'Warcraft', 'jeu', 3, 'Arthas Menethil'],
    ['Andrew Ryan', 'BioShock', 'jeu', 4], ['Ganon', 'The Legend of Zelda', 'jeu', 3], ['Dr Neo Cortex', 'Crash Bandicoot', 'jeu', 3, 'Doctor Neo Cortex'], ['Pyramid Head', 'Silent Hill', 'jeu', 4], ['Majora', 'The Legend of Zelda', 'jeu', 4, "Majora's Mask (character)"],
    ['Freezer', 'Dragon Ball', 'anime', 1, 'Frieza'], ['Cell', 'Dragon Ball', 'anime', 2, 'Cell (Dragon Ball)'], ['Madara Uchiha', 'Naruto', 'anime', 2], ['Orochimaru', 'Naruto', 'anime', 2], ['Sosuke Aizen', 'Bleach', 'anime', 3, 'Sōsuke Aizen'],
    ['Dio Brando', 'JoJo’s Bizarre Adventure', 'anime', 3], ['Muzan Kibutsuji', 'Demon Slayer', 'anime', 3], ['Meruem', 'Hunter × Hunter', 'anime', 4], ['Griffith', 'Berserk', 'anime', 4], ['Tomura Shigaraki', 'My Hero Academia', 'anime', 4],
    ['Barbe Noire', 'One Piece', 'anime', 3, 'Marshall D. Teach'], ['Doflamingo', 'One Piece', 'anime', 3, 'Donquixote Doflamingo'], ['Sukuna', 'Jujutsu Kaisen', 'anime', 3, 'Ryomen Sukuna'], ['Makima', 'Chainsaw Man', 'anime', 4], ['Pain', 'Naruto', 'anime', 3, 'Pain (Naruto)'],
    ['Plankton', 'Bob l’éponge', 'dessin', 2, 'Sheldon J. Plankton'], ['Aku', 'Samouraï Jack', 'dessin', 3], ['Mojo Jojo', 'Les Super Nanas', 'dessin', 3], ['Dr Doofenshmirtz', 'Phinéas et Ferb', 'dessin', 2, 'Heinz Doofenshmirtz'],
    ['Docteur Gang', 'Inspecteur Gadget', 'dessin', 3, 'Dr. Claw'], ['Gargamel', 'Les Schtroumpfs', 'dessin', 2], ['Skeletor', 'Les Maîtres de l’univers', 'dessin', 3], ['Shredder', 'Tortues Ninja', 'dessin', 3, 'Shredder (TMNT)'],
    ['Bill Cipher', 'Souvenirs de Gravity Falls', 'dessin', 3], ['Vilgax', 'Ben 10', 'dessin', 3], ['Dr Drakken', 'Kim Possible', 'dessin', 4, 'Drakken'], ['M. Burns', 'Les Simpson', 'dessin', 2, 'Charles Montgomery Burns'],
    ['Azula', 'Avatar, le dernier maître de l’air', 'dessin', 3], ['Mandark', 'Le Laboratoire de Dexter', 'dessin', 4], ['Lui', 'Les Super Nanas', 'dessin', 4, 'Him (The Powerpuff Girls)'], ['X.A.N.A.', 'Code Lyoko', 'dessin', 4, 'XANA'], ['Hawk Moth', 'Miraculous', 'dessin', 3],
  ] },
]

// ——— Construction ———
const parse = (txt) => (txt ?? '').split('|').map((s) => s.trim()).filter(Boolean).map((s) => { const [nom, palier, titre] = s.split('~'); return { nom, palier: Number(palier) || 4, titre: titre ?? nom } })
async function images(wiki, titres, essai = 1) {
  const [nom, langue] = wiki.split('/')
  const p = new URLSearchParams({ action: 'query', format: 'json', redirects: '1', prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '500', titles: titres.join('|') })
  try {
    const r = await fetch(`https://${nom}.fandom.com${langue ? `/${langue}` : ''}/api.php?${p}`, { headers: UA })
    if (r.status === 429 && essai < 5) { await new Promise((ok) => setTimeout(ok, 6000 * essai)); return images(wiki, titres, essai + 1) }
    if (!r.ok) return new Map()
    const j = await r.json()
    const vers = new Map()
    for (const n of [...(j.query?.normalized ?? []), ...(j.query?.redirects ?? [])]) vers.set(n.from, n.to)
    const parTitre = new Map(Object.values(j.query?.pages ?? {}).filter((pg) => pg.thumbnail).map((pg) => [pg.title, pg.thumbnail.source]))
    const out = new Map()
    for (const t of titres) { let f = t; for (let k = 0; k < 3 && vers.has(f); k++) f = vers.get(f); if (parTitre.has(f)) out.set(t, { img: parTitre.get(f), page: f }) }
    return out
  } catch { return new Map() }
}
// Page introuvable sous ce titre : on cherche dans le wiki et on garde le premier résultat
// s'il partage un mot distinctif avec le nom (sinon on préfère rien plutôt qu'une mauvaise image)
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()
async function chercher(wiki, e) {
  const [nom, langue] = wiki.split('/')
  const base = `https://${nom}.fandom.com${langue ? `/${langue}` : ''}/api.php`
  for (const q of [...new Set([e.titre, e.nom])]) {
    try {
      const p = new URLSearchParams({ action: 'query', format: 'json', list: 'search', srsearch: q, srlimit: '3', srnamespace: '0' })
      const j = await (await fetch(`${base}?${p}`, { headers: UA })).json()
      const mots = new Set([...norm(e.titre).split(' '), ...norm(e.nom).split(' ')].filter((m) => m.length >= 3))
      const bon = (j.query?.search ?? []).find((r) => norm(r.title).split(' ').some((m) => mots.has(m)))
      if (!bon) continue
      const t = (await images(wiki, [bon.title])).get(bon.title)
      if (t) return t
    } catch { /* suivant */ }
    await new Promise((ok) => setTimeout(ok, 250))
  }
  return null
}
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7)

// Pages trouvées par la recherche mais fausses (page de série, d'homonymie, autre personnage) : écartées
const EXCLURE = new Set(['Bob l’éponge', 'Jack', 'La Panthère rose', 'Steven Universe', 'Danny Fantôme', 'Ford Pines', 'Barbapapa', 'Le petit homme', 'Goldorak', 'Annabelle', 'Frollo', 'Lord Farquaad', 'Biff Tannen'])
async function ecrire(fichier, toutes) {
  const entrees = toutes.filter((e) => !EXCLURE.has(e.nom))
  // entrees : { nom, titre, palier, oeuvre, wiki, g }
  const parWiki = new Map()
  for (const e of entrees) (parWiki.get(e.wiki) ?? parWiki.set(e.wiki, []).get(e.wiki)).push(e)
  const items = []
  const manquants = []
  for (const [wiki, liste] of parWiki) {
    const imgs = new Map()
    for (let i = 0; i < liste.length; i += 50) for (const [k, v] of await images(wiki, liste.slice(i, i + 50).map((x) => x.titre))) imgs.set(k, v)
    for (const e of liste) {
      const t = imgs.get(e.titre) ?? await chercher(wiki, e)
      if (!t) { manquants.push(`${e.nom} (${e.oeuvre})`); continue }
      const [nom, langue] = wiki.split('/')
      items.push({ id: `${fichier[0]}-${hash(e.oeuvre + e.nom).toString(36)}`, n: { fr: e.nom, en: e.titre }, r: { fr: e.oeuvre, en: e.oeuvre }, img: t.img.replace(/\/scale-to-width-down\/\d+/, '/scale-to-width-down/500'), x: { genre: e.g, lien: `https://${nom}.fandom.com${langue ? `/${langue}` : ''}/wiki/${encodeURIComponent(t.page.replace(/ /g, '_'))}` }, p: e.palier, g: e.oeuvre })
    }
    await new Promise((ok) => setTimeout(ok, 300))
  }
  items.sort((a, b) => a.p - b.p || hash(a.id) - hash(b.id))
  const vus = new Set()
  const uniques = items.filter((it) => !vus.has(it.id) && vus.add(it.id)).map(({ p, ...it }) => it) // eslint-disable-line no-unused-vars
  await writeFile(`public/packs/culture/${fichier}.json`, JSON.stringify(uniques))
  console.log(`${fichier} : ${uniques.length} · sans image : ${manquants.length}${manquants.length ? ` (${manquants.slice(0, 30).join(', ')}${manquants.length > 30 ? '…' : ''})` : ''}`)
}

const quoi = process.argv[2]
if (!quoi || quoi === 'dessins') await ecrire('dessins-animes', DESSINS.flatMap((d) => parse(d.persos).map((p) => ({ ...p, oeuvre: d.oeuvre, wiki: d.wiki, g: d.g }))))
if (!quoi || quoi === 'animes') {
  await ecrire('persos-animes', ANIMES.flatMap((d) => parse(d.persos).map((p) => ({ ...p, oeuvre: d.oeuvre, wiki: d.wiki, g: d.g }))))
  await ecrire('lieux-animes', ANIMES.flatMap((d) => parse(d.lieux).map((p) => ({ ...p, oeuvre: d.oeuvre, wiki: d.wiki, g: d.g }))))
}
if (!quoi || quoi === 'mechants') await ecrire('mechants', MECHANTS.flatMap((m) => m.liste.map(([nom, oeuvre, g, palier, titre]) => ({ nom, oeuvre, g, palier, titre: titre ?? nom, wiki: m.wiki }))))
