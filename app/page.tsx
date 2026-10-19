import localFont from "next/font/local";
import Link from "next/link";
import { redirect } from "next/navigation";

import { marcaDaSaida } from "@/lib/branding/saida";
import { idiomaDoVisitante } from "@/lib/i18n/idiomaAnonimo";
import { traduzir } from "@/lib/i18n/dicionario";
import { createClient } from "@/lib/supabase/server";

// Mesma família geométrica da landing, versionada em app/fonts (sem baixar nada do Google).
const jakarta = localFont({
  src: "./fonts/plus-jakarta-sans-200-800-latin.woff2",
  weight: "200 800",
  display: "swap",
});

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

  const botaoEntrar =
    "inline-flex min-h-[46px] items-center justify-center rounded-full px-6 text-base font-bold transition-colors";

  const itens = [
    {
      titulo: t("Conversas e funil"),
      texto: t("Clientes e vendas no mesmo lugar"),
      icone: <path d="M4 5h16v11H9l-5 4z" />,
    },
    {
      titulo: t("Agenda de atendimentos"),
      texto: t("Com Google Agenda, se a empresa conectar"),
      icone: <path d="M7 4v3M17 4v3M4 9h16M5 6h14v14H5z" />,
    },
    {
      titulo: t("Agentes de IA"),
      texto: t("Passam para uma pessoa quando é preciso"),
      icone: (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 0 1 0 6M18 14c2 .7 3 2.6 3 6" />
        </>
      ),
    },
  ];

  return (
    <div
      className={`${jakarta.className} relative flex min-h-screen flex-col overflow-x-clip bg-[var(--om-fundo)] text-[var(--om-texto)] antialiased [--om-agua-claro:#DDF6F1] [--om-agua:#1FC8B0] [--om-fundo:#F6F9FB] [--om-linha:#D5E0EA] [--om-suave:#4A5F7A] [--om-superficie:#fff] [--om-texto:#0B2447] dark:[--om-agua-claro:#0F3B49] dark:[--om-fundo:#071731] dark:[--om-linha:#1F3862] dark:[--om-suave:#A9BBD1] dark:[--om-superficie:#0E2146] dark:[--om-texto:#EAF2FA]`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-36 h-[640px] bg-[radial-gradient(50%_55%_at_50%_30%,color-mix(in_srgb,var(--om-agua)_20%,transparent),transparent_72%)]"
      />

      <header className="relative mx-auto flex w-full max-w-[880px] items-center justify-between px-5 py-5 sm:px-8">
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
                    ? "h-auto max-h-[38px] w-auto max-w-[13rem] object-contain dark:hidden"
                    : "h-auto max-h-[38px] w-auto max-w-[13rem] object-contain dark:rounded-md dark:bg-white dark:px-2 dark:py-1"
                }
              />
            ) : (
              <span className="text-xl font-bold tracking-tight dark:hidden">{marca.nome}</span>
            )}
            {logoEscuro ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                data-testid="logo-escuro-da-home"
                src={logoEscuro}
                alt={marca.nome}
                className="hidden h-auto max-h-[38px] w-auto max-w-[13rem] object-contain dark:block"
              />
            ) : null}
          </div>
        ) : (
          <p className="text-xl font-bold tracking-tight">{marca.nome}</p>
        )}
        <Link
          href="/login"
          className={`${botaoEntrar} border-2 border-[var(--om-linha)] bg-[var(--om-superficie)] hover:border-[var(--om-texto)]`}
        >
          {t("Entrar")}
        </Link>
      </header>

      <main className="relative mx-auto w-full max-w-[880px] flex-1 px-5 pb-16 pt-8 sm:px-8 sm:pt-14">
        <span className="inline-flex rounded-full border border-[var(--om-linha)] bg-[var(--om-superficie)] px-3.5 py-1.5 text-[0.85rem] font-medium text-[var(--om-suave)]">
          {t("Atendimento e vendas pelo WhatsApp")}
        </span>
        <h1 className="mt-5 text-[clamp(2.4rem,7vw,4rem)] font-bold leading-[1.04] tracking-[-0.035em]">
          {marca.nome}
        </h1>
        <p className="mt-5 max-w-[34em] text-[clamp(1.1rem,2.2vw,1.3rem)] leading-relaxed text-[var(--om-suave)]">
          {t("Atendimento e vendas pelo WhatsApp, com agentes de inteligência artificial.")}
        </p>
        <div className="mt-7">
          <Link
            href="/login"
            className={`${botaoEntrar} border-2 border-transparent bg-[var(--om-agua)] text-[#06223F] hover:bg-[#3BDAC3]`}
          >
            {t("Entrar")}
          </Link>
        </div>

        <div className="mt-12 grid gap-[18px] rounded-3xl border border-[var(--om-linha)] bg-[var(--om-superficie)] p-6 leading-[1.65] shadow-[0_30px_60px_-44px_rgba(11,36,71,0.45)] sm:p-9">
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
              className="underline decoration-[var(--om-agua)] decoration-2 underline-offset-[3px]"
            >
              {t("Política de Privacidade")}
            </Link>
            .
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {itens.map((item) => (
            <div
              key={item.titulo}
              className="flex items-start gap-3 rounded-[18px] border border-[var(--om-linha)] bg-[var(--om-superficie)] p-4"
            >
              <span className="grid size-[38px] flex-none place-items-center rounded-xl bg-[var(--om-agua-claro)]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  {item.icone}
                </svg>
              </span>
              <div>
                <b className="block text-[0.98rem] leading-tight">{item.titulo}</b>
                <span className="mt-[3px] block text-[0.85rem] leading-snug text-[var(--om-suave)]">
                  {item.texto}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative mx-auto flex w-full max-w-[880px] flex-wrap gap-x-6 gap-y-2 border-t border-[var(--om-linha)] px-5 pb-8 pt-6 text-[0.95rem] text-[var(--om-suave)] sm:px-8">
        <Link href="/legal/privacy" className="hover:text-[var(--om-texto)] hover:underline">
          {t("Política de Privacidade")}
        </Link>
        <Link href="/legal/terms" className="hover:text-[var(--om-texto)] hover:underline">
          {t("Termos de Uso")}
        </Link>
      </footer>
    </div>
  );
}
