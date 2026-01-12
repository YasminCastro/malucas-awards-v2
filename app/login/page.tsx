"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [instagram, setInstagram] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const supportLink = process.env.NEXT_PUBLIC_SUPPORT_LINK;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ instagram, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao fazer login");
        setLoading(false);
        // Se for erro de autenticação, mostrar opção de esqueci senha
        if (response.status === 401) {
          setShowForgotPassword(true);
        }
        return;
      }

      // Redirecionar para a página principal
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      setLoading(false);
    }
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
              Faça login com seu Instagram
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-black font-bold text-sm uppercase"
                >
                  Senha
                </Label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-black/70 hover:text-black underline font-medium"
                >
                  Esqueci minha senha
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-2 border-black text-black placeholder:text-gray-500 focus:border-black focus:ring-2 focus:ring-black rounded-md h-12"
                required
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 border-2 border-red-600 rounded-md p-3 font-medium">
                {error}
                {showForgotPassword && (
                  <div className="mt-3 pt-3 border-t-2 border-red-600">
                    <p className="text-black text-sm mb-2">
                      Esqueceu sua senha?{" "}
                      <a
                        href={supportLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium underline"
                      >
                        <FaWhatsapp className="w-4 h-4" />
                        Fale com a Yas
                      </a>
                    </p>
                  </div>
                )}
              </div>
            )}
            {showForgotPassword && !error && (
              <div className="bg-blue-50 border-2 border-blue-600 rounded-md p-3">
                <p className="text-black text-sm">
                  Esqueceu sua senha?{" "}
                  <a
                    href={supportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-green-600 hover:text-green-700 font-medium underline"
                  >
                    <FaWhatsapp className="w-4 h-4" />
                    Fale com a Yas
                  </a>
                </p>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="mt-2 text-xs text-black/70 hover:text-black underline"
                >
                  Voltar
                </button>
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold uppercase h-12 rounded-md flex items-center justify-center gap-2"
            >
              {loading ? "ENTRANDO..." : "ENTRAR"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>

          <div className="pt-4 border-t-2 border-black">
            <p className="text-sm text-black text-center font-medium">
              Primeira vez aqui?{" "}
              <Link
                href="/signup"
                className="font-bold underline hover:text-gray-700"
              >
                CRIAR CONTA →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
