import { prisma } from "./db";

const GUIDE_HUBPLAN = `# Guide HubPlan

HubPlan est l'espace de travail de l'équipe pour produire le jeu. Il n'existe **qu'un seul
projet** : toutes les personnes qui se connectent avec GitHub arrivent directement dedans, sans
invitation ni code à saisir.

Chaque section ci-dessous explique **à quoi elle sert** et donne **un cas concret** d'utilisation.

## Se connecter

**À quoi ça sert :** accéder à l'espace commun avec ton compte GitHub, sans créer de mot de passe.

> **Cas concret :** Penda ajoute un camarade comme collaborateur sur le dépôt GitHub du jeu. Le
> camarade ouvre HubPlan, clique sur « Se connecter », autorise GitHub, et il est déjà membre du
> projet — rien d'autre à faire.

## Le tableau des tâches

**À quoi ça sert :** savoir qui fait quoi, où en est chaque tâche, et ce qu'il reste à faire.

Chaque tâche a un **type** (Tâche, Récit utilisateur, Anomalie, Fonctionnalité), une
**importance** et une **colonne** : Planifié, En cours, En test, Terminé.

L'importance se lit sur le **liseré de couleur** à gauche de la carte (rouge = critique,
orange = haute, jaune = moyenne, vert = basse).

> **Cas concret :** tu dois coder le saut du personnage. Tu crées une tâche « Saut du
> personnage », type Tâche, importance Haute, colonne Planifié, et tu t'assignes. Quand tu
> commences à coder, tu glisses la carte de « Planifié » vers « En cours ». Quand c'est fini et
> testé, tu la passes en « Terminé ».

> **Cas concret (urgence) :** le jeu plante au lancement. Tu crées une « Anomalie » en importance
> Critique : son liseré rouge la rend visible immédiatement.

**Voir le travail des autres.** Par défaut, le tableau n'affiche que **tes** tâches.

> **Cas concret :** la veille d'un rendu, ouvre le menu « Afficher » et choisis le nom d'un
> coéquipier pour vérifier ce qu'il lui reste à faire ; choisis « Toute l'équipe » pour la vue
> globale.

## Le suivi du temps

**À quoi ça sert :** mesurer le temps réellement passé, sans que personne ait à le saisir.

Le compteur avance **tout seul** quand la tâche est ouverte et que l'onglet reste actif. Dès que
tu changes d'onglet, que tu t'absentes plus d'une minute ou que tu fermes la page, il se met en
pause.

> **Cas concret :** tu ouvres la tâche « Menu principal » et tu travailles 25 minutes sans quitter
> l'onglet : 25 minutes sont enregistrées sur la tâche. Tu descends manger sans fermer le PC : au
> bout d'une minute sans activité, le compteur s'arrête et ce temps n'est pas compté.

> **Cas concret (bilan) :** dans **Métriques**, le tableau « Charge par personne » montre que Léa
> a passé 6 h sur le niveau 1 et Sam 30 min : vous en parlez en réunion.

## Les sprints et les jalons

**À quoi ça sert :** découper la production en périodes courtes, avec une date d'échéance.

> **Cas concret :** vous visez une démo pour le 15 décembre. Dans **Sprints**, tu renseignes
> « Début : 1er décembre » et « Échéance : 15 décembre » sur le sprint en cours. L'accueil affiche
> alors « 12 jours restants », visible par toute l'équipe.

## Les métriques

**À quoi ça sert :** suivre l'avancement global et repérer les déséquilibres avant qu'ils ne
posent problème.

> **Cas concret :** cinq minutes avant la réunion d'équipe, ouvre **Métriques** : tu vois la
> répartition par colonne, par discipline et par personne. Si une personne cumule 8 tâches et une
> autre 0, vous répartissez autrement.

## Le modèle de conception

**À quoi ça sert :** décrire le jeu lui-même (mécaniques, niveaux, personnages, narration) et
relier chaque élément aux tâches de production.

> **Cas concret :** tu crées l'élément « Double saut » de type « Mécanique », puis tu rattaches la
> tâche « Implémenter le double saut » à cet élément. En cliquant sur la mécanique, l'équipe voit
> tout le travail associé.

## La documentation

**À quoi ça sert :** écrire les règles du jeu, la narration, les commandes, les décisions — dans
des pages modifiables depuis le navigateur, en Markdown (avec aperçu).

> **Cas concret :** tu rédiges la page « Boucle de gameplay » : le déroulé d'une partie, les
> touches, les conditions de victoire. Chaque modification est enregistrée et datée.

**Insérer une image.** Colle simplement l'URL de l'image dans la page, au format Markdown.

> **Cas concret :** tu écris \`![Écran de sélection des personnages](https://exemple.fr/ecran.png)\`
> dans la page : l'image s'affiche dans la documentation.

## Les propositions et les votes

**À quoi ça sert :** décider ensemble des ajouts au jeu, sans réunion interminable.

Une proposition doit obligatoirement lister les **tâches précises** qu'elle implique, et peut
proposer des **délégations**. Chaque membre vote **Oui** ou **Non**, avec un commentaire s'il le
souhaite. Le proposeur compte d'office pour un Oui. La proposition est adoptée à la **majorité
absolue** (3 Oui sur 5).

> **Cas concret :** Tom propose « Mode deux joueurs » avec deux tâches (« Écran de sélection du
> joueur », « Synchroniser les deux manettes »). Son vote compte pour un Oui. Si Léa et Penda
> votent Oui, la proposition est adoptée et les deux tâches apparaissent automatiquement sur le
> tableau, assignées aux membres proposés en délégation.

## Les requêtes

**À quoi ça sert :** faire une demande particulière à l'équipe et en garder la trace.

> **Cas concret :** le jeu ne se lance pas sur les PC de la salle. Tu ouvres une **Requête**
> intitulée « Le jeu ne démarre pas en salle 204 », tu l'assignes à Sam, vous discutez dans le fil
> de messages, puis vous passez le statut à « Résolue ».

## La sauvegarde

**À quoi ça sert :** conserver une copie complète des données du projet.

Depuis **Documentation**, tu peux télécharger un export JSON complet ou l'envoyer sur le dépôt
GitHub. Une sauvegarde automatique est aussi déposée chaque nuit sur le dépôt.

> **Cas concret :** la veille de la soutenance, tu cliques sur « Sauvegarder sur GitHub » : une
> copie datée du projet est commitée sur le dépôt. Si la base est perdue, le fichier JSON permet
> de retrouver tout le contenu.

---

*Les pages « Guide HubPlan » et « FAQ » sont fournies par l'application et remises à jour
automatiquement. Pour écrire ta propre documentation, crée une nouvelle page.*`;

const FAQ = `# FAQ

## Comment rejoindre le projet ?

Connecte-toi avec ton compte GitHub, c'est tout. Il n'y a qu'un seul projet dans HubPlan et tu y
es rattaché automatiquement dès ta première connexion.

## Comment logger mon temps ?

Tu n'as rien à saisir : ouvre la tâche sur laquelle tu travailles et laisse l'onglet actif. Le
temps s'additionne tant que la page reste visible et que tu utilises ton clavier ou ta souris.

*Exemple :* tu travailles 40 minutes sur « Créer le menu principal » sans quitter l'onglet, puis
tu passes sur Discord plus de 2 minutes : seules les 40 minutes sont comptées.

## Pourquoi mon temps ne s'enregistre pas ?

Vérifie que la **tâche est ouverte** (la fiche de la tâche) et que l'onglet HubPlan est bien
**visible et actif**. Un onglet en arrière-plan, une session inactive ou une fenêtre fermée
mettent le compteur en pause.

## Comment proposer une idée et la faire voter ?

Ouvre **Propositions**, clique sur « Nouvelle proposition », décris l'idée, puis liste les
**tâches précises** qu'elle demande (obligatoire). Tu peux cocher des membres en délégation.

*Exemple :* « Ajouter un menu pause » avec les tâches « Écran de pause » et « Reprendre la partie ».

## Combien de votes faut-il pour adopter une proposition ?

La majorité absolue : **3 votes Oui sur 5**. Ton propre vote de proposeur compte d'office pour un
Oui, donc il faut deux autres Oui.

## Comment voter ?

Ouvre la proposition et choisis **Oui** ou **Non**. Tu peux justifier ton choix dans le
commentaire — par exemple : « Oui, ça se fait en une soirée et ça améliore l'expérience ».

Puis-je changer mon vote ? Oui, tant que la proposition est encore en vote et n'a pas atteint le
seuil.

## Comment ajouter une image à la documentation ?

Colle l'URL de l'image (par exemple hébergée sur Imgur ou dans le dépôt GitHub) directement dans
la page, au format \`![description](url)\`.

*Exemple :* \`![Maquette du HUD](https://exemple.fr/hud.png)\`

## Comment consulter le travail d'un coéquipier ?

Sur le tableau, ouvre le menu « Afficher » et choisis son nom. « Toute l'équipe » affiche
l'ensemble des tâches ; « Mes tâches » revient à ta vue personnelle.

## Comment régler la date de fin du sprint ?

Dans **Sprints**, renseigne « Début » et « Échéance » sur le sprint concerné, puis clique sur
« Dates ». Le décompte apparaît immédiatement sur l'accueil.

## Comment créer une requête pour l'équipe ?

Ouvre **Requêtes**, clique dans le formulaire, décris ta demande, choisis éventuellement un
membre à assigner, puis suis la discussion dans le fil jusqu'à sa résolution.

## Comment sauvegarder le projet ?

Dans **Documentation**, clique sur « Sauvegarder sur GitHub » (copie commitée sur le dépôt) ou sur
« Télécharger l'export JSON ». Une sauvegarde automatique est également faite chaque nuit.

## Où sont passées les médiathèques et la gestion de plusieurs projets ?

HubPlan ne gère qu'un seul projet — celui de l'équipe — et les images sont insérées directement
par leur URL dans la documentation. Cela évite les doublons et garde l'interface simple.`;

const DEFAULTS = [
  { slug: "guide-hubplan", title: "Guide HubPlan", content: GUIDE_HUBPLAN },
  { slug: "faq", title: "FAQ", content: FAQ },
];

/**
 * Crée les pages de documentation par défaut, et les met à jour si leur contenu
 * fourni par l'application a changé (ces deux pages ne sont pas personnalisables).
 */
export async function ensureDefaultWiki(
  projectId: string,
  authorId: string | null,
): Promise<void> {
  for (const page of DEFAULTS) {
    const existing = await prisma.wikiPage.findUnique({
      where: { projectId_slug: { projectId, slug: page.slug } },
      select: { id: true, title: true, content: true },
    });
    if (!existing) {
      await prisma.wikiPage.create({ data: { projectId, authorId, ...page } });
    } else if (existing.title !== page.title || existing.content !== page.content) {
      await prisma.wikiPage.update({
        where: { id: existing.id },
        data: { title: page.title, content: page.content },
      });
    }
  }
}
