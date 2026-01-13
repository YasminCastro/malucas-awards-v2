"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function SignupPage() {
  const router = useRouter();
  const [instagram, setInstagram] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [userVerified, setUserVerified] = useState(false);

  const supportLink = process.env.NEXT_PUBLIC_SUPPORT_LINK;

  const handleCheckUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorType(null);

    if (!instagram.trim()) {
      setError("Por favor, digite seu Instagram");
      return;
    }

    setChecking(true);

    try {
      const response = await fetch("/api/auth/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ instagram: instagram.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "USER_NOT_FOUND") {
          setErrorType("USER_NOT_FOUND");
          setError("");
        } else {
          setError(data.error || data.message || "Erro ao verificar usuário");
        }
        setChecking(false);
        return;
      }

      setUserVerified(true);
      setChecking(false);
      setErrorType(null);
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      setErrorType(null);
      setChecking(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ instagram: instagram.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao definir senha");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      setLoading(false);
    }
  };

  const handleBack = () => {
    setUserVerified(false);
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border-4 border-black rounded-lg p-8 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-4xl font-bold text-black uppercase tracking-tight">
              MALUCAS AWARDS
            </h1>
            <p className="text-black font-medium">
              {userVerified
                ? "Defina sua senha"
                : "Primeiro acesso: verifique seu cadastro"}
            </p>
            {!userVerified && (
              <p className="text-sm text-black/70">
                Você deve estar pré-cadastrado para definir sua senha
              </p>
            )}
          </div>

          {!userVerified ? (
            <form onSubmit={handleCheckUser} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="instagram"
                  className="text-black font-bold text-sm uppercase"
                >
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  type="text"
                  placeholder="@seuinstagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  className="bg-white border-2 border-black text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-black rounded-md h-12"
                  required
                  disabled={checking}
                />
              </div>
              {errorType === "USER_NOT_FOUND" && (
                <div className="text-black text-sm bg-red-50 border-2 border-red-600 rounded-md p-4 space-y-3">
                  <p className="font-medium text-red-600">
                    Usuário não encontrado
                  </p>
                  <p className="text-sm">
                    Para ter acesso à votação, você deve fazer parte do grupo
                    das Malucas.
                  </p>
                  <p className="text-sm">
                    Se você faz parte do grupo e mesmo assim não está sendo
                    encontrado,{" "}
                    <a
                      href={supportLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium underline"
                    >
                      <FaWhatsapp className="w-4 h-4" />
                      fale com a Yas
                    </a>
                  </p>
                </div>
              )}
              {error && errorType !== "USER_NOT_FOUND" && (
                <div className="text-red-600 text-sm text-center bg-red-50 border-2 border-red-600 rounded-md p-3 font-medium">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={checking}
                className="w-full bg-black hover:bg-gray-900 text-white font-bold uppercase h-12 rounded-md flex items-center justify-center gap-2"
              >
                {checking ? "VERIFICANDO..." : "VERIFICAR"}
                {!checking && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-black font-bold text-sm uppercase">
                  Instagram
                </Label>
                <div className="bg-gray-100 border-2 border-black text-black rounded-md h-12 flex items-center px-4 font-medium">
                  @{instagram}
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-sm text-black/70 hover:text-black underline"
                >
                  ← Trocar Instagram
                </button>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-black font-bold text-sm uppercase"
                >
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white border-2 border-black text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-black rounded-md h-12"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <p className="text-xs text-black font-medium">
                  Mínimo de 6 caracteres
                </p>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-black font-bold text-sm uppercase"
                >
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white border-2 border-black text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-black rounded-md h-12"
                  required
                  disabled={loading}
                />
              </div>
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 border-2 border-red-600 rounded-md p-3 font-medium">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-900 text-white font-bold uppercase h-12 rounded-md flex items-center justify-center gap-2"
              >
                {loading ? "DEFININDO SENHA..." : "DEFINIR SENHA"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>
          )}

          <div className="pt-4 border-t-2 border-black">
            <p className="text-sm text-black text-center font-medium">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="font-bold underline hover:text-gray-700"
              >
                FAZER LOGIN →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
