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
  'delivery-management': {
    en: {
      title: 'Logistics & Delivery Management',
      metaTitle: 'Delivery & Logistics Management Software for African Operators',
      metaDescription: 'Manage delivery clients, price lists, orders and statements in one place — for logistics companies, or any tourism operator running a delivery or courier side of the business.',
      keywords: ['delivery management software Africa', 'logistics software for tour operators', 'delivery order tracking', 'client price list software', 'courier statement software'],
      heroTagline: 'A dedicated workflow for delivery and logistics work',
      intro: 'Not every operator only does tours. Shuttle companies running parcel drops, safari lodges handling supply runs, or dedicated logistics operators all need the same basics: a client list, a price list per client, an order log, and a statement they can send at month-end. OpDesk\u2019s Logistics module gives you all four without needing separate software.',
      benefits: [
        'A client directory with contact details and delivery addresses',
        'Client-specific price lists, so the same order type can be quoted differently per client',
        'An order log tracking what was delivered, when, and for how much',
        'One-click statements per client, generated as a PDF with your own branding and VAT details',
        'Available as an add-on for any operator type, not locked to a single business category',
      ],
      forWhom: 'Logistics and courier businesses, and any tour, shuttle, or lodging operator with a delivery or supply-run side to the business.',
    },
    af: {
      title: 'Logistiek en Afleweringsbestuur',
      metaTitle: 'Aflewerings- en Logistiekbestuurprogrammatuur vir Afrika-operateurs',
      metaDescription: 'Bestuur afleweringskliënte, pryslyste, bestellings en state op een plek — vir logistiekmaatskappye, of enige toerismeoperateur met \'n aflewerings- of koerierkant tot die besigheid.',
      keywords: ['aflewering bestuurprogrammatuur Afrika', 'logistiekprogrammatuur vir toeroperateurs', 'afleweringbestelling opsporing', 'kliënt pryslys sagteware', 'koerierstaat sagteware'],
      heroTagline: '\'n Toegewyde werksvloei vir aflewering- en logistiekwerk',
      intro: 'Nie elke operateur doen net toere nie. Pendelmaatskappye wat pakkies aflewer, wildsafari-lodges wat voorraadritte hanteer, of toegewyde logistiekoperateurs het almal dieselfde basiese behoeftes: \'n kliëntelys, \'n pryslys per kliënt, \'n bestellingslog, en \'n staat wat hulle aan die einde van die maand kan stuur. OpDesk se Logistiekmodule gee jou al vier sonder om aparte sagteware nodig te hê.',
      benefits: [
        '\'n Kliëntegids met kontakbesonderhede en afleweringsadresse',
        'Kliëntspesifieke pryslyste, sodat dieselfde bestellingtipe verskillend per kliënt aangebied kan word',
        '\'n Bestellingslog wat opspoor wat afgelewer is, wanneer, en vir hoeveel',
        'Een-klik state per kliënt, gegenereer as \'n PDF met jou eie handelsmerk en BTW-besonderhede',
        'Beskikbaar as \'n byvoeging vir enige operateurtipe, nie vasgeslote tot een besigheidskategorie nie',
      ],
      forWhom: 'Logistiek- en koerierbesighede, en enige toer-, pendel- of verblyfoperateur met \'n aflewering- of voorsieningsritkant tot die besigheid.',
    },
    de: {
      title: 'Logistik- und Lieferverwaltung',
      metaTitle: 'Liefer- und Logistikverwaltungssoftware für afrikanische Betreiber',
      metaDescription: 'Verwalten Sie Lieferkunden, Preislisten, Aufträge und Kontoauszüge an einem Ort — für Logistikunternehmen oder jeden Tourismusbetreiber mit einem Liefer- oder Kurierzweig.',
      keywords: ['Liefermanagement-Software Afrika', 'Logistiksoftware für Reiseveranstalter', 'Lieferauftragsverfolgung', 'Kundenpreislisten-Software', 'Kurier-Kontoauszugssoftware'],
      heroTagline: 'Ein eigener Arbeitsablauf für Liefer- und Logistikarbeit',
      intro: 'Nicht jeder Betreiber macht nur Touren. Shuttle-Unternehmen mit Paketzustellungen, Safari-Lodges mit Versorgungsfahrten oder reine Logistikbetreiber brauchen alle dasselbe: eine Kundenliste, eine Preisliste pro Kunde, ein Auftragsprotokoll und einen Kontoauszug zum Monatsende. Das Logistikmodul von OpDesk bietet alle vier, ohne separate Software zu benötigen.',
      benefits: [
        'Ein Kundenverzeichnis mit Kontaktdaten und Lieferadressen',
        'Kundenspezifische Preislisten, sodass derselbe Auftragstyp pro Kunde unterschiedlich kalkuliert werden kann',
        'Ein Auftragsprotokoll, das erfasst, was, wann und zu welchem Preis geliefert wurde',
        'Kontoauszüge per Klick pro Kunde, als PDF mit eigenem Branding und USt-Angaben',
        'Als Add-on für jeden Betreibertyp verfügbar, nicht auf eine einzelne Geschäftskategorie beschränkt',
      ],
      forWhom: 'Logistik- und Kurierunternehmen sowie jeder Touren-, Shuttle- oder Unterkunftsbetreiber mit einem Liefer- oder Versorgungszweig.',
    },
    fr: {
      title: 'Gestion de la Logistique et des Livraisons',
      metaTitle: 'Logiciel de Gestion des Livraisons et de la Logistique pour Opérateurs Africains',
      metaDescription: 'Gérez les clients de livraison, les listes de prix, les commandes et les relevés en un seul endroit — pour les entreprises de logistique, ou tout opérateur touristique ayant une activité de livraison.',
      keywords: ['logiciel de gestion de livraison Afrique', 'logiciel logistique pour voyagistes', 'suivi de commandes de livraison', 'logiciel de liste de prix client', 'logiciel de relevé de messagerie'],
      heroTagline: 'Un flux de travail dédié à la livraison et à la logistique',
      intro: "Tous les opérateurs ne font pas que des circuits. Les compagnies de navette qui livrent des colis, les lodges safari qui gèrent des livraisons d'approvisionnement, ou les opérateurs logistiques dédiés ont tous besoin des mêmes bases : une liste de clients, une liste de prix par client, un journal des commandes, et un relevé à envoyer en fin de mois. Le module Logistique d'OpDesk réunit ces quatre éléments sans logiciel séparé.",
      benefits: [
        'Un répertoire client avec coordonnées et adresses de livraison',
        'Des listes de prix spécifiques par client, pour facturer différemment le même type de commande selon le client',
        'Un journal des commandes suivant ce qui a été livré, quand, et pour quel montant',
        'Des relevés client en un clic, générés en PDF avec votre image de marque et vos informations de TVA',
        'Disponible en option pour tout type d\'opérateur, sans être réservé à une seule catégorie d\'activité',
      ],
      forWhom: 'Entreprises de logistique et de messagerie, et tout opérateur de circuits, navettes ou hébergement ayant une activité de livraison ou d\'approvisionnement.',
    },
    pt: {
      title: 'Gestão de Logística e Entregas',
      metaTitle: 'Software de Gestão de Entregas e Logística para Operadores Africanos',
      metaDescription: 'Faça a gestão de clientes de entrega, listas de preços, encomendas e extratos num só lugar — para empresas de logística, ou qualquer operador turístico com um lado de entrega ou correio no negócio.',
      keywords: ['software de gestão de entregas África', 'software de logística para operadores turísticos', 'rastreio de encomendas de entrega', 'software de lista de preços de clientes', 'software de extratos de correio'],
      heroTagline: 'Um fluxo de trabalho dedicado para entregas e logística',
      intro: 'Nem todos os operadores fazem apenas tours. Empresas de shuttle que fazem entregas de encomendas, lodges de safari que gerem viagens de abastecimento, ou operadores de logística dedicados precisam todos das mesmas bases: uma lista de clientes, uma lista de preços por cliente, um registo de encomendas, e um extrato para enviar no final do mês. O módulo de Logística da OpDesk dá-lhe os quatro sem precisar de software separado.',
      benefits: [
        'Um diretório de clientes com detalhes de contacto e moradas de entrega',
        'Listas de preços específicas por cliente, para que o mesmo tipo de encomenda possa ser cotado de forma diferente por cliente',
        'Um registo de encomendas que rastreia o que foi entregue, quando, e por quanto',
        'Extratos por cliente com um clique, gerados como PDF com a sua marca e detalhes de IVA',
        'Disponível como extra para qualquer tipo de operador, sem estar limitado a uma única categoria de negócio',
      ],
      forWhom: 'Empresas de logística e correio, e qualquer operador de tours, shuttle ou alojamento com um lado de entrega ou abastecimento no negócio.',
    },
  },
  'safari-lodge-software': {
    en: {
      title: 'Software for Safari Lodges & Game Lodges',
      metaTitle: 'Safari Lodge & Game Lodge Management Software',
      metaDescription: 'Run your safari or game lodge\u2019s bookings, game drives, rooms, staff and invoicing from one platform built for African tourism operators.',
      keywords: ['safari lodge software', 'game lodge management system', 'safari booking software', 'game drive booking system', 'lodge management software Africa'],
      heroTagline: 'One system for game drives, rooms, guides and guests',
      intro: 'A safari lodge runs two businesses at once — accommodation and activities. OpDesk handles both: game drives and excursions with duration-based rate cards, rooms and housekeeping, guide and vehicle assignment per drive, and guest invoicing, all in one shared calendar instead of a separate system for each side.',
      benefits: [
        'Excursion booking types with 3-hour, 6-hour and full-day rate cards for game drives',
        'Room bookings and housekeeping tracked alongside activity bookings',
        'Assign a guide and vehicle to each game drive as you book it',
        'Guest invoicing and statements with your lodge\u2019s own branding',
        'Staff certifications and firearm register built in for PH and guide compliance',
      ],
      forWhom: 'Safari lodges, game lodges, and bush camps running both accommodation and guided activities.',
    },
    af: {
      title: 'Sagteware vir Wildsafari-lodges en Wildlodges',
      metaTitle: 'Wildsafari-lodge en Wildlodge Bestuurprogrammatuur',
      metaDescription: 'Bestuur jou wildsafari- of wildlodge se besprekings, wildritte, kamers, personeel en fakturering vanaf een platform gebou vir Afrika-toerisme-operateurs.',
      keywords: ['wildsafari-lodge sagteware', 'wildlodge bestuurstelsel', 'wildsafari-besprekingsagteware', 'wildrit-besprekingstelsel', 'lodge bestuurprogrammatuur Afrika'],
      heroTagline: 'Een stelsel vir wildritte, kamers, gidse en gaste',
      intro: '\'n Wildsafari-lodge bedryf twee besighede gelyktydig — verblyf en aktiwiteite. OpDesk hanteer albei: wildritte en uitstappies met duurtegebaseerde tariewe, kamers en huishouding, gids- en voertuigtoewysing per rit, en gastefakturering, alles op een gedeelde kalender in plaas van \'n aparte stelsel vir elke kant.',
      benefits: [
        'Uitstappie-besprekingtipes met 3-uur, 6-uur en volledige-dag tariewe vir wildritte',
        'Kamerbesprekings en huishouding opgespoor langs aktiwiteitbesprekings',
        'Wys \'n gids en voertuig aan elke wildrit toe soos jy dit bespreek',
        'Gastefakturering en state met jou lodge se eie handelsmerk',
        'Personeelsertifisering en vuurwapenregister ingebou vir professionele jagter- en gidsvoldoening',
      ],
      forWhom: 'Wildsafari-lodges, wildlodges, en bosgebiede wat beide verblyf en begeleide aktiwiteite bedryf.',
    },
    de: {
      title: 'Software für Safari-Lodges & Game Lodges',
      metaTitle: 'Verwaltungssoftware für Safari-Lodges & Game Lodges',
      metaDescription: 'Verwalten Sie die Buchungen, Pirschfahrten, Zimmer, Mitarbeiter und Rechnungsstellung Ihrer Safari- oder Game Lodge über eine Plattform für afrikanische Tourismusbetreiber.',
      keywords: ['Safari-Lodge-Software', 'Game-Lodge-Verwaltungssystem', 'Safari-Buchungssoftware', 'Pirschfahrt-Buchungssystem', 'Lodge-Verwaltungssoftware Afrika'],
      heroTagline: 'Ein System für Pirschfahrten, Zimmer, Guides und Gäste',
      intro: 'Eine Safari-Lodge betreibt zwei Geschäfte gleichzeitig — Unterkunft und Aktivitäten. OpDesk deckt beides ab: Pirschfahrten und Ausflüge mit dauerbasierten Preistabellen, Zimmer und Housekeeping, Guide- und Fahrzeugzuweisung pro Fahrt, und Gästerechnungen — alles in einem gemeinsamen Kalender statt in getrennten Systemen.',
      benefits: [
        'Ausflugsbuchungsarten mit 3-Stunden-, 6-Stunden- und Ganztagestarifen für Pirschfahrten',
        'Zimmerbuchungen und Housekeeping neben Aktivitätsbuchungen erfasst',
        'Weisen Sie jeder Pirschfahrt bei der Buchung einen Guide und ein Fahrzeug zu',
        'Gästerechnungen und Kontoauszüge mit dem Branding Ihrer Lodge',
        'Mitarbeiterzertifizierungen und Waffenregister integriert für die Compliance von Guides und Berufsjägern',
      ],
      forWhom: 'Safari-Lodges, Game Lodges und Buschcamps, die sowohl Unterkunft als auch geführte Aktivitäten anbieten.',
    },
    fr: {
      title: 'Logiciel pour Lodges Safari et Réserves de Chasse',
      metaTitle: 'Logiciel de Gestion pour Lodges Safari et Réserves de Chasse',
      metaDescription: "Gérez les réservations, sorties safari, chambres, personnel et facturation de votre lodge safari depuis une plateforme conçue pour les opérateurs touristiques africains.",
      keywords: ['logiciel lodge safari', 'système de gestion de réserve de chasse', 'logiciel de réservation safari', 'système de réservation de sortie safari', 'logiciel de gestion de lodge Afrique'],
      heroTagline: 'Un seul système pour les sorties, chambres, guides et clients',
      intro: "Un lodge safari gère deux activités à la fois — l'hébergement et les activités. OpDesk couvre les deux : sorties safari et excursions avec grilles tarifaires par durée, chambres et ménage, affectation de guide et véhicule par sortie, et facturation client, le tout sur un calendrier partagé plutôt que deux systèmes séparés.",
      benefits: [
        'Types de réservation d\'excursion avec tarifs 3h, 6h et journée complète pour les sorties safari',
        'Réservations de chambres et ménage suivis aux côtés des réservations d\'activités',
        'Affectez un guide et un véhicule à chaque sortie safari au moment de la réservation',
        'Facturation et relevés clients avec l\'image de marque de votre lodge',
        'Certifications du personnel et registre des armes intégrés pour la conformité des guides et chasseurs professionnels',
      ],
      forWhom: 'Lodges safari, réserves de chasse et camps de brousse gérant à la fois hébergement et activités guidées.',
    },
    pt: {
      title: 'Software para Lodges de Safari e Reservas de Caça',
      metaTitle: 'Software de Gestão para Lodges de Safari e Reservas de Caça',
      metaDescription: 'Faça a gestão das reservas, passeios de jipe, quartos, funcionários e faturação do seu lodge de safari a partir de uma plataforma construída para operadores turísticos africanos.',
      keywords: ['software para lodge de safari', 'sistema de gestão de reserva de caça', 'software de reservas de safari', 'sistema de reservas de passeios de jipe', 'software de gestão de lodge África'],
      heroTagline: 'Um sistema para passeios de jipe, quartos, guias e hóspedes',
      intro: 'Um lodge de safari gere dois negócios ao mesmo tempo — alojamento e atividades. A OpDesk trata de ambos: passeios de jipe e excursões com tabelas de preços por duração, quartos e limpeza, atribuição de guia e veículo por passeio, e faturação de hóspedes, tudo num calendário partilhado em vez de um sistema separado para cada lado.',
      benefits: [
        'Tipos de reserva de excursão com tabelas de preços de 3 horas, 6 horas e dia inteiro para passeios de jipe',
        'Reservas de quartos e limpeza rastreadas junto com as reservas de atividades',
        'Atribua um guia e veículo a cada passeio de jipe ao fazer a reserva',
        'Faturação e extratos de hóspedes com a marca do seu lodge',
        'Certificações de funcionários e registo de armas incluídos para conformidade de guias e caçadores profissionais',
      ],
      forWhom: 'Lodges de safari, reservas de caça e acampamentos que gerem tanto alojamento como atividades guiadas.',
    },
  },
  'shuttle-transfer-software': {
    en: {
      title: 'Software for Shuttle & Transfer Companies',
      metaTitle: 'Shuttle & Transfer Booking Software for Tour Operators',
      metaDescription: 'Manage transfers, fleet, drivers and invoicing for your shuttle or transfer business, with optional safari and excursion bookings on the same platform.',
      keywords: ['shuttle booking software', 'transfer management software', 'shuttle company software Africa', 'fleet management for shuttles', 'transfer booking system'],
      heroTagline: 'Transfers, fleet and drivers, plus excursions if you offer them',
      intro: 'Shuttle and transfer companies live and die by fleet scheduling. OpDesk tracks every vehicle, assigns drivers to transfers as they\u2019re booked, and — since many shuttle operators also run day safaris or excursions on the side — supports duration-based excursion pricing on the exact same booking calendar.',
      benefits: [
        'Fleet management with vehicle status and assignment per transfer',
        'Driver assignment and cost-to-company tracking',
        'Add excursion or safari bookings on the same calendar if you offer them',
        'Client invoicing and statements, generated as branded PDFs',
        'Add the Logistics module if you also run parcel or delivery work',
      ],
      forWhom: 'Shuttle companies, airport transfer services, and transport operators who sometimes also run tours or excursions.',
    },
    af: {
      title: 'Sagteware vir Pendel- en Oordragmaatskappye',
      metaTitle: 'Pendel- en Oordrag-besprekingsagteware vir Toeroperateurs',
      metaDescription: 'Bestuur oordragte, vloot, bestuurders en fakturering vir jou pendel- of oordragbesigheid, met opsionele wildsafari- en uitstappiebesprekings op dieselfde platform.',
      keywords: ['pendel-besprekingsagteware', 'oordragbestuurprogrammatuur', 'pendelmaatskappy sagteware Afrika', 'vlootbestuur vir pendeldienste', 'oordragbesprekingstelsel'],
      heroTagline: 'Oordragte, vloot en bestuurders, plus uitstappies as jy dit aanbied',
      intro: 'Pendel- en oordragmaatskappye leef en sterf deur vlootskedulering. OpDesk hou elke voertuig dop, wys bestuurders aan oordragte toe soos hulle bespreek word, en — aangesien baie pendeloperateurs ook dagsafaris of uitstappies aan die kant bedryf — ondersteun duurtegebaseerde uitstappieprysing op dieselfde besprekingskalender.',
      benefits: [
        'Vlootbestuur met voertuigstatus en toewysing per oordrag',
        'Bestuurderstoewysing en koste-tot-maatskappy opsporing',
        'Voeg uitstappie- of wildsafaribesprekings by op dieselfde kalender as jy dit aanbied',
        'Kliëntefakturering en state, gegenereer as handelsmerk-PDF\'s',
        'Voeg die Logistiekmodule by as jy ook pakkie- of afleweringswerk doen',
      ],
      forWhom: 'Pendelmaatskappye, lughawe-oordragdienste, en vervoeroperateurs wat soms ook toere of uitstappies bedryf.',
    },
    de: {
      title: 'Software für Shuttle- & Transferunternehmen',
      metaTitle: 'Shuttle- & Transfer-Buchungssoftware für Reiseveranstalter',
      metaDescription: 'Verwalten Sie Transfers, Fuhrpark, Fahrer und Rechnungsstellung für Ihr Shuttle- oder Transferunternehmen, mit optionalen Safari- und Ausflugsbuchungen auf derselben Plattform.',
      keywords: ['Shuttle-Buchungssoftware', 'Transferverwaltungssoftware', 'Shuttle-Unternehmenssoftware Afrika', 'Fuhrparkverwaltung für Shuttles', 'Transferbuchungssystem'],
      heroTagline: 'Transfers, Fuhrpark und Fahrer, plus Ausflüge, falls angeboten',
      intro: 'Shuttle- und Transferunternehmen leben von der Fuhrparkplanung. OpDesk erfasst jedes Fahrzeug, weist Fahrer bei der Buchung Transfers zu und unterstützt — da viele Shuttle-Betreiber auch Tagessafaris oder Ausflüge anbieten — dauerbasierte Ausflugspreise im selben Buchungskalender.',
      benefits: [
        'Fuhrparkverwaltung mit Fahrzeugstatus und Zuweisung pro Transfer',
        'Fahrerzuweisung und Kostenerfassung pro Mitarbeiter',
        'Ausflugs- oder Safaribuchungen im selben Kalender hinzufügen, falls angeboten',
        'Kundenrechnungen und Kontoauszüge als gebrandete PDFs',
        'Fügen Sie das Logistikmodul hinzu, wenn Sie auch Paket- oder Lieferdienste anbieten',
      ],
      forWhom: 'Shuttle-Unternehmen, Flughafentransferdienste und Transportbetreiber, die manchmal auch Touren oder Ausflüge anbieten.',
    },
    fr: {
      title: 'Logiciel pour Compagnies de Navette et de Transfert',
      metaTitle: 'Logiciel de Réservation de Navette et Transfert pour Voyagistes',
      metaDescription: 'Gérez les transferts, la flotte, les chauffeurs et la facturation de votre entreprise de navette ou de transfert, avec des réservations safari et excursion optionnelles sur la même plateforme.',
      keywords: ['logiciel de réservation de navette', 'logiciel de gestion de transfert', 'logiciel de compagnie de navette Afrique', 'gestion de flotte pour navettes', 'système de réservation de transfert'],
      heroTagline: 'Transferts, flotte et chauffeurs, plus des excursions si vous en proposez',
      intro: "Les compagnies de navette et de transfert vivent et meurent par la planification de leur flotte. OpDesk suit chaque véhicule, affecte les chauffeurs aux transferts au moment de la réservation, et — de nombreux opérateurs de navette proposant aussi des safaris ou excursions à la journée — prend en charge la tarification d'excursion par durée sur le même calendrier de réservation.",
      benefits: [
        'Gestion de flotte avec statut des véhicules et affectation par transfert',
        'Affectation des chauffeurs et suivi du coût par employé',
        'Ajoutez des réservations d\'excursion ou de safari sur le même calendrier si vous en proposez',
        'Facturation et relevés clients, générés en PDF à votre image de marque',
        'Ajoutez le module Logistique si vous faites aussi des livraisons de colis',
      ],
      forWhom: 'Compagnies de navette, services de transfert aéroport, et opérateurs de transport qui proposent parfois aussi des circuits ou excursions.',
    },
    pt: {
      title: 'Software para Empresas de Shuttle e Transfer',
      metaTitle: 'Software de Reservas de Shuttle e Transfer para Operadores Turísticos',
      metaDescription: 'Faça a gestão de transfers, frota, motoristas e faturação para o seu negócio de shuttle ou transfer, com reservas opcionais de safari e excursões na mesma plataforma.',
      keywords: ['software de reservas de shuttle', 'software de gestão de transfer', 'software de empresa de shuttle África', 'gestão de frota para shuttles', 'sistema de reservas de transfer'],
      heroTagline: 'Transfers, frota e motoristas, mais excursões se as oferecer',
      intro: 'As empresas de shuttle e transfer vivem e morrem pela programação da frota. A OpDesk rastreia cada veículo, atribui motoristas aos transfers assim que são reservados e — como muitos operadores de shuttle também fazem safaris de um dia ou excursões — suporta preços de excursão por duração no mesmo calendário de reservas.',
      benefits: [
        'Gestão de frota com estado do veículo e atribuição por transfer',
        'Atribuição de motoristas e rastreio de custo por funcionário',
        'Adicione reservas de excursão ou safari no mesmo calendário, se as oferecer',
        'Faturação e extratos de clientes, gerados como PDFs personalizados',
        'Adicione o módulo de Logística se também fizer entregas de encomendas',
      ],
      forWhom: 'Empresas de shuttle, serviços de transfer de aeroporto, e operadores de transporte que por vezes também fazem tours ou excursões.',
    },
  },
  'fishing-charter-software': {
    en: {
      title: 'Software for Fishing Charter Operators',
      metaTitle: 'Fishing Charter Booking & Management Software',
      metaDescription: 'Book charters, manage your boat and crew, and invoice clients from one platform built for fishing charter operators.',
      keywords: ['fishing charter software', 'charter booking system', 'boat charter management software', 'fishing charter booking software Africa'],
      heroTagline: 'Charter bookings, crew and boat, all in one calendar',
      intro: 'Run your fishing charter bookings the same way you\u2019d run any tour booking — with duration-based rate cards for half-day and full-day charters, crew and vessel assignment, and client invoicing, instead of managing it over WhatsApp and a paper logbook.',
      benefits: [
        'Duration-based charter rate cards (half-day, full-day, custom)',
        'Assign crew and vessel to each charter booking',
        'Guest count and special requirements tracked per booking',
        'Client invoicing and payment tracking',
        'Works alongside accommodation bookings if you also offer overnight stays',
      ],
      forWhom: 'Fishing charter operators and sport-fishing outfits booking half-day and full-day trips.',
    },
    af: {
      title: 'Sagteware vir Visvangs-huurbootoperateurs',
      metaTitle: 'Visvangs-huurboot Besprekings- en Bestuurprogrammatuur',
      metaDescription: 'Bespreek togte, bestuur jou boot en bemanning, en faktureer kliënte vanaf een platform gebou vir visvangs-huurbootoperateurs.',
      keywords: ['visvangs-huurboot sagteware', 'huurboot besprekingstelsel', 'boothuur bestuurprogrammatuur', 'visvangs-huurboot besprekingsagteware Afrika'],
      heroTagline: 'Togbesprekings, bemanning en boot, alles in een kalender',
      intro: 'Bestuur jou visvangs-huurboot besprekings op dieselfde manier as enige toerbespreking — met duurtegebaseerde tariewe vir halfdag- en volledige-dag togte, bemannings- en vaartuigtoewysing, en kliëntefakturering, in plaas daarvan om dit oor WhatsApp en \'n papierlogboek te bestuur.',
      benefits: [
        'Duurtegebaseerde tog-tariewe (halfdag, volledige dag, pasgemaak)',
        'Wys bemanning en vaartuig aan elke togbespreking toe',
        'Gastetal en spesiale vereistes opgespoor per bespreking',
        'Kliëntefakturering en betalingopsporing',
        'Werk saam met verblyfbesprekings as jy ook oornagverblyf aanbied',
      ],
      forWhom: 'Visvangs-huurbootoperateurs en sportvisvangs-besighede wat halfdag- en volledige-dag togte bespreek.',
    },
    de: {
      title: 'Software für Angelcharter-Betreiber',
      metaTitle: 'Buchungs- und Verwaltungssoftware für Angelcharter',
      metaDescription: 'Buchen Sie Charter, verwalten Sie Boot und Crew, und stellen Sie Kunden Rechnungen aus — mit einer Plattform für Angelcharter-Betreiber.',
      keywords: ['Angelcharter-Software', 'Charter-Buchungssystem', 'Bootscharter-Verwaltungssoftware', 'Angelcharter-Buchungssoftware Afrika'],
      heroTagline: 'Charterbuchungen, Crew und Boot, alles in einem Kalender',
      intro: 'Verwalten Sie Ihre Angelcharter-Buchungen genau wie jede andere Tourbuchung — mit dauerbasierten Preistabellen für Halbtags- und Ganztagestörns, Crew- und Bootszuweisung, und Kundenrechnungen, statt alles über WhatsApp und ein Papier-Logbuch zu verwalten.',
      benefits: [
        'Dauerbasierte Chartertarife (halber Tag, ganzer Tag, individuell)',
        'Weisen Sie jeder Charterbuchung Crew und Boot zu',
        'Gästeanzahl und Sonderwünsche pro Buchung erfasst',
        'Kundenrechnungen und Zahlungsverfolgung',
        'Funktioniert zusammen mit Unterkunftsbuchungen, falls Sie auch Übernachtungen anbieten',
      ],
      forWhom: 'Angelcharter-Betreiber und Sportfischerei-Unternehmen, die Halbtags- und Ganztagestörns buchen.',
    },
    fr: {
      title: 'Logiciel pour Opérateurs de Charters de Pêche',
      metaTitle: 'Logiciel de Réservation et Gestion de Charters de Pêche',
      metaDescription: 'Réservez des sorties, gérez votre bateau et votre équipage, et facturez vos clients depuis une plateforme conçue pour les opérateurs de charters de pêche.',
      keywords: ['logiciel de charter de pêche', 'système de réservation de charter', 'logiciel de gestion de charter de bateau', 'logiciel de réservation de charter de pêche Afrique'],
      heroTagline: 'Réservations de charter, équipage et bateau, le tout dans un calendrier',
      intro: "Gérez vos réservations de charter de pêche comme n'importe quelle réservation de circuit — avec des grilles tarifaires par durée pour les sorties demi-journée et journée complète, l'affectation d'équipage et de navire, et la facturation client, plutôt que de tout gérer par WhatsApp et un carnet papier.",
      benefits: [
        'Grilles tarifaires de charter par durée (demi-journée, journée complète, sur mesure)',
        'Affectez équipage et navire à chaque réservation de charter',
        'Nombre de clients et exigences particulières suivis par réservation',
        'Facturation client et suivi des paiements',
        'Fonctionne avec les réservations d\'hébergement si vous proposez aussi des séjours',
      ],
      forWhom: 'Opérateurs de charters de pêche et entreprises de pêche sportive réservant des sorties demi-journée et journée complète.',
    },
    pt: {
      title: 'Software para Operadores de Charter de Pesca',
      metaTitle: 'Software de Reservas e Gestão de Charter de Pesca',
      metaDescription: 'Reserve saídas, faça a gestão do seu barco e tripulação, e fature clientes a partir de uma plataforma construída para operadores de charter de pesca.',
      keywords: ['software de charter de pesca', 'sistema de reservas de charter', 'software de gestão de charter de barco', 'software de reservas de charter de pesca África'],
      heroTagline: 'Reservas de charter, tripulação e barco, tudo num calendário',
      intro: 'Faça a gestão das suas reservas de charter de pesca da mesma forma que qualquer reserva de tour — com tabelas de preços por duração para saídas de meio dia e dia inteiro, atribuição de tripulação e embarcação, e faturação de clientes, em vez de gerir tudo por WhatsApp e um livro de registo em papel.',
      benefits: [
        'Tabelas de preços de charter por duração (meio dia, dia inteiro, personalizado)',
        'Atribua tripulação e embarcação a cada reserva de charter',
        'Número de hóspedes e requisitos especiais rastreados por reserva',
        'Faturação de clientes e rastreio de pagamentos',
        'Funciona junto com reservas de alojamento, se também oferecer estadias',
      ],
      forWhom: 'Operadores de charter de pesca e negócios de pesca desportiva que reservam saídas de meio dia e dia inteiro.',
    },
  },
  'yacht-charter-software': {
    en: {
      title: 'Software for Yacht Charter Operators',
      metaTitle: 'Yacht Charter Booking & Management Software',
      metaDescription: 'Manage yacht charter bookings, crew, vessels and client invoicing from one platform built for African charter operators.',
      keywords: ['yacht charter software', 'boat charter booking system', 'yacht booking management software', 'charter operator software Africa'],
      heroTagline: 'Bookings, crew and vessels for every charter',
      intro: 'Yacht charters need the same care as any high-value booking — clear pricing per duration, the right crew and vessel assigned, and a professional invoice at the end. OpDesk handles all three, plus the guest and staff management that comes with running a charter operation.',
      benefits: [
        'Duration-based charter pricing (3-hour, 6-hour, full-day)',
        'Vessel and crew assignment per charter',
        'Guest count and special requirements per booking',
        'Branded client invoicing with VAT and banking details',
        'Staff certifications tracked for skipper and crew compliance',
      ],
      forWhom: 'Yacht charter operators, sailing charters, and luxury boat tour businesses.',
    },
    af: {
      title: 'Sagteware vir Jag-huurbootoperateurs',
      metaTitle: 'Jag-huurboot Besprekings- en Bestuurprogrammatuur',
      metaDescription: 'Bestuur jaghuurboot-besprekings, bemanning, vaartuie en kliëntefakturering vanaf een platform gebou vir Afrika-huurbootoperateurs.',
      keywords: ['jag-huurboot sagteware', 'boothuur besprekingstelsel', 'jagbespreking bestuurprogrammatuur', 'huurbootoperateur sagteware Afrika'],
      heroTagline: 'Besprekings, bemanning en vaartuie vir elke togt',
      intro: 'Jaghuurbote benodig dieselfde sorg as enige hoëwaarde-bespreking — duidelike pryse per duur, die regte bemanning en vaartuig toegewys, en \'n professionele faktuur aan die einde. OpDesk hanteer al drie, plus die gaste- en personeelbestuur wat kom met die bedryf van \'n huurbootbesigheid.',
      benefits: [
        'Duurtegebaseerde togprysing (3-uur, 6-uur, volledige dag)',
        'Vaartuig- en bemanningstoewysing per togt',
        'Gastetal en spesiale vereistes per bespreking',
        'Handelsmerk-kliëntefakturering met BTW- en bankbesonderhede',
        'Personeelsertifisering opgespoor vir kaptein en bemanningvoldoening',
      ],
      forWhom: 'Jag-huurbootoperateurs, seiltogte, en luukse boottoer-besighede.',
    },
    de: {
      title: 'Software für Yachtcharter-Betreiber',
      metaTitle: 'Yachtcharter-Buchungs- und Verwaltungssoftware',
      metaDescription: 'Verwalten Sie Yachtcharter-Buchungen, Crew, Boote und Kundenrechnungen über eine Plattform für afrikanische Charterbetreiber.',
      keywords: ['Yachtcharter-Software', 'Bootscharter-Buchungssystem', 'Yacht-Buchungsverwaltungssoftware', 'Charterbetreiber-Software Afrika'],
      heroTagline: 'Buchungen, Crew und Boote für jeden Törn',
      intro: 'Yachtcharter erfordern die gleiche Sorgfalt wie jede hochwertige Buchung — klare Preise pro Dauer, die richtige Crew und das richtige Boot zugewiesen, und am Ende eine professionelle Rechnung. OpDesk deckt alle drei ab, plus die Gäste- und Mitarbeiterverwaltung, die zum Betrieb eines Charterunternehmens gehört.',
      benefits: [
        'Dauerbasierte Chartertarife (3 Stunden, 6 Stunden, ganzer Tag)',
        'Boots- und Crewzuweisung pro Charter',
        'Gästeanzahl und Sonderwünsche pro Buchung',
        'Gebrandete Kundenrechnungen mit USt- und Bankdaten',
        'Mitarbeiterzertifizierungen für die Compliance von Skipper und Crew erfasst',
      ],
      forWhom: 'Yachtcharter-Betreiber, Segelcharter und Luxusboot-Tourunternehmen.',
    },
    fr: {
      title: 'Logiciel pour Opérateurs de Charters de Yacht',
      metaTitle: 'Logiciel de Réservation et Gestion de Charters de Yacht',
      metaDescription: 'Gérez les réservations de charter de yacht, l\'équipage, les navires et la facturation client depuis une plateforme conçue pour les opérateurs de charter africains.',
      keywords: ['logiciel de charter de yacht', 'système de réservation de charter de bateau', 'logiciel de gestion de réservation de yacht', 'logiciel opérateur de charter Afrique'],
      heroTagline: 'Réservations, équipage et navires pour chaque sortie',
      intro: "Les charters de yacht exigent le même soin que toute réservation à haute valeur — une tarification claire par durée, le bon équipage et le bon navire affectés, et une facture professionnelle à la fin. OpDesk gère les trois, ainsi que la gestion des clients et du personnel liée à l'exploitation d'un charter.",
      benefits: [
        'Tarification de charter par durée (3h, 6h, journée complète)',
        'Affectation du navire et de l\'équipage par charter',
        'Nombre de clients et exigences particulières par réservation',
        'Facturation client à votre image de marque avec TVA et coordonnées bancaires',
        'Certifications du personnel suivies pour la conformité du skipper et de l\'équipage',
      ],
      forWhom: 'Opérateurs de charter de yacht, charters à voile, et entreprises de tours en bateau de luxe.',
    },
    pt: {
      title: 'Software para Operadores de Charter de Iate',
      metaTitle: 'Software de Reservas e Gestão de Charter de Iate',
      metaDescription: 'Faça a gestão de reservas de charter de iate, tripulação, embarcações e faturação de clientes a partir de uma plataforma construída para operadores de charter africanos.',
      keywords: ['software de charter de iate', 'sistema de reservas de charter de barco', 'software de gestão de reservas de iate', 'software de operador de charter África'],
      heroTagline: 'Reservas, tripulação e embarcações para cada saída',
      intro: 'Os charters de iate exigem o mesmo cuidado que qualquer reserva de alto valor — preços claros por duração, a tripulação e embarcação certas atribuídas, e uma fatura profissional no final. A OpDesk trata das três, além da gestão de hóspedes e funcionários que vem com a operação de um negócio de charter.',
      benefits: [
        'Preços de charter por duração (3 horas, 6 horas, dia inteiro)',
        'Atribuição de embarcação e tripulação por charter',
        'Número de hóspedes e requisitos especiais por reserva',
        'Faturação de clientes personalizada com IVA e dados bancários',
        'Certificações de funcionários rastreadas para conformidade de skipper e tripulação',
      ],
      forWhom: 'Operadores de charter de iate, charters à vela, e negócios de tours de barco de luxo.',
    },
  },
  'trail-guide-software': {
    en: {
      title: 'Software for Trail Guides & Adventure Operators',
      metaTitle: 'Trail Guide & Adventure Tour Booking Software',
      metaDescription: 'Book guided trails and adventure tours, manage guide certifications, and invoice clients from one platform built for adventure operators.',
      keywords: ['trail guide software', 'hiking tour booking software', 'adventure tour management system', 'guide certification tracking software'],
      heroTagline: 'Guided trails, guide certifications, and client bookings together',
      intro: 'Trail and adventure guiding depends on having the right certified guide available for the right trail. OpDesk tracks guide certifications and expiry dates alongside your trail bookings, so you always know who\u2019s qualified and available before you confirm a booking.',
      benefits: [
        'Trail-specific booking types with your own duration and pricing',
        'Guide certification tracking with expiry alerts',
        'Guest count and booking status tracked per trail departure',
        'Client invoicing and payment tracking',
        'Works for single-day trails or multi-day guided adventures',
      ],
      forWhom: 'Trail guides, hiking operators, and adventure tourism businesses running certified guided trips.',
    },
    af: {
      title: 'Sagteware vir Wandelgidse en Avontuuroperateurs',
      metaTitle: 'Wandelgids- en Avontuurtoer Besprekingsagteware',
      metaDescription: 'Bespreek begeleide wandelroetes en avontuurtoere, bestuur gidssertifisering, en faktureer kliënte vanaf een platform gebou vir avontuuroperateurs.',
      keywords: ['wandelgids sagteware', 'wandeltoer besprekingsagteware', 'avontuurtoer bestuurstelsel', 'gidssertifisering opsporing sagteware'],
      heroTagline: 'Begeleide roetes, gidssertifisering, en kliëntebesprekings saam',
      intro: 'Wandel- en avontuurgidswerk hang af daarvan om die regte gesertifiseerde gids beskikbaar te hê vir die regte roete. OpDesk hou gidssertifisering en vervaldatums dop langs jou roetebesprekings, sodat jy altyd weet wie gekwalifiseer en beskikbaar is voordat jy \'n bespreking bevestig.',
      benefits: [
        'Roetespesifieke besprekingtipes met jou eie duur en pryse',
        'Gidssertifisering-opsporing met vervalwaarskuwings',
        'Gastetal en besprekingstatus opgespoor per roetevertrek',
        'Kliëntefakturering en betalingopsporing',
        'Werk vir enkeldag-roetes of meerdaagse begeleide avonture',
      ],
      forWhom: 'Wandelgidse, wandeltoeroperateurs, en avontuurtoerisme-besighede wat gesertifiseerde begeleide togte bedryf.',
    },
    de: {
      title: 'Software für Wanderführer & Abenteueranbieter',
      metaTitle: 'Buchungssoftware für Wanderführer & Abenteuertouren',
      metaDescription: 'Buchen Sie geführte Wanderungen und Abenteuertouren, verwalten Sie Guide-Zertifizierungen und stellen Sie Kunden Rechnungen aus — mit einer Plattform für Abenteueranbieter.',
      keywords: ['Wanderführer-Software', 'Buchungssoftware für Wandertouren', 'Verwaltungssystem für Abenteuertouren', 'Software zur Guide-Zertifizierungsverfolgung'],
      heroTagline: 'Geführte Wanderungen, Guide-Zertifizierungen und Kundenbuchungen zusammen',
      intro: 'Wander- und Abenteuerführung hängt davon ab, den richtigen zertifizierten Guide für die richtige Route verfügbar zu haben. OpDesk verfolgt Guide-Zertifizierungen und Ablaufdaten neben Ihren Routenbuchungen, sodass Sie immer wissen, wer qualifiziert und verfügbar ist, bevor Sie eine Buchung bestätigen.',
      benefits: [
        'Routenspezifische Buchungsarten mit eigener Dauer und Preisen',
        'Guide-Zertifizierungsverfolgung mit Ablaufwarnungen',
        'Gästeanzahl und Buchungsstatus pro Routenabfahrt erfasst',
        'Kundenrechnungen und Zahlungsverfolgung',
        'Funktioniert für eintägige Routen oder mehrtägige geführte Abenteuer',
      ],
      forWhom: 'Wanderführer, Wandertour-Betreiber und Abenteuertourismus-Unternehmen mit zertifizierten geführten Touren.',
    },
    fr: {
      title: 'Logiciel pour Guides de Randonnée et Opérateurs d\'Aventure',
      metaTitle: 'Logiciel de Réservation pour Guides de Randonnée et Tours d\'Aventure',
      metaDescription: "Réservez des randonnées guidées et des tours d'aventure, gérez les certifications des guides, et facturez vos clients depuis une plateforme conçue pour les opérateurs d'aventure.",
      keywords: ['logiciel de guide de randonnée', 'logiciel de réservation de randonnée', 'système de gestion de tour d\'aventure', 'logiciel de suivi de certification de guide'],
      heroTagline: 'Randonnées guidées, certifications des guides et réservations clients ensemble',
      intro: "Le guidage de randonnée et d'aventure dépend de la disponibilité du bon guide certifié pour le bon sentier. OpDesk suit les certifications des guides et leurs dates d'expiration aux côtés de vos réservations de sentiers, afin que vous sachiez toujours qui est qualifié et disponible avant de confirmer une réservation.",
      benefits: [
        'Types de réservation spécifiques par sentier avec votre propre durée et tarification',
        'Suivi des certifications des guides avec alertes d\'expiration',
        'Nombre de clients et statut de réservation suivis par départ de sentier',
        'Facturation client et suivi des paiements',
        'Fonctionne pour les sentiers d\'une journée ou les aventures guidées de plusieurs jours',
      ],
      forWhom: "Guides de randonnée, opérateurs de trekking, et entreprises de tourisme d'aventure organisant des sorties guidées certifiées.",
    },
    pt: {
      title: 'Software para Guias de Trilhos e Operadores de Aventura',
      metaTitle: 'Software de Reservas para Guias de Trilhos e Tours de Aventura',
      metaDescription: 'Reserve trilhos guiados e tours de aventura, faça a gestão de certificações de guias, e fature clientes a partir de uma plataforma construída para operadores de aventura.',
      keywords: ['software de guia de trilhos', 'software de reservas de trilhos', 'sistema de gestão de tour de aventura', 'software de rastreio de certificação de guias'],
      heroTagline: 'Trilhos guiados, certificações de guias e reservas de clientes juntos',
      intro: 'O guiamento de trilhos e aventura depende de ter o guia certificado certo disponível para o trilho certo. A OpDesk rastreia as certificações dos guias e datas de validade junto com as suas reservas de trilhos, para que saiba sempre quem está qualificado e disponível antes de confirmar uma reserva.',
      benefits: [
        'Tipos de reserva específicos por trilho com a sua própria duração e preços',
        'Rastreio de certificação de guias com alertas de validade',
        'Número de hóspedes e estado da reserva rastreados por partida de trilho',
        'Faturação de clientes e rastreio de pagamentos',
        'Funciona para trilhos de um dia ou aventuras guiadas de vários dias',
      ],
      forWhom: 'Guias de trilhos, operadores de caminhadas, e negócios de turismo de aventura que fazem viagens guiadas certificadas.',
    },
  },
  'guesthouse-hotel-software': {
    en: {
      title: 'Software for Guesthouses, B&Bs and Small Hotels',
      metaTitle: 'Guesthouse & Small Hotel Management Software',
      metaDescription: 'Manage rooms, housekeeping, guests and invoicing for your guesthouse, B&B or small hotel, built for African hospitality operators.',
      keywords: ['guesthouse management software', 'B&B booking software Africa', 'small hotel property management system', 'guesthouse software South Africa'],
      heroTagline: 'Rooms, housekeeping and guests in one place',
      intro: 'A property management system built for how a small guesthouse actually runs, not a scaled-down version of enterprise hotel software. Track room bookings and availability, housekeeping status per room, guest details, and invoicing, without paying for hundreds of features you\u2019ll never use.',
      benefits: [
        'Room bookings and availability calendar',
        'Housekeeping status tracked per room',
        'Guest directory with contact and stay history',
        'Branded invoices and statements with VAT details',
        'Add vehicle-based excursions if you also offer transfers or tours to guests',
      ],
      forWhom: 'Guesthouses, B&Bs, and small independent hotels who need real property management without enterprise pricing.',
    },
    af: {
      title: 'Sagteware vir Gastehuise, B&B\'s en Klein Hotelle',
      metaTitle: 'Gastehuis- en Klein Hotel Bestuurprogrammatuur',
      metaDescription: 'Bestuur kamers, huishouding, gaste en fakturering vir jou gastehuis, B&B of klein hotel, gebou vir Afrika-gasvryheidoperateurs.',
      keywords: ['gastehuis bestuurprogrammatuur', 'B&B besprekingsagteware Afrika', 'klein hotel eiendombestuurstelsel', 'gastehuis sagteware Suid-Afrika'],
      heroTagline: 'Kamers, huishouding en gaste op een plek',
      intro: '\'n Eiendombestuurstelsel gebou vir hoe \'n klein gastehuis werklik werk, nie \'n afgeskaalde weergawe van korporatiewe hotelsagteware nie. Hou kamerbesprekings en beskikbaarheid, huishoudingstatus per kamer, gastebesonderhede, en fakturering dop, sonder om vir honderde funksies te betaal wat jy nooit sal gebruik nie.',
      benefits: [
        'Kamerbesprekings en beskikbaarheidskalender',
        'Huishoudingstatus opgespoor per kamer',
        'Gastegids met kontak- en verblyfgeskiedenis',
        'Handelsmerk-fakture en state met BTW-besonderhede',
        'Voeg voertuiggebaseerde uitstappies by as jy ook oordragte of toere aan gaste bied',
      ],
      forWhom: 'Gastehuise, B&B\'s, en klein onafhanklike hotelle wat werklike eiendombestuur benodig sonder korporatiewe pryse.',
    },
    de: {
      title: 'Software für Gästehäuser, B&Bs und kleine Hotels',
      metaTitle: 'Verwaltungssoftware für Gästehäuser und kleine Hotels',
      metaDescription: 'Verwalten Sie Zimmer, Housekeeping, Gäste und Rechnungsstellung für Ihr Gästehaus, B&B oder kleines Hotel — gebaut für afrikanische Gastgewerbebetreiber.',
      keywords: ['Gästehaus-Verwaltungssoftware', 'B&B-Buchungssoftware Afrika', 'Verwaltungssystem für kleine Hotels', 'Gästehaus-Software Südafrika'],
      heroTagline: 'Zimmer, Housekeeping und Gäste an einem Ort',
      intro: 'Ein Property-Management-System, das dafür gebaut ist, wie ein kleines Gästehaus tatsächlich arbeitet — keine abgespeckte Version von Enterprise-Hotelsoftware. Erfassen Sie Zimmerbuchungen und Verfügbarkeit, Housekeeping-Status pro Zimmer, Gästedaten und Rechnungsstellung, ohne für Hunderte nie genutzte Funktionen zu bezahlen.',
      benefits: [
        'Zimmerbuchungen und Verfügbarkeitskalender',
        'Housekeeping-Status pro Zimmer erfasst',
        'Gästeverzeichnis mit Kontakt- und Aufenthaltshistorie',
        'Gebrandete Rechnungen und Kontoauszüge mit USt-Angaben',
        'Fügen Sie fahrzeugbasierte Ausflüge hinzu, falls Sie Gästen auch Transfers oder Touren anbieten',
      ],
      forWhom: 'Gästehäuser, B&Bs und kleine unabhängige Hotels, die echtes Property Management ohne Enterprise-Preise benötigen.',
    },
    fr: {
      title: 'Logiciel pour Maisons d\'Hôtes, B&Bs et Petits Hôtels',
      metaTitle: 'Logiciel de Gestion pour Maisons d\'Hôtes et Petits Hôtels',
      metaDescription: "Gérez les chambres, le ménage, les clients et la facturation de votre maison d'hôtes, B&B ou petit hôtel, conçu pour les opérateurs d'hospitalité africains.",
      keywords: ['logiciel de gestion de maison d\'hôtes', 'logiciel de réservation B&B Afrique', 'système de gestion immobilière pour petits hôtels', 'logiciel maison d\'hôtes Afrique du Sud'],
      heroTagline: 'Chambres, ménage et clients en un seul endroit',
      intro: "Un système de gestion immobilière conçu pour la façon dont une petite maison d'hôtes fonctionne réellement, pas une version allégée d'un logiciel hôtelier d'entreprise. Suivez les réservations de chambres et la disponibilité, le statut de ménage par chambre, les coordonnées des clients, et la facturation, sans payer pour des centaines de fonctionnalités que vous n'utiliserez jamais.",
      benefits: [
        'Réservations de chambres et calendrier de disponibilité',
        'Statut de ménage suivi par chambre',
        'Répertoire client avec coordonnées et historique de séjour',
        'Factures et relevés à votre image de marque avec informations de TVA',
        'Ajoutez des excursions basées sur véhicule si vous proposez aussi des transferts ou circuits aux clients',
      ],
      forWhom: "Maisons d'hôtes, B&Bs, et petits hôtels indépendants ayant besoin d'une vraie gestion immobilière sans tarification d'entreprise.",
    },
    pt: {
      title: 'Software para Casas de Hóspedes, B&Bs e Pequenos Hotéis',
      metaTitle: 'Software de Gestão para Casas de Hóspedes e Pequenos Hotéis',
      metaDescription: 'Faça a gestão de quartos, limpeza, hóspedes e faturação para a sua casa de hóspedes, B&B ou pequeno hotel, construído para operadores de hospitalidade africanos.',
      keywords: ['software de gestão de casa de hóspedes', 'software de reservas B&B África', 'sistema de gestão de propriedade para pequenos hotéis', 'software de casa de hóspedes África do Sul'],
      heroTagline: 'Quartos, limpeza e hóspedes num só lugar',
      intro: 'Um sistema de gestão de propriedade construído para a forma como uma pequena casa de hóspedes realmente funciona, não uma versão reduzida de software hoteleiro empresarial. Rastreie reservas de quartos e disponibilidade, estado de limpeza por quarto, detalhes de hóspedes, e faturação, sem pagar por centenas de funcionalidades que nunca vai usar.',
      benefits: [
        'Reservas de quartos e calendário de disponibilidade',
        'Estado de limpeza rastreado por quarto',
        'Diretório de hóspedes com histórico de contacto e estadias',
        'Faturas e extratos personalizados com detalhes de IVA',
        'Adicione excursões baseadas em veículos se também oferecer transfers ou tours aos hóspedes',
      ],
      forWhom: 'Casas de hóspedes, B&Bs, e pequenos hotéis independentes que precisam de gestão de propriedade real sem preços empresariais.',
    },
  },
  'east-africa-tour-software': {
    en: {
      title: 'Software for East Africa Tour Operators',
      metaTitle: 'Tour Operator Software for East Africa',
      metaDescription: 'Booking, fleet, guide and invoicing software built for tour operators across Kenya, Tanzania, Uganda and East Africa, with local currencies and languages supported.',
      keywords: ['tour operator software East Africa', 'Kenya safari booking software', 'Tanzania tour management software', 'Swahili booking software'],
      heroTagline: 'Built with East African currencies and languages as first-class citizens',
      intro: 'OpDesk supports Kenyan Shillings, Tanzanian Shillings, Ugandan Shillings and Swahili out of the box, alongside the full booking, fleet, guide and invoicing toolkit every tour operator needs — not a South Africa-first tool with East Africa bolted on as an afterthought.',
      benefits: [
        'Kenyan Shilling, Tanzanian Shilling and Ugandan Shilling supported natively',
        'Swahili language support alongside English',
        'Multi-day tour bookings with guide and vehicle assignment',
        'Client invoicing in local currency with your own branding',
        'The same platform works across borders if you operate in more than one East African country',
      ],
      forWhom: 'Tour operators running safaris and multi-day trips across Kenya, Tanzania, Uganda and neighbouring countries.',
    },
    af: {
      title: 'Sagteware vir Oos-Afrika Toeroperateurs',
      metaTitle: 'Toeroperateur Sagteware vir Oos-Afrika',
      metaDescription: 'Bespreking-, vloot-, gids- en faktureringsagteware gebou vir toeroperateurs regoor Kenia, Tanzanië, Uganda en Oos-Afrika, met plaaslike geldeenhede en tale ondersteun.',
      keywords: ['toeroperateur sagteware Oos-Afrika', 'Kenia wildsafari-besprekingsagteware', 'Tanzanië toerbestuurprogrammatuur', 'Swahili besprekingsagteware'],
      heroTagline: 'Gebou met Oos-Afrika-geldeenhede en -tale as eersteklas burgers',
      intro: 'OpDesk ondersteun Keniaanse Sjielings, Tanzaniese Sjielings, Ugandese Sjielings en Swahili uit die staanspoor, saam met die volledige bespreking-, vloot-, gids- en fakturering-gereedskapstel wat elke toeroperateur nodig het — nie \'n Suid-Afrika-eerste hulpmiddel met Oos-Afrika later aangelas nie.',
      benefits: [
        'Keniaanse Sjieling, Tanzaniese Sjieling en Ugandese Sjieling natuurlik ondersteun',
        'Swahili-taalondersteuning langs Engels',
        'Meerdaagse toerbesprekings met gids- en voertuigtoewysing',
        'Kliëntefakturering in plaaslike geldeenheid met jou eie handelsmerk',
        'Dieselfde platform werk oor grense as jy in meer as een Oos-Afrika-land bedryf',
      ],
      forWhom: 'Toeroperateurs wat wildsafaris en meerdaagse togte regoor Kenia, Tanzanië, Uganda en naburige lande bedryf.',
    },
    de: {
      title: 'Software für Reiseveranstalter in Ostafrika',
      metaTitle: 'Reiseveranstalter-Software für Ostafrika',
      metaDescription: 'Buchungs-, Fuhrpark-, Guide- und Abrechnungssoftware für Reiseveranstalter in Kenia, Tansania, Uganda und Ostafrika, mit Unterstützung lokaler Währungen und Sprachen.',
      keywords: ['Reiseveranstalter-Software Ostafrika', 'Kenia-Safari-Buchungssoftware', 'Tansania-Tourverwaltungssoftware', 'Suaheli-Buchungssoftware'],
      heroTagline: 'Gebaut mit ostafrikanischen Währungen und Sprachen als erstklassige Optionen',
      intro: 'OpDesk unterstützt Kenianische, Tansanische und Ugandische Schilling sowie Suaheli von Haus aus, zusammen mit dem vollständigen Buchungs-, Fuhrpark-, Guide- und Abrechnungswerkzeug, das jeder Reiseveranstalter braucht — kein südafrika-zentriertes Tool mit nachträglich angeflanschtem Ostafrika.',
      benefits: [
        'Kenianischer, Tansanischer und Ugandischer Schilling nativ unterstützt',
        'Suaheli-Sprachunterstützung neben Englisch',
        'Mehrtägige Tourbuchungen mit Guide- und Fahrzeugzuweisung',
        'Kundenrechnungen in Landeswährung mit eigenem Branding',
        'Dieselbe Plattform funktioniert grenzübergreifend, wenn Sie in mehr als einem ostafrikanischen Land tätig sind',
      ],
      forWhom: 'Reiseveranstalter, die Safaris und mehrtägige Reisen in Kenia, Tansania, Uganda und Nachbarländern durchführen.',
    },
    fr: {
      title: "Logiciel pour Voyagistes d'Afrique de l'Est",
      metaTitle: "Logiciel pour Voyagistes en Afrique de l'Est",
      metaDescription: "Logiciel de réservation, flotte, guides et facturation conçu pour les voyagistes au Kenya, en Tanzanie, en Ouganda et en Afrique de l'Est, avec prise en charge des devises et langues locales.",
      keywords: ["logiciel voyagiste Afrique de l'Est", 'logiciel de réservation safari Kenya', 'logiciel de gestion de tour Tanzanie', 'logiciel de réservation swahili'],
      heroTagline: 'Conçu avec les devises et langues est-africaines comme citoyens de premier plan',
      intro: "OpDesk prend en charge le shilling kényan, le shilling tanzanien, le shilling ougandais et le swahili dès le départ, ainsi que la panoplie complète d'outils de réservation, flotte, guides et facturation dont chaque voyagiste a besoin — pas un outil pensé pour l'Afrique du Sud avec l'Afrique de l'Est ajoutée après coup.",
      benefits: [
        'Shilling kényan, tanzanien et ougandais pris en charge nativement',
        'Prise en charge du swahili aux côtés de l\'anglais',
        'Réservations de circuits multi-jours avec affectation de guide et véhicule',
        'Facturation client en devise locale à votre image de marque',
        'La même plateforme fonctionne à travers les frontières si vous opérez dans plusieurs pays d\'Afrique de l\'Est',
      ],
      forWhom: "Voyagistes organisant des safaris et voyages de plusieurs jours au Kenya, en Tanzanie, en Ouganda et dans les pays voisins.",
    },
    pt: {
      title: 'Software para Operadores Turísticos da África Oriental',
      metaTitle: 'Software para Operadores Turísticos na África Oriental',
      metaDescription: 'Software de reservas, frota, guias e faturação construído para operadores turísticos no Quénia, Tanzânia, Uganda e África Oriental, com suporte a moedas e idiomas locais.',
      keywords: ['software de operador turístico África Oriental', 'software de reservas de safari Quénia', 'software de gestão de tours Tanzânia', 'software de reservas em suaíli'],
      heroTagline: 'Construído com moedas e idiomas da África Oriental como cidadãos de primeira classe',
      intro: 'A OpDesk suporta Xelim Queniano, Xelim Tanzaniano, Xelim Ugandês e Suaíli desde o início, junto com o conjunto completo de ferramentas de reservas, frota, guias e faturação que todo operador turístico precisa — não uma ferramenta pensada primeiro para a África do Sul com a África Oriental adicionada depois.',
      benefits: [
        'Xelim Queniano, Tanzaniano e Ugandês suportados nativamente',
        'Suporte ao idioma Suaíli junto com Inglês',
        'Reservas de tours de vários dias com atribuição de guia e veículo',
        'Faturação de clientes em moeda local com a sua marca',
        'A mesma plataforma funciona entre fronteiras se operar em mais do que um país da África Oriental',
      ],
      forWhom: 'Operadores turísticos que fazem safaris e viagens de vários dias no Quénia, Tanzânia, Uganda e países vizinhos.',
    },
  },
  'island-transfer-software': {
    en: {
      title: 'Software for Island & Boat Transfer Operators',
      metaTitle: 'Island Transfer Booking Software',
      metaDescription: 'Manage island and boat transfer bookings, vessel scheduling and client invoicing from one platform built for coastal and island tourism operators.',
      keywords: ['island transfer booking software', 'boat transfer management system', 'coastal tourism booking software Africa'],
      heroTagline: 'Vessel scheduling and transfer bookings together',
      intro: 'Island and coastal transfer operators need to know which vessel is committed to which transfer, at what time, before they confirm the next booking. OpDesk tracks vessel assignment and schedule against every transfer booked, plus the guest and invoicing side of the business.',
      benefits: [
        'Vessel scheduling with assignment per transfer',
        'Transfer bookings with guest count and timing',
        'Avoid double-booking a vessel across overlapping transfers',
        'Client invoicing and payment tracking',
        'Works alongside excursion bookings if you also run island tours',
      ],
      forWhom: 'Island transfer operators, coastal boat transfer services, and resort transfer providers.',
    },
    af: {
      title: 'Sagteware vir Eiland- en Bootoordragoperateurs',
      metaTitle: 'Eilandoordrag Besprekingsagteware',
      metaDescription: 'Bestuur eiland- en bootoordragbesprekings, vaartuigskedulering en kliëntefakturering vanaf een platform gebou vir kus- en eilandtoerisme-operateurs.',
      keywords: ['eilandoordrag besprekingsagteware', 'bootoordrag bestuurstelsel', 'kustoerisme besprekingsagteware Afrika'],
      heroTagline: 'Vaartuigskedulering en oordragbesprekings saam',
      intro: 'Eiland- en kusoordragoperateurs moet weet watter vaartuig aan watter oordrag toegewy is, om watter tyd, voordat hulle die volgende bespreking bevestig. OpDesk hou vaartuigtoewysing en skedule dop teen elke oordrag wat bespreek word, plus die gaste- en fakturingskant van die besigheid.',
      benefits: [
        'Vaartuigskedulering met toewysing per oordrag',
        'Oordragbesprekings met gastetal en tydsberekening',
        'Vermy dubbelbespreking van \'n vaartuig oor oorvleuelende oordragte',
        'Kliëntefakturering en betalingopsporing',
        'Werk saam met uitstappiebesprekings as jy ook eilandtoere bedryf',
      ],
      forWhom: 'Eilandoordragoperateurs, kusbootoordragdienste, en oordragverskaffers vir oorde.',
    },
    de: {
      title: 'Software für Insel- und Bootstransfer-Betreiber',
      metaTitle: 'Buchungssoftware für Inseltransfers',
      metaDescription: 'Verwalten Sie Insel- und Bootstransferbuchungen, Bootsplanung und Kundenrechnungen — mit einer Plattform für Küsten- und Inseltourismusbetreiber.',
      keywords: ['Inseltransfer-Buchungssoftware', 'Bootstransfer-Verwaltungssystem', 'Küstentourismus-Buchungssoftware Afrika'],
      heroTagline: 'Bootsplanung und Transferbuchungen zusammen',
      intro: 'Insel- und Küstentransferbetreiber müssen wissen, welches Boot für welchen Transfer zu welcher Zeit eingeplant ist, bevor sie die nächste Buchung bestätigen. OpDesk erfasst Bootszuweisung und -zeitplan zu jedem gebuchten Transfer, plus die Gäste- und Abrechnungsseite des Geschäfts.',
      benefits: [
        'Bootsplanung mit Zuweisung pro Transfer',
        'Transferbuchungen mit Gästeanzahl und Timing',
        'Vermeiden Sie Doppelbuchungen eines Bootes bei überlappenden Transfers',
        'Kundenrechnungen und Zahlungsverfolgung',
        'Funktioniert zusammen mit Ausflugsbuchungen, falls Sie auch Inseltouren anbieten',
      ],
      forWhom: 'Inseltransfer-Betreiber, Küstenboottransferdienste und Resort-Transferanbieter.',
    },
    fr: {
      title: 'Logiciel pour Opérateurs de Transfert Insulaire et Bateau',
      metaTitle: 'Logiciel de Réservation de Transfert Insulaire',
      metaDescription: 'Gérez les réservations de transfert insulaire et en bateau, la planification des navires et la facturation client depuis une plateforme conçue pour les opérateurs touristiques côtiers et insulaires.',
      keywords: ['logiciel de réservation de transfert insulaire', 'système de gestion de transfert en bateau', 'logiciel de réservation de tourisme côtier Afrique'],
      heroTagline: 'Planification des navires et réservations de transfert ensemble',
      intro: "Les opérateurs de transfert insulaire et côtier doivent savoir quel navire est affecté à quel transfert, à quelle heure, avant de confirmer la réservation suivante. OpDesk suit l'affectation et le planning des navires pour chaque transfert réservé, ainsi que le volet client et facturation de l'activité.",
      benefits: [
        'Planification des navires avec affectation par transfert',
        'Réservations de transfert avec nombre de clients et horaires',
        'Évitez la double réservation d\'un navire sur des transferts qui se chevauchent',
        'Facturation client et suivi des paiements',
        'Fonctionne avec les réservations d\'excursion si vous proposez aussi des tours insulaires',
      ],
      forWhom: 'Opérateurs de transfert insulaire, services de transfert en bateau côtier, et prestataires de transfert pour hôtels.',
    },
    pt: {
      title: 'Software para Operadores de Transfer de Ilha e Barco',
      metaTitle: 'Software de Reservas de Transfer para Ilhas',
      metaDescription: 'Faça a gestão de reservas de transfer de ilha e barco, agendamento de embarcações e faturação de clientes a partir de uma plataforma construída para operadores turísticos costeiros e de ilha.',
      keywords: ['software de reservas de transfer de ilha', 'sistema de gestão de transfer de barco', 'software de reservas de turismo costeiro África'],
      heroTagline: 'Agendamento de embarcações e reservas de transfer juntos',
      intro: 'Os operadores de transfer de ilha e costeiros precisam de saber que embarcação está atribuída a que transfer, a que hora, antes de confirmarem a próxima reserva. A OpDesk rastreia a atribuição e o horário das embarcações contra cada transfer reservado, além do lado de hóspedes e faturação do negócio.',
      benefits: [
        'Agendamento de embarcações com atribuição por transfer',
        'Reservas de transfer com número de hóspedes e horários',
        'Evite reservar a mesma embarcação em transfers sobrepostos',
        'Faturação de clientes e rastreio de pagamentos',
        'Funciona junto com reservas de excursão, se também fizer tours de ilha',
      ],
      forWhom: 'Operadores de transfer de ilha, serviços de transfer de barco costeiro, e fornecedores de transfer para resorts.',
    },
  },
  'logistics-delivery-software': {
    en: {
      title: 'Software for Logistics & Delivery Businesses',
      metaTitle: 'Logistics & Delivery Management Software for African Businesses',
      metaDescription: 'Manage delivery clients, price lists, orders and statements from one platform, whether logistics is your whole business or a side operation.',
      keywords: ['logistics management software Africa', 'delivery business software', 'courier management system', 'delivery client statement software'],
      heroTagline: 'Clients, price lists, orders and statements in one place',
      intro: 'Whether logistics is your entire business or a delivery arm running alongside tours or transport, OpDesk\u2019s Logistics module covers the core workflow: a client directory, per-client price lists, an order log, and one-click statements — available as a standalone add-on on any plan.',
      benefits: [
        'Client directory with delivery addresses and contact details',
        'Per-client price lists for accurate quoting',
        'Order log tracking deliveries and their value',
        'One-click client statements as branded PDFs',
        'Available as an add-on regardless of your core business type',
      ],
      forWhom: 'Dedicated logistics and courier businesses, and any operator running delivery work alongside tours, transport or lodging.',
    },
    af: {
      title: 'Sagteware vir Logistiek- en Afleweringsbesighede',
      metaTitle: 'Logistiek- en Afleweringsbestuurprogrammatuur vir Afrika-besighede',
      metaDescription: 'Bestuur afleweringskliënte, pryslyste, bestellings en state vanaf een platform, of logistiek jou hele besigheid is of \'n newefunksie.',
      keywords: ['logistiekbestuurprogrammatuur Afrika', 'afleweringsbesigheid sagteware', 'koerierbestuurstelsel', 'afleweringskliëntstaat sagteware'],
      heroTagline: 'Kliënte, pryslyste, bestellings en state op een plek',
      intro: 'Of logistiek jou hele besigheid is of \'n afleweringstak wat langs toere of vervoer bedryf word, OpDesk se Logistiekmodule dek die kernwerksvloei: \'n kliëntegids, pryslyste per kliënt, \'n bestellingslog, en een-klik state — beskikbaar as \'n aparte byvoeging op enige plan.',
      benefits: [
        'Kliëntegids met afleweringsadresse en kontakbesonderhede',
        'Pryslyste per kliënt vir akkurate kwotasies',
        'Bestellingslog wat aflewerings en hul waarde opspoor',
        'Een-klik kliëntestate as handelsmerk-PDF\'s',
        'Beskikbaar as \'n byvoeging ongeag jou kernbesigheidstipe',
      ],
      forWhom: 'Toegewyde logistiek- en koerierbesighede, en enige operateur met afleweringswerk langs toere, vervoer of verblyf.',
    },
    de: {
      title: 'Software für Logistik- und Lieferunternehmen',
      metaTitle: 'Logistik- und Lieferverwaltungssoftware für afrikanische Unternehmen',
      metaDescription: 'Verwalten Sie Lieferkunden, Preislisten, Aufträge und Kontoauszüge über eine Plattform, egal ob Logistik Ihr gesamtes Geschäft oder ein Nebenbetrieb ist.',
      keywords: ['Logistikverwaltungssoftware Afrika', 'Software für Lieferunternehmen', 'Kurier-Verwaltungssystem', 'Software für Lieferkunden-Kontoauszüge'],
      heroTagline: 'Kunden, Preislisten, Aufträge und Kontoauszüge an einem Ort',
      intro: 'Ob Logistik Ihr gesamtes Geschäft ist oder ein Lieferzweig neben Touren oder Transport — das Logistikmodul von OpDesk deckt den Kernworkflow ab: ein Kundenverzeichnis, kundenspezifische Preislisten, ein Auftragsprotokoll, und Kontoauszüge per Klick — als eigenständiges Add-on auf jedem Tarif verfügbar.',
      benefits: [
        'Kundenverzeichnis mit Lieferadressen und Kontaktdaten',
        'Kundenspezifische Preislisten für genaue Angebote',
        'Auftragsprotokoll zur Erfassung von Lieferungen und deren Wert',
        'Kundenkontoauszüge per Klick als gebrandete PDFs',
        'Als Add-on verfügbar, unabhängig von Ihrem Kerngeschäft',
      ],
      forWhom: 'Reine Logistik- und Kurierunternehmen sowie jeder Betreiber mit Lieferarbeit neben Touren, Transport oder Unterkunft.',
    },
    fr: {
      title: 'Logiciel pour Entreprises de Logistique et de Livraison',
      metaTitle: 'Logiciel de Gestion de Logistique et Livraison pour Entreprises Africaines',
      metaDescription: "Gérez les clients de livraison, listes de prix, commandes et relevés depuis une plateforme, que la logistique soit toute votre activité ou une activité secondaire.",
      keywords: ['logiciel de gestion logistique Afrique', 'logiciel entreprise de livraison', 'système de gestion de messagerie', 'logiciel de relevé client de livraison'],
      heroTagline: 'Clients, listes de prix, commandes et relevés en un seul endroit',
      intro: "Que la logistique soit toute votre activité ou une branche de livraison exploitée aux côtés de circuits ou de transport, le module Logistique d'OpDesk couvre le flux de travail essentiel : un répertoire client, des listes de prix par client, un journal des commandes, et des relevés en un clic — disponible en option autonome sur n'importe quel forfait.",
      benefits: [
        'Répertoire client avec adresses de livraison et coordonnées',
        'Listes de prix par client pour une facturation précise',
        'Journal des commandes suivant les livraisons et leur valeur',
        'Relevés client en un clic sous forme de PDF à votre image de marque',
        'Disponible en option quel que soit votre type d\'activité principal',
      ],
      forWhom: "Entreprises de logistique et de messagerie dédiées, et tout opérateur ayant une activité de livraison aux côtés de circuits, transport ou hébergement.",
    },
    pt: {
      title: 'Software para Negócios de Logística e Entrega',
      metaTitle: 'Software de Gestão de Logística e Entrega para Negócios Africanos',
      metaDescription: 'Faça a gestão de clientes de entrega, listas de preços, encomendas e extratos a partir de uma plataforma, quer a logística seja todo o seu negócio ou uma operação secundária.',
      keywords: ['software de gestão de logística África', 'software de negócio de entregas', 'sistema de gestão de correio', 'software de extratos de clientes de entrega'],
      heroTagline: 'Clientes, listas de preços, encomendas e extratos num só lugar',
      intro: 'Quer a logística seja todo o seu negócio ou um braço de entregas a operar junto com tours ou transporte, o módulo de Logística da OpDesk cobre o fluxo de trabalho essencial: um diretório de clientes, listas de preços por cliente, um registo de encomendas, e extratos com um clique — disponível como extra autónomo em qualquer plano.',
      benefits: [
        'Diretório de clientes com moradas de entrega e detalhes de contacto',
        'Listas de preços por cliente para cotações precisas',
        'Registo de encomendas que rastreia entregas e o seu valor',
        'Extratos de clientes com um clique como PDFs personalizados',
        'Disponível como extra independentemente do seu tipo de negócio principal',
      ],
      forWhom: 'Negócios dedicados de logística e correio, e qualquer operador com trabalho de entrega junto com tours, transporte ou alojamento.',
    },
  },
  'river-boat-cruise-software': {
    en: {
      title: 'Software for River, Estuary & Dam Cruise Operators',
      metaTitle: 'Boat Cruise Booking Software for Rivers, Estuaries & Dams',
      metaDescription: 'Booking, vessel and guide management for river, estuary and dam cruise operators — the same software running St Lucia estuary boat cruises and Pongola Dam tiger fishing trips.',
      keywords: ['river cruise booking software', 'estuary boat cruise software', 'dam cruise management software', 'St Lucia boat cruise software', 'tiger fishing charter software', 'sightseeing cruise booking system'],
      heroTagline: 'Purpose-built for cruise operators on rivers, estuaries and dams',
      intro: 'St Lucia estuary boat cruises, hippo and croc-viewing trips, Pongola Dam tiger fishing outings — this kind of operator sits between a charter and a scheduled tour, usually running a smaller vessel for multiple short trips a day rather than one long charter. OpDesk\u2019s duration-based excursion bookings, vessel management, and guide/skipper assignment are built for exactly this pattern.',
      benefits: [
        'Duration-based cruise rate cards (e.g. 1-hour sunset cruise, half-day tiger fishing, full-day trips)',
        'Vessel management for your boats — assign the right vessel and skipper to each cruise slot',
        'Multiple short trips per day on one shared calendar, not just single all-day charters',
        'Guest count and safety briefing notes tracked per cruise',
        'Client invoicing and payment tracking, with your own branding on every document',
      ],
      forWhom: 'River, estuary and dam cruise operators, sightseeing boat trips, and freshwater fishing charter businesses like those on the St Lucia estuary or Pongola Dam.',
    },
    af: {
      title: 'Sagteware vir Rivier-, Riviermonding- en Damkruisoperateurs',
      metaTitle: 'Bootkruis-besprekingsagteware vir Riviere, Riviermondings en Damme',
      metaDescription: 'Bespreking-, vaartuig- en gidsbestuur vir rivier-, riviermonding- en damkruisoperateurs — dieselfde sagteware wat St Lucia riviermonding-bootkruisvaarte en Pongola Dam tieroorvissery-togte bedryf.',
      keywords: ['rivierkruisvaart besprekingsagteware', 'riviermonding bootkruisvaart sagteware', 'dam kruisvaart bestuurprogrammatuur', 'St Lucia bootkruisvaart sagteware', 'tieroorvissery huurboot sagteware', 'besienswaardigheid kruisvaart besprekingstelsel'],
      heroTagline: 'Doelgebou vir kruisvaartoperateurs op riviere, riviermondings en damme',
      intro: 'St Lucia riviermonding-bootkruisvaarte, seekoei- en krokodyl-kykuittogte, Pongola Dam tieroorvissery-uitstappies — hierdie tipe operateur sit tussen \'n huurboot en \'n geskeduleerde toer, en bedryf gewoonlik \'n kleiner vaartuig vir verskeie kort togte per dag eerder as een lang huurboottogt. OpDesk se duurtegebaseerde uitstappiebesprekings, vaartuigbestuur, en gids-/kaptein-toewysing is presies hiervoor gebou.',
      benefits: [
        'Duurtegebaseerde kruisvaart-tariewe (bv. 1-uur sonsondergangkruisvaart, halfdag tieroorvissery, volledige-dag togte)',
        'Vaartuigbestuur vir jou bote — wys die regte vaartuig en kaptein aan elke kruisvaartgleuf toe',
        'Verskeie kort togte per dag op een gedeelde kalender, nie net enkel heeldag-huurbote nie',
        'Gastetal en veiligheidbriefing-notas opgespoor per kruisvaart',
        'Kliëntefakturering en betalingopsporing, met jou eie handelsmerk op elke dokument',
      ],
      forWhom: 'Rivier-, riviermonding- en damkruisoperateurs, besienswaardigheid-bootogte, en varswater-visvangs-huurbotebesighede soos dié op die St Lucia riviermonding of Pongola Dam.',
    },
    de: {
      title: 'Software für Fluss-, Ästuar- und Stausee-Kreuzfahrtanbieter',
      metaTitle: 'Bootskreuzfahrt-Buchungssoftware für Flüsse, Ästuare & Stauseen',
      metaDescription: 'Buchungs-, Boots- und Guide-Verwaltung für Fluss-, Ästuar- und Stausee-Kreuzfahrtanbieter — dieselbe Software, die St-Lucia-Ästuar-Bootstouren und Pongola-Stausee-Tigerfisch-Ausflüge betreibt.',
      keywords: ['Flusskreuzfahrt-Buchungssoftware', 'Ästuar-Bootstour-Software', 'Stausee-Kreuzfahrt-Verwaltungssoftware', 'St-Lucia-Bootstour-Software', 'Tigerfisch-Charter-Software', 'Buchungssystem für Sightseeing-Kreuzfahrten'],
      heroTagline: 'Speziell für Kreuzfahrtanbieter auf Flüssen, Ästuaren und Stauseen',
      intro: 'St-Lucia-Ästuar-Bootstouren, Nilpferd- und Krokodilbeobachtungsfahrten, Pongola-Stausee-Tigerfisch-Ausflüge — dieser Betreibertyp liegt zwischen einem Charter und einer geplanten Tour, meist mit einem kleineren Boot für mehrere kurze Fahrten pro Tag statt eines langen Charters. Die dauerbasierten Ausflugsbuchungen, die Bootsverwaltung und die Guide-/Skipper-Zuweisung von OpDesk sind genau für dieses Muster gebaut.',
      benefits: [
        'Dauerbasierte Kreuzfahrttarife (z. B. 1-stündige Sonnenuntergangsfahrt, halbtägiges Tigerfischen, Ganztagestouren)',
        'Bootsverwaltung — weisen Sie jedem Kreuzfahrttermin das richtige Boot und den richtigen Skipper zu',
        'Mehrere kurze Fahrten pro Tag in einem gemeinsamen Kalender, nicht nur einzelne Ganztagescharter',
        'Gästeanzahl und Sicherheitshinweise pro Fahrt erfasst',
        'Kundenrechnungen und Zahlungsverfolgung, mit Ihrem eigenen Branding auf jedem Dokument',
      ],
      forWhom: 'Fluss-, Ästuar- und Stausee-Kreuzfahrtanbieter, Sightseeing-Bootstouren, und Süßwasser-Angelcharter-Unternehmen wie am St-Lucia-Ästuar oder Pongola-Stausee.',
    },
    fr: {
      title: 'Logiciel pour Opérateurs de Croisières Fluviales, d\'Estuaire et de Barrage',
      metaTitle: 'Logiciel de Réservation de Croisières en Bateau pour Rivières, Estuaires et Barrages',
      metaDescription: 'Gestion des réservations, navires et guides pour les opérateurs de croisières fluviales, d\'estuaire et de barrage — le même logiciel qui gère les croisières de l\'estuaire de Sainte-Lucie et les sorties de pêche au tigre du barrage de Pongola.',
      keywords: ['logiciel de réservation de croisière fluviale', 'logiciel de croisière en bateau d\'estuaire', 'logiciel de gestion de croisière de barrage', 'logiciel de croisière Sainte-Lucie', 'logiciel de charter de pêche au tigre', 'système de réservation de croisière touristique'],
      heroTagline: 'Conçu spécifiquement pour les opérateurs de croisières sur rivières, estuaires et barrages',
      intro: "Les croisières de l'estuaire de Sainte-Lucie, les sorties d'observation des hippopotames et crocodiles, les excursions de pêche au tigre du barrage de Pongola — ce type d'opérateur se situe entre le charter et le circuit programmé, exploitant généralement un plus petit navire pour plusieurs courtes sorties par jour plutôt qu'un long charter. Les réservations d'excursion par durée, la gestion des navires et l'affectation guide/skipper d'OpDesk sont conçues exactement pour ce modèle.",
      benefits: [
        'Grilles tarifaires de croisière par durée (ex. croisière coucher de soleil 1h, pêche au tigre demi-journée, sorties journée complète)',
        'Gestion des navires — affectez le bon navire et le bon skipper à chaque créneau de croisière',
        'Plusieurs sorties courtes par jour sur un calendrier partagé, pas seulement des charters journée complète',
        'Nombre de clients et notes de briefing sécurité suivis par croisière',
        'Facturation client et suivi des paiements, avec votre image de marque sur chaque document',
      ],
      forWhom: "Opérateurs de croisières fluviales, d'estuaire et de barrage, sorties touristiques en bateau, et entreprises de charter de pêche en eau douce comme celles de l'estuaire de Sainte-Lucie ou du barrage de Pongola.",
    },
    pt: {
      title: 'Software para Operadores de Cruzeiros de Rio, Estuário e Barragem',
      metaTitle: 'Software de Reservas de Cruzeiros de Barco para Rios, Estuários e Barragens',
      metaDescription: 'Gestão de reservas, embarcações e guias para operadores de cruzeiros de rio, estuário e barragem — o mesmo software que gere os cruzeiros do estuário de Santa Lúcia e as saídas de pesca ao tigre da barragem de Pongola.',
      keywords: ['software de reservas de cruzeiro de rio', 'software de cruzeiro de barco de estuário', 'software de gestão de cruzeiro de barragem', 'software de cruzeiro Santa Lúcia', 'software de charter de pesca ao tigre', 'sistema de reservas de cruzeiro turístico'],
      heroTagline: 'Feito especificamente para operadores de cruzeiros em rios, estuários e barragens',
      intro: 'Os cruzeiros do estuário de Santa Lúcia, as saídas de observação de hipopótamos e crocodilos, as excursões de pesca ao tigre da barragem de Pongola — este tipo de operador situa-se entre um charter e um tour agendado, normalmente operando uma embarcação menor para várias saídas curtas por dia em vez de um único charter longo. As reservas de excursão por duração, a gestão de embarcações e a atribuição de guia/skipper da OpDesk são construídas exatamente para este padrão.',
      benefits: [
        'Tabelas de preços de cruzeiro por duração (ex. cruzeiro do pôr do sol de 1 hora, pesca ao tigre de meio dia, saídas de dia inteiro)',
        'Gestão de embarcações — atribua a embarcação e o skipper certos a cada horário de cruzeiro',
        'Várias saídas curtas por dia num calendário partilhado, não apenas charters de dia inteiro',
        'Número de hóspedes e notas de briefing de segurança rastreados por cruzeiro',
        'Faturação de clientes e rastreio de pagamentos, com a sua marca em cada documento',
      ],
      forWhom: 'Operadores de cruzeiros de rio, estuário e barragem, passeios turísticos de barco, e negócios de charter de pesca de água doce como os do estuário de Santa Lúcia ou da barragem de Pongola.',
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
