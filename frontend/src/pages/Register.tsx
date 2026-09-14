import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [pseudo, setPseudo] = useState('')
  const [level, setLevel] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(pseudo, password, level)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex justify-center bg-base">
      <div className="w-full max-w-[480px] flex flex-col items-center justify-center px-6">
        <Logo size={72} />
        <h1 className="text-2xl font-bold mt-4">Créer un compte</h1>
        <p className="text-sm text-gray-500 mt-1">Rejoignez la communauté SUP'PTIC</p>

        <form onSubmit={handleSubmit} className="w-full mt-8 space-y-3">
          {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{error}</div>}
          <input
            type="text"
            placeholder="Pseudo unique"
            value={pseudo}
            onChange={e => setPseudo(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-line outline-none focus:border-brand transition-colors"
          />
          <select
            value={level}
            onChange={e => setLevel(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-line outline-none focus:border-brand transition-colors"
          >
            <option value="">Sélectionner votre niveau</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="M1">M1</option>
            <option value="M2">M2</option>
          </select>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-line outline-none focus:border-brand transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-ink text-surface font-medium disabled:opacity-50 transition-opacity"
          >
            {loading ? 'Inscription...' : "S'inscrire"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6">
          Déjà un compte ? <Link to="/login" className="text-brand-dark font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
