import Link from "next/link";
import { redirect } from "next/navigation";

import { marcaDaSaida } from "@/lib/branding/saida";
import { idiomaDoVisitante } from "@/lib/i18n/idiomaAnonimo";
import { traduzir } from "@/lib/i18n/dicionario";
import { createClient } from "@/lib/supabase/server";

/**
 * A página inicial pública.
 *
 * Quem tem sessão segue direto para o painel, como sempre foi. Quem não tem vê
 * uma página que diz o que o produto é e leva à política de privacidade e aos
 * termos — sem pedir login. A verificação de um app que pede dados de conta
 * Google exige exatamente isso: o revisor abre o endereço principal sem entrar e
 * precisa ver o nome do produto, o que ele faz e o link da política.
 *
 * `/` já é caminho público no `proxy` (`lib/auth/public-paths.ts`), então nada
 * lá muda. O nome vem da marca resolvida (`marcaDaSaida`: banco acima do
 * `.env`), nunca de texto fixo: uma imagem serve todas as marcas.
 *
 * `getUser()` e nunca `getSession()`: o redirecionamento só vale para sessão que
 * o servidor de autenticação confirmou.
 */
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/app");

  const marca = await marcaDaSaida(null);
  const idioma = await idiomaDoVisitante(null);
  const t = (texto: string) => traduzir(texto, idioma);

  const logoClaro = marca.logoUrl ?? null;
  const logoEscuro = marca.logoDarkUrl ?? null;
  const temLogo = Boolean(logoClaro || logoEscuro);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background">
      {/* O brilho do topo usa o accent da marca resolvida, então acompanha cada instalação. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(50%_55%_at_50%_30%,color-mix(in_srgb,var(--primary)_18%,transparent),transparent_72%)]"
      />

      <header className="relative">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-6 py-5">
          {temLogo ? (
            <div className="flex items-center">
              {logoClaro ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  data-testid="logo-da-home"
                  src={logoClaro}
                  alt={marca.nome}
                  className={
                    logoEscuro
                      ? "h-auto max-h-10 w-auto max-w-[12rem] object-contain dark:hidden"
                      : "h-auto max-h-10 w-auto max-w-[12rem] object-contain dark:rounded-md dark:bg-white dark:px-2 dark:py-1"
                  }
                />
              ) : (
                <span className="text-lg font-bold tracking-tight dark:hidden">{marca.nome}</span>
              )}
              {logoEscuro ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  data-testid="logo-escuro-da-home"
                  src={logoEscuro}
                  alt={marca.nome}
                  className="hidden h-auto max-h-10 w-auto max-w-[12rem] object-contain dark:block"
                />
              ) : null}
            </div>
          ) : (
            <p className="text-lg font-bold tracking-tight">{marca.nome}</p>
          )}
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            {t("Entrar")}
          </Link>
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl flex-1 space-y-8 px-6 pb-16 pt-10 sm:pt-16">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{marca.nome}</h1>
          <p className="max-w-xl text-lg text-muted-foreground sm:text-xl">
            {t("Atendimento e vendas pelo WhatsApp, com agentes de inteligência artificial.")}
          </p>
        </div>

        <div className="space-y-5 rounded-3xl border bg-card p-6 leading-relaxed shadow-sm sm:p-9">
          <p>
            {t("O")} {marca.nome}{" "}
            {t(
              "reúne em um só lugar as conversas com os clientes, o funil de vendas, a agenda de atendimentos e agentes de inteligência artificial que respondem, qualificam o interesse e passam a conversa para uma pessoa quando é preciso.",
            )}
          </p>

          <p>
            {t("Quando a empresa conecta o Google Agenda, o")} {marca.nome}{" "}
            {t(
              "mostra a ocupação da agenda e cria, altera e cancela os agendamentos pedidos pela própria pessoa. Quando conecta o Google Ads, devolve ao anúncio as vendas que ele trouxe. O uso dos dados do Google está descrito na",
            )}{" "}
            <Link
              href="/legal/privacy#dados-do-google"
              className="underline decoration-primary decoration-2 underline-offset-4"
            >
              {t("Política de Privacidade")}
            </Link>
            .
          </p>
        </div>
      </main>

      <footer className="relative border-t">
        <nav className="mx-auto flex w-full max-w-3xl flex-wrap gap-x-6 gap-y-2 px-6 py-5 text-sm text-muted-foreground">
          <Link href="/legal/privacy" className="hover:text-foreground hover:underline">
            {t("Política de Privacidade")}
          </Link>
          <Link href="/legal/terms" className="hover:text-foreground hover:underline">
            {t("Termos de Uso")}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
