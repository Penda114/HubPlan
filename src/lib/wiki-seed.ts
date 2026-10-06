import { prisma } from "./db";

const GUIDE_HUBPLAN = `# Guide HubPlan

HubPlan est l'espace de travail de l'équipe pour produire le jeu. Il regroupe le suivi des tâches,
le temps passé, la documentation et les décisions collectives.

## Se connecter

Clique sur **Se connecter** puis autorise l'accès avec ton compte GitHub. Tu rejoins
automatiquement le projet de l'équipe, sans création de compte supplémentaire.

## Le tableau des tâches

Chaque tâche porte :

- un **type** : Tâche, Récit utilisateur, Anomalie ou Fonctionnalité ;
- une **importance** : Critique, Haute, Moyenne ou Basse (visible par le liseré de couleur) ;
- une **colonne** : Planifié, En cours, En test, Terminé.

Par défaut, le tableau n'affiche que **tes** tâches. Le menu « Afficher » permet de consulter les
tâches d'un autre membre ou de toute l'équipe. Glisse une carte d'une colonne à l'autre pour
changer son état.

## Le suivi du temps

Le temps se compte **automatiquement**. Ouvre la tâche sur laquelle tu travailles : tant que la
fenêtre reste ouverte et que tu es actif, le chronomètre avance. Dès que tu changes d'onglet, que
tu deviens inactif ou que tu fermes la page, le comptage s'arrête. Aucune saisie manuelle n'est
nécessaire.

## Les sprints

La page **Sprints** liste les itérations et les jalons de la feuille de route. Un sprint a une date
d'échéance ; l'accueil affiche le temps restant pour le sprint en cours.

## Le modèle de conception

La page **Modèle de conception** décrit les mécaniques, niveaux et personnages du jeu, et les
rattache aux tâches de production.

## La documentation (wiki)

La page **Documentation** permet de rédiger des pages en Markdown, avec aperçu en direct. Les
images s'ajoutent via leur URL (voir la FAQ).

## Les médias

La page **Médias** centralise les images et ressources partagées. Elle stocke les liens vers les
fichiers plutôt que les fichiers eux-mêmes.

## Les propositions et les votes

La page **Propositions** sert à soumettre une idée d'ajout au jeu, avec la liste des tâches
nécessaires. Les membres votent Oui ou Non ; l'idée est adoptée à la majorité absolue.

## Les requêtes

La page **Requêtes** regroupe les tickets internes : une demande, un fil de discussion et un
statut.`;

const FAQ = `# FAQ

## Comment proposer une idée et la faire voter ?

Ouvre **Propositions**, clique sur « Nouvelle proposition », donne un titre et une description,
puis liste les **tâches précises** que l'idée implique (et, si tu veux, les membres à qui les
déléguer). Les autres membres votent **Oui** ou **Non**, avec un commentaire facultatif.

*Exemple :* « Ajouter un mode deux joueurs » — tâches : « Écran de sélection du joueur »,
« Synchroniser les deux manettes ».

## Combien de votes faut-il pour adopter une proposition ?

La majorité absolue, soit **3 votes Oui sur 5**. Le proposeur compte automatiquement pour un Oui.
Dès que le seuil est atteint, la proposition est adoptée et ses tâches rejoignent le tableau.

## Comment voter ?

Ouvre la proposition et choisis **Oui** ou **Non**. Tu peux justifier ton choix dans le champ
commentaire, par exemple : « Oui, c'est rapide et ça valorise le niveau 2 ».

## Comment logger mon temps ?

Rien à faire : ouvre la tâche sur laquelle tu travailles et laisse l'onglet actif. Le temps
s'additionne tant que la page reste visible et que tu utilises ton clavier ou ta souris. Si tu
t'absentes plus d'une minute ou que tu changes d'onglet, le compteur se met en pause.

## Comment ajouter une image à la documentation ?

Ouvre **Médias**, colle l'URL de l'image (hébergée par exemple sur Imgur ou dans le dépôt GitHub),
donne-lui un titre, puis clique sur « Copier le Markdown ». Colle ensuite cette ligne dans la page
de documentation voulue, à la position souhaitée.

## Comment consulter le travail d'un coéquipier ?

Sur le tableau, utilise le menu « Afficher » et choisis son nom. Sélectionne « Toute l'équipe »
pour revenir à une vue globale.

## Comment créer une requête pour l'équipe ?

Ouvre **Requêtes**, clique sur « Nouvelle requête », décris ta demande, puis suis la discussion
dans le fil de commentaires jusqu'à sa résolution.`;

const DEFAULTS = [
  { slug: "guide-hubplan", title: "Guide HubPlan", content: GUIDE_HUBPLAN },
  { slug: "faq", title: "FAQ", content: FAQ },
];

/** Crée les pages de documentation par défaut si elles n'existent pas encore. */
export async function ensureDefaultWiki(
  projectId: string,
  authorId: string | null,
): Promise<void> {
  for (const page of DEFAULTS) {
    const existing = await prisma.wikiPage.findUnique({
      where: { projectId_slug: { projectId, slug: page.slug } },
      select: { id: true },
    });
    if (!existing) {
      await prisma.wikiPage.create({ data: { projectId, authorId, ...page } });
    }
  }
}
