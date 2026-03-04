import { getCategories, getSettings } from "@/lib/db";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { HomeVotingContent } from "@/components/home-voting-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await getCategories();
  const settings = await getSettings();
  const votingStatus = settings?.status || "escolhendo-categorias";
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-linear-to-br from-[#f93fff] to-[#f7f908] p-4 pb-8">
      <div className="max-w-5xl mx-auto">
        {votingStatus === "escolhendo-categorias" ? (
          <>
            <Header votingStatus={votingStatus} user={user} categories={categories} />
            <Card className="border-4 border-black">
              <CardContent className="p-8 text-center space-y-6">
                <p className="text-xl font-medium text-black">
                  As categorias ainda estão sendo definidas
                </p>
                <Link href="/category-suggestion">
                  <Button className="bg-black hover:bg-gray-900 text-white font-bold uppercase h-12 px-8 rounded-md border-2 border-black">
                    Sugerir Categoria
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </>
        ) : (
          <HomeVotingContent
            categories={categories}
            user={user}
            votingStatus={votingStatus}
          />
        )}
      </div>
    </div>
  );
}
