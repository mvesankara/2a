import { Link } from "react-router-dom"

const articles = [
  {
    id: 1,
    title: "Lancement de notre première initiative sociale",
    summary: "Retour sur notre tout premier projet de terrain au sein de la communauté.",
  },
  {
    id: 2,
    title: "Assemblée Générale 2025 : ce qu’il faut retenir",
    summary: "Décisions, perspectives et échanges clés de notre AG annuelle.",
  },
  {
    id: 3,
    title: "Portrait : rencontre avec un membre engagé",
    summary: "Découvrez le parcours inspirant d’un bénévole actif.",
  },
]

const News = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-center">Actualités</h1>
      {articles.map((article) => (
        <div key={article.id} className="border-b pb-4">
          <h2 className="text-2xl font-semibold">{article.title}</h2>
          <p className="text-muted-foreground">{article.summary}</p>
        </div>
      ))}
    </div>
  )
}

export default News