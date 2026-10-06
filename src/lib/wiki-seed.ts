import { prisma } from "./db";

const GUIDE_HUBPLAN = `# Guide HubPlan

HubPlan est l'espace de travail de l'équipe pour produire le jeu. Il n'existe **qu'un seul
projet** : toutes les personnes qui se connectent avec GitHub arrivent directement dedans, sans
invitation ni code à saisir.

Chaque section ci-dessous explique **à quoi elle sert** et donne **un cas concret** d'utilisation.

## Se connecter

**À quoi ça sert :** accéder à l'espace commun avec ton compte GitHub, sans créer de mot de passe.
Aucune invitation n'est nécessaire : se connecter suffit pour être rattaché au projet.

> **Cas concret :** Penda ajoute un camarade comme collaborateur sur le dépôt GitHub du jeu. Le
> camarade ouvre HubPlan, clique sur « Se connecter », autorise GitHub — il est déjà membre du
> projet.

## Le tableau des tâches

**À quoi ça sert :** savoir qui fait quoi, où en est chaque tâche, et ce qu'il reste à faire.

Chaque tâche a un **type** (Tâche, Récit utilisateur, Anomalie, Fonctionnalité), une
**importance** et une **colonne** : Planifié, En cours, En test, Terminé.

L'importance se lit sur le **liseré de couleur** à gauche de la carte (rouge = critique,
orange = haute, jaune = moyenne, vert = basse).

> **Cas concret :** tu dois coder le saut du personnage. Tu crées une tâche « Saut du personnage »,
> type Tâche, importance Haute, colonne Planifié, et tu t'assignes. Quand tu commences à coder, tu
> glisses la carte vers « En cours » ; une fois la chose testée, vers « Terminé ».

> **Cas concret (urgence) :** le jeu plante au lancement. Tu crées une « Anomalie » en importance
> Critique : son liseré rouge la rend visible immédiatement par toute l'équipe.

**Voir le travail des autres.** Par défaut, le tableau n'affiche que **tes** tâches. Le menu
« Afficher » permet de choisir un coéquipier ou « Toute l'équipe », et de revenir à « Mes tâches ».

> **Cas concret :** la veille d'un rendu, ouvre le menu « Afficher » et choisis le nom d'un
> coéquipier pour vérifier ce qu'il lui reste à faire.

## Le suivi du temps

**À quoi ça sert :** mesurer le temps réellement passé, sans que personne ait à le saisir.

Tu n'as rien à démarrer : ouvre la fiche de la tâche sur laquelle tu travailles et laisse l'onglet
actif. Le compteur s'arrête dès que l'onglet passe en arrière-plan, que tu restes inactif plus
d'une minute, ou que tu fermes la fenêtre — ce temps-là n'est pas compté.

> **Cas concret :** tu travailles 40 minutes sur « Créer le menu principal » sans quitter l'onglet,
> puis tu passes sur Discord plus de deux minutes : seules les 40 minutes sont enregistrées.

> **Cas concret (temps non compté) :** si rien ne s'enregistre, vérifie que la **fiche de la tâche
> est bien ouverte** et que l'onglet HubPlan est **visible et actif**.

## Les sprints et les jalons

**À quoi ça sert :** découper la production en périodes courtes, avec une date d'échéance.

Dans **Sprints**, renseigne « Début » et « Échéance » sur le sprint concerné, puis clique sur
« Dates ». Le sprint en cours et son décompte apparaissent sur l'accueil. Un jalon regroupe
plusieurs sprints autour d'un objectif (Alpha, démo, rendu…).

> **Cas concret :** vous visez une démo pour le 15 décembre. Tu mets « Début : 1er décembre » et
> « Échéance : 15 décembre » : l'accueil affiche alors « 12 jours restants » pour toute l'équipe.

## Les métriques

**À quoi ça sert :** suivre l'avancement global et repérer les déséquilibres avant qu'ils ne
posent problème.

> **Cas concret :** cinq minutes avant la réunion, ouvre **Métriques** : tu vois la répartition par
> colonne, par discipline et par personne. Si quelqu'un cumule 8 tâches et un autre 0, vous
> répartissez autrement.

## Le modèle de conception

**À quoi ça sert :** décrire le jeu lui-même (mécaniques, niveaux, personnages, narration) et
relier chaque élément aux tâches de production.

> **Cas concret :** tu crées l'élément « Double saut » de type « Mécanique », puis tu rattaches la
> tâche « Implémenter le double saut » à cet élément. En cliquant sur la mécanique, l'équipe voit
> tout le travail associé.

## La documentation

**À quoi ça sert :** écrire les règles du jeu, la narration, les commandes, les décisions — dans
des pages modifiables depuis le navigateur, en Markdown, avec aperçu.

Pour insérer une image, colle simplement son URL dans la page au format
\`![description](url)\` (l'image peut être hébergée sur Imgur ou dans le dépôt GitHub).

> **Cas concret :** tu rédiges la page « Boucle de gameplay » : le déroulé d'une partie, les
> touches, les conditions de victoire, et tu y ajoutes l'écran de sélection des personnages avec
> \`![Écran de sélection](https://exemple.fr/ecran.png)\`.

## Les propositions et les votes

**À quoi ça sert :** décider ensemble des ajouts au jeu, sans réunion interminable.

Une proposition doit obligatoirement lister les **tâches précises** qu'elle implique, et peut
proposer des **délégations**. Chaque membre vote **Oui** ou **Non**, avec un commentaire s'il le
souhaite, et peut changer son vote tant que la proposition n'est pas tranchée. Le proposeur compte
d'office pour un Oui, donc **deux autres Oui** suffisent pour atteindre la majorité absolue
(3 sur 5).

> **Cas concret :** Tom propose « Mode deux joueurs » avec deux tâches (« Écran de sélection du
> joueur », « Synchroniser les deux manettes »). Léa et Penda votent Oui : la proposition est
> adoptée et les deux tâches apparaissent automatiquement sur le tableau, assignées aux membres
> proposés en délégation.

## Les requêtes

**À quoi ça sert :** faire une demande particulière à l'équipe et en garder la trace.

> **Cas concret :** le jeu ne se lance pas sur les PC de la salle. Tu ouvres une **Requête**
> intitulée « Le jeu ne démarre pas en salle 204 », tu l'assignes à Sam, vous discutez dans le fil
> de messages, puis vous passez le statut à « Résolue ».

## Les commits du dépôt

**À quoi ça sert :** voir qui a poussé quoi sur le dépôt du jeu, sans ouvrir GitHub.

La page **Commits** met en avant le **dernier commit** (auteur, message, date, numéro court,
avec un lien vers GitHub) et liste les précédents.

> **Cas concret :** en réunion, tu ouvres **Commits** : le dernier commit est « Ajouter le saut du
> personnage » par Léa, il y a 2 h — tu sais immédiatement où en est le code.

## La sauvegarde

**À quoi ça sert :** conserver une copie complète des données du projet.

Depuis **Documentation**, tu peux télécharger un export JSON complet ou l'envoyer sur le dépôt
GitHub. Une sauvegarde automatique y est aussi déposée chaque nuit.

> **Cas concret :** la veille de la soutenance, tu cliques sur « Sauvegarder sur GitHub » : une
> copie datée du projet est commitée sur le dépôt. Si la base est perdue, le fichier JSON permet de
> retrouver tout le contenu.

---

*La page « Guide HubPlan » est fournie par l'application et remise à jour automatiquement. Pour
écrire ta propre documentation, crée une nouvelle page.*`;

const DEFAULTS = [{ slug: "guide-hubplan", title: "Guide HubPlan", content: GUIDE_HUBPLAN }];

/** Anciennes pages fournies par l'application, retirées depuis. */
const OBSOLETE_SLUGS = ["faq"];

/**
 * Crée la page de documentation fournie par l'application, la met à jour si son
 * contenu a changé, et supprime les pages par défaut devenues obsolètes.
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

  for (const slug of OBSOLETE_SLUGS) {
    await prisma.wikiPage.deleteMany({ where: { projectId, slug } });
  }
}
