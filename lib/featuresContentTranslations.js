// Translatable content for the /features/[slug] SEO pages, keyed by
// slug then locale. Each entry drives both the page content and its
// <head> metadata (title, description, keywords) — this is the actual
// SEO surface area: 18 individually-targetable pages instead of one
// page listing everything, each aimed at the specific search terms an
// operator would actually type.
//
// Locales are filled in progressively; getFeatureContent() below falls
// back to English for any slug/locale combination not yet translated,
// so the page always renders complete content.

export const FEATURES_TRANSLATIONS = {
  'bookings-calendar': {
    en: {
      title: 'Bookings & Calendar',
      metaTitle: 'Booking & Calendar Software for Tour and Safari Operators',
      metaDescription: 'Manage tour, transfer, charter and accommodation bookings in one shared calendar. Built for safari lodges, shuttle companies, and African tourism operators.',
      keywords: ['booking software for safari lodges', 'tour operator booking system', 'safari booking calendar', 'shuttle booking software', 'charter booking management', 'tourism booking software Africa'],
      heroTagline: 'One calendar for every booking, every operator type',
      intro: 'Stop juggling a paper diary, a WhatsApp group, and three spreadsheets. OpDesk gives every booking — tour, transfer, charter, or overnight stay — one shared calendar your whole team can see, with guest details, pricing, and status tracked against each date.',
      benefits: [
        'Click any day to see, add, or edit bookings for that date',
        'Assign a guide, driver, vehicle, or room to a booking as you create it',
        'Track guest count, contact details, and special requirements per booking',
        'Status tracking from pending through confirmed to completed',
        'No double-bookings — see what\u2019s already committed before you confirm a new one',
      ],
      forWhom: 'Safari lodges, shuttle and transfer companies, fishing and yacht charters, trail guides, and guesthouses managing bookings across multiple resources.',
    },
    af: {
      title: "Besprekings & Kalender",
      metaTitle: "Besprekings- en Kalenderprogrammatuur vir Toer- en Wildsafari-operateurs",
      metaDescription: "Bestuur toer-, oordrag-, huur- en verblyfbesprekings in een gedeelde kalender. Gebou vir wildsafari-lodges, pendelmaatskappye en Afrika-toerisme-operateurs.",
      keywords: [
            "besprekingsagteware vir wildsafari-lodges",
            "toeroperateur-besprekingstelsel",
            "wildsafari-besprekingskalender",
            "pendel-besprekingsagteware",
            "huurbesprekingsbestuur",
            "toerisme-besprekingsagteware Afrika"
      ],
      heroTagline: "Een kalender vir elke bespreking, elke operateurtipe",
      intro: "Hou op om 'n papierdagboek, 'n WhatsApp-groep en drie sigblaaie te jongleer. OpDesk gee elke bespreking — toer, oordrag, huur, of oornagverblyf — een gedeelde kalender wat jou hele span kan sien, met gastebesonderhede, pryse en status teen elke datum opgespoor.",
      benefits: [
            "Klik op enige dag om besprekings vir daardie datum te sien, by te voeg of te wysig",
            "Wys 'n gids, bestuurder, voertuig of kamer aan 'n bespreking toe soos jy dit skep",
            "Volg gastetal, kontakbesonderhede en spesiale vereistes per bespreking",
            "Statusopsporing van hangende tot bevestig tot voltooi",
            "Geen dubbelbesprekings nie — sien wat reeds vasgelê is voordat jy 'n nuwe een bevestig"
      ],
      forWhom: "Wildsafari-lodges, pendel- en oordragmaatskappye, vissery- en jag-vervoerdienste, wandelgidse, en gastehuise wat besprekings oor verskeie hulpbronne bestuur."
},
    fr: {
      title: "Réservations & Calendrier",
      metaTitle: "Logiciel de Réservation et Calendrier pour Voyagistes et Opérateurs de Safari",
      metaDescription: "Gérez les réservations de circuits, transferts, charters et hébergements dans un calendrier partagé. Conçu pour les lodges safari, les compagnies de navettes et les opérateurs touristiques africains.",
      keywords: [
            "logiciel de réservation pour lodges safari",
            "système de réservation voyagiste",
            "calendrier de réservation safari",
            "logiciel de réservation navette",
            "gestion de réservation charter",
            "logiciel de réservation tourisme Afrique"
      ],
      heroTagline: "Un calendrier pour chaque réservation, chaque type d'opérateur",
      intro: "Arrêtez de jongler entre un agenda papier, un groupe WhatsApp et trois tableurs. OpDesk offre à chaque réservation — circuit, transfert, charter ou séjour — un calendrier partagé que toute votre équipe peut consulter, avec les détails des clients, les prix et le statut suivis pour chaque date.",
      benefits: [
            "Cliquez sur n'importe quel jour pour voir, ajouter ou modifier les réservations de cette date",
            "Attribuez un guide, un chauffeur, un véhicule ou une chambre à une réservation dès sa création",
            "Suivez le nombre de clients, les coordonnées et les besoins particuliers par réservation",
            "Suivi du statut de en attente à confirmé jusqu'à terminé",
            "Aucune double réservation — voyez ce qui est déjà engagé avant d'en confirmer une nouvelle"
      ],
      forWhom: "Lodges safari, compagnies de navettes et de transferts, charters de pêche et de yacht, guides de randonnée, et gîtes gérant des réservations sur plusieurs ressources."
},
    pt: {
      title: "Reservas & Calendário",
      metaTitle: "Software de Reservas e Calendário para Operadores Turísticos e de Safári",
      metaDescription: "Faça a gestão de reservas de tours, transfers, charters e alojamento num único calendário partilhado. Criado para lodges de safári, empresas de transfer e operadores turísticos africanos.",
      keywords: [
            "software de reservas para lodges de safári",
            "sistema de reservas para operadoras turísticas",
            "calendário de reservas de safári",
            "software de reservas de transfer",
            "gestão de reservas de charter",
            "software de reservas turísticas África"
      ],
      heroTagline: "Um calendário para cada reserva, cada tipo de operador",
      intro: "Deixe de fazer malabarismos com uma agenda de papel, um grupo de WhatsApp e três planilhas. O OpDesk dá a cada reserva — tour, transfer, charter ou estadia — um único calendário partilhado que toda a sua equipa pode ver, com detalhes de hóspedes, preços e estado monitorizados por cada data.",
      benefits: [
            "Clique em qualquer dia para ver, adicionar ou editar reservas dessa data",
            "Atribua um guia, motorista, veículo ou quarto a uma reserva ao criá-la",
            "Acompanhe o número de hóspedes, contactos e requisitos especiais por reserva",
            "Acompanhamento de estado de pendente a confirmado até concluído",
            "Sem reservas duplicadas — veja o que já está confirmado antes de confirmar uma nova"
      ],
      forWhom: "Lodges de safári, empresas de transfer, charters de pesca e de iate, guias de trilha, e pousadas que gerem reservas em múltiplos recursos."
},
    de: {
      title: "Buchungen & Kalender",
      metaTitle: "Buchungs- und Kalendersoftware für Tour- und Safari-Betreiber",
      metaDescription: "Verwalten Sie Touren-, Transfer-, Charter- und Unterkunftsbuchungen in einem gemeinsamen Kalender. Entwickelt für Safari-Lodges, Shuttle-Unternehmen und afrikanische Tourismusbetreiber.",
      keywords: [
            "Buchungssoftware für Safari-Lodges",
            "Buchungssystem für Reiseveranstalter",
            "Safari-Buchungskalender",
            "Shuttle-Buchungssoftware",
            "Charter-Buchungsverwaltung",
            "Tourismus-Buchungssoftware Afrika"
      ],
      heroTagline: "Ein Kalender für jede Buchung, jeden Betreibertyp",
      intro: "Hören Sie auf, zwischen einem Papierkalender, einer WhatsApp-Gruppe und drei Tabellenkalkulationen zu jonglieren. OpDesk gibt jeder Buchung — Tour, Transfer, Charter oder Übernachtung — einen gemeinsamen Kalender, den Ihr gesamtes Team einsehen kann, mit Gästedetails, Preisen und Status, die für jedes Datum nachverfolgt werden.",
      benefits: [
            "Klicken Sie auf einen beliebigen Tag, um Buchungen für dieses Datum anzuzeigen, hinzuzufügen oder zu bearbeiten",
            "Weisen Sie einer Buchung bei der Erstellung einen Führer, Fahrer, ein Fahrzeug oder ein Zimmer zu",
            "Verfolgen Sie Gästezahl, Kontaktdaten und besondere Anforderungen pro Buchung",
            "Statusverfolgung von ausstehend über bestätigt bis abgeschlossen",
            "Keine Doppelbuchungen — sehen Sie, was bereits zugesagt ist, bevor Sie eine neue bestätigen"
      ],
      forWhom: "Safari-Lodges, Shuttle- und Transferunternehmen, Angel- und Yacht-Charter, Wanderführer, und Gästehäuser, die Buchungen über mehrere Ressourcen hinweg verwalten."
},
  },
  'fleet-management': {
    en: {
      title: 'Fleet Management',
      metaTitle: 'Vehicle & Fleet Management Software for Safari and Shuttle Operators',
      metaDescription: 'Track game vehicles, shuttles, and transfer vehicles — registration, capacity, licence and insurance expiry — in one fleet management dashboard.',
      keywords: ['fleet management software safari', 'game vehicle tracking software', 'shuttle fleet management', 'vehicle licence expiry tracker', 'transport operator fleet software'],
      heroTagline: 'Every vehicle, its status, and what\u2019s due for renewal',
      intro: 'A missed licence renewal or an overdue service can shut a vehicle down mid-season. OpDesk keeps your entire fleet — game vehicles, shuttles, transfer vans — in one place, with registration, capacity, and status always visible before you assign it to a booking.',
      benefits: [
        'Track registration, make, model, year, and seating capacity per vehicle',
        'See at a glance which vehicles are available, in use, or in for maintenance',
        'Assign vehicles directly to bookings from the calendar or booking form',
        'Separate tracking for vehicles and vessels (boats, charter vessels)',
        'Fleet visibility that scales from 1 vehicle to an unlimited fleet on higher plans',
      ],
      forWhom: 'Safari operators, shuttle and transfer companies, and any operator running their own vehicles rather than relying on third-party transport.',
    },
    af: {
      title: "Vlootbestuur",
      metaTitle: "Voertuig- en Vlootbestuurprogrammatuur vir Wildsafari- en Pendeloperateurs",
      metaDescription: "Volg wildvoertuie, pendeldienste en oordragvoertuie — registrasie, kapasiteit, lisensie- en versekeringsverval — in een vlootbestuurpaneelbord.",
      keywords: [
            "vlootbestuurprogrammatuur wildsafari",
            "wildvoertuig-opsporingsagteware",
            "pendelvloot-bestuur",
            "voertuiglisensie-vervaltraceerder",
            "vervoeroperateur-vlootagteware"
      ],
      heroTagline: "Elke voertuig, sy status, en wat vir hernuwing te wagte is",
      intro: "'n Gemiste lisensiehernuwing of 'n agterstallige diens kan 'n voertuig middel-seisoen stopsit. OpDesk hou jou hele vloot — wildvoertuie, pendeldienste, oordragvangetjies — op een plek, met registrasie, kapasiteit en status altyd sigbaar voordat jy dit aan 'n bespreking toewys.",
      benefits: [
            "Volg registrasie, vervaardiger, model, jaar en sitplekkapasiteit per voertuig",
            "Sien op 'n oogopslag watter voertuie beskikbaar, in gebruik, of vir instandhouding ingegaan is",
            "Wys voertuie direk aan besprekings toe vanaf die kalender of besprekingsvorm",
            "Aparte opsporing vir voertuie en vaartuie (bote, huurvaartuie)",
            "Vlootsigbaarheid wat skaal van 1 voertuig tot 'n onbeperkte vloot op hoër planne"
      ],
      forWhom: "Wildsafari-operateurs, pendel- en oordragmaatskappye, en enige operateur wat hul eie voertuie bedryf eerder as om op derdeparty-vervoer staat te maak."
},
    fr: {
      title: "Gestion de Flotte",
      metaTitle: "Logiciel de Gestion de Véhicules et de Flotte pour Opérateurs de Safari et de Navettes",
      metaDescription: "Suivez les véhicules de safari, navettes et véhicules de transfert — immatriculation, capacité, expiration du permis et de l'assurance — dans un tableau de bord de gestion de flotte unique.",
      keywords: [
            "logiciel de gestion de flotte safari",
            "logiciel de suivi de véhicule de safari",
            "gestion de flotte de navettes",
            "suivi d'expiration de permis de véhicule",
            "logiciel de flotte pour opérateur de transport"
      ],
      heroTagline: "Chaque véhicule, son statut, et ce qui doit être renouvelé",
      intro: "Un renouvellement de permis manqué ou un entretien en retard peut immobiliser un véhicule en pleine saison. OpDesk regroupe toute votre flotte — véhicules de safari, navettes, camionnettes de transfert — en un seul endroit, avec l'immatriculation, la capacité et le statut toujours visibles avant de l'affecter à une réservation.",
      benefits: [
            "Suivez l'immatriculation, la marque, le modèle, l'année et la capacité de sièges par véhicule",
            "Voyez d'un coup d'œil quels véhicules sont disponibles, en cours d'utilisation ou en entretien",
            "Attribuez des véhicules directement aux réservations depuis le calendrier ou le formulaire de réservation",
            "Suivi séparé pour les véhicules et les navires (bateaux, navires de charter)",
            "Visibilité de la flotte évolutive, d'1 véhicule à une flotte illimitée sur les forfaits supérieurs"
      ],
      forWhom: "Opérateurs de safari, compagnies de navettes et de transferts, et tout opérateur exploitant ses propres véhicules plutôt que de dépendre d'un transport tiers."
},
    pt: {
      title: "Gestão de Frota",
      metaTitle: "Software de Gestão de Veículos e Frota para Operadores de Safári e Transfer",
      metaDescription: "Acompanhe veículos de safári, transfers e veículos de transporte — matrícula, capacidade, validade de licença e seguro — num único painel de gestão de frota.",
      keywords: [
            "software de gestão de frota safári",
            "software de rastreamento de veículos de safári",
            "gestão de frota de transfer",
            "rastreador de validade de licença de veículo",
            "software de frota para operador de transporte"
      ],
      heroTagline: "Cada veículo, o seu estado, e o que está prestes a vencer",
      intro: "Uma renovação de licença esquecida ou uma revisão em atraso pode parar um veículo a meio da época. O OpDesk mantém toda a sua frota — veículos de safári, transfers, carrinhas de transporte — num só lugar, com matrícula, capacidade e estado sempre visíveis antes de o atribuir a uma reserva.",
      benefits: [
            "Acompanhe matrícula, marca, modelo, ano e capacidade de lugares por veículo",
            "Veja rapidamente que veículos estão disponíveis, em uso, ou em manutenção",
            "Atribua veículos diretamente a reservas a partir do calendário ou do formulário de reserva",
            "Rastreamento separado para veículos e embarcações (barcos, embarcações de charter)",
            "Visibilidade de frota que escala de 1 veículo a uma frota ilimitada nos planos superiores"
      ],
      forWhom: "Operadores de safári, empresas de transfer, e qualquer operador que opere os seus próprios veículos em vez de depender de transporte de terceiros."
},
    de: {
      title: "Fuhrparkverwaltung",
      metaTitle: "Fahrzeug- und Fuhrparkverwaltungssoftware für Safari- und Shuttle-Betreiber",
      metaDescription: "Verfolgen Sie Safarifahrzeuge, Shuttles und Transferfahrzeuge — Zulassung, Kapazität, Ablauf von Lizenz und Versicherung — in einem einzigen Fuhrpark-Dashboard.",
      keywords: [
            "Fuhrparkverwaltungssoftware Safari",
            "Safarifahrzeug-Tracking-Software",
            "Shuttle-Fuhrparkverwaltung",
            "Fahrzeuglizenz-Ablauf-Tracker",
            "Fuhrparksoftware für Transportbetreiber"
      ],
      heroTagline: "Jedes Fahrzeug, sein Status, und was zur Erneuerung ansteht",
      intro: "Eine verpasste Lizenzerneuerung oder eine überfällige Wartung kann ein Fahrzeug mitten in der Saison lahmlegen. OpDesk hält Ihren gesamten Fuhrpark — Safarifahrzeuge, Shuttles, Transportvans — an einem Ort, mit Zulassung, Kapazität und Status, die immer sichtbar sind, bevor Sie ihn einer Buchung zuweisen.",
      benefits: [
            "Verfolgen Sie Zulassung, Marke, Modell, Baujahr und Sitzkapazität pro Fahrzeug",
            "Sehen Sie auf einen Blick, welche Fahrzeuge verfügbar, im Einsatz oder in Wartung sind",
            "Weisen Sie Fahrzeuge direkt aus dem Kalender oder Buchungsformular Buchungen zu",
            "Getrennte Verfolgung für Fahrzeuge und Wasserfahrzeuge (Boote, Charterschiffe)",
            "Fuhrpark-Übersicht, die von 1 Fahrzeug bis zu einem unbegrenzten Fuhrpark bei höheren Tarifen skaliert"
      ],
      forWhom: "Safari-Betreiber, Shuttle- und Transferunternehmen, und jeder Betreiber, der eigene Fahrzeuge einsetzt, statt sich auf Fremdtransport zu verlassen."
},
  },
  'trails-module': {
    en: {
      title: 'Trails Module',
      metaTitle: 'Trail Management Software for Hiking & Adventure Guides',
      metaDescription: 'Manage trail routes, difficulty ratings, distance, duration, and guide assignments for hiking and adventure tour operators.',
      keywords: ['trail guide software', 'hiking tour management software', 'adventure operator trail tracking', 'trail route management system'],
      heroTagline: 'Routes, difficulty, and guide assignments in one place',
      intro: 'Trail operators juggle a different kind of complexity than a lodge or shuttle company — routes, difficulty ratings, group capacity, and which guide knows which trail. The Trails module keeps all of it organized and linked directly to your bookings.',
      benefits: [
        'Record distance, duration, and difficulty rating per trail',
        'Set maximum group size (max pax) per route',
        'Log start and end points, highlights, and GPX route files',
        'Assign guides to trails based on who\u2019s qualified and available',
        'Link trail bookings straight into your main booking calendar',
      ],
      forWhom: 'Trail guiding and adventure tourism operators running hiking, walking safari, or multi-day trail experiences.',
    },
    af: {
      title: "Wandelroete-module",
      metaTitle: "Wandelroete-bestuurprogrammatuur vir Stap- & Avontuurgidse",
      metaDescription: "Bestuur wandelroetes, moeilikheidsgraderings, afstand, duur en gids-toewysings vir stap- en avontuurtoeroperateurs.",
      keywords: [
            "wandelgids-agteware",
            "stap-toerbestuurprogrammatuur",
            "avontuuroperateur-roete-opsporing",
            "wandelroete-bestuurstelsel"
      ],
      heroTagline: "Roetes, moeilikheidsgraad, en gidstoewysings op een plek",
      intro: "Wandelroete-operateurs hanteer 'n ander soort kompleksiteit as 'n lodge of pendelmaatskappy — roetes, moeilikheidsgraderings, groepkapasiteit, en watter gids watter roete ken. Die Wandelroete-module hou dit alles georganiseer en direk aan jou besprekings gekoppel.",
      benefits: [
            "Rekord afstand, duur en moeilikheidsgradering per roete",
            "Stel maksimum groepgrootte (max pax) per roete",
            "Log begin- en eindpunte, hoogtepunte, en GPX-roetelêers",
            "Wys gidse aan roetes toe op grond van wie gekwalifiseer en beskikbaar is",
            "Koppel wandelroete-besprekings direk in jou hoofbesprekingskalender"
      ],
      forWhom: "Wandelgids- en avontuurtoerisme-operateurs wat stap-, wildstap-safari-, of veeldag-wandelroete-ervarings bedryf."
},
    fr: {
      title: "Module Sentiers",
      metaTitle: "Logiciel de Gestion de Sentiers pour Guides de Randonnée et d'Aventure",
      metaDescription: "Gérez les itinéraires, les niveaux de difficulté, la distance, la durée et l'affectation des guides pour les opérateurs de circuits de randonnée et d'aventure.",
      keywords: [
            "logiciel de guide de sentier",
            "logiciel de gestion de circuit de randonnée",
            "suivi de sentier pour opérateur d'aventure",
            "système de gestion d'itinéraire de sentier"
      ],
      heroTagline: "Itinéraires, difficulté et affectations de guides en un seul endroit",
      intro: "Les opérateurs de sentiers jonglent avec un type de complexité différent de celui d'un lodge ou d'une compagnie de navettes — itinéraires, niveaux de difficulté, capacité de groupe, et quel guide connaît quel sentier. Le module Sentiers organise tout cela et le relie directement à vos réservations.",
      benefits: [
            "Enregistrez la distance, la durée et le niveau de difficulté par sentier",
            "Définissez la taille maximale du groupe (pax max) par itinéraire",
            "Enregistrez les points de départ et d'arrivée, les points forts et les fichiers de tracé GPX",
            "Attribuez des guides aux sentiers selon qui est qualifié et disponible",
            "Reliez les réservations de sentiers directement à votre calendrier de réservation principal"
      ],
      forWhom: "Opérateurs de guides de randonnée et de tourisme d'aventure proposant des randonnées, des safaris à pied ou des expériences de sentiers sur plusieurs jours."
},
    pt: {
      title: "Módulo de Trilhas",
      metaTitle: "Software de Gestão de Trilhas para Guias de Caminhada e Aventura",
      metaDescription: "Faça a gestão de rotas de trilhas, níveis de dificuldade, distância, duração e atribuição de guias para operadores de caminhada e aventura.",
      keywords: [
            "software para guias de trilha",
            "software de gestão de tours de caminhada",
            "rastreamento de trilhas para operador de aventura",
            "sistema de gestão de rotas de trilha"
      ],
      heroTagline: "Rotas, dificuldade e atribuições de guias num só lugar",
      intro: "Os operadores de trilhas lidam com um tipo diferente de complexidade em relação a um lodge ou empresa de transfer — rotas, níveis de dificuldade, capacidade de grupo, e que guia conhece que trilha. O módulo Trilhas mantém tudo isso organizado e ligado diretamente às suas reservas.",
      benefits: [
            "Registe distância, duração e nível de dificuldade por trilha",
            "Defina o tamanho máximo do grupo (pax máx.) por rota",
            "Registe pontos de início e fim, destaques e ficheiros de rota GPX",
            "Atribua guias a trilhas com base em quem está qualificado e disponível",
            "Ligue reservas de trilhas diretamente ao seu calendário de reservas principal"
      ],
      forWhom: "Operadores de guias de trilha e turismo de aventura que realizam caminhadas, safáris a pé, ou experiências de trilha de vários dias."
},
    de: {
      title: "Wanderroutenmodul",
      metaTitle: "Wanderrouten-Verwaltungssoftware für Wander- und Abenteuerführer",
      metaDescription: "Verwalten Sie Wanderrouten, Schwierigkeitsgrade, Entfernung, Dauer und Führerzuweisungen für Wander- und Abenteuertourbetreiber.",
      keywords: [
            "Wanderführer-Software",
            "Wandertour-Verwaltungssoftware",
            "Wanderroutenverfolgung für Abenteuerbetreiber",
            "Wanderrouten-Verwaltungssystem"
      ],
      heroTagline: "Routen, Schwierigkeit und Führerzuweisungen an einem Ort",
      intro: "Wanderroutenbetreiber jonglieren mit einer anderen Art von Komplexität als eine Lodge oder ein Shuttle-Unternehmen — Routen, Schwierigkeitsgrade, Gruppenkapazität, und welcher Führer welche Route kennt. Das Wanderroutenmodul hält all das organisiert und direkt mit Ihren Buchungen verknüpft.",
      benefits: [
            "Erfassen Sie Entfernung, Dauer und Schwierigkeitsgrad pro Route",
            "Legen Sie die maximale Gruppengröße (max. Personen) pro Route fest",
            "Erfassen Sie Start- und Endpunkte, Highlights und GPX-Routendateien",
            "Weisen Sie Führer Routen basierend auf Qualifikation und Verfügbarkeit zu",
            "Verknüpfen Sie Wanderroutenbuchungen direkt mit Ihrem Hauptbuchungskalender"
      ],
      forWhom: "Wanderführer- und Abenteuertourismusbetreiber, die Wander-, Pirschwanderungs- oder mehrtägige Wanderroutenerlebnisse anbieten."
},
  },
  'shifts-scheduling': {
    en: {
      title: 'Shifts & Scheduling',
      metaTitle: 'Staff Shift Scheduling Software for Tourism & Hospitality Operators',
      metaDescription: 'Roster guides, drivers, and support staff against bookings so nothing gets double-booked. Shift scheduling built for tourism and hospitality teams.',
      keywords: ['staff scheduling software tourism', 'guide roster software', 'shift scheduling hospitality', 'employee rostering safari lodge'],
      heroTagline: 'Roster your team without double-booking anyone',
      intro: 'Assigning a guide to two departures on the same morning is an easy mistake to make when your roster lives in someone\u2019s head or a WhatsApp thread. The Shifts module gives every staff member a schedule tied directly to your bookings and time slots.',
      benefits: [
        'Schedule shifts by date, start/end time, and shift type (morning, full-day, night)',
        'Assign a role per shift — guide, driver, housekeeping, front desk',
        'Track shift status from scheduled through confirmed to completed',
        'See who\u2019s rostered before you commit them to a new booking',
        'Included from Standard plans upward, or available as an add-on',
      ],
      forWhom: 'Any operator with a team of guides, drivers, or hospitality staff working shifts against a booking calendar.',
    },
    af: {
      title: "Skofte & Skedulering",
      metaTitle: "Personeelskof-skeduleringsprogrammatuur vir Toerisme- & Gasvryheidsoperateurs",
      metaDescription: "Rooster gidse, bestuurders en ondersteuningspersoneel teen besprekings sodat niks dubbel bespreek word nie. Skofskedulering gebou vir toerisme- en gasvryheidspanne.",
      keywords: [
            "personeelskedulering-agteware toerisme",
            "gidsrooster-agteware",
            "skofskedulering gasvryheid",
            "werknemerrooster wildsafari-lodge"
      ],
      heroTagline: "Rooster jou span sonder om enigiemand dubbel te bespreek",
      intro: "Om 'n gids aan twee vertrekke op dieselfde oggend toe te wys, is 'n maklike fout om te maak wanneer jou rooster in iemand se kop of 'n WhatsApp-draad woon. Die Skofte-module gee elke personeellid 'n skedule direk gekoppel aan jou besprekings en tydgleuwe.",
      benefits: [
            "Skeduleer skofte volgens datum, begin-/eindtyd, en skoftipe (oggend, voldag, nag)",
            "Wys 'n rol per skof toe — gids, bestuurder, huishouding, ontvangs",
            "Volg skofstatus van geskeduleer tot bevestig tot voltooi",
            "Sien wie gerooster is voordat jy hulle aan 'n nuwe bespreking verbind",
            "Ingesluit vanaf Standard-planne opwaarts, of beskikbaar as 'n byvoeging"
      ],
      forWhom: "Enige operateur met 'n span gidse, bestuurders, of gasvryheidspersoneel wat skofte teen 'n besprekingskalender werk."
},
    fr: {
      title: "Quarts de Travail & Planification",
      metaTitle: "Logiciel de Planification des Quarts de Personnel pour Opérateurs de Tourisme et d'Hôtellerie",
      metaDescription: "Planifiez les guides, chauffeurs et personnel de soutien en fonction des réservations pour qu'il n'y ait jamais de double réservation. Planification des quarts conçue pour les équipes de tourisme et d'hôtellerie.",
      keywords: [
            "logiciel de planification du personnel tourisme",
            "logiciel de planning de guides",
            "planification des quarts hôtellerie",
            "planning des employés lodge safari"
      ],
      heroTagline: "Planifiez votre équipe sans jamais double-réserver personne",
      intro: "Affecter un guide à deux départs le même matin est une erreur facile à commettre lorsque votre planning vit dans la tête de quelqu'un ou dans un fil WhatsApp. Le module Quarts de Travail donne à chaque membre du personnel un planning directement lié à vos réservations et créneaux horaires.",
      benefits: [
            "Planifiez les quarts par date, heure de début/fin, et type de quart (matin, journée complète, nuit)",
            "Attribuez un rôle par quart — guide, chauffeur, ménage, réception",
            "Suivez le statut du quart de planifié à confirmé jusqu'à terminé",
            "Voyez qui est planifié avant de l'engager sur une nouvelle réservation",
            "Inclus à partir des forfaits Standard, ou disponible en tant que module complémentaire"
      ],
      forWhom: "Tout opérateur ayant une équipe de guides, chauffeurs ou personnel hôtelier travaillant par quarts selon un calendrier de réservation."
},
    pt: {
      title: "Turnos & Escalas",
      metaTitle: "Software de Escalas de Turnos de Equipa para Operadores de Turismo e Hotelaria",
      metaDescription: "Escale guias, motoristas e equipa de apoio de acordo com as reservas para que nada fique com reserva duplicada. Escala de turnos criada para equipas de turismo e hotelaria.",
      keywords: [
            "software de escala de equipa turismo",
            "software de escala de guias",
            "escala de turnos hotelaria",
            "escala de funcionários lodge de safári"
      ],
      heroTagline: "Escale a sua equipa sem duplicar reservas de ninguém",
      intro: "Atribuir um guia a duas partidas na mesma manhã é um erro fácil de cometer quando a sua escala vive na cabeça de alguém ou num tópico de WhatsApp. O módulo de Turnos dá a cada membro da equipa um horário diretamente ligado às suas reservas e horários.",
      benefits: [
            "Agende turnos por data, hora de início/fim, e tipo de turno (manhã, dia completo, noite)",
            "Atribua uma função por turno — guia, motorista, limpeza, receção",
            "Acompanhe o estado do turno de agendado a confirmado até concluído",
            "Veja quem está escalado antes de o comprometer com uma nova reserva",
            "Incluído a partir dos planos Standard, ou disponível como extra"
      ],
      forWhom: "Qualquer operador com uma equipa de guias, motoristas, ou pessoal de hotelaria a trabalhar por turnos de acordo com um calendário de reservas."
},
    de: {
      title: "Schichten & Planung",
      metaTitle: "Personalschichtplanungssoftware für Tourismus- und Gastgewerbebetreiber",
      metaDescription: "Planen Sie Führer, Fahrer und Support-Mitarbeiter anhand von Buchungen, damit nichts doppelt gebucht wird. Schichtplanung entwickelt für Tourismus- und Gastgewerbeteams.",
      keywords: [
            "Personalplanungssoftware Tourismus",
            "Führer-Dienstplan-Software",
            "Schichtplanung Gastgewerbe",
            "Mitarbeiterplanung Safari-Lodge"
      ],
      heroTagline: "Planen Sie Ihr Team, ohne jemanden doppelt zu buchen",
      intro: "Einen Führer am selben Morgen zwei Abfahrten zuzuweisen, ist ein leicht zu machender Fehler, wenn Ihr Dienstplan im Kopf von jemandem oder in einem WhatsApp-Thread lebt. Das Schichtmodul gibt jedem Mitarbeiter einen Zeitplan, der direkt mit Ihren Buchungen und Zeitfenstern verknüpft ist.",
      benefits: [
            "Planen Sie Schichten nach Datum, Start-/Endzeit, und Schichttyp (Morgen, Ganztags, Nacht)",
            "Weisen Sie pro Schicht eine Rolle zu — Führer, Fahrer, Housekeeping, Rezeption",
            "Verfolgen Sie den Schichtstatus von geplant über bestätigt bis abgeschlossen",
            "Sehen Sie, wer eingeplant ist, bevor Sie ihn für eine neue Buchung einteilen",
            "Enthalten ab Standard-Tarifen, oder als Add-on erhältlich"
      ],
      forWhom: "Jeder Betreiber mit einem Team von Führern, Fahrern oder Gastgewerbe-Mitarbeitern, die Schichten gegen einen Buchungskalender arbeiten."
},
  },
  'staff-roles': {
    en: {
      title: 'Staff & Roles',
      metaTitle: 'Staff Management Software with Role-Based Access for Tourism Operators',
      metaDescription: 'A full staff directory with employment type, contact details, and role-based access — built for safari, shuttle, and hospitality teams.',
      keywords: ['staff management software tourism', 'employee directory hospitality software', 'role based access tour operator', 'HR software safari lodge'],
      heroTagline: 'One directory for your whole team, with the right access for each role',
      intro: 'From owner to guide to housekeeping, everyone on your team needs different access — and you need one place to see who\u2019s on staff, how they\u2019re employed, and how to reach them. Staff & Roles is the foundation the rest of OpDesk\u2019s HR tools build on.',
      benefits: [
        'Full staff directory with contact details and employment type (full-time, part-time, seasonal, contract)',
        'Role-based access so front desk staff and owners see different things',
        'Active/inactive status tracking as your team changes',
        'The base staff record every certification, shift, leave, and payroll entry links back to',
        'Included on every plan, from Free upward',
      ],
      forWhom: 'Every operator with more than one person on the team — this is core functionality, not a premium add-on.',
    },
    af: {
      title: "Personeel & Rolle",
      metaTitle: "Personeelbestuurprogrammatuur met Rolgebaseerde Toegang vir Toerisme-operateurs",
      metaDescription: "'n Volledige personeelgids met diensverhoudingtipe, kontakbesonderhede, en rolgebaseerde toegang — gebou vir wildsafari-, pendel-, en gasvryheidspanne.",
      keywords: [
            "personeelbestuurprogrammatuur toerisme",
            "werknemersgids gasvryheidsagteware",
            "rolgebaseerde toegang toeroperateur",
            "MH-agteware wildsafari-lodge"
      ],
      heroTagline: "Een gids vir jou hele span, met die regte toegang vir elke rol",
      intro: "Van eienaar tot gids tot huishouding, elkeen in jou span benodig verskillende toegang — en jy benodig een plek om te sien wie op personeel is, hoe hulle in diens is, en hoe om hulle te bereik. Personeel & Rolle is die grondslag waarop die res van OpDesk se MH-instrumente bou.",
      benefits: [
            "Volledige personeelgids met kontakbesonderhede en diensverhoudingtipe (voltyds, deeltyds, seisoenaal, kontrak)",
            "Rolgebaseerde toegang sodat ontvangspersoneel en eienaars verskillende dinge sien",
            "Aktief-/onaktief-statusopsporing soos jou span verander",
            "Die basispersoeelrekord waarna elke sertifisering-, skof-, verlof- en loonstaatinskrywing terugkoppel",
            "Ingesluit op elke plan, van Gratis opwaarts"
      ],
      forWhom: "Elke operateur met meer as een persoon in die span — dit is kernfunksionaliteit, nie 'n premium byvoeging nie."
},
    fr: {
      title: "Personnel & Rôles",
      metaTitle: "Logiciel de Gestion du Personnel avec Accès Basé sur les Rôles pour Opérateurs Touristiques",
      metaDescription: "Un répertoire complet du personnel avec type d'emploi, coordonnées, et accès basé sur les rôles — conçu pour les équipes de safari, navette et hôtellerie.",
      keywords: [
            "logiciel de gestion du personnel tourisme",
            "répertoire d'employés logiciel hôtellerie",
            "accès basé sur les rôles voyagiste",
            "logiciel RH lodge safari"
      ],
      heroTagline: "Un répertoire pour toute votre équipe, avec le bon accès pour chaque rôle",
      intro: "Du propriétaire au guide en passant par le ménage, chaque membre de votre équipe a besoin d'un accès différent — et vous avez besoin d'un seul endroit pour voir qui fait partie du personnel, comment il est employé, et comment le joindre. Personnel & Rôles est la base sur laquelle s'appuient les autres outils RH d'OpDesk.",
      benefits: [
            "Répertoire complet du personnel avec coordonnées et type d'emploi (temps plein, temps partiel, saisonnier, contrat)",
            "Accès basé sur les rôles afin que le personnel de réception et les propriétaires voient des choses différentes",
            "Suivi du statut actif/inactif au fil des changements dans votre équipe",
            "Le dossier de base du personnel auquel chaque certification, quart, congé et entrée de paie se rattache",
            "Inclus dans chaque forfait, à partir du forfait Gratuit"
      ],
      forWhom: "Tout opérateur ayant plus d'une personne dans son équipe — il s'agit d'une fonctionnalité de base, pas d'un module complémentaire premium."
},
    pt: {
      title: "Equipa & Funções",
      metaTitle: "Software de Gestão de Equipa com Acesso Baseado em Funções para Operadores Turísticos",
      metaDescription: "Um diretório completo de equipa com tipo de vínculo, contactos, e acesso baseado em funções — criado para equipas de safári, transfer e hotelaria.",
      keywords: [
            "software de gestão de equipa turismo",
            "diretório de funcionários software hotelaria",
            "acesso baseado em funções operadora turística",
            "software de RH lodge de safári"
      ],
      heroTagline: "Um diretório para toda a sua equipa, com o acesso certo para cada função",
      intro: "Do proprietário ao guia até à limpeza, todos na sua equipa precisam de acessos diferentes — e precisa de um único lugar para ver quem está na equipa, como estão empregados, e como contactá-los. Equipa & Funções é a base sobre a qual o resto das ferramentas de RH do OpDesk se constroem.",
      benefits: [
            "Diretório completo de equipa com contactos e tipo de vínculo (tempo inteiro, meio período, sazonal, contrato)",
            "Acesso baseado em funções para que a receção e os proprietários vejam coisas diferentes",
            "Acompanhamento de estado ativo/inativo à medida que a sua equipa muda",
            "O registo base de equipa ao qual cada certificação, turno, férias e entrada de folha de pagamento se liga",
            "Incluído em todos os planos, a partir do Grátis"
      ],
      forWhom: "Qualquer operador com mais de uma pessoa na equipa — esta é funcionalidade essencial, não um extra premium."
},
    de: {
      title: "Personal & Rollen",
      metaTitle: "Personalverwaltungssoftware mit Rollenbasiertem Zugriff für Tourismusbetreiber",
      metaDescription: "Ein vollständiges Personalverzeichnis mit Beschäftigungsart, Kontaktdaten, und rollenbasiertem Zugriff — entwickelt für Safari-, Shuttle- und Gastgewerbeteams.",
      keywords: [
            "Personalverwaltungssoftware Tourismus",
            "Mitarbeiterverzeichnis Gastgewerbesoftware",
            "rollenbasierter Zugriff Reiseveranstalter",
            "HR-Software Safari-Lodge"
      ],
      heroTagline: "Ein Verzeichnis für Ihr gesamtes Team, mit dem richtigen Zugriff für jede Rolle",
      intro: "Vom Eigentümer über den Führer bis zum Housekeeping benötigt jeder in Ihrem Team unterschiedlichen Zugriff — und Sie brauchen einen Ort, um zu sehen, wer im Personal ist, wie sie beschäftigt sind, und wie man sie erreicht. Personal & Rollen ist die Grundlage, auf der die übrigen HR-Tools von OpDesk aufbauen.",
      benefits: [
            "Vollständiges Personalverzeichnis mit Kontaktdaten und Beschäftigungsart (Vollzeit, Teilzeit, saisonal, Vertrag)",
            "Rollenbasierter Zugriff, damit Rezeptionspersonal und Eigentümer unterschiedliche Dinge sehen",
            "Aktiv-/Inaktiv-Statusverfolgung, während sich Ihr Team ändert",
            "Der Basis-Personaldatensatz, auf den jede Zertifizierung, Schicht, Urlaub und Gehaltsabrechnung zurückverweist",
            "Enthalten in jedem Tarif, ab Kostenlos aufwärts"
      ],
      forWhom: "Jeder Betreiber mit mehr als einer Person im Team — das ist Kernfunktionalität, kein Premium-Add-on."
},
  },
  'certifications': {
    en: {
      title: 'Certifications',
      metaTitle: 'Guide Certification Tracking Software with Expiry Alerts',
      metaDescription: 'Track FGASA, PDP, skippers tickets, first aid and other guide certifications with expiry alerts — never send an unqualified guide into the field.',
      keywords: ['guide certification tracking software', 'FGASA certification tracker', 'PDP expiry tracking', 'skippers ticket management', 'guide qualification software South Africa'],
      heroTagline: 'Never let a certification expire without you knowing',
      intro: 'A guide with a lapsed FGASA qualification or an expired PDP isn\u2019t just a compliance risk — in some jurisdictions it\u2019s a legal one. Certifications tracks every staff qualification against its expiry date and flags anything expiring soon before it becomes a problem.',
      benefits: [
        'Track certification type, number, issuing body, issue date, and expiry date',
        'Color-coded status: valid, expiring within 30 days, or expired',
        'Cover FGASA, PDP, skippers tickets, first aid, firearm competency, and more',
        'One record per staff member, all certifications in one view',
        'Included from Professional plans, or available as an individual add-on',
      ],
      forWhom: 'Safari operators, fishing and yacht charters, and trail guides — anywhere a lapsed qualification is a real operational or legal risk.',
    },
    af: {
      title: "Sertifisering",
      metaTitle: "Gids-sertifisering-opsporingprogrammatuur met Vervalwaarskuwings",
      metaDescription: "Volg FGASA, PDP, skipperkaartjies, noodhulp en ander gidssertifisering met vervalwaarskuwings — stuur nooit 'n onbevoegde gids die veld in nie.",
      keywords: [
            "gids-sertifisering-opsporingprogrammatuur",
            "FGASA-sertifiseringtraceerder",
            "PDP-vervalopsporing",
            "skipperkaartjiebestuur",
            "gidskwalifikasie-agteware Suid-Afrika"
      ],
      heroTagline: "Laat nooit 'n sertifisering verval sonder dat jy dit weet nie",
      intro: "'n Gids met 'n verstreke FGASA-kwalifikasie of 'n verstreke PDP is nie net 'n nakomingsrisiko nie — in sommige jurisdiksies is dit 'n regsrisiko. Sertifisering volg elke personeelkwalifikasie teen sy vervaldatum en merk enigiets wat binnekort verval voordat dit 'n probleem word.",
      benefits: [
            "Volg sertifiseringtipe, nommer, uitreikende liggaam, uitreikingsdatum, en vervaldatum",
            "Kleurgekodeerde status: geldig, verval binne 30 dae, of verval",
            "Dek FGASA, PDP, skipperkaartjies, noodhulp, vuurwapenbevoegdheid, en meer",
            "Een rekord per personeellid, alle sertifisering in een oorsig",
            "Ingesluit vanaf Professional-planne, of beskikbaar as 'n individuele byvoeging"
      ],
      forWhom: "Wildsafari-operateurs, vissery- en jag-vervoerdienste, en wandelgidse — enige plek waar 'n verstreke kwalifikasie 'n werklike bedryfs- of regsrisiko is."
},
    fr: {
      title: "Certifications",
      metaTitle: "Logiciel de Suivi des Certifications de Guides avec Alertes d'Expiration",
      metaDescription: "Suivez les certifications FGASA, PDP, permis de bateau, premiers secours et autres certifications de guides avec des alertes d'expiration — n'envoyez jamais un guide non qualifié sur le terrain.",
      keywords: [
            "logiciel de suivi des certifications de guides",
            "traceur de certification FGASA",
            "suivi d'expiration PDP",
            "gestion de permis de bateau",
            "logiciel de qualification de guide Afrique du Sud"
      ],
      heroTagline: "Ne laissez jamais une certification expirer sans le savoir",
      intro: "Un guide avec une qualification FGASA expirée ou un PDP expiré n'est pas seulement un risque de conformité — dans certaines juridictions, c'est un risque juridique. Certifications suit chaque qualification du personnel par rapport à sa date d'expiration et signale tout ce qui expire bientôt avant que cela ne devienne un problème.",
      benefits: [
            "Suivez le type de certification, le numéro, l'organisme émetteur, la date d'émission et la date d'expiration",
            "Statut codé par couleur : valide, expirant sous 30 jours, ou expiré",
            "Couvre FGASA, PDP, permis de bateau, premiers secours, compétence en armes à feu, et plus",
            "Un dossier par membre du personnel, toutes les certifications en une seule vue",
            "Inclus à partir des forfaits Professionnel, ou disponible en tant que module complémentaire individuel"
      ],
      forWhom: "Opérateurs de safari, charters de pêche et de yacht, et guides de randonnée — partout où une qualification expirée représente un risque opérationnel ou juridique réel."
},
    pt: {
      title: "Certificações",
      metaTitle: "Software de Rastreamento de Certificações de Guias com Alertas de Validade",
      metaDescription: "Acompanhe FGASA, PDP, cartas de skipper, primeiros socorros e outras certificações de guias com alertas de validade — nunca envie um guia sem qualificação para o terreno.",
      keywords: [
            "software de rastreamento de certificações de guias",
            "rastreador de certificação FGASA",
            "rastreamento de validade PDP",
            "gestão de cartas de skipper",
            "software de qualificação de guias África do Sul"
      ],
      heroTagline: "Nunca deixe uma certificação expirar sem que saiba",
      intro: "Um guia com uma qualificação FGASA expirada ou um PDP vencido não é apenas um risco de conformidade — em algumas jurisdições, é um risco legal. Certificações acompanha cada qualificação da equipa em relação à sua data de validade e sinaliza tudo o que está prestes a expirar antes que se torne um problema.",
      benefits: [
            "Acompanhe tipo de certificação, número, entidade emissora, data de emissão e data de validade",
            "Estado codificado por cor: válido, a expirar em 30 dias, ou expirado",
            "Cobre FGASA, PDP, cartas de skipper, primeiros socorros, competência em armas de fogo, e mais",
            "Um registo por membro da equipa, todas as certificações numa só vista",
            "Incluído a partir dos planos Professional, ou disponível como extra individual"
      ],
      forWhom: "Operadores de safári, charters de pesca e de iate, e guias de trilha — em qualquer lugar onde uma qualificação vencida é um risco operacional ou legal real."
},
    de: {
      title: "Zertifizierungen",
      metaTitle: "Führerzertifizierungs-Tracking-Software mit Ablaufwarnungen",
      metaDescription: "Verfolgen Sie FGASA, PDP, Bootsführerscheine, Erste Hilfe und andere Führerzertifizierungen mit Ablaufwarnungen — schicken Sie nie einen unqualifizierten Führer ins Feld.",
      keywords: [
            "Führerzertifizierungs-Tracking-Software",
            "FGASA-Zertifizierungstracker",
            "PDP-Ablaufverfolgung",
            "Bootsführerschein-Verwaltung",
            "Führerqualifikationssoftware Südafrika"
      ],
      heroTagline: "Lassen Sie nie eine Zertifizierung ablaufen, ohne es zu wissen",
      intro: "Ein Führer mit einer abgelaufenen FGASA-Qualifikation oder einem abgelaufenen PDP ist nicht nur ein Compliance-Risiko — in manchen Rechtsordnungen ist es ein rechtliches. Zertifizierungen verfolgt jede Personalqualifikation gegen ihr Ablaufdatum und markiert alles, was bald abläuft, bevor es zum Problem wird.",
      benefits: [
            "Verfolgen Sie Zertifizierungsart, Nummer, ausstellende Stelle, Ausstellungsdatum, und Ablaufdatum",
            "Farbcodierter Status: gültig, läuft innerhalb von 30 Tagen ab, oder abgelaufen",
            "Deckt FGASA, PDP, Bootsführerscheine, Erste Hilfe, Waffensachkunde, und mehr ab",
            "Ein Datensatz pro Mitarbeiter, alle Zertifizierungen in einer Ansicht",
            "Enthalten ab Professional-Tarifen, oder als individuelles Add-on erhältlich"
      ],
      forWhom: "Safari-Betreiber, Angel- und Yacht-Charter, und Wanderführer — überall dort, wo eine abgelaufene Qualifikation ein echtes betriebliches oder rechtliches Risiko darstellt."
},
  },
  'firearm-register': {
    en: {
      title: 'Firearm Register',
      metaTitle: 'Firearm Register Software for Safari and Fishing Operators',
      metaDescription: 'Compliant firearm tracking for safari and fishing operators — serial numbers, licences, and safe storage locations, with licence expiry alerts.',
      keywords: ['firearm register software safari', 'firearm licence tracking system', 'safari rifle register', 'firearm compliance software South Africa'],
      heroTagline: 'Every firearm, its licence, and where it\u2019s stored',
      intro: 'Firearms used on safari or during anti-poaching operations come with serious compliance obligations. The Firearm Register keeps make, model, calibre, serial number, licence number and expiry, and safe storage location all in one auditable record.',
      benefits: [
        'Record make, model, calibre, and serial number per firearm',
        'Track licence number and expiry date with renewal alerts',
        'Log safe storage location for compliance audits',
        'Link firearms to the staff member responsible for them',
        'Status tracking — stored, in use, in for service',
      ],
      forWhom: 'Safari operators and fishing charters with firearms on the premises for guiding or anti-poaching purposes.',
    },
    af: {
      title: "Vuurwapenregister",
      metaTitle: "Vuurwapenregister-programmatuur vir Wildsafari- en Vissery-operateurs",
      metaDescription: "Voldoenende vuurwapen-opsporing vir wildsafari- en vissery-operateurs — reeksnommers, lisensies, en veilige bergingsplekke, met lisensie-vervalwaarskuwings.",
      keywords: [
            "vuurwapenregister-agteware wildsafari",
            "vuurwapenlisensie-opsporingstelsel",
            "wildsafari-geweerregister",
            "vuurwapennakomingsagteware Suid-Afrika"
      ],
      heroTagline: "Elke vuurwapen, sy lisensie, en waar dit geberg word",
      intro: "Vuurwapens wat op wildsafari of tydens teen-wilddiefstal-bedrywighede gebruik word, kom met ernstige nakomingsverpligtinge. Die Vuurwapenregister hou vervaardiger, model, kaliber, reeksnommer, lisensienommer en -verval, en veilige bergingsplek almal in een oudeerbare rekord.",
      benefits: [
            "Rekord vervaardiger, model, kaliber, en reeksnommer per vuurwapen",
            "Volg lisensienommer en vervaldatum met hernuwingswaarskuwings",
            "Log veilige bergingsplek vir nakomingsoudits",
            "Koppel vuurwapens aan die personeellid verantwoordelik daarvoor",
            "Statusopsporing — geberg, in gebruik, vir diens ingegaan"
      ],
      forWhom: "Wildsafari-operateurs en vissery-vervoerdienste met vuurwapens op die perseel vir gids- of teen-wilddiefstal-doeleindes."
},
    fr: {
      title: "Registre d'Armes à Feu",
      metaTitle: "Logiciel de Registre d'Armes à Feu pour Opérateurs de Safari et de Pêche",
      metaDescription: "Suivi conforme des armes à feu pour les opérateurs de safari et de pêche — numéros de série, permis, et lieux de stockage sécurisés, avec alertes d'expiration de permis.",
      keywords: [
            "logiciel de registre d'armes à feu safari",
            "système de suivi de permis d'armes à feu",
            "registre de fusils de safari",
            "logiciel de conformité des armes à feu Afrique du Sud"
      ],
      heroTagline: "Chaque arme à feu, son permis, et où elle est stockée",
      intro: "Les armes à feu utilisées lors de safaris ou d'opérations anti-braconnage s'accompagnent d'obligations de conformité sérieuses. Le Registre d'Armes à Feu conserve la marque, le modèle, le calibre, le numéro de série, le numéro et l'expiration du permis, et le lieu de stockage sécurisé, le tout dans un seul dossier vérifiable.",
      benefits: [
            "Enregistrez la marque, le modèle, le calibre et le numéro de série par arme à feu",
            "Suivez le numéro de permis et la date d'expiration avec des alertes de renouvellement",
            "Enregistrez le lieu de stockage sécurisé pour les audits de conformité",
            "Reliez les armes à feu au membre du personnel qui en est responsable",
            "Suivi du statut — stockée, en cours d'utilisation, en révision"
      ],
      forWhom: "Opérateurs de safari et charters de pêche disposant d'armes à feu sur place à des fins de guidage ou de lutte anti-braconnage."
},
    pt: {
      title: "Registo de Armas de Fogo",
      metaTitle: "Software de Registo de Armas de Fogo para Operadores de Safári e Pesca",
      metaDescription: "Controlo conforme de armas de fogo para operadores de safári e pesca — números de série, licenças, e locais de armazenamento seguro, com alertas de validade de licença.",
      keywords: [
            "software de registo de armas de fogo safári",
            "sistema de rastreamento de licença de arma de fogo",
            "registo de espingardas de safári",
            "software de conformidade de armas de fogo África do Sul"
      ],
      heroTagline: "Cada arma de fogo, a sua licença, e onde está guardada",
      intro: "Armas de fogo usadas em safári ou durante operações antifurtivismo vêm com obrigações de conformidade sérias. O Registo de Armas de Fogo mantém marca, modelo, calibre, número de série, número e validade de licença, e local de armazenamento seguro, tudo num único registo auditável.",
      benefits: [
            "Registe marca, modelo, calibre, e número de série por arma de fogo",
            "Acompanhe o número de licença e a data de validade com alertas de renovação",
            "Registe o local de armazenamento seguro para auditorias de conformidade",
            "Ligue armas de fogo ao membro da equipa responsável por elas",
            "Acompanhamento de estado — guardada, em uso, em manutenção"
      ],
      forWhom: "Operadores de safári e charters de pesca com armas de fogo nas instalações para fins de guia ou antifurtivismo."
},
    de: {
      title: "Waffenregister",
      metaTitle: "Waffenregister-Software für Safari- und Angelbetreiber",
      metaDescription: "Konforme Waffenverfolgung für Safari- und Angelbetreiber — Seriennummern, Lizenzen, und sichere Lagerorte, mit Lizenzablaufwarnungen.",
      keywords: [
            "Waffenregister-Software Safari",
            "Waffenlizenz-Tracking-System",
            "Safari-Gewehrregister",
            "Waffen-Compliance-Software Südafrika"
      ],
      heroTagline: "Jede Waffe, ihre Lizenz, und wo sie gelagert wird",
      intro: "Waffen, die auf Safari oder bei Anti-Wilderer-Einsätzen verwendet werden, sind mit ernsthaften Compliance-Verpflichtungen verbunden. Das Waffenregister hält Marke, Modell, Kaliber, Seriennummer, Lizenznummer und -ablauf, und sicheren Lagerort in einem einzigen prüfbaren Datensatz fest.",
      benefits: [
            "Erfassen Sie Marke, Modell, Kaliber, und Seriennummer pro Waffe",
            "Verfolgen Sie Lizenznummer und Ablaufdatum mit Erneuerungswarnungen",
            "Erfassen Sie den sicheren Lagerort für Compliance-Audits",
            "Verknüpfen Sie Waffen mit dem verantwortlichen Mitarbeiter",
            "Statusverfolgung — gelagert, im Einsatz, in Wartung"
      ],
      forWhom: "Safari-Betreiber und Angel-Charter mit Waffen vor Ort für Führungs- oder Anti-Wilderer-Zwecke."
},
  },
  'cost-to-company': {
    en: {
      title: 'Cost to Company',
      metaTitle: 'Payroll & Cost-to-Company Software for Tourism Operators',
      metaDescription: 'Full payroll breakdowns — salary, allowances, deductions, UIF, PAYE — with true cost-to-company per staff member, calculated automatically.',
      keywords: ['cost to company calculator software', 'payroll software small business South Africa', 'UIF PAYE payroll tracking', 'staff cost tracking tourism operator'],
      heroTagline: 'Know what every staff member really costs you',
      intro: 'Basic salary is only part of the story — housing and transport allowances, UIF, PAYE, medical aid contributions on both sides all add up to what a staff member actually costs. Cost to Company calculates gross salary, total deductions, net take-home, and true cost to company automatically from what you enter.',
      benefits: [
        'Record basic salary plus housing, transport, and meal allowances',
        'Track employee deductions: UIF, PAYE, medical aid, other',
        'Track employer contributions: UIF, medical aid',
        'Gross salary, net take-home, and cost-to-company calculated automatically',
        'Included from Enterprise plans, or available as an individual add-on',
      ],
      forWhom: 'Any operator who wants a real picture of staff cost beyond basic salary — particularly useful once you\u2019re managing more than a handful of employees.',
    },
    af: {
      title: "Koste tot Maatskappy",
      metaTitle: "Loonstaat- en Koste-tot-Maatskappy-programmatuur vir Toerisme-operateurs",
      metaDescription: "Volledige loonstaat-uiteensettings — salaris, toelaes, aftrekkings, UIF, PAYE — met werklike koste-tot-maatskappy per personeellid, outomaties bereken.",
      keywords: [
            "koste-tot-maatskappy-berekenaar-agteware",
            "loonstaatprogrammatuur klein besigheid Suid-Afrika",
            "UIF PAYE loonstaatopsporing",
            "personeelkoste-opsporing toeroperateur"
      ],
      heroTagline: "Weet wat elke personeellid jou werklik kos",
      intro: "Basiese salaris is net deel van die storie — behuising- en vervoertoelaes, UIF, PAYE, mediese fonds-bydraes aan beide kante tel alles op tot wat 'n personeellid werklik kos. Koste tot Maatskappy bereken bruto salaris, totale aftrekkings, netto huisneem, en werklike koste tot maatskappy outomaties vanaf wat jy invoer.",
      benefits: [
            "Rekord basiese salaris plus behuising-, vervoer-, en etetoelaes",
            "Volg werknemer-aftrekkings: UIF, PAYE, mediese fonds, ander",
            "Volg werkgewerbydraes: UIF, mediese fonds",
            "Bruto salaris, netto huisneem, en koste-tot-maatskappy outomaties bereken",
            "Ingesluit vanaf Enterprise-planne, of beskikbaar as 'n individuele byvoeging"
      ],
      forWhom: "Enige operateur wat 'n werklike beeld van personeelkoste wil hê buite basiese salaris — veral nuttig sodra jy meer as 'n handvol werknemers bestuur."
},
    fr: {
      title: "Coût Total Employeur",
      metaTitle: "Logiciel de Paie et de Coût Total Employeur pour Opérateurs Touristiques",
      metaDescription: "Répartitions complètes de la paie — salaire, indemnités, déductions, cotisations sociales — avec le coût total réel par membre du personnel, calculé automatiquement.",
      keywords: [
            "logiciel de calcul du coût total employeur",
            "logiciel de paie petite entreprise Afrique du Sud",
            "suivi des cotisations sociales",
            "suivi des coûts de personnel voyagiste"
      ],
      heroTagline: "Sachez ce que chaque membre du personnel vous coûte réellement",
      intro: "Le salaire de base n'est qu'une partie de l'histoire — les indemnités de logement et de transport, les cotisations sociales, les contributions à l'assurance maladie des deux côtés s'additionnent pour former ce qu'un membre du personnel coûte réellement. Coût Total Employeur calcule automatiquement le salaire brut, le total des déductions, le net à payer, et le coût total réel pour l'entreprise à partir de ce que vous saisissez.",
      benefits: [
            "Enregistrez le salaire de base plus les indemnités de logement, de transport et de repas",
            "Suivez les déductions salariales : cotisations sociales, assurance maladie, autres",
            "Suivez les cotisations patronales : cotisations sociales, assurance maladie",
            "Salaire brut, net à payer, et coût total employeur calculés automatiquement",
            "Inclus à partir des forfaits Entreprise, ou disponible en tant que module complémentaire individuel"
      ],
      forWhom: "Tout opérateur souhaitant une image réelle du coût du personnel au-delà du salaire de base — particulièrement utile dès que vous gérez plus qu'une poignée d'employés."
},
    pt: {
      title: "Custo para a Empresa",
      metaTitle: "Software de Folha de Pagamento e Custo para a Empresa para Operadores Turísticos",
      metaDescription: "Discriminações completas da folha de pagamento — salário, subsídios, deduções, contribuições — com o custo real para a empresa por membro da equipa, calculado automaticamente.",
      keywords: [
            "software de calculadora de custo para a empresa",
            "software de folha de pagamento pequena empresa África do Sul",
            "rastreamento de contribuições sociais",
            "rastreamento de custo de equipa operadora turística"
      ],
      heroTagline: "Saiba quanto cada membro da equipa lhe custa realmente",
      intro: "O salário base é apenas parte da história — os subsídios de habitação e transporte, as contribuições sociais, as contribuições de seguro de saúde de ambos os lados somam-se ao que um membro da equipa realmente custa. Custo para a Empresa calcula automaticamente o salário bruto, o total de deduções, o líquido a receber, e o custo real para a empresa a partir do que introduz.",
      benefits: [
            "Registe o salário base mais subsídios de habitação, transporte e refeição",
            "Acompanhe deduções do funcionário: contribuições sociais, seguro de saúde, outras",
            "Acompanhe contribuições da entidade patronal: contribuições sociais, seguro de saúde",
            "Salário bruto, líquido a receber, e custo para a empresa calculados automaticamente",
            "Incluído a partir dos planos Enterprise, ou disponível como extra individual"
      ],
      forWhom: "Qualquer operador que queira uma imagem real do custo de equipa além do salário base — particularmente útil assim que gerir mais do que um punhado de funcionários."
},
    de: {
      title: "Lohnkosten",
      metaTitle: "Gehaltsabrechnungs- und Lohnkostensoftware für Tourismusbetreiber",
      metaDescription: "Vollständige Gehaltsabrechnungen — Gehalt, Zulagen, Abzüge, Sozialabgaben — mit den tatsächlichen Lohnkosten pro Mitarbeiter, automatisch berechnet.",
      keywords: [
            "Lohnkostenrechner-Software",
            "Gehaltsabrechnungssoftware Kleinunternehmen Südafrika",
            "Sozialabgaben-Verfolgung",
            "Personalkostenverfolgung Reiseveranstalter"
      ],
      heroTagline: "Wissen Sie, was jeder Mitarbeiter Sie wirklich kostet",
      intro: "Das Grundgehalt ist nur ein Teil der Geschichte — Wohn- und Fahrtkostenzulagen, Sozialabgaben, Krankenversicherungsbeiträge auf beiden Seiten summieren sich zu dem, was ein Mitarbeiter tatsächlich kostet. Lohnkosten berechnet automatisch Bruttogehalt, Gesamtabzüge, Netto-Auszahlung, und tatsächliche Lohnkosten aus dem, was Sie eingeben.",
      benefits: [
            "Erfassen Sie Grundgehalt plus Wohn-, Fahrt-, und Verpflegungszulagen",
            "Verfolgen Sie Arbeitnehmerabzüge: Sozialabgaben, Krankenversicherung, sonstige",
            "Verfolgen Sie Arbeitgeberbeiträge: Sozialabgaben, Krankenversicherung",
            "Bruttogehalt, Netto-Auszahlung, und Lohnkosten automatisch berechnet",
            "Enthalten ab Enterprise-Tarifen, oder als individuelles Add-on erhältlich"
      ],
      forWhom: "Jeder Betreiber, der ein echtes Bild der Personalkosten über das Grundgehalt hinaus möchte — besonders nützlich, sobald Sie mehr als eine Handvoll Mitarbeiter verwalten."
},
  },
  'lodging-rooms': {
    en: {
      title: 'Lodging & Rooms',
      metaTitle: 'Room Management Software for Lodges, Guesthouses & Hotels',
      metaDescription: 'Room inventory, nightly rates, and live occupancy status for lodges, guesthouses, hotels, and campsites — including tented camps and campsite pitches.',
      keywords: ['room management software lodge', 'hotel room inventory system', 'guesthouse booking software', 'campsite management software', 'lodge occupancy tracking'],
      heroTagline: 'Every room, its rate, and whether it\u2019s occupied tonight',
      intro: 'Whether you run 3 rooms or 300, you need one clear view of what\u2019s available, what\u2019s occupied, and what each room earns per night. Lodging & Rooms covers every accommodation type — from single rooms and suites to tented camps and campsite pitches, small or large.',
      benefits: [
        'Track room type, floor, capacity, and nightly rate per room',
        'Room types include single, double, twin, family, suite, chalet, luxury tent, tented camp, and small or large campsite',
        'Live status: available, occupied, or under maintenance',
        'See occupancy at a glance from the room overview dashboard',
        'Room limits scale with your plan — from 1 room free up to unlimited',
      ],
      forWhom: 'Airbnb and homestay hosts, guesthouses, lodges and camps, and hotels or motels of any size.',
    },
    af: {
      title: "Verblyf & Kamers",
      metaTitle: "Kamerbestuurprogrammatuur vir Lodges, Gastehuise & Hotelle",
      metaDescription: "Kamervoorraad, nagtelike tariewe, en intydse okkupasiestatus vir lodges, gastehuise, hotelle, en kampeerterreine — insluitend tentkampe en kampeerplekke.",
      keywords: [
            "kamerbestuurprogrammatuur lodge",
            "hotelkamervoorraadstelsel",
            "gastehuis-besprekingsagteware",
            "kampeerterrein-bestuurprogrammatuur",
            "lodge-okkupasie-opsporing"
      ],
      heroTagline: "Elke kamer, sy tarief, en of dit vanaand beset is",
      intro: "Of jy 3 kamers of 300 bedryf, jy benodig een duidelike oorsig van wat beskikbaar is, wat beset is, en wat elke kamer per nag verdien. Verblyf & Kamers dek elke verblyftipe — van enkelkamers en suites tot tentkampe en kampeerplekke, klein of groot.",
      benefits: [
            "Volg kamertipe, verdieping, kapasiteit, en nagtelike tarief per kamer",
            "Kamertipes sluit in enkel, dubbel, tweeslaapplek, gesin, suite, chalet, luukse tent, tentkamp, en klein of groot kampeerterrein",
            "Intydse status: beskikbaar, beset, of onder instandhouding",
            "Sien okkupasie op 'n oogopslag vanaf die kameroorsig-paneelbord",
            "Kamerlimiete skaal met jou plan — van 1 kamer gratis tot onbeperk"
      ],
      forWhom: "Airbnb- en tuisverblyf-gashere, gastehuise, lodges en kampe, en hotelle of motelle van enige grootte."
},
    fr: {
      title: "Hébergement & Chambres",
      metaTitle: "Logiciel de Gestion de Chambres pour Lodges, Gîtes & Hôtels",
      metaDescription: "Inventaire des chambres, tarifs nocturnes, et statut d'occupation en temps réel pour les lodges, gîtes, hôtels, et campings — y compris les camps de tentes et les emplacements de camping.",
      keywords: [
            "logiciel de gestion de chambres lodge",
            "système d'inventaire de chambres d'hôtel",
            "logiciel de réservation gîte",
            "logiciel de gestion de camping",
            "suivi d'occupation lodge"
      ],
      heroTagline: "Chaque chambre, son tarif, et si elle est occupée ce soir",
      intro: "Que vous gériez 3 chambres ou 300, vous avez besoin d'une vue claire de ce qui est disponible, ce qui est occupé, et ce que chaque chambre rapporte par nuit. Hébergement & Chambres couvre chaque type d'hébergement — des chambres simples et suites aux camps de tentes et emplacements de camping, petits ou grands.",
      benefits: [
            "Suivez le type de chambre, l'étage, la capacité, et le tarif nocturne par chambre",
            "Les types de chambres incluent simple, double, twin, familiale, suite, chalet, tente de luxe, camp de tentes, et emplacement de camping petit ou grand",
            "Statut en temps réel : disponible, occupée, ou en entretien",
            "Consultez l'occupation d'un coup d'œil depuis le tableau de bord de vue d'ensemble des chambres",
            "Les limites de chambres évoluent avec votre forfait — d'1 chambre gratuite à illimité"
      ],
      forWhom: "Hôtes Airbnb et d'hébergement chez l'habitant, gîtes, lodges et camps, et hôtels ou motels de toute taille."
},
    pt: {
      title: "Alojamento & Quartos",
      metaTitle: "Software de Gestão de Quartos para Lodges, Pousadas & Hotéis",
      metaDescription: "Inventário de quartos, tarifas noturnas, e estado de ocupação em tempo real para lodges, pousadas, hotéis, e parques de campismo — incluindo acampamentos de tendas e lugares de campismo.",
      keywords: [
            "software de gestão de quartos lodge",
            "sistema de inventário de quartos de hotel",
            "software de reservas para pousadas",
            "software de gestão de parque de campismo",
            "rastreamento de ocupação lodge"
      ],
      heroTagline: "Cada quarto, a sua tarifa, e se está ocupado esta noite",
      intro: "Quer opere 3 quartos ou 300, precisa de uma vista clara do que está disponível, do que está ocupado, e do que cada quarto rende por noite. Alojamento & Quartos abrange todos os tipos de alojamento — de quartos individuais e suítes a acampamentos de tendas e lugares de campismo, pequenos ou grandes.",
      benefits: [
            "Acompanhe tipo de quarto, piso, capacidade, e tarifa noturna por quarto",
            "Os tipos de quarto incluem individual, duplo, twin, familiar, suíte, chalé, tenda de luxo, acampamento de tendas, e lugar de campismo pequeno ou grande",
            "Estado em tempo real: disponível, ocupado, ou em manutenção",
            "Veja a ocupação rapidamente a partir do painel de visão geral dos quartos",
            "Os limites de quartos escalam com o seu plano — de 1 quarto grátis a ilimitado"
      ],
      forWhom: "Anfitriões Airbnb e de alojamento local, pousadas, lodges e acampamentos, e hotéis ou motéis de qualquer dimensão."
},
    de: {
      title: "Unterkunft & Zimmer",
      metaTitle: "Zimmerverwaltungssoftware für Lodges, Gästehäuser & Hotels",
      metaDescription: "Zimmerbestand, Nachttarife, und Echtzeit-Belegungsstatus für Lodges, Gästehäuser, Hotels, und Campingplätze — einschließlich Zeltlager und Campingstellplätze.",
      keywords: [
            "Zimmerverwaltungssoftware Lodge",
            "Hotelzimmerbestandssystem",
            "Buchungssoftware Gästehaus",
            "Campingplatz-Verwaltungssoftware",
            "Lodge-Belegungsverfolgung"
      ],
      heroTagline: "Jedes Zimmer, sein Preis, und ob es heute Nacht belegt ist",
      intro: "Ob Sie 3 Zimmer oder 300 betreiben, Sie brauchen einen klaren Überblick darüber, was verfügbar ist, was belegt ist, und was jedes Zimmer pro Nacht einbringt. Unterkunft & Zimmer deckt jede Unterkunftsart ab — von Einzelzimmern und Suiten bis zu Zeltlagern und Campingstellplätzen, klein oder groß.",
      benefits: [
            "Verfolgen Sie Zimmertyp, Stockwerk, Kapazität, und Nachttarif pro Zimmer",
            "Zimmertypen umfassen Einzel-, Doppel-, Zweibett-, Familien-, Suite, Chalet, Luxuszelt, Zeltlager, und kleinen oder großen Campingplatz",
            "Echtzeitstatus: verfügbar, belegt, oder in Wartung",
            "Sehen Sie die Belegung auf einen Blick vom Zimmerübersicht-Dashboard",
            "Zimmerlimits skalieren mit Ihrem Tarif — von 1 kostenlosen Zimmer bis unbegrenzt"
      ],
      forWhom: "Airbnb- und Homestay-Gastgeber, Gästehäuser, Lodges und Camps, und Hotels oder Motels jeder Größe."
},
  },
  'housekeeping': {
    en: {
      title: 'Housekeeping',
      metaTitle: 'Housekeeping & Room Turnover Software for Hospitality Operators',
      metaDescription: 'Assign and track room cleaning, turnover, and maintenance tasks so every room is guest-ready on schedule.',
      keywords: ['housekeeping management software', 'room turnover tracking system', 'hotel cleaning task software', 'hospitality task board'],
      heroTagline: 'Every room task, tracked from pending to done',
      intro: 'A guest arriving to an unmade room is one of the fastest ways to lose a good review. Housekeeping gives your team a clear task board — pending, in progress, completed — for cleaning, turnover, inspection, and maintenance requests, assigned to whoever\u2019s on shift.',
      benefits: [
        'Task types: full clean, guest turnover, inspection, and maintenance requests',
        'Assign tasks to specific staff members with a scheduled time',
        'Simple three-column board: pending, in progress, completed',
        'Linked directly to your room inventory',
        'Included on every plan — core hospitality functionality, not a paid add-on',
      ],
      forWhom: 'Any lodging operator with rooms to turn over between guests — lodges, guesthouses, hotels, and camps.',
    },
    af: {
      title: "Huishouding",
      metaTitle: "Huishoudings- en Kameromsetprogrammatuur vir Gasvryheidsoperateurs",
      metaDescription: "Wys en volg kameromsettaaks toe sodat elke kamer betyds gastegereed is.",
      keywords: [
            "huishoudingbestuurprogrammatuur",
            "kameromsetopsporingstelsel",
            "hotelskoonmaaktaak-agteware",
            "gasvryheidstaakbord"
      ],
      heroTagline: "Elke kamertaak, opgespoor van hangende tot klaar",
      intro: "'n Gas wat in 'n onopgemaakte kamer aankom, is een van die vinnigste maniere om 'n goeie resensie te verloor. Huishouding gee jou span 'n duidelike taakbord — hangende, aan die gang, voltooi — vir skoonmaak-, omset-, inspeksie-, en instandhoudingsversoeke, toegewys aan wie ook al op diens is.",
      benefits: [
            "Taaktipes: volledige skoonmaak, gasteomset, inspeksie, en instandhoudingsversoeke",
            "Wys take toe aan spesifieke personeellede met 'n geskeduleerde tyd",
            "Eenvoudige drie-kolom-bord: hangende, aan die gang, voltooi",
            "Direk gekoppel aan jou kamervoorraad",
            "Ingesluit op elke plan — kern-gasvryheidsfunksionaliteit, nie 'n betaalde byvoeging nie"
      ],
      forWhom: "Enige verblyfoperateur met kamers om tussen gaste om te sit — lodges, gastehuise, hotelle, en kampe."
},
    fr: {
      title: "Ménage",
      metaTitle: "Logiciel de Ménage et de Rotation des Chambres pour Opérateurs Hôteliers",
      metaDescription: "Attribuez et suivez les tâches de nettoyage, rotation, et entretien des chambres pour que chaque chambre soit prête à temps pour les clients.",
      keywords: [
            "logiciel de gestion du ménage",
            "système de suivi de rotation des chambres",
            "logiciel de tâches de nettoyage hôtel",
            "tableau de tâches hôtellerie"
      ],
      heroTagline: "Chaque tâche de chambre, suivie de en attente à terminée",
      intro: "Un client arrivant dans une chambre non faite est l'un des moyens les plus rapides de perdre un bon avis. Ménage donne à votre équipe un tableau de tâches clair — en attente, en cours, terminé — pour le nettoyage, la rotation, l'inspection, et les demandes d'entretien, attribuées à qui est de service.",
      benefits: [
            "Types de tâches : nettoyage complet, rotation client, inspection, et demandes d'entretien",
            "Attribuez des tâches à des membres du personnel spécifiques avec une heure planifiée",
            "Tableau simple à trois colonnes : en attente, en cours, terminé",
            "Directement lié à votre inventaire de chambres",
            "Inclus dans chaque forfait — fonctionnalité hôtelière essentielle, pas un module payant"
      ],
      forWhom: "Tout opérateur d'hébergement avec des chambres à remettre en état entre les clients — lodges, gîtes, hôtels, et camps."
},
    pt: {
      title: "Limpeza",
      metaTitle: "Software de Limpeza e Rotatividade de Quartos para Operadores de Hotelaria",
      metaDescription: "Atribua e acompanhe tarefas de limpeza, rotatividade, e manutenção de quartos para que cada quarto esteja pronto a tempo para os hóspedes.",
      keywords: [
            "software de gestão de limpeza",
            "sistema de rastreamento de rotatividade de quartos",
            "software de tarefas de limpeza de hotel",
            "quadro de tarefas de hotelaria"
      ],
      heroTagline: "Cada tarefa de quarto, acompanhada de pendente a concluída",
      intro: "Um hóspede a chegar a um quarto por fazer é uma das formas mais rápidas de perder uma boa avaliação. Limpeza dá à sua equipa um quadro de tarefas claro — pendente, em curso, concluída — para limpeza, rotatividade, inspeção, e pedidos de manutenção, atribuídos a quem estiver de serviço.",
      benefits: [
            "Tipos de tarefas: limpeza completa, rotatividade de hóspedes, inspeção, e pedidos de manutenção",
            "Atribua tarefas a membros específicos da equipa com uma hora agendada",
            "Quadro simples de três colunas: pendente, em curso, concluída",
            "Ligado diretamente ao seu inventário de quartos",
            "Incluído em todos os planos — funcionalidade essencial de hotelaria, não um extra pago"
      ],
      forWhom: "Qualquer operador de alojamento com quartos a preparar entre hóspedes — lodges, pousadas, hotéis, e acampamentos."
},
    de: {
      title: "Housekeeping",
      metaTitle: "Housekeeping- und Zimmerwechsel-Software für Gastgewerbebetreiber",
      metaDescription: "Weisen Sie Zimmerreinigungs-, Wechsel-, und Wartungsaufgaben zu und verfolgen Sie sie, damit jedes Zimmer pünktlich gästefertig ist.",
      keywords: [
            "Housekeeping-Verwaltungssoftware",
            "Zimmerwechsel-Verfolgungssystem",
            "Hotelreinigungsaufgaben-Software",
            "Gastgewerbe-Aufgabentafel"
      ],
      heroTagline: "Jede Zimmeraufgabe, verfolgt von ausstehend bis erledigt",
      intro: "Ein Gast, der in einem ungemachten Zimmer ankommt, ist eine der schnellsten Möglichkeiten, eine gute Bewertung zu verlieren. Housekeeping gibt Ihrem Team eine klare Aufgabentafel — ausstehend, in Bearbeitung, abgeschlossen — für Reinigung, Wechsel, Inspektion, und Wartungsanfragen, zugewiesen an wer gerade Dienst hat.",
      benefits: [
            "Aufgabentypen: Vollreinigung, Gästewechsel, Inspektion, und Wartungsanfragen",
            "Weisen Sie Aufgaben bestimmten Mitarbeitern mit einer geplanten Zeit zu",
            "Einfache Drei-Spalten-Tafel: ausstehend, in Bearbeitung, abgeschlossen",
            "Direkt mit Ihrem Zimmerbestand verknüpft",
            "Enthalten in jedem Tarif — grundlegende Gastgewerbefunktionalität, kein kostenpflichtiges Add-on"
      ],
      forWhom: "Jeder Unterkunftsbetreiber mit Zimmern, die zwischen Gästen aufbereitet werden müssen — Lodges, Gästehäuser, Hotels, und Camps."
},
  },
  'guest-directory': {
    en: {
      title: 'Guest Directory',
      metaTitle: 'Guest Directory Software for Repeat Guest Tracking',
      metaDescription: 'A single view of every guest across all your stays and bookings — built for lodges, hotels, and tour operators who want to recognize repeat guests.',
      keywords: ['guest management software hotel', 'repeat guest tracking system', 'guest directory lodge software', 'CRM for tourism operators'],
      heroTagline: 'Recognize a returning guest before they have to remind you',
      intro: 'A guest who\u2019s stayed with you three times shouldn\u2019t have to re-explain their preferences every time. The Guest Directory pulls every booking a guest has made — across rooms, tours, or transfers — into one view, so your team always has the full history at hand.',
      benefits: [
        'One record per guest across every booking type',
        'Full stay and booking history in one place',
        'Contact details and nationality tracked per guest',
        'Foundation for guest recognition and repeat-business follow-up',
      ],
      forWhom: 'Lodges, hotels, and tour operators who want to build a relationship with repeat guests rather than treating every booking as a first-time visitor.',
    },
    af: {
      title: "Gastegids",
      metaTitle: "Gastegids-programmatuur vir Herhaalde-gaste-opsporing",
      metaDescription: "'n Enkele oorsig van elke gas oor al jou verblyf en besprekings — gebou vir lodges, hotelle, en toeroperateurs wat herhaalde gaste wil herken.",
      keywords: [
            "gastebestuurprogrammatuur hotel",
            "herhaalde-gaste-opsporingstelsel",
            "gastegids lodge-agteware",
            "CRM vir toerisme-operateurs"
      ],
      heroTagline: "Herken 'n terugkerende gas voordat hulle jou moet herinner",
      intro: "'n Gas wat al drie keer by jou gebly het, behoort nie elke keer hul voorkeure te moet herverduidelik nie. Die Gastegids trek elke bespreking wat 'n gas gemaak het — oor kamers, toere, of oordragte — in een oorsig, sodat jou span altyd die volledige geskiedenis byderhand het.",
      benefits: [
            "Een rekord per gas oor elke besprekingstipe",
            "Volledige verblyf- en besprekingsgeskiedenis op een plek",
            "Kontakbesonderhede en nasionaliteit opgespoor per gas",
            "Grondslag vir gasteherkenning en herhaalde-besigheid-opvolging"
      ],
      forWhom: "Lodges, hotelle, en toeroperateurs wat 'n verhouding met herhaalde gaste wil bou eerder as om elke bespreking as 'n eerstekeer-besoeker te hanteer."
},
    fr: {
      title: "Répertoire des Clients",
      metaTitle: "Logiciel de Répertoire de Clients pour le Suivi des Clients Récurrents",
      metaDescription: "Une vue unique de chaque client à travers tous vos séjours et réservations — conçu pour les lodges, hôtels, et voyagistes qui veulent reconnaître les clients récurrents.",
      keywords: [
            "logiciel de gestion des clients hôtel",
            "système de suivi des clients récurrents",
            "logiciel de répertoire de clients lodge",
            "CRM pour opérateurs touristiques"
      ],
      heroTagline: "Reconnaissez un client de retour avant qu'il n'ait à vous le rappeler",
      intro: "Un client qui a séjourné chez vous trois fois ne devrait pas avoir à réexpliquer ses préférences à chaque fois. Le Répertoire des Clients rassemble chaque réservation qu'un client a faite — chambres, circuits, ou transferts — en une seule vue, afin que votre équipe ait toujours l'historique complet sous la main.",
      benefits: [
            "Un dossier par client à travers tous les types de réservation",
            "Historique complet des séjours et réservations en un seul endroit",
            "Coordonnées et nationalité suivies par client",
            "Base pour la reconnaissance des clients et le suivi des affaires récurrentes"
      ],
      forWhom: "Lodges, hôtels, et voyagistes qui souhaitent construire une relation avec les clients récurrents plutôt que de traiter chaque réservation comme un visiteur pour la première fois."
},
    pt: {
      title: "Diretório de Hóspedes",
      metaTitle: "Software de Diretório de Hóspedes para Rastreamento de Hóspedes Recorrentes",
      metaDescription: "Uma vista única de cada hóspede em todas as suas estadias e reservas — criado para lodges, hotéis, e operadoras turísticas que querem reconhecer hóspedes recorrentes.",
      keywords: [
            "software de gestão de hóspedes hotel",
            "sistema de rastreamento de hóspedes recorrentes",
            "software de diretório de hóspedes lodge",
            "CRM para operadores turísticos"
      ],
      heroTagline: "Reconheça um hóspede que regressa antes que ele tenha de o lembrar",
      intro: "Um hóspede que já ficou hospedado consigo três vezes não deveria ter de reexplicar as suas preferências sempre. O Diretório de Hóspedes reúne cada reserva que um hóspede fez — em quartos, tours, ou transfers — numa só vista, para que a sua equipa tenha sempre o histórico completo à mão.",
      benefits: [
            "Um registo por hóspede em todos os tipos de reserva",
            "Histórico completo de estadias e reservas num só lugar",
            "Contactos e nacionalidade acompanhados por hóspede",
            "Base para o reconhecimento de hóspedes e o acompanhamento de negócios recorrentes"
      ],
      forWhom: "Lodges, hotéis, e operadoras turísticas que querem construir uma relação com hóspedes recorrentes em vez de tratar cada reserva como uma primeira visita."
},
    de: {
      title: "Gästeverzeichnis",
      metaTitle: "Gästeverzeichnis-Software für die Verfolgung von Stammgästen",
      metaDescription: "Eine einzige Ansicht jedes Gastes über alle Ihre Aufenthalte und Buchungen hinweg — entwickelt für Lodges, Hotels, und Reiseveranstalter, die Stammgäste erkennen möchten.",
      keywords: [
            "Gästeverwaltungssoftware Hotel",
            "Stammgast-Verfolgungssystem",
            "Gästeverzeichnis-Software Lodge",
            "CRM für Tourismusbetreiber"
      ],
      heroTagline: "Erkennen Sie einen wiederkehrenden Gast, bevor er Sie erinnern muss",
      intro: "Ein Gast, der dreimal bei Ihnen übernachtet hat, sollte seine Vorlieben nicht jedes Mal neu erklären müssen. Das Gästeverzeichnis zieht jede Buchung, die ein Gast getätigt hat — über Zimmer, Touren, oder Transfers — in eine Ansicht, sodass Ihr Team immer die vollständige Historie zur Hand hat.",
      benefits: [
            "Ein Datensatz pro Gast über jede Buchungsart hinweg",
            "Vollständige Aufenthalts- und Buchungshistorie an einem Ort",
            "Kontaktdaten und Nationalität pro Gast verfolgt",
            "Grundlage für Gästeerkennung und Nachverfolgung von Wiederholungsgeschäft"
      ],
      forWhom: "Lodges, Hotels, und Reiseveranstalter, die eine Beziehung zu Stammgästen aufbauen möchten, statt jede Buchung als Erstbesucher zu behandeln."
},
  },
  'invoicing': {
    en: {
      title: 'Pro Forma & Tax Invoices',
      metaTitle: 'Invoicing Software for Tour Operators with Multi-Currency VAT',
      metaDescription: 'Generate professional pro forma and tax invoices with automatic VAT calculation in your local currency — ZAR, KES, USD and more.',
      keywords: ['invoicing software tour operator', 'pro forma invoice generator Africa', 'tax invoice software VAT', 'multi-currency invoicing tourism'],
      heroTagline: 'Professional invoices, automatic VAT, your currency',
      intro: 'Guests expect a proper invoice, and your accountant expects the VAT math to be right. Generate pro forma invoices before a trip and tax invoices after, with VAT calculated automatically in whichever of 15+ currencies you bill in.',
      benefits: [
        'Pro forma invoices for deposits and bookings, tax invoices for completed stays',
        'Automatic VAT calculation at your configured rate',
        'Bill in ZAR, KES, TZS, USD, EUR, and 10+ other currencies',
        'Line-item detail linked directly to the originating booking',
        'Track invoice status: draft, sent, paid',
      ],
      forWhom: 'Every operator who needs to invoice guests or corporate clients — included on every plan.',
    },
    af: {
      title: "Pro Forma- & Belastingfakture",
      metaTitle: "Fakturerings-programmatuur vir Toeroperateurs met Multi-geldeenheid-BTW",
      metaDescription: "Genereer professionele pro forma- en belastingfakture met outomaties BTW-berekening in jou plaaslike geldeenheid — ZAR, KES, USD en meer.",
      keywords: [
            "fakturerings-agteware toeroperateur",
            "pro forma-faktuurgenereerder Afrika",
            "belastingfaktuur-agteware BTW",
            "multi-geldeenheid-fakturering toerisme"
      ],
      heroTagline: "Professionele fakture, outomatiese BTW, jou geldeenheid",
      intro: "Gaste verwag 'n behoorlike faktuur, en jou boekhouer verwag dat die BTW-wiskunde reg is. Genereer pro forma-fakture voor 'n reis en belastingfakture daarna, met BTW outomaties bereken in watter een van 15+ geldeenhede jy ook al faktureer.",
      benefits: [
            "Pro forma-fakture vir deposito's en besprekings, belastingfakture vir voltooide verblyf",
            "Outomatiese BTW-berekening teen jou gekonfigureerde koers",
            "Faktureer in ZAR, KES, TZS, USD, EUR, en 10+ ander geldeenhede",
            "Lynitemdetail direk gekoppel aan die oorspronklike bespreking",
            "Volg faktuurstatus: konsep, gestuur, betaal"
      ],
      forWhom: "Elke operateur wat gaste of korporatiewe kliënte moet faktureer — ingesluit op elke plan."
},
    fr: {
      title: "Factures Pro Forma & Fiscales",
      metaTitle: "Logiciel de Facturation pour Voyagistes avec TVA Multidevise",
      metaDescription: "Générez des factures pro forma et fiscales professionnelles avec calcul automatique de la TVA dans votre devise locale — ZAR, KES, USD et plus.",
      keywords: [
            "logiciel de facturation voyagiste",
            "générateur de facture pro forma Afrique",
            "logiciel de facture fiscale TVA",
            "facturation multidevise tourisme"
      ],
      heroTagline: "Factures professionnelles, TVA automatique, votre devise",
      intro: "Les clients attendent une vraie facture, et votre comptable attend que les calculs de TVA soient corrects. Générez des factures pro forma avant un voyage et des factures fiscales après, avec la TVA calculée automatiquement dans l'une des 15+ devises dans lesquelles vous facturez.",
      benefits: [
            "Factures pro forma pour les acomptes et réservations, factures fiscales pour les séjours terminés",
            "Calcul automatique de la TVA au taux que vous avez configuré",
            "Facturez en ZAR, KES, TZS, USD, EUR, et 10+ autres devises",
            "Détail ligne par ligne relié directement à la réservation d'origine",
            "Suivez le statut de la facture : brouillon, envoyée, payée"
      ],
      forWhom: "Tout opérateur ayant besoin de facturer des clients ou des entreprises — inclus dans chaque forfait."
},
    pt: {
      title: "Faturas Pro Forma & Fiscais",
      metaTitle: "Software de Faturação para Operadoras Turísticas com IVA Multi-moeda",
      metaDescription: "Gere faturas pro forma e fiscais profissionais com cálculo automático de IVA na sua moeda local — ZAR, KES, USD e mais.",
      keywords: [
            "software de faturação operadora turística",
            "gerador de fatura pro forma África",
            "software de fatura fiscal IVA",
            "faturação multi-moeda turismo"
      ],
      heroTagline: "Faturas profissionais, IVA automático, a sua moeda",
      intro: "Os hóspedes esperam uma fatura adequada, e o seu contabilista espera que os cálculos de IVA estejam corretos. Gere faturas pro forma antes de uma viagem e faturas fiscais depois, com o IVA calculado automaticamente em qualquer uma das mais de 15 moedas em que fatura.",
      benefits: [
            "Faturas pro forma para depósitos e reservas, faturas fiscais para estadias concluídas",
            "Cálculo automático de IVA à taxa configurada",
            "Fature em ZAR, KES, TZS, USD, EUR, e mais de 10 outras moedas",
            "Detalhe de itens ligado diretamente à reserva de origem",
            "Acompanhe o estado da fatura: rascunho, enviada, paga"
      ],
      forWhom: "Todo operador que precise de faturar hóspedes ou clientes empresariais — incluído em todos os planos."
},
    de: {
      title: "Pro-forma- & Steuerrechnungen",
      metaTitle: "Rechnungssoftware für Reiseveranstalter mit Mehrwährungs-MwSt.",
      metaDescription: "Erstellen Sie professionelle Pro-forma- und Steuerrechnungen mit automatischer MwSt.-Berechnung in Ihrer Landeswährung — ZAR, KES, USD und mehr.",
      keywords: [
            "Rechnungssoftware Reiseveranstalter",
            "Pro-forma-Rechnungsgenerator Afrika",
            "Steuerrechnungssoftware MwSt.",
            "Mehrwährungsrechnungsstellung Tourismus"
      ],
      heroTagline: "Professionelle Rechnungen, automatische MwSt., Ihre Währung",
      intro: "Gäste erwarten eine ordentliche Rechnung, und Ihr Buchhalter erwartet, dass die MwSt.-Berechnung stimmt. Erstellen Sie Pro-forma-Rechnungen vor einer Reise und Steuerrechnungen danach, mit automatisch berechneter MwSt. in einer von 15+ Währungen, in denen Sie abrechnen.",
      benefits: [
            "Pro-forma-Rechnungen für Anzahlungen und Buchungen, Steuerrechnungen für abgeschlossene Aufenthalte",
            "Automatische MwSt.-Berechnung zu Ihrem konfigurierten Satz",
            "Rechnungsstellung in ZAR, KES, TZS, USD, EUR, und 10+ weiteren Währungen",
            "Positionsdetails direkt mit der ursprünglichen Buchung verknüpft",
            "Verfolgen Sie den Rechnungsstatus: Entwurf, gesendet, bezahlt"
      ],
      forWhom: "Jeder Betreiber, der Gästen oder Firmenkunden Rechnungen stellen muss — enthalten in jedem Tarif."
},
  },
  'reports-analytics': {
    en: {
      title: 'Reports & Analytics',
      metaTitle: 'Reporting & Analytics Dashboard for Tourism and Hospitality Businesses',
      metaDescription: 'Occupancy, revenue, staff cost, and booking trend reports for tourism and hospitality operators — know your numbers without exporting to Excel.',
      keywords: ['tourism business analytics software', 'hotel occupancy reporting software', 'revenue reporting tour operator', 'hospitality dashboard software'],
      heroTagline: 'Your occupancy, revenue, and booking trends, always current',
      intro: 'Knowing whether last month was actually good or just felt good shouldn\u2019t require an afternoon in a spreadsheet. Reports & Analytics keeps occupancy, revenue, staff cost, and booking trend data live on your dashboard, whenever you need to check it.',
      benefits: [
        'Occupancy rates across rooms, vehicles, or vessels',
        'Revenue trends by period, booking type, or resource',
        'Staff cost reporting drawing on your Cost to Company data',
        'Booking trend visibility to spot your busy and slow seasons',
      ],
      forWhom: 'Any operator who wants to make decisions based on real numbers rather than gut feel.',
    },
    af: {
      title: "Verslae & Ontleding",
      metaTitle: "Verslagdoening- en Ontledingpaneelbord vir Toerisme- en Gasvryheidsbesighede",
      metaDescription: "Okkupasie-, inkomste-, personeelkoste-, en besprekingstendensverslae vir toerisme- en gasvryheidsoperateurs — ken jou syfers sonder om na Excel uit te voer.",
      keywords: [
            "toerismebesigheidsontledingprogrammatuur",
            "hotelokkupasie-verslagdoeningprogrammatuur",
            "inkomsteverslagdoening toeroperateur",
            "gasvryheidspaneelbord-programmatuur"
      ],
      heroTagline: "Jou okkupasie, inkomste, en besprekingstendense, altyd op datum",
      intro: "Om te weet of verlede maand werklik goed was of net so gevoel het, behoort nie 'n middag in 'n sigblad te vereis nie. Verslae & Ontleding hou okkupasie-, inkomste-, personeelkoste-, en besprekingstendensdata lewendig op jou paneelbord, wanneer jy dit ook al moet nagaan.",
      benefits: [
            "Okkupasiekoerse oor kamers, voertuie, of vaartuie",
            "Inkomstetendense volgens tydperk, besprekingtipe, of hulpbron",
            "Personeelkoste-verslagdoening wat op jou Koste-tot-Maatskappy-data trek",
            "Besprekingstendens-sigbaarheid om jou besige en stadige seisoene te bespeur"
      ],
      forWhom: "Enige operateur wat besluite wil neem op grond van werklike syfers eerder as intuïsie."
},
    fr: {
      title: "Rapports & Analyses",
      metaTitle: "Tableau de Bord de Rapports et d'Analyses pour Entreprises de Tourisme et d'Hôtellerie",
      metaDescription: "Rapports d'occupation, de revenus, de coûts de personnel, et de tendances de réservation pour les opérateurs de tourisme et d'hôtellerie — connaissez vos chiffres sans passer par Excel.",
      keywords: [
            "logiciel d'analyse d'entreprise touristique",
            "logiciel de rapport d'occupation hôtelière",
            "rapport de revenus voyagiste",
            "logiciel de tableau de bord hôtellerie"
      ],
      heroTagline: "Votre occupation, vos revenus, et vos tendances de réservation, toujours à jour",
      intro: "Savoir si le mois dernier a été vraiment bon ou juste semblait bon ne devrait pas nécessiter un après-midi dans un tableur. Rapports & Analyses garde les données d'occupation, de revenus, de coûts de personnel, et de tendances de réservation en direct sur votre tableau de bord, dès que vous en avez besoin.",
      benefits: [
            "Taux d'occupation pour les chambres, véhicules, ou navires",
            "Tendances de revenus par période, type de réservation, ou ressource",
            "Rapports de coûts de personnel s'appuyant sur vos données de Coût Total Employeur",
            "Visibilité des tendances de réservation pour repérer vos saisons chargées et creuses"
      ],
      forWhom: "Tout opérateur qui souhaite prendre des décisions basées sur des chiffres réels plutôt que sur son instinct."
},
    pt: {
      title: "Relatórios & Análises",
      metaTitle: "Painel de Relatórios e Análises para Negócios de Turismo e Hotelaria",
      metaDescription: "Relatórios de ocupação, receita, custo de pessoal, e tendências de reservas para operadores de turismo e hotelaria — conheça os seus números sem exportar para o Excel.",
      keywords: [
            "software de análise de negócio turístico",
            "software de relatórios de ocupação hoteleira",
            "relatório de receita operadora turística",
            "software de painel de hotelaria"
      ],
      heroTagline: "A sua ocupação, receita, e tendências de reservas, sempre atualizadas",
      intro: "Saber se o mês passado foi realmente bom ou apenas pareceu bom não deveria exigir uma tarde numa folha de cálculo. Relatórios & Análises mantém os dados de ocupação, receita, custo de pessoal, e tendência de reservas em direto no seu painel, sempre que precisar de verificar.",
      benefits: [
            "Taxas de ocupação em quartos, veículos, ou embarcações",
            "Tendências de receita por período, tipo de reserva, ou recurso",
            "Relatórios de custo de pessoal com base nos seus dados de Custo para a Empresa",
            "Visibilidade de tendências de reservas para identificar as suas épocas altas e baixas"
      ],
      forWhom: "Qualquer operador que queira tomar decisões com base em números reais em vez de intuição."
},
    de: {
      title: "Berichte & Analysen",
      metaTitle: "Berichts- und Analyse-Dashboard für Tourismus- und Gastgewerbeunternehmen",
      metaDescription: "Belegungs-, Umsatz-, Personalkosten-, und Buchungstrendberichte für Tourismus- und Gastgewerbebetreiber — kennen Sie Ihre Zahlen, ohne nach Excel zu exportieren.",
      keywords: [
            "Tourismusunternehmens-Analysesoftware",
            "Hotelbelegungs-Berichtssoftware",
            "Umsatzbericht Reiseveranstalter",
            "Gastgewerbe-Dashboard-Software"
      ],
      heroTagline: "Ihre Belegung, Ihr Umsatz, und Ihre Buchungstrends, immer aktuell",
      intro: "Zu wissen, ob der letzte Monat wirklich gut war oder sich nur gut angefühlt hat, sollte keinen Nachmittag in einer Tabellenkalkulation erfordern. Berichte & Analysen hält Belegungs-, Umsatz-, Personalkosten-, und Buchungstrenddaten live auf Ihrem Dashboard, wann immer Sie sie prüfen müssen.",
      benefits: [
            "Belegungsraten über Zimmer, Fahrzeuge, oder Wasserfahrzeuge hinweg",
            "Umsatztrends nach Zeitraum, Buchungsart, oder Ressource",
            "Personalkostenberichte basierend auf Ihren Lohnkostendaten",
            "Buchungstrend-Übersicht, um Ihre Hoch- und Nebensaisons zu erkennen"
      ],
      forWhom: "Jeder Betreiber, der Entscheidungen basierend auf echten Zahlen statt auf Bauchgefühl treffen möchte."
},
  },
  'csv-export': {
    en: {
      title: 'CSV Data Export',
      metaTitle: 'CSV Export Tools for Tourism Operations Data',
      metaDescription: 'Export bookings, staff, financial, and operational data to CSV for your accountant, auditor, or your own spreadsheets.',
      keywords: ['CSV export tourism software', 'operations data export tool', 'accounting export tour operator software'],
      heroTagline: 'Your data, out to a spreadsheet whenever you need it',
      intro: 'OpDesk is where your operational data lives day to day, but it\u2019s never locked in. Export bookings, staff records, financials, or any other operational data to CSV for your accountant, an audit, or your own analysis.',
      benefits: [
        'Export any module\u2019s data — bookings, staff, invoices, and more',
        'Standard CSV format opens directly in Excel or Google Sheets',
        'No lock-in — your data stays exportable at any time',
      ],
      forWhom: 'Every operator, particularly at tax time or when working with an external accountant or auditor.',
    },
    af: {
      title: "CSV-datauitvoer",
      metaTitle: "CSV-uitvoerinstrumente vir Toerisme-bedryfsdata",
      metaDescription: "Voer besprekings-, personeel-, finansiële, en bedryfsdata uit na CSV vir jou rekenmeester, ouditeur, of jou eie sigblaaie.",
      keywords: [
            "CSV-uitvoer toerisme-agteware",
            "bedryfsdata-uitvoerinstrument",
            "rekeningkunde-uitvoer toeroperateur-agteware"
      ],
      heroTagline: "Jou data, uit na 'n sigblad wanneer jy dit ook al nodig het",
      intro: "OpDesk is waar jou bedryfsdata daagliks woon, maar dit is nooit vasgesluit nie. Voer besprekings, personeelrekords, finansies, of enige ander bedryfsdata uit na CSV vir jou rekenmeester, 'n oudit, of jou eie ontleding.",
      benefits: [
            "Voer enige module se data uit — besprekings, personeel, fakture, en meer",
            "Standaard CSV-formaat open direk in Excel of Google Sheets",
            "Geen vaslegging nie — jou data bly enige tyd uitvoerbaar"
      ],
      forWhom: "Elke operateur, veral met belastingtyd of wanneer jy met 'n eksterne rekenmeester of ouditeur werk."
},
    fr: {
      title: "Export de Données CSV",
      metaTitle: "Outils d'Export CSV pour les Données d'Exploitation Touristique",
      metaDescription: "Exportez les données de réservations, de personnel, financières, et opérationnelles au format CSV pour votre comptable, auditeur, ou vos propres tableurs.",
      keywords: [
            "logiciel d'export CSV tourisme",
            "outil d'export de données opérationnelles",
            "export comptable logiciel voyagiste"
      ],
      heroTagline: "Vos données, vers un tableur dès que vous en avez besoin",
      intro: "OpDesk est l'endroit où vivent vos données opérationnelles au quotidien, mais elles ne sont jamais verrouillées. Exportez les réservations, les dossiers du personnel, les finances, ou toute autre donnée opérationnelle au format CSV pour votre comptable, un audit, ou votre propre analyse.",
      benefits: [
            "Exportez les données de n'importe quel module — réservations, personnel, factures, et plus",
            "Le format CSV standard s'ouvre directement dans Excel ou Google Sheets",
            "Aucun verrouillage — vos données restent exportables à tout moment"
      ],
      forWhom: "Tout opérateur, en particulier à la période fiscale ou lorsqu'il travaille avec un comptable ou un auditeur externe."
},
    pt: {
      title: "Exportação de Dados CSV",
      metaTitle: "Ferramentas de Exportação CSV para Dados de Operações Turísticas",
      metaDescription: "Exporte dados de reservas, equipa, financeiros, e operacionais para CSV para o seu contabilista, auditor, ou as suas próprias planilhas.",
      keywords: [
            "software de exportação CSV turismo",
            "ferramenta de exportação de dados operacionais",
            "exportação contabilística software operadora turística"
      ],
      heroTagline: "Os seus dados, para uma planilha sempre que precisar",
      intro: "O OpDesk é onde os seus dados operacionais vivem no dia a dia, mas nunca ficam bloqueados. Exporte reservas, registos de equipa, dados financeiros, ou quaisquer outros dados operacionais para CSV para o seu contabilista, uma auditoria, ou a sua própria análise.",
      benefits: [
            "Exporte dados de qualquer módulo — reservas, equipa, faturas, e mais",
            "O formato CSV padrão abre diretamente no Excel ou Google Sheets",
            "Sem bloqueio — os seus dados permanecem exportáveis a qualquer momento"
      ],
      forWhom: "Todo operador, particularmente na época fiscal ou ao trabalhar com um contabilista ou auditor externo."
},
    de: {
      title: "CSV-Datenexport",
      metaTitle: "CSV-Export-Tools für Tourismusbetriebsdaten",
      metaDescription: "Exportieren Sie Buchungs-, Personal-, Finanz-, und Betriebsdaten als CSV für Ihren Buchhalter, Prüfer, oder Ihre eigenen Tabellenkalkulationen.",
      keywords: [
            "CSV-Export-Software Tourismus",
            "Betriebsdaten-Export-Tool",
            "Buchhaltungsexport Reiseveranstalter-Software"
      ],
      heroTagline: "Ihre Daten, jederzeit in eine Tabellenkalkulation exportiert",
      intro: "OpDesk ist der Ort, an dem Ihre Betriebsdaten täglich leben, aber sie sind nie eingesperrt. Exportieren Sie Buchungen, Personalunterlagen, Finanzdaten, oder andere Betriebsdaten als CSV für Ihren Buchhalter, eine Prüfung, oder Ihre eigene Analyse.",
      benefits: [
            "Exportieren Sie Daten aus jedem Modul — Buchungen, Personal, Rechnungen, und mehr",
            "Standard-CSV-Format öffnet sich direkt in Excel oder Google Sheets",
            "Keine Bindung — Ihre Daten bleiben jederzeit exportierbar"
      ],
      forWhom: "Jeder Betreiber, besonders zur Steuerzeit oder bei der Zusammenarbeit mit einem externen Buchhalter oder Prüfer."
},
  },
  'automatic-backups': {
    en: {
      title: 'Automatic Backups',
      metaTitle: 'Automatic Data Backup for Tourism Operations Software',
      metaDescription: 'Your operational data is automatically backed up, so a lost laptop or an accidental delete never costs you your booking history.',
      keywords: ['automatic data backup software tourism', 'cloud backup tour operator data', 'data protection hospitality software'],
      heroTagline: 'A lost laptop should never mean lost data',
      intro: 'Your booking history, guest records, and financial data are too important to live in a single spreadsheet on one computer. OpDesk backs up your operational data automatically in the cloud, so hardware failure, theft, or an accidental delete never puts your business at risk.',
      benefits: [
        'Automatic, ongoing backup with no action required from you',
        'Cloud-based storage independent of any single device',
        'Peace of mind that a lost laptop doesn\u2019t mean lost history',
      ],
      forWhom: 'Every operator — this runs quietly in the background on every plan.',
    },
    af: {
      title: "Outomatiese Rugsteun",
      metaTitle: "Outomatiese Datarugsteun vir Toerisme-bedryfsagteware",
      metaDescription: "Jou bedryfsdata word outomaties rugsteun gemaak, sodat 'n verlore skootrekenaar of 'n toevallige uitvee nooit jou besprekingsgeskiedenis kos nie.",
      keywords: [
            "outomatiese datarugsteun-agteware toerisme",
            "wolkrugsteun toeroperateurdata",
            "databeskerming gasvryheidsagteware"
      ],
      heroTagline: "'n Verlore skootrekenaar behoort nooit verlore data te beteken nie",
      intro: "Jou besprekingsgeskiedenis, gasterekords, en finansiële data is te belangrik om op 'n enkele sigblad op een rekenaar te woon. OpDesk maak rugsteun van jou bedryfsdata outomaties in die wolk, sodat hardewarefout, diefstal, of 'n toevallige uitvee nooit jou besigheid in gevaar stel nie.",
      benefits: [
            "Outomatiese, deurlopende rugsteun sonder enige aksie van jou kant",
            "Wolkgebaseerde berging onafhanklik van enige enkele toestel",
            "Gemoedsrus dat 'n verlore skootrekenaar nie verlore geskiedenis beteken nie"
      ],
      forWhom: "Elke operateur — dit loop stilweg op die agtergrond op elke plan."
},
    fr: {
      title: "Sauvegardes Automatiques",
      metaTitle: "Sauvegarde Automatique des Données pour Logiciel d'Exploitation Touristique",
      metaDescription: "Vos données opérationnelles sont sauvegardées automatiquement, pour qu'un ordinateur portable perdu ou une suppression accidentelle ne vous coûte jamais votre historique de réservations.",
      keywords: [
            "logiciel de sauvegarde automatique des données tourisme",
            "sauvegarde cloud données voyagiste",
            "protection des données logiciel hôtellerie"
      ],
      heroTagline: "Un ordinateur portable perdu ne devrait jamais signifier des données perdues",
      intro: "Votre historique de réservations, vos dossiers clients, et vos données financières sont trop importants pour vivre dans un seul tableur sur un seul ordinateur. OpDesk sauvegarde automatiquement vos données opérationnelles dans le cloud, afin qu'une panne matérielle, un vol, ou une suppression accidentelle ne mette jamais votre entreprise en danger.",
      benefits: [
            "Sauvegarde automatique et continue sans aucune action de votre part",
            "Stockage basé sur le cloud, indépendant de tout appareil unique",
            "La tranquillité d'esprit qu'un ordinateur portable perdu ne signifie pas un historique perdu"
      ],
      forWhom: "Tout opérateur — cela fonctionne discrètement en arrière-plan sur chaque forfait."
},
    pt: {
      title: "Cópias de Segurança Automáticas",
      metaTitle: "Cópia de Segurança Automática de Dados para Software de Operações Turísticas",
      metaDescription: "Os seus dados operacionais são copiados automaticamente, para que um portátil perdido ou uma eliminação acidental nunca lhe custem o seu histórico de reservas.",
      keywords: [
            "software de cópia de segurança automática de dados turismo",
            "cópia de segurança na nuvem dados operadora turística",
            "proteção de dados software hotelaria"
      ],
      heroTagline: "Um portátil perdido nunca deveria significar dados perdidos",
      intro: "O seu histórico de reservas, registos de hóspedes, e dados financeiros são demasiado importantes para viverem numa única planilha num só computador. O OpDesk copia os seus dados operacionais automaticamente na nuvem, para que uma falha de hardware, roubo, ou eliminação acidental nunca coloquem o seu negócio em risco.",
      benefits: [
            "Cópia de segurança automática e contínua sem qualquer ação da sua parte",
            "Armazenamento na nuvem independente de qualquer dispositivo único",
            "Tranquilidade de que um portátil perdido não significa histórico perdido"
      ],
      forWhom: "Todo operador — isto funciona silenciosamente em segundo plano em todos os planos."
},
    de: {
      title: "Automatische Sicherungen",
      metaTitle: "Automatische Datensicherung für Tourismusbetriebssoftware",
      metaDescription: "Ihre Betriebsdaten werden automatisch gesichert, sodass ein verlorener Laptop oder ein versehentliches Löschen Sie nie Ihre Buchungshistorie kostet.",
      keywords: [
            "automatische Datensicherungssoftware Tourismus",
            "Cloud-Sicherung Reiseveranstalterdaten",
            "Datenschutz Gastgewerbesoftware"
      ],
      heroTagline: "Ein verlorener Laptop sollte niemals verlorene Daten bedeuten",
      intro: "Ihre Buchungshistorie, Gästedaten, und Finanzdaten sind zu wichtig, um auf einer einzigen Tabellenkalkulation auf einem Computer zu leben. OpDesk sichert Ihre Betriebsdaten automatisch in der Cloud, sodass Hardwareausfall, Diebstahl, oder versehentliches Löschen Ihr Unternehmen nie gefährden.",
      benefits: [
            "Automatische, laufende Sicherung ohne Aktion Ihrerseits erforderlich",
            "Cloud-basierte Speicherung, unabhängig von einem einzelnen Gerät",
            "Die Gewissheit, dass ein verlorener Laptop nicht verlorene Historie bedeutet"
      ],
      forWhom: "Jeder Betreiber — dies läuft leise im Hintergrund bei jedem Tarif."
},
  },
  'multi-currency': {
    en: {
      title: 'Multi-Currency & Language',
      metaTitle: 'Multi-Currency Tourism Software for African Operators',
      metaDescription: 'Run your business in ZAR, KES, TZS, USD, EUR and more, with support for English, Afrikaans, French, Swahili and other regional languages.',
      keywords: ['multi currency booking software Africa', 'ZAR KES tourism software', 'multilingual tour operator software', 'African currency invoicing software'],
      heroTagline: 'Built for how Africa actually does business',
      intro: 'A safari lodge billing in ZAR, a Kenyan tour operator in KES, a Tanzanian camp in TZS — OpDesk was built around the reality that African tourism operators work across currencies and languages, not as an afterthought bolted onto a US-first product.',
      benefits: [
        'Bill and report in ZAR, KES, TZS, BWP, NAD, USD, EUR and more',
        'Interface language support including English, Afrikaans, French, Portuguese, and Swahili',
        'Per-company currency and language settings',
      ],
      forWhom: 'Operators anywhere across Southern and East Africa, and any operator billing international guests in their home currency.',
    },
    af: {
      title: "Multi-geldeenheid & Taal",
      metaTitle: "Multi-geldeenheid Toerisme-programmatuur vir Afrika-operateurs",
      metaDescription: "Bedryf jou besigheid in ZAR, KES, TZS, USD, EUR en meer, met ondersteuning vir Engels, Afrikaans, Frans, Swahili en ander streektale.",
      keywords: [
            "multi-geldeenheid-besprekingsagteware Afrika",
            "ZAR KES toerisme-agteware",
            "veeltalige toeroperateur-agteware",
            "Afrika-geldeenheid-fakturerings-agteware"
      ],
      heroTagline: "Gebou vir hoe Afrika werklik sake doen",
      intro: "'n Wildsafari-lodge wat in ZAR faktureer, 'n Kenia-toeroperateur in KES, 'n Tanzanië-kamp in TZS — OpDesk is gebou rondom die werklikheid dat Afrika-toerisme-operateurs oor geldeenhede en tale heen werk, nie as 'n nagedagte wat op 'n VSA-eerste produk vasgemaak is nie.",
      benefits: [
            "Faktureer en rapporteer in ZAR, KES, TZS, BWP, NAD, USD, EUR en meer",
            "Koppelvlaktaalondersteuning insluitend Engels, Afrikaans, Frans, Portugees, en Swahili",
            "Per-maatskappy-geldeenheid- en taalinstellings"
      ],
      forWhom: "Operateurs enige plek regoor Suider- en Oos-Afrika, en enige operateur wat internasionale gaste in hul tuisgeldeenheid faktureer."
},
    fr: {
      title: "Multidevise & Multilingue",
      metaTitle: "Logiciel Touristique Multidevise pour Opérateurs Africains",
      metaDescription: "Gérez votre entreprise en ZAR, KES, TZS, USD, EUR et plus, avec la prise en charge de l'anglais, de l'afrikaans, du français, du swahili et d'autres langues régionales.",
      keywords: [
            "logiciel de réservation multidevise Afrique",
            "logiciel touristique ZAR KES",
            "logiciel voyagiste multilingue",
            "logiciel de facturation devise africaine"
      ],
      heroTagline: "Conçu pour la façon dont l'Afrique fait vraiment des affaires",
      intro: "Un lodge safari facturant en ZAR, un voyagiste kényan en KES, un camp tanzanien en TZS — OpDesk a été conçu autour de la réalité que les opérateurs touristiques africains travaillent à travers les devises et les langues, et non comme une réflexion après coup greffée sur un produit conçu d'abord pour les États-Unis.",
      benefits: [
            "Facturez et déclarez en ZAR, KES, TZS, BWP, NAD, USD, EUR et plus",
            "Prise en charge de la langue d'interface incluant l'anglais, l'afrikaans, le français, le portugais, et le swahili",
            "Paramètres de devise et de langue par entreprise"
      ],
      forWhom: "Opérateurs partout en Afrique australe et de l'Est, et tout opérateur facturant des clients internationaux dans leur devise d'origine."
},
    pt: {
      title: "Multi-moeda & Idioma",
      metaTitle: "Software Turístico Multi-moeda para Operadores Africanos",
      metaDescription: "Gira o seu negócio em ZAR, KES, TZS, USD, EUR e mais, com suporte para inglês, africâner, francês, suaíli e outros idiomas regionais.",
      keywords: [
            "software de reservas multi-moeda África",
            "software turístico ZAR KES",
            "software multilíngue operadora turística",
            "software de faturação moeda africana"
      ],
      heroTagline: "Criado para a forma como África realmente faz negócios",
      intro: "Um lodge de safári a faturar em ZAR, uma operadora turística queniana em KES, um acampamento tanzaniano em TZS — o OpDesk foi criado em torno da realidade de que os operadores turísticos africanos trabalham entre moedas e idiomas, e não como algo acrescentado a um produto pensado primeiro para os EUA.",
      benefits: [
            "Fature e reporte em ZAR, KES, TZS, BWP, NAD, USD, EUR e mais",
            "Suporte de idioma de interface incluindo inglês, africâner, francês, português, e suaíli",
            "Definições de moeda e idioma por empresa"
      ],
      forWhom: "Operadores em qualquer lugar da África Austral e Oriental, e qualquer operador que fature hóspedes internacionais na sua moeda de origem."
},
    de: {
      title: "Mehrwährung & Sprache",
      metaTitle: "Mehrwährungs-Tourismussoftware für Afrikanische Betreiber",
      metaDescription: "Führen Sie Ihr Unternehmen in ZAR, KES, TZS, USD, EUR und mehr, mit Unterstützung für Englisch, Afrikaans, Französisch, Suaheli und andere Regionalsprachen.",
      keywords: [
            "Mehrwährungs-Buchungssoftware Afrika",
            "Tourismussoftware ZAR KES",
            "mehrsprachige Reiseveranstalter-Software",
            "afrikanische Währungs-Rechnungssoftware"
      ],
      heroTagline: "Entwickelt dafür, wie Afrika wirklich Geschäfte macht",
      intro: "Eine Safari-Lodge, die in ZAR abrechnet, ein kenianischer Reiseveranstalter in KES, ein tansanisches Camp in TZS — OpDesk wurde um die Realität herum entwickelt, dass afrikanische Tourismusbetreiber über Währungen und Sprachen hinweg arbeiten, nicht als nachträglicher Gedanke, der auf ein zuerst für die USA entwickeltes Produkt aufgesetzt wurde.",
      benefits: [
            "Rechnungsstellung und Berichte in ZAR, KES, TZS, BWP, NAD, USD, EUR und mehr",
            "Unterstützung für Oberflächensprachen einschließlich Englisch, Afrikaans, Französisch, Portugiesisch, und Suaheli",
            "Währungs- und Spracheinstellungen pro Unternehmen"
      ],
      forWhom: "Betreiber überall im südlichen und östlichen Afrika, und jeder Betreiber, der internationalen Gästen in deren Heimatwährung Rechnungen stellt."
},
  },
  'white-label-branding': {
    en: {
      title: 'White-Label Branding',
      metaTitle: 'White-Label Branding for Guest-Facing Tourism Documents',
      metaDescription: 'Put your own logo and brand colours on guest-facing invoices and documents instead of a generic template.',
      keywords: ['white label invoicing software', 'custom branded invoices tourism', 'branded guest documents software'],
      heroTagline: 'Your brand on every document your guests see',
      intro: 'An invoice or booking confirmation is a touchpoint with your guest — it should look like it came from your lodge, not a generic software vendor. White-Label Branding puts your logo and brand colours on every guest-facing document.',
      benefits: [
        'Your logo on invoices, confirmations, and other guest documents',
        'Custom primary brand colour applied across guest-facing templates',
        'Available on Professional and Enterprise plans, or as an individual add-on',
      ],
      forWhom: 'Established operators who want every guest touchpoint to reinforce their own brand.',
    },
    af: {
      title: "Witetiket-handelsmerk",
      metaTitle: "Witetiket-handelsmerk vir Gasgerigte Toerisme-dokumente",
      metaDescription: "Plaas jou eie logo en handelsmerkkleure op gasgerigte fakture en dokumente in plaas van 'n generiese sjabloon.",
      keywords: [
            "witetiket-fakturerings-agteware",
            "pasgemaakte gemerkte fakture toerisme",
            "gemerkte gastedokumente-agteware"
      ],
      heroTagline: "Jou handelsmerk op elke dokument wat jou gaste sien",
      intro: "'n Faktuur of besprekingsbevestiging is 'n raakpunt met jou gas — dit behoort te lyk asof dit van jou lodge kom, nie 'n generiese sagtewareverskaffer nie. Witetiket-handelsmerk plaas jou logo en handelsmerkkleure op elke gasgerigte dokument.",
      benefits: [
            "Jou logo op fakture, bevestigings, en ander gastedokumente",
            "Pasgemaakte primêre handelsmerkkleur toegepas oor gasgerigte sjablone",
            "Beskikbaar op Professional- en Enterprise-planne, of as 'n individuele byvoeging"
      ],
      forWhom: "Gevestigde operateurs wat wil hê elke gasteraakpunt moet hul eie handelsmerk versterk."
},
    fr: {
      title: "Marque Blanche",
      metaTitle: "Marque Blanche pour les Documents Touristiques Destinés aux Clients",
      metaDescription: "Apposez votre propre logo et vos couleurs de marque sur les factures et documents destinés aux clients au lieu d'un modèle générique.",
      keywords: [
            "logiciel de facturation en marque blanche",
            "factures personnalisées de marque tourisme",
            "logiciel de documents clients de marque"
      ],
      heroTagline: "Votre marque sur chaque document que vos clients voient",
      intro: "Une facture ou une confirmation de réservation est un point de contact avec votre client — elle devrait donner l'impression de provenir de votre lodge, pas d'un fournisseur de logiciel générique. Marque Blanche appose votre logo et vos couleurs de marque sur chaque document destiné aux clients.",
      benefits: [
            "Votre logo sur les factures, confirmations, et autres documents clients",
            "Couleur de marque principale personnalisée appliquée sur tous les modèles destinés aux clients",
            "Disponible sur les forfaits Professionnel et Entreprise, ou en tant que module complémentaire individuel"
      ],
      forWhom: "Opérateurs établis qui souhaitent que chaque point de contact client renforce leur propre marque."
},
    pt: {
      title: "Marca Branca",
      metaTitle: "Marca Branca para Documentos Turísticos Voltados para Hóspedes",
      metaDescription: "Coloque o seu próprio logótipo e cores de marca em faturas e documentos voltados para hóspedes em vez de um modelo genérico.",
      keywords: [
            "software de faturação de marca branca",
            "faturas personalizadas de marca turismo",
            "software de documentos de hóspedes de marca"
      ],
      heroTagline: "A sua marca em cada documento que os seus hóspedes veem",
      intro: "Uma fatura ou confirmação de reserva é um ponto de contacto com o seu hóspede — deve parecer que veio do seu lodge, não de um fornecedor de software genérico. Marca Branca coloca o seu logótipo e cores de marca em cada documento voltado para hóspedes.",
      benefits: [
            "O seu logótipo em faturas, confirmações, e outros documentos de hóspedes",
            "Cor de marca principal personalizada aplicada em todos os modelos voltados para hóspedes",
            "Disponível nos planos Professional e Enterprise, ou como extra individual"
      ],
      forWhom: "Operadores estabelecidos que querem que cada ponto de contacto com o hóspede reforce a sua própria marca."
},
    de: {
      title: "White-Label-Branding",
      metaTitle: "White-Label-Branding für Gästeseitige Tourismusdokumente",
      metaDescription: "Versehen Sie gästeseitige Rechnungen und Dokumente mit Ihrem eigenen Logo und Ihren Markenfarben statt einer generischen Vorlage.",
      keywords: [
            "White-Label-Rechnungssoftware",
            "individuell gebrandete Rechnungen Tourismus",
            "gebrandete Gästedokumente-Software"
      ],
      heroTagline: "Ihre Marke auf jedem Dokument, das Ihre Gäste sehen",
      intro: "Eine Rechnung oder Buchungsbestätigung ist ein Kontaktpunkt mit Ihrem Gast — sie sollte so aussehen, als käme sie von Ihrer Lodge, nicht von einem generischen Softwareanbieter. White-Label-Branding versieht jedes gästeseitige Dokument mit Ihrem Logo und Ihren Markenfarben.",
      benefits: [
            "Ihr Logo auf Rechnungen, Bestätigungen, und anderen Gästedokumenten",
            "Individuelle Hauptmarkenfarbe, angewendet auf alle gästeseitigen Vorlagen",
            "Verfügbar bei Professional- und Enterprise-Tarifen, oder als individuelles Add-on"
      ],
      forWhom: "Etablierte Betreiber, die möchten, dass jeder Gästekontaktpunkt ihre eigene Marke stärkt."
},
  },
  'built-for-africa': {
    en: {
      title: 'Built for Africa\u2019s Operators',
      metaTitle: 'Operations Software Built Specifically for African Tourism Businesses',
      metaDescription: 'OpDesk is built around how safari lodges, shuttle companies, charters, and trail operators actually work — not a generic tool adapted after the fact.',
      keywords: ['tourism software built for Africa', 'safari lodge management system', 'African tour operator software', 'South African tourism business software'],
      heroTagline: 'Not a generic tool with Africa bolted on afterward',
      intro: 'Most operations software is built for hotels in Europe or tour companies in the US. OpDesk is built from the ground up around the operators who keep Africa\u2019s tourism industry running — firearm registers, multi-currency invoicing across a dozen African currencies, and the difference between a game vehicle and a shuttle van, all handled natively.',
      benefits: [
        'Operator types built in from day one: safari, shuttle, fishing, yacht, trail, lodging, East Africa tours, island transfers',
        'Compliance features relevant to the region — firearm registers, guide certification tracking',
        'African currencies and languages as first-class citizens, not an add-on',
        'No booking fees — a flat monthly plan, not a cut of every guest transaction',
      ],
      forWhom: 'Every operator tired of adapting a generic international tool to fit an African tourism business.',
    },
    af: {
      title: "Gebou vir Afrika se Operateurs",
      metaTitle: "Bedryfsagteware Spesifiek Gebou vir Afrika-toerismebesighede",
      metaDescription: "OpDesk is gebou rondom hoe wildsafari-lodges, pendelmaatskappye, huurdienste, en wandelgids-operateurs werklik werk — nie 'n generiese instrument wat agterna aangepas is nie.",
      keywords: [
            "toerisme-agteware gebou vir Afrika",
            "wildsafari-lodge-bestuurstelsel",
            "Afrika-toeroperateur-agteware",
            "Suid-Afrikaanse toerismebesigheidsagteware"
      ],
      heroTagline: "Nie 'n generiese instrument met Afrika agterna vasgemaak nie",
      intro: "Die meeste bedryfsagteware is gebou vir hotelle in Europa of toermaatskappye in die VSA. OpDesk is van die grond af gebou rondom die operateurs wat Afrika se toerismebedryf aan die gang hou — vuurwapenregisters, multi-geldeenheid-fakturering oor 'n dosyn Afrika-geldeenhede, en die verskil tussen 'n wildvoertuig en 'n pendelvan, alles inheems hanteer.",
      benefits: [
            "Operateurtipes ingebou van dag een af: wildsafari, pendel, vissery, jag, wandelroete, verblyf, Oos-Afrika-toere, eiland-vervoer",
            "Nakomingskenmerke relevant vir die streek — vuurwapenregisters, gids-sertifiseringopsporing",
            "Afrika-geldeenhede en -tale as eersteklas-burgers, nie 'n byvoeging nie",
            "Geen besprekingsfooie nie — 'n vaste maandelikse plan, nie 'n snit van elke gastetransaksie nie"
      ],
      forWhom: "Elke operateur moeg daarvan om 'n generiese internasionale instrument aan te pas om by 'n Afrika-toerismebesigheid te pas."
},
    fr: {
      title: "Conçu pour les Opérateurs Africains",
      metaTitle: "Logiciel d'Exploitation Conçu Spécifiquement pour les Entreprises Touristiques Africaines",
      metaDescription: "OpDesk est conçu autour de la façon dont les lodges safari, les compagnies de navettes, les charters, et les opérateurs de sentiers travaillent réellement — pas un outil générique adapté après coup.",
      keywords: [
            "logiciel touristique conçu pour l'Afrique",
            "système de gestion de lodge safari",
            "logiciel d'opérateur touristique africain",
            "logiciel d'entreprise touristique sud-africaine"
      ],
      heroTagline: "Pas un outil générique avec l'Afrique greffée après coup",
      intro: "La plupart des logiciels d'exploitation sont conçus pour des hôtels en Europe ou des sociétés de voyage aux États-Unis. OpDesk est conçu de A à Z autour des opérateurs qui font tourner le secteur touristique africain — registres d'armes à feu, facturation multidevise dans une douzaine de devises africaines, et la différence entre un véhicule de safari et une navette, tout géré nativement.",
      benefits: [
            "Types d'opérateurs intégrés dès le premier jour : safari, navette, pêche, yacht, sentier, hébergement, circuits Afrique de l'Est, transferts insulaires",
            "Fonctionnalités de conformité pertinentes pour la région — registres d'armes à feu, suivi des certifications de guides",
            "Devises et langues africaines en tant que citoyens de première classe, pas un module complémentaire",
            "Aucun frais de réservation — un forfait mensuel fixe, pas une commission sur chaque transaction client"
      ],
      forWhom: "Tout opérateur fatigué d'adapter un outil international générique pour l'ajuster à une entreprise touristique africaine."
},
    pt: {
      title: "Criado para os Operadores de África",
      metaTitle: "Software de Operações Criado Especificamente para Negócios Turísticos Africanos",
      metaDescription: "O OpDesk é criado em torno de como lodges de safári, empresas de transfer, charters, e operadores de trilhas realmente trabalham — não uma ferramenta genérica adaptada posteriormente.",
      keywords: [
            "software turístico criado para África",
            "sistema de gestão de lodge de safári",
            "software de operadora turística africana",
            "software de negócio turístico sul-africano"
      ],
      heroTagline: "Não uma ferramenta genérica com África acrescentada posteriormente",
      intro: "A maioria do software de operações é criado para hotéis na Europa ou empresas de viagens nos EUA. O OpDesk é criado do zero em torno dos operadores que mantêm o setor turístico africano em funcionamento — registos de armas de fogo, faturação multi-moeda em dezenas de moedas africanas, e a diferença entre um veículo de safári e uma carrinha de transfer, tudo tratado nativamente.",
      benefits: [
            "Tipos de operador incorporados desde o primeiro dia: safári, transfer, pesca, iate, trilha, alojamento, tours na África Oriental, transfers para ilhas",
            "Funcionalidades de conformidade relevantes para a região — registos de armas de fogo, rastreamento de certificações de guias",
            "Moedas e idiomas africanos como cidadãos de primeira classe, não um extra",
            "Sem taxas de reserva — um plano mensal fixo, não uma percentagem de cada transação de hóspede"
      ],
      forWhom: "Todo operador cansado de adaptar uma ferramenta internacional genérica para se ajustar a um negócio turístico africano."
},
    de: {
      title: "Entwickelt für Afrikas Betreiber",
      metaTitle: "Betriebssoftware, Speziell für Afrikanische Tourismusunternehmen Entwickelt",
      metaDescription: "OpDesk ist um die Art und Weise herum entwickelt, wie Safari-Lodges, Shuttle-Unternehmen, Charter, und Wanderroutenbetreiber tatsächlich arbeiten — kein generisches Tool, das nachträglich angepasst wurde.",
      keywords: [
            "Tourismussoftware für Afrika entwickelt",
            "Safari-Lodge-Verwaltungssystem",
            "afrikanische Reiseveranstalter-Software",
            "südafrikanische Tourismusunternehmenssoftware"
      ],
      heroTagline: "Kein generisches Tool, bei dem Afrika nachträglich angeflanscht wurde",
      intro: "Die meiste Betriebssoftware ist für Hotels in Europa oder Reiseveranstalter in den USA konzipiert. OpDesk wurde von Grund auf um die Betreiber herum entwickelt, die Afrikas Tourismusbranche am Laufen halten — Waffenregister, Mehrwährungsrechnungen über ein Dutzend afrikanischer Währungen, und der Unterschied zwischen einem Safarifahrzeug und einem Shuttle-Van, alles nativ verarbeitet.",
      benefits: [
            "Betreibertypen von Anfang an integriert: Safari, Shuttle, Angeln, Yacht, Wanderroute, Unterkunft, Ostafrika-Touren, Insel-Transfers",
            "Für die Region relevante Compliance-Funktionen — Waffenregister, Führerzertifizierungsverfolgung",
            "Afrikanische Währungen und Sprachen als erstklassige Bürger, kein Add-on",
            "Keine Buchungsgebühren — ein fester monatlicher Tarif, kein Anteil an jeder Gästetransaktion"
      ],
      forWhom: "Jeder Betreiber, der es leid ist, ein generisches internationales Tool an ein afrikanisches Tourismusunternehmen anzupassen."
},
  },
}

// Returns the content for a slug in the requested locale, falling back
// to English for anything not yet translated -- the page always
// renders complete content even mid-translation.
export function getFeatureContent(slug, locale) {
  const entry = FEATURES_TRANSLATIONS[slug]
  if (!entry) return null
  return entry[locale] || entry.en
}
